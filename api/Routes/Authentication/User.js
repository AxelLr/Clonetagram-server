require('dotenv').config()
const express = require('express')
const router = express.Router()
const {check, validationResult } = require('express-validator')
const User = require('../../../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// REGISTER USER
router.post('/register', [
    check('username', 'el número máximo de caracteres permitido es 15').isLength({max: 15}),
    check('email', 'Email inválido').isEmail(),
    check('password', 'no debe estar vacío').notEmpty().isLength({min: 6}).withMessage('La contraseña debe tener 6 o más caracteres').custom(value => !/\s/.test(value)).withMessage('No se admiten espacios en la contraseña')
], async (req, res) => {

    const errors = validationResult(req)

    const { username, email, password } = req.body

    if(username.trim() === '') {
        return res.status(400).json({ errors: [ {msg: 'No debe estar vacío '}]})
    }

    if(!errors.isEmpty()) {
        return res.status(400).json( { errors: errors.array() } )
    }

    try {

        let user = await User.findOne( { email } )

        if(user) {
           return res.status(400).json({ msg: 'Lo sentimos, El correo electrónico ya ha sido tomado' })
        }

        let verifyName = await User.findOne( { username } )

        if(verifyName) {
            return res.status(400).json({ msg: 'Lo sentimos, El nombre ya ha sido tomado' })
        }
 

        user = new User ({
            username,
            email,
            password
        })

        const salt = await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(password, salt)

        await user.save()

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, procces.env.jwtSecret, { expiresIn: 360000}, (err, token) => {
            
        if(err) throw err

        res.json( { token } )
    })}

    catch (err) {
        console.error(err)
       return res.status(500).json( { error: 'internal server error' } )
    }
})

//LOGIN USER 
router.post('/login', [
    check('email', 'Email inválido').isEmail(),
    check('password', 'no debe estar vacío').not().isEmpty().isLength({min: 6}).withMessage('La contraseña debe tener 6 o más caracteres').custom(value => !/\s/.test(value)).withMessage('No se admiten espacios')
], async (req, res) => {

    const errors = validationResult(req)

    if(!errors.isEmpty()) {
        return res.status(400).json( { errors: errors.array() } )
    }

    try {
        const {  email, password } = req.body
    
        let user = await User.findOne( { email } )

        if(!user) {
           return res.status(400).json({errors: [ { msg: 'Credenciales incorrectas. Por favor, intenta de nuevo.'} ] })
        }

         const isMatch = await bcrypt.compare(password, user.password)
 
         if(!isMatch) {
             return res.status(400).json({errors: [ { msg: 'E-mail o contraseña inválidos. Por favor, intenta de nuevo' }]})
         }     

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, procces.env.jwtSecret, { expiresIn: 360000}, (err, token) => {
            
        if(err) throw err

        res.json( { token } )
    })}

    catch (err) {
        console.error(err)
       return res.status(500).json( { error: 'internal server error' } )
    }
})



module.exports = router