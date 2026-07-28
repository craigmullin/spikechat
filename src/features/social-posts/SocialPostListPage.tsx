import { ArrowLeft, Camera, Copy, Plus, Radio, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { deleteSocialPost, loadSocialPosts, saveSocialPost } from './socialPostRepository'
import type { SocialPost } from './types'
import type { SocialPlatform } from './types'

export function SocialPostListPage() {
  const [params] = useSearchParams()
  const platform = (params.get('platform') === 'reddit' ? 'reddit' : 'instagram') as SocialPlatform
  const redditPresentation = params.get('view') === 'card' ? 'card' : 'post'
  const [posts, setPosts] = useState(() => loadSocialPosts())
  const filtered = useMemo(
    () => posts.filter((post) =>
      post.platform === platform &&
      (post.platform !== 'reddit' || (post.presentation ?? 'post') === redditPresentation)),
    [platform, posts, redditPresentation],
  )
  const label = platform === 'instagram'
    ? 'Instagram-style'
    : redditPresentation === 'card' ? 'Reddit card' : 'Reddit post'
  const newPostUrl = platform === 'reddit' && redditPresentation === 'card'
    ? '/social-posts/new?platform=reddit&view=card'
    : `/social-posts/new?platform=${platform}`

  const remove = async (id: string) => {
    if (!window.confirm('Delete this fictional post?')) return
    await deleteSocialPost(id)
    setPosts(loadSocialPosts())
  }

  const duplicate = (post: SocialPost) => {
    const now = new Date().toISOString()
    saveSocialPost({ ...post, id: crypto.randomUUID(), createdAt: now, updatedAt: now })
    setPosts(loadSocialPosts())
  }

  return (
    <div className="screen-shell social-list-shell">
      <header className="screen-header">
        <Link to="/" className="icon-button" aria-label="Back to modes"><ArrowLeft size={24} /></Link>
        <div className="social-list-title">
          <span className="eyebrow">SpikeChat Studio</span>
          <h1>{label}</h1>
        </div>
        <Link to={newPostUrl} className="primary-icon-button" aria-label={`Create ${label}`}><Plus size={24} /></Link>
      </header>
      <main className="people-content">
        {filtered.length === 0 ? (
          <section className="empty-state">
            <div className="empty-icon">{platform === 'instagram' ? <Camera size={34} /> : <Radio size={34} />}</div>
            <h2>No posts yet</h2>
            <p>Create a fictional {label.toLowerCase()} post and preview it on a phone-sized canvas.</p>
            <Link to={newPostUrl} className="primary-button"><Plus size={18} />New Post</Link>
          </section>
        ) : (
          <div className="social-post-list">
            {filtered.map((post) => (
              <div className="social-post-card" key={post.id}>
                <Link to={`/social-posts/${post.id}`} className="social-post-card-main">
                  <strong>{post.platform === 'instagram' ? `@${post.handle}` : `r/${post.subreddit}`}</strong>
                  <span>{post.platform === 'instagram' ? post.caption || 'Photo post' : post.title}</span>
                  <small>Updated {new Date(post.updatedAt).toLocaleDateString()}</small>
                </Link>
                <Link to={`/social-posts/${post.id}/edit`} className="text-button">Edit</Link>
                <button type="button" className="icon-button" onClick={() => duplicate(post)} aria-label="Duplicate post draft"><Copy size={18} /></button>
                <button type="button" className="icon-button danger-icon" onClick={() => void remove(post.id)} aria-label="Delete post"><Trash2 size={19} /></button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
