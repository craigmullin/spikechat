import {
  ArrowLeft,
  CheckCircle2,
  Download,
  FileUp,
  HardDrive,
  ShieldCheck,
} from 'lucide-react'
import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  backupFilename,
  createBackup,
  parseBackupText,
  restoreBackup,
  type BackupPayload,
} from './backupService'

export function BackupPage() {
  const navigate = useNavigate()
  const input = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<BackupPayload>()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const exportBackup = async () => {
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const backup = await createBackup()
      const blob = new Blob([JSON.stringify(backup)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = backupFilename()
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setMessage('Backup created. Keep the downloaded file somewhere safe.')
    } catch {
      setError('Chat could not create the backup.')
    } finally {
      setBusy(false)
    }
  }

  const chooseBackup = async (file?: File) => {
    if (!file) return
    setError('')
    setMessage('')
    setPending(undefined)
    try {
      setPending(parseBackupText(await file.text()))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not read backup.')
    }
  }

  const confirmRestore = async () => {
    if (!pending) return
    const confirmed = window.confirm(
      'Replace all data currently stored in this browser with this backup?',
    )
    if (!confirmed) return
    setBusy(true)
    setError('')
    try {
      await restoreBackup(pending)
      setPending(undefined)
      setMessage('Backup restored successfully.')
      window.setTimeout(() => navigate('/studio'), 700)
    } catch {
      setError('Chat could not restore this backup. Existing metadata was not changed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="screen-shell backup-shell">
      <header className="screen-header compact-header">
        <Link to="/" className="icon-button" aria-label="Back to modes">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <span className="eyebrow">Chat Studio</span>
          <h1>Data & Backup</h1>
        </div>
      </header>
      <main className="backup-content">
        <section className="backup-intro">
          <div className="empty-icon"><HardDrive size={32} /></div>
          <h2>Keep your work portable</h2>
          <p>A backup includes people, conversations, social posts, and all locally stored images.</p>
        </section>

        <section className="backup-card">
          <div><Download size={24} /><div><h2>Export backup</h2><p>Download one file containing all Chat data in this browser.</p></div></div>
          <button type="button" className="primary-button full-width-button" onClick={() => void exportBackup()} disabled={busy}>
            <Download size={18} />{busy ? 'Working…' : 'Download Backup'}
          </button>
        </section>

        <section className="backup-card">
          <div><FileUp size={24} /><div><h2>Restore backup</h2><p>Choose a Chat backup and review it before replacing local data.</p></div></div>
          <input ref={input} className="hidden-file-input" type="file" accept=".json,application/json" onChange={(event) => { void chooseBackup(event.target.files?.[0]); event.target.value = '' }} />
          <button type="button" className="secondary-action-button" onClick={() => input.current?.click()} disabled={busy}>
            <FileUp size={18} />Choose Backup File
          </button>
          {pending && (
            <div className="restore-summary">
              <strong>Backup from {new Date(pending.exportedAt).toLocaleString()}</strong>
              <span>{pending.people.length} people · {pending.messages.length} messages</span>
              <span>{pending.socialPosts.length} posts · {pending.media.length} media files</span>
              <button type="button" className="danger-button full-width-button" onClick={() => void confirmRestore()} disabled={busy}>
                Replace Local Data
              </button>
            </div>
          )}
        </section>

        <div className="backup-privacy"><ShieldCheck size={20} /><span>The backup stays on your device unless you choose to move or upload it.</span></div>
        {message && <p className="backup-status success"><CheckCircle2 size={18} />{message}</p>}
        {error && <p className="backup-status error" role="alert">{error}</p>}
      </main>
    </div>
  )
}
