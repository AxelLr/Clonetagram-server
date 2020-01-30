const express = require('express')
const router = express.Router()
const {check, validationResult } = require('express-validator')
const Auth = require('../auth_middleware/Auth')
const Post = require('../../../models/Post')
const User = require('../../../models/User')
const cloudinary = require('../../../Cloudinary')
const fs = require('fs-extra')

// GET ALL POSTS 
router.get('/', async (req, res) => {

    try {
         let allPosts = {}
         const postsNumber = req.query.postsNumber ? parseInt(req.query.postsNumber) : 8
         const page = req.query.page ? parseInt(req.query.page) : 1 
         allPosts.posts = await Post.find().skip((page - 1) * postsNumber).limit(postsNumber).sort({ date: -1 }).populate('userRef', ['profileImg', 'username'])
       
         allPosts.numberOfPosts = await Post.countDocuments()
    
        res.json(allPosts)
        console.log(allPosts)

    } catch(err) {
        console.error(err.message)
        return res.status(500).send('Server error')
    }
})

// GET ALL POSTS FROM USER
router.get('/users/:id', Auth, async (req, res) => {

    try {

        const posts = await Post.find({'userRef': req.params.id}).populate('userRef', ['profileImg', 'username'])

        res.json(posts)
        
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server error')
    }
})

// NEW POST
router.post('/add', Auth, [
    check('description', 'el número máximo de caracteres permitido es 200').isLength({max: 200 })
], async (req, res) => {

try{

    if(req.validationErrors) return res.status(400).json(req.validationErrors) 
    
    console.log(req.validationErrors)

    const errors = validationResult(req)

    const { description } = req.body

    if(!errors.isEmpty()) {
        return res.status(400).json( { errors: errors.array() } )
    } 
    const result = await cloudinary.v2.uploader.upload(req.file.path)

    console.log(result)
    
    let post = {
        userRef: req.user.id,
        public_id: result.public_id,
        imageURL: result.secure_url
    }

    if(description) post.description = description

    let newPost = new Post(post)

    await newPost.save()
    await fs.unlink(req.file.path)

    post = await Post.findById(newPost._id).populate('userRef', ['username','profileImg'])

    res.json(post)  
}
    catch(err) {
        console.log(err)
        return res.status(500).json('Server error')
    }

})

// DELETE POST 
router.delete('/:id/delete', Auth,  async (req, res) => {

    const { id } = req.params
    const post = await Post.findById(id)

    if(!post) {
        return res.status(400).json('El post no existe.')
    }

    if(post.userRef._id.toString() !== req.user.id) {
        return res.status(401).json('No tienes autorización para hacer eso.')
    }

    try {
        await Post.deleteOne({ _id : id })
        await cloudinary.v2.uploader.destroy(post.public_id)
        res.status(200).json('Post successfully deleted')

    } catch(err){
        console.log(err)
        return res.status(500).json('Server error')
    }

})

// GET SINGLE POST
router.get('/post/:id', async (req, res) => {

const { id } = req.params

try {
    const post = await Post.findById(id).populate('userRef', ['username','profileImg'])

    if(!post) {
        return res.status(400).json('El post no existe')
    }

    res.json(post)
    
} catch(err) {
    console.error(err.message)
    if (err.kind == 'ObjectId') {
        return res.status(400).json({msg: 'El post no existe'})
    }
    res.status(500).send('Internal server error')
}
})

// LIKE A POST
router.post('/:postid/like', Auth, async (req, res) => {

    const { postid } = req.params
    
    try {

        const post = await Post.findById(postid)
        const like = post.likes.filter(like => like.user.toString() === req.user.id)

        if(!post) return res.status(401).json('El post no existe')
        
        if(like.length >= 1) return res.status(400).json('Ya le diste me gusta a este post')

        post.likes.push({user: req.user.id})
        
        await post.save()

        res.json(post)
        
    } catch(err) {
        console.error(err.message)
        if (err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'El post no existe'})
        }
        res.status(500).send('Internal server error')
    }
})

// DISLIKE A POST 
router.delete('/:postid/dislike', Auth, async (req, res) => {

    const { postid } = req.params

    try {

        const post = await Post.findById(postid)
        const like = post.likes.filter(like => like.user.toString() === req.user.id)

        if(!post) return res.status(401).json('El post no existe')
        
        if(!like) return res.status(400).json('No le diste me gusta a este post')

        const newLikesList = post.likes.filter(like => like.user.toString() !== req.user.id)

        post.likes = newLikesList

        await post.save()

        res.json(post)
        
    } catch(err) {
        console.error(err.message)
        if (err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'El post no existe'})
        }
        res.status(500).send('Internal server error')
    }
})

// GET POSTS FROM SUBSCRIPTIONS 
router.get('/user/subscriptions', Auth, async (req, res) => {

    try {

        let subscriptions = [req.user.id]
        const user =  await User.findById(req.user.id).select('subscriptions')
        user.subscriptions.forEach( subscription => subscriptions.push(subscription.user_id.toString()))
        const posts = await Post.find({'userRef': {$in: subscriptions }} ).populate('userRef', ['profileImg', 'username']).sort({ date: -1 })

        res.json(posts)
        console.log(user)

        
    } catch (err) {
        console.log(err)
        return res.status(500).json('Server error')        
    }

})

module.exports = router