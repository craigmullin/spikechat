import { ArrowRight, BookOpen, GraduationCap, LayoutTemplate, PenTool } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PublicLayout } from '../components/PublicLayout'

export function LandingPage() {
  return <PublicLayout>
    <section className="landing-hero"><span className="eyebrow">Conversation Mockup Studio</span><h1>Create realistic conversation mockups for storytelling, education, design, and prototyping.</h1><p>SpikeChat is a browser-based studio for creating fictional conversations and messaging interfaces. Build polished, realistic screenshots for apps, stories, lessons, and presentations.</p><Link className="landing-cta" to="/studio">Launch SpikeChat <ArrowRight size={20} /></Link><p className="landing-trust">No account required. Your projects stay in your browser.</p></section>
    <section className="use-grid" aria-label="Ways to use SpikeChat"><article><LayoutTemplate /><h2>Prototype interfaces</h2><p>Explore messaging ideas and app flows without building a full product.</p></article><article><BookOpen /><h2>Tell stories</h2><p>Create convincing conversation visuals for narrative and creative work.</p></article><article><GraduationCap /><h2>Teach concepts</h2><p>Illustrate scenarios and discussions in educational material.</p></article><article><PenTool /><h2>Design presentations</h2><p>Produce clean message and social-post mockups for decks and concepts.</p></article></section>
  </PublicLayout>
}
