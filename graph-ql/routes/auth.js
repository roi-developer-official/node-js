const express = require('express')
const {body}  = require('express-validator')
const authContoller = require('../controllers/auth')
const User = require('../models/user')
const router = express.Router();

router.put('/signup',[
    body('email').isEmail().withMessage('please enter a vald email')
    .custom((value, {req}) => {
        User.findOne({email: value}).then(userDoc=>{
            if(userDoc){
                return Promise.reject('email already exists');
            }
        })}).normalizeEmail(),
        body('password').trim().isLength({min: 5}),
        body('name').trim().notEmpty()
], authContoller.signup)

router.post('/login', authContoller.login)

module.exports = router