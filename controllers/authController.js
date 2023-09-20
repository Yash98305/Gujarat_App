const User = require("../models/userModel.js");
const Student = require("../models/studentModel.js");
const Attendance = require("../models/attendenceModel.js");
const School = require("../models/schoolModel.js");
const catchAsyncErrors = require("../middlewares/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js")
const sendToken = require("../jwtToken/jwtToken.js")
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail.js")

// Register a User
exports.registerController = catchAsyncErrors(async (req, res, next) => {

 

    const { name, email, password} = req.body;
    
    const user = await User.create({
      name,
      email,
      password,
     
    });

    sendToken(user, 201, res);
  });

// Login User
exports.loginController = catchAsyncErrors(async (req, res, next) => {

    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ErrorHandler("Please Enter Email & Password", 400));
    }
    //check user
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password", 401));
    }
  
    sendToken(user, 200, res);
  });

//Forgotpassword
exports.forgotPasswordController = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  //get resetpassword token
  const resetToken = user.getResetPasswordToken();
  await user.save({validateBeforeSave:false})

  const resetPasswordUrl = `${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetToken}`

  const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email then please ignore it`
try {
  
  await sendEmail({
email:user.email,
subject : `----change in auth controller----`,
message
  })
res.status(200).json({
  success: true,
  message:`Email sent to ${user.email} successfully`
})

} catch (error) {
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save({validateBeforeSave:false})
return next(new ErrorHandler(error.message,500))
}
})

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
  // creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ErrorHandler(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.conformPassword) {
    return next(new ErrorHandler("Password does not password", 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Get User Detail
exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// update User password
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.conformPassword) {
    return next(new ErrorHandler("password does not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// update User Profile
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

 

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Get all users(admin)
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

// Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// update User Role -- Admin
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
  });
});

// Delete User --Admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
    );
  }


  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User Deleted Successfully",
  });
});











// Logout User
exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged Out",
  });
});

exports.addAdminController = catchAsyncErrors(async (req, res, next) => {

  let { name, email, dob, phone,aadhaar,gender,school,registrationNumber } = req.body
  
  //VALIDATE REQUEST BODY
  if (!name || !email || !dob || !phone || !aadhaar || !gender || !school ||!registrationNumber){
      return next(new ErrorHandler("Probably you have missed certain fields", 400));
  }

  let date = new Date();
  let joiningYear = date.getFullYear()

  let components = [
      "ADM",
      joiningYear,
      school.substring(0, 4),
      registrationNumber
  ];

   registrationNumber = components.join("");

   const admin = await Admin.findOne({ registrationNumber })
   if (admin) {
      return next(new ErrorHandler("Registration Number Already exist", 400));
   }


  const newAdmin = await new Admin({
      name,
      email,
      joiningYear,
      registrationNumber,
      phone,
      dob,
      password : aadhaar,
      school,
      aadhaar,
      gender
  })
  await newAdmin.save()
  sendToken(newAdmin, 201, res);
})


exports.getAllStudentsController = catchAsyncErrors( async(req,res,next)=>{
  const students = await Student.find({})
            if (students.length === 0) {
              return next( new ErrorHandler("No Record Found", 404)) 
            }
            res.status(200).json({ 
              result: students ,
            total : students.length 
          })
})



exports.getInactiveStudentsController = catchAsyncErrors(async(req,res,next)=>{
  
    const students = await Student.find({status:"Deactive"},{name:1,status :1,gender:1,cast:1})
      .populate({
        path: 'school',
        populate: {
          path: 'block',
          model: 'Block',
          populate: {
            path: 'district',
            model: 'District'
          }
        }
      })
    res.json({
     students,
     total : students.length
    }) 
})


exports.getActiveStudentsController = catchAsyncErrors(async(req,res,next)=>{
  
    const students = await Student.find({status:"Active"},{name:1,status :1,gender:1,cast:1})
      .populate({
        path: 'school',
        populate: {
          path: 'block',
          model: 'Block',
          populate: {
            path: 'district',
            model: 'District'
          }
        }
      })
    res.json({
     students,
     total : students.length
    }) 
})

exports.getStatusController = catchAsyncErrors(async(req,res,next)=>{
  
    const active = await Student.find({status:"Active"})
    const deactive = await Student.find({status:"Deactive"})
    const activePerc = (active.length/(active.length+deactive.length))*100
    const deactivePerc = (deactive.length/(active.length+deactive.length))*100
    res.json({
      activePerc:activePerc,
      deactivePerc:deactivePerc,
     totalActive : active.length,
     totalDeactive: deactive.length
    }) 
})


exports.getStatusByGenderController = catchAsyncErrors(async(req,res,next)=>{
  
    const activefemale = await Student.find({status:"Active",gender:"female"})
    const activemale = await Student.find({status:"Active",gender:"male"})
    const activetrans = await Student.find({status:"Active",gender:"transgender"})
    const deactivefemale = await Student.find({status:"Deactive",gender:"female"})
    const deactivemale = await Student.find({status:"Deactive",gender:"male"})
    const deactivetrans = await Student.find({status:"Deactive",gender:"transgender"})
  const total = activefemale.length+activemale.length+activetrans.length+deactivefemale.length+deactivemale.length+deactivetrans.length
    res.json({
      activefemale:activefemale.length,
      activemale:activemale.length,
      activetrans:activetrans.length,
      deactivefemale:deactivefemale.length,
      deactivemale:deactivemale.length,
      deactivetrans:deactivetrans.length,

      activefemaleper:(activefemale.length/total)*100,
      activemaleper:(activemale.length/total)*100,
      activetransper:(activetrans.length/total)*100,
      deactivefemaleper:(deactivefemale.length/total)*100,
      deactivemaleper:(deactivemale.length/total)*100,
      deactivetransper:(deactivetrans.length/total)*100
   
    }) });


exports.getStatusByCasteController = catchAsyncErrors(async(req,res,next)=>{
  
    const activeobc = await Student.find({status:"Active",caste:"obc"})
    const activegeneral = await Student.find({status:"Active",caste:"general"})
    const activestsc = await Student.find({status:"Active",caste:"st/sc"})
    const deactiveobc = await Student.find({status:"Deactive",caste:"obc"})
    const deactivegeneral = await Student.find({status:"Deactive",caste:"general"})
    const deactivestsc = await Student.find({status:"Deactive",caste:"st/sc"})
  const total = activeobc.length+activegeneral.length+activestsc.length+deactiveobc.length+deactivegeneral.length+deactivestsc.length
    res.json({
      activeobc:activeobc.length,
      activegeneral:activegeneral.length,
      activestsc:activestsc.length,
      deactiveobc:deactiveobc.length,
      deactivegeneral:deactivegeneral.length,
      deactivestsc:deactivestsc.length,

      activeobcper:(activeobc.length/total)*100,
      activegeneralper:(activegeneral.length/total)*100,
      activestscper:(activestsc.length/total)*100,
      deactiveobcper:(deactiveobc.length/total)*100,
      deactivegeneralper:(deactivegeneral.length/total)*100,
      deactivestscper:(deactivestsc.length/total)*100
   
    }) 


});

