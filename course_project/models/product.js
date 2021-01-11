const { timeStamp } = require('console');
const fs = require('fs');
const path = require('path');
const Cart = require('./cart')
const main  = require.main
const p = path.join(
  path.dirname(main.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};


module.exports = class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
  
    getProductsFromFile(products => {
      if(this.id){
        const exsitingProductIndex = products.findIndex(prod=>prod.id === this.id)
        const updatedProduct = [...products]
        updatedProduct[exsitingProductIndex] = this
        fs.writeFile(p, JSON.stringify(updatedProduct), err => {
          console.log(err);
        });
      }
      else{
        this.id = Math.random().toString()
        products.push(this);
        fs.writeFile(p, JSON.stringify(products), err => {
          console.log(err);
        });
      }
    });

  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id,cb){
    getProductsFromFile(products=>{
        const product = products.find(p=> p.id === id)
        cb(product)
    })
  }

  static deleteById(id){
    getProductsFromFile(products=>{
      const product = products.find(prod=>prod.id === id)
        const updatedProducts = products.filter(p=> p.id !== id)
        fs.writeFile(p, JSON.stringify(updatedProducts), err=>{
          if(err){
              Cart.deleteProduct(id,product.price);
          }
        })
    })
  }


};
