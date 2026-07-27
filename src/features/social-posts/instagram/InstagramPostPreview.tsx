import {
  Bookmark,
  ChevronLeft,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Repeat2,
  Send,
  ShieldCheck,
} from 'lucide-react'
import { MediaImage } from '../../media/MediaImage'
import { loadPeople } from '../../../storage'
import type { InstagramPost } from '../types'

export function InstagramPostPreview({ post }: { post: InstagramPost }) {
  const person = post.personId
    ? loadPeople().find((item) => item.id === post.personId)
    : undefined
  const handle = person?.handle || post.handle
  const displayName = person?.name || post.displayName
  const profileUrl = person?.photoUrl || post.profileImageUrl

  return (
    <article className={`social-preview instagram-preview ${post.theme}`}>
      {post.showHeader && (
        <div className="social-app-header">
          <ChevronLeft size={26} />
          <strong>Posts</strong>
          <span />
        </div>
      )}
      <div className="instagram-account-row">
        <div className="social-avatar">
          <MediaImage mediaId={post.profileMediaId} fallbackUrl={profileUrl} alt={`${handle} profile`} />
        </div>
        <div className="instagram-account-copy">
          <strong>{handle || 'your_handle'} {post.isVerified && <ShieldCheck size={14} />}</strong>
          {displayName && <span>{displayName}</span>}
          {post.location && <span>{post.location}</span>}
          {post.showMusic && post.musicLabel && <span><Music2 size={12} /> {post.musicLabel}</span>}
        </div>
        {post.showFollowButton && <button type="button" className="follow-button">Follow</button>}
        <MoreHorizontal size={24} />
      </div>
      <MediaImage mediaId={post.mainMediaId} alt="Post" className="instagram-main-image" />
      {post.showEngagement && (
        <div className="instagram-engagement">
          <span><Heart size={25} />{post.likeCount || '0'}</span>
          <span><MessageCircle size={24} />{post.commentCount || '0'}</span>
          <span><Repeat2 size={24} />{post.repostCount || '0'}</span>
          <span><Send size={23} />{post.sendCount || '0'}</span>
          <Bookmark size={24} fill={post.isSaved ? 'currentColor' : 'none'} />
        </div>
      )}
      {post.showCaption && post.caption && (
        <p className="instagram-caption"><strong>{handle || 'your_handle'}</strong> {post.caption}</p>
      )}
      {post.showDate && post.displayedDate && <p className="social-date">{post.displayedDate}</p>}
    </article>
  )
}
