import {
  ArrowBigDown,
  ArrowBigUp,
  ArrowLeft,
  Bell,
  House,
  MessageCircle,
  MoreVertical,
  Plus,
  Repeat2,
  Search,
  Share2,
  UserRound,
} from 'lucide-react'
import { MediaImage } from '../../media/MediaImage'
import { loadPeople } from '../../../storage'
import { redditProfile } from '../../people/identity'
import type { FictionalComment, RedditPost } from '../types'

function Comment({ comment, reply = false }: { comment: FictionalComment; reply?: boolean }) {
  return (
    <div className={`reddit-comment ${reply ? 'reply' : ''}`}>
      <small>{comment.author}{comment.isCreator ? ' · OP' : ''} · {comment.ageLabel || 'now'}</small>
      <p>{comment.text}</p>
      {comment.likeCount && <span>{comment.likeCount} votes</span>}
      {comment.replies?.map((child) => <Comment key={child.id} comment={child} reply />)}
    </div>
  )
}

function RedditFeedCard({ post }: { post: RedditPost }) {
  const person = post.personId
    ? loadPeople().find((item) => item.id === post.personId)
    : undefined
  const identity = person ? redditProfile(person) : undefined
  const username = identity?.username || post.username
  const legacyNsfw = post.contentWarning?.trim().toUpperCase() === 'NSFW'
  const showNsfw = post.isNsfw || legacyNsfw

  return (
    <article className={`social-preview reddit-preview reddit-feed-card ${post.theme}`}>
      <header className="reddit-card-header">
        {post.showSubredditIcon ? (
          <div className="reddit-community-avatar">
            {post.subredditMediaId
              ? <MediaImage mediaId={post.subredditMediaId} alt={`r/${post.subreddit} icon`} />
              : <span>r/</span>}
          </div>
        ) : <span />}
        <div className="reddit-card-account">
          <strong>r/{post.subreddit || 'community'}</strong>
          <span>u/{username || 'username'} · {post.ageLabel || 'now'}{post.isEdited ? ' · edited' : ''}</span>
        </div>
        {post.showJoinButton && <button type="button" className="reddit-card-join">Join</button>}
        {post.showOverflowButton && <MoreVertical size={22} />}
      </header>

      <div className="reddit-card-content">
        {showNsfw && (
          <div className="reddit-nsfw-row">
            <span className="reddit-18-badge"><b>18</b></span>
            <strong>{post.nsfwLabel || 'NSFW'}</strong>
          </div>
        )}
        {post.postFlair?.text && (
          <span
            className="reddit-post-flair"
            style={{
              background: post.postFlair.backgroundColor || '#e72678',
              color: post.postFlair.textColor || '#fff',
            }}
          >
            {post.postFlair.text}
          </span>
        )}
        <h1>{post.title || 'Your post title'}</h1>
        {post.mainMediaId && <MediaImage mediaId={post.mainMediaId} alt="Post" className="reddit-card-image" />}
        {post.body && <p className="reddit-body">{post.body}</p>}
      </div>

      <footer className="reddit-actions reddit-card-actions">
        <div className={`reddit-action-group reddit-vote-group vote-${post.voteState ?? 'neutral'}`}>
          <ArrowBigUp size={22} fill={post.voteState === 'up' ? 'currentColor' : 'none'} />
          <strong>{post.voteCount || '0'}</strong>
          <i />
          <ArrowBigDown size={22} fill={post.voteState === 'down' ? 'currentColor' : 'none'} />
        </div>
        <div className="reddit-action-group">
          <MessageCircle size={21} />
          {post.commentCount || '0'}
        </div>
        <span className="reddit-action-spacer" />
        <div className="reddit-action-group reddit-icon-action">
          <Repeat2 size={20} />
          {post.repostCount && <span>{post.repostCount}</span>}
        </div>
        <div className="reddit-action-group reddit-icon-action"><Share2 size={21} /></div>
      </footer>
    </article>
  )
}

export function RedditPostPreview({ post }: { post: RedditPost }) {
  if (post.presentation === 'card') return <RedditFeedCard post={post} />

  const person = post.personId
    ? loadPeople().find((item) => item.id === post.personId)
    : undefined
  const identity = person ? redditProfile(person) : undefined
  const username = identity?.username || post.username
  const userImageUrl = identity?.photoUrl || post.userImageUrl
  const legacyNsfw = post.contentWarning?.trim().toUpperCase() === 'NSFW'
  const showNsfw = post.isNsfw || legacyNsfw

  return (
    <article className={`social-preview reddit-preview ${post.theme}`}>
      <header className="reddit-community-header">
        {post.showCloseButton ? <ArrowLeft size={31} strokeWidth={2.2} /> : <span />}
        <div className="reddit-community-copy">
          <strong>r/{post.subreddit || 'community'}</strong>
          {post.communitySubtitle && <span>{post.communitySubtitle}</span>}
        </div>
        {post.showSearchButton && <Search size={27} />}
        {post.showHeaderShareButton !== false && <Share2 size={27} />}
        {post.showJoinButton && <button type="button" className="reddit-header-join">Join</button>}
      </header>

      <main className="reddit-post-body">
        <div className="reddit-author-row">
          <div className="reddit-user-avatar">
            <MediaImage
              mediaId={post.userMediaId}
              fallbackUrl={userImageUrl}
              alt={`${username} avatar`}
            />
          </div>
          <span>{username || 'username'} <b>{post.ageLabel || 'now'}</b>{post.isEdited ? ' · edited' : ''}</span>
          {post.showOverflowButton && <MoreVertical size={23} />}
        </div>

        {showNsfw && (
          <div className="reddit-nsfw-row">
            <span className="reddit-18-badge"><b>18</b></span>
            <strong>{post.nsfwLabel || 'NSFW'}</strong>
          </div>
        )}

        <h1>{post.title || 'Your post title'}</h1>

        <div className="reddit-labels">
          {post.isPinned && <span className="post-indicator">Pinned</span>}
          {post.contentWarning && !legacyNsfw && <span className="post-indicator warning">{post.contentWarning}</span>}
          {post.isSpoiler && <span className="post-indicator warning">Spoiler</span>}
        </div>

        {post.postFlair?.text && (
          <span
            className="reddit-post-flair"
            style={{
              background: post.postFlair.backgroundColor || '#e72678',
              color: post.postFlair.textColor || '#fff',
            }}
          >
            {post.postFlair.text}
          </span>
        )}

        {post.mainMediaId && (
          <MediaImage mediaId={post.mainMediaId} alt="Post" className="reddit-post-image" />
        )}
        {post.body && <p className="reddit-body">{post.body}</p>}

        <div className="reddit-actions">
          <div className={`reddit-action-group reddit-vote-group vote-${post.voteState ?? 'neutral'}`}>
            <ArrowBigUp size={22} fill={post.voteState === 'up' ? 'currentColor' : 'none'} />
            <strong>{post.voteCount || '0'}</strong>
            <i />
            <ArrowBigDown size={22} fill={post.voteState === 'down' ? 'currentColor' : 'none'} />
          </div>
          <div className="reddit-action-group">
            <MessageCircle size={21} />
            {post.commentCount || '0'}
          </div>
          <span className="reddit-action-spacer" />
          <div className="reddit-action-group reddit-icon-action"><Repeat2 size={20} /></div>
          <div className="reddit-action-group reddit-icon-action"><Share2 size={21} /></div>
        </div>

        {post.comments && post.comments.length > 0 && (
          <div className="fictional-comments reddit-comments">
            {post.comments.map((comment) => <Comment key={comment.id} comment={comment} />)}
          </div>
        )}
      </main>

      {post.showCommentComposer && !post.showBottomNavigation && (
        <div className="reddit-composer">
          <span>{post.commentPlaceholder || 'Join the conversation'}</span>
        </div>
      )}

      {post.showBottomNavigation !== false && (
        <nav className="reddit-bottom-nav" aria-label="Reddit-style navigation">
          <div className="active"><House size={25} fill="currentColor" /><span>Home</span></div>
          <div><Plus size={31} /><span>Create</span></div>
          <div className="reddit-inbox-item">
            <Bell size={26} />
            {post.inboxBadge && <b>{post.inboxBadge}</b>}
            <span>Inbox</span>
          </div>
          <div><UserRound size={26} /><span>You</span></div>
        </nav>
      )}
    </article>
  )
}
