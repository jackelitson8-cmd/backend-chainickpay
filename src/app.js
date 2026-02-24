const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const { env } = require("./config/env");
const { authRoutes } = require("./routes/authRoutes");
const { HttpError } = require("./utils/httpError");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin === "*" ? true : env.corsOrigin,
    credentials: false,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);

app.use((_req, _res, next) => {
  next(new HttpError(404, "Rota nao encontrada."));
});

app.use((error, _req, res, _next) => {
  const status = error?.status || 500;
  const message = error?.message || "Erro interno do servidor.";
  res.status(status).json({ message });
});

module.exports = { app };
