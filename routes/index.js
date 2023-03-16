const express = require('express');
const router = express.Router();
const { body, validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');

const Author = require('../models/author');
const Post = require('../models/post');
const Comment = require('../models/comment');
const { default: mongoose } = require('mongoose');

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
  body('author', 'Name required').trim().isLength({ min: 1 }),
  body('author', 'Name too long').trim().isLength({ max: 32 }),
  body('text', 'Comment required').trim().isLength({ min: 1 }),
  body('text', 'Comment too long').trim().isLength({ max: 100 }),

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

//get all comments from specific post
router.get('/post/:id/comment', async function(req, res, next){
  try{
    let comment = await Comment.find({ _id: req.params.id});
    return res.status(200).json({comment});
  }
  catch(err){
    return res.status(400).json({message: 'No comments found'})
  }
})

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

//testing all post db get
router.get('/post/', async function(req, res, next){
  try{
    let post = await Post.find().sort({date: -1});
    return res.status(200).json({post});
  }
  catch(err){
    return res.status(400).json({message: 'No post found'})
  }
})

//testing login with jwt
router.post('/login', [
body('username', 'Username required').trim().isLength({ min: 1 }),
body('password', 'Password required').trim().isLength({ min: 1 }),

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

    jwt.sign({user: user}, process.env.KEY, { expiresIn: '24h' }, (err, token) => {
      res.json({
        token: token
      })
    });
  }
  catch(err){
    return res.status(400).json({message: err});
  }
}])

//delete comment
router.delete('/comment/:comment', verifyToken, async function(req, res, next){
  try{
    jwt.verify(req.token, process.env.KEY, (err, authData) => {
      if(err){
        res.sendStatus(403);
      }
      else {
        Comment.findByIdAndRemove(req.params.comment).then((del) => {
          if(del !== null){
            res.status(200).json({message: 'success', authData});
          } else {
            throw err;
          }
        }).catch((err)=>{
          res.status(400).json({message: 'Comment does not exist'});
        })
      }
    })
  }
  catch(err){
    res.status(400).json({err});
  }
})

//post create new post
router.post('/post/new', [
  body('title', 'Title required').trim().isLength({ min: 1 }),
  body('text', 'Text required').trim().isLength({ min: 1 }),

  verifyToken,

  async function(req, res, next){
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
        data: req.body
      })
    }
    try{
      let post = new Post({
        title: req.body.title,
        text: req.body.text,
        date: new Date(),
      })

      jwt.verify(req.token, process.env.KEY, (err, authData) => {
        if(err){
          res.sendStatus(403);
        }
        else {
          post.save().then(() => {
            res.status(200).json({message: 'Post saved', post})
          }).catch((err)=> {
            res.status(400).json({err});
          })
        }
      })
    }
    catch(err){
      return res.status(400).json({err})
    }
  }
])

//delete post and all comments
router.delete('/post/:id', verifyToken, async function(req, res, next){
  try{
    jwt.verify(req.token, process.env.KEY, async function(err, authData){
      if(err){
        res.sendStatus(403);
      }
      else {
        if(mongoose.Types.ObjectId.isValid(req.params.id)){
        let post = await Post.findByIdAndDelete({_id: req.params.id});
        let comments = await Comment.deleteMany({post: req.params.id});
        res.status(200).json({message: 'success', authData, post, comments});
        } else {
        res.status(404).json({message: 'invalid url'});
        }
      }
    })
  }
  catch(err){
    res.status(400).json({message: err});
  }
})

//middleware to veriffy jwt token
function verifyToken(req, res, next){
  const bearerHeader = req.headers['authorization'];
  if(typeof bearerHeader !== 'undefined'){
    const bearer = bearerHeader.split(' ');
    const bearerToken = bearer[1];
    req.token = bearerToken;
    next();
  } else {
    //Forbidden
    res.sendStatus(403);
  }
}

module.exports = router;