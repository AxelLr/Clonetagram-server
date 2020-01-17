const cloudinary = require('cloudinary')
const { cloudinarySecret, apiKey, cloudName } = require('./config')

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: cloudinarySecret
})

module.exports = cloudinary
