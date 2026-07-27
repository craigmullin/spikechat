import { ArrowLeft, Camera, Plus, Radio, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { deleteSocialPost, loadSocialPosts } from './socialPostRepository'
import type { SocialPlatform } from './types'

export function SocialPostListPage() {
  const [params] = useSearchParams()
  const platform = (params.get('platform') === 'reddit' ? 'reddit' : 'instagram') as SocialPlatform
  const [posts, setPosts] = useState(() => loadSocialPosts())
  const filtered = useMemo(() => posts.filter((post) => post.platform === platform), [platform, posts])
  const label = platform === 'instagram' ? 'Instagram-style' : 'Reddit-style'

  const remove = async (id: string) => {
    if (!window.confirm('Delete this fictional post?')) return
    await deleteSocialPost(id)
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
        <Link to={`/social-posts/new?platform=${platform}`} className="primary-icon-button" aria-label={`Create ${label} post`}><Plus size={24} /></Link>
      </header>
      <main className="people-content">
        {filtered.length === 0 ? (
          <section className="empty-state">
            <div className="empty-icon">{platform === 'instagram' ? <Camera size={34} /> : <Radio size={34} />}</div>
            <h2>No posts yet</h2>
            <p>Create a fictional {label.toLowerCase()} post and preview it on a phone-sized canvas.</p>
            <Link to={`/social-posts/new?platform=${platform}`} className="primary-button"><Plus size={18} />New Post</Link>
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
                <button type="button" className="icon-button danger-icon" onClick={() => void remove(post.id)} aria-label="Delete post"><Trash2 size={19} /></button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
