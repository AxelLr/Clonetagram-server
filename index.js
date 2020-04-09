const express = require('express')
const app = express()
const cors = require('cors')
const connectDB = require('./config/DbConnection')
const passport = require('passport')
// ROUTER
const router = require('./api/Routes/Index')
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
// PASSPORT
app.use(passport.initialize())
// MULTER
app.use(multer(multerConfig).single('image'))
// ROUTES
app.use('/api', router())
// PORT LISTEN
app.listen(PORT, () => console.log(`Server started on Port ${PORT}`))


