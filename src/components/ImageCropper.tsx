import Cropper, { type Area } from 'react-easy-crop'
import { RotateCcw, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ImageCropperProps {
  imageUrl: string
  onCancel: () => void
  onComplete: (blob: Blob) => void
}

async function createCroppedImage(
  imageUrl: string,
  crop: Area,
): Promise<Blob> {
  const image = new Image()
  image.src = imageUrl
  await image.decode()

  const canvas = document.createElement('canvas')
  canvas.width = crop.width
  canvas.height = crop.height

  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('Image cropping is not supported in this browser.')
  }

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob
          ? resolve(blob)
          : reject(new Error('Unable to create the cropped image.')),
      'image/jpeg',
      0.92,
    )
  })
}

export function ImageCropper({
  imageUrl,
  onCancel,
  onComplete,
}: ImageCropperProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  const finishCrop = async () => {
    if (!croppedArea || isSaving) return

    setIsSaving(true)
    setError('')

    try {
      onComplete(await createCroppedImage(imageUrl, croppedArea))
    } catch (cropError) {
      setError(
        cropError instanceof Error
          ? cropError.message
          : 'Unable to crop this image.',
      )
      setIsSaving(false)
    }
  }

  return (
    <div className="crop-editor" role="dialog" aria-modal="true">
      <header className="crop-editor-header">
        <button type="button" className="icon-button" onClick={onCancel}>
          <X size={24} />
          <span className="sr-only">Cancel cropping</span>
        </button>
        <strong>Crop photo</strong>
        <button
          type="button"
          className="crop-done-button"
          onClick={finishCrop}
          disabled={!croppedArea || isSaving}
        >
          {isSaving ? 'Saving…' : 'Done'}
        </button>
      </header>

      <div className="crop-stage">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setCroppedArea(pixels)}
          showGrid
        />
      </div>

      <footer className="crop-controls">
        <RotateCcw size={19} aria-hidden="true" />
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          aria-label="Zoom image"
        />
        {error && <p className="crop-error">{error}</p>}
      </footer>
    </div>
  )
}
