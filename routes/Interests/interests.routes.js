const express = require("express");
const { body } = require("express-validator");
const {
  createInterests,
  getInterests,
} = require("../../controller/Interests/interests.controller");
const router = express.Router();

const { isAuthenticated } = require("../../utils/auth");
const { errorHandler } = require("../../utils/errorUtils");

router.post(
  "/create-interests",
  [
    body("name").not().isEmpty(),
    body("twitterProfiles").not().isEmpty(),
    // body("hashTags").not().isEmpty(),
  ],
  isAuthenticated,
  errorHandler,
  createInterests
);

router.get("/get-interests", errorHandler, getInterests);

module.exports = router;
