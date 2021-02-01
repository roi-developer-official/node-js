const express = require('express');

const feedController = require('../controllers/feed');
const isAuth = require('../middleware/auth')

const {body}  = require('express-validator')

const router = express.Router();

// GET /feed/posts
router.get('/posts',isAuth, feedController.getPosts);

// POST /feed/post
router.post('/post',isAuth,
[
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min:3})
],
 feedController.createPost);

router.get('/post/:postId',isAuth, feedController.getPost)

router.put('/post/:postId',isAuth,
[
    body('title').trim().isLength({min: 5}),
    body('content').trim().isLength({min:3})
], feedController.updatePost)

router.delete('/post/:postId', feedController.deletePost)

module.exports = router;