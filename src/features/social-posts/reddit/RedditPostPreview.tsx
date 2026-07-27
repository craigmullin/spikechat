import {
  ArrowBigDown, ArrowBigUp, ChevronDown, CircleX, Filter, Image,
  MessageCircle, MoreHorizontal, Search, Share2, Sparkles,
} from 'lucide-react'
import { MediaImage } from '../../media/MediaImage'
import { loadPeople } from '../../../storage'
import { redditProfile } from '../../people/identity'
import type { FictionalComment, RedditPost } from '../types'

function Comment({ comment, reply = false }: { comment: FictionalComment; reply?: boolean }) {
  return (
    <div className={`reddit-comment ${reply ? 'reply' : ''}`}>
      <small>u/{comment.author}{comment.isCreator ? ' · OP' : ''} · {comment.ageLabel || 'now'}</small>
      <p>{comment.text}</p>
      {comment.likeCount && <span>{comment.likeCount} votes</span>}
      {comment.replies?.map((child) => <Comment key={child.id} comment={child} reply />)}
    </div>
  )
}

export function RedditPostPreview({ post }: { post: RedditPost }) {
  const person = post.personId ? loadPeople().find((item) => item.id === post.personId) : undefined
  const identity = person ? redditProfile(person) : undefined
  const username = identity?.username || post.username
  const userImageUrl = identity?.photoUrl || post.userImageUrl

  return (
    <article className={`social-preview reddit-preview ${post.theme}`}>
      <div className="reddit-topbar">
        {post.showCloseButton ? <CircleX size={25} /> : <span />}
        <strong>r/{post.subreddit || 'community'}</strong>
        <div>
          {post.showSearchButton && <Search size={22} />}
          {post.showFilterButton && <Filter size={21} />}
          {post.showOverflowButton && <MoreHorizontal size={23} />}
          {post.showSubredditIcon && <div className="reddit-community-icon"><MediaImage mediaId={post.subredditMediaId} alt="Community" /></div>}
        </div>
      </div>
      <div className="reddit-content">
        <div className="reddit-meta">
          <div className="reddit-user-avatar"><MediaImage mediaId={post.userMediaId} fallbackUrl={userImageUrl} alt={`${username} avatar`} /></div>
          <span>u/{username || 'username'} · {post.ageLabel || 'now'}{post.isEdited ? ' · edited' : ''}</span>
          {post.showJoinButton && <button type="button" className="join-button">Join</button>}
        </div>
        <h2>{post.title || 'Your post title'}</h2>
        <div className="reddit-labels">
          {post.isPinned && <span className="post-indicator">Pinned</span>}
          {post.contentWarning && <span className="post-indicator warning">{post.contentWarning}</span>}
          {post.isSpoiler && <span className="post-indicator warning">Spoiler</span>}
        </div>
        {post.postFlair?.text && <span className="post-flair" style={{ background: post.postFlair.backgroundColor || '#334155', color: post.postFlair.textColor || '#fff' }}>{post.postFlair.text}</span>}
        {post.mainMediaId && <MediaImage mediaId={post.mainMediaId} alt="Post" className="reddit-post-image" />}
        {post.body && <p className="reddit-body">{post.body}</p>}
        <div className="reddit-actions">
          <div className={`reddit-action-group vote-${post.voteState ?? 'neutral'}`}><ArrowBigUp size={23} fill={post.voteState === 'up' ? 'currentColor' : 'none'} /><strong>{post.voteCount || '0'}</strong><ArrowBigDown size={23} fill={post.voteState === 'down' ? 'currentColor' : 'none'} /></div>
          <div className="reddit-action-group"><MessageCircle size={20} />{post.commentCount || '0'}</div>
          <div className="reddit-action-group"><Sparkles size={20} />{post.repostCount || '0'}</div>
          <div className="reddit-action-group"><Share2 size={20} />{post.shareLabel || 'Share'}</div>
        </div>
        {post.comments && post.comments.length > 0 && <div className="fictional-comments reddit-comments">{post.comments.map((comment) => <Comment key={comment.id} comment={comment} />)}</div>}
      </div>
      {post.showCommentComposer && <div className="reddit-composer"><span>{post.commentPlaceholder || 'Join the conversation'}</span>{post.showGifButton && <b>GIF</b>}{post.showComposerImageButton && <Image size={19} />}{post.showComposerCollapseButton && <ChevronDown size={20} />}</div>}
    </article>
  )
}
