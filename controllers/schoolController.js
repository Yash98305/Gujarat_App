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

    // Create a new school and connect it to the block
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



//get all schools
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

// get single school (admin)
exports.getSingleSchoolController =catchAsyncError( async (req, res, next) => {
  // const schools = await School.find();

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

// delete school (admin)
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


// // update school (admin)
// exports.updateSchoolController = catchAsyncError(async (req, res, next) => {
//   const school = await School.findById(req.params.id);
//   if (!school) {
//     return next(new ErrorHander("School not found", 404));
//   }
//     const {name} = req.body;
//     const schools = await School.findByIdAndUpdate(
//       req.params.pid,
//       { name, slug: slugify(name) },
//       { new: true,
//         runValidators: true,
//         useFindAndModify: false, }
//     );

//     await schools.save();
//     res.status(201).send({
//       success: true,
//       message: "School Updated Successfully",
//       schools,
//     });
  
// })


//connect school and district
// exports.schoolBlockController = catchAsyncError(async (req, res, next) => {
  
//     const block = await Block.findOne({ slug: req.params.slug });
//     const schools = await School.find({ block }).populate("block");
//     res.status(200).json({
//       success: true,
//       block,
//       schools,
//     });
  
// });


// //connect school and district
// exports.schoolDistrictController = catchAsyncError(async (req, res, next) => {
//   const district = await District.findOne({ slug: req.params.slug });
//     const block = await Block.find({ district }).populate("district");
//     res.status(200).send({
//       success: true,
//       district,
//       block,
   
//     });
  
// });

