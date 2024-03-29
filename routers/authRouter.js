const express = require("express");
const { forgotPasswordController, loginController, logout, registerController, getUserDetails, updatePassword, updateProfile, getAllUser, getSingleUser, updateUserRole, deleteUser, resetPassword, getAllStudentsController, getInactiveStudentsController, getActiveStudentsController, getStatusController, getStatusByGenderController, getStatusByCasteController, addAdminByAdminController, postOTPController, getSchoolStatusController, getDistrict, getBlock, getSchool, personals, reasons, educationals } = require("../controllers/authController.js");
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/authMiddlewaresUser.js");
const router = express.Router()

router.route("/register").post(registerController);
router.route("/login").post(loginController);
router.route("/forgotPassword").post(forgotPasswordController);
router.route('/postOTP').post(postOTPController);
router.route("/me").get(isAuthenticatedUser, getUserDetails);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);
router.route('/addAdminByAdmin').post(authorizeRoles("superadmin"), addAdminByAdminController)
router.route('/personal').post(personals)
router.route('/educational').post(educationals)
router.route('/reason').post(reasons)

router
  .route("/government/users")
  .get(isAuthenticatedUser, authorizeRoles("government"), getAllUser);
router
  .route("/government/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("government"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("government"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("government"), deleteUser
  );
router.route('/government/getAllStudents').get(isAuthenticatedUser, authorizeRoles("government"), getAllStudentsController)
router.route('/government/getInactiveStudents').get(isAuthenticatedUser , authorizeRoles("government"), getInactiveStudentsController)
router.route('/government/getActiveStudents').get(isAuthenticatedUser , authorizeRoles("government"), getActiveStudentsController)
router.route('/getStatus').get( getStatusController)
// router.route('/getSchoolStatus').get( getSchoolStatusController)
router.route('/getDistrict').get( getDistrict)
router.route('/getBlock').post( getBlock)
router.route('/getSchool').post( getSchool)
router.route('/government/getStatusByGender').get( getStatusByGenderController)
router.route('/government/getStatusByCaste').get( getStatusByCasteController)
router.route("/logout").get(logout);

module.exports = router;
