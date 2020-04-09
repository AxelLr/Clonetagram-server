// MODELS
const User = require('../../models/User')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')

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

        let comments = await Comment.find({'post_id': req.params.id }).populate('user_id', ['username', 'profileImg']).sort({date: -1})

        res.json(comments)
        
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
}

exports.deleteComment = async (req, res) => {

    const { id } = req.params

    try {

    const comment = await Comment.findById(id)

    await Post.findByIdAndUpdate(comment.post_id, { $inc: {'commentCount' : -1}})
        
    if(req.user.id !== comment.user_id.toString()) return res.status(401).json('No tienes autorización para hacer eso')
    if(!comment) return res.status(400).json('El comentario no existe')

    await Comment.deleteOne({_id: id})
    
    res.send('Comment successfully deleted')
        
    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
}

exports.getPostComments =  async ( req, res ) => {

    const { id } = req.params
    
    try {
        const comments = await Comment.find({post_id: id}).populate('user_id', ['username', 'profileImg']).sort({date: -1})
        const post = await Post.findById(id)
        
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
       const comment = await Comment.findById(req.params.id).populate('user_id', ['username', 'profileImg'])
       const user = await User.findById(req.user.id)
        
       if(!comment) return res.status(401).json('El comentario no existe')
       
       let newComment = {
          username: user.username,
          content: req.body.content,
          user_id: req.user.id
       }

       comment.replys.push(newComment)

       await comment.save()

       res.json(comment)

    } catch (err) {
        console.log(err)
        return res.status(500).send('Server error')
    }
}

exports.deleteReply = async (req, res) => {

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
}