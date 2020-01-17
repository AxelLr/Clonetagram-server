const mongoose = require('mongoose')
const { DBCONFIG } = require('../config')

const connectDB = async () => {
    try {
     await mongoose.connect(DBCONFIG, { useUnifiedTopology: true , useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false } )
     console.log('Db Connected')
    } catch(err) { 
        console.error(err)
        process.exit(1)
    }
} 

module.exports = connectDB