import { Navigate, useParams } from 'react-router-dom'
import { loadSocialPost } from './socialPostRepository'
import { InstagramPostPreview } from './instagram/InstagramPostPreview'
import { RedditPostPreview } from './reddit/RedditPostPreview'

export function SocialPostPreviewPage() {
  const { postId } = useParams()
  const post = postId ? loadSocialPost(postId) : undefined
  if (!post) return <Navigate to="/" replace />

  return (
    <div className="preview-page capture-page">
      <main className="phone-preview-wrap">
        <div className="capture-frame">
          {post.platform === 'instagram' ? <InstagramPostPreview post={post} /> : <RedditPostPreview post={post} />}
        </div>
      </main>
    </div>
  )
}
