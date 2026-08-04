import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { InstagramPost, RedditPost } from './types'

const { deleteMedia } = vi.hoisted(() => ({
  deleteMedia: vi.fn(),
}))

vi.mock('../../mediaDb', () => ({ deleteMedia }))

const values = new Map<string, string>()
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  },
  configurable: true,
})

import {
  deleteSocialPost,
  loadSocialPost,
  loadSocialPosts,
  saveSocialPost,
} from './socialPostRepository'

const instagram: InstagramPost = {
  id: 'instagram-1', platform: 'instagram',
  createdAt: '2026-07-27T00:00:00.000Z',
  updatedAt: '2026-07-27T00:00:00.000Z',
  theme: 'dark', handle: 'sample', mainMediaId: 'shared-image',
  caption: 'A caption', showHeader: true, showFollowButton: true,
  showEngagement: true, showCaption: true, showDate: true, showMusic: true,
}

const reddit: RedditPost = {
  id: 'reddit-1', platform: 'reddit',
  createdAt: '2026-07-27T00:00:00.000Z',
  updatedAt: '2026-07-27T00:00:00.000Z',
  theme: 'dark', subreddit: 'Chat', username: 'sample',
  title: 'A title', mainMediaId: 'shared-image', showJoinButton: true,
  showCloseButton: true, showSearchButton: true, showFilterButton: true,
  showOverflowButton: true, showSubredditIcon: true,
  showCommentComposer: true, showGifButton: true,
  showComposerImageButton: true, showComposerCollapseButton: true,
}

const redditCard: RedditPost = {
  ...reddit,
  id: 'reddit-card-1',
  presentation: 'card',
  title: 'A card title',
}

describe('socialPostRepository', () => {
  beforeEach(() => {
    values.clear()
    deleteMedia.mockClear()
  })

  it('saves, reloads, and updates both post types', () => {
    saveSocialPost(instagram)
    saveSocialPost(reddit)
    saveSocialPost({ ...instagram, caption: 'Updated caption' })
    expect(loadSocialPosts()).toHaveLength(2)
    expect(loadSocialPost('instagram-1')).toMatchObject({
      platform: 'instagram',
      caption: 'Updated caption',
    })
  })

  it('reloads editable Instagram, Reddit post, and Reddit card records', () => {
    saveSocialPost(instagram)
    saveSocialPost(reddit)
    saveSocialPost(redditCard)

    saveSocialPost({ ...instagram, caption: 'Edited Instagram caption' })
    saveSocialPost({ ...reddit, title: 'Edited Reddit post' })
    saveSocialPost({ ...redditCard, title: 'Edited Reddit card' })

    expect(loadSocialPost(instagram.id)).toMatchObject({ caption: 'Edited Instagram caption' })
    expect(loadSocialPost(reddit.id)).toMatchObject({ title: 'Edited Reddit post' })
    expect((loadSocialPost(reddit.id) as RedditPost).presentation ?? 'post').toBe('post')
    expect(loadSocialPost(redditCard.id)).toMatchObject({ presentation: 'card', title: 'Edited Reddit card' })
    expect(loadSocialPosts()).toHaveLength(3)
  })

  it('retains media referenced by another post', async () => {
    saveSocialPost(instagram)
    saveSocialPost(reddit)
    await deleteSocialPost(instagram.id)
    expect(deleteMedia).not.toHaveBeenCalledWith('shared-image')
  })

  it('deletes media after its final reference is removed', async () => {
    saveSocialPost(instagram)
    await deleteSocialPost(instagram.id)
    expect(deleteMedia).toHaveBeenCalledWith('shared-image')
  })
})
