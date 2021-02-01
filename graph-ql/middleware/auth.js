const jwt = require("jsonwebtoken")

module.exports = (req,res,next)=>{
    const authHeader = req.get('authorization');
    if(!authHeader){
        req.isAuth = false;
        return next()
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;

    try{
        decodedToken = jwt.decode(token, 'secret');

    } catch (err){
        req.isAuth = false;
        return next();
    }
    if(!decodedToken){
        req.isAuth = false;
        return next();    
    }
    req.userId = decodedToken.userId;
    req.isAuth = true;
    next()
}
