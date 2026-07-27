export type SocialPlatform = 'instagram' | 'reddit'
export type Theme = 'dark' | 'light'

interface BasePost {
  id: string
  platform: SocialPlatform
  createdAt: string
  updatedAt: string
  theme: Theme
}

export interface FictionalComment {
  id: string
  author: string
  text: string
  ageLabel?: string
  likeCount?: string
  isCreator?: boolean
  replies?: FictionalComment[]
}

export interface InstagramPost extends BasePost {
  platform: 'instagram'
  personId?: string
  handle: string
  displayName?: string
  profileMediaId?: string
  profileImageUrl?: string
  mainMediaId: string
  carouselMediaIds?: string[]
  caption: string
  location?: string
  musicLabel?: string
  displayedDate?: string
  likeCount?: string
  commentCount?: string
  repostCount?: string
  sendCount?: string
  isSaved?: boolean
  isVerified?: boolean
  comments?: FictionalComment[]
  showHeader: boolean
  showFollowButton: boolean
  showEngagement: boolean
  showCaption: boolean
  showDate: boolean
  showMusic: boolean
}

export interface RedditPost extends BasePost {
  platform: 'reddit'
  subreddit: string
  subredditMediaId?: string
  username: string
  personId?: string
  userMediaId?: string
  userImageUrl?: string
  ageLabel?: string
  isEdited?: boolean
  isPinned?: boolean
  isSpoiler?: boolean
  contentWarning?: string
  title: string
  body?: string
  mainMediaId?: string
  postFlair?: {
    text: string
    backgroundColor?: string
    textColor?: string
  }
  voteCount?: string
  commentCount?: string
  repostCount?: string
  shareLabel?: string
  voteState?: 'up' | 'down' | 'neutral'
  comments?: FictionalComment[]
  showJoinButton: boolean
  showCloseButton: boolean
  showSearchButton: boolean
  showFilterButton: boolean
  showOverflowButton: boolean
  showSubredditIcon: boolean
  showCommentComposer: boolean
  commentPlaceholder?: string
  showGifButton: boolean
  showComposerImageButton: boolean
  showComposerCollapseButton: boolean
}

export type SocialPost = InstagramPost | RedditPost
