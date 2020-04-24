const express = require('express')
const router = express.Router()
const { facebookLoginMiddleware, googleLoginMiddleware, googleMiddlewareCallback } = require('../../controllers/authentication-controller/passport')
// VALIDATIONS
const validation = require('../../middlewares/validation/Validation')
// VALIDATION SCHEMAS
const { loginSchema, registerSchema } = require('../../middlewares/validation/Schemas')
// CONTROLLERS
const { register, login, loginCallback, emailCheck, forgotPassword, getUserByResetToken, resetPassword } = require('../../controllers/authentication-controller/AuthenticationController')
// REGISTER USER
router.post('/register', validation(registerSchema), register)
//LOGIN USER 
router.post('/login', validation(loginSchema), login)
// FACEBOOK REGISTER/LOGIN STRATEGY 
router.get('/login/facebook', facebookLoginMiddleware)
// FACEBOOK REGISTER/LOGIN CALLBACK
router.get('/login/facebook/callback', facebookLoginMiddleware, loginCallback)
// GOOGLE LOGIN STRATEGY
router.get('/login/google', googleLoginMiddleware)
// GOOGLE LOGIN CALLBACK
router.get('/login/google/callback', googleMiddlewareCallback, loginCallback)
//CHECK E_MAIL
router.post('/checkEmail', emailCheck)
// FORGOT PASSWORD
router.post('/forgotPassword', forgotPassword)
// GET USER BY RESET TOKEN
router.get('/reset/:token', getUserByResetToken)
// RESET PASSWORD
router.patch('/reset/password', resetPassword)

module.exports = router