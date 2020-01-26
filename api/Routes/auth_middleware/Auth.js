const jwt = require('jsonwebtoken')

module.exports = function(req, res, next) {

    const token = req.header('x-auth-token')

    if(!token) {
        return res.status(401).json({msg: 'Accesso Denegado. No token'})
    }

    try {

    let decodedToken = jwt.verify(token, process.env.jwtSecret)

    req.user = decodedToken.user

    next()

    } catch(err) {
        res.status(401).json({msg: 'invalid token'})
    }
}