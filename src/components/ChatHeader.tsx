import { ArrowLeft, MoreVertical, Phone, Video } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Person } from '../types'

interface ChatHeaderProps {
  person: Person
}

export function ChatHeader({ person }: ChatHeaderProps) {
  const navigate = useNavigate()

  return (
    <header className="chat-header">
      <button
        className="icon-button"
        onClick={() => navigate('/people')}
        aria-label="Go back"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="header-person">
        <div className="avatar avatar-small">
          {person.photoUrl ? (
            <img src={person.photoUrl} alt={person.name} />
          ) : (
            <span>{person.name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        <div className="person-details">
          <strong>{person.name}</strong>
          <span>{person.status ?? 'Active now'}</span>
        </div>
      </div>

      <div className="header-actions">
        <button className="icon-button" aria-label="Start audio call">
          <Phone size={21} />
        </button>

        <button className="icon-button" aria-label="Start video call">
          <Video size={22} />
        </button>

        <button className="icon-button" aria-label="More options">
          <MoreVertical size={22} />
        </button>
      </div>
    </header>
  )
}
