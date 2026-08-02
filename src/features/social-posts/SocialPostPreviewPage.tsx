import { ArrowLeft, Pencil } from 'lucide-react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { loadSocialPost } from './socialPostRepository'
import { InstagramPostPreview } from './instagram/InstagramPostPreview'
import { RedditPostPreview } from './reddit/RedditPostPreview'

export function SocialPostPreviewPage() {
  const { postId } = useParams()
  const post = postId ? loadSocialPost(postId) : undefined
  if (!post) return <Navigate to="/studio" replace />

  const listUrl = post.platform === 'instagram'
    ? '/social-posts?platform=instagram'
    : `/social-posts?platform=reddit${post.presentation === 'card' ? '&view=card' : ''}`

  return (
    <div className="preview-page capture-page">
      <header className="preview-page-toolbar">
        <Link to={listUrl} className="icon-button" aria-label="Back to saved posts"><ArrowLeft size={23} /></Link>
        <strong>Saved Preview</strong>
        <div><Link to={`/social-posts/${post.id}/edit`} className="primary-button preview-edit-button"><Pencil size={17} />Edit</Link></div>
      </header>
      <main className="phone-preview-wrap">
        <div className="capture-frame">
          {post.platform === 'instagram' ? <InstagramPostPreview post={post} /> : <RedditPostPreview post={post} />}
        </div>
      </main>
    </div>
  )
}
