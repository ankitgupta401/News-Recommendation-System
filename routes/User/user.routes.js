const express = require("express");
const router = express.Router();
const {
  createUserUsingEmailPassword,
  loginWithEmailIdPassword,
  getUserByFilterQuery,
  getUserById,
} = require("../../controller/Users/user.controller");
const { errorHandler } = require("../../utils/errorUtils");
const { body } = require("express-validator");

const {
  verifyOtp,
  resendOtp,
} = require("../../controller/Users/validateOtp.controller");
const { isAuthenticated } = require("../../utils/auth");

router.post(
  "/create-user",
  [
    body("name").not().isEmpty(),
    body("emailId").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  errorHandler,
  createUserUsingEmailPassword
);

router.post(
  "/login",
  [body("emailId").isEmail(), body("password").not().isEmpty()],
  errorHandler,
  loginWithEmailIdPassword
);

router.post(
  "/get-all-users",
  isAuthenticated,
  errorHandler,
  getUserByFilterQuery
);
router.post(
  "/get-user-by-id",
  [body("userId").not().isEmpty()],
  isAuthenticated,
  errorHandler,
  getUserById
);

router.post(
  "/verify-otp",
  [body("userId").not().isEmpty(), body("otp").not().isEmpty()],
  errorHandler,
  verifyOtp
);

router.post(
  "/resend-otp",
  [body("userId").not().isEmpty()],
  errorHandler,
  resendOtp
);

module.exports = router;
