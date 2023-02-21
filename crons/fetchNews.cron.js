const cron = require("node-cron");

cron.schedule("*/5 * * * *", async () => {
  let port = process.env.PORT || 4000;
  console.log("running Cron")
  axios.get(`https://http-nodejs-production-dfb7.up.railway.app/v1/api/news/add-news-from-api`).then((res) => {
    console.log(res.data);
  });
});
