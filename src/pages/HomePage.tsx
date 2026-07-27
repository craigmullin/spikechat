import { Camera, MessageCircleMore, Radio } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="mode-home">
      <header className="mode-hero">
        <span className="eyebrow">SpikeChat Studio</span>
        <h1>Create the conversation.</h1>
        <p>Private, fictional chat and social-post mockups—all stored on this device.</p>
      </header>
      <main className="mode-grid">
        <Link to="/people" className="mode-card mode-chat">
          <MessageCircleMore size={32} />
          <div><strong>Chat</strong><span>Build fictional conversations</span></div>
        </Link>
        <Link to="/social-posts?platform=instagram" className="mode-card mode-instagram">
          <Camera size={32} />
          <div><strong>Instagram-style</strong><span>Create photo posts</span></div>
        </Link>
        <Link to="/social-posts?platform=reddit" className="mode-card mode-reddit">
          <Radio size={32} />
          <div><strong>Reddit-style</strong><span>Create community posts</span></div>
        </Link>
      </main>
      <footer className="local-note">No accounts. No feeds. Your work stays local.</footer>
    </div>
  )
}
