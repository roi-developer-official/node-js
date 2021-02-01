const mongoos = require('mongoose')

const Schema = mongoos.Schema;

const userSchema = new Schema({
    email: {
        type:String,
        required: true
    },
    password: {
        type:String,
        required: true
    },
    name: {
        type:String,
        required: true
    },
    status: {
        type:String,
        required: true,
        default: 'i am new'
    },
    posts: [
     {   
         type:Schema.Types.ObjectId,
         ref: 'Post'
    }
    ]  

})

module.exports = mongoos.model('User', userSchema)