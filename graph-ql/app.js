const express = require('express');
const bodyParser = require('body-parser');
const mongoose =  require('mongoose')
const path = require('path')
const multer = require("multer")
const fs = require('fs')
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth')
const app = express();

var { graphqlHTTP } = require('express-graphql');
const schema = require('./graphql/schema')
const root = require('./graphql/resolver')
const auth = require('./middleware/auth')

const {v4: uuidv4} = require('uuid')
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
app.use(bodyParser.json()); // application/json

app.use(auth);

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
const clearImage = (filepath)=>{
    filepath = path.join(__dirname, '../', filepath)
    fs.unlink(filepath, err=>{
      console.log(err);
    }) 
}
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS'){
        return res.sendStatus(200)
    }
    next();
});

app.use('/images', express.static(path.join(__dirname, 'images')))
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).single('image'))

app.put('/post-image', (req, res, next) => {
console.log('obect');
  if (!req.isAuth) {
      console.log('err 1');
    throw new Error('Not authenticated!');
  }
  if (!req.file) {
      console.log('err 2');
    return res.status(200).json({ message: 'No file provided!' });
  }

  if (req.body.oldPath) {
      console.log(req.body.oldPath);
    clearImage(req.body.oldPath);
  }
  return res
    .status(201)
    .json({ message: 'File stored.', filePath: req.file.path });
});

app.use('/feed', feedRoutes);
app.use('/auth', authRoutes);


app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
    customFormatErrorFn(err){
        if(!err.originalError){
            return err;
        }
        const data = err.originalError.data;
        const message = err.message || 'error accured';
        const code = err.originalError.statusCode || 500
        return { message , code, data }
    }
  }
  ) );


app.use((error,req,res,next)=>{
    const status = error.statusCode || 500
    const message = error.message;
    res.status(status).json({mesasge: message})
})

mongoose.connect('').then(()=>{
    console.log('connented');
    app.listen(8080);
})
