const mongoose = require("mongoose");
const validator = require("validator");

const personalSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  dob: {
    type: Date 
},
 
  gender: {
    type: String,
    enum: ["male", "female", "other"],
},
phone : {
    type:Number
},
email : {
    type:String,
    validate: [validator.isEmail, "Please Enter a valid Email"]
}

});

module.exports = mongoose.model("Personal", personalSchema);
