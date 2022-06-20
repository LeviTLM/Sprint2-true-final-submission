'use strict'

function uploadImg() {
    const imgDataUrl = gElCanvas.toDataURL('image/jpeg')
    let shareBtn = document.querySelector('.share-btn')

    function onSuccess(uploadedImgUrl) {
        const encodedUploadedImgUrl = encodeURIComponent(uploadedImgUrl)
        shareBtn.innerHTML = `
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodedUploadedImgUrl}&t=${encodedUploadedImgUrl}" title="Share on Facebook" target="_blank" onclick="window.open('https://www.facebook.com/sharer/sharer.php?u=${uploadedImgUrl}&t=${uploadedImgUrl}'); return false;">
          </a>`
        shareBtn.querySelector('a').click()
    }
    doUploadImg(imgDataUrl, onSuccess)
}

function doUploadImg(imgDataUrl, onSuccess) {
    const formData = new FormData()
    formData.append('img', imgDataUrl)

    fetch('//ca-upload.com/here/upload.php', {
        method: 'POST',
        body: formData,
    })
        .then(res => res.text())
        .then(url => {
            console.log('Got back live url:', url)
            onSuccess(url)
        })
        .catch(err => {
            console.error(err)
        })
}
