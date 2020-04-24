const mongoose = require('mongoose')
const io = require('../index').io

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
    senderName: {
        type: String
    },
    senderAvatar: {
        type: String
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
    postRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    },
    readed: {
        type: Boolean,
        default: false
    }
})

const Notification = exports.Notification = mongoose.model('notification', NotificationSchema)

 exports.createNotification = async (sender, senderName, senderAvatar, receiver, type, postRef) => {  
    try {
        if(sender == receiver) return;

         const notification = new Notification({
            sender,
            senderName,
            receiver,
            type,
            postRef,
            senderAvatar
         })
         
        await notification.save()

        console.log('working')

        return io.to(`${receiver}`).emit('NEW_NOTIFICATION', notification)
           
    } catch (error) {
        console.log(error)
    }
 }

