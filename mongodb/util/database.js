const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient

let _db;
const mongoConnent = (callback)=>{
    MongoClient.connect(``, { useUnifiedTopology: true })
    .then((client)=>{
        _db = client.db()
        callback(client)
    })
    .catch(err=>
        {
            throw err;
        })
}

const getDb = ()=>{
    if(_db){
        return _db
    }
    throw 'Error from database'
}

exports.mongoConnent = mongoConnent;
exports.getDb = getDb