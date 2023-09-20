const express = require("express");
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/authMiddlewaresUser.js");
const pages = require("../controllers/schoolController.js")
//router object
const router = express.Router()

router.route("/register").post(isAuthenticatedUser,authorizeRoles('government'),pages.createSchoolController);

router.route("/getAllSchools").get(isAuthenticatedUser,authorizeRoles('government'), pages.getAllSchoolsController);

router.route("/getSingleSchool/:slug").get(isAuthenticatedUser,authorizeRoles('government'), pages.getSingleSchoolController);

router.route("/deleteSchool/:id").delete(isAuthenticatedUser,authorizeRoles('government'), pages.deleteSchoolController);

// router.route("/updateSchool/:id").put(isAuthenticatedUser,authorizeRoles('government'), pages.updateSchoolController);

// router.route("/schoolBlock/:slug").get(isAuthenticatedUser,authorizeRoles('government'), pages.schoolBlockController);

// router.route("/schoolDistrict/:slug").get(isAuthenticatedUser,authorizeRoles('government'), pages.schoolDistrictController);


module.exports = router;