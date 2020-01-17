const express = require('express')
const app = express()
const cors = require('cors')
const connectDB = require('./database/DbConnection')
const multer = require('multer')
const path = require('path')
const uuid = require('uuid/v4')


// TO DO AGREGAR GET POSTS FROM SUBSCRIPTIONS 

// PUERTO
const PORT = process.env.PORT || 5000

// CONNECT DATABASE
connectDB()

// INIT MIDDLEWARES
app.use(cors())
app.use(express.json( { extended: false } ))
app.use(express.urlencoded( {extended: false } ))

// MULTER
const storage = multer.diskStorage({
    destination: path.join(__dirname, 'public/uploads'),
    filename: (req, file, cb) => {
        cb(null, uuid() + path.extname(file.originalname).toLocaleLowerCase())
    }
})
app.use(multer({ 
    storage, 
    limits: {fileSize: 2000000},
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/
        const mimetype = filetypes.test(file.mimetype)
        const extname = filetypes.test(path.extname(file.originalname))
        if( mimetype && extname) {
            return cb(null, true)
        }
        cb('Error: El archivo debe ser una imágen válida')
    }
}).single('image'))

// Routes
app.use('/api/user', require('./api/Routes/Authentication/User'))
app.use('/api/posts', require('./api/Routes/post/Posts'))
app.use('/api/users', require ('./api/Routes/user/Users'))
app.use('/api/comments', require('./api/Routes/comment/Comments'))


app.listen(PORT, () => {
console.log(`Server started on Port ${PORT}`)
})


