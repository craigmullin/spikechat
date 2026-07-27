import type { Theme } from './types'

const KEY = 'spikechat.social-post-defaults'

export interface InstagramPostDefaults {
  handle?: string
  displayName?: string
  location?: string
  music?: string
  displayedDate?: string
  likes?: string
  comments?: string
  reposts?: string
  sends?: string
  savedPost?: boolean
  verified?: boolean
  showHeader?: boolean
  showFollow?: boolean
  showEngagement?: boolean
  showCaption?: boolean
  showDate?: boolean
  showMusic?: boolean
  theme?: Theme
}

export interface RedditPostDefaults {
  subreddit?: string
  communitySubtitle?: string
  username?: string
  age?: string
  flair?: string
  flairBackground?: string
  flairTextColor?: string
  votes?: string
  comments?: string
  reposts?: string
  shareLabel?: string
  voteState?: 'up' | 'down' | 'neutral'
  edited?: boolean
  pinned?: boolean
  spoiler?: boolean
  nsfw?: boolean
  nsfwLabel?: string
  contentWarning?: string
  showJoin?: boolean
  showClose?: boolean
  showSearch?: boolean
  showHeaderShare?: boolean
  showFilter?: boolean
  showOverflow?: boolean
  showSubredditIcon?: boolean
  showComposer?: boolean
  commentPlaceholder?: string
  showGif?: boolean
  showComposerImage?: boolean
  showComposerCollapse?: boolean
  showBottomNavigation?: boolean
  inboxBadge?: string
  theme?: Theme
}

interface SocialPostDefaults {
  instagram?: InstagramPostDefaults
  reddit?: RedditPostDefaults
}

function loadAll(): SocialPostDefaults {
  try {
    const value = localStorage.getItem(KEY)
    return value ? JSON.parse(value) : {}
  } catch {
    return {}
  }
}

export function loadInstagramDefaults() {
  return loadAll().instagram ?? {}
}

export function loadRedditDefaults() {
  return loadAll().reddit ?? {}
}

export function saveInstagramDefaults(defaults: InstagramPostDefaults) {
  localStorage.setItem(KEY, JSON.stringify({ ...loadAll(), instagram: defaults }))
}

export function saveRedditDefaults(defaults: RedditPostDefaults) {
  localStorage.setItem(KEY, JSON.stringify({ ...loadAll(), reddit: defaults }))
}

export function clearSocialPostDefaults(platform: 'instagram' | 'reddit') {
  const defaults = loadAll()
  delete defaults[platform]
  localStorage.setItem(KEY, JSON.stringify(defaults))
}
