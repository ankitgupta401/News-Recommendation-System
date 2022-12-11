const { validationResult } = require("express-validator");

exports.errorHandler = (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        status: false,
        message: "invalid inputs",
        errors: errors.array().map(({ msg, param }) => {
          return {
            msg,
            param,
          };
        }),
      });
    } else {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      status: false,
      message: "server error",
    });
  }
};
