const express = require("express");
const router = express.Router();

const {
  addNewsFromApi,
  getNewsByFilter,
  getNewsForHomePage,
  getSingleNews,
} = require("../../controller/News/news.controller");

const { isAuthenticated } = require("../../utils/auth");
const { errorHandler } = require("../../utils/errorUtils");

router.get("/add-news-from-api", errorHandler, addNewsFromApi);

router.post("/get-news", isAuthenticated, errorHandler, getNewsByFilter);

router.get("/get-news-home", errorHandler, getNewsForHomePage);

router.post("/get-single-news", errorHandler, getSingleNews);


module.exports = router;
