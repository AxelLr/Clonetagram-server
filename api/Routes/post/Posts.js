const express = require('express')
const router = express.Router()
const {check, validationResult } = require('express-validator')
const Auth = require('../auth_middleware/Auth')
const Post = require('../../../models/Post')
const User = require('../../../models/User')
const Comment = require('../../../models/Comment')
const cloudinary = require('../../../Cloudinary')
const fs = require('fs-extra')

// GET ALL POSTS 
router.get('/', async (req, res) => {

    try {
        const posts = await Post.find().sort({ date: -1 })

        res.json(posts)

    } catch(err) {
        console.error(err.message)
        return res.status(500).send('Server error')
    }
})

// NEW POST
router.post('/add', Auth, [
    check('title', 'el número máximo de caracteres permitido es 15').isLength({ max: 15 }),
    check('description', 'el número máximo de caracteres permitido es 200').isLength({max: 200 })

], async (req, res) => {

const errors = validationResult(req)

const { title, description } = req.body

if(!errors.isEmpty()) {
    return res.status(400).json( { errors: errors.array() } )
}

if(title.trim() === '' ) {
    return res.status(400).json({ errors: [{msg: 'No debe estar vacío', param: 'title' }]})
}

try{
    const result = await cloudinary.v2.uploader.upload(req.file.path)

    const user = await User.findById(req.user.id).select(['username','profileImg'])
    
    console.log(result)

    let post = {
        user_id: req.user.id,
        public_id: result.public_id,
        title,
        imageURL: result.url,
        username: user.username,
        avatar: user.profileImg
    }

    console.log(post)
   
    if(description) post.description = description

    let newPost = new Post(post)

    await newPost.save()
    await fs.unlink(req.file.path)

    res.send('exit')  
}
    catch(errors) {
        console.log(errors.message)
    }

})

// DELETE POST 
router.delete('/:id/delete', Auth,  async (req, res) => {

    const { id } = req.params
    const post = await Post.findById(id)
    console.log(req.user.id + 'connected user')

    console.log(post.user_id )

    if(!post) {
        return res.status(400).json('El post no existe.')
    }

    if(post.user_id.toString() !== req.user.id) {
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
router.get('/:id', async (req, res) => {

const { id } = req.params
let postData = {}

try {
    const post = await Post.findById(id)
    const comments = await Comment.find({post_id: id})

    if(!post) {
        return res.status(400).json('El post no existe')
    }

    if(comments) postData.Comments = [ comments ]

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


module.exports = router