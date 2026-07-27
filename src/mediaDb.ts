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

export interface StoredMedia {
  id: string
  blob: Blob
}

export async function loadAllMedia(): Promise<StoredMedia[]> {
  const db = await dbPromise
  const transaction = db.transaction(STORE_NAME, 'readonly')
  const [keys, blobs] = await Promise.all([
    transaction.store.getAllKeys(),
    transaction.store.getAll(),
  ])
  await transaction.done
  return keys.map((key, index) => ({
    id: String(key),
    blob: blobs[index],
  }))
}

export async function replaceAllMedia(
  media: StoredMedia[],
): Promise<void> {
  const db = await dbPromise
  const transaction = db.transaction(STORE_NAME, 'readwrite')
  await transaction.store.clear()
  await Promise.all(
    media.map(({ id, blob }) => transaction.store.put(blob, id)),
  )
  await transaction.done
}
