const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
  },
  // photo: {
  //   data: Buffer,
  //   contentType: String,
  // },
  password: {
    type: String
  },
  grade : {
    type:String,
    enum:["III","IV","V","VI","VII","VIII","IX","X","XI","XII"],
    required : true
  },
  fatherName: {
    type: String,
    required: [true, "Please Enter Your Father Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
    minLength: [4, "Name should have more than 4 characters"],
    trim: true,
  },
  aadhaar: {
    type: Number,
    required: [true, "Please Enter Your Aadhaar Number"],
    unique: true,
    maxLength: [12, "Invalid Aadhaar"],
    minLength: [12, "Invalid Aadhaar"],
    trim: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "transgender"],
    required: true,
  },
  caste: {
    type: String,
    enum: ["general", "obc", "sc/st"],
  },
  registrationNumber: {
    type: String,
    unique: true,
  },
  section: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  phone: {
    type: Number,
    required: [true, "Please Enter Your Phone Number"],
    minLength: [10, "Invalid Contact Number"],
    maxLength: [10, "Invalid Contact Number"],
    trim: true,
  },
  fatherphone: {
    type: Number,
    required: [true, "Please Enter Your Phone Number"],
    minLength: [10, "Invalid Contact Number"],
    maxLength: [10, "Invalid Contact Number"],
    trim: true,
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  // status: {
  //   type: String,
  //   enum : ["Active","Deactive"],
  //   default : "Active"
  // },
  batch :{
    type: String
  },
  role:{
    type: String,
default : "student"
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
});


studentSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      next();
    }
  
    this.password = await bcrypt.hash(this.password, 10);
  });
  
  // JWT TOKEN
  studentSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: 3600,
    });
  };
  
  // Compare Password
  
  studentSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };
  
  // Generating Password Reset Token
  studentSchema.methods.getResetPasswordToken = function () {
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
  
  module.exports = mongoose.model("Student", studentSchema);
  