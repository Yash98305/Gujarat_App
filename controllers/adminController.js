const Attendance = require("../models/attendenceModel.js");
const Admin = require("../models/adminModel.js");
const catchAsyncErrors = require("../middlewares/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js")
const sendToken = require("../jwtToken/jwtTokenAdmin.js")
const sendEmail = require("../utils/nodemailer.js")
const Faculty = require ( "../models/facultyModel.js")
const Student = require ( "../models/studentModel.js")
exports.addAdminController = catchAsyncErrors(async (req, res, next) => {
    const adminid = await Admin.findById(req.admin._id);
    let school = adminid.school;
        let { name, email, dob, phone,aadhaar,gender,registrationNumber } = req.body
        if (!name || !email || !dob || !phone || !aadhaar || !gender ||!registrationNumber){
            return next(new ErrorHandler("Probably you have missed certain fields", 400));
        }
        let date = new Date();
        let joiningYear = date.getFullYear()
        let components = [
            "ADM",
            joiningYear,
            school.toString().substring(0, 4),
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
        res.status(201).json({
            success:true,
            newAdmin : newAdmin
          })    
})
exports.addFacultyController = catchAsyncErrors(async (req, res, next) => {
    const adminid = await Admin.findById(req.admin._id);
    let school = adminid.school;
        let { name, email, phone,registrationNumber,
            aadhaar, dob, gender,address } = req.body
            if (!name || !email || !dob || !phone || !aadhaar || !gender ||!registrationNumber || !address){
                return next(new ErrorHandler("Probably you have missed certain fields", 400));
            }
        let date = new Date();
        let joiningYear = date.getFullYear()
        let components = [
            "FAC",
            joiningYear,
            school.toString().substring(0, 4),
            registrationNumber
        ];
         registrationNumber = components.join("");
         const faculty = await Faculty.findOne({ registrationNumber })
         if (faculty) {
            return next(new ErrorHandler("Registration Number Already exist", 400));
         }
const newFaculty = await new Faculty({
            name,
            email,
            address,
            password: phone,
            phone,
            gender,
            aadhaar,
            registrationNumber,
            dob,
            school,
            joiningYear
        })
        await newFaculty.save()
        res.status(201).json({
            success:true,
            newFaculty : newFaculty
          })    
        })
exports.addStudentController = catchAsyncErrors( async (req, res, next) => {
    const adminid = await Admin.findById(req.admin._id);
    let school = adminid.school;
        let { name,email, grade, fatherName, aadhaar,registrationNumber,
            gender, section, dob, phone,caste,
            fatherphone } = req.body
            if (!name || !grade || !email || !fatherName || !phone || !aadhaar || !gender ||!registrationNumber || !caste || !dob || !section || !fatherphone){
                return next(new ErrorHandler("Probably you have missed certain fields", 400));

            }
       let date = new Date();
        let batch = date.getFullYear()
        let components = [
            "STU",
            batch,
            school.toString().substring(0, 4),
            registrationNumber 
        ];
         registrationNumber = components.join("");
         const students = await Student.findOne({ registrationNumber })
         if (students) {
            return next(new ErrorHandler("Registration Number Already exist", 400));
         }
        const newStudent = await new Student({
            name,
            email,
            password: phone,
            grade,
            fatherName,
            aadhaar,
            gender,
            registrationNumber,
            caste,
            section,
            batch,
            dob,
            school,
            phone,
            fatherphone
        })
        await newStudent.save()
        res.status(201).json({
            success:true,
            newStudent : newStudent
          })    
})
exports.adminLoginController = catchAsyncErrors(async (req, res, next) => { 
    const { registrationNumber, password } = req.body;
    const admin = await Admin.findOne({ registrationNumber }).select("+password");
    if (!admin) {
        return next (new ErrorHandler("Registration number not found",404));
    }
    const isPasswordMatched = await admin.comparePassword(password)
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Credentials", 401));
    }
    sendToken(admin, 200, res);
})
exports.getAdminDetails = catchAsyncErrors(async (req, res, next) => {
    const admin = await Admin.findById(req.admin._id);
    res.status(200).json({
      success: true,
      admin,
    });
  });
  exports.postOTPController = catchAsyncErrors(async (req, res, next) => {
    const { email, otp, newPassword, conformPassword } = req.body;
    if (newPassword !== conformPassword) {
      return next(new ErrorHandler("Password Mismatch", 400));
    }
    const admin = await Admin.findOne({ email });
    if (admin.otp !== otp) {
      return next(new ErrorHandler("Invalid OTP, check your email again", 400));
    }
    admin.password = newPassword;
    await admin.save();
    sendToken(admin, 200, res);
  });
  exports.forgotPasswordController = catchAsyncErrors(async (req, res, next) => {
    const admin = await Admin.findOne({ email: req.body.email });
    if (!admin) {
      return next(new ErrorHandler("Admin not found", 404));
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
    admin.otp = OTP;
    await admin.save();
    await sendEmail(admin.email, OTP, "OTP");
    res.status(200).json({
      success: true,
      message: "check your registered email for OTP",
    });
    const helper = async () => {
        admin.otp = "";
      await admin.save();
    };
    setTimeout(function () {
      helper();
    }, 300000);
  });

  exports.getActiveStudentsController = catchAsyncErrors(async(req,res,next)=>{
    const adminid = await Admin.findById(req.admin._id);
    let schools = adminid.school;
    const attendences = await Attendance.find(
      { status: "Active" },
      {  status: 1,count : 1}
    ).populate({
      path: "student"
    })
    const maleStudents = attendences.filter(attendance => attendance.student.school.toString() === schools.toString());
      res.json({
        maleStudents,
        l:maleStudents.length
      })
  })
  exports.getDeactiveStudentsController = catchAsyncErrors(async(req,res,next)=>{
    const adminid = await Admin.findById(req.admin._id);
    let schools = adminid.school;
    const attendences = await Attendance.find(
      { status: "Deactive" },
      {  status: 1,count : 1}
    ).populate({
      path: "student"
    })
    const maleStudents = attendences.filter(attendance => attendance.student.school.toString() === schools.toString());
      res.json({
        maleStudents,
        l:maleStudents.length
      })
  })