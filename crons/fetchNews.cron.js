const cron = require("node-cron");
const axios = require('axios');

cron.schedule("0 */4 * * *", async () => {
  let port = process.env.PORT || 4000;
  console.log("running Cron")
  axios.get(`https://http-nodejs-production-dfb7.up.railway.app/v1/api/news/add-news-from-api`).then((res) => {
    console.log(res.data);
  });
});
