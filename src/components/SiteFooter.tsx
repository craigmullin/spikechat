import { Link } from 'react-router-dom'

const VERSION = '1.0.0'

export function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`site-footer${compact ? ' site-footer-compact' : ''}`}>
      <nav aria-label="Footer navigation">
        <Link to="/">Home</Link><Link to="/about">About</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link>
        <a href="https://github.com/craigmullin/chat" target="_blank" rel="noreferrer">GitHub</a>
        <a href="https://www.craigmullin.com" target="_blank" rel="noreferrer">CraigMullin.com</a>
      </nav>
      <p>Created by <a href="https://www.craigmullin.com" target="_blank" rel="noreferrer">Craig Mullin</a> <span>· v{VERSION}</span></p>
    </footer>
  )
}
