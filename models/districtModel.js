const mongoose = require("mongoose");
const validator = require("validator");

const districtSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
  },
  slug: {
    type: String,
    lowercase: true,
  },
 
});



module.exports = mongoose.model("District", districtSchema);
