const User = require("../../models/User.model");
const jwt = require("jsonwebtoken");

//authenticate the Token
exports.isAuthenticated = async (req, res, next) => {
  try {
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
        res.status(200).json({
          status: true,
          message: "user decoded",
          data: user,
        });
      } else {
        res.status(401).json({
          status: false,
          data: [],
          message: "Invalid Token Make Sure Your Account Is Verified",
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
