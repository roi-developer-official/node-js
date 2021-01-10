const express = require('express')
const path = require('path')
const router = express.Router()
const rootDir = require('../util/path')
const adminData = require('./admin')
router.get('/', (req,res,next)=>{
  
    const products = adminData.products
    //using pug
    // res.render('shop', {prods: products, pageTitle : 'Shop' ,path : '/shop'})
    
    //using handlebars
    // res.render('shop', {
        //     prods: products, 
        //     pageTitle : 'Shop' , 
        //     hasProducts: products.length > 0, 
        //     activeShop : true, 
        //     productCSS:true,
        // })
        

        //using ejs
        res.render('shop', {prods: products, pageTitle : 'Shop' ,path : '/'})
        

    // using express
    // res.sendFile(path.join(rootDir,'views','shop.html'))
})

module.exports = router
