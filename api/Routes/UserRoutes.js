const express = require('express')
const router = express.Router()
const Auth = require('../../middlewares/Auth')
// CONTROLLERS
const { getLoggedUserData,
        changeProfileImage,
        addUserDescription,
        getUserData,
        subscribe,
        unsubscribe,
        getUserSearch,
        changePrivacy,
        cancelSubscriptionRequest
     } = require('../../controllers/user-controller/UserController')
// GET LOGGED IN USER DATA 
router.get('/me', Auth, getLoggedUserData )
// CHANGE PROFILE IMAGE 
router.put('/image', Auth, changeProfileImage)
// ADD USER DESCRIPTION 
router.post('/me/details', Auth, addUserDescription)
// GET USER DATA
router.get('/:id', getUserData)
// SUBSCRIBE TO ANOTHER USER
router.post('/subscribe/:id', Auth, subscribe)
// UNSUBSCRIBE TO ANOTHER USER 
router.delete('/unsubscribe/:id', Auth, unsubscribe)
// GET USER SEARCH
router.get('/', Auth, getUserSearch)
// CHANGE PRIVATE STATUS 
router.patch('/privacy', Auth, changePrivacy)
// CANCEl SUBSCRIPTION REQUEST
router.delete('/requests/:userid', Auth, cancelSubscriptionRequest)

module.exports = router
