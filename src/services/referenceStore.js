import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const dataDir = path.resolve(process.cwd(), "data");
const storeFile = path.join(dataDir, "references.json");

function ensureStore() {
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  if (!existsSync(storeFile)) {
    writeFileSync(storeFile, JSON.stringify({ users: {} }, null, 2), "utf8");
  }
}

function readStore() {
  ensureStore();
  const raw = readFileSync(storeFile, "utf8");
  return JSON.parse(raw);
}

function saveStore(data) {
  writeFileSync(storeFile, JSON.stringify(data, null, 2), "utf8");
}

function getUserKey(userId, guildId) {
  return `${guildId || "dm"}:${userId}`;
}

export function addReference(userId, guildId, url) {
  const db = readStore();
  const key = getUserKey(userId, guildId);

  if (!db.users[key]) {
    db.users[key] = [];
  }

  if (db.users[key].includes(url)) {
    return db.users[key];
  }

  db.users[key].push(url);
  db.users[key] = db.users[key].slice(-12);
  saveStore(db);

  return db.users[key];
}

export function listReferences(userId, guildId) {
  const db = readStore();
  const key = getUserKey(userId, guildId);
  return db.users[key] || [];
}

export function clearReferences(userId, guildId) {
  const db = readStore();
  const key = getUserKey(userId, guildId);
  db.users[key] = [];
  saveStore(db);
}

export function removeReference(userId, guildId, index) {
  const db = readStore();
  const key = getUserKey(userId, guildId);

  if (!db.users[key] || index < 1 || index > db.users[key].length) {
    return null;
  }

  db.users[key].splice(index - 1, 1);
  saveStore(db);

  return db.users[key];
}
