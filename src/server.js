const { app } = require("./app");
const { env } = require("./config/env");

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth API running at http://localhost:${env.port}`);
});
