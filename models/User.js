const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    description: {
        type: String
    }, 
    profileImg:{
        url: {
            type: String,
            default: 'https://res.cloudinary.com/dtyljkszk/image/upload/v1578947999/noprofileimg2_uy01qe.png'
        },
        public_id: {
            type: String
        }
    },
    date: {
        type: Date,
        default: Date.now
    },
    followers: [
        {
            username: {
                type: String,
            },
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref:'user'
            }
        }
    ],
    subscriptions: [
        {
            username: {
                type: String,
            },
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref:'user'
            }
        }
    ]
})

module.exports = User = mongoose.model('user', UserSchema)