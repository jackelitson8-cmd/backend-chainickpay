const {
  login,
  logout,
  refreshSession,
  register,
  requestPasswordReset,
  getUserById,
  loginWithGoogle,
} = require("../services/authService");

async function registerController(req, res, next) {
  try {
    const session = await register(req.body || {});
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
}

async function loginController(req, res, next) {
  try {
    const session = await login(req.body || {});
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
}

async function passwordResetController(req, res, next) {
  try {
    const result = await requestPasswordReset(req.body?.email);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function refreshController(req, res, next) {
  try {
    const refresh = req.body?.refresh;
    const session = await refreshSession(refresh);
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
}

async function logoutController(req, res, next) {
  try {
    await logout(req.body?.refresh);
    res.status(200).json({ message: "Logout realizado com sucesso." });
  } catch (error) {
    next(error);
  }
}

async function meController(req, res, next) {
  try {
    const user = await getUserById(req.auth.userId);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
}

async function googleLoginController(req, res, next) {
  try {
    const idToken = req.body?.idToken;
    const session = await loginWithGoogle(idToken);
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerController,
  loginController,
  passwordResetController,
  refreshController,
  logoutController,
  meController,
  googleLoginController,
};
