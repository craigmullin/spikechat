import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { SiteFooter } from './SiteFooter'

export function PublicLayout({ children }: { children: ReactNode }) {
  return <div className="public-shell">
    <header className="public-nav"><Link className="public-brand" to="/" aria-label="SpikeChat home"><img src="/pwa-192x192.png" alt="" /><span>SpikeChat</span></Link><nav aria-label="Primary navigation"><Link to="/about">About</Link><Link className="nav-launch" to="/studio">Launch Studio</Link></nav></header>
    <main className="public-main">{children}</main><SiteFooter />
  </div>
}
