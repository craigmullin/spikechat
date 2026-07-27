import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { deleteSocialPost, loadSocialPost } from './socialPostRepository'
import { InstagramPostPreview } from './instagram/InstagramPostPreview'
import { RedditPostPreview } from './reddit/RedditPostPreview'

export function SocialPostPreviewPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const post = postId ? loadSocialPost(postId) : undefined
  if (!post) return <Navigate to="/" replace />

  const remove = async () => {
    if (!window.confirm('Delete this fictional post?')) return
    await deleteSocialPost(post.id)
    navigate(`/social-posts?platform=${post.platform}`)
  }

  return (
    <div className="preview-page">
      <header className="preview-page-toolbar">
        <Link to={`/social-posts?platform=${post.platform}`} className="icon-button" aria-label="Back to posts"><ArrowLeft size={23} /></Link>
        <strong>Preview</strong>
        <div>
          <Link to={`/social-posts/${post.id}/edit`} className="icon-button" aria-label="Edit post"><Pencil size={20} /></Link>
          <button type="button" className="icon-button danger-icon" onClick={() => void remove()} aria-label="Delete post"><Trash2 size={20} /></button>
        </div>
      </header>
      <main className="phone-preview-wrap">
        {post.platform === 'instagram' ? <InstagramPostPreview post={post} /> : <RedditPostPreview post={post} />}
      </main>
    </div>
  )
}
