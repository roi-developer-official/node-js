const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const csrf = require('csurf')
const flash = require('connect-flash')
const session = require('express-session')
const mongodbStore = require('connect-mongodb-session')(session)

const errorController = require('./controllers/error');

const User = require('./models/user');

const mongodbUri = 'mongodb+srv://me:RSJs9Zh8vPpjmpNo@cluster0.hj96h.mongodb.net/shop?retryWrites=true&w=majority'

const app = express();
const csrfProtection = csrf()
const store = new mongodbStore({
  uri: mongodbUri,
  collection: 'sessions'
})

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
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
    req.user = user
    next()
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

app.use(errorController.get404);

mongoose
  .connect(
    mongodbUri
  )
  .then(() => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });