const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const csrf = require('csurf')
const flash = require('connect-flash')
const session = require('express-session')
const mongodbStore = require('connect-mongodb-session')(session)
const multer = require("multer")
const errorController = require('./controllers/error');
const User = require('./models/user');
const mongodbUri = 'mongodb+srv://me:IkhBqFeM8SnOIjNo@cluster0.hj96h.mongodb.net/shop?retryWrites=true&w=majority'

const app = express();
const csrfProtection = csrf()
const store = new mongodbStore({
  uri: mongodbUri,
  collection: 'sessions'
})

const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, 'public/images')
  } ,
  filename: (req,file, cb)=>{
    cb(null, file.fieldname + '-' + Date.now())
  }
})
 
const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/jpg'  ){
      cb(null,true)
    }else {
      cb(null, false)
    }
}
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
// app.use(multer({dest: 'images'}).single('image'))

app.use(multer({storage: storage, fileFilter: fileFilter}).single('image'))


//serve those files as if they on the root folder
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public/images',express.static(path.join(__dirname, 'public/images')));

app.use(session({ 
  secret: 'my secret', 
  resave: false, 
  saveUninitialized: false,
  store: store
}))

app.use(csrfProtection)
app.use(flash())

app.use((req,res,next)=>{
  if(!req.session.user){
    return next()
  }
  User.findById(req.session.user._id).then(user=>{
    if(!user){
      return next()
    }
    req.user = user
    next()
  })
  .catch(er=>{
    throw new Error(er)
  })
})

app.use((req,res,next)=>{
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken()
  next()
})

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes)


app.use('/500',errorController.get500)
app.use(errorController.get404);
app.use((error, req,res,next)=>{
  res.redirect('/500')
})

mongoose
  .connect(
    mongodbUri
  )
  .then(() => {
    app.listen(3000);
  }).catch(err => err);
