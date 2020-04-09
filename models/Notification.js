const mongoose = require('mongoose')

const NotificationSchema = new mongoose.Schema({
    createdAt: {
        type: Date,
        default: Date.now
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    commentRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'comment',
        required: true
    },
    postRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post',
        required: true
    },
    readed: {
        type: Boolean,
        default: false
    }
})

module.exports = Notification = mongoose.model('notification', NotificationSchema)