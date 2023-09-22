const mongoose = require('mongoose')
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [30, "Name cannot exceed 30 characters"],
        minLength: [4, "Name should have more than 4 characters"],
      },
      email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"],
      },
  password: {
    type: String,
  },
  registrationNumber :{
    type: String,
    trim: true,
    unique: true,
    required: true,
  } ,
    dob: {
        type: Date
    },
    aadhaar: {
        type: Number,
        unique:true,
        required: [true, "Please Enter Your Aadhaar Number"],
        maxLength: [12, "Invalid Aadhaar"],
        minLength: [12, "Invalid Aadhaar"],
        trim: true,
      },
      gender: {
        type: String,
        enum: ["male", "female", "transgender"],
        required: true,
      },
    phone: {
        type: Number
    },
     role: {
        type: String,
        default: "admin",
      },
      
      joiningYear: {
        type: String,
        required: true 
    },
      school : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "School",
      },
    createdAt: {
        type: Date,
        default: Date.now,
      },
      otp :{
        type: String
      },
      resetPasswordToken: String,
      resetPasswordExpire: Date,
    
}, { strict: false })

adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
    this.password = await bcrypt.hash(this.password, 10);
  });
  adminSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: 3600,
    });
  };
  adminSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  adminSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000; 
    return resetToken;
  };

module.exports = mongoose.model('Admin', adminSchema)
