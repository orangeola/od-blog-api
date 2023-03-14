const express = require('express');
const router = express.Router();

const Author = require('../models/author');
const Post = require('../models/post');
const Comment = require('../models/comment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    message: "Hello World"
  });
});

router.get('/admin', async function(req, res, next){
  try{
    let user = await Author.find({username: 'admin'});
    return res.status(200).json({user})
  }
  catch(err){
    return res.status(400).json({message: 'No users or error'})
  }
})

router.get('/post', async function(req, res, next){
  try{
    let post = await Post.find({ title: "First Post Ever!"});
    return res.status(200).json({post});
  }
  catch(err){
    return res.status(400).json({message: 'No post found'})
  }
})

router.get('/comment', async function(req, res, next){
  try{
    let comment = await Comment.find({_id: "6410631a20afc7d8c75c31b0"}).populate('post');
    return res.status(200).json({comment});
  }
  catch(err){
    return res.status(400).json({comment: 'No message found'})
  }
})

module.exports = router;