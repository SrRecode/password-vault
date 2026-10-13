import { db, getMeta, setMeta } from '../database/db';
import {
  randomSalt,
  createVerifier,
  checkVerifier,
  encryptField,
  decryptField,
  deriveKeyFromPassword,
} from '../crypto/vaultCrypto';

let sessionKey = null;

const SALT_KEY = 'salt';
const VERIFIER_KEY = 'verifier';

export function isUnlocked() {
  return sessionKey !== null;
}

export async function isVaultInitialized() {
  return (await getMeta(SALT_KEY)) != null;
}

export function newId() {
  return crypto.randomUUID();
}

function saltFromMeta(raw) {
  const bytes = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

export async function setupVault(password) {
  const salt = randomSalt();
  const verifier = await createVerifier(password, salt);
  await setMeta(SALT_KEY, String.fromCharCode(...salt));
  await setMeta(VERIFIER_KEY, verifier);
  sessionKey = await deriveKeyFromPassword(password, salt);
}

export async function unlockVault(password) {
  const saltRaw = await getMeta(SALT_KEY);
  const verifier = await getMeta(VERIFIER_KEY);
  if (!saltRaw || !verifier) throw new Error('vault-not-initialized');
  const ok = await checkVerifier(password, saltFromMeta(saltRaw), verifier);
  if (!ok) throw new Error('wrong-password');
  sessionKey = await deriveKeyFromPassword(password, saltFromMeta(saltRaw));
}

export function lockVault() {
  sessionKey = null;
}

function requireKey() {
  if (!sessionKey) throw new Error('vault-locked');
  return sessionKey;
}

export async function listEntries() {
  const rows = await db.entries.orderBy('updatedAt').reverse().toArray();
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    favorite: r.favorite,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export async function getEntry(id) {
  const key = requireKey();
  const r = await db.entries.get(id);
  if (!r) return null;
  const [username, password, notes] = await Promise.all([
    decryptField(key, r.username),
    decryptField(key, r.password),
    decryptField(key, r.notes),
  ]);
  return {
    id: r.id,
    title: r.title,
    username,
    password,
    url: r.url,
    notes,
    favorite: r.favorite,
    category: r.category,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export async function saveEntry(entry) {
  const key = requireKey();
  const now = Date.now();
  const [username, password, notes] = await Promise.all([
    encryptField(key, entry.username),
    encryptField(key, entry.password),
    encryptField(key, entry.notes),
  ]);
  const row = {
    id: entry.id || newId(),
    title: entry.title.trim() || 'Untitled',
    username,
    password,
    url: (entry.url || '').trim(),
    notes,
    favorite: !!entry.favorite,
    category: (entry.category || 'General').trim() || 'General',
    createdAt: entry.createdAt || now,
    updatedAt: now,
  };
  await db.entries.put(row);
  return row.id;
}

export async function deleteEntry(id) {
  await db.entries.delete(id);
}

export async function wipeVault() {
  await db.entries.clear();
  await db.meta.clear();
  sessionKey = null;
}

export async function dumpVault() {
  const [entries, salt, verifier] = await Promise.all([
    db.entries.toArray(),
    getMeta(SALT_KEY),
    getMeta(VERIFIER_KEY),
  ]);
  return {
    format: 'passvault-backup',
    version: 1,
    exportedAt: new Date().toISOString(),
    salt,
    verifier,
    entries,
  };
}

export async function importVault(data) {
  if (data?.format !== 'passvault-backup' || !Array.isArray(data.entries)) {
    throw new Error('not-backup');
  }
  await db.transaction('rw', [db.entries, db.meta], async () => {
    await db.entries.clear();
    await db.meta.clear();
    if (data.salt != null) await setMeta(SALT_KEY, data.salt);
    if (data.verifier != null) await setMeta(VERIFIER_KEY, data.verifier);
    for (const row of data.entries) await db.entries.put(row);
  });
}
