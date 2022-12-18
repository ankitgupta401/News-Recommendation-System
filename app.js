/* eslint-disable no-unused-vars */
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

const path = require("path");

global.__basedir = __dirname;

const app = express();

// DATABASE CONNECTION
require("./utils/connection");

const api = require("./routes/api");
require("./crons/fetchNews.cron");

app.use(helmet());
app.use(
  express.static(path.join(__dirname, "public"), {
    setHeaders(res, _path, stat) {
      res.set("x-timestamp", Date.now().toString());
    },
  })
);

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());

app.use("/v1/api/", api);

module.exports = app;
