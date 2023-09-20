const mongoose = require('mongoose')
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");


const facultySchema = new mongoose.Schema({
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
     // photo: {
  //   data: Buffer,
  //   contentType: String,
  // },
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
    address: {
        type: String,
        required: true
    },
   
    phone: {
        type: Number
    },
    role: {
        type: String,
        default: "faculty",
      },
    
    joiningYear: {
        type: Number,
        required: true 
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    subjectsCanTeach: [{
        type: String
    }],
    
    resetPasswordToken: String,
      resetPasswordExpire: Date,
})



facultySchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
  
    this.password = await bcrypt.hash(this.password, 10);
  });
  
  // JWT TOKEN
  facultySchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: 3600,
    });
  };
  
  // Compare Password
  
  facultySchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  
  // Generating Password Reset Token
  facultySchema.methods.getResetPasswordToken = function () {
    // Generating Token
    const resetToken = crypto.randomBytes(20).toString("hex");
  
    // Hashing and adding resetPasswordToken to userSchema
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  
    return resetToken;
  };
module.exports = mongoose.model('Faculty', facultySchema)
