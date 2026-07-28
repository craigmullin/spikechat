import { ArrowLeft, BookmarkPlus, Camera, Save, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { deleteMedia, saveMedia } from '../../mediaDb'
import { loadPeople } from '../../storage'
import { instagramProfile, redditProfile } from '../people/identity'
import { CropEditor } from '../media/CropEditor'
import { MediaImage } from '../media/MediaImage'
import { imageProcessingError, optimizeImage, validateImage } from '../media/imageProcessing'
import type { ImagePurpose } from '../media/imageProcessing'
import { loadSocialPost, loadSocialPosts, saveSocialPost } from './socialPostRepository'
import type { InstagramPost, RedditPost, SocialPlatform, SocialPost, Theme } from './types'
import { formatComments, parseComments } from './fictionalComments'
import {
  clearSocialPostDefaults,
  loadInstagramDefaults,
  loadRedditDefaults,
  saveInstagramDefaults,
  saveRedditDefaults,
} from './socialPostDefaults'

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
  const redditPresentation = existing?.platform === 'reddit'
    ? existing.presentation ?? 'post'
    : params.get('view') === 'card' ? 'card' : 'post'
  const instagramDefaults = useMemo(loadInstagramDefaults, [])
  const redditDefaults = useMemo(loadRedditDefaults, [])
  const people = useMemo(() => loadPeople(), [])
  const now = new Date().toISOString()
  const [theme, setTheme] = useState<Theme>(
    existing?.theme ??
    (platform === 'instagram' ? instagramDefaults.theme : redditDefaults.theme) ??
    'dark',
  )
  const [cropJob, setCropJob] = useState<CropJob>()
  const [mediaError, setMediaError] = useState('')
  const [defaultsMessage, setDefaultsMessage] = useState('')
  const pendingMedia = useRef(new Set<string>())
  const saved = useRef(false)

  const instagramExisting = existing?.platform === 'instagram' ? existing : undefined
  const [instagramPersonId, setInstagramPersonId] = useState(instagramExisting?.personId ?? '')
  const [handle, setHandle] = useState(instagramExisting?.handle ?? instagramDefaults.handle ?? '')
  const [displayName, setDisplayName] = useState(instagramExisting?.displayName ?? instagramDefaults.displayName ?? '')
  const [instagramProfileId, setInstagramProfileId] = useState(instagramExisting?.profileMediaId)
  const [instagramProfileUrl, setInstagramProfileUrl] = useState(instagramExisting?.profileImageUrl)
  const [instagramMainId, setInstagramMainId] = useState(instagramExisting?.mainMediaId)
  const [instagramCarouselIds, setInstagramCarouselIds] = useState(instagramExisting?.carouselMediaIds ?? [])
  const [instagramCommentText, setInstagramCommentText] = useState(formatComments(instagramExisting?.comments))
  const [caption, setCaption] = useState(instagramExisting?.caption ?? '')
  const [location, setLocation] = useState(instagramExisting?.location ?? instagramDefaults.location ?? '')
  const [music, setMusic] = useState(instagramExisting?.musicLabel ?? instagramDefaults.music ?? '')
  const [displayedDate, setDisplayedDate] = useState(instagramExisting?.displayedDate ?? instagramDefaults.displayedDate ?? 'Today')
  const [likes, setLikes] = useState(instagramExisting?.likeCount ?? instagramDefaults.likes ?? '0')
  const [instagramComments, setInstagramComments] = useState(instagramExisting?.commentCount ?? instagramDefaults.comments ?? '0')
  const [reposts, setReposts] = useState(instagramExisting?.repostCount ?? instagramDefaults.reposts ?? '0')
  const [sends, setSends] = useState(instagramExisting?.sendCount ?? instagramDefaults.sends ?? '0')
  const [savedPost, setSavedPost] = useState(instagramExisting?.isSaved ?? instagramDefaults.savedPost ?? false)
  const [verified, setVerified] = useState(instagramExisting?.isVerified ?? instagramDefaults.verified ?? false)
  const [showHeader, setShowHeader] = useState(instagramExisting?.showHeader ?? instagramDefaults.showHeader ?? true)
  const [showFollow, setShowFollow] = useState(instagramExisting?.showFollowButton ?? instagramDefaults.showFollow ?? true)
  const [showEngagement, setShowEngagement] = useState(instagramExisting?.showEngagement ?? instagramDefaults.showEngagement ?? true)
  const [showCaption, setShowCaption] = useState(instagramExisting?.showCaption ?? instagramDefaults.showCaption ?? true)
  const [showDate, setShowDate] = useState(instagramExisting?.showDate ?? instagramDefaults.showDate ?? true)
  const [showMusic, setShowMusic] = useState(instagramExisting?.showMusic ?? instagramDefaults.showMusic ?? true)

  const redditExisting = existing?.platform === 'reddit' ? existing : undefined
  const [redditPersonId, setRedditPersonId] = useState(redditExisting?.personId ?? '')
  const [subreddit, setSubreddit] = useState(redditExisting?.subreddit ?? redditDefaults.subreddit ?? '')
  const [communitySubtitle, setCommunitySubtitle] = useState(redditExisting?.communitySubtitle ?? redditDefaults.communitySubtitle ?? '')
  const [username, setUsername] = useState(redditExisting?.username ?? redditDefaults.username ?? '')
  const [redditCommunityId, setRedditCommunityId] = useState(redditExisting?.subredditMediaId)
  const [redditUserId, setRedditUserId] = useState(redditExisting?.userMediaId)
  const [redditUserUrl, setRedditUserUrl] = useState(redditExisting?.userImageUrl)
  const [redditMainId, setRedditMainId] = useState(redditExisting?.mainMediaId)
  const [redditCommentText, setRedditCommentText] = useState(formatComments(redditExisting?.comments))
  const [title, setTitle] = useState(redditExisting?.title ?? '')
  const [body, setBody] = useState(redditExisting?.body ?? '')
  const [age, setAge] = useState(redditExisting?.ageLabel ?? redditDefaults.age ?? 'now')
  const [flair, setFlair] = useState(redditExisting?.postFlair?.text ?? redditDefaults.flair ?? '')
  const [flairBackground, setFlairBackground] = useState(redditExisting?.postFlair?.backgroundColor ?? redditDefaults.flairBackground ?? '#e72678')
  const [flairTextColor, setFlairTextColor] = useState(redditExisting?.postFlair?.textColor ?? redditDefaults.flairTextColor ?? '#ffffff')
  const [votes, setVotes] = useState(redditExisting?.voteCount ?? redditDefaults.votes ?? '0')
  const [redditComments, setRedditComments] = useState(redditExisting?.commentCount ?? redditDefaults.comments ?? '0')
  const [redditReposts, setRedditReposts] = useState(redditExisting?.repostCount ?? redditDefaults.reposts ?? '0')
  const [shareLabel, setShareLabel] = useState(redditExisting?.shareLabel ?? redditDefaults.shareLabel ?? 'Share')
  const [voteState, setVoteState] = useState(redditExisting?.voteState ?? redditDefaults.voteState ?? 'neutral')
  const [edited, setEdited] = useState(redditExisting?.isEdited ?? redditDefaults.edited ?? false)
  const [pinned, setPinned] = useState(redditExisting?.isPinned ?? redditDefaults.pinned ?? false)
  const [spoiler, setSpoiler] = useState(redditExisting?.isSpoiler ?? redditDefaults.spoiler ?? false)
  const [nsfw, setNsfw] = useState(redditExisting?.isNsfw ?? redditDefaults.nsfw ?? false)
  const [nsfwLabel, setNsfwLabel] = useState(redditExisting?.nsfwLabel ?? redditDefaults.nsfwLabel ?? 'NSFW')
  const [contentWarning, setContentWarning] = useState(redditExisting?.contentWarning ?? redditDefaults.contentWarning ?? '')
  const [showJoin, setShowJoin] = useState(redditExisting?.showJoinButton ?? redditDefaults.showJoin ?? true)
  const [showClose, setShowClose] = useState(redditExisting?.showCloseButton ?? redditDefaults.showClose ?? true)
  const [showSearch, setShowSearch] = useState(redditExisting?.showSearchButton ?? redditDefaults.showSearch ?? true)
  const [showHeaderShare, setShowHeaderShare] = useState(redditExisting?.showHeaderShareButton ?? redditDefaults.showHeaderShare ?? true)
  const [showFilter, setShowFilter] = useState(redditExisting?.showFilterButton ?? redditDefaults.showFilter ?? false)
  const [showOverflow, setShowOverflow] = useState(redditExisting?.showOverflowButton ?? redditDefaults.showOverflow ?? true)
  const [showSubredditIcon, setShowSubredditIcon] = useState(redditExisting?.showSubredditIcon ?? redditDefaults.showSubredditIcon ?? true)
  const [showComposer, setShowComposer] = useState(redditExisting?.showCommentComposer ?? redditDefaults.showComposer ?? true)
  const [commentPlaceholder, setCommentPlaceholder] = useState(redditExisting?.commentPlaceholder ?? redditDefaults.commentPlaceholder ?? 'Join the conversation')
  const [showGif, setShowGif] = useState(redditExisting?.showGifButton ?? redditDefaults.showGif ?? true)
  const [showComposerImage, setShowComposerImage] = useState(redditExisting?.showComposerImageButton ?? redditDefaults.showComposerImage ?? true)
  const [showComposerCollapse, setShowComposerCollapse] = useState(redditExisting?.showComposerCollapseButton ?? redditDefaults.showComposerCollapse ?? true)
  const [showBottomNavigation, setShowBottomNavigation] = useState(redditExisting?.showBottomNavigation ?? redditDefaults.showBottomNavigation ?? true)
  const [inboxBadge, setInboxBadge] = useState(redditExisting?.inboxBadge ?? redditDefaults.inboxBadge ?? '')

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
    const profile = instagramProfile(person)
    setHandle(profile.handle)
    setDisplayName(profile.displayName)
    setInstagramProfileId(undefined)
    setInstagramProfileUrl(profile.photoUrl)
    setVerified(profile.verified)
  }

  const chooseRedditPerson = (personId: string) => {
    setRedditPersonId(personId)
    const person = people.find((item) => item.id === personId)
    if (!person) return
    const profile = redditProfile(person)
    setUsername(profile.username)
    setRedditUserId(undefined)
    setRedditUserUrl(profile.photoUrl)
    if (profile.defaultCommunity) setSubreddit(profile.defaultCommunity)
  }

  const saveCurrentDefaults = () => {
    if (platform === 'instagram') {
      saveInstagramDefaults({
        handle, displayName, location, music, displayedDate, likes,
        comments: instagramComments, reposts, sends, savedPost, verified,
        showHeader, showFollow, showEngagement, showCaption, showDate, showMusic, theme,
      })
    } else {
      saveRedditDefaults({
        subreddit, communitySubtitle, username, age, flair, flairBackground,
        flairTextColor, votes, comments: redditComments, reposts: redditReposts,
        shareLabel, voteState, edited, pinned, spoiler, nsfw, nsfwLabel,
        contentWarning, showJoin, showClose, showSearch, showHeaderShare,
        showFilter, showOverflow, showSubredditIcon, showComposer,
        commentPlaceholder, showGif, showComposerImage, showComposerCollapse,
        showBottomNavigation, inboxBadge, theme,
      })
    }
    setDefaultsMessage('Saved. New posts will start with these settings.')
  }

  const clearDefaults = () => {
    clearSocialPostDefaults(platform)
    setDefaultsMessage('Saved defaults cleared. This post was not changed.')
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
        mainMediaId: instagramMainId, carouselMediaIds: instagramCarouselIds, caption: caption.trim(),
        location: location.trim() || undefined, musicLabel: music.trim() || undefined,
        displayedDate: displayedDate.trim() || undefined, likeCount: likes, commentCount: instagramComments,
        repostCount: reposts, sendCount: sends, isSaved: savedPost, isVerified: verified,
        comments: parseComments(instagramCommentText),
        showHeader, showFollowButton: showFollow, showEngagement, showCaption, showDate, showMusic,
      } satisfies InstagramPost
    } else {
      if (!subreddit.trim() || !username.trim() || !title.trim()) return
      post = {
        id, platform, createdAt: existing?.createdAt ?? now, updatedAt: now, theme,
        presentation: redditPresentation,
        subreddit: subreddit.trim().replace(/^r\//, ''), communitySubtitle: communitySubtitle.trim() || undefined,
        subredditMediaId: redditCommunityId,
        personId: redditPersonId || undefined,
        username: username.trim().replace(/^u\//, ''), userMediaId: redditUserId,
        userImageUrl: redditUserUrl, ageLabel: age,
        isEdited: edited, isPinned: pinned, isSpoiler: spoiler, isNsfw: nsfw,
        nsfwLabel: nsfwLabel.trim() || 'NSFW',
        contentWarning: contentWarning.trim() || undefined,
        title: title.trim(), body: body.trim() || undefined, mainMediaId: redditMainId,
        postFlair: flair.trim() ? { text: flair.trim(), backgroundColor: flairBackground, textColor: flairTextColor } : undefined,
        voteCount: votes, commentCount: redditComments, repostCount: redditReposts, shareLabel,
        voteState, comments: parseComments(redditCommentText),
        showJoinButton: showJoin, showCloseButton: showClose, showSearchButton: showSearch,
        showHeaderShareButton: showHeaderShare,
        showFilterButton: showFilter, showOverflowButton: showOverflow, showSubredditIcon,
        showCommentComposer: showComposer, commentPlaceholder, showGifButton: showGif,
        showComposerImageButton: showComposerImage, showComposerCollapseButton: showComposerCollapse,
        showBottomNavigation, inboxBadge: inboxBadge.trim() || undefined,
      } satisfies RedditPost
    }
    saveSocialPost(post)
    const postMedia = new Set(
      post.platform === 'instagram'
        ? [post.profileMediaId, post.mainMediaId, ...(post.carouselMediaIds ?? [])].filter(Boolean)
        : [post.subredditMediaId, post.userMediaId, post.mainMediaId].filter(Boolean),
    )
    const unusedPending = [...pendingMedia.current].filter((id) => !postMedia.has(id))
    const previousMedia = existing
      ? existing.platform === 'instagram'
        ? [existing.profileMediaId, existing.mainMediaId, ...(existing.carouselMediaIds ?? [])]
        : [existing.subredditMediaId, existing.userMediaId, existing.mainMediaId]
      : []
    const otherMedia = new Set(
      loadSocialPosts()
        .filter((item) => item.id !== id)
        .flatMap((item) =>
          item.platform === 'instagram'
            ? [item.profileMediaId, item.mainMediaId, ...(item.carouselMediaIds ?? [])]
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
        <div><span className="eyebrow">{platform === 'instagram' ? 'Instagram-style' : redditPresentation === 'card' ? 'Reddit card' : 'Reddit post'}</span><h1>{existing ? 'Edit Post' : 'New Post'}</h1></div>
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
                <MediaPicker label="Add carousel photo" crop onFile={(file) => selectFile(file, true, (id) => setInstagramCarouselIds((current) => [...current, id]))} />
                {instagramCarouselIds.length > 0 && (
                  <div className="carousel-editor-list">
                    {instagramCarouselIds.map((id, index) => (
                      <div key={id}><MediaImage mediaId={id} alt={`Carousel item ${index + 2}`} /><button type="button" onClick={() => setInstagramCarouselIds((current) => current.filter((item) => item !== id))}>Remove</button></div>
                    ))}
                  </div>
                )}
                <label><span>Caption</span><textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={4} /></label>
                <div className="form-grid"><label><span>Location</span><input value={location} onChange={(e) => setLocation(e.target.value)} /></label><label><span>Music label</span><input value={music} onChange={(e) => setMusic(e.target.value)} /></label></div>
                <label><span>Displayed date</span><input value={displayedDate} onChange={(e) => setDisplayedDate(e.target.value)} /></label>
              </fieldset>
              <fieldset><legend>Engagement</legend>
                <div className="form-grid counts-grid"><label><span>Likes</span><input value={likes} onChange={(e) => setLikes(e.target.value)} /></label><label><span>Comments</span><input value={instagramComments} onChange={(e) => setInstagramComments(e.target.value)} /></label><label><span>Reposts</span><input value={reposts} onChange={(e) => setReposts(e.target.value)} /></label><label><span>Sends</span><input value={sends} onChange={(e) => setSends(e.target.value)} /></label></div>
                <Toggle label="Saved/bookmarked" checked={savedPost} onChange={setSavedPost} />
                <label><span>Fictional comments</span><textarea value={instagramCommentText} onChange={(e) => setInstagramCommentText(e.target.value)} rows={5} placeholder={'alex | Love this | 2h | 12\n> sam | Me too | 1h | 3'} /><small>One per line: author | comment | age | likes. Start replies with &gt;.</small></label>
              </fieldset>
              <fieldset><legend>Appearance</legend><label><span>Theme</span><select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}><option value="dark">Dark</option><option value="light">Light</option></select></label>
                <div className="toggle-grid"><Toggle label="Navigation header" checked={showHeader} onChange={setShowHeader} /><Toggle label="Engagement row" checked={showEngagement} onChange={setShowEngagement} /><Toggle label="Caption" checked={showCaption} onChange={setShowCaption} /><Toggle label="Date" checked={showDate} onChange={setShowDate} /><Toggle label="Music label" checked={showMusic} onChange={setShowMusic} /></div>
              </fieldset>
            </>
          ) : (
            <>
              <fieldset><legend>Community</legend>
                <label><span>Subreddit *</span><input value={subreddit} onChange={(e) => setSubreddit(e.target.value)} placeholder="community" /></label>
                {redditPresentation === 'post' && <label><span>Header subtitle</span><input value={communitySubtitle} onChange={(e) => setCommunitySubtitle(e.target.value)} placeholder="52.1k visitors per week" /></label>}
                <MediaPicker label="Community icon" mediaId={redditCommunityId} onFile={(file) => selectFile(file, false, setRedditCommunityId)} />
                <div className="toggle-grid"><Toggle label="Join button" checked={showJoin} onChange={setShowJoin} /><Toggle label="Community icon" checked={showSubredditIcon} onChange={setShowSubredditIcon} /></div>
              </fieldset>
              <fieldset><legend>Author</legend>
                <label><span>Use person</span><select value={redditPersonId} onChange={(e) => chooseRedditPerson(e.target.value)}><option value="">Custom author</option>{people.map((person) => <option key={person.id} value={person.id}>{person.name}{person.handle ? ` (u/${person.handle})` : ''}</option>)}</select></label>
                <div className="form-grid"><label><span>Username *</span><input value={username} onChange={(e) => setUsername(e.target.value)} /></label><label><span>Age</span><input value={age} onChange={(e) => setAge(e.target.value)} placeholder="4h" /></label></div>
                {redditPresentation === 'post' && <MediaPicker label="User avatar" mediaId={redditUserId} fallbackUrl={redditUserUrl} onFile={(file) => { setRedditPersonId(''); setRedditUserUrl(undefined); selectFile(file, false, setRedditUserId) }} />}
                <div className="toggle-grid"><Toggle label="Edited indicator" checked={edited} onChange={setEdited} /><Toggle label="Pinned post" checked={pinned} onChange={setPinned} /><Toggle label="Spoiler" checked={spoiler} onChange={setSpoiler} /><Toggle label="NSFW / 18+ label" checked={nsfw} onChange={setNsfw} /></div>
              </fieldset>
              <fieldset><legend>Content</legend>
                <label><span>Title *</span><textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={3} /></label>
                <label><span>Body</span><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} /></label>
                <MediaPicker label="Body image" mediaId={redditMainId} crop onFile={(file) => selectFile(file, true, setRedditMainId)} />
                <label><span>Content warning</span><input value={contentWarning} onChange={(e) => setContentWarning(e.target.value)} placeholder="Optional warning label" /></label>
                {nsfw && <label><span>NSFW label text</span><input value={nsfwLabel} onChange={(e) => setNsfwLabel(e.target.value)} /></label>}
                <div className="form-grid"><label><span>Post flair</span><input value={flair} onChange={(e) => setFlair(e.target.value)} /></label><label><span>Flair background</span><input type="color" value={flairBackground} onChange={(e) => setFlairBackground(e.target.value)} /></label><label><span>Flair text</span><input type="color" value={flairTextColor} onChange={(e) => setFlairTextColor(e.target.value)} /></label></div>
              </fieldset>
              <fieldset><legend>Engagement</legend>
                <div className="form-grid counts-grid"><label><span>Votes</span><input value={votes} onChange={(e) => setVotes(e.target.value)} /></label><label><span>Comments</span><input value={redditComments} onChange={(e) => setRedditComments(e.target.value)} /></label><label><span>Reposts</span><input value={redditReposts} onChange={(e) => setRedditReposts(e.target.value)} /></label><label><span>Share label</span><input value={shareLabel} onChange={(e) => setShareLabel(e.target.value)} /></label></div>
                <label><span>Vote state</span><select value={voteState} onChange={(e) => setVoteState(e.target.value as NonNullable<RedditPost['voteState']>)}><option value="neutral">Neutral</option><option value="up">Upvoted</option><option value="down">Downvoted</option></select></label>
                {redditPresentation === 'post' && <label><span>Comment thread</span><textarea value={redditCommentText} onChange={(e) => setRedditCommentText(e.target.value)} rows={7} placeholder={'alex | Top-level comment | 2h | 12\n> sam | Reply to Alex | 1h | 3'} /><small>One per line: author | comment | age | votes. Start replies with &gt;.</small></label>}
              </fieldset>
              {redditPresentation === 'post' && <fieldset><legend>Composer</legend>
                <label><span>Placeholder</span><input value={commentPlaceholder} onChange={(e) => setCommentPlaceholder(e.target.value)} /></label>
                <div className="toggle-grid"><Toggle label="Comment composer" checked={showComposer} onChange={setShowComposer} /><Toggle label="GIF button" checked={showGif} onChange={setShowGif} /><Toggle label="Image button" checked={showComposerImage} onChange={setShowComposerImage} /><Toggle label="Collapse button" checked={showComposerCollapse} onChange={setShowComposerCollapse} /></div>
              </fieldset>}
              <fieldset><legend>Appearance</legend>
                <label><span>Theme</span><select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}><option value="dark">Dark</option><option value="light">Light</option></select></label>
                {redditPresentation === 'post' && <><label><span>Inbox badge</span><input value={inboxBadge} onChange={(e) => setInboxBadge(e.target.value)} placeholder="4" /></label>
                <div className="toggle-grid"><Toggle label="Back button" checked={showClose} onChange={setShowClose} /><Toggle label="Search button" checked={showSearch} onChange={setShowSearch} /><Toggle label="Header share button" checked={showHeaderShare} onChange={setShowHeaderShare} /><Toggle label="Extra filter button" checked={showFilter} onChange={setShowFilter} /><Toggle label="Author overflow button" checked={showOverflow} onChange={setShowOverflow} /><Toggle label="Bottom navigation" checked={showBottomNavigation} onChange={setShowBottomNavigation} /></div></>}
              </fieldset>
            </>
          )}
          <section className="post-default-actions">
            <div>
              <strong>Defaults for new {platform === 'instagram' ? 'photo' : 'forum'} posts</strong>
              <small>Images and post-specific content are not included.</small>
            </div>
            <button type="button" className="secondary-action-button" onClick={saveCurrentDefaults}><BookmarkPlus size={18} />Save as defaults</button>
            <button type="button" className="text-button" onClick={clearDefaults}><Trash2 size={17} />Clear</button>
            {defaultsMessage && <p role="status">{defaultsMessage}</p>}
          </section>
          <button className="primary-button full-width-button editor-save-button" type="submit" disabled={platform === 'instagram' ? !handle.trim() || !instagramMainId : !subreddit.trim() || !username.trim() || !title.trim()}><Save size={19} />Save & Preview</button>
        </form>
      </main>
      {cropJob && <CropEditor imageUrl={cropJob.url} showPresets onCancel={() => { URL.revokeObjectURL(cropJob.url); setCropJob(undefined) }} onComplete={(blob) => void cropJob.finish(blob)} />}
    </div>
  )
}
