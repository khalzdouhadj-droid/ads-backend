const fs = require("fs");
const path = require("path");

const FILE = path.join(__dirname, "tokens.json");

function readAll() {
  if (!fs.existsSync(FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8"));
  } catch {
    return {};
  }
}

function writeAll(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function saveToken(platform, tokenData) {
  const all = readAll();
  all[platform] = { ...tokenData, savedAt: new Date().toISOString() };
  writeAll(all);
}

function getToken(platform) {
  const all = readAll();
  return all[platform] || null;
}

module.exports = { saveToken, getToken };
