import { openDB } from 'idb'

const DB_NAME = 'spikechat-media'
const STORE_NAME = 'media'

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME)
    }
  },
})

export async function saveMedia(
  id: string,
  file: Blob,
): Promise<void> {
  const db = await dbPromise
  await db.put(STORE_NAME, file, id)
}

export async function loadMedia(
  id: string,
): Promise<Blob | undefined> {
  const db = await dbPromise
  return db.get(STORE_NAME, id)
}

export async function deleteMedia(
  id: string,
): Promise<void> {
  const db = await dbPromise
  await db.delete(STORE_NAME, id)
}