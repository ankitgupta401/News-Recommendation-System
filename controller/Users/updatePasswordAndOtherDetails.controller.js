const User = require("../../models/User.model");

const jwt = require("jsonwebtoken");
let bcrypt = require("bcryptjs");

//change password
exports.changePassword = async (req, res, next) => {
  try {
    let { oldPassword, newPassword } = req.body;
    let token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;
    if (token) {
      let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
      let user = await User.findOne({
        _id: decoded._id,
        isDeleted: false,
      });

      if (user) {
        if (bcrypt.compareSync(oldPassword, user.password)) {
          let salt = bcrypt.genSaltSync(10);
          user.password = bcrypt.hashSync(newPassword, salt);
          await user.save();
          res.json({
            status: true,
            data: [],
            message: "Password Updated Successfully",
          });
        } else {
          res.status(401).json({
            status: false,
            data: [],
            message: "Invalid Old Password",
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

//update common Details e.g name, profilePicture etc
exports.updateCommonUserDetSelf = async (req, res, next) => {
  try {
    let { profilePicture, name, interests } = req.body;

    let updatedData = {};

    if (profilePicture) {
      updatedData.profilePicture = profilePicture;
    }

    if (name) {
      updatedData.name = name;
    }
    if (interests) {
      updatedData.interests = interests;
    }

    await User.updateOne({ _id: req.user._id }, updatedData);
    const user = await User.findOne({ _id: req.user._id, isDeleted: false });
    res.json({ status: true, data: user, message: "Updated" });
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
