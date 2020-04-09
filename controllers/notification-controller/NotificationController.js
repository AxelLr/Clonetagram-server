const Notification = require('../../models/Notification')

exports.getUserNotifications = async (req, res) => {
    try {
        const notification = await Notification.find({ receiver: req.user.id }).sort({createdAt: -1})

        res.send(notification)
        
    } catch (error) {
        console.log(err)
        return res.status(500).send('Server error')    
    }
}

exports.markNotificationsAsReaded = async (req, res) => {
    try {
        console.log('IT FKING WORKS')
        
    } catch (error) {
        console.log(err)
        return res.status(500).send('Server error')  
    }
}