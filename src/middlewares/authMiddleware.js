const { HttpError } = require("../utils/httpError");
const { verifyAccessToken } = require("../services/tokenService");

function authMiddleware(req, _res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return next(new HttpError(401, "Token de acesso ausente."));
  }

  try {
    const payload = verifyAccessToken(token);
    req.auth = {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    return next();
  } catch {
    return next(new HttpError(401, "Token de acesso invalido ou expirado."));
  }
}

module.exports = { authMiddleware };
