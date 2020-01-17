const mongoose = require('mongoose')

const LikeSchema = new mongoose.Schema({

    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    date: {
        type: Date,
        default: Date.now
    },
    username: {
        type: String,
        required: true
    },
    post_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'post'
    }
})

module.exports = Like = mongoose.model('like', LikeSchema)