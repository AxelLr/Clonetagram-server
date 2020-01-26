require('dotenv').config()
const mongoose = require('mongoose')

const connectDB = async () => {
    try {
     await mongoose.connect(process.env.DBCONFIG, { useUnifiedTopology: true , useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false } )
     console.log('Db Connected')
    } catch(err) { 
        console.error(err)
        process.exit(1)
    }
} 

module.exports = connectDB