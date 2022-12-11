const express = require("express");
const router = express.Router();
const { body } = require("express-validator");

const {
  forgotPasswordRequest,
  forgotPasswordRequestVerify,
} = require("../../controller/Users/forgotPassword.controller");
const { errorHandler } = require("../../utils/errorUtils");

router.post(
  "/forgot-password",
  [body("emailId").isEmail()],
  errorHandler,
  forgotPasswordRequest
);

router.post(
  "/forgot-password-verify",
  [
    body("emailId").isEmail(),
    body("newPassword").notEmpty(),
    body("otp").not().isEmpty(),
  ],
  errorHandler,
  forgotPasswordRequestVerify
);

module.exports = router;
