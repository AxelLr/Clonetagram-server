const { Notification } = require('../../models/Notification')

exports.getUserNotifications = async (req, res) => {
    try {
        const notification = await Notification.find({ receiver: req.user.id }).sort({createdAt: -1})

        res.send(notification)
        
    } catch (error) {
        console.log(error)
        return res.status(500).send('Server error')    
    }
}

exports.markNotificationsAsReaded = async (req, res) => {
    try {
         await Notification.updateMany({receiver: req.user.id}, {$set : { readed: true } })
    

        return res.status(200).send('Successfully updated')

    } catch (error) {
        console.log(error)
        return res.status(500).send('Server error')  
    }
}