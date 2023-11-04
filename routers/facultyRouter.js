const express = require("express");
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/authMiddlewaresFaculty.js");
const pages = require("../controllers/facultyController.js")
const router = express.Router()

router.route('/login').post(pages.facultyLoginController)
router.route('/me').get(isAuthenticatedUser,authorizeRoles("faculty"), pages.getFacultyDetails)
router.route('/markAttendence').post(isAuthenticatedUser,authorizeRoles("faculty"),pages.markAttendenceController)
router.route('/fetchStudents').post(isAuthenticatedUser,authorizeRoles("faculty"),pages.fetchStudentsController)
router.route('/fetchStudentsForAttendence').get(isAuthenticatedUser,authorizeRoles("faculty"),pages.fetchStudentsForAttendenceController)
router.route("/forgotPassword").post(pages.forgotPasswordController);
router.route('/postOTP').post(pages.postOTPController);

module.exports = router;