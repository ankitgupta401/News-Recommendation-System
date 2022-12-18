const InterestsModel = require("../../models/Interests.model");

exports.createInterests = async (req, res, next) => {
  try {
    const { name, twitterProfiles, hashTags } = req.body;
    let alreadyExists = await InterestsModel.findOne({
      name: { $regex: new RegExp("^" + name + "$", "i") },
    });
    if (alreadyExists) {
      return res.status(400).json({
        status: false,
        data: [],
        message: "Interest Already Exists",
      });
    } else {
      let interest = await InterestsModel.create({
        name,
        twitterProfiles,
        hashTags,
      });
      res.status(201).json({
        status: true,
        data: interest,
        message: "Interest Created Successfully",
      });
    }
  } catch (err) {
    console.log(err);
    let errorMessage = "Server Error";
    if (err.errors) {
      errorMessage =
        err.errors.length > 0 ? err.errors[0].message : "Server Error";
    }
    res.status(500).json({
      status: false,
      data: [],
      message: errorMessage,
    });
  }
};

exports.getInterests = async (req, res, next) => {
  try {
    let interests = await InterestsModel.find({ isDeleted: false });
    res.status(200).json({
      status: true,
      data: interests,
      message: "Interests Fetched Successfully",
    });
  } catch (err) {
    console.log(err);
    let errorMessage = "Server Error";
    if (err.errors) {
      errorMessage =
        err.errors.length > 0 ? err.errors[0].message : "Server Error";
    }
    res.status(500).json({
      status: false,
      data: [],
      message: errorMessage,
    });
  }
};
