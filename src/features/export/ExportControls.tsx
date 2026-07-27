import { Download, Share2 } from 'lucide-react'
import { useState } from 'react'
import type { RefObject } from 'react'
import { capturePng, downloadBlob, shareOrDownload } from './exportImage'

interface ExportControlsProps {
  targetRef: RefObject<HTMLElement | null>
  filename: string
  onBeforeCapture?: () => void | Promise<void>
  onAfterCapture?: () => void
}

export function ExportControls({
  targetRef,
  filename,
  onBeforeCapture,
  onAfterCapture,
}: ExportControlsProps) {
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')

  const create = async (share: boolean) => {
    try {
      setWorking(true)
      setError('')
      await onBeforeCapture?.()
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      )
      if (!targetRef.current) throw new Error('The preview is not ready.')
      const blob = await capturePng(targetRef.current)
      if (share) await shareOrDownload(blob, filename)
      else downloadBlob(blob, filename)
    } catch (reason) {
      if (reason instanceof DOMException && reason.name === 'AbortError') return
      setError(reason instanceof Error ? reason.message : 'Could not export this image.')
    } finally {
      onAfterCapture?.()
      setWorking(false)
    }
  }

  return (
    <div className="export-controls" aria-live="polite">
      <button type="button" onClick={() => void create(false)} disabled={working}>
        <Download size={19} />
        {working ? 'Creating…' : 'PNG'}
      </button>
      <button type="button" onClick={() => void create(true)} disabled={working}>
        <Share2 size={19} />
        Share
      </button>
      {error && <span role="alert">{error}</span>}
    </div>
  )
}
