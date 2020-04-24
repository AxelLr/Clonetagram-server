const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'post'
    },
    content: {
        type: String,
        required: true
    },
    replies: [
        {
            content: {
                type: String,
                required: true
            },
            user_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'user'
            },
            createdAt: {
                type: Date,
                default: Date.now 
            }
        }
    ]
})

module.exports = Comment = mongoose.model('comment', CommentSchema)