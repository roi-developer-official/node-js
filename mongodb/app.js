const errorController = require("./controllers/error");
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const User = require('./models/user')
const mongoConnent = require('./util/database').mongoConnent
const app = express();


app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("600035105e42c03b346949a7")
  .then(user=>{
    req.user = new User(user.name, user.email, user._id, user.cart)
    next();
  })
  .catch(err=>console.log(err))
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);



mongoConnent(client=>{
  app.listen(3000)
})


