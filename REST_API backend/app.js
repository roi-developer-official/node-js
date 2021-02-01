const express = require('express');
const bodyParser = require('body-parser');
const mongoose =  require('mongoose')
const path = require('path')
const multer = require("multer")
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth')
const app = express();
const {v4: uuidv4} = require('uuid')
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

const fileStorage = multer.diskStorage({
    destination: (req,file,cb)=>{
        cb(null,'images')
    },
    filename: (req,file,cb)=>{
        cb(null, uuidv4())
    }
})

const fileFilter = (req,file,cb)=>{
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpeg'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}

app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);

app.use((error,req,res,next)=>{
    const status = error.statusCode || 500
    const message = error.message;
    res.status(status).json({mesasge: message})
})

mongoose.connect('mongodb+srv://me:etnVVOw1DRG6akJV@cluster0.hj96h.mongodb.net/posts?retryWrites=true&w=majority').then(()=>{
    console.log('connented');
    app.listen(8080);
})
