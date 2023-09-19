const express = require("express");
const { forgotPasswordController, loginController, logout, registerController, getUserDetails, updatePassword, updateProfile, getAllUser, getSingleUser, updateUserRole, deleteUser, resetPassword } = require("../controllers/authController.js");
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/authMiddlewares.js");
const pages = require("../controllers/facultyController.js")
//router object
const router = express.Router()

router.route('/markAttendence').post(pages.markAttendenceController)



module.exports = router;