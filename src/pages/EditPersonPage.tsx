import { Archive, ArrowLeft, Camera, Copy, Save, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { blobToDataUrl, imageProcessingError, optimizeImage } from '../features/media/imageProcessing'
import { loadMessages, loadPeople, savePeople } from '../storage'
import { loadSocialPosts } from '../features/social-posts/socialPostRepository'
import type { Person } from '../types'

export function EditPersonPage() {
  const navigate = useNavigate()
  const { personId } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const instagramPhotoInputRef = useRef<HTMLInputElement>(null)
  const redditPhotoInputRef = useRef<HTMLInputElement>(null)

  const existingPerson = useMemo(
    () => loadPeople().find((person) => person.id === personId),
    [personId],
  )

  const [name, setName] = useState(existingPerson?.name ?? '')
  const [handle, setHandle] = useState(existingPerson?.handle ?? '')
  const [instagramHandle, setInstagramHandle] = useState(existingPerson?.instagramHandle ?? '')
  const [instagramDisplayName, setInstagramDisplayName] = useState(existingPerson?.instagramDisplayName ?? '')
  const [instagramPhotoUrl, setInstagramPhotoUrl] = useState(existingPerson?.instagramPhotoUrl ?? '')
  const [instagramVerified, setInstagramVerified] = useState(existingPerson?.instagramVerified ?? false)
  const [redditUsername, setRedditUsername] = useState(existingPerson?.redditUsername ?? '')
  const [redditPhotoUrl, setRedditPhotoUrl] = useState(existingPerson?.redditPhotoUrl ?? '')
  const [redditDefaultCommunity, setRedditDefaultCommunity] = useState(existingPerson?.redditDefaultCommunity ?? '')
  const [status, setStatus] = useState(existingPerson?.status ?? 'Active now')
  const [pronouns, setPronouns] = useState(existingPerson?.pronouns ?? '')
  const [bio, setBio] = useState(existingPerson?.bio ?? '')
  const [isVerified, setIsVerified] = useState(existingPerson?.isVerified ?? false)
  const [accentColor, setAccentColor] = useState(existingPerson?.accentColor ?? '#1688f8')
  const [photoUrl, setPhotoUrl] = useState(existingPerson?.photoUrl ?? '')
  const [imageError, setImageError] = useState('')

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    try {
      setPhotoUrl(await blobToDataUrl(await optimizeImage(file, 'avatar')))
      setImageError('')
    } catch (error) {
      setImageError(imageProcessingError(error))
    } finally {
      event.target.value = ''
    }
  }

  const handlePlatformPhoto = async (
    event: ChangeEvent<HTMLInputElement>,
    setter: (value: string) => void,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setter(await blobToDataUrl(await optimizeImage(file, 'avatar')))
      setImageError('')
    } catch (error) {
      setImageError(imageProcessingError(error))
    } finally {
      event.target.value = ''
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedName = name.trim()

    if (!trimmedName) {
      return
    }

    const people = loadPeople()

    const person: Person = {
      id: existingPerson?.id ?? crypto.randomUUID(),
      name: trimmedName,
      handle: handle.trim().replace(/^@/, '') || undefined,
      instagramHandle: instagramHandle.trim().replace(/^@/, '') || undefined,
      instagramDisplayName: instagramDisplayName.trim() || undefined,
      instagramPhotoUrl: instagramPhotoUrl || undefined,
      instagramVerified,
      redditUsername: redditUsername.trim().replace(/^(u\/|@)/, '') || undefined,
      redditPhotoUrl: redditPhotoUrl || undefined,
      redditDefaultCommunity: redditDefaultCommunity.trim().replace(/^r\//, '') || undefined,
      status: status.trim() || 'Active now',
      pronouns: pronouns.trim() || undefined,
      bio: bio.trim() || undefined,
      isVerified,
      accentColor,
      photoUrl: photoUrl || undefined,
    }

    const nextPeople = existingPerson
      ? people.map((item) => (item.id === person.id ? person : item))
      : [...people, person]

    savePeople(nextPeople)
    navigate(`/chat/${person.id}`)
  }

  const handleDelete = () => {
    if (!existingPerson) {
      return
    }

    const useCount =
      loadMessages().filter((message) => message.personId === existingPerson.id).length +
      loadSocialPosts().filter((post) => post.personId === existingPerson.id).length
    if (useCount > 0) {
      const confirmed = window.confirm(
        `${existingPerson.name} is used in ${useCount} item${useCount === 1 ? '' : 's'}. Archive the identity instead so existing content keeps working?`,
      )
      if (!confirmed) return
      savePeople(loadPeople().map((person) =>
        person.id === existingPerson.id ? { ...person, archivedAt: Date.now() } : person,
      ))
      navigate('/people')
      return
    }

    const confirmed = window.confirm(`Permanently delete ${existingPerson.name}?`)

    if (!confirmed) {
      return
    }

    const nextPeople = loadPeople().filter(
      (person) => person.id !== existingPerson.id,
    )

    savePeople(nextPeople)
    navigate('/people')
  }

  const handleDuplicate = () => {
    if (!existingPerson) return
    const duplicate = {
      ...existingPerson,
      id: crypto.randomUUID(),
      name: `${existingPerson.name} Copy`,
      archivedAt: undefined,
    }
    savePeople([...loadPeople(), duplicate])
    navigate(`/people/${duplicate.id}/edit`)
  }

  return (
    <div className="screen-shell person-editor-shell">
      <header className="screen-header compact-header">
        <button
          className="icon-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <ArrowLeft size={24} />
        </button>

        <div>
          <span className="eyebrow">SpikeChat</span>
          <h1>{existingPerson ? 'Edit Person' : 'New Person'}</h1>
        </div>
      </header>

      <main className="form-content">
        <form className="person-form" onSubmit={handleSubmit}>
          <div className="profile-preview">
            <button
              type="button"
              className="profile-photo-button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Choose profile photo"
            >
              <div className="avatar avatar-profile">
                {photoUrl ? (
                  <img src={photoUrl} alt={name || 'Profile preview'} />
                ) : (
                  <span>{name.trim().charAt(0).toUpperCase() || '?'}</span>
                )}
              </div>

              <div className="camera-badge">
                <Camera size={18} />
              </div>
            </button>

            <input
              ref={fileInputRef}
              className="hidden-file-input"
              type="file"
              accept="image/*"
              onChange={(event) => void handlePhotoChange(event)}
            />

            <button
              type="button"
              className="text-button"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose photo
            </button>

            {photoUrl && (
              <button
                type="button"
                className="text-button muted-text-button"
                onClick={() => setPhotoUrl('')}
              >
                Remove photo
              </button>
            )}

            {imageError && (
              <p className="form-error" role="alert">
                {imageError}
              </p>
            )}
          </div>

          <label>
            <span>Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Meaghan"
              autoFocus={!existingPerson}
            />
          </label>

          <label>
            <span>Handle</span>
            <input
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="meaghan"
              autoCapitalize="none"
              spellCheck={false}
            />
          </label>

          <label>
            <span>Status</span>
            <input
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              placeholder="Active now"
            />
          </label>

          <div className="form-grid">
            <label>
              <span>Instagram-style handle</span>
              <input value={instagramHandle} onChange={(event) => setInstagramHandle(event.target.value)} placeholder={handle || 'photo_handle'} autoCapitalize="none" />
            </label>
            <label>
              <span>Reddit-style username</span>
              <input value={redditUsername} onChange={(event) => setRedditUsername(event.target.value)} placeholder={handle || 'forum_username'} autoCapitalize="none" />
            </label>
          </div>

          <fieldset className="identity-platform-card">
            <legend>Photo-post profile</legend>
            <label><span>Display name</span><input value={instagramDisplayName} onChange={(event) => setInstagramDisplayName(event.target.value)} placeholder={name || 'Display name'} /></label>
            <div className="platform-avatar-row">
              <div className="avatar avatar-list">{instagramPhotoUrl ? <img src={instagramPhotoUrl} alt="" /> : <span>IG</span>}</div>
              <button type="button" className="secondary-action-button" onClick={() => instagramPhotoInputRef.current?.click()}><Camera size={17} />{instagramPhotoUrl ? 'Change avatar' : 'Separate avatar'}</button>
              {instagramPhotoUrl && <button type="button" className="text-button" onClick={() => setInstagramPhotoUrl('')}>Use main</button>}
            </div>
            <input ref={instagramPhotoInputRef} className="hidden-file-input" type="file" accept="image/*" onChange={(event) => void handlePlatformPhoto(event, setInstagramPhotoUrl)} />
            <label className="toggle-field"><input type="checkbox" checked={instagramVerified} onChange={(event) => setInstagramVerified(event.target.checked)} /><span>Verified by default</span></label>
          </fieldset>

          <fieldset className="identity-platform-card">
            <legend>Forum profile</legend>
            <label><span>Default community</span><input value={redditDefaultCommunity} onChange={(event) => setRedditDefaultCommunity(event.target.value)} placeholder="community" /></label>
            <div className="platform-avatar-row">
              <div className="avatar avatar-list">{redditPhotoUrl ? <img src={redditPhotoUrl} alt="" /> : <span>R</span>}</div>
              <button type="button" className="secondary-action-button" onClick={() => redditPhotoInputRef.current?.click()}><Camera size={17} />{redditPhotoUrl ? 'Change avatar' : 'Separate avatar'}</button>
              {redditPhotoUrl && <button type="button" className="text-button" onClick={() => setRedditPhotoUrl('')}>Use main</button>}
            </div>
            <input ref={redditPhotoInputRef} className="hidden-file-input" type="file" accept="image/*" onChange={(event) => void handlePlatformPhoto(event, setRedditPhotoUrl)} />
          </fieldset>

          <label>
            <span>Pronouns</span>
            <input value={pronouns} onChange={(event) => setPronouns(event.target.value)} placeholder="she/her" />
          </label>

          <label>
            <span>Bio / character notes</span>
            <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={3} placeholder="A short reusable description of this fictional identity." />
          </label>

          <div className="identity-options">
            <label className="toggle-field"><input type="checkbox" checked={isVerified} onChange={(event) => setIsVerified(event.target.checked)} /><span>Verified identity</span></label>
            <label><span>Accent color</span><input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} /></label>
          </div>

          <button
            className="primary-button full-width-button"
            type="submit"
            disabled={!name.trim()}
          >
            <Save size={18} />
            {existingPerson ? 'Save Changes' : 'Save Person'}
          </button>

          {existingPerson && (
            <>
              <button className="secondary-action-button full-width-button" type="button" onClick={handleDuplicate}><Copy size={18} />Duplicate Person</button>
              <button className="danger-button full-width-button" type="button" onClick={handleDelete}>
                {existingPerson.archivedAt ? <Trash2 size={18} /> : <Archive size={18} />}
                Delete or Archive
              </button>
            </>
          )}
        </form>
      </main>
    </div>
  )
}
