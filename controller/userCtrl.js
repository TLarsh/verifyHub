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
        res.status(200).json({
            message : "Login successful.",
            accessToken : generateToken(findUser._id),
            user : {
                _id : findUser._id,
                name : findUser.name,
                email : findUser.email,
                role : findUser.role,
            },
        });
    } else {
        throw new Error({message:'Invalid Credentials',});
    };
});

const getallUsers = asyncHandler ( async (req, res) => {
    try {
        const users = await User.find().sort('-createdAt');
        res.json(users);
    } catch (error) {
        throw new Error(error.message);
    };
});

const getaUser = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const user = await User.findById(id);
        res.json(user);
    } catch (error) {
        throw new Error(error.message);
    };
});

const deleteaUser = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const deletedUser = await User.findByIdAndDelete(id);
        res.json(deletedUser);
    } catch (error) {
        throw new Error(error.message);
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
        throw new Error(error.message);
    }
});

// Update User password ==============================================

const updatePassword = asyncHandler (async (req, res) => {
    const { id } = req.user;
    const { password } = req.body;
    console.log({password:password})
    const user = await User.findById(id);
    if (password){
        user.password = password;
        const changedPassword = await user.save();
        res.status(200).json(changedPassword)
    } else {
        res.status(400).json({error:"field cannot be blank"})
    }
});

const deactivateUser = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const deactivatedUser = await User.findByIdAndUpdate(id, {
            isActive: false
        },{
            new:true
        });
        res.json (deactivatedUser);
    } catch (error) {
        throw new Error(error.message);
    }
});

const activateUser = asyncHandler (async (req, res) => {
    const {id} = req.params;
    validateMongoDbId(id);
    try {
        const activatedUser = await User.findByIdAndUpdate(id, {
            isActive : true,
        },{
            new:true,
        });
        res.json(activatedUser);
    } catch (error) {
        throw new Error(error.message);
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



// Genetate a forget password token and send a reset link to the user email ==============

const forgotPasswordToken = asyncHandler(async(req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this email");
    const token = await user.createPasswordResetToken()
    await user.save();
    const resetURL = `Hi, Please follow the reset link to reset your password. Valid for 10min from now. < href='http://localhost:8000/api/user/password-reset/${token}'>Click Here</>`;
       const data = {
           to: email,
           text: "Hey User",
           subbject: "Forgot Password Link",
           html: resetURL,
       };
       sendEmail(data);
       res.json(data);
    try {
    } catch(error) {
       throw new Error(error.message);
    }
});

// Reset user password ==========================================

const resetPassword = asyncHandler(async(req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error("Token Expired, Please try again later");
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    return res.json(user);
});




module.exports = { 
    createUser, 
    loginUserCtrl, 
    getaUser, 
    getallUsers, 
    deleteaUser, 
    updateaUser, 
    deactivateUser, 
    activateUser, 
    handleRefreshToken, 
    forgotPasswordToken,
    resetPassword,
};