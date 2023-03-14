const express = require('express');
const router = express.Router();
const { body, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');

const Author = require('../models/author');
const Post = require('../models/post');
const Comment = require('../models/comment');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({
    message: "Hello World"
  });
});

//testing admin db get
router.get('/admin', async function(req, res, next){
  try{
    let user = await Author.find({username: 'admin'});
    return res.status(200).json({user})
  }
  catch(err){
    return res.status(400).json({message: 'No users or error'})
  }
})

//testing comment db get
router.get('/post/:id/comment', async function(req, res, next){
  try{
    let comment = await Comment.find({post: req.params.id}).sort({date: -1});
    return res.status(200).json({comment});
  }
  catch(err){
    return res.status(400).json({message: 'No comments found'})
  }
})

//post comment to specific post
router.post('/post/:id/comment', [
  body('author', 'Name required').trim().isLength({ min: 1 }).escape(),
  body('text', 'Text required').trim().isLength({ min: 1 }).escape(),

  async function(req, res, next){
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        data: req.body
      })
    }
    try{
      let comment = new Comment({
        author: req.body.author,
        text: req.body.text,
        date: new Date(),
        post: req.params.id
      })

      comment.save().then(err => {
        res.status(200).json({message: 'Comment saved', comment})
      }).catch((err)=> {
        res.status(400).json({err});
      })
    }
    catch(err){
      return res.status(400).json({err})
    }
  }
])

//testing post db get
router.get('/post/:id', async function(req, res, next){
  try{
    let post = await Post.find({ _id: req.params.id});
    return res.status(200).json({post});
  }
  catch(err){
    return res.status(400).json({message: 'No post found'})
  }
})

//testing login with jwt
router.post('/login', [
body('username', 'Username required').trim().isLength({ min: 1 }).escape(),
body('password', 'Password required').trim().isLength({ min: 1 }).escape(),

async function(req, res, next){
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
      data: req.body
    })
  }
  try{
    let user = await Author.find({username: req.body.username, password: req.body.password});

    jwt.sign({user: user}, process.env.KEY, (err, token) => {
      res.json({
        token: token
      })
    });
  }
  catch(err){
    return res.status(400).json({message: err});
  }
}])

module.exports = router;