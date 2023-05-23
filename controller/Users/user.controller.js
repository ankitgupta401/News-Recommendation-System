const User = require("../../models/User.model");

let bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendMail } = require("../../utils/sendMail");

//register a user with name email id and password
exports.createUserUsingEmailPassword = async (req, res, next) => {
  try {
    let salt = bcrypt.genSaltSync(10);
    const pass = req.body.password;
    let otp = Math.floor(100000 + Math.random() * 900000);
    let password = bcrypt.hashSync(pass, salt);
    const doesAlreadyExist = await User.find({
      emailId: req.body.emailId,
      isDeleted: false,
    });

    if (doesAlreadyExist.length > 0) {
      return res.status(400).json({
        status: false,
        data: doesAlreadyExist[0],
        message: "User Already Exists",
      });
    } else {
      let user = new User({
        name: req.body.name,
        emailId: req.body.emailId,
        otp: otp,
        password,
        userType: "USER",
        interests: req.body.interests || [],
      });

      await user.save();
      sendMail({
        sendTo: req.body.emailId,
        subject: "WELCOME",
        text: `You are registered with News Recommendation System. Your Credentials are : \n\n userId:${req.body.emailId} \n password:${pass}`,
      });

      let userWithoutOtpAndPassword = await User.findOne(
        { emailId: user.emailId, isDeleted: false },
        { password: 0, otp: 0, emailChangeOtp: 0 }
      );
      res.status(201).json({
        status: true,
        message: "user created successfully",
        data: userWithoutOtpAndPassword,
      });
    }
  } catch (err) {
    console.log(err);
    if (err.name === "MongoError" && err.code === 11000) {
      // Duplicate phoneNumber or email
      return res
        .status(401)
        .json({ status: false, data: [], message: "User Already Exist!" });
    } else {
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
  }
};

//login using phone number or email id and password
exports.loginWithEmailIdPassword = async (req, res, next) => {
  try {
    let { emailId, password } = req.body;
    var query = { isDeleted: false };
    if (emailId) {
      query.emailId = emailId;
    }

    let user = await User.findOne({ ...query });

    if (user) {
      if (bcrypt.compareSync(password, user.password)) {
        let token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET_KEY);

        res.json({
          status: true,
          message: "Login Successful",
          data: {
            token,
            user,
          },
        });
      } else {
        res.status(401).json({
          status: false,
          data: [],
          message: "Invalid Credentials",
        });
      }
    } else {
      res.status(401).json({
        status: false,
        data: [],
        message: "Invalid Credentials",
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

exports.getUserById = async (req, res, next) => {
  try {
    let { userId } = req.body;
    const user = await User.find({ isDeleted: false, _id: userId });

    res.json({ status: true, data: user, message: "Fetched User" });
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

exports.getUserByFilterQuery = async (req, res, next) => {
  try {
    let { query, sort, limit, skip, select } = req.body;
    let user = User.find({ isDeleted: false, ...query });
    if (select) {
      user = user.select({ ...select });
    }
    if (sort) {
      user = user.sort({ ...sort });
    }

    if (skip) {
      user = user.skip(skip);
    }
    if (limit) {
      user = user.limit(limit);
    }
    user = await user;

    res.json({ status: true, data: user, message: "Fetched User" });
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
