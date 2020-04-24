const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = exports.io = require('socket.io')(server)
const connectDB = require('./config/DbConnection')
const cors = require('cors')
const passport = require('passport')
// SOCKET MANAGER
const socketManager = require('./middlewares/SocketManager')
// ROUTER
const router = require('./api/Routes/Index')
// MULTER CONFIG
const multer = require('multer')
const multerConfig = require('./middlewares/MulterConfig')
// PUERTO
const PORT = process.env.PORT || 5000
// CONNECT DATABASE
connectDB()
// SOCKET IO CONNECTION 
io.on('connection', socketManager)
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
server.listen(PORT, () => console.log(`Server started on Port ${PORT}`))


