const User = require("../../models/User.model");

let bcrypt = require("bcryptjs");
const { sendMail } = require("../../utils/sendMail");

//Forgot Password
exports.forgotPasswordRequest = async (req, res, next) => {
  try {
    let { emailId } = req.body;
    var query = { isDeleted: false };
    if (emailId) {
      query.emailId = emailId;
    }

    let user = await User.findOne(query);
    if (user) {
      let otp = Math.floor(100000 + Math.random() * 900000);
      user.otp = otp;
      await user.save();
      sendMail({
        sendTo: user.emailId,
        subject: "Please Verify Your OTP",
        text: `We have received a request to change your password. Use this OTP ${otp} to update the password.`,
      });
      res.status(200).json({
        status: true,
        data: [],
        message: "OTP Sent Please Verify To Change Password!",
      });
    } else {
      res
        .status(400)
        .json({ status: false, data: [], message: "This User Does'nt Exist." });
    }
  } catch (err) {
    console.log(err);
    let errorMessage = "Server Error";
    if (err.errors) {
      errorMessage =
        err.errors.length > 0 ? err.errors[0].message : "Server Error";
    }
    res.status(500).json({
      status: false,
      data: [],
      message: errorMessage,
    });
  }
};

//forgot password verify with otp
exports.forgotPasswordRequestVerify = async (req, res, next) => {
  try {
    let { emailId, otp, newPassword } = req.body;
    var query = { isDeleted: false };
    if (emailId) {
      query.emailId = emailId;
    }

    let user = await User.findOne({ ...query });
    if (user) {
      if (user.otp == otp) {
        let salt = bcrypt.genSaltSync(10);
        let pass = bcrypt.hashSync(newPassword, salt);
        user.password = pass;
        user.otp = null;
        await user.save();
        res.status(200).json({
          status: true,
          data: [],
          message: "Password Changed Successfully.",
        });
      } else {
        res
          .status(400)
          .json({ status: false, data: [], message: "Invalid OTP." });
      }
    } else {
      res
        .status(400)
        .json({ status: false, data: [], message: "This User Does'nt Exist." });
    }
  } catch (err) {
    console.log(err);
    let errorMessage = "Server Error";
    if (err.errors) {
      errorMessage =
        err.errors.length > 0 ? err.errors[0].message : "Server Error";
    }
    res.status(500).json({
      status: false,
      data: [],
      message: errorMessage,
    });
  }
};
