import { Link } from 'react-router-dom'
import { PublicLayout } from '../components/PublicLayout'

export function AboutPage() {
  return <PublicLayout><article className="prose-page"><span className="eyebrow">About</span><h1>About Chat</h1><p>Chat is a browser-based conversation mockup studio built as an independent software project by <a href="https://www.craigmullin.com">Craig Mullin</a>.</p><p>It was created to make designing realistic messaging interfaces fast, flexible, and enjoyable.</p><h2>Common uses</h2><ul><li>UI and UX design</li><li>Application mockups</li><li>Storyboarding and creative writing</li><li>Educational material</li><li>Presentations</li><li>Social media concepts</li></ul><p>Chat is intended for creating fictional conversations and interface mockups for creative, educational, and prototyping purposes.</p><details className="experimental-tools"><summary>Experimental tools</summary><nav aria-label="Experimental tools"><Link to="/snapchat">Snapchat-style editor</Link><Link to="/social-posts?platform=reddit&view=card">Reddit card editor</Link></nav></details></article></PublicLayout>
}
