const express = require("express");
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/authMiddlewaresStudent.js");
const pages = require("../controllers/studentController.js")
//router object
const router = express.Router()

router.route("/login").post(pages.studentLoginController);

router.route('/me').get(isAuthenticatedUser,authorizeRoles('student'),pages.getStudentDetailsController)


router.route("/checkAttendence").get(isAuthenticatedUser,authorizeRoles("student"), pages.checkAttendenceController);



// router.route("/password/forgot").post(pages.forgotPasswordController);

// router.route("/password/reset/:token").put(pages.resetPassword);

// router.route("/me").get( pages.getUserDetails);

// router.route("/updatePassword").put( pages.updatePassword);

// router.route("/updateProfile").put( pages.updateProfile);

// router.route('/getMarks').get(getMarks) 

// router.route('/getAllSubjects').get(getAllSubjects)

// router.route('/checkAttendence').get(checkAttendence)

// router.route("/logout").get(pages.logout);

// router.route('/getAllStudents').post(getAllStudents)

// router.route('/getStudentByRegName').post(getStudentByRegName)

// router.route('/getStudentByName').post(getStudentByName)


module.exports = router;