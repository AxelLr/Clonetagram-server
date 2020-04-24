const cloudinary = require('../../config/CloudinaryConfig')
const fs = require('fs-extra')
const escapeRegex = require('./Helpers')
const { createNotification } = require('../../models/Notification')
// MODELS
const User = require('../../models/User')

exports.getLoggedUserData = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select(['-password'])
        .populate([
            {path: 'followers.user_id', select: ['profileImg', 'username']},
            {path: 'subscriptions.user_id', select: ['profileImg', 'username']},
            {path: 'followUpRequests.follower_id', select: ['profileImg', 'username']}
        ])
     
        if(!user) {
            return res.status(401).send('El usuario no existe ')
        }
        
        return res.status(200).json(user)
        
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
}

exports.changeProfileImage = async (req, res) => {
    try {
        if(req.validationErrors) return res.status(422).send(req.validationErrors)

        const result = await cloudinary.v2.uploader.upload(req.file.path)
        const user = await User.findById(req.user.id)

        if(user.public_id && user.profileImg !== 'https://res.cloudinary.com/dtyljkszk/image/upload/v1580349494/noprofileimg2_d40pl3.png') {
            await cloudinary.v2.uploader.destroy(user.public_id)
        }

        if(!user) return res.status(400).json('El usuario no existe')

        user.profileImg = result.secure_url
        user.public_id = result.public_id

        await user.save()
        await fs.unlink(req.file.path)

        return res.status(200).json({ id: user._id, profileImage: user.profileImg })
        
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
}

exports.addUserDescription = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)

        if(!user) return res.status(400).json('El usuario no existe')

        user.description = req.body.details

        await user.save()

        return res.status(200).json(user)
        
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
}

exports.getUserData = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select(['-password'])
        .populate([
            {path: 'followers.user_id', select: ['profileImg', 'username']},
            {path: 'subscriptions.user_id', select: ['profileImg', 'username']},
            {path: 'followUpRequests.follower_id', select: ['profileImg', 'username']}
        ])
        
        if(!user) return res.status(401).json('El usuario no existe')
            
        return res.status(200).json(user)
        
    } catch (err) {
        console.log(err)
        return res.status(500).json('Server error')
    }
}

exports.subscribe = async (req, res) => {
    try {
        const follower = await User.findById(req.user.id).select(['subscriptions', 'profileImg', 'username'])
        const followed = await User.findById(req.params.id).select(['followers', 'followUpRequests', 'private'])
 
        if(req.user.id === req.params.id) return res.status(400).send('No puedes hacer eso')
    
        if(followed.private) { 

            let checkRequest = followed.followUpRequests.find(elm => elm.follower_id == req.user.id)
    
            if(checkRequest) return res.status(400).send('Ya enviaste una solicitud previamente.')
    
            await followed.updateOne({ $push: {'followUpRequests': { follower_id: req.user.id } }})

            createNotification(follower._id, follower.username, follower.profileImg, followed._id, 'followRequest')
            
            return res.status(200).send('Successfully sended')
        }
         
        if(!followed) return res.status(400).json('El usuario no existe')

        const verifySubscription = followed.followers.find(user => user.user_id == req.user.id)
    
        if(verifySubscription) return res.status(401).json('Ya sigues a esta cuenta')

        await follower.updateOne({ $push: {'subscriptions': { user_id: req.params.id } }})

        await followed.updateOne({ $push: {'followers': { user_id: req.user.id } }})

        createNotification(follower._id, follower.username, follower.profileImg, followed._id, 'follow')
        
        return res.status(200).send('Successfully followed')
    
    
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')    
    }
}

exports.unsubscribe = async (req, res) => {
    try {
        const followed = await User.findById(req.params.id).select(['followers'])
        
        if(!followed) return res.status(400).json('El usuario no existe')
        
        const verifySubscription = followed.followers.find(user => user.user_id.toString() === req.user.id)

        if(!verifySubscription) return res.status(400).send('No sigues a esta cuenta.')

        await followed.updateOne({ $pull: {'followers': { user_id: req.user.id } } })

        await User.findByIdAndUpdate(req.user.id, { $pull: {'subscriptions': { user_id: req.params.id } } })
     
        return res.status(200).send('successfull')
    
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')    
    }
}

exports.getUserSearch = async (req, res) =>{
    try {
        if(req.query.search) {
    
        const regex = new RegExp(escapeRegex(req.query.search), 'gi')
    
        const user = await User.find({'username': regex }).select(['username', 'profileImg'])
    
        if(!user) res.send(null)
     
        res.json(user)
   
        } else {
    
        const users = await User.find().limit(5)
    
        if(users) return res.status(200).json(users)
        }    

    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')    
    }
}

exports.changePrivacy = async (req, res) => {
    try {

        const user = await User.findById(req.user.id)
       
        if(user.private) { 
            await user.updateOne({ private: false }) 
            await user.save()
            return res.status(200).json('SuccessFull')
        } else { 
            await user.updateOne({ private: true })
            await user.save()
            return res.status(200).json('SuccessFull')
        } 
        
    } catch (error) {
        console.log(error)
        return res.status(500).send('Server error')    
    }
}

exports.cancelSubscriptionRequest = async (req, res) => {
    try {
         const user = await User.findById(req.params.userid)

         let checkRequest = user.followUpRequests.find(elm => elm.follower_id == req.user.id)
    
         if(!checkRequest) return res.status(400).send('Envía la solicitud primero.')

         const newRequestList = user.followUpRequests.filter(request => request.follower_id.toString() !== req.user.id)

         user.followUpRequests = newRequestList
        
         await user.save()

         return res.status(200).json(user)

    } catch (error) {
        console.error(error.message)
        return res.status(500).send('Server error')
    }
}

exports.ignoreRequest = async (req, res) => {
    try {

       const user = await User.findById(req.user.id).select('followUpRequests')

       const checkRequest = user.followUpRequests.find(request => request.follower_id.toString() === req.params.follower_id)

       if(!checkRequest) return res.status(400).send('La solicitud no existe')

       const newRequestList = user.followUpRequests.filter(request => request.follower_id.toString() !== req.params.follower_id)
       
       user.followUpRequests = newRequestList

       await user.save()

       return res.status(200).send('Ignored')
        
    } catch (error) {
        console.log(error)
        return res.status(500).send('Server error')
    }
}

 exports.acceptRequest = async (req, res) => {
     try {

        console.log(req.body)

        const user = await User.findById(req.user.id).select(['followUpRequests', 'followers'])

        const checkRequest = user.followUpRequests.find(request => request.follower_id.toString() === req.body.follower_id)

        if(!checkRequest) return res.status(400).send('La solicitud no existe') 

        const newRequestList = user.followUpRequests.filter(request => request.follower_id.toString() !== req.body.follower_id)
       
        user.followUpRequests = newRequestList

        user.followers.unshift({user_id: req.body.follower_id })
 
        await user.save()

        // USUARIO QUE MANDA LA SOLICITUD
        await User.findByIdAndUpdate( req.body.follower_id, { $push: { 'subscriptions': { user_id: req.user.id } } })
    
        return res.status(200).send('Success')
          
     } catch (error) {
         console.log(error)
         return res.status(500).send('Server error')
     }
 }