const express = require("express");

const router = express.Router();

// User Routes
const userRoutes = require("./User/user.routes");
const changeEmailAndOtherDetailsRoutes = require("./User/changeEmailAndOtherDetails.routes");
const forgotPasswordRoutes = require("./User/forgotPassword.routes");

// News Routes
const newsRoutes = require("./News/news.routes");

// Interests Routes
const interestsRoutes = require("./Interests/interests.routes");

router.use("/user", userRoutes);
router.use("/user", changeEmailAndOtherDetailsRoutes);
router.use("/user", forgotPasswordRoutes);

router.use("/news", newsRoutes);

router.use("/interests", interestsRoutes);

module.exports = router;
