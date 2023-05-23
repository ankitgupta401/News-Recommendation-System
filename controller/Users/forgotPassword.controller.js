const User = require("../../models/User.model");

let bcrypt = require("bcryptjs");
const { sendMail } = require("../../utils/sendMail");
// const { nanoid } = require("nanoid");

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
      let Newpass = password_generator(6);
      console.log(Newpass);
      let salt = bcrypt.genSaltSync(10);
      let pass = bcrypt.hashSync(Newpass, salt);
      user.password = pass;
      user.otp = null;
      await user.save();
      sendMail({
        sendTo: user.emailId,
        subject: "Your Password Has Been Changed.",
        text: `Your New Password For Interest Based News Recommendation System is ${Newpass}`,
      });
      res.status(200).json({
        status: true,
        data: [],
        message: "OTP Sent Please Verify To Change Password!",
      });
    } else {
      res
        .status(400)
        .json({ status: false, data: [], message: "This User Doesn't Exist." });
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


function password_generator(len) {
  var length = (len) ? (len) : (10);
  var string = "abcdefghijklmnopqrstuvwxyz"; //to upper 
  var numeric = '0123456789';
  var punctuation = '!@#$%^&*()';
  var password = "";
  var character = "";
  var crunch = true;
  while (password.length < length) {
    entity1 = Math.ceil(string.length * Math.random() * Math.random());
    entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
    entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
    hold = string.charAt(entity1);
    hold = (password.length % 2 == 0) ? (hold.toUpperCase()) : (hold);
    character += hold;
    character += numeric.charAt(entity2);
    character += punctuation.charAt(entity3);
    password = character;
  }
  password = password.split('').sort(function () { return 0.5 - Math.random() }).join('');
  return password.substr(0, len);
}

console.log(password_generator());
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
