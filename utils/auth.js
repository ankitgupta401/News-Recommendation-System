const User = require("../models/User.model");
const jwt = require("jsonwebtoken");

exports.isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization
        ? req.headers.authorization.split(" ")[1]
        : null;
      let userData;
      if (token) {
        let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        userData = await User.findOne({
          _id: decoded._id,
          isDeleted: false,
        });
      }
      if (userData) {
        req.user = userData;

        next();
      } else {
        res.status(401).json({
          status: false,
          message: "unauthorized",
        });
      }
    } else {
      res.status(401).json({
        status: false,
        message: "unauthorized",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "server error",
    });
  }
};

exports.isAuthenticatedAndAdmin = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      let token = req.headers.authorization
        ? req.headers.authorization.split(" ")[1]
        : null;
      let userData;
      if (token) {
        let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        userData = await User.findOne({
          _id: decoded._id,
          isDeleted: false,
        });
      }
      if (userData) {
        if (userData.userType === "ADMIN") {
          req.user = userData;

          next();
        } else {
          res.status(401).json({
            status: false,
            data: [],
            message: "Unauthorized",
          });
        }
      } else {
        res.status(401).json({
          status: false,
          data: [],
          message: userData.message,
        });
      }
    } else {
      res.status(401).json({
        status: false,
        message: "Unauthorized",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "server error",
    });
  }
};
