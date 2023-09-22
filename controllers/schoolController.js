const catchAsyncError = require("../middlewares/catchAsyncError.js");
const ErrorHandler = require("../utils/errorHandler.js")
const slugify = require('slugify');
const Block = require('../models/blockModel.js')
const District = require('../models/districtModel.js')
const School = require("../models/schoolModel.js");
exports.createSchoolController = catchAsyncError( async (req, res, next) => {
    const { name, block } = req.body;
    if(!name || !block)
    return next(new ErrorHandler("Please Enter Required Fields", 400));
    const existingSchool = await School.findOne({ name });
    if (existingSchool) {
      return res.status(200).json({
        success: false,
        message: "School Already Exisits",
      });
    }
    const school = new School({
      ...req.body,
      slug: slugify(name)
     
    });
    await school.save();
    return res.status(201).json({ 
      success: true,
      message: 'School created successfully' ,
      school
    });
});

exports.getAllSchoolsController = catchAsyncError(async (req, res, next) => {
  const resultPerPage = 8;
  const schoolsCount = await School.countDocuments()
    const schools = await School
      .find({})
      .populate("block")
      .select("-name")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      schools,
      schoolsCount,
      resultPerPage,
    });
});

exports.getSingleSchoolController =catchAsyncError( async (req, res, next) => {
const school = await School
      .findOne({ slug: req.params.slug })
      .select("-name")
      .populate("block");
    res.status(200).json({
      success: true,
      message: "Single School Fetched",
      school,
    });
});

exports.deleteSchoolController = catchAsyncError(async (req, res, next) => {
    const school = await School.findById(req.params.id).select("-name");
    if (!school) {
      return next(new ErrorHander("School not found", 404));
    }
    await school.deleteOne();
    res.status(200).json({
      success: true,
      message: "School Deleted successfully",
    });
 
});
