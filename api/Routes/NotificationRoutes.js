const express = require('express')
const router = express.Router()
// AUTH MIDDLEWARE
const Auth = require('../../middlewares/Auth')
// CONTROLLERS 
const { getUserNotifications, markNotificationsAsReaded } = require('../../controllers/notification-controller/NotificationController')
// GET USER NOTIFICATIONS 
router.get('/', Auth, getUserNotifications)
// MARK AS READED
router.patch('/read', Auth, markNotificationsAsReaded)

module.exports = router