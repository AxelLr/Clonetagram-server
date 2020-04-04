const multer = require('multer')
const path = require('path')
const uuid = require('uuid/v4')

const storage = multer.diskStorage({
    destination: path.join(__dirname, '../public/media'),
    filename: (req, file, cb) => {
        cb(null, uuid() + path.extname(file.originalname).toLocaleLowerCase())
    }
})

module.exports = { 
    storage, 
    limits: {fileSize: 2000000},
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/
        const mimetype = filetypes.test(file.mimetype)
        const extname = filetypes.test(path.extname(file.originalname))
        if( mimetype && extname) {
            return cb(null, true)
        }
        req.validationErrors = 'El Archivo debe ser una imágen válida.'
        return cb(null, false, req.fileValidationError)
    }
}
