const mongoose = require("mongoose");
const validator = require("validator");

const reasonSchema = new mongoose.Schema({
    reason:{
        type:String
    }
});    

module.exports = mongoose.model("Reason", reasonSchema);
