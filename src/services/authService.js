const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { HttpError } = require("../utils/httpError");
const { isStrongPassword, isValidEmail, normalizeEmail } = require("../utils/validators");
const { readDb, writeDb } = require("../repositories/db");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("./tokenService");

const SALT_ROUNDS = 10;

function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

async function buildSession(user) {
  const access = signAccessToken(user);
  const refresh = signRefreshToken(user);
  const db = await readDb();

  db.refreshTokens = db.refreshTokens.filter((item) => item.userId !== user.id);
  db.refreshTokens.push({
    userId: user.id,
    token: refresh.token,
    jti: refresh.jti,
    expiresAt: refresh.expiresAt,
    revokedAt: null,
    createdAt: new Date().toISOString(),
  });
  await writeDb(db);

  return {
    access,
    refresh: refresh.token,
    user: toPublicUser(user),
  };
}

async function register({ email, password, name }) {
  const cleanEmail = normalizeEmail(email);
  const cleanName = String(name || "").trim() || cleanEmail.split("@")[0];

  if (!cleanEmail || !password) {
    throw new HttpError(400, "Email e senha sao obrigatorios.");
  }
  if (!isValidEmail(cleanEmail)) {
    throw new HttpError(400, "Email invalido.");
  }
  if (!isStrongPassword(password)) {
    throw new HttpError(400, "A senha deve ter pelo menos 8 caracteres.");
  }

  const db = await readDb();
  const alreadyExists = db.users.some((user) => user.email === cleanEmail);
  if (alreadyExists) {
    throw new HttpError(409, "Ja existe uma conta com este email.");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const now = new Date().toISOString();
  const user = {
    id: uuidv4(),
    email: cleanEmail,
    name: cleanName,
    passwordHash,
    createdAt: now,
    updatedAt: now,
  };

  db.users.push(user);
  await writeDb(db);

  return buildSession(user);
}

async function login({ email, password }) {
  const cleanEmail = normalizeEmail(email);

  if (!cleanEmail || !password) {
    throw new HttpError(400, "Email e senha sao obrigatorios.");
  }

  const db = await readDb();
  const user = db.users.find((item) => item.email === cleanEmail);
  if (!user) {
    throw new HttpError(401, "Credenciais invalidas.");
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    throw new HttpError(401, "Credenciais invalidas.");
  }

  return buildSession(user);
}

async function refreshSession(refreshToken) {
  if (!refreshToken) {
    throw new HttpError(400, "Refresh token obrigatorio.");
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new HttpError(401, "Refresh token invalido ou expirado.");
  }

  const db = await readDb();
  const tokenRecord = db.refreshTokens.find((item) => item.token === refreshToken);
  if (!tokenRecord || tokenRecord.revokedAt) {
    throw new HttpError(401, "Refresh token invalido.");
  }

  if (payload.jti !== tokenRecord.jti) {
    throw new HttpError(401, "Refresh token invalido.");
  }

  const user = db.users.find((item) => item.id === payload.sub);
  if (!user) {
    throw new HttpError(401, "Usuario nao encontrado.");
  }

  db.refreshTokens = db.refreshTokens.filter((item) => item.token !== refreshToken);
  await writeDb(db);

  return buildSession(user);
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  const db = await readDb();
  const tokenRecord = db.refreshTokens.find((item) => item.token === refreshToken);
  if (!tokenRecord) return;
  tokenRecord.revokedAt = new Date().toISOString();
  await writeDb(db);
}

async function getUserById(userId) {
  const db = await readDb();
  const user = db.users.find((item) => item.id === userId);
  if (!user) {
    throw new HttpError(404, "Usuario nao encontrado.");
  }
  return toPublicUser(user);
}

async function requestPasswordReset(email) {
  const cleanEmail = normalizeEmail(email);
  if (!cleanEmail) {
    throw new HttpError(400, "Email obrigatorio.");
  }
  if (!isValidEmail(cleanEmail)) {
    throw new HttpError(400, "Email invalido.");
  }

  return {
    message:
      "Se este email estiver cadastrado, voce recebera instrucoes para redefinir a senha.",
  };
}

module.exports = {
  register,
  login,
  refreshSession,
  logout,
  getUserById,
  requestPasswordReset,
};
