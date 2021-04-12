const errorController = require("./controllers/error")
const adminRoutes = require("./routes/admin")
const shopRoutes = require("./routes/shop")
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const User = require('./models/user')
const app = express()
const mongoose = require('mongoose')

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("60042d576f3ef74820b6842c")
  .then(user=>{
    req.user = user
    next();
  })
  .catch(err=>console.log(err))
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

mongoose.connect('',{ useUnifiedTopology: true,useNewUrlParser: true  } )
.then(()=>{
  if(User.findOne().then(user=>{
    if(!user){
      new User({
        name: 'me',
        email: 'me@test.com',
        cart: {
          items:[]
        }
      }).save()
    }
  }))

  app.listen(3000)
})
.catch(err=>console.log(err))


