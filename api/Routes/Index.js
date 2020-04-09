const express = require('express')
const router = express.Router()

module.exports = function() {
    
    router.use('/user', require('./AuthenticationRoutes'))
    router.use('/posts', require('./PostRoutes'))
    router.use('/users', require ('./UserRoutes'))
    router.use('/comments', require('./CommentRoutes'))
    router.use('/notifications', require('./NotificationRoutes'))

    return router
}