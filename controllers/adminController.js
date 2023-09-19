const User = require("../models/userModel.js");
const Admin = require("../models/adminModel.js");
const catchAsyncErrors = require("../middlewares/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js")
const sendToken = require("../jwtToken/jwtToken.js")
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail.js")
const Faculty = require ( "../models/facultyModel.js")
const Student = require ( "../models/studentModel.js")

exports.addAdminController = catchAsyncErrors(async (req, res, next) => {

        let { name, email, dob, phone,aadhaar,gender,school,registrationNumber } = req.body
        
        //VALIDATE REQUEST BODY
        if (!name || !email || !dob || !phone || !aadhaar || !gender || !school ||!registrationNumber){
            return res.status(400).json({success:false, message:"Probably you have missed certain fields"})
        }

        // const admin = await Admin.find({ email })
        // if (admin) {
        //     return res.status(400).json({success:false, message:"Email already exist"})
        // }
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
             return res.status(400).json({success:false, message:"Registration Number Already exist"})
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
        return res.status(200).json({ success: true, message: "Admin registerd successfully", response: newAdmin })
    
})


exports.addFacultyController = catchAsyncErrors(async (req, res, next) => {
  
      
        let { name, email, phone,registrationNumber,school,
            aadhaar, dob, gender,address } = req.body
       
            if (!name || !email || !dob || !phone || !aadhaar || !gender || !school ||!registrationNumber || !address){
                return res.status(400).json({success:false, message:"Probably you have missed certain fields"})
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
             return res.status(400).json({success:false, message:"Registration Number Already exist"})
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
        res.status(200).json({ result: newFaculty })

})


exports.addStudentController = catchAsyncErrors( async (req, res, next) => {
  
       
        let { name, grade, fatherName, aadhaar,registrationNumber,
            gender, section, dob, phone,caste,
            fatherphone,school } = req.body

      
       let date = new Date();
        let batch = date.getFullYear()
        let components = [
            "STU",
            batch,
            school.substring(0, 4),
            registrationNumber 
        ];

         registrationNumber = components.join("");

         const student = await Student.findOne({ registrationNumber })
         if (student) {
             return res.status(400).json({success:false, message:"Registration Number Already exist"})
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
        // const subjects = await Subject.find({ year })
        // if (subjects.length !== 0) {
        //     for (var i = 0; i < subjects.length; i++) {
        //         newStudent.subjects.push(subjects[i]._id)
        //     }
        // }
        // await newStudent.save()
        res.status(200).json({ result: newStudent })
    
})