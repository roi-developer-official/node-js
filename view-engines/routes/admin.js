const express = require('express')
const router = express.Router()
const path = require('path')
const rootDir = require('../util/path')

const product = []
router.get('/add-product', (req,res,next)=>{

    //using pug
    // res.render('add-product', {pageTitle: 'Add-product', path : '/admin/add-product', pageTitle: 'Add-product'})
    
    //using handlebars
    // res.render('add-product', { 
    //     pageTitle: 'Add-product',
    //     formsCSS:true, 
    //     activeAddProduct :true,
    //     productCSS:true
    // })
    
    //using ejs
    res.render('add-product', {pageTitle: 'Add-product', path : '/admin/add-product', pageTitle: 'Add-product'})


    //using express
    // res.sendFile(path.join(rootDir, 'views', 'add-product.html'))
})

router.post('/add-product',(req,res,next)=>{
    product.push({'title' : req.body.title})
    res.redirect('/')
})

exports.routes = router
exports.products = product
