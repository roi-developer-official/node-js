const jwt = require("jsonwebtoken")

module.exports = (req,res,next)=>{

    const token = req.get('authorization').split(' ')[1];
    let decodedToken;
    try{
        console.log('wewe');
        decodedToken = jwt.decode(token, 'secret');
    } catch (err){
        err.statusCode = 500;
        throw err;
    }
    if(!decodedToken){
        const error = new Error('not authenticated')
        error.statusCode = 400;
        throw error;       
    }
    req.userId = decodedToken.userId;
    next()
}