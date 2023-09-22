const express = require("express");
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/authMiddlewaresFaculty.js");
const pages = require("../controllers/facultyController.js")
const router = express.Router()

router.route('/login').post(pages.facultyLoginController)
router.route('/me').get(isAuthenticatedUser,authorizeRoles("faculty"), pages.getFacultyDetails)
router.route('/markAttendence').post(isAuthenticatedUser,authorizeRoles("faculty"),pages.markAttendenceController)
router.route('/fetchStudents').get(isAuthenticatedUser,authorizeRoles("faculty"),pages.fetchStudentsController)

module.exports = router;