const express = require('express');
const { check , body} = require('express-validator/check');
const User = require('../models/user')

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login',[
check('email')
.isEmail()
.withMessage('please enter a valid email'),
body('password', 'please enter a valid password')
.isLength({min:5})
.isAlphanumeric()
] ,authController.postLogin);

router.post('/signup', [
check('email')
.isEmail()
.withMessage('please enter a valid email')
.custom((value, {req}) => User.findOne({email: req.body.email}).then(user=>{
        if(user)
            return Promise.reject('email already exists')
        return true;
    } 
)), 
body('password', 'please enter a valid password')
.isLength({min:5})
.isAlphanumeric(),
body('confirmPassword')
.custom((value, {req})=>{
    if(value !== req.body.password)
        throw new Error('Password have to match')
    return true;
})], authController.postSignup);

router.post('/logout', authController.postLogout);

module.exports = router;