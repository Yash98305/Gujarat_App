const mongoose=require('mongoose');
const attendenceSchema=new mongoose.Schema({
    student:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Student",
        required:true,
    },
   
    totalLecturesByFaculty:{
        type:Number,
        default:0,
    },
    lectureAttended: {
        type:Number,
        default:0,
    },
    count: {
        type:Number,
        default:0,
    },
    // block : {
    //     type:mongoose.Schema.Types.ObjectId,
    //     ref:"Block",
    //     required:true,
    // },
    status: {
        type: String,
        enum : ["Active","Deactive"],
        default : "Active"
      }
})
module.exports = mongoose.model('Attendance', attendenceSchema)