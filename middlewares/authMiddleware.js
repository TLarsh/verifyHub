

const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


const authMiddleware = asyncHandler(async(req, res, next)=>{
    let token;
    if (req.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        try{
            if(token){
                const decoded = jwt.verify(token, process.env.JWT_SECRET); //verifying token
                const user = await User.findById(decoded.id);
                req.user = user; //Attach the decoded token payload to the request object
                next();  //call the middleware / controller
            }
        }catch(error){ 
            throw new Error("Not authorized token expired, Please login again")
        }
    }else{
        throw new Error('There is no token attached to header')
    }
});

const isAdmin = asyncHandler(async(req, res, next) =>{
    const {email} = req.user;
    const adminUser = await User.findOne({email});
    if(adminUser.role !== "admin"){
        throw new Error("You are not an admin")
    } else {
        next();
    }

})

module.exports = {authMiddleware, isAdmin}

