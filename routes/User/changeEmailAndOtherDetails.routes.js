const express = require("express");
const router = express.Router();

const { body } = require("express-validator");

const {
  changeEmailIdVerifyOTP,
  changeEmailIdRequest,
} = require("../../controller/Users/changeEmail.controller");

const {
  updateCommonUserDetSelf,
  changePassword,
} = require("../../controller/Users/updatePasswordAndOtherDetails.controller");

const {
  resendEmailOtp,
} = require("../../controller/Users/validateOtp.controller");
const { isAuthenticated } = require("../../utils/auth");
const { errorHandler } = require("../../utils/errorUtils");

router.post(
  "/update-user",
  isAuthenticated,
  errorHandler,
  updateCommonUserDetSelf
);

router.post(
  "/update-password",
  [
    body("oldPassword").not().isEmpty(),
    body("newPassword").isLength({ min: 6 }),
  ],
  isAuthenticated,
  errorHandler,
  changePassword
);

router.post(
  "/change-email",
  [body("emailId").isEmail()],
  isAuthenticated,
  errorHandler,
  changeEmailIdRequest
);

router.post(
  "/verify-email-otp",
  [body("otp").not().isEmpty()],
  isAuthenticated,
  errorHandler,
  changeEmailIdVerifyOTP
);

router.post(
  "/resend-email-otp",
  [body("userId").not().isEmpty()],
  isAuthenticated,
  errorHandler,
  resendEmailOtp
);

module.exports = router;
