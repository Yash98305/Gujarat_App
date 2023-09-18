const mongoose = require("mongoose");
const validator = require("validator");

const blockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Enter Your Name"],
  },
  district: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "District",
    required: true,
     },
     slug: {
      type: String,
      required: true,
    },

});

module.exports = mongoose.model("Block", blockSchema);
