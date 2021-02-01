const User = require('../models/user')
const {validationResult}  = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


exports.signup = (req,res,next)=>{
    const {email, name, password} = req.body;
    const errors = validationResult(res)
    if(!errors.isEmpty()){
        const error = new Error('validation failed')
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    bcrypt.hash(password, 12)
    .then(hashed=>{
        return new User({
            email, 
            password: hashed,
            name: name
        }).save()
    })
    .then(result=>{
        res.status(201).json({
            message: 'user created', 
            userId: result._id
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err)
    })
}


exports.login = (req,res,next)=>{

    const {email,password} = req.body;
    let loadedUser;

    User.findOne({email:email})
    .then(user=>{
        if(!user){
            const error = new Error('email or password is incorrect');
            error.statusCode = 401;
            throw error;
         }
        loadedUser = user;
        bcrypt.compare(password, user.password)
        .then(isEqual=>{
            if(!isEqual){
                const error = new Error('email or password is incorrect');
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign({
                email:loadedUser.email,
                userId: loadedUser._id.toString()
            }, 'secret', {expiresIn: '1h'})
        res.status(200).json({token, userId: loadedUser._id.toString()})

        }).catch(err=>{
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err)
        })
    })
    .catch(err=>{
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err)
    })
}
