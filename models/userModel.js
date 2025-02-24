const mongoose = require('mongoose'); // Erase if already required
const bcrypt = require('bcrypt')
const crypto = require('crypto');
// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
      
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        validate: {
            validator:function (v) {
                return /^[^\s@]+@[^\s@]+.[^\s@]+$/.test(v)
            },
            message : "Invalid email format",
        }
    },
 
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        default:"user",
    },
    isActive:{
        type:Boolean,
        default:false,
    },
    refreshToken:{
        type:String,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
}, {
    timestamps:true
});

userSchema.pre("save", async function(next){
    const salt = await bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, salt)
});

userSchema.methods.isPasswordMatched = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}


userSchema.methods.createPasswordResetToken = async function(){
    const resettoken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resettoken).digest("hex");
    this.passwordResetExpires = Date.now() + 30 * 80 * 1000;  // 10 minutes
    return resettoken;
};






//Export the model
module.exports = mongoose.model('User', userSchema);



