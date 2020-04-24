const cloudinary = require('../../config/CloudinaryConfig')
const fs = require('fs-extra')
const unAuthorized = require('./Helpers')
// MODELS
const Post = require('../../models/Post')
const User = require('../../models/User')
const { createNotification } = require('../../models/Notification')

exports.getAllPosts = async (req, res) => {

    try {
         let allPosts = {}
         const postsNumber = req.query.postsNumber ? parseInt(req.query.postsNumber) : 8
         const page = req.query.page ? parseInt(req.query.page) : 1 
         let response = await Post.find().skip((page - 1) * postsNumber).limit(postsNumber).sort({ date: -1 }).populate('userRef', ['profileImg', 'username', 'private'])
         
         allPosts.posts = response.filter(post => !post.userRef.private )
        //  allPosts.numberOfPosts = await Post.countDocuments()
        allPosts.numberOfPosts = allPosts.posts.length 
        res.json(allPosts)

    } catch(err) {
        console.error(err.message)
        return res.status(500).send('Server error')
    }
}

exports.getPostsFromUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const posts = await Post.find({'userRef': req.params.id}).populate('userRef', ['profileImg', 'username'])
        
        let { unauthorized } = unAuthorized(user, req.user.id) 

        if(unauthorized) { return res.status(401).send('No tienes autorizacion para ver este contenido') } else {
            return res.json(posts)
        }     
        
    } catch (err) {
        console.error(err.message)
        return res.status(500).send('Server error')
    }
}

exports.addPost = async (req, res) => {
    try{    
        
        const { description } = req.body

        if(req.validationErrors) return res.status(422).send(req.validationErrors)

        if(!req.file) return res.status(422).send('Campo imágen requerido.')
    
        const result = await cloudinary.v2.uploader.upload(req.file.path)
        
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
}

exports.deletePost = async (req, res) => {

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
}

exports.getSinglePost = async (req, res) => {

    try {
        const post = await Post.findById(req.params.id).populate('userRef', ['username','profileImg'])
        const user = await User.findById(post.userRef._id)
        
        if(!post) return res.status(400).json('El post no existe')
        
        let { unauthorized } = unAuthorized(user, req.user.id) 
    
        if(unauthorized) { return res.status(401).send('No tienes autorizacion para ver este contenido') } else {
            return res.json(post)
        }     
    
    } catch(err) {
        console.error(err.message)
        if (err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'El post no existe'})
        }
        res.status(500).send('Internal server error')
    }
}

exports.likeAPost = async (req, res) => {
    try {
        const post = await Post.findById( req.params.postid).populate('userRef', ['_id','username','profileImg'])
        const like = post.likes.filter(like => like.user.toString() === req.user.id)
        const user = await User.findById(req.user.id)
    
        if(!post) return res.status(401).json('El post no existe')
        
        if(like.length >= 1) return res.status(400).json('Ya le diste me gusta a este post')

        post.likes.push({user: req.user.id})
        
        await post.save()

        res.json(post)

        createNotification(req.user.id, user.username, user.profileImg, post.userRef._id, 'like', post._id)
        
    } catch(err) {
        console.error(err.message)
        if (err.kind == 'ObjectId') {
            return res.status(400).json({msg: 'El post no existe'})
        }
        res.status(500).send('Internal server error')
    }
}

exports.dislikeAPost =  async (req, res) => {

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
}

exports.getPostsFromSubscriptions = async (req, res) => {

    try {

        const postsNumber = req.query.postsNumber ? parseInt(req.query.postsNumber) : 4
        const page = req.query.page ? parseInt(req.query.page) : 1 

        let subscriptions = [req.user.id]
        const user =  await User.findById(req.user.id).select('subscriptions')
        user.subscriptions.forEach( subscription => subscriptions.push(subscription.user_id.toString()))
        const posts = await Post.find({'userRef': {$in: subscriptions }} ).skip((page - 1) * postsNumber).limit(postsNumber).sort({ date: -1 }).populate('userRef', ['profileImg', 'username']).sort({ date: -1 })

        res.json(posts)
        
    } catch (err) {
        console.log(err)
        return res.status(500).json('Server error')        
    }

}