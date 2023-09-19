const catchAsyncErrors = require("../middlewares/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js")
const sendToken = require("../jwtToken/jwtToken.js")
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail.js")
const Faculty = require ( "../models/facultyModel.js")
const Student = require ( "../models/studentModel.js")
const Attendence = require ( "../models/attendenceModel.js")




exports.markAttendenceController = catchAsyncErrors(async (req, res, next) => {
 
        const { selectedStudents,
            grade,
            section } = req.body
        

        //All Students
        const allStudents = await Student.find({ grade, section })
        
        var filteredArr = allStudents.filter(function (item) {
            return selectedStudents.indexOf(item.id) === -1
        });

        
        //Attendence mark karne wale log nahi
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