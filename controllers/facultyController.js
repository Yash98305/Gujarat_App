const catchAsyncErrors = require("../middlewares/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js")
const sendToken = require("../jwtToken/jwtTokenFaculty.js")
const Faculty = require ( "../models/facultyModel.js")
const Student = require ( "../models/studentModel.js")
const Attendence = require ( "../models/attendenceModel.js")
const sendEmail = require("../utils/nodemailer.js")

exports.facultyLoginController = catchAsyncErrors(async (req, res, next) => {
        const { registrationNumber, password } = req.body;
        const faculty = await Faculty.findOne({ registrationNumber }).select("+password");
        if (!faculty) {
            return next (new ErrorHandler("Registration number not found",404));
        }
        const isPasswordMatched = await faculty.comparePassword(password)
        if (!isPasswordMatched) {
            return next(new ErrorHandler("Invalid Credentials", 401));
        }  
        sendToken(faculty, 200, res);
})

exports.getFacultyDetails = catchAsyncErrors(async (req, res, next) => {
    const faculty = await Faculty.findById(req.faculty._id);
    res.status(200).json({
      success: true,
      faculty,
    });
  });
  
exports.markAttendenceController = catchAsyncErrors(async (req, res, next) => {
    const schoolid=await Faculty.findById(req.faculty._id)

    
    const { selectedStudents } = req.body
        const allStudents = await Student.find({grade:schoolid.grade, section:schoolid.section})   
        var filteredArr = allStudents.filter(function (item) {
            return selectedStudents.indexOf(item.id) === -1
        });
        for (let i = 0; i < filteredArr.length; i++) {
            const pre = await Attendence.findOne({ student: filteredArr[i]._id })
            if (!pre) {
                const attendence = new Attendence({
                    student: filteredArr[i],
                })
                attendence.totalLecturesByFaculty += 1
                attendence.count += 1
                if(attendence.count>15){
                    attendence.status = "Deactive"
                }
                await attendence.save()
            }
            else {
                pre.totalLecturesByFaculty += 1
                pre.count+=1
                if(pre.count>15){
                    pre.status = "Deactive"
                }
                await pre.save()
            }
        }
        for (var a = 0; a < selectedStudents.length; a++) {
            const pre = await Attendence.findOne({ student: selectedStudents[a] })
            if (!pre) {
                const attendence = new Attendence({
                    student: selectedStudents[a],       
                })
                attendence.totalLecturesByFaculty += 1
                attendence.lectureAttended += 1
                attendence.count=0
                if(attendence.count<=15){
                    attendence.status = "Active"
                }
                await attendence.save()
            }
            else {
                pre.totalLecturesByFaculty += 1
                pre.lectureAttended += 1
                pre.count=0
                if(pre.count<=15){
                    pre.status = "Active"
                }
                await pre.save()
            }
        }
        res.status(200).json({ message: "done" })
   
})

exports.fetchStudentsController = catchAsyncErrors(async (req, res, next) => {
const {grade, section} = req.body;
       const schoolid=await Faculty.findById(req.faculty._id)
        const students = await Student.find({grade, section, school:schoolid.school})
        if (students.length === 0) {
            return next(new ErrorHandler("Student Not Found",404))
        }
        res.status(200).json({
            result: students.map(student => {
                var student = {
                    _id: student._id,
                    registrationNumber: student.registrationNumber,
                    name: student.name,
                    gender : student.gender,
                    phone : student.phone,
                    fatherphone : student.fatherphone,
                    fatherName : student.fatherName
                }
                return student
            }),
        })
})

exports.fetchStudentsForAttendenceController = catchAsyncErrors(async (req, res, next) => {

  const schoolid=await Faculty.findById(req.faculty._id)
   const students = await Student.find({grade:schoolid.grade, section:schoolid.section, school:schoolid.school})
   if (students.length === 0) {
       return next(new ErrorHandler("Sorry, You have not allotted any class",404))
   }
   res.status(200).json({
       result: students.map(student => {
           var student = {
               _id: student._id,
               name: student.name,
           }
           return student
       }),
   })
})


exports.postOTPController = catchAsyncErrors(async (req, res, next) => {
    const { email, otp, newPassword, conformPassword } = req.body;
    if (newPassword !== conformPassword) {
      return next(new ErrorHandler("Password Mismatch", 400));
    }
    const faculty = await Faculty.findOne({ email });
    if (faculty.otp !== otp) {
      return next(new ErrorHandler("Invalid OTP, check your email again", 400));
    }
    faculty.password = newPassword;
    await faculty.save();
    sendToken(faculty, 200, res);
  });
  exports.forgotPasswordController = catchAsyncErrors(async (req, res, next) => {
    const faculty = await Faculty.findOne({ email: req.body.email });
    if (!faculty) {
      return next(new ErrorHandler("Faculty not found", 404));
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
    faculty.otp = OTP;
    await faculty.save();
    await sendEmail(faculty.email, OTP, "OTP");
    res.status(200).json({
      success: true,
      message: "check your registered email for OTP",
    });
    const helper = async () => {
        faculty.otp = "";
      await faculty.save();
    };
    setTimeout(function () {
      helper();
    }, 300000);
  });