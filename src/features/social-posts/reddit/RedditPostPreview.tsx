import {
  ArrowBigDown,
  ArrowBigUp,
  ChevronDown,
  CircleX,
  Filter,
  Image,
  MessageCircle,
  MoreHorizontal,
  Search,
  Share2,
  Sparkles,
} from 'lucide-react'
import { MediaImage } from '../../media/MediaImage'
import type { RedditPost } from '../types'

export function RedditPostPreview({ post }: { post: RedditPost }) {
  return (
    <article className={`social-preview reddit-preview ${post.theme}`}>
      <div className="reddit-topbar">
        {post.showCloseButton ? <CircleX size={25} /> : <span />}
        <strong>r/{post.subreddit || 'community'}</strong>
        <div>
          {post.showSearchButton && <Search size={22} />}
          {post.showFilterButton && <Filter size={21} />}
          {post.showOverflowButton && <MoreHorizontal size={23} />}
          {post.showSubredditIcon && (
            <div className="reddit-community-icon">
              <MediaImage mediaId={post.subredditMediaId} alt="Community" />
            </div>
          )}
        </div>
      </div>
      <div className="reddit-content">
        <div className="reddit-meta">
          <div className="reddit-user-avatar">
            <MediaImage mediaId={post.userMediaId} alt={`${post.username} avatar`} />
          </div>
          <span>u/{post.username || 'username'} · {post.ageLabel || 'now'}{post.isEdited ? ' · edited' : ''}</span>
          {post.showJoinButton && <button type="button" className="join-button">Join</button>}
        </div>
        <h2>{post.title || 'Your post title'}</h2>
        {post.postFlair?.text && (
          <span
            className="post-flair"
            style={{
              background: post.postFlair.backgroundColor || '#334155',
              color: post.postFlair.textColor || '#fff',
            }}
          >
            {post.postFlair.text}
          </span>
        )}
        {post.mainMediaId && <MediaImage mediaId={post.mainMediaId} alt="Post" className="reddit-post-image" />}
        {post.body && <p className="reddit-body">{post.body}</p>}
        <div className="reddit-actions">
          <div className={`reddit-action-group vote-${post.voteState ?? 'neutral'}`}>
            <ArrowBigUp size={23} fill={post.voteState === 'up' ? 'currentColor' : 'none'} />
            <strong>{post.voteCount || '0'}</strong>
            <ArrowBigDown size={23} fill={post.voteState === 'down' ? 'currentColor' : 'none'} />
          </div>
          <div className="reddit-action-group"><MessageCircle size={20} />{post.commentCount || '0'}</div>
          <div className="reddit-action-group"><Sparkles size={20} />{post.repostCount || '0'}</div>
          <div className="reddit-action-group"><Share2 size={20} />{post.shareLabel || 'Share'}</div>
        </div>
      </div>
      {post.showCommentComposer && (
        <div className="reddit-composer">
          <span>{post.commentPlaceholder || 'Join the conversation'}</span>
          {post.showGifButton && <b>GIF</b>}
          {post.showComposerImageButton && <Image size={19} />}
          {post.showComposerCollapseButton && <ChevronDown size={20} />}
        </div>
      )}
    </article>
  )
}
