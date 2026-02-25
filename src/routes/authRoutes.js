const { Router } = require("express");
const {
  registerController,
  loginController,
  passwordResetController,
  refreshController,
  logoutController,
  meController,
  googleLoginController,
} = require("../controllers/authController");
const { authMiddleware } = require("../middlewares/authMiddleware");

const authRoutes = Router();

authRoutes.post("/register/", registerController);
authRoutes.post("/login/", loginController);
authRoutes.post("/password/reset/", passwordResetController);
authRoutes.post("/token/refresh/", refreshController);
authRoutes.post("/logout/", logoutController);
authRoutes.post("/google/", googleLoginController);
authRoutes.get("/me/", authMiddleware, meController);

module.exports = { authRoutes };
