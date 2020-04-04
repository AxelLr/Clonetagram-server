const express = require('express')
const app = express()
const cors = require('cors')
const connectDB = require('./database/DbConnection')
// MULTER CONFIG
const multer = require('multer')
const multerConfig = require('./config/MulterConfig')
// PUERTO
const PORT = process.env.PORT || 5000
// CONNECT DATABASE
connectDB()
// INIT MIDDLEWARES
app.use(cors())
app.use(express.json( { extended: false } ))
app.use(express.urlencoded( { extended: false } ))
// MULTER
app.use(multer(multerConfig).single('image'))
// ROUTES
app.use('/api/user', require('./api/Routes/Authentication/User'))
app.use('/api/posts', require('./api/Routes/post/Posts'))
app.use('/api/users', require ('./api/Routes/user/Users'))
app.use('/api/comments', require('./api/Routes/comment/Comments'))

app.listen(PORT, () => {
console.log(`Server started on Port ${PORT}`)
})


