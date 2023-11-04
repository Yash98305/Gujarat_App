const mongoose = require("mongoose");
const validator = require("validator");

const educationalSchema = new mongoose.Schema({
    lastSchool:{
        type:String
    },
    yearOfDropout:{
        type:Number
    },
    highestQualification:{
        type:String
    },
    reason:{
        type:String
    },
    fieldOfInterest:{
        type:String
    }
});

module.exports = mongoose.model("Educational", educationalSchema);
