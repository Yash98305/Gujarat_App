const express = require("express");
const { forgotPasswordController, loginController, logout, registerController, getUserDetails, updatePassword, updateProfile, getAllUser, getSingleUser, updateUserRole, deleteUser, resetPassword, getAllStudentsController, getInactiveStudentsController, getActiveStudentsController, getStatusController, getStatusByGenderController, getStatusByCasteController, addAdminByAdminController } = require("../controllers/authController.js");
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/authMiddlewaresUser.js");
const mid = require("../middlewares/authMiddlewaresFaculty.js");

//router object
const router = express.Router()


router.route("/register").post(registerController);

router.route("/login").post(loginController);

router.route("/password/forgot").post(forgotPasswordController);

router.route("/password/reset/:token").put(resetPassword);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/me/update").put(isAuthenticatedUser, updateProfile);


router.route('/addAdminByAdmin').post(isAuthenticatedUser,authorizeRoles("admin"), addAdminByAdminController)


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

router.route('/getStatus').get(isAuthenticatedUser, getStatusController)

router.route('/getStatusByGender').get(isAuthenticatedUser, getStatusByGenderController)

router.route('/getStatusByCaste').get(isAuthenticatedUser, getStatusByCasteController)

router.route("/logout").get(logout);

module.exports = router;
