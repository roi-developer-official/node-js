const User = require('../models/user')
const bcrypt = require('bcryptjs')

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
    errorMessage: message
  });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

//1:find a user by his email
//2: if there is a user compare the password
//3: store a session for the user
exports.postLogin = (req, res, next) => {

  const {email,password} = req.body
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

//1:extract information from the request
//2:check if a user with this email already exists
//3:create a new user
exports.postSignup = (req, res, next) => {
  const {email, password, confirmPassword} = req.body
  User.findOne({email: email}).then(user=>{
    if(user){
      req.flash('error', ' email already exists')
      return res.redirect('/signup')
    } 
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


