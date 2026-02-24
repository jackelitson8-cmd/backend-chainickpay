const fs = require("fs/promises");
const path = require("path");

const dataDir = path.resolve(process.cwd(), "data");
const dataFile = path.join(dataDir, "users.json");

async function ensureDb() {
  try {
    await fs.access(dataFile);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.writeFile(
      dataFile,
      JSON.stringify({ users: [], refreshTokens: [] }, null, 2),
      "utf-8"
    );
  }
}

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(dataFile, "utf-8");
  return JSON.parse(raw);
}

async function writeDb(payload) {
  await fs.writeFile(dataFile, JSON.stringify(payload, null, 2), "utf-8");
}

module.exports = {
  readDb,
  writeDb,
};
