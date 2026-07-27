import { ArrowLeft, Camera, Save, Trash2 } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { blobToDataUrl, imageProcessingError, optimizeImage } from '../features/media/imageProcessing'
import { loadPeople, savePeople } from '../storage'
import type { Person } from '../types'

export function EditPersonPage() {
  const navigate = useNavigate()
  const { personId } = useParams()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const existingPerson = useMemo(
    () => loadPeople().find((person) => person.id === personId),
    [personId],
  )

  const [name, setName] = useState(existingPerson?.name ?? '')
  const [handle, setHandle] = useState(existingPerson?.handle ?? '')
  const [status, setStatus] = useState(existingPerson?.status ?? 'Active now')
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
      status: status.trim() || 'Active now',
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

    const confirmed = window.confirm(
      `Delete ${existingPerson.name}? Their messages will remain for now.`,
    )

    if (!confirmed) {
      return
    }

    const nextPeople = loadPeople().filter(
      (person) => person.id !== existingPerson.id,
    )

    savePeople(nextPeople)
    navigate('/people')
  }

  return (
    <div className="screen-shell">
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

          <button
            className="primary-button full-width-button"
            type="submit"
            disabled={!name.trim()}
          >
            <Save size={18} />
            {existingPerson ? 'Save Changes' : 'Save Person'}
          </button>

          {existingPerson && (
            <button
              className="danger-button full-width-button"
              type="button"
              onClick={handleDelete}
            >
              <Trash2 size={18} />
              Delete Person
            </button>
          )}
        </form>
      </main>
    </div>
  )
}
