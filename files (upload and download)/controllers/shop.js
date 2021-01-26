const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');
const fs = require('fs')
const path = require('path')
const PDFdocument = require('pdfkit')

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err =>
      {
        const error = new Error(err)
        error.httpStatusCode = 500;
        next(error)
      });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err =>
      {
        const error = new Error(err)
        error.httpStatusCode = 500;
        next(error)
      });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err =>
      {
        const error = new Error(err)
        error.httpStatusCode = 500;
        next(error)
      });
};

exports.getCart = (req, res, next) => {
  
  req.user.populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    }).catch(err =>
      {
        const error = new Error(err)
        error.httpStatusCode = 500;
        next(error)
      });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
        return req.user.addToCart(product);
      })
    .then(() => {
      res.redirect('/cart');
    })
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err =>
      {
        const error = new Error(err)
        error.httpStatusCode = 500;
        next(error)
      });
};

exports.postOrder = (req, res, next) => {

  User.findById(req.session.user._id).then(user=>
    user.populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(() => {
        return req.user.clearCart()
    })
    .then(() => {
      res.redirect('/orders');
    })).catch(err =>
      {
        const error = new Error(err)
        error.httpStatusCode = 500;
        next(error)
      });
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    }).catch(err =>
      {
        const error = new Error(err)
        error.httpStatusCode = 500;
        next(error)
      });
};

exports.getInvoice = (req,res,next)=>{
  const orderId = req.params.orderId;
  const invoiceName =  'invoice-' + orderId + '.pdf'
  const invoicePath = path.join('data', 'invoices', invoiceName)

  Order.findById(orderId)
  .then(order=>{
    if(!order){
      return next(new Error('No order found'))
    }
    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error('Unauthorized'))
    }
    //creating a file on the fly:
    const pdfDoc = new PDFdocument()
    pdfDoc.pipe(fs.createWriteStream(invoicePath))
    pdfDoc.pipe(res)
  
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
  
    pdfDoc.fontSize(26).text('Invoice', {
      underline: true
    })
  
    pdfDoc.text('-------------')
    let totalPrice = 0;
   
    order.products.forEach(product=>{
      totalPrice += product.quantity * product.product.price;
      pdfDoc.text(product.product.title + ' - ' + product.quantity + ' x ' + '$' + product.product.price)
    })
    pdfDoc.text('total price : $' + totalPrice)
    pdfDoc.end()

  })



  //if the file is exised: way 1
  //this way is more efficient and faster (working with the browser to concatenate the chunks of the file)
  // const file = fs.createReadStream(invoicePath)
  // res.setHeader('Content-Type', 'application/pdf');
  // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"')
  // file.pipe(res)
  

  //way 2
  // fs.readFile(invoicePath , (err, file)=>{
  //   if(err){
  //     console.log(err);
  //    return next();
  //   }
  //   res.setHeader('Content-Type', 'application/pdf');
  //   res.setHeader('Content-Disposition', 'attachment; filename="fdf"')
  //   res.send(file)
  // })

}