import {
  ArrowLeft,
  MessageCircleMore,
  Pencil,
  Plus,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { loadPeople } from '../storage'
import type { Person } from '../types'

export function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])

  useEffect(() => {
    setPeople(loadPeople())
  }, [])

  return (
    <div className="screen-shell">
      <header className="screen-header">
        <Link to="/" className="icon-button" aria-label="Back to modes">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <span className="eyebrow">SpikeChat</span>
          <h1>People</h1>
        </div>

        <Link
          to="/people/new"
          className="primary-icon-button"
          aria-label="Create person"
        >
          <Plus size={24} />
        </Link>
      </header>

      <main className="people-content">
        {people.length === 0 ? (
          <section className="empty-state">
            <div className="empty-icon">
              <UserRound size={34} />
            </div>

            <h2>No people yet</h2>
            <p>Create a person to start building a conversation.</p>

            <Link to="/people/new" className="primary-button">
              <Plus size={18} />
              New Person
            </Link>
          </section>
        ) : (
          <div className="people-list">
            {people.map((person) => (
              <div key={person.id} className="person-card">
                <Link
                  to={`/chat/${person.id}`}
                  className="person-card-main"
                >
                  <div className="avatar avatar-list">
                    {person.photoUrl ? (
                      <img src={person.photoUrl} alt={person.name} />
                    ) : (
                      <span>{person.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>

                  <div className="person-card-details">
                    <strong>{person.name}</strong>
                    <span>
                      {person.handle
                        ? `@${person.handle}${person.status ? ` · ${person.status}` : ''}`
                        : person.status || 'Active now'}
                    </span>
                  </div>

                  <MessageCircleMore size={21} />
                </Link>

                <Link
                  to={`/people/${person.id}/edit`}
                  className="edit-person-button"
                  aria-label={`Edit ${person.name}`}
                >
                  <Pencil size={18} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
