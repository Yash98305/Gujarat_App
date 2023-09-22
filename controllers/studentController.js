const Student = require("../models/studentModel.js");
const catchAsyncErrors = require("../middlewares/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js")
const sendToken = require("../jwtToken/jwtTokenStudent.js")
const Attendence = require('../models/attendenceModel.js')
const sendEmail = require("../utils/nodemailer.js")


exports.studentLoginController = catchAsyncErrors(async (req, res, next) => {
    const { registrationNumber, password } = req.body;
    const student = await Student.findOne({ registrationNumber }).select("+password");
    if (!student) {
        return next (new ErrorHandler("Registration number not found",404));
    }
    const isPasswordMatched = await student.comparePassword(password)
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Credentials", 401));
    }
    sendToken(student, 200, res);
})

exports.checkAttendenceController= catchAsyncErrors(async(req,res,next)=>{
  const studentId = await Student.findById(req.student._id);
  const attendence = await Attendence.find({ student: studentId })
  if (!attendence) {
      res.status(400).json({ message: "Attendence not found" })
  }
  res.status(200).json({
      result: attendence.map(att => {
          let res = {};
          res.attendence = ((att.lectureAttended / att.totalLecturesByFaculty) * 100).toFixed(2)
          res.absentHours = att.totalLecturesByFaculty - att.lectureAttended
          res.lectureAttended = att.lectureAttended
          res.totalLecturesByFaculty = att.totalLecturesByFaculty
          return res
      })
  })
})

exports.getStudentDetailsController = catchAsyncErrors(async (req, res, next) => {
    const student = await Student.findById(req.student._id);
    res.status(200).json({
      success: true,
      student,
    });
  })

  exports.postOTPController = catchAsyncErrors(async (req, res, next) => {
    const { email, otp, newPassword, conformPassword } = req.body;
    if (newPassword !== conformPassword) {
      return next(new ErrorHandler("Password Mismatch", 400));
    }
    const student = await Student.findOne({ email });
    if (student.otp !== otp) {
      return next(new ErrorHandler("Invalid OTP, check your email again", 400));
    }
    student.password = newPassword;
    await student.save();
    sendToken(student, 200, res);
  });
  exports.forgotPasswordController = catchAsyncErrors(async (req, res, next) => {
    const student = await Student.findOne({ email: req.body.email });
    if (!student) {
      return next(new ErrorHandler("Student not found", 404));
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
    student.otp = OTP;
    await student.save();
    await sendEmail(student.email, OTP, "OTP");
    res.status(200).json({
      success: true,
      message: "check your registered email for OTP",
    });
    const helper = async () => {
        student.otp = "";
      await student.save();
    };
    setTimeout(function () {
      helper();
    }, 300000);
  });