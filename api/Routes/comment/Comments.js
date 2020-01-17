const express = require('express')
const router = express.Router()
const User = require('../../../models/User')
const Post = require('../../../models/Post')
const Comment = require('../../../models/Comment')
const Auth = require('../../Routes/auth_middleware/Auth')

// NEW COMMENT 
router.post('/:id', Auth, async (req, res) => {

    const { content } = req.body
    const { id } = req.params

    if(content.trim() === '') return res.status(400).json('No debe estar vacío')

    try {

        user = await User.findById(req.user.id)
        post = await Post.findById(id)

        if(!post) return res.status(400).json('El post no existe')
        
        const newComment = new Comment ({
            content,
            user_id: req.user.id,
            username: user.username,
            post_id: id
        }) 

        await newComment.save()

        res.json(newComment)
        
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
})

// DELETE COMMENT 
router.delete('/:id/delete', Auth, async (req, res) => {

    const { id } = req.params
    const comment = await Comment.findById(id)

    try {
        
    if(req.user.id !== comment.user_id.toString()) return res.status(401).json('No tienes autorización para hacer eso')
    if(!comment) return res.status(400).json('El comentario no existe')

    await Comment.deleteOne({_id: id})
    
    res.send('Comment successfully deleted')
        
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
        
    }
})

// GET COMMENTS FROM A POST 
router.get('/:id', async ( req, res ) => {

    const { id } = req.params
    
    try {
        const comments = await Comment.find({post_id: id}).sort({date: -1})
        const post = await Post.findById(id)
        
        if(!post) return res.status(401).json('El post no existe')

        if(!comments) res.json('Este post no tiene comentarios')

        res.json(comments)

    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
})  

// ANSWER A COMMENT
router.post('/:id/reply', Auth, async (req, res) => {

    const { id } = req.params
    const { content } = req.body

    try {

       const comment = await Comment.findById(id)
       const user = await User.findById(req.user.id)
        
       if(!comment) return res.status(401).json('El comentario no existe')
       

       newComment = {
          username: user.username,
          content,
          user_id: req.user.id
       }

        comment.replys.push(newComment)

        await comment.save()

        res.json(comment)

    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
})

// DELETE COMMENT ANSWER 
router.delete('/:commentid/reply/:replyid/delete', Auth, async (req, res) => {

    const { commentid, replyid } = req.params

    try {
        const comment = await Comment.findById(commentid)
        const reply = comment.replys.find(reply => reply._id.toString() === replyid)
        
        if(!reply) return res.status(401).json('El comentario no existe')

        if(!comment) return res.status(401).json('El comentario no existe')

        if(req.user.id !== reply.user_id.toString()) return res.status(401).json('No tienes autorización para hacer eso.')


        const newReplys = comment.replys.filter(reply => reply.id.toString() !== replyid)

        comment.replys = newReplys 

        await comment.save()

        res.json('Reply successfully deleted')

    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
})

module.exports = router