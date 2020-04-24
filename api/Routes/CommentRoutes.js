const express = require('express')
const router = express.Router()
const Auth = require('../../middlewares/Auth')
// VALIDATIONS
const validation = require('../../middlewares/validation/Validation')
// VALIDATION SCHEMAS
const { comment } = require('../../middlewares/validation/Schemas')
// CONTROLLERS
const { newComment, deleteComment, getPostComments, replyComment, deleteReply } = require('../../controllers/comment-controller/CommentController')
// NEW COMMENT  
router.post('/:id', Auth, validation(comment), newComment)
// DELETE COMMENT 
router.delete('/:id/delete', Auth, deleteComment)
// GET COMMENTS FROM A POST 
router.get('/:id', getPostComments)  
// ANSWER A COMMENT
router.post('/:id/reply', Auth, validation(comment), replyComment)
// DELETE COMMENT ANSWER 
router.delete('/:commentid/reply/:replyid/delete', Auth, deleteReply)

module.exports = router