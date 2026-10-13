import Dexie from 'dexie';

export const db = new Dexie('passvault');

db.version(1).stores({
  entries: 'id, title, category, favorite, createdAt, updatedAt',
  meta: 'key',
});

export async function getMeta(key) {
  const row = await db.meta.get(key);
  return row?.value;
}

export async function setMeta(key, value) {
  await db.meta.put({ key, value });
}
