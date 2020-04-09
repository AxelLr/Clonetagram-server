require('dotenv').config()
const User = require('../../models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

// FACEBOOK LOGIN/REGISTER
exports.facebookStrategy = async function(accessToken, refreshToken, profile, done) {

    let user = await User.findOne( { email: profile.emails[0].value } )

    if(!user) {

        let user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            profileImg: profile.photos[0].value,
            provider: 'facebook'
        })

        await user.save()

        let payload = {
            user: {
                id: user._id
            }
        }
        
        jwt.sign(payload, process.env.jwtSecret, { expiresIn: 3600 }, (err, token) => {
            done(null, token)
        })
    } else {
        
    let payload = {
        user: {
            id: user._id
        }
    }

    jwt.sign(payload, process.env.jwtSecret, { expiresIn: 3600 }, (err, token) => {
        done(null, token)
    })
}}

// GOOGLE LOGIN/REGISTER
exports.googleStrategy = async function(accessToken, refreshToken, profile, done) {

    let user = await User.findOne( { email: profile.emails[0].value } )

    if(!user) {

        let user = new User({
            username: profile.displayName,
            email: profile.emails[0].value,
            profileImg: profile.photos[0].value,
            provider: 'google'
        })

        await user.save()

        let payload = {
            user: {
                id: user._id
            }
        }
        
        jwt.sign(payload, process.env.jwtSecret, { expiresIn: 3600 }, (err, token) => {
            done(null, token)
        })
    } else {
        
    let payload = {
        user: {
            id: user._id
        }
    }

    jwt.sign(payload, process.env.jwtSecret, { expiresIn: 3600 }, (err, token) => {
        done(null, token)
    })
}}

// REGISTER USER
exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body

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
            password,
            provider: 'local'
        })

        const salt = await bcrypt.genSalt(10)

        user.password = await bcrypt.hash(password, salt)

        await user.save()

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, process.env.jwtSecret, { expiresIn: 3600}, (err, token) => {
        if(err) throw err
        res.json( { token } )
        }
    )}
    catch (err) {
       console.error(err)
       return res.status(500).send('internal server error')
    }
}

// LOCAL LOGIN USER
exports.login = async (req, res) => {

    try {
        const { email, password } = req.body
    
        let user = await User.findOne( { email } )

        if(!user) {
           return res.status(400).json({error: 'Credenciales incorrectas. Por favor, intenta de nuevo.'})
        }

        if( user && !user.password) {
            return res.status(400).json({
                provider: user.provider,
                hasPassword: false
            })
        }

        const isMatch = await bcrypt.compare(password, user.password)
 
         if(!isMatch) {
             return res.status(400).json({error: 'Credenciales incorrectas. Por favor, intenta de nuevo.'})
         }     

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(payload, process.env.jwtSecret, { expiresIn: 3600 }, (err, token) => {
            return res.json( { token } )
        })
    }
    catch (err) {
        console.error(err)
       return res.status(500).send('internal server error')
    }
}
// FACEBOOK LOGIN CALLBACK
exports.loginCallback = (req, res) => {
    let token = req.user
    res.redirect(`http://localhost:3000/#/redirecting/${token}`)
  }

// E-MAIL CHECK
exports.emailCheck = async (req, res) => {
    try {
               
        let user = await User.findOne( { email: req.body.email } )

        if(!user) return res.status(400).json({error: 'Credenciales incorrectas. Por favor, intenta de nuevo.'})

        if(user && user.password) return res.json({ hasPassword: true })

        if( user && !user.password) {
            return res.json({
                provider: user.provider,
                hasPassword: false
            })
        }

    } catch (error) {
        console.error(err)
        return res.status(500).send('internal server error')
    }
}

exports.forgotPassword = async (req, res) => {
    try {
        console.log(req.body)
        let user = await User.findOne({ email: req.body.email })

        if(!user) return res.status(400).json({error: 'Credenciales incorrectas. Por favor, intenta de nuevo.'})

        const token = crypto.randomBytes(20).toString('hex')

        await user.updateOne({resetPasswordToken: token, resetTokenExpires: Date.now() + 3600000 })
        await user.save()

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: process.env.E_MAIL,
              pass: process.env.PASS_
            }
        })

        const mailOptions = {
            from: 'emailSender210@gmail.com',
            to: `${user.email}`,
            subject: 'Reestablecer contraseña',
            text: `Recibiste este E-mail porque tu(o alguien) ha solicitado reestablecer la contraseña de tu cuenta.
            Por favor, clickea en el siguiente link o pegalo en el buscador de tu navegador para completar el proceso dentro de la siguiente hora despues de recibirlo.
            http://localhost:3000/#/resetPassword/${token}. Si no solicitaste reestablecer la contraseña, simplemente ignora este mensaje.`
        }

        transporter.sendMail(mailOptions, (err, data) => {
            if(err) {
                console.log(err)
                res.status(500).send('internal server error')
            } else {
              res.send('Enviado satisfactoriamente')
            }
        })      
   

    } catch (error) {
        console.error(error)
        return res.status(500).send('internal server error')
    }
}

exports.getUserByResetToken = async(req, res) => { 
    
    try {
         const user = await User.findOne({ resetPasswordToken: req.params.token })

         if(!user) return res.status(401).json({error: 'El token ha expirado'})

         if(user.resetTokenExpires.getTime() > Date.now()) {

            return res.send({ email: user.email })

          } else { 

            return res.status(401).send({error: 'El link para reestablecer la contraseña ha expirado.'})
          }

    } catch (error) {
        console.error(error)
        return res.status(500).send('internal server error')        
    }
}

exports.resetPassword = async (req, res) => {
 try {
    const user = await User.findOne({ email: req.body.email })
    const salt = await bcrypt.genSalt(10)

    user.password = await bcrypt.hash(req.body.password, salt)
    user.resetPasswordToken = null
    await user.save()
    // LIMPIAR TOKEN DE LA CUENTA

    res.status(200).send('Contraseña reestablecida exitosamente.')

 } catch (error) {
    console.error(error)
    return res.status(500).send('internal server error')
 }
}