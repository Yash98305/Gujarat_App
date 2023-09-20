const User = require("../models/userModel.js");
const Admin = require("../models/adminModel.js");
const catchAsyncErrors = require("../middlewares/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js")
const sendToken = require("../jwtToken/jwtTokenAdmin.js")
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail.js")
const Faculty = require ( "../models/facultyModel.js")
const Student = require ( "../models/studentModel.js")

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


exports.addFacultyController = catchAsyncErrors(async (req, res, next) => {
  
      
        let { name, email, phone,registrationNumber,school,
            aadhaar, dob, gender,address } = req.body
       
            if (!name || !email || !dob || !phone || !aadhaar || !gender || !school ||!registrationNumber || !address){
                return next(new ErrorHandler("Probably you have missed certain fields", 400));
            }
        
        let date = new Date();
        let joiningYear = date.getFullYear()

        let components = [
            "FAC",
            joiningYear,
            school.substring(0, 4),
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
        sendToken(newFaculty, 201, res);
    })


exports.addStudentController = catchAsyncErrors( async (req, res, next) => {
  
       
        let { name, grade, fatherName, aadhaar,registrationNumber,
            gender, section, dob, phone,caste,
            fatherphone,school } = req.body

            if (!name || !grade || !fatherName || !phone || !aadhaar || !gender || !school ||!registrationNumber || !caste || !dob || !section || !fatherphone){
                return next(new ErrorHandler("Probably you have missed certain fields", 400));

            }
       let date = new Date();
        let batch = date.getFullYear()
        let components = [
            "STU",
            batch,
            school.substring(0, 4),
            registrationNumber 
        ];

         registrationNumber = components.join("");

         const students = await Student.findOne({ registrationNumber })
         if (students) {
            return next(new ErrorHandler("Registration Number Already exist", 400));
         }

        const newStudent = await new Student({
            name,
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
        sendToken(newStudent, 201, res);
    
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