import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearSocialPostDefaults,
  loadInstagramDefaults,
  loadRedditDefaults,
  saveInstagramDefaults,
  saveRedditDefaults,
} from './socialPostDefaults'

const values = new Map<string, string>()
vi.stubGlobal('localStorage', {
  getItem: (key: string) => values.get(key) ?? null,
  setItem: (key: string, value: string) => values.set(key, value),
})

describe('social post defaults', () => {
  beforeEach(() => values.clear())

  it('keeps platform defaults independent', () => {
    saveInstagramDefaults({ handle: 'alex', showHeader: false })
    saveRedditDefaults({ subreddit: 'fiction', nsfw: true })
    expect(loadInstagramDefaults()).toMatchObject({ handle: 'alex', showHeader: false })
    expect(loadRedditDefaults()).toMatchObject({ subreddit: 'fiction', nsfw: true })
  })

  it('clears only the selected platform', () => {
    saveInstagramDefaults({ handle: 'alex' })
    saveRedditDefaults({ subreddit: 'fiction' })
    clearSocialPostDefaults('reddit')
    expect(loadInstagramDefaults().handle).toBe('alex')
    expect(loadRedditDefaults()).toEqual({})
  })
})
