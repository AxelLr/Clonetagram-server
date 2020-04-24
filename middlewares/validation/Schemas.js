const Joi = require('@hapi/joi')

const email = Joi.string()
.email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
.required()
.messages({
    'string.email': `Correo electrónico inválido`
  })

const password = Joi.string().trim()
.regex(/^[\w@#$%]+$/)
.min(6)
.max(18)
.required()
.messages({
    'string.min': `Contraseña demasiado corta`,
    'string.max': 'Contraseña demasiado larga',
    'string.empty': 'Contraseña requerida',
    'string.pattern.base': 'La contraseña contiene espacios o caracteres inválidos'
  })

const username = Joi.string()
.trim()
.regex(/^[\w@#$%]+$/)
.min(4)
.max(18)
.required()   
.messages({
    'string.min': `Nombre demasiado corto`,
    'string.max': 'Nombre demasiado largo',
    'string.empty': 'Nombre requerido',
    'string.pattern.base': 'El nombre contiene espacios o caracteres inválidos'
})

const description = Joi.object().keys({
    description: Joi.string().allow('').max(255).messages({
        'string.max': 'Descripción demasiado larga'
    })
    
}) 
const registerSchema = Joi.object().keys({
    email,
    password,
    username
})
const loginSchema = Joi.object().keys({
    email,
    password
})

const comment = Joi.object().keys({
    content: Joi.string().trim().required().max(255).messages({
        'string.max': 'Limite de caracteres alcanzado.',
        'string.empty': 'no debe estar vacío.'
    })
})

module.exports = {
    registerSchema,
    loginSchema,
    description,
    comment
}