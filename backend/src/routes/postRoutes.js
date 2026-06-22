const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const auth = require('../middleware/auth');

// POST /api/posts — Create a new post (Protected)
router.post('/', auth, postController.createPost);

// GET /api/posts — Get all posts (Paginated)
router.get('/', postController.getPosts);

// POST /api/posts/:id/like — Toggle post like (Protected)
router.post('/:id/like', auth, postController.toggleLike);

// POST /api/posts/:id/comment — Add a comment to post (Protected)
router.post('/:id/comment', auth, postController.addComment);

module.exports = router;
