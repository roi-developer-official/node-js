const User = require('../models/user')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator/check')

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')

  if(message.length > 0){
    message = message[0]
  } else {
    message = null
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage : message
  });
};

//1:find a user by his email
//2: if there is a user compare the password
//3: store a session for the user
exports.postLogin = (req, res, next) => {
  const {email,password} = req.body
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      errorMessage : errors.array()[0].msg
    });
  }
  User.findOne({email: email})
  .then(user => {
    if(!user){
      req.flash('error', 'Invalid email or password')
      return res.redirect('/login')
    }
    bcrypt.compare(password,user.password)
    .then(doMatch=>{
      if(doMatch){
        req.session.user = user
        req.session.isLoggedIn = true
        return req.session.save(err=>{
          console.log(err);
          return res.redirect("/")
        })
      }
        req.flash('error', 'Invalid email or password')
        res.redirect('/login') 
    })
    .catch(er=>{
      res.redirect('/login')
      console.log(er)
    })
  })
  .catch(err => console.log(err));
};


exports.getSignup = (req, res, next) => {
  let message = req.flash('error')
  if(message.length > 0){
    message = message[0]
  } else {
    message = null
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {email : '', password : '', confirmPassword: ''}
  });
};

//1:extract information from the request
//2:check if a user with this email already exists (moved to the middleware in routes)
//3:create a new user
exports.postSignup = (req, res, next) => {
  const {email, password} = req.body
  const errors = validationResult(req)
  if(!errors.isEmpty()){
    console.log(errors.array()[0]);
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email, 
        password, 
        confirmPassword: req.body.confirmPassword}
    }); 
  }
  User.findOne({email: email}).then(()=>{
      return bcrypt.hash(password, 12)
      .then(hashedPassword=>{
        const user = new User({
          email: email, 
          password: hashedPassword,
          cart:{ items: []}
        })
        return user.save();
      }).then(()=>{
        res.redirect("/login")
      })
  })
  .catch((er)=>console.log(er))
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};




