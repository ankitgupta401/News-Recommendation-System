const { TwitterClient } = require("twitter-api-client");
const moment = require("moment")
const InterestsModel = require("../../models/Interests.model");
const NewsModel = require("../../models/News.model");
const User = require("../../models/User.model");
const urlMetadata = require('url-metadata');
const jwt = require("jsonwebtoken");
// console.log(process.env);
const twitterClient = new TwitterClient({
  apiKey: process.env.CONSUMER_KEY,
  apiSecret: process.env.CONSUMER_SECRET,
  accessToken: process.env.ACCESS_TOKEN_KEY,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
});

exports.addNewsFromApi = async (req, res, next) => {
  try {
    let allInterests = await InterestsModel.find({ name: "Religion and spirituality", isDeleted: false });

    for (let i = 0; i < allInterests.length; i++) {
      const currInterest = allInterests[i];

      let queryHashTags;
      if (currInterest.hashTags.length > 0) {
        queryHashTags = currInterest.name + " OR " + currInterest.hashTags.join(" OR ");
      }
      let queryTwitterProfiles = currInterest.twitterProfiles
        .map((val) => `from:${val}`)
        .join(" OR ");
      const result = await getTweets(queryHashTags, queryTwitterProfiles);
      let imgMap = {};

      if (result && result?.data?.length) {
        result?.includes?.media?.forEach((media) => {
          imgMap[media.media_key] = media;
        });
        let tweets = result.data.map((tweet) => {
          return {
            ...tweet,
            media: tweet.attachments
              ? tweet.attachments.media_keys.map((key) => imgMap[key])
              : [],
          };
        });
        //   console.log(tweets.length);
        //   let hashTags = [...currInterest.hashTags];
        //   if (hashTags.length < 20) {
        //     hashTags = [
        //       ...hashTags,
        //       ...tweets
        //         .map((tweet) => {
        //           return tweet?.entities?.hashtags?.map(
        //             (hashtag) => `#${hashtag.tag}`
        //           );
        //         })
        //         .filter((val) => val)
        //         .flat(),
        //     ];
        //     currInterest.hashTags = [...new Set(hashTags)];
        //     await currInterest.save();
        //   }

        for (let j = 0; j < tweets.length; j++) {
          if (tweets[j].text.length > 100 && tweets[j].media.length) {
            let exists = await NewsModel.findOne({
              postId: tweets[j].id,
            });
            let hashTags = tweets[j]?.entities?.hashtags?.map(
              (hashtag) => `#${hashtag.tag.toLowerCase()}`
            );
            if (!hashTags || !hashTags.length || !currInterest.hashTags.length) {
              hashTags = [`#${currInterest.name}`]
            }
            if (!exists) {
              await NewsModel.create({
                postId: tweets[j].id,
                title: tweets[j].text,
                hashTags: hashTags,
                otherDetails: tweets[j],
                source: "twitter",
                interestName: currInterest.name
              });
            }
          }

        }
      }
    }
    res.status(201).json({
      status: true,
      data: [],
      message: "News Added Successfully",
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

const getTweets = async (interests, userProfiles) => {

  let query = `(${userProfiles}) (${interests}) has:media -has:mentions -is:retweet`
  if (!interests) {
    query = `(${userProfiles}) has:media -has:mentions -is:retweet`
  }
  console.log(query)
  let res = await twitterClient.tweetsV2.searchRecentTweets({
    query: query,
    "tweet.fields":
      "attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld",
    expansions:
      "attachments.poll_ids,attachments.media_keys,referenced_tweets.id",
    "media.fields":
      "duration_ms,height,media_key,preview_image_url,type,url,width,public_metrics,variants",
    max_results: 50,
  });

  return res;
};

exports.getNewsByFilter = async (req, res, next) => {
  try {
    const { hashTags, search, sort, page = 1, limit = 10 } = req.body;
    let query = {};
    if (hashTags) {
      query.hashTags = { $in: hashTags.split(",") };
    }
    if (search) {
      query.title = { $regex: new RegExp(search, "gi") };
    }
    let sortQuery = { createdAt: -1 };
    if (sort) {
      sortQuery = sort;
    }

    const news = await NewsModel.find(query)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await NewsModel.countDocuments(query);

    res.status(200).json({
      status: true,
      data: { total: total, data: news, page: page, limit: limit },
      message: "News Fetched Successfully",
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



exports.getNewsForHomePage = async (req, res) => {
  try {
    let startDate = moment().subtract(7, 'days').toISOString();
    let user;
    let token = req.headers.authorization
      ? req.headers.authorization.split(" ")[1]
      : null;

    if (token) {
      let decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      user = await User.findOne({
        _id: decoded._id,
        isDeleted: false,
      });
    }
    const userInterests = user?.interests || [];

    const interestsHashTags = await InterestsModel.find({ name: { $in: userInterests }, isDeleted: false }).lean();

    let hashTags = interestsHashTags.map(val =>
      val.name
    ).flat();

    let firstIds = [];
    let body = {};


    const trending = await NewsModel.find({ interestName: { $in: hashTags }, createdAt: { $gte: startDate }, isDeleted: false }).sort({ views: 'desc' }).limit(10);
    trending.forEach(val => {
      firstIds.push(val._id)
    })

    body = { _id: { $nin: firstIds }, interestName: { $in: hashTags }, isDeleted: false }
    if (!hashTags.length) {
      delete body.interestName;
    }
    const forYou = await NewsModel.find(body).sort({ views: 'desc' }).limit(4)
    forYou.forEach(val => {
      firstIds.push(val._id)
    })


    body = { _id: { $nin: firstIds }, interestName: { $in: hashTags }, isDeleted: false }
    if (!hashTags.length) {
      delete body.interestName;
    }
    const latest = await NewsModel.find(body).sort({ createdAt: -1 }).limit(4)
    latest.forEach(val => {
      firstIds.push(val._id)
    })

    body = { _id: { $nin: firstIds }, interestName: { $in: hashTags }, createdAt: { $gte: startDate }, isDeleted: false }
    if (!hashTags.length) {
      delete body.interestName;
    }
    const weeklyTop = await NewsModel.find(body).sort({ views: 'desc' }).limit(4);
    weeklyTop.forEach(val => {
      firstIds.push(val._id)
    })

    body = { _id: { $nin: firstIds }, interestName: { $in: hashTags }, isDeleted: false }
    if (!hashTags.length) {
      delete body.interestName;
    }
    const recent = await NewsModel.find(body).sort({ createdAt: -1 }).limit(4);


    res.status(200).json({
      status: true,
      data: {
        trending,
        forYou,
        latest,
        weeklyTop,
        recent
      },
      message: 'Fetched Successfully'
    })

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
}


exports.getSingleNews = async (req, res) => {
  try {
    const { newsId } = req.body
    const news = await NewsModel.findOne({ _id: newsId, isDeleted: false });

    news.views += 1;
    await news.save();

    const userInterests = req?.user?.interests || [];
    const interestsHashTags = await InterestsModel.find({ name: { $in: userInterests }, isDeleted: false }).lean();
    let hashTags = interestsHashTags.map(val => {
      val.hashTags
    }).flat();

    hashTags = hashTags.map(val => val.toLowerCase());
    body = { hashTags: { $in: hashTags }, isDeleted: false }
    if (!hashTags.length) {
      delete body.hashTags;
    }
    const recent = await NewsModel.find(body).sort({ createdAt: -1 }).limit(4);

    res.status(200).json({
      status: true,
      data: { news, recent },
      message: 'Fetched Successfully'
    })

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
}

exports.getPreviewData = async (req, res) => {
  try {

    let { url } = req.query;

    // url = decodeSafeUrl(url);

    const resp = await urlMetadata(url);
    res.send(resp)
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


}

const decodeSafeUrl = (value) => {
  const valueBase64 = decodeURI(value);
  return Buffer.from(valueBase64, 'base64').toString('utf8');
}