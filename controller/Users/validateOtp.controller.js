const User = require("../../models/User.model");

const { sendMail } = require("../../utils/sendMail");

exports.resendOtp = async (req, res, next) => {
  try {
    let { userId } = req.body;
    let user = await User.findOne({
      _id: userId,
      isDeleted: false,
    });
    if (user) {
      let otp = Math.floor(100000 + Math.random() * 900000);
      user.otp = otp;
      await user.save();

      sendMail({
        sendTo: user.emailId,
        subject: "please verify your account",
        text: `The OTP to complete your registration is ${otp}`,
      });
      res.json({
        status: true,
        message: "Otp Sent Successfully",
        data: [],
      });
    } else {
      res.status(400).json({
        status: false,
        data: [],
        message: "OTP expired.",
      });
    }
  } catch (err) {
    console.log(err);
    let errorMessage = "server error";
    if (err.errors) {
      errorMessage =
        err.errors.length > 0 ? err.errors[0].message : "server error";
    }
    res.status(500).json({
      status: false,
      data: [],
      message: errorMessage,
    });
  }
};

exports.resendEmailOtp = async (req, res, next) => {
  try {
    let { userId } = req.body;
    let user = await User.findOne({
      _id: userId,
      isDeleted: false,
    });
    if (user) {
      let otp = Math.floor(100000 + Math.random() * 900000);
      user.emailChangeOtp = otp;

      await user.save();

      sendMail({
        sendTo: user.tempEmail,
        subject: "please verify your email",
        text: `The OTP to change Your Email Id is ${otp}`,
      });
      res.json({
        status: true,
        message: "Otp Sent Successfully",
        data: [],
      });
    } else {
      res.status(400).json({
        status: false,
        data: [],
        message: "OTP expired.",
      });
    }
  } catch (err) {
    console.log(err);
    let errorMessage = "server error";
    if (err.errors) {
      errorMessage =
        err.errors.length > 0 ? err.errors[0].message : "server error";
    }
    res.status(500).json({
      status: false,
      data: [],
      message: errorMessage,
    });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.body.userId,
      isDeleted: false,
      accountVerified: false,
    });
    if (!user) {
      return res.status(404).json({
        status: false,
        data: [],
        message: "User Not Found",
      });
    }
    if (user.otp === req.body.otp) {
      user.accountVerified = true;
      await user.save();
      res.json({
        status: true,
        data: [],
        message: "Account Verified Successfully",
      });
    } else {
      res.status(400).json({
        status: true,
        data: [],
        message: "Invalid OTP",
      });
    }
  } catch (err) {
    console.log(err);
    let errorMessage = "server error";
    if (err.errors) {
      errorMessage =
        err.errors.length > 0 ? err.errors[0].message : "server error";
    }
    res.status(500).json({
      status: false,
      data: [],
      message: errorMessage,
    });
  }
};
