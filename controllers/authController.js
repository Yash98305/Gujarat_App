const User = require("../models/userModel.js");
const Student = require("../models/studentModel.js");
const Admin = require("../models/adminModel.js");
const Attendance = require("../models/attendenceModel.js");
const Personal = require("../models/personalModel.js");
const Educational = require("../models/educationalModel.js");
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
    const attendences = await Attendance.find(
      { status: "Active" },
      {  status: 1, gender: 1}
    ).populate({
      path: "student"
    })
    const deattendences = await Attendance.find(
      { status: "Deactive" },
      {  status: 1, gender: 1}
    ).populate({
      path: "student"
    })
    const maleStudents = attendences.filter(attendance => attendance.student.gender === 'male');
    const femaleStudents = attendences.filter(attendance => attendance.student.gender === 'female');
    const demaleStudents = deattendences.filter(attendance => attendance.student.gender === 'male');
    const defemaleStudents = deattendences.filter(attendance => attendance.student.gender === 'female');


    const total = maleStudents.length+femaleStudents.length+defemaleStudents+demaleStudents;

    res.json({
      male:maleStudents,
      female:femaleStudents,
      activefemale: femaleStudents.length,
      activemale: maleStudents.length,
              deactivefemale: defemaleStudents.length,
              deactivemale: demaleStudents.length,
      activefemaleper: (femaleStudents.length / total) * 100,
      activemaleper: (maleStudents.length / total) * 100,  
              deactivefemaleper: (defemaleStudents.length / total) * 100,
              deactivemaleper: (demaleStudents.length / total) * 100,

    });
  }
);

exports.getStatusByCasteController = catchAsyncErrors(
  async (req, res, next) => {
    const attendences = await Attendance.find(
      { status: "Active" },
      {  status: 1, caste: 1}
    ).populate({
      path: "student"
    })
    const deattendences = await Attendance.find(
      { status: "Deactive" },
      {  status: 1, caste: 1}
    ).populate({
      path: "student"
    })
    const obcStudents = attendences.filter(attendance => attendance.student.caste === 'obc');
    const scstStudents = attendences.filter(attendance => attendance.student.caste === 'sc/st');
    const generalStudents = attendences.filter(attendance => attendance.student.caste === 'general');
    const deobcStudents = deattendences.filter(attendance => attendance.student.caste === 'obc');
    const descstStudents = deattendences.filter(attendance => attendance.student.caste === 'sc/st');
    const degeneralStudents = deattendences.filter(attendance => attendance.student.caste === 'general');


    const total = obcStudents.length+scstStudents.length+generalStudents.length+deobcStudents.length+descstStudents.length+degeneralStudents.length;
       res.json({
        total : total,
      activeobc: obcStudents.length,
      activegeneral: generalStudents.length,
      activestsc: scstStudents.length,
      deactiveobc: deobcStudents.length,
      deactivegeneral: degeneralStudents.length,
      deactivestsc: descstStudents.length,
      activeobcper: (obcStudents.length / total) * 100,
      activegeneralper: (generalStudents.length / total) * 100,
      activestscper: (scstStudents.length / total) * 100,
      deactiveobcper: (deobcStudents.length / total) * 100,
      deactivegeneralper: (degeneralStudents.length / total) * 100,
      deactivestscper: (descstStudents.length / total) * 100,
    });
  }
);




// exports.getStatusByCasteController = catchAsyncErrors(
//   async (req, res, next) => {
//     const activeobc = await Student.find({ status: "Active", caste: "obc" });
//     const activegeneral = await Student.find({
//       status: "Active",
//       caste: "general",
//     });
//     const activestsc = await Student.find({ status: "Active", caste: "st/sc" });
//     const deactiveobc = await Student.find({
//       status: "Deactive",
//       caste: "obc",
//     });
//     const deactivegeneral = await Student.find({
//       status: "Deactive",
//       caste: "general",
//     });
//     const deactivestsc = await Student.find({
//       status: "Deactive",
//       caste: "st/sc",
//     });
//     const total =
//       activeobc.length +
//       activegeneral.length +
//       activestsc.length +
//       deactiveobc.length +
//       deactivegeneral.length +
//       deactivestsc.length;
//     res.json({
//       activeobc: activeobc.length,
//       activegeneral: activegeneral.length,
//       activestsc: activestsc.length,
//       deactiveobc: deactiveobc.length,
//       deactivegeneral: deactivegeneral.length,
//       deactivestsc: deactivestsc.length,
//       activeobcper: (activeobc.length / total) * 100,
//       activegeneralper: (activegeneral.length / total) * 100,
//       activestscper: (activestsc.length / total) * 100,
//       deactiveobcper: (deactiveobc.length / total) * 100,
//       deactivegeneralper: (deactivegeneral.length / total) * 100,
//       deactivestscper: (deactivestsc.length / total) * 100,
//     });
//   }
// );
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


exports.getSchoolStatusController = catchAsyncErrors(
  async (req, res, next) => {
    const attendences = await Attendance.find(
      { status: "Active" },
      { name: 1, status: 1, gender: 1, caste: 1 }
    ).populate({
      path: "student",
      populate:{
      path: "school",
      model: "School",
      populate: {
        path: "block",
        model: "Block",
        populate: {
          path: "district",
          model: "District",
        },
      },
      },
    });
    res.json({
      attendences,
      total: attendences.length,
    });
  }
);


const District = require('../models/districtModel.js')
const Block = require('../models/blockModel.js')
const School = require('../models/schoolModel.js')

exports.getDistrict = catchAsyncErrors(async(req,res,next)=>{
const district = await District.find({});
res.status(200).json({
  success:true,
  district
})
})
exports.getBlock = catchAsyncErrors(async(req,res,next)=>{
  const {district} = req.body
  const block = await Block.find({district});
  res.status(200).json({
    success:true,
    block
  })
})
exports.getSchool = catchAsyncErrors(async(req,res,next)=>{
  const {block} = req.body
  const school = await School.find({block});
  res.status(200).json({
    success:true,
    school
  })
})



// anant university database
exports.personals = catchAsyncErrors(async(req,res,next)=>{
  const newPersonal = new Personal({
...req.body  })

  await newPersonal.save();
  return res.status(201).json({ 
    success: true,
    message: 'personal details submitted successfully' ,
    newPersonal
  });
})


exports.educationals=catchAsyncErrors(async(req,res,next)=>{
  const educational= new Educational({
  ...req.body
  });
  await res.status(201).json({
  success:true,
  message:'eduacation details successfully submitted',
  educational
  });
  })