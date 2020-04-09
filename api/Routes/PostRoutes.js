const express = require('express')
const router = express.Router()
const Auth = require('../../middlewares/Auth')
// VALIDATIONS
const validation = require('../../middlewares/validation/Validation')
// VALIDATION SCHEMAS
const { description } = require('../../middlewares/validation/Schemas')
// CONTROLLERS
const { getAllPosts, getPostsFromUser,addPost, deletePost, 
    getSinglePost, likeAPost, dislikeAPost, getPostsFromSubscriptions } = require('../../controllers/post-controller/PostController')
// GET ALL POSTS 
router.get('/', getAllPosts)
// GET ALL POSTS FROM USER
router.get('/users/:id', Auth, getPostsFromUser)
// ADD POST
router.post('/add', Auth, validation(description), addPost)
// DELETE POST 
router.delete('/:id/delete', Auth, deletePost )
// GET SINGLE POST
router.get('/post/:id', Auth, getSinglePost)
// LIKE A POST
router.post('/:postid/like', Auth, likeAPost)
// DISLIKE A POST 
router.delete('/:postid/dislike', Auth, dislikeAPost)
// GET POSTS FROM SUBSCRIPTIONS 
router.get('/user/subscriptions', Auth, getPostsFromSubscriptions)

module.exports = router