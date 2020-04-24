// MODELS
const User = require('../../models/User')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const { createNotification } = require('../../models/Notification')

exports.newComment = async (req, res) => {
    try {
        let post = await Post.findByIdAndUpdate(req.params.id, { $inc: {'commentCount' : 1}})

        if(!post) return res.status(400).json('El post no existe')
        
        const newComment = new Comment ({
            content: req.body.content,
            user_id: req.user.id,
            post_id: req.params.id
        }) 

        await newComment.save()
        
        let comment = await Comment.findOne(newComment._id).populate('user_id', ['username', 'profileImg'])
     
        res.json(comment)
  
        createNotification(req.user.id, comment.user_id.username, comment.user_id.profileImg, post.userRef ,'comment', req.params.id)

    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
}

exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id)

        await Post.findByIdAndUpdate(comment.post_id, { $inc: {'commentCount' : -1}})
            
        if(req.user.id !== comment.user_id.toString()) return res.status(401).json('No tienes autorización para hacer eso')
        if(!comment) return res.status(400).json('El comentario no existe')

        await Comment.deleteOne({_id: req.params.id})
        
        return res.status(200).send('Comment successfully deleted')
        
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
}

exports.getPostComments =  async ( req, res ) => {    
    try {
        const comments = await Comment.find({post_id: req.params.id})
        .populate([{path: 'user_id', select: ['username', 'profileImg']},
         { path: 'replies.user_id', select: ['username', 'profileImg'] }
        ]).sort({date: 1})

        const post = await Post.findById(req.params.id)
        
        if(!post) return res.status(401).json('El post no existe')

        if(!comments) res.json('Este post no tiene comentarios')

        res.json(comments)

    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
}

exports.replyComment = async (req, res) => {
    try {

        console.log(req.body)

        let newComment = {
            content: req.body.content,
            user_id: req.user.id
         }

       const comment = await Comment.findByIdAndUpdate(req.params.id, { $push : {'replies' : newComment }},
        {new: true}).populate([{path: 'user_id', select: ['username', 'profileImg']}, { path: 'replies.user_id', select: ['username', 'profileImg']}])
    
       const user = await User.findById(req.user.id)
        
       if(!comment) return res.status(401).json('El comentario no existe')

        res.json(comment)

        createNotification(req.user.id, comment.user_id.username, user.profileImg, comment.user_id._id, 'reply', comment.post_id)

    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
}

exports.deleteReply = async (req, res) => {

    const { commentid, replyid } = req.params

    try {
        const comment = await Comment.findById(commentid)
        const reply = comment.replies.find(reply => reply._id.toString() === replyid)
        
        if(!reply) return res.status(401).json('El comentario no existe')

        if(!comment) return res.status(401).json('El comentario no existe')

        if(req.user.id !== reply.user_id.toString()) return res.status(401).json('No tienes autorización para hacer eso.')

        const newReplies = comment.replies.filter(reply => reply.id.toString() !== replyid)

        comment.replies = newReplies 

        await comment.save()

        res.json('Reply successfully deleted')

    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
}