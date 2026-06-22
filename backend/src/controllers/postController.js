const Post = require('../models/post');

// CREATE POST
exports.createPost = async (req, res) => {
  try {
    const { text, imageUrl } = req.body;

    // Check if at least one of text or imageUrl is present
    if (!text && !imageUrl) {
      return res.status(400).json({ message: 'A post must contain either text or an image' });
    }

    // req.user is set by auth middleware (contains userId and name)
    const newPost = new Post({
      userId: req.user.userId,
      username: req.user.name,
      text: text || '',
      imageUrl: imageUrl || null,
      likes: [],
      comments: []
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Internal Server Error while creating post', error: error.message });
  }
};

// GET ALL POSTS (Paginated, newest first, populate userId)
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Optional filtering (e.g. for user posts if needed, but defaults to all)
    const totalPosts = await Post.countDocuments();
    
    // Get posts and populate userId details
    const posts = await Post.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts,
      hasMore: (page * limit) < totalPosts
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Internal Server Error while retrieving posts', error: error.message });
  }
};

// TOGGLE LIKE
exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const username = req.user.name; // Username from token

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(username);
    let isLiked = false;

    if (likeIndex > -1) {
      // User already liked it, remove user
      post.likes.splice(likeIndex, 1);
    } else {
      // User hasn't liked it, add user
      post.likes.push(username);
      isLiked = true;
    }

    await post.save();

    res.status(200).json({
      message: isLiked ? 'Post liked' : 'Post unliked',
      likes: post.likes,
      isLiked
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Internal Server Error while toggling like', error: error.message });
  }
};

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { text } = req.body;
    const username = req.user.name; // Username from token

    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      username,
      text: text.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json({
      message: 'Comment added successfully',
      comment: post.comments[post.comments.length - 1],
      comments: post.comments
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Internal Server Error while adding comment', error: error.message });
  }
};
