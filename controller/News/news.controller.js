const { TwitterClient } = require("twitter-api-client");
const InterestsModel = require("../../models/Interests.model");
const NewsModel = require("../../models/News.model");

// console.log(process.env);
const twitterClient = new TwitterClient({
  apiKey: process.env.CONSUMER_KEY,
  apiSecret: process.env.CONSUMER_SECRET,
  accessToken: process.env.ACCESS_TOKEN_KEY,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
});

exports.addNewsFromApi = async (req, res, next) => {
  try {
    let allInterests = await InterestsModel.find({ isDeleted: false });

    for (let i = 0; i < allInterests.length; i++) {
      const currInterest = allInterests[i];

      let queryHashTags =
        currInterest.name + " OR " + currInterest.hashTags.join(" OR ");
      let queryTwitterProfiles = currInterest.twitterProfiles
        .map((val) => `from:${val}`)
        .join(" OR ");
      const result = await getTweets(queryHashTags, queryTwitterProfiles);
      let imgMap = {};
      //   console.log(result);
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
        let exists = await NewsModel.findOne({
          postId: tweets[j].id,
        });
        if (!exists) {
          await NewsModel.create({
            postId: tweets[j].id,
            title: tweets[j].text,
            hashTags: tweets[i]?.entities?.hashtags?.map(
              (hashtag) => `${hashtag.tag}`
            ),
            otherDetails: tweets[j],
            source: "twitter",
          });
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
  console.log(
    `(${userProfiles}) (${interests}) has:media -has:mentions -is:retweet`
  );
  let res = await twitterClient.tweetsV2.searchRecentTweets({
    query: `(${userProfiles}) (${interests}) has:media -has:mentions -is:retweet`,
    "tweet.fields":
      "attachments,author_id,context_annotations,conversation_id,created_at,entities,geo,id,in_reply_to_user_id,lang,possibly_sensitive,referenced_tweets,source,text,withheld",
    expansions:
      "attachments.poll_ids,attachments.media_keys,referenced_tweets.id",
    "media.fields":
      "duration_ms,height,media_key,preview_image_url,type,url,width,public_metrics",
    max_results: 50,
  });

  return res;
};

exports.getNewsByFilter = async (req, res, next) => {
  try {
    const { hashTags, search, sort, page = 1, limit = 10 } = req.query;
    let query = {};
    if (hashTags) {
      query.hashTags = { $in: hashTags.split(",") };
    }
    if (search) {
      query.text = { $regex: new RegExp(search, "i") };
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
