const getDb = require('../util/database').getDb
const mongodb = require('mongodb')

class User{ 
  constructor(username , email,id, cart) {
    this.username = username
    this.email = email
    this._id = id ? new mongodb.ObjectID(id) : null
    this.cart = cart
  }

  static save(){
    const db = getDb()
    if(this._id){
      return db.collection('users').updateOne({$set : this})
    }else{
      return db.collection('users').insertOne(this)
    }
  }

  addToCart(product){
    const cartProductIndex = this.cart.items.findIndex(cp=>{
      return cp.productId.toString() === product._id.toString()
    })

    let newQuantity = 1
    const updatedCartItems = [...this.cart.items]
    if(cartProductIndex >= 0){
      console.log('object');
      newQuantity = this.cart.items[cartProductIndex].quantity + 1
      updatedCartItems[cartProductIndex].quantity = newQuantity
    }else{
      updatedCartItems.push({productId: new mongodb.ObjectID(product._id), quantity: newQuantity})
    }
    const db = getDb()
    const updatedCart = {items: updatedCartItems}
    return db.collection('users').updateOne({_id: this._id}, {$set: {
      cart: updatedCart
    }})
  }

  static findById(userId){
    const db = getDb()
    return db
    .collection('users')
    .findOne({_id: new mongodb.ObjectID(userId)})
  }

  getCart(){
    const db = getDb()
    const productsIds = this.cart.items.map(i=>{
      return i.productId
    })
    return db.collection('products').find({_id: {$in: productsIds}}).toArray().then(products=>{
      return products.map(p=>{
        return {...p, quantity: this.cart.items.find(i=>{
          return i.productId.toString() === p._id.toString()
        }).quantity
      }})
    })
  }

  deleteItemFromCart(productId){
      const updatedCartItems = this.cart.items.filter(i=>{
        return i.productId.toString() !== productId.toString()
      })
      const db = getDb()
      return db
      .collection('users')
      .updateOne({_id: new mongodb.ObjectID(this._id)}, {$set: {cart: {items: updatedCartItems}}})
  }

  addOrder(){
    const db = getDb()
    return this.getCart().then(products=>{
      const order = {
        items: products,
        user: {
          _id: new mongodb.ObjectID(this._id),
          name: this.username,
          email: this.email
        }
      }
      return db.collection('orders').insertOne(order)
    })
    .then(()=>{
      this.cart = {items: []}
      return db.collection('users')
      .updateOne(
        {_id: new mongodb.ObjectID(this._id)},
        {$set: {cart: {items: []}}}
      )
    })
  }

  getOrders(){
    const db = getDb()
    return db.collection('orders').find({'user._id': new mongodb.ObjectID(this._id)}).toArray()
  }


}

module.exports = User