const mongoose = require('mongoose')

const PostSchema = new mongoose.Schema({
    public_id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    imageURL: {
        type: String,
        required: true
    },
    description: {
        type: String
    }, 
    username: {
        type: String
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    avatar: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
    likes: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            }
        }
    ]
})

module.exports = Post = mongoose.model('post', PostSchema)