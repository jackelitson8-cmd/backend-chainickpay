const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const env = {
  port: Number(process.env.PORT || 4000),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || "change-me-access-secret",
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || "change-me-refresh-secret",
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  chatTtlHours: Number(process.env.CHAT_TTL_HOURS || 24),
  chatMaxMessages: Number(process.env.CHAT_MAX_MESSAGES || 200),
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
};

module.exports = { env };
