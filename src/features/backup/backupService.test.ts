import { describe, expect, it, vi } from 'vitest'

vi.mock('../../mediaDb', () => ({
  loadAllMedia: vi.fn(),
  replaceAllMedia: vi.fn(),
}))
import { backupFilename, parseBackupText } from './backupService'

const validBackup = {
  format: 'spikechat-backup',
  version: 1,
  exportedAt: '2026-07-27T12:00:00.000Z',
  people: [],
  messages: [],
  socialPosts: [],
  media: [],
}

describe('backupService', () => {
  it('parses a valid versioned backup', () => {
    expect(parseBackupText(JSON.stringify(validBackup))).toMatchObject({
      format: 'spikechat-backup',
      version: 1,
    })
  })

  it('rejects malformed and unsupported backups', () => {
    expect(() => parseBackupText('{bad json')).toThrow('not valid JSON')
    expect(() =>
      parseBackupText(JSON.stringify({ ...validBackup, version: 2 })),
    ).toThrow('not supported')
  })

  it('creates a predictable dated filename', () => {
    expect(backupFilename(new Date('2026-07-27T12:00:00.000Z'))).toBe(
      'spikechat-backup-2026-07-27.json',
    )
  })
})
