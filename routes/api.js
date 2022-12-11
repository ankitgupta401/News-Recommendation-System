const express = require("express");

const router = express.Router();

const userRoutes = require("./User/user.routes");
const changeEmailAndOtherDetailsRoutes = require("./User/changeEmailAndOtherDetails.routes");
const forgotPasswordRoutes = require("./User/forgotPassword.routes");

router.use("/user", userRoutes);
router.use("/user", changeEmailAndOtherDetailsRoutes);
router.use("/user", forgotPasswordRoutes);

module.exports = router;
