const Student = require("../models/studentModel.js");
const catchAsyncErrors = require("../middlewares/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js")
const sendToken = require("../jwtToken/jwtTokenStudent.js")
const Attendence = require('../models/attendenceModel.js')
const sendEmail = require("../utils/nodemailer.js")
const Message = require('../models/messageModel.js')


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












exports.postPrivateChatController=catchAsyncErrors(async (req, res, next) => {
   
        const { senderName, senderId, roomId,
            receiverRegistrationNumber,senderRegistrationNumber,message } = req.body

        const studentid = await Student.findById(req.student._id);
        const school = studentid.school;
        const receiverStudent = await Student.findOne({ registrationNumber: receiverRegistrationNumber })
        const newMessage = await new Message({
            senderName,
            senderId,
            roomId,
            message,
            senderRegistrationNumber,
            receiverRegistrationNumber,
            school,
            receiverName: receiverStudent.name,
            receiverId: receiverStudent._id,
            createdAt: new Date()
        })
        await newMessage.save()
   
})
// getPrivateChat: async (req, res, next) => {
//     try {
//         const { roomId } = req.params
//         const swap = (input, value_1, value_2) => {
//             let temp = input[value_1];
//             input[value_1] = input[value_2];
//             input[value_2] = temp;
//         }
//         const allMessage = await Message.find({ roomId })
//         let tempArr = roomId.split(".")
//         swap(tempArr, 0, 1)
//         let secondRomId = tempArr[0] + '.' + tempArr[1]
//         const allMessage2 = await Message.find({ roomId: secondRomId })
//         var conversation = allMessage.concat(allMessage2);
//         conversation.sort();
//         res.status(200).json({ result: conversation })
//     }
//     catch (err) {
//         console.log("errr in getting private chat server side", err.message)

//     }
// },
// differentChats: async (req, res, next) => {
//     try {
//         const { receiverName } = req.params
//         const newChatsTemp = await Message.find({ senderName: receiverName })
//         // if (newChatsTemp.length === 0) {
//         //    return res.status(404).json({ result: "No any new Chat" })
//         // }
//         var filteredObjTemp = newChatsTemp.map(obj => {
//             let filteredObjTemp = {
//                 senderName: obj.senderName,
//                 receiverName: obj.receiverName,
//                 senderRegistrationNumber: obj.senderRegistrationNumber,
//                 receiverRegistrationNumber: obj.receiverRegistrationNumber,
//                 receiverId: obj.receiverId
//             }
//             return filteredObjTemp
//         })
//         let filteredListTemp = [...new Set(filteredObjTemp.map(JSON.stringify))].map(JSON.parse)

//         // const { receiverName } = req.params
//         const newChats = await Message.find({ receiverName })
//         // if (newChats.length === 0) {
//         //    return res.status(404).json({ result: "No any new Chat" })
//         // }
//         var filteredObj = newChats.map(obj => {
//             let filteredObj = {
//                 senderName: obj.senderName,
//                 receiverName: obj.receiverName,
//                 senderRegistrationNumber: obj.senderRegistrationNumber,
//                 receiverRegistrationNumber: obj.receiverRegistrationNumber,
//                 receiverId: obj.receiverId
//             }
//             return filteredObj
//         })
//         let filteredListPro = [...new Set(filteredObj.map(JSON.stringify))].map(JSON.parse)
//         for (var i = 0; i < filteredListPro.length; i++) {
//             for (var j = 0; j < filteredListTemp.length; j++) {
//                 if (filteredListPro[i].senderName === filteredListTemp[j].receiverName) {
//                     filteredListPro.splice(i, 1)

//                 }
//             }
//         }
//         res.status(200).json({ result: filteredListPro })
//     }
//     catch (err) {
//         console.log("Error in getting different chats", err.message)
//     }
// },
// previousChats: async (req, res, next) => {
//     try {
//         const { senderName } = req.params
//         const newChats = await Message.find({ senderName })
//         // if (newChats.length === 0) {
//         //     res.status(404).json({ result: "No any new Chat" })
//         // }
//         var filteredObj = newChats.map(obj => {
//             let filteredObj = {
//                 senderName: obj.senderName,
//                 receiverName: obj.receiverName,
//                 senderRegistrationNumber: obj.senderRegistrationNumber,
//                 receiverRegistrationNumber: obj.receiverRegistrationNumber,
//                 receiverId: obj.receiverId
//             }
//             return filteredObj
//         })
//         var filteredList = [...new Set(filteredObj.map(JSON.stringify))].map(JSON.parse)
//         console.log("filterdList",filteredList)
//         res.status(200).json({ result: filteredList })
//     }
//     catch (err) {
//         console.log("Error in getting previous chats", err.message)
//     }
// }