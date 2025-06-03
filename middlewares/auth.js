const { getUser } = require('../services/auth')

async function restrictToLoggedinUser(req, res, next) {

    const token = req.cookies?.uid;

    if(!token){
        return res.status(401).json({message: "not authenticated"})
    }
    const user = getUser(token)
    if(!user){
        
        return res.status(401).json({message: "not authenticated"})

    }
    req.user = user;
    next();

}


module.exports = {
    restrictToLoggedinUser,
}