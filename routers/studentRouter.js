const express = require("express");
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/authMiddlewaresStudent.js");
const pages = require("../controllers/studentController.js")
const router = express.Router()

router.route("/login").post(pages.studentLoginController);
router.route('/me').get(isAuthenticatedUser,authorizeRoles('student'),pages.getStudentDetailsController)
router.route("/checkAttendence").get(isAuthenticatedUser,authorizeRoles("student"), pages.checkAttendenceController);
router.route("/forgotPassword").post(pages.forgotPasswordController);
router.route('/postOTP').post(pages.postOTPController);
router.route('/chat/:roomId').post(isAuthenticatedUser,pages.postPrivateChatController)

module.exports = router;