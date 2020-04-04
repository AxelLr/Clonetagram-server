const express = require('express')
const router = express.Router()
const User = require('../../../models/User')
const Post = require('../../../models/Post')
const Auth = require('../auth_middleware/Auth')
const cloudinary = require('../../../config/CloudinaryConfig')
const fs = require('fs-extra')
const {check, validationResult } = require('express-validator')

// GET LOGGED IN USER DATA 
router.get('/me', Auth, async (req, res) => {

    try {
        const user = await User.findById(req.user.id)
     
        if(!user) {
            return res.status(401).json( {error: 'El usuario no existe '} )
        }

        res.json(user)
        
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
})

// CHANGE PROFILE IMAGE 
router.put('/image', Auth, async (req, res) => {

    try {
        const result = await cloudinary.v2.uploader.upload(req.file.path)
        const user = await User.findById(req.user.id)

        if(user.profileImg !== 'https://res.cloudinary.com/dtyljkszk/image/upload/v1580349494/noprofileimg2_d40pl3.png') {
            await cloudinary.v2.uploader.destroy(user.public_id)
        }

        if(!user) return res.status(400).json('El usuario no existe')

        user.profileImg = result.secure_url
        user.public_id = result.public_id

        await user.save()
        await fs.unlink(req.file.path)

        res.json(user)
        
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
})

// ADD USER DESCRIPTION 
router.post('/me/details', Auth, [
    check('details','Excedido el límite de caracteres').isLength({max: 200})
], async (req, res) => {

    const errors = validationResult(req)

    try {
        
        if(!errors.isEmpty()) {
            return res.status(400).json( { errors: errors.array() } )
        }

        if(req.body.details.trim() === '') return res.status(400).json('No debe estar vacío')

        const user = await User.findById(req.user.id)

        if(!user) return res.status(400).json('El usuario no existe')

        user.description = req.body.details

        await user.save()
        res.json(user)
        
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
})

// GET USER DATA
router.get('/:id', async (req, res) => {

const { id } = req.params

    try {

    const user = await User.findById(id)
    const posts = await Post.find({user_id: id})

    if(!user) {
        return res.status(401).json('El usuario no existe')
    }

    res.json(user)

    } catch (err) {
        console.log(err)
        return res.status(500).json('Server error')
    }
})

// SUBSCRIBE TO ANOTHER USER
router.post('/subscribe/:id', Auth, async (req, res) => {

const { id } = req.params

try {
    const follower = await User.findById(req.user.id)
    const followed = await User.findById(id)

    if(req.user.id === id) return res.status(400).json('No puedes hacer eso')

    if(followed.private) { 
        let checkRequest = followed.followUpRequests.find(elm => elm.follower_id == req.user.id)

        if(checkRequest) return res.status(400).send('Ya enviaste una solicitud previamente.')

        let newRequest = {
            follower_id: req.user.id
        }

        followed.followUpRequests.unshift(newRequest)

        await followed.save()
        
        return res.status(200).send(followed)
    }
      
    if(!followed) return res.status(400).json('El usuario no existe')

    let newFollower = {
        username: follower.username,
        user_id: follower.id
    }

    let newSubscription = {
        username: followed.username,
        user_id: followed.id
    }

    const verifySubscription = followed.followers.find(user => user.user_id == req.user.id)

    if(verifySubscription) return res.status(401).json('Ya sigues a esta cuenta')

    followed.followers.push(newFollower)
    await followed.save()

    follower.subscriptions.push(newSubscription)
    await follower.save()

    res.send(followed)

} catch (err) {
    console.log(err)
    return res.status(500).send('Server error')    
}

})

// UNSUBSCRIBE TO ANOTHER USER 
router.delete('/unsubscribe/:id', Auth, async (req, res) => {

    const { id } = req.params

    try {
        const follower = await User.findById(req.user.id)
        const followed = await User.findById(id)
        
        if(!followed) return res.status(400).json('El usuario no existe')

        const verifySubscription = followed.followers.find(user => user.user_id.toString() === req.user.id)

        if(!verifySubscription) return res.status(400).json('No sigues a esta cuenta.')
    
        const newFollowersList = followed.followers.filter(user => user.user_id.toString() !== req.user.id )

        followed.followers = newFollowersList

        await followed.save()

        const newSubscriptionList = follower.subscriptions.filter(user => user.user_id.toString() !== id )

        follower.subscriptions = newSubscriptionList
        await follower.save()
    
        res.send(followed)
    
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')    
    }
})

// GET USERS
router.get('/', async (req, res) =>{

try {
    if(req.query.search) {

    const regex = new RegExp(escapeRegex(req.query.search), 'gi')

    const user = await User.find({'username': regex })

    if(!user) res.send(undefined)
    console.log(user)
    res.json(user)
    
    console.log(user)
    } else {

    const users = await User.find().limit(8)

    if(users) res.json(users)

    }    
   
} catch (err) {
    console.log(err)
    return res.status(500).send('Server error')    
}

})

// CHANGE PRIVATE STATUS 
router.patch('/privacy', Auth, async (req, res) => {
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
})

// HELPERS
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

router.get('/', Auth, async (req, res) => {

    try {
        const posts = await Post.find({'post.likes.user': req.user.id})

        res.json(posts)

    } catch(err) {
        console.error(err.message)
        return res.status(500).send('Server error')
    }
})

// CANCEl SUBSCRIPTION REQUEST
router.delete('/requests/:userid', Auth, async (req, res) => {
    try {

         const user = await User.findById(req.params.userid)

         let checkRequest = user.followUpRequests.find(elm => elm.follower_id == req.user.id)
    
         if(!checkRequest) return res.status(400).send('Envía la solicitud primero.')

         const newRequestList = user.followUpRequests.filter(request => request.follower_id.toString() !== req.user.id)

         user.followUpRequests = newRequestList
        
         await user.save()

         res.send(user)
              
    } catch (error) {
        console.error(error.message)
        return res.status(500).send('Server error')
    }
})


module.exports = router
