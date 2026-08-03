import { ArrowLeft, Camera, Download, ImagePlus } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from 'react'
import { Link } from 'react-router-dom'
import { blobToDataUrl, imageProcessingError, optimizeImage } from '../media/imageProcessing'

const DEFAULT_POSITION = 50

export function SnapchatEditorPage() {
  const fileInput = useRef<HTMLInputElement>(null)
  const preview = useRef<HTMLDivElement>(null)
  const image = useRef<HTMLImageElement>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [captionPosition, setCaptionPosition] = useState(DEFAULT_POSITION)
  const [error, setError] = useState('')

  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      setImageUrl(await blobToDataUrl(await optimizeImage(file, 'content')))
      setCaptionPosition(DEFAULT_POSITION)
      setError('')
    } catch (cause) {
      setError(imageProcessingError(cause))
    } finally {
      event.target.value = ''
    }
  }

  const moveCaption = (clientY: number) => {
    const bounds = preview.current?.getBoundingClientRect()
    if (!bounds) return
    const next = ((clientY - bounds.top) / bounds.height) * 100
    setCaptionPosition(Math.min(94, Math.max(6, Math.round(next))))
  }

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    moveCaption(event.clientY)
  }

  const exportImage = () => {
    const source = image.current
    if (!source) return
    const canvas = document.createElement('canvas')
    canvas.width = source.naturalWidth
    canvas.height = source.naturalHeight
    const context = canvas.getContext('2d')
    if (!context) return
    context.drawImage(source, 0, 0)
    if (caption.trim()) {
      const fontSize = Math.max(24, Math.round(canvas.width * 0.052))
      const stripHeight = fontSize * 1.75
      const centerY = canvas.height * captionPosition / 100
      context.fillStyle = 'rgba(0, 0, 0, 0.48)'
      context.fillRect(0, centerY - stripHeight / 2, canvas.width, stripHeight)
      context.fillStyle = '#fff'
      context.font = `500 ${fontSize}px "Avenir Next", Avenir, "Helvetica Neue", Arial, sans-serif`
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      const maxWidth = canvas.width * 0.92
      context.fillText(caption.trim(), canvas.width / 2, centerY, maxWidth)
    }
    const link = document.createElement('a')
    link.download = 'spikechat-snapchat-mockup.jpg'
    link.href = canvas.toDataURL('image/jpeg', 0.94)
    link.click()
  }

  return <div className="screen-shell snapchat-editor-shell">
    <header className="screen-header compact-header sticky-editor-header"><Link to="/studio" className="icon-button" aria-label="Back to studio"><ArrowLeft size={24} /></Link><div><span className="eyebrow">Snapchat-style</span><h1>Create Snap</h1></div></header>
    <main className="snapchat-editor-content">
      <section className="snapchat-preview-card">
        {imageUrl ? <div ref={preview} className="snapchat-canvas"><img ref={image} src={imageUrl} alt="Snap preview" />{caption.trim() && <div className="snapchat-caption-strip" style={{ top: `${captionPosition}%` }} onPointerDown={startDrag} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveCaption(event.clientY) }}><span>{caption}</span></div>}</div> : <button type="button" className="snapchat-empty-preview" onClick={() => fileInput.current?.click()}><Camera size={40} /><strong>Choose a photo</strong><span>Start with a portrait or landscape image.</span></button>}
      </section>
      <section className="snapchat-controls">
        <input ref={fileInput} className="hidden-file-input" type="file" accept="image/*" onChange={(event) => void chooseImage(event)} />
        <button type="button" className="secondary-action-button" onClick={() => fileInput.current?.click()}><ImagePlus size={18} />{imageUrl ? 'Change photo' : 'Choose photo'}</button>
        <label><span>Caption</span><input type="text" value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="Enter caption" maxLength={140} /></label>
        <label><span>Caption position</span><input type="range" min="6" max="94" value={captionPosition} onChange={(event) => setCaptionPosition(Number(event.target.value))} /><small>Drag the caption on the photo or use this slider.</small></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button type="button" className="primary-button full-width-button" disabled={!imageUrl} onClick={exportImage}><Download size={18} />Download image</button>
      </section>
    </main>
  </div>
}
