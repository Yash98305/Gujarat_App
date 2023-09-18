const mongoose = require("mongoose");
const validator = require("validator");

const schoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
  },
  block: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Block",
    required: true,
     },
     slug: {
      type: String,
      lowercase: true,
    },
 
  createdAt: {
    type: Date,
    default: Date.now,
  }

});



module.exports = mongoose.model("School", schoolSchema);
