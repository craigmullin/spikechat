import { ArrowLeft, MessageCircleMore, Plus, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { loadPeople } from '../storage'
import { personInitials } from '../features/people/identity'

export function NewChatPage() {
  const people = loadPeople().filter((person) => !person.archivedAt)
  return <div className="screen-shell new-chat-shell">
    <header className="screen-header compact-header"><Link to="/studio" className="icon-button" aria-label="Back to studio"><ArrowLeft size={24} /></Link><div><span className="eyebrow">Chat</span><h1>New Chat</h1></div></header>
    <main className="new-chat-content">
      <section className="new-chat-intro"><div className="empty-icon"><MessageCircleMore size={34} /></div><h2>Who is this conversation with?</h2><p>Choose someone you’ve already created or add a new fictional person.</p></section>
      <Link to="/people/new" className="new-chat-create-card"><span className="new-chat-action-icon"><Plus size={24} /></span><span><strong>Create a new person</strong><small>Set up their name, photo, status, and profile.</small></span></Link>
      <section className="existing-people-section" aria-labelledby="existing-people-title"><h2 id="existing-people-title">Use an existing person</h2>
        {people.length > 0 ? <div className="people-list">{people.map((person) => <Link key={person.id} to={`/chat/${person.id}`} className="person-card-main new-chat-person"><div className="avatar avatar-list">{person.photoUrl ? <img src={person.photoUrl} alt="" /> : <span>{personInitials(person)}</span>}</div><span className="person-card-details"><strong>{person.name}</strong><span>{person.status || 'Active now'}</span></span><MessageCircleMore size={21} /></Link>)}</div> : <div className="no-existing-people"><UserRound size={24} /><p>You don’t have any saved people yet. Create one above to begin your first chat.</p></div>}
      </section>
    </main>
  </div>
}
