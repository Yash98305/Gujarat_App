const express = require("express");
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/authMiddlewaresUser.js");
const pages = require("../controllers/schoolController.js")
const router = express.Router()

router.route("/register").post(isAuthenticatedUser,authorizeRoles('government'),pages.createSchoolController);
router.route("/getAllSchools").get(isAuthenticatedUser,authorizeRoles('government'), pages.getAllSchoolsController);
router.route("/getSingleSchool/:slug").get(isAuthenticatedUser,authorizeRoles('government'), pages.getSingleSchoolController);
router.route("/deleteSchool/:id").delete(isAuthenticatedUser,authorizeRoles('government'), pages.deleteSchoolController);

module.exports = router;