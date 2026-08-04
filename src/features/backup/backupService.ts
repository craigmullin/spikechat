import { loadAllMedia, replaceAllMedia, type StoredMedia } from '../../mediaDb'
import {
  loadMessages,
  loadPeople,
  saveMessages,
  savePeople,
} from '../../storage'
import {
  loadSocialPosts,
  replaceSocialPosts,
} from '../social-posts/socialPostRepository'
import type { SocialPost } from '../social-posts/types'
import type { Message, Person } from '../../types'

const FORMAT = 'spikechat-backup'
const VERSION = 1

interface BackupMedia {
  id: string
  type: string
  data: string
}

export interface BackupPayload {
  format: typeof FORMAT
  version: typeof VERSION
  exportedAt: string
  people: Person[]
  messages: Message[]
  socialPosts: SocialPost[]
  media: BackupMedia[]
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  const chunkSize = 8192
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize))
  }
  return btoa(binary)
}

function base64ToBlob(media: BackupMedia): StoredMedia {
  const binary = atob(media.data)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }
  return { id: media.id, blob: new Blob([bytes], { type: media.type }) }
}

export async function createBackup(): Promise<BackupPayload> {
  const media = await loadAllMedia()
  return {
    format: FORMAT,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    people: loadPeople(),
    messages: loadMessages(),
    socialPosts: loadSocialPosts(),
    media: await Promise.all(
      media.map(async ({ id, blob }) => ({
        id,
        type: blob.type || 'application/octet-stream',
        data: bytesToBase64(new Uint8Array(await blob.arrayBuffer())),
      })),
    ),
  }
}

export function parseBackupText(text: string): BackupPayload {
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    throw new Error('This file is not valid JSON.')
  }

  if (!value || typeof value !== 'object') {
    throw new Error('This is not a Chat backup.')
  }

  const backup = value as Partial<BackupPayload>
  if (backup.format !== FORMAT || backup.version !== VERSION) {
    throw new Error('This backup format is not supported.')
  }
  if (
    !Array.isArray(backup.people) ||
    !Array.isArray(backup.messages) ||
    !Array.isArray(backup.socialPosts) ||
    !Array.isArray(backup.media) ||
    typeof backup.exportedAt !== 'string'
  ) {
    throw new Error('This Chat backup is incomplete.')
  }
  if (
    backup.media.some(
      (item) =>
        !item ||
        typeof item.id !== 'string' ||
        typeof item.type !== 'string' ||
        typeof item.data !== 'string',
    )
  ) {
    throw new Error('This backup contains invalid media.')
  }
  return backup as BackupPayload
}

export async function restoreBackup(backup: BackupPayload) {
  const media = backup.media.map(base64ToBlob)
  await replaceAllMedia(media)
  savePeople(backup.people)
  saveMessages(backup.messages)
  replaceSocialPosts(backup.socialPosts)
}

export function backupFilename(date = new Date()) {
  return `spikechat-backup-${date.toISOString().slice(0, 10)}.json`
}
