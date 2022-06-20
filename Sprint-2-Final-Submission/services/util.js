'use strict'

function flatten(values) {
    return values.reduce((acc, val) => {
        if (Array.isArray(val)) return acc.concat(flatten(val))
        else return acc.concat(val)
    }, [])
}
