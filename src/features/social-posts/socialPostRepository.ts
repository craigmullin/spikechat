import { deleteMedia } from '../../mediaDb'
import type { SocialPost } from './types'

const KEY = 'spikechat.social-posts'

export function loadSocialPosts(): SocialPost[] {
  try {
    const value = localStorage.getItem(KEY)
    return value ? JSON.parse(value) : []
  } catch {
    return []
  }
}

export function loadSocialPost(id: string) {
  return loadSocialPosts().find((post) => post.id === id)
}

export function saveSocialPost(post: SocialPost) {
  const posts = loadSocialPosts()
  const exists = posts.some((item) => item.id === post.id)
  localStorage.setItem(
    KEY,
    JSON.stringify(exists ? posts.map((item) => item.id === post.id ? post : item) : [post, ...posts]),
  )
}

function mediaIds(post: SocialPost) {
  return post.platform === 'instagram'
    ? [post.profileMediaId, post.mainMediaId]
    : [post.subredditMediaId, post.userMediaId, post.mainMediaId]
}

export async function deleteSocialPost(id: string) {
  const posts = loadSocialPosts()
  const post = posts.find((item) => item.id === id)
  if (!post) return
  const remaining = posts.filter((item) => item.id !== id)
  const stillUsed = new Set(remaining.flatMap(mediaIds).filter(Boolean))
  await Promise.all(
    mediaIds(post)
      .filter((mediaId): mediaId is string => Boolean(mediaId) && !stillUsed.has(mediaId))
      .map((mediaId) => deleteMedia(mediaId)),
  )
  localStorage.setItem(KEY, JSON.stringify(remaining))
}
