const User = require("../../models/User.model");

const jwt = require("jsonwebtoken");
const { sendMail } = require("../../utils/sendMail");

//change email id
exports.changeEmailIdRequest = async (req, res, next) => {
  try {
    let { emailId } = req.body;
    let token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (token) {
      let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      let [user, existingUser] = await Promise.all([
        User.findOne({
          _id: decoded._id,
          isDeleted: false,
        }),
        User.findOne({
          emailId,
        }),
      ]);

      if (user) {
        if (existingUser) {
          res.status(400).json({
            status: false,
            data: [],
            message:
              "This Email Id Is Already Associated With Some Other Account",
          });
        } else {
          let otp = Math.floor(100000 + Math.random() * 900000);
          user.emailChangeOtp = otp;
          user.tempEmail = emailId;
          await user.save();
          sendMail({
            sendTo: emailId,
            subject: "Please Verify Your New Email Id",
            text: `We have received a request to update your email id. Use this OTP ${otp} to update the email id.`,
          });
          res.json({
            status: true,
            data: [],
            message: "OTP Sent To Respective Email Id",
          });
        }
      } else {
        res.status(401).json({
          status: false,
          data: [],
          message: "Invalid Token",
        });
      }
    } else {
      res.status(401).json({
        status: false,
        data: [],
        message: "Invalid Token",
      });
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

//change email id verify
exports.changeEmailIdVerifyOTP = async (req, res, next) => {
  try {
    let { otp } = req.body;
    let token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (token) {
      let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      let user = await User.findOne({
        _id: decoded._id,
        isDeleted: false,
      });
      let existingUser = await User.findOne({
        emailId: user.tempEmail,
      });

      if (user) {
        if (existingUser) {
          res.status(400).json({
            status: false,
            data: [],
            message:
              "This Email Id Is Already Associated With Some Other Account",
          });
        } else {
          if (otp == user.emailChangeOtp) {
            user.emailId = user.tempEmail;
            user.tempEmail = null;
            user.emailChangeOtp = null;
            await user.save();

            res.json({
              status: true,
              data: [],
              message: "Email Changed",
            });
          } else {
            res.status(400).json({
              status: false,
              data: [],
              message: "Invalid Otp",
            });
          }
        }
      } else {
        res.status(401).json({
          status: false,
          data: [],
          message: "Invalid Token",
        });
      }
    } else {
      res.status(401).json({
        status: false,
        data: [],
        message: "Invalid Token",
      });
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
