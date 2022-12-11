const mongoose = require("mongoose");

let DATABASE_NAME =
  process.env.NODE_ENV === "PROD"
    ? process.env.PROD_DATABASE_NAME
    : process.env.DEV_DATABASE_NAME;
let DATABASE_USER =
  process.env.NODE_ENV === "PROD"
    ? process.env.PROD_DATABASE_USER
    : process.env.DEV_DATABASE_USER;
let DATABASE_PASSWORD =
  process.env.NODE_ENV === "PROD"
    ? process.env.PROD_DATABASE_PASSWORD
    : process.env.DEV_DATABASE_PASSWORD;
let DATABASE_SERVER =
  process.env.NODE_ENV === "PROD"
    ? process.env.PROD_DATABASE_SERVER
    : process.env.DEV_DATABASE_SERVER;
let DATABASE_PORT =
  process.env.NODE_ENV === "PROD"
    ? process.env.PROD_DATABASE_PORT
    : process.env.DEV_DATABASE_PORT;

const uri = `mongodb+srv://${DATABASE_USER}:${encodeURIComponent(
  DATABASE_PASSWORD
)}@${DATABASE_SERVER}/${DATABASE_NAME}?retryWrites=true&w=majority`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    // useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Database");
  })
  .catch((err) => {
    console.log("Connection Failed", err);
  });

module.exports = mongoose;

global.mongoose = mongoose;
