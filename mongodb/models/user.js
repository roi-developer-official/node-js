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
    const cartProduct = this.cart.items.findIndex(cp=>{
      return cp.productId === product._id
    })
    let newQuantity = 1
    const db = getDb()
    const updatedCart = {items: [{productId: new mongodb.ObjectID(product._id), quantity: 1}]}
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

}

module.exports = User