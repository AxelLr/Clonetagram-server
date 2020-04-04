require('dotenv').config()
const cloudinary = require('cloudinary')

cloudinary.config({
    cloud_name: process.env.cloudName,
    api_key: process.env.apiKey,
    api_secret: process.env.cloudinarySecret
})

module.exports = cloudinary
