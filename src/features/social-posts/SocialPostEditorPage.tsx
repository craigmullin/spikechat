import { ArrowLeft, Camera, Save } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { deleteMedia, saveMedia } from '../../mediaDb'
import { loadPeople } from '../../storage'
import { CropEditor } from '../media/CropEditor'
import { MediaImage } from '../media/MediaImage'
import { imageProcessingError, optimizeImage, validateImage } from '../media/imageProcessing'
import type { ImagePurpose } from '../media/imageProcessing'
import { loadSocialPost, loadSocialPosts, saveSocialPost } from './socialPostRepository'
import type { InstagramPost, RedditPost, SocialPlatform, SocialPost, Theme } from './types'

interface CropJob {
  url: string
  finish: (blob: Blob) => Promise<void>
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="toggle-field"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>
}

function MediaPicker({
  label,
  mediaId,
  fallbackUrl,
  crop = false,
  onFile,
}: {
  label: string
  mediaId?: string
  fallbackUrl?: string
  crop?: boolean
  onFile: (file: File, crop: boolean) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  return (
    <div className="social-media-field">
      <button type="button" className="media-picker-button" onClick={() => input.current?.click()}>
        <span className="social-media-thumb">
          {mediaId || fallbackUrl
            ? <MediaImage mediaId={mediaId} fallbackUrl={fallbackUrl} alt={label} />
            : <Camera size={24} />}
        </span>
        <span><strong>{label}</strong><small>{mediaId || fallbackUrl ? 'Change image' : 'Choose image'}</small></span>
      </button>
      <input
        ref={input}
        className="hidden-file-input"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) onFile(file, crop)
          event.target.value = ''
        }}
      />
    </div>
  )
}

export function SocialPostEditorPage() {
  const navigate = useNavigate()
  const { postId } = useParams()
  const [params] = useSearchParams()
  const existing = useMemo(() => postId ? loadSocialPost(postId) : undefined, [postId])
  const platform = (existing?.platform ?? (params.get('platform') === 'reddit' ? 'reddit' : 'instagram')) as SocialPlatform
  const people = useMemo(() => loadPeople(), [])
  const now = new Date().toISOString()
  const [theme, setTheme] = useState<Theme>(existing?.theme ?? 'dark')
  const [cropJob, setCropJob] = useState<CropJob>()
  const [mediaError, setMediaError] = useState('')
  const pendingMedia = useRef(new Set<string>())
  const saved = useRef(false)

  const instagramExisting = existing?.platform === 'instagram' ? existing : undefined
  const [instagramPersonId, setInstagramPersonId] = useState(instagramExisting?.personId ?? '')
  const [handle, setHandle] = useState(instagramExisting?.handle ?? '')
  const [displayName, setDisplayName] = useState(instagramExisting?.displayName ?? '')
  const [instagramProfileId, setInstagramProfileId] = useState(instagramExisting?.profileMediaId)
  const [instagramProfileUrl, setInstagramProfileUrl] = useState(instagramExisting?.profileImageUrl)
  const [instagramMainId, setInstagramMainId] = useState(instagramExisting?.mainMediaId)
  const [caption, setCaption] = useState(instagramExisting?.caption ?? '')
  const [location, setLocation] = useState(instagramExisting?.location ?? '')
  const [music, setMusic] = useState(instagramExisting?.musicLabel ?? '')
  const [displayedDate, setDisplayedDate] = useState(instagramExisting?.displayedDate ?? 'Today')
  const [likes, setLikes] = useState(instagramExisting?.likeCount ?? '0')
  const [instagramComments, setInstagramComments] = useState(instagramExisting?.commentCount ?? '0')
  const [reposts, setReposts] = useState(instagramExisting?.repostCount ?? '0')
  const [sends, setSends] = useState(instagramExisting?.sendCount ?? '0')
  const [savedPost, setSavedPost] = useState(instagramExisting?.isSaved ?? false)
  const [verified, setVerified] = useState(instagramExisting?.isVerified ?? false)
  const [showHeader, setShowHeader] = useState(instagramExisting?.showHeader ?? true)
  const [showFollow, setShowFollow] = useState(instagramExisting?.showFollowButton ?? true)
  const [showEngagement, setShowEngagement] = useState(instagramExisting?.showEngagement ?? true)
  const [showCaption, setShowCaption] = useState(instagramExisting?.showCaption ?? true)
  const [showDate, setShowDate] = useState(instagramExisting?.showDate ?? true)
  const [showMusic, setShowMusic] = useState(instagramExisting?.showMusic ?? true)

  const redditExisting = existing?.platform === 'reddit' ? existing : undefined
  const [redditPersonId, setRedditPersonId] = useState(redditExisting?.personId ?? '')
  const [subreddit, setSubreddit] = useState(redditExisting?.subreddit ?? '')
  const [username, setUsername] = useState(redditExisting?.username ?? '')
  const [redditCommunityId, setRedditCommunityId] = useState(redditExisting?.subredditMediaId)
  const [redditUserId, setRedditUserId] = useState(redditExisting?.userMediaId)
  const [redditUserUrl, setRedditUserUrl] = useState(redditExisting?.userImageUrl)
  const [redditMainId, setRedditMainId] = useState(redditExisting?.mainMediaId)
  const [title, setTitle] = useState(redditExisting?.title ?? '')
  const [body, setBody] = useState(redditExisting?.body ?? '')
  const [age, setAge] = useState(redditExisting?.ageLabel ?? 'now')
  const [flair, setFlair] = useState(redditExisting?.postFlair?.text ?? '')
  const [flairBackground, setFlairBackground] = useState(redditExisting?.postFlair?.backgroundColor ?? '#334155')
  const [votes, setVotes] = useState(redditExisting?.voteCount ?? '0')
  const [redditComments, setRedditComments] = useState(redditExisting?.commentCount ?? '0')
  const [redditReposts, setRedditReposts] = useState(redditExisting?.repostCount ?? '0')
  const [shareLabel, setShareLabel] = useState(redditExisting?.shareLabel ?? 'Share')
  const [voteState, setVoteState] = useState(redditExisting?.voteState ?? 'neutral')
  const [edited, setEdited] = useState(redditExisting?.isEdited ?? false)
  const [showJoin, setShowJoin] = useState(redditExisting?.showJoinButton ?? true)
  const [showClose, setShowClose] = useState(redditExisting?.showCloseButton ?? true)
  const [showSearch, setShowSearch] = useState(redditExisting?.showSearchButton ?? true)
  const [showFilter, setShowFilter] = useState(redditExisting?.showFilterButton ?? true)
  const [showOverflow, setShowOverflow] = useState(redditExisting?.showOverflowButton ?? true)
  const [showSubredditIcon, setShowSubredditIcon] = useState(redditExisting?.showSubredditIcon ?? true)
  const [showComposer, setShowComposer] = useState(redditExisting?.showCommentComposer ?? true)
  const [commentPlaceholder, setCommentPlaceholder] = useState(redditExisting?.commentPlaceholder ?? 'Join the conversation')
  const [showGif, setShowGif] = useState(redditExisting?.showGifButton ?? true)
  const [showComposerImage, setShowComposerImage] = useState(redditExisting?.showComposerImageButton ?? true)
  const [showComposerCollapse, setShowComposerCollapse] = useState(redditExisting?.showComposerCollapseButton ?? true)

  useEffect(() => () => {
    if (!saved.current) pendingMedia.current.forEach((id) => void deleteMedia(id))
  }, [])

  const persistBlob = async (
    blob: Blob,
    setter: (id: string) => void,
    purpose: ImagePurpose,
  ) => {
    const id = crypto.randomUUID()
    await saveMedia(id, await optimizeImage(blob, purpose))
    pendingMedia.current.add(id)
    setter(id)
    setMediaError('')
  }

  const selectFile = (file: File, shouldCrop: boolean, setter: (id: string) => void) => {
    try {
      validateImage(file)
      setMediaError('')
    } catch (error) {
      setMediaError(imageProcessingError(error))
      return
    }
    if (!shouldCrop) {
      void persistBlob(file, setter, 'avatar').catch((error) =>
        setMediaError(imageProcessingError(error)),
      )
      return
    }
    const url = URL.createObjectURL(file)
    setCropJob({
      url,
      finish: async (blob) => {
        try {
          await persistBlob(blob, setter, 'content')
          URL.revokeObjectURL(url)
          setCropJob(undefined)
        } catch (error) {
          setMediaError(imageProcessingError(error))
        }
      },
    })
  }

  const chooseInstagramPerson = (personId: string) => {
    setInstagramPersonId(personId)
    const person = people.find((item) => item.id === personId)
    if (!person) return
    setHandle(person.handle || person.name.toLowerCase().replace(/\s+/g, '_'))
    setDisplayName(person.name)
    setInstagramProfileId(undefined)
    setInstagramProfileUrl(person.photoUrl)
  }

  const chooseRedditPerson = (personId: string) => {
    setRedditPersonId(personId)
    const person = people.find((item) => item.id === personId)
    if (!person) return
    setUsername(person.handle || person.name.toLowerCase().replace(/\s+/g, '_'))
    setRedditUserId(undefined)
    setRedditUserUrl(person.photoUrl)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const id = existing?.id ?? crypto.randomUUID()
    let post: SocialPost
    if (platform === 'instagram') {
      if (!handle.trim() || !instagramMainId) return
      post = {
        id, platform, createdAt: existing?.createdAt ?? now, updatedAt: now, theme,
        personId: instagramPersonId || undefined,
        handle: handle.trim().replace(/^@/, ''), displayName: displayName.trim() || undefined,
        profileMediaId: instagramProfileId, profileImageUrl: instagramProfileUrl,
        mainMediaId: instagramMainId, caption: caption.trim(),
        location: location.trim() || undefined, musicLabel: music.trim() || undefined,
        displayedDate: displayedDate.trim() || undefined, likeCount: likes, commentCount: instagramComments,
        repostCount: reposts, sendCount: sends, isSaved: savedPost, isVerified: verified,
        showHeader, showFollowButton: showFollow, showEngagement, showCaption, showDate, showMusic,
      } satisfies InstagramPost
    } else {
      if (!subreddit.trim() || !username.trim() || !title.trim()) return
      post = {
        id, platform, createdAt: existing?.createdAt ?? now, updatedAt: now, theme,
        subreddit: subreddit.trim().replace(/^r\//, ''), subredditMediaId: redditCommunityId,
        personId: redditPersonId || undefined,
        username: username.trim().replace(/^u\//, ''), userMediaId: redditUserId,
        userImageUrl: redditUserUrl, ageLabel: age,
        isEdited: edited, title: title.trim(), body: body.trim() || undefined, mainMediaId: redditMainId,
        postFlair: flair.trim() ? { text: flair.trim(), backgroundColor: flairBackground, textColor: '#ffffff' } : undefined,
        voteCount: votes, commentCount: redditComments, repostCount: redditReposts, shareLabel,
        voteState, showJoinButton: showJoin, showCloseButton: showClose, showSearchButton: showSearch,
        showFilterButton: showFilter, showOverflowButton: showOverflow, showSubredditIcon,
        showCommentComposer: showComposer, commentPlaceholder, showGifButton: showGif,
        showComposerImageButton: showComposerImage, showComposerCollapseButton: showComposerCollapse,
      } satisfies RedditPost
    }
    saveSocialPost(post)
    const postMedia = new Set(
      post.platform === 'instagram'
        ? [post.profileMediaId, post.mainMediaId].filter(Boolean)
        : [post.subredditMediaId, post.userMediaId, post.mainMediaId].filter(Boolean),
    )
    const unusedPending = [...pendingMedia.current].filter((id) => !postMedia.has(id))
    const previousMedia = existing
      ? existing.platform === 'instagram'
        ? [existing.profileMediaId, existing.mainMediaId]
        : [existing.subredditMediaId, existing.userMediaId, existing.mainMediaId]
      : []
    const otherMedia = new Set(
      loadSocialPosts()
        .filter((item) => item.id !== id)
        .flatMap((item) =>
          item.platform === 'instagram'
            ? [item.profileMediaId, item.mainMediaId]
            : [item.subredditMediaId, item.userMediaId, item.mainMediaId],
        )
        .filter(Boolean),
    )
    const replacedMedia = previousMedia.filter(
      (mediaId): mediaId is string =>
        Boolean(mediaId) && !postMedia.has(mediaId) && !otherMedia.has(mediaId),
    )
    await Promise.all(
      [...unusedPending, ...replacedMedia].map((mediaId) => deleteMedia(mediaId)),
    )
    saved.current = true
    pendingMedia.current.clear()
    navigate(`/social-posts/${id}`)
  }

  return (
    <div className="screen-shell social-editor-shell">
      <header className="screen-header compact-header sticky-editor-header">
        <button type="button" className="icon-button" onClick={() => navigate(-1)} aria-label="Go back"><ArrowLeft size={24} /></button>
        <div><span className="eyebrow">{platform === 'instagram' ? 'Instagram-style' : 'Reddit-style'}</span><h1>{existing ? 'Edit Post' : 'New Post'}</h1></div>
      </header>
      <main className="form-content">
        <form className="social-editor-form" onSubmit={submit}>
          {mediaError && <p className="form-error" role="alert">{mediaError}</p>}
          {platform === 'instagram' ? (
            <>
              <fieldset><legend>Account</legend>
                <label><span>Use person</span><select value={instagramPersonId} onChange={(e) => chooseInstagramPerson(e.target.value)}><option value="">Custom account</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}{person.handle ? ` (@${person.handle})` : ''}</option>)}</select></label>
                <div className="form-grid">
                  <label><span>Handle *</span><input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="your_handle" /></label>
                  <label><span>Display name</span><input value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></label>
                </div>
                <MediaPicker label="Profile image" mediaId={instagramProfileId} fallbackUrl={instagramProfileUrl} onFile={(file) => { setInstagramPersonId(''); setInstagramProfileUrl(undefined); selectFile(file, false, setInstagramProfileId) }} />
                <div className="toggle-grid"><Toggle label="Verified badge" checked={verified} onChange={setVerified} /><Toggle label="Follow button" checked={showFollow} onChange={setShowFollow} /></div>
              </fieldset>
              <fieldset><legend>Post</legend>
                <MediaPicker label="Main photo *" mediaId={instagramMainId} crop onFile={(file) => selectFile(file, true, setInstagramMainId)} />
                <label><span>Caption</span><textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} /></label>
                <div className="form-grid"><label><span>Location</span><input value={location} onChange={(e) => setLocation(e.target.value)} /></label><label><span>Music label</span><input value={music} onChange={(e) => setMusic(e.target.value)} /></label></div>
                <label><span>Displayed date</span><input value={displayedDate} onChange={(e) => setDisplayedDate(e.target.value)} /></label>
              </fieldset>
              <fieldset><legend>Engagement</legend>
                <div className="form-grid counts-grid"><label><span>Likes</span><input value={likes} onChange={(e) => setLikes(e.target.value)} /></label><label><span>Comments</span><input value={instagramComments} onChange={(e) => setInstagramComments(e.target.value)} /></label><label><span>Reposts</span><input value={reposts} onChange={(e) => setReposts(e.target.value)} /></label><label><span>Sends</span><input value={sends} onChange={(e) => setSends(e.target.value)} /></label></div>
                <Toggle label="Saved/bookmarked" checked={savedPost} onChange={setSavedPost} />
              </fieldset>
              <fieldset><legend>Appearance</legend><label><span>Theme</span><select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}><option value="dark">Dark</option><option value="light">Light</option></select></label>
                <div className="toggle-grid"><Toggle label="Navigation header" checked={showHeader} onChange={setShowHeader} /><Toggle label="Engagement row" checked={showEngagement} onChange={setShowEngagement} /><Toggle label="Caption" checked={showCaption} onChange={setShowCaption} /><Toggle label="Date" checked={showDate} onChange={setShowDate} /><Toggle label="Music label" checked={showMusic} onChange={setShowMusic} /></div>
              </fieldset>
            </>
          ) : (
            <>
              <fieldset><legend>Community</legend>
                <label><span>Subreddit *</span><input value={subreddit} onChange={(e) => setSubreddit(e.target.value)} placeholder="community" /></label>
                <MediaPicker label="Community icon" mediaId={redditCommunityId} onFile={(file) => selectFile(file, false, setRedditCommunityId)} />
                <div className="toggle-grid"><Toggle label="Join button" checked={showJoin} onChange={setShowJoin} /><Toggle label="Community icon" checked={showSubredditIcon} onChange={setShowSubredditIcon} /></div>
              </fieldset>
              <fieldset><legend>Author</legend>
                <label><span>Use person</span><select value={redditPersonId} onChange={(e) => chooseRedditPerson(e.target.value)}><option value="">Custom author</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}{person.handle ? ` (u/${person.handle})` : ''}</option>)}</select></label>
                <div className="form-grid"><label><span>Username *</span><input value={username} onChange={(e) => setUsername(e.target.value)} /></label><label><span>Age</span><input value={age} onChange={(e) => setAge(e.target.value)} placeholder="4h" /></label></div>
                <MediaPicker label="User avatar" mediaId={redditUserId} fallbackUrl={redditUserUrl} onFile={(file) => { setRedditPersonId(''); setRedditUserUrl(undefined); selectFile(file, false, setRedditUserId) }} /><Toggle label="Edited indicator" checked={edited} onChange={setEdited} />
              </fieldset>
              <fieldset><legend>Content</legend>
                <label><span>Title *</span><textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={3} /></label>
                <label><span>Body</span><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} /></label>
                <MediaPicker label="Body image" mediaId={redditMainId} crop onFile={(file) => selectFile(file, true, setRedditMainId)} />
                <div className="form-grid"><label><span>Post flair</span><input value={flair} onChange={(e) => setFlair(e.target.value)} /></label><label><span>Flair color</span><input type="color" value={flairBackground} onChange={(e) => setFlairBackground(e.target.value)} /></label></div>
              </fieldset>
              <fieldset><legend>Engagement</legend>
                <div className="form-grid counts-grid"><label><span>Votes</span><input value={votes} onChange={(e) => setVotes(e.target.value)} /></label><label><span>Comments</span><input value={redditComments} onChange={(e) => setRedditComments(e.target.value)} /></label><label><span>Reposts</span><input value={redditReposts} onChange={(e) => setRedditReposts(e.target.value)} /></label><label><span>Share label</span><input value={shareLabel} onChange={(e) => setShareLabel(e.target.value)} /></label></div>
                <label><span>Vote state</span><select value={voteState} onChange={(e) => setVoteState(e.target.value as NonNullable<RedditPost['voteState']>)}><option value="neutral">Neutral</option><option value="up">Upvoted</option><option value="down">Downvoted</option></select></label>
              </fieldset>
              <fieldset><legend>Composer</legend>
                <label><span>Placeholder</span><input value={commentPlaceholder} onChange={(e) => setCommentPlaceholder(e.target.value)} /></label>
                <div className="toggle-grid"><Toggle label="Comment composer" checked={showComposer} onChange={setShowComposer} /><Toggle label="GIF button" checked={showGif} onChange={setShowGif} /><Toggle label="Image button" checked={showComposerImage} onChange={setShowComposerImage} /><Toggle label="Collapse button" checked={showComposerCollapse} onChange={setShowComposerCollapse} /></div>
              </fieldset>
              <fieldset><legend>Appearance</legend>
                <label><span>Theme</span><select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}><option value="dark">Dark</option><option value="light">Light</option></select></label>
                <div className="toggle-grid"><Toggle label="Close button" checked={showClose} onChange={setShowClose} /><Toggle label="Search button" checked={showSearch} onChange={setShowSearch} /><Toggle label="Filter button" checked={showFilter} onChange={setShowFilter} /><Toggle label="Overflow button" checked={showOverflow} onChange={setShowOverflow} /></div>
              </fieldset>
            </>
          )}
          <button className="primary-button full-width-button editor-save-button" type="submit" disabled={platform === 'instagram' ? !handle.trim() || !instagramMainId : !subreddit.trim() || !username.trim() || !title.trim()}><Save size={19} />Save & Preview</button>
        </form>
      </main>
      {cropJob && <CropEditor imageUrl={cropJob.url} showPresets onCancel={() => { URL.revokeObjectURL(cropJob.url); setCropJob(undefined) }} onComplete={(blob) => void cropJob.finish(blob)} />}
    </div>
  )
}
