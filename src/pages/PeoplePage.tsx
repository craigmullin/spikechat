import {
  ArrowLeft,
  MessageCircleMore,
  Pencil,
  Plus,
  UserRound,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { loadMessages, loadPeople } from '../storage'
import { loadSocialPosts } from '../features/social-posts/socialPostRepository'
import type { Person } from '../types'
import { personInitials } from '../features/people/identity'

export function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])

  useEffect(() => {
    setPeople(loadPeople())
  }, [])

  return (
    <div className="screen-shell">
      <header className="screen-header">
        <Link to="/studio" className="icon-button" aria-label="Back to studio">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <span className="eyebrow">Chat</span>
          <h1>People</h1>
        </div>

        <Link
          to="/people/new"
          className="primary-icon-button"
          aria-label="Add a new person"
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
            <p>Create a fictional person, then you’ll go straight to the conversation editor.</p>

            <Link to="/people/new" className="primary-button">
              <Plus size={18} />
              New Person
            </Link>
          </section>
        ) : (
          <section aria-label="People">
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
                      <span>{personInitials(person)}</span>
                    )}
                  </div>

                  <div className="person-card-details">
                    <strong>{person.name}{person.archivedAt ? ' · Archived' : ''}</strong>
                    <span>
                      {person.handle
                        ? `@${person.handle}${person.status ? ` · ${person.status}` : ''}`
                        : person.status || 'Active now'}
                    </span>
                    {(person.pronouns || person.bio) && (
                      <small>{[person.pronouns, person.bio].filter(Boolean).join(' · ')}</small>
                    )}
                    <small>
                      Used in {loadMessages().filter((message) => message.personId === person.id).length} messages and{' '}
                      {loadSocialPosts().filter((post) => post.personId === person.id).length} posts
                    </small>
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
          </section>
        )}
      </main>
    </div>
  )
}
