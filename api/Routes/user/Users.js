const express = require('express')
const router = express.Router()
const User = require('../../../models/User')
const Post = require('../../../models/Post')
const Auth = require('../auth_middleware/Auth')
const cloudinary = require('../../../Cloudinary')
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

        if(user.profileImg !== 'https://res.cloudinary.com/dtyljkszk/image/upload/v1578947999/noprofileimg2_uy01qe.png') {
            await cloudinary.v2.uploader.destroy(user.public_id)
        }

        if(!user) return res.status(400).json('El usuario no existe')

        user.profileImg = result.url
        user.public_id = result.public_id

        await user.save()
        await fs.unlink(req.file.path)

        res.json('exit')
        
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

    if(!errors.isEmpty()) {
        return res.status(400).json( { errors: errors.array() } )
    }

    if(req.body.details.trim() === '') return res.status(400).json('No debe estar vacío')

    try {
        const user = await User.findById(req.user.id)

        if(!user) return res.status(400).json('El usuario no existe')

        user.description = req.body.details

        await user.save()
        res.send(user)
        
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
    
    
    if(!followed) return res.status(400).json('El usuario no existe')

    let newFollower = {
        username: follower.username,
        user_id: follower.id
    }

    let newSubscription = {
        username: followed.username,
        user_id: followed.id
    }

    const verifySubscription = followed.followers.find(user => user.user_id.toString() === req.user.id)

    if(verifySubscription) return res.status(401).json('Ya sigues a esta cuenta')

    followed.followers.push(newFollower)
    await followed.save()

    follower.subscriptions.push(newSubscription)
    await follower.save()

    res.send(follower)

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
    
        res.send(follower)
    
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')    
    }
})

// // DELETE ACCOUNT 
// router.delete('/me/delete', Auth, async (req, res) => {

// try {

//     const user = await User.findById(req.user.id)
//     const posts = await Post.find({ user_id: req.user.id })
//     const comments = await Comment.find({user_id: req.user.id})

    
//     if(!user) return res.status(400).json('El usuario no existe')

//     if(posts) await Post.remove({user_id: req.user.id})

//     posts.forEach(post => {
        
//         if(post.likes.user.user_id.toString() === req.user.id) {

//         let filteredLikesList = post.likes.filter(like => like.user !== req.user.id )
            
//         }
//     })

//     if (likedPosts) likedPosts.forEach(post => {

        

//         post.likes = filteredLikesList
//     }) 

//     if(comments) await Comment.remove({user_id: req.user.id})

//     await User.deleteOne(req.user.id)

//     res.json('User successfully deleted')
    
// } catch (err) {
//     console.log(err)
//     return res.status(500).send('Server error')       
// }

    
// })

router.get('/', Auth, async (req, res) => {

    try {
        const posts = await Post.find({'post.likes.user': req.user.id})

        res.json(posts)

    } catch(err) {
        console.error(err.message)
        return res.status(500).send('Server error')
    }
})


module.exports = router
