require('dotenv').config()
const passport = require('passport')
// STRATEGIES
const GoogleStrategy = require( 'passport-google-oauth2').Strategy
const FacebookStrategy = require('passport-facebook').Strategy
// CONTROLLERS 
const { facebookStrategy, googleStrategy } = require('./AuthenticationController')
// PASSPORT BOILERPLATE
passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((id, done) => done(null, user))
// FACEBOOK STRATEGY
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL:'http://localhost:5000/api/user/asdf',
    profileFields: ['emails', 'displayName', 'profileUrl', 'picture.type(large)']
}, facebookStrategy ))
// GOOGLE STRATEGY 
passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:5000/api/user/asdfgh',
    profileFields: ['email', 'displayName', 'profileUrl', 'picture.type(large)']
}, googleStrategy ))

exports.facebookLoginMiddleware = passport.authenticate('facebook')
exports.googleLoginMiddleware = passport.authenticate('google',  { scope: 
    [ 'https://www.googleapis.com/auth/plus.login', 'https://www.googleapis.com/auth/userinfo.email' ] })

exports.googleMiddlewareCallback = passport.authenticate('google')