const User = require("../models/userModel.js");
const Student = require("../models/studentModel.js");
const Admin = require("../models/adminModel.js");
const catchAsyncErrors = require("../middlewares/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js");
const sendToken = require("../jwtToken/jwtToken.js");
const sendEmail = require("../utils/nodemailer.js");
exports.registerController = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;
  const user = await User.create({
    name,
    email,
    password,
  });
  sendToken(user, 201, res);
});

exports.loginController = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new ErrorHandler("Please Enter Email & Password", 400));
  }
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

exports.getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

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
exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    success: true,
    users,
  });
});
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
exports.updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    school: req.body.school,
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
exports.getAllStudentsController = catchAsyncErrors(async (req, res, next) => {
  const students = await Student.find({});
  if (students.length === 0) {
    return next(new ErrorHandler("No Record Found", 404));
  }
  res.status(200).json({
    result: students,
    total: students.length,
  });
});
exports.getInactiveStudentsController = catchAsyncErrors(
  async (req, res, next) => {
    const students = await Student.find(
      { status: "Deactive" },
      { name: 1, status: 1, gender: 1, cast: 1 }
    ).populate({
      path: "school",
      populate: {
        path: "block",
        model: "Block",
        populate: {
          path: "district",
          model: "District",
        },
      },
    });
    res.json({
      students,
      total: students.length,
    });
  }
);
exports.getActiveStudentsController = catchAsyncErrors(
  async (req, res, next) => {
    const students = await Student.find(
      { status: "Active" },
      { name: 1, status: 1, gender: 1, cast: 1 }
    ).populate({
      path: "school",
      populate: {
        path: "block",
        model: "Block",
        populate: {
          path: "district",
          model: "District",
        },
      },
    });
    res.json({
      students,
      total: students.length,
    });
  }
);
exports.getStatusController = catchAsyncErrors(async (req, res, next) => {
  const active = await Attendance.find({ status: "Active" });
  const deactive = await Attendance.find({ status: "Deactive" });
  const activePerc = (active.length / (active.length + deactive.length)) * 100;
  const deactivePerc =
    (deactive.length / (active.length + deactive.length)) * 100;
  res.json({
    activePerc: activePerc,
    deactivePerc: deactivePerc,
    totalActive: active.length,
    totalDeactive: deactive.length,
  });
});
exports.getStatusByGenderController = catchAsyncErrors(
  async (req, res, next) => {
    const activefemale = await Attendance.find({
      status: "Active",
      gender: "female",
    });
    const activemale = await Attendance.find({ status: "Active", gender: "male" });
    const activetrans = await Attendance.find({
      status: "Active",
      gender: "transgender",
    });
    const deactivefemale = await Student.find({
      status: "Deactive",
      gender: "female",
    });
    const deactivemale = await Student.find({
      status: "Deactive",
      gender: "male",
    });
    const deactivetrans = await Student.find({
      status: "Deactive",
      gender: "transgender",
    });
    const total =
      activefemale.length +
      activemale.length +
      activetrans.length +
      deactivefemale.length +
      deactivemale.length +
      deactivetrans.length;
    res.json({
      activefemale: activefemale.length,
      activemale: activemale.length,
      activetrans: activetrans.length,
      deactivefemale: deactivefemale.length,
      deactivemale: deactivemale.length,
      deactivetrans: deactivetrans.length,
      activefemaleper: (activefemale.length / total) * 100,
      activemaleper: (activemale.length / total) * 100,
      activetransper: (activetrans.length / total) * 100,
      deactivefemaleper: (deactivefemale.length / total) * 100,
      deactivemaleper: (deactivemale.length / total) * 100,
      deactivetransper: (deactivetrans.length / total) * 100,
    });
  }
);
exports.getStatusByCasteController = catchAsyncErrors(
  async (req, res, next) => {
    const activeobc = await Student.find({ status: "Active", caste: "obc" });
    const activegeneral = await Student.find({
      status: "Active",
      caste: "general",
    });
    const activestsc = await Student.find({ status: "Active", caste: "st/sc" });
    const deactiveobc = await Student.find({
      status: "Deactive",
      caste: "obc",
    });
    const deactivegeneral = await Student.find({
      status: "Deactive",
      caste: "general",
    });
    const deactivestsc = await Student.find({
      status: "Deactive",
      caste: "st/sc",
    });
    const total =
      activeobc.length +
      activegeneral.length +
      activestsc.length +
      deactiveobc.length +
      deactivegeneral.length +
      deactivestsc.length;
    res.json({
      activeobc: activeobc.length,
      activegeneral: activegeneral.length,
      activestsc: activestsc.length,
      deactiveobc: deactiveobc.length,
      deactivegeneral: deactivegeneral.length,
      deactivestsc: deactivestsc.length,
      activeobcper: (activeobc.length / total) * 100,
      activegeneralper: (activegeneral.length / total) * 100,
      activestscper: (activestsc.length / total) * 100,
      deactiveobcper: (deactiveobc.length / total) * 100,
      deactivegeneralper: (deactivegeneral.length / total) * 100,
      deactivestscper: (deactivestsc.length / total) * 100,
    });
  }
);
exports.addAdminByAdminController = catchAsyncErrors(async (req, res, next) => {
  let { name, email, dob, phone, aadhaar, gender, registrationNumber } =
    req.body;
  const userid = await User.findById(req.user._id);
  if (
    !name ||
    !email ||
    !dob ||
    !phone ||
    !aadhaar ||
    !gender ||
    !registrationNumber
  ) {
    return next(
      new ErrorHandler("Probably you have missed certain fields", 400)
    );
  }
  let date = new Date();
  let joiningYear = date.getFullYear();
  let school = userid.school;
  let components = [
    "ADM",
    joiningYear,
    school.toString().substring(0, 4),
    registrationNumber,
  ];
  registrationNumber = components.join("");
  const admin = await Admin.findOne({ registrationNumber });
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
    password: phone,
    school,
    aadhaar,
    gender,
  });
  await newAdmin.save();
  res.status(201).json({
    success: true,
    newAdmin: newAdmin,
  });
});
exports.postOTPController = catchAsyncErrors(async (req, res, next) => {
  const { email, otp, newPassword, conformPassword } = req.body;
  if (newPassword !== conformPassword) {
    return next(new ErrorHandler("Password Mismatch", 400));
  }
  const user = await User.findOne({ email });
  if (user.otp !== otp) {
    return next(new ErrorHandler("Invalid OTP, check your email again", 400));
  }
  user.password = newPassword;
  await user.save();
  sendToken(user, 200, res);
});

exports.forgotPasswordController = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  function generateOTP() {
    var digits = "0123456789";
    let OTP = "";
    for (let i = 0; i < 6; i++) {
      OTP += digits[Math.floor(Math.random() * 10)];
    }
    return OTP;
  }
  const OTP = await generateOTP();
  user.otp = OTP;
  await user.save();
  await sendEmail(user.email, OTP, "OTP");
  res.status(200).json({
    success: true,
    message: "check your registered email for OTP",
  });
  const helper = async () => {
    user.otp = "";
    await user.save();
  };
  setTimeout(function () {
    helper();
  }, 300000);
});