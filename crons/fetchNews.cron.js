const cron = require("node-cron");

cron.schedule("0 */4 * * *", async () => {
  let port = process.env.PORT || 4000;
  await axios.get(`http://localhost:${port}/v1/api/news/add-news-from-api`);
});
