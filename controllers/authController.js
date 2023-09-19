const User = require("../models/userModel.js");
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

      const { name, email, dob, contactNumber } = req.body
      
      //VALIDATE REQUEST BODY
      if (!name || !email || !dob || !department || !contactNumber){
          return res.status(400).json({success:false, message:"Probably you have missed certain fields"})
      }

      const admin = await Admin.findOne({ email })
      if (admin) {
          return res.status(400).json({success:false, message:"Email already exist"})
      }
      const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' })
      let departmentHelper;
      if (department === "C.S.E") {
          departmentHelper = "01"
      }
      else if (department === "E.C.E") {
          departmentHelper = "02"
      }
      else if (department === "I.T") {
          departmentHelper = "03"
      }
      else if (department === "Mechanical") {
          departmentHelper = "04"
      }
      else if (department === "Civil") {
          departmentHelper = "05"

      }
      else if (department === "E.E.E") {
          departmentHelper = "06"
      }
      else {
          departmentHelper = "00"
      }

      const admins = await Admin.find({ department })
      let helper;
      if (admins.length < 10) {
          helper = "00" + admins.length.toString()
      }
      else if (students.length < 100 && students.length > 9) {
          helper = "0" + admins.length.toString()
      }
      else {
          helper = admins.length.toString()
      }
      let hashedPassword;
      hashedPassword = await bcrypt.hash(dob, 10)
      var date = new Date();
      const joiningYear = date.getFullYear()
      var components = [
          "ADM",
          date.getFullYear(),
          departmentHelper,
          helper
      ];

      var registrationNumber = components.join("");
      const newAdmin = await new Admin({
          name,
          email,
          password: hashedPassword,
          joiningYear,
          registrationNumber,
          department,
          avatar,
          contactNumber,
          dob,
      })
      await newAdmin.save()
      return res.status(200).json({ success: true, message: "Admin registerd successfully", response: newAdmin })

})