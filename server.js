/* eslint-disable no-console */
process.env.NODE_ENV = process.argv[2] === "--prod" ? "PROD" : "DEV";

const http = require("http");
const debug = require("debug");
const app = require("./app");

const port = process.env.PORT || 4000;
app.set("port", port);

const server = http.createServer(app);

app.use((req, res) => {
  res.status(500).json({
    code: false,
    message: "Invalid Api.",
  });
});

const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${port}`;
  switch (error.code) {
    case "EACCES":
      console.error(`\n\nError:\n>> ${bind} requires elevated privileges\n\n`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`\n\nError:\n>> ${bind} is already in use\n\n`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${port}`;
  debug(`\n\nDebug:\n>> Listening on ${bind}\n\n`);
};
server.on("error", onError);
server.on("listening", onListening);
server.listen(port, () => {
  console.log(
    `\n\nServer Started:\n>> http://localhost:${port}\n>> ${process.env.NODE_ENV.trim()} mode\n\n`
  );
});
