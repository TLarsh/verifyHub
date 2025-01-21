const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const { generateRefreshToken } = require("../config/refreshToken");
const User = require("../models/userModel");
const validateMongoDbId = require("../utils/validateMongoDbId");
const jwt = require('jsonwebtoken');

const createUser = asyncHandler( async(req, res) => {
    const email = req.body.email
    console.log(email)
    const findUser = await User.findOne({email:email})
    console.log(findUser)
    if (!findUser){
        const collectedUser = req.body
        console.log(collectedUser)
        const newUser = await User.create(req.body);
        res.json(newUser);
    }else{
        throw new Error('User already exist');
    };
});


const loginUserCtrl = asyncHandler (async (req, res) => {
    const {email, password} = req.body;
    const findUser = await User.findOne({email});
    if(findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser.id);
        const userRefreshToken = await User.findByIdAndUpdate(findUser.id,
            {
                refreshToken:refreshToken,
            },{
                new:true,
            });
        res.cookie("refreshToken", refreshToken, {
            httpOnly:true,
            maxAge:72*60*60*1000,
        });
        res.json({
            _id : findUser._id,
            name : findUser.name,
            email : findUser.email,
            accessToken : generateToken(findUser._id),
        });
    } else {
        throw new Error('Invalid Credentials');
    };
});

const getallUsers = asyncHandler ( async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        throw new Error(error);
    };
});

const getaUser = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        throw new Error(error);
    };
});

const deleteaUser = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        res.json(deletedUser);
    } catch (error) {
        throw new Error(error);
    };
});


const updateaUser = asyncHandler (async (req, res) => {
    const {id} = req.user;
    
    try {
        const updatedUser = await User.findByIdAndUpdate(id,{
            name : req.body.name,
            email : req.body.email,
        }, {
            new : true
        });
        res.json(updatedUser);
    } catch (error) {
        throw new Error(error);
    }
});

const blockUser = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const blockedUser = await User.findByIdAndUpdate(id, {
            isBlocked : true
        },{
            new:true
        });
        res.json (blockedUser);
    } catch (error) {
        throw new Error(error);
    }
});

const unblockUser = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const unblockedUser = await User.findByIdAndUpdate(id, {
            isBlocked : false,
        },{
            new:true,
        });
        res.json(unblockedUser);
    } catch (error) {
        throw new Error(error);
    }
});

const handleRefreshToken = asyncHandler (async(req, res) => {
    const cookie = req.cookies;
    console.log(cookie);
    if (!cookie.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    console.log(refreshToken);
    const user = await User.findOne({refreshToken});
    if (!user) throw new Error("No refresh token present")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if(err || user.id !== decoded.id) {
            throw new Error("There is something wrong with refresh token");
        }
        const accessToken = generateToken(user.id);
        res.json({accessToken});
    });
});



module.exports = { createUser, loginUserCtrl, getaUser, getallUsers, deleteaUser, updateaUser, blockUser, unblockUser, handleRefreshToken, };