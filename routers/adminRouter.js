const express = require('express')
const router = express.Router()
const pages = require('../controllers/adminController.js')



router.route('/addAdmin').post(pages.addAdminController)

router.route('/addFaculty').post(pages.addFacultyController)

router.route('/addStudent').post(pages.addStudentController)



module.exports = router