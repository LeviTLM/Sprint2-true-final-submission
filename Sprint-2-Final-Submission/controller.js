'use strict'

var gElCanvas
var gCtx
const gTouchEvs = ['touchstart', 'touchmove', 'touchend']

function onInit() {
    gElCanvas = document.getElementById('my-canvas')
    gCtx = gElCanvas.getContext('2d')
    createGImgs(18)
    createMemes()
    renderKeys()
    renderGallery()
    addListeners()
}

// Search

function onSearch() {
    let elInput = document.querySelector('.search-input')
    let key = elInput.value
    let imgs = setImgByKey(key)
    if (imgs.length === 18) {
        elInput.placeholder = `No results, try again`
        elInput.value = ''
    }
    renderGallery()
}

function onSetImgByKey(val, elKey) {
    setImgByKey(val)
    updateKeys(val)
    renderKeys()
    renderGallery()
}

// Saved Memes

function onShowSaved() {
    onHideEditor()
    let galleryContainer = document.querySelector('.gallery-container.main-layout')
    let memes = loadSavedMemes()
    let strHtml = ``
    if (memes)
        memes.forEach((meme, idx) => {
            let img = new Image()
            img.src = meme
            strHtml += `<div class="meme-img img-${idx + 1}" id='meme-${
                idx + 1
            }' style="background-image:url(${meme}) ; background-size: cover; background-position: center center;"></div>`
        })
    else strHtml = '<h1>You dont have any saved memes yet!<h1>'
    galleryContainer.innerHTML = strHtml
}

function onSaveMeme() {
    updateSelectedLineIdx('none')
    renderCanvas('isSave')
}

// Row Edit

function onSwitchLines() {
    updateSelectedLineIdx()
    renderCanvas()
}

function onAddLine() {
    addLine(gElCanvas.offsetHeight)
    renderCanvas()
}

function onDeleteLine() {
    deleteLine()
    renderCanvas()
}

function onUpdateLine(key, value = null) {
    if (key === 'textDown') value = gElCanvas.offsetHeight
    updateLine(key, value)
    if (key === 'align-right' || key === 'align-left' || key === 'align-center') {
        alignText(gElCanvas.offsetWidth)
    } else if (key === 'typeText') {
        var meme = getMeme()
        updateRowWidth(getCurrLine(), getCurrLineIdx())
        checkLinesSizes(gElCanvas.offsetWidth, gElCanvas.offsetHeight)
    }
    renderCanvas()
}

function drawLineArea() {
    if (!getLineArea()) return
    let lineArea = getLineArea()
    gCtx.beginPath()
    gCtx.strokeStyle = 'red'
    gCtx.rect(lineArea.x, lineArea.y, lineArea.width, lineArea.height)
    gCtx.stroke()
}

// Renders

function renderKeys() {
    let keywords = getKeywords()
    let keysContainer = document.querySelector('.keywords-container')
    let strHtml = `<p class="key president" style="font-size: ${keywords['president'] * 2 + 16}px ;"  
    onclick="onSetImgByKey('president',this)">President</p>
  <p style="font-size: ${keywords['man'] * 2 + 16}px ;" class="key man" onclick="onSetImgByKey('man',this)">Man</p>
  <p class="key dog"style="font-size: ${keywords['dog'] * 2 + 16}px;"  onclick="onSetImgByKey('dog',this)">Dog</p>
  <p class="key baby" style="font-size: ${keywords['baby'] * 2 + 16}px;"  onclick="onSetImgByKey('baby',this)">Baby</p>
  <p class="key cat" style="font-size: ${keywords['cat'] * 2 + 16}px; " onclick="onSetImgByKey('cat',this)">Cat</p>
  <p class="key cartoon" style="font-size: ${keywords['cartoon'] * 2 + 16}px;" onclick="onSetImgByKey('cartoon',this)">Cartoon</p>

  `

    keysContainer.innerHTML = strHtml
}

function renderCanvas(value = null) {
    let meme = getMeme()
    let url = getUrlByMeme(meme)
    let img = new Image()
    img.src = `${url}`
    img.onload = () => {
        gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
        changeTextOnCanvas()
        if (gMeme.selectedLineIdx !== 'none') drawLineArea()
        else if (value === 'isExport') {
            uploadImg()
        } else if (value === 'isDownload') {
            const elLink = document.createElement('a')
            const data = gElCanvas.toDataURL('image/jpeg')
            elLink.setAttribute('download', 'my-meme')
            elLink.href = data
            document.body.appendChild(elLink)
            elLink.click()
            document.body.removeChild(elLink)
        } else if (value === 'isSave') {
            var elBtn = document.querySelector('.save-btn')
            loadSavedMemes()
            saveMeme(gElCanvas)
            elBtn.innerHTML = 'Saved!'

            setTimeout(() => {
                elBtn.innerHTML = 'Save'
            }, 1000)
        }
    }
}

function renderGallery() {
    let imgs = getGImgs()
    let galleryContainer = document.querySelector('.gallery-container.main-layout')
    let strHtml = ``
    imgs.forEach(img => {
        strHtml += `<div class="gallery-img img-${img.id}" onclick="onShowEditor(this)" id='${img.id}' style="background-image:url('img/${img.id}.jpg') ; background-size: cover; background-position: center center;"></div>`
    })
    galleryContainer.innerHTML = strHtml
}

function changeTextOnCanvas() {
    let meme = getMeme()
    gCtx.lineWidth = 2
    let elTextInput = document.querySelector('.meme-text')
    if (meme.lines.length) {
        meme.lines.forEach((line, idx) => {
            let txt = line.txt
            gCtx.strokeStyle = `${line.strokeColor}`
            gCtx.fillStyle = `${line.fillColor}`
            gCtx.font = `${line.size}px ${line['font-family']}`
            updateLine('width', gCtx.measureText(txt).width, idx)
            if (idx === getCurrLineIdx()) {
                if (!txt) {
                    elTextInput.placeholder = 'Start typing'
                    elTextInput.value = ''
                } else elTextInput.value = `${txt}`
                if (line.width > gElCanvas.offsetWidth - 10) {
                    updateLine('decreaseFont')
                    renderCanvas()
                }
                if (line.isClick) checkLinesSizes(gElCanvas.width, gElCanvas.height)
            } else if (line.y === 'init') {
                updateLine('initY', gElCanvas.offsetWidth)
                line = getMeme().lines[1]
            } else if (meme.selectedLineIdx === 'none') {
                elTextInput.placeholder = 'no line selected'
                elTextInput.value = ''
            }
            gCtx.fillText(`${txt}`, line.x, line.y)
            gCtx.strokeText(`${txt}`, line.x, line.y)
        })
        return
    }
    elTextInput.placeholder = `No lines to remove, press '+' to add lines`
    elTextInput.value = ''
}

function resizeCanvas() {
    if (!getMeme()) return
    const elCanvasContainer = document.querySelector('.canvas-container')
    const elEditorContainer = document.querySelector('.editor-container')
    elEditorContainer.width = elCanvasContainer.offsetWidth
    elEditorContainer.height = elCanvasContainer.offsetHeight
    gElCanvas.width = elCanvasContainer.offsetWidth
    gElCanvas.height = elCanvasContainer.offsetHeight
    checkLinesSizes(gElCanvas.width, gElCanvas.height)
    renderCanvas()
}

function updateRowWidth(line, idx) {
    if (isNaN(getCurrLineIdx())) return
    gCtx.font = `${line.size}px ${line['font-family']}`
    updateLine('width', gCtx.measureText(line.txt).width, idx)
}

function toggleMenu() {
    document.body.classList.toggle('menu-open')
}

function onHideEditor() {
    let elEditor = document.querySelector('.editor-container')
    let elSearch = document.querySelector('.search-container')
    let elGallery = document.querySelector('.gallery-container')
    let elFooter = document.querySelector('.about-container')
    elEditor.style.display = 'none'
    elFooter.style.display = 'flex'
    elGallery.style.display = 'grid'
    elSearch.style.display = 'flex'
    updateGmeme('close')
    toggleMenu()
    createGImgs(18)
    renderGallery()
}

function onShowEditor(elImg = null) {
    let elEditor = document.querySelector('.editor-container')
    let elSearch = document.querySelector('.search-container')
    let elGallery = document.querySelector('.gallery-container')
    let elFooter = document.querySelector('.about-container')
    elEditor.style.display = 'grid'
    elSearch.style.display = 'none'
    elGallery.style.display = 'none'
    elFooter.style.display = 'none'
    updateGmeme(elImg.id)
    resizeCanvas()
}

// Events

function onDown(ev) {
    let pos = getOffsetPos(ev)
    let line = getLineByPos(pos)
    if (line) renderCanvas()
}

function onMove(ev) {
    let pos = getOffsetPos(ev)
    let meme = getMeme()
    if (!meme.lines.length || getCurrLineIdx() === 'none' || !getCurrLine().isClick) {
        return
    } else if (pos.x === gElCanvas.width - 1 || pos.y === gElCanvas.height - 1 || pos.y === 1 || pos.x === 1) {
        onUp()
        return
    } else {
        moveClickedLine(pos)
        renderCanvas()
    }
}

function onUp() {
    updateNoClick()
}

function getClientPos(ev) {
    let pos = {
        x: ev.clientX,
        y: ev.clientY,
    }
    return pos
}

function getOffsetPos(ev) {
    let pos = {
        x: ev.offsetX,
        y: ev.offsetY,
    }
    if (gTouchEvs.includes(ev.type)) {
        ev.preventDefault()
        ev = ev.changedTouches[0]
        pos = {
            x: ev.pageX - ev.target.offsetLeft - ev.target.clientLeft,
            y: ev.pageY - ev.target.offsetTop - ev.target.clientTop,
        }
    }
    return pos
}

function addListeners() {
    window.addEventListener('resize', resizeCanvas)
    addMouseListeners()
    addTouchListeners()
}

function addMouseListeners() {
    gElCanvas.addEventListener('mousemove', onMove)
    gElCanvas.addEventListener('mousedown', onDown)
    gElCanvas.addEventListener('mouseup', onUp)
}

function addTouchListeners() {
    gElCanvas.addEventListener('touchmove', onMove)
    gElCanvas.addEventListener('touchstart', onDown)
    gElCanvas.addEventListener('touchend', onUp)
}

// Download / Upload

function onDownloadImg() {
    updateSelectedLineIdx('none')
    renderCanvas('isDownload')
}

function onUploadImg() {
    updateSelectedLineIdx('none')
    renderCanvas('isExport')
}

function onImgInput(ev) {
    loadImageFromInput(ev, renderImg)
}

function loadImageFromInput(ev, onImageReady) {
    let reader = new FileReader()

    reader.onload = function (event) {
        let img = new Image()
        img.src = event.target.result
        img.onload = onImageReady.bind(null, img)
    }
    reader.readAsDataURL(ev.target.files[0])
}
function renderImg(img) {
    gCtx.drawImage(img, 0, 0, gElCanvas.width, gElCanvas.height)
}
