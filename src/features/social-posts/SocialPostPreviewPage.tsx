import { ArrowLeft, Pencil } from 'lucide-react'
import { useRef } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ExportControls } from '../export/ExportControls'
import { loadSocialPost } from './socialPostRepository'
import { InstagramPostPreview } from './instagram/InstagramPostPreview'
import { RedditPostPreview } from './reddit/RedditPostPreview'

export function SocialPostPreviewPage() {
  const { postId } = useParams()
  const navigate = useNavigate()
  const captureRef = useRef<HTMLDivElement>(null)
  const post = postId ? loadSocialPost(postId) : undefined
  if (!post) return <Navigate to="/" replace />

  return (
    <div className="preview-page capture-page">
      <div className="capture-toolbar">
        <button type="button" className="icon-button" onClick={() => navigate('/social-posts')} aria-label="Back to posts"><ArrowLeft size={22} /></button>
        <ExportControls
          targetRef={captureRef}
          filename={`spikechat-${post.platform}-${post.id}.png`}
        />
        <button type="button" className="icon-button" onClick={() => navigate(`/social-posts/${post.id}/edit`)} aria-label="Edit post"><Pencil size={20} /></button>
      </div>
      <main className="phone-preview-wrap">
        <div ref={captureRef} className="capture-frame">
          {post.platform === 'instagram' ? <InstagramPostPreview post={post} /> : <RedditPostPreview post={post} />}
        </div>
      </main>
    </div>
  )
}
