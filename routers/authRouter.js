const express = require("express");
const { forgotPasswordController, loginController, logout, registerController, getUserDetails, updatePassword, updateProfile, getAllUser, getSingleUser, updateUserRole, deleteUser, resetPassword } = require("../controllers/authController.js");
const { authorizeRoles, isAuthenticatedUser } = require("../middlewares/authMiddlewares.js");

//router object
const router = express.Router()


router.route("/register").post(registerController);

router.route("/login").post(loginController);

router.route("/password/forgot").post(forgotPasswordController);

router.route("/password/reset/:token").put(resetPassword);

router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);

router.route("/me/update").put(isAuthenticatedUser, updateProfile);


router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

  router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getSingleUser)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser
  );


router.route("/logout").get(logout);

module.exports = router;
