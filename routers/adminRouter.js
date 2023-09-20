const express = require('express')
const router = express.Router()
const pages = require('../controllers/adminController.js')
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/authMiddlewaresUser.js");



router.route('/addAdmin').post(isAuthenticatedUser,authorizeRoles('admin'), pages.addAdminController)

router.route('/addFaculty').post(isAuthenticatedUser,authorizeRoles('admin'), pages.addFacultyController)

router.route('/addStudent').post(isAuthenticatedUser,authorizeRoles('admin'), pages.addStudentController)


module.exports = router