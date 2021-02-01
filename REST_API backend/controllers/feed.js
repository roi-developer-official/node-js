const {validationResult} = require('express-validator')
const Post = require('../models/post')
const fs = require('fs')
const path = require('path')
const User = require('../models/user')

exports.getPosts = (req, res, next) => {
  const currentPage = req.query.page || 1
  const perPage = 2;
  let totalItems;
  Post.find().countDocuments()
  .then(count=> {
    totalItems = count
    return Post.find().skip((currentPage - 1) * perPage).limit(perPage)
    .then(posts=>{
      res.status(200).json({
        message: 'fetched posts', 
        posts: posts, 
        totalItems
      })
    })
    .catch(err=>{
      if(!err.statusCode){
        err.status = 500;
      }
      next(err)
    })
  })
  .catch(err=>
     {if(!err.statusCode){
     err.status = 500;
     }
     next(err)
  })
};

exports.createPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const imageUrl = req.file.path.replace('\\','/');
  const errors = validationResult(res);

  if(!errors.isEmpty()){
    const error = new Error('validation failed')
    error.statusCode = 422;
    throw error;
  }
  if(!req.file){
    const error = new Error('no image provided')
    error.statusCode = 422;
    throw error;
  }
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId
  })
  .save()
  .then(()=>User.findById(req.userId))
    .then(user=>{
      creator = user;
      user.posts.push(post)
      return user.save()
    })
    .then(()=>{
      res.status(201).json({
        message: 'Post created successfully!',
        post: post,
        creator: {_id: creator._id, name:creator.name}
      })
    })
  .catch(err=>{
    console.log(err);
    if(!err.statusCode){
      err.status = 500;
    }
    next(err)
  })
};

exports.getPost = (req,res,next)=>{
  const postId = req.params.postId;
  Post.findById(postId)
  .then(post=>{
    if(!post){
      const error = new Error('could not find post')
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ message: 'post fetched', post:post})
  })
  .catch(err=>{
    if(!err.statusCode)
      err.status = 500;
    next(err);
  })
}

exports.updatePost = (req,res,next)=>{
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl;
  const errors = validationResult(res);

  if(!errors.isEmpty()){
    const error = new Error('validation failed')
    error.statusCode = 422;
    throw error;
  }

  if(req.file){
    imageUrl = req.file.path.replace('\\','/');
  }

  if(!imageUrl){
    const error = new Error('no file picked')
    error.statusCode = 422;
    throw error;
  }

  Post.findById(postId)
  .then(post=> {
    if(!post){
      const error = new Error('could not fins post')
      error.statusCode = 404;
      throw error;
    }
    if(imageUrl !== post.imageUrl){
      clearImage(post.imageUrl)
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    return post.save()
  })
  .then(result=>{
    res.status(200).json({message: 'post updated', post: result})
  })
  .catch(err=>{
    if(!err.statusCode)
    err.status = 500;
    next(err);
  })

}
exports.deletePost = (req,res,next)=>{
  const postId =  req.params.postId;
  console.log(postId);
  Post.findById(postId)
  .then(post=>{
    if(!post){
      const error = new Error('could not find post.')
      error.statusCode = 404;
      throw error;
    }
    clearImage(post.imageUrl)
    return Post.findByIdAndRemove(postId)
  }).then(()=>{
    res.status(200).json({message: 'post deleted'})
  })
  .catch(err=>{
    if(!err.statusCode){
      err.status = 500;
    }
    next(err)
  })

}
const clearImage = (filepath)=>{
  filepath = path.join(__dirname, '../', filepath)
  fs.unlink(filepath, err=>{
    console.log(err);
  })
  
}