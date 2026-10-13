const enc = new TextEncoder();
const dec = new TextDecoder();

const PBKDF2_ITERATIONS = 600_000;
const VERIFIER_PLAINTEXT = 'passvault-verify-v1';

function toBase64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromBase64(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function randomSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

async function deriveKey(password, salt) {
  const base = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export async function createVerifier(password, salt) {
  const key = await deriveKey(password, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(VERIFIER_PLAINTEXT))
  );
  return JSON.stringify({ iv: toBase64(iv), cipher: toBase64(cipher) });
}

export async function checkVerifier(password, salt, verifierJson) {
  try {
    const { iv, cipher } = JSON.parse(verifierJson);
    const key = await deriveKey(password, salt);
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(iv) },
      key,
      fromBase64(cipher)
    );
    return dec.decode(plain) === VERIFIER_PLAINTEXT;
  } catch {
    return false;
  }
}

export async function encryptField(key, text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = enc.encode(text ?? '');
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data));
  return JSON.stringify({ iv: toBase64(iv), cipher: toBase64(cipher) });
}

export async function decryptField(key, payload) {
  if (!payload) return '';
  try {
    const { iv, cipher } = JSON.parse(payload);
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromBase64(iv) },
      key,
      fromBase64(cipher)
    );
    return dec.decode(plain);
  } catch {
    return '';
  }
}

export async function deriveKeyFromPassword(password, salt) {
  return deriveKey(password, salt);
}
