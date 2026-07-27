import { RotateCcw, RotateCw, Undo2, X } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import ReactCrop, {
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { cropImage } from './cropImage'

export type CropPreset = 'free' | 'original' | 'square' | 'portrait' | 'landscape'

interface CropEditorProps {
  imageUrl: string
  initialPreset?: CropPreset
  showPresets?: boolean
  onCancel: () => void
  onComplete: (blob: Blob) => void
}

const presetAspect: Record<Exclude<CropPreset, 'free' | 'original'>, number> = {
  square: 1,
  portrait: 4 / 5,
  landscape: 1.91,
}

function initialCrop(width: number, height: number, aspect?: number): Crop {
  if (!aspect) return { unit: '%', x: 5, y: 5, width: 90, height: 90 }
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height),
    width,
    height,
  )
}

async function rotateImage(imageUrl: string, degrees: number) {
  const image = new Image()
  image.src = imageUrl
  await image.decode()
  const sideways = Math.abs(degrees) % 180 === 90
  const canvas = document.createElement('canvas')
  canvas.width = sideways ? image.naturalHeight : image.naturalWidth
  canvas.height = sideways ? image.naturalWidth : image.naturalHeight
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Rotation is not supported.')
  context.translate(canvas.width / 2, canvas.height / 2)
  context.rotate((degrees * Math.PI) / 180)
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2)
  return new Promise<string>((resolve, reject) =>
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Could not rotate the image.'))
      resolve(URL.createObjectURL(blob))
    }, 'image/jpeg', 0.94),
  )
}

export function CropEditor({
  imageUrl,
  initialPreset = 'free',
  showPresets = false,
  onCancel,
  onComplete,
}: CropEditorProps) {
  const [sourceUrl, setSourceUrl] = useState(imageUrl)
  const [generatedUrl, setGeneratedUrl] = useState<string>()
  const [preset, setPreset] = useState<CropPreset>(initialPreset)
  const [crop, setCrop] = useState<Crop>()
  const [pixelCrop, setPixelCrop] = useState<PixelCrop>()
  const [zoom, setZoom] = useState(1)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const imageRef = useRef<HTMLImageElement>(null)
  const pinchDistance = useRef<number | undefined>(undefined)

  const aspect =
    preset === 'free' || preset === 'original'
      ? undefined
      : presetAspect[preset]

  const applyCropPreset = useCallback((nextPreset: CropPreset, image = imageRef.current) => {
    setPreset(nextPreset)
    if (!image) {
      setCrop(undefined)
      setPixelCrop(undefined)
      return
    }
    const nextAspect =
      nextPreset === 'original'
        ? image.naturalWidth / image.naturalHeight
        : nextPreset === 'free'
          ? undefined
          : presetAspect[nextPreset]
    const nextCrop = initialCrop(image.width, image.height, nextAspect)
    setCrop(nextCrop)
    setPixelCrop(convertToPixelCrop(nextCrop, image.width, image.height))
  }, [])

  useEffect(() => () => {
    if (generatedUrl) URL.revokeObjectURL(generatedUrl)
  }, [generatedUrl])

  useEffect(() => {
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [onCancel])

  const reset = useCallback(() => {
    setZoom(1)
    if (generatedUrl) URL.revokeObjectURL(generatedUrl)
    setGeneratedUrl(undefined)
    setSourceUrl(imageUrl)
    applyCropPreset(initialPreset)
  }, [applyCropPreset, generatedUrl, imageUrl, initialPreset])

  const rotate = async (degrees: number) => {
    setError('')
    try {
      const nextUrl = await rotateImage(sourceUrl, degrees)
      if (generatedUrl) URL.revokeObjectURL(generatedUrl)
      setGeneratedUrl(nextUrl)
      setSourceUrl(nextUrl)
      setCrop(undefined)
      setPixelCrop(undefined)
      setZoom(1)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not rotate image.')
    }
  }

  const finish = async () => {
    if (!imageRef.current || !crop) return
    const completedCrop =
      pixelCrop ?? convertToPixelCrop(crop, imageRef.current.width, imageRef.current.height)
    setSaving(true)
    setError('')
    try {
      onComplete(await cropImage(imageRef.current, completedCrop))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not crop image.')
      setSaving(false)
    }
  }

  return (
    <div className="crop-editor" role="dialog" aria-modal="true" aria-label="Crop photo">
      <header className="crop-editor-header">
        <button type="button" className="icon-button" onClick={onCancel} aria-label="Cancel cropping">
          <X size={24} />
        </button>
        <strong>Crop photo</strong>
        <button type="button" className="crop-done-button" onClick={finish} disabled={!crop || saving}>
          {saving ? 'Saving…' : 'Done'}
        </button>
      </header>

      <div
        className="crop-stage free-crop-stage"
        onTouchMove={(event) => {
          if (event.touches.length !== 2) return
          const [a, b] = Array.from(event.touches)
          const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY)
          if (pinchDistance.current) {
            setZoom((value) => Math.min(3, Math.max(1, value * (distance / pinchDistance.current!))))
          }
          pinchDistance.current = distance
        }}
        onTouchEnd={() => { pinchDistance.current = undefined }}
      >
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(completed) => setPixelCrop(completed)}
          {...(aspect ? { aspect } : {})}
          keepSelection
        >
          <img
            ref={imageRef}
            src={sourceUrl}
            alt="Crop preview"
            style={{ width: `${zoom * 100}%` }}
            onLoad={(event) => {
              const image = event.currentTarget
              applyCropPreset(preset, image)
            }}
          />
        </ReactCrop>
      </div>

      <footer className="crop-controls crop-controls-stacked">
        {showPresets && (
          <div className="crop-presets" aria-label="Crop shape">
            {(['free', 'original', 'square', 'portrait', 'landscape'] as CropPreset[]).map((item) => (
              <button
                type="button"
                key={item}
                className={preset === item ? 'selected' : ''}
                onClick={() => applyCropPreset(item)}
              >
                {item === 'square' ? '1:1' : item === 'portrait' ? '4:5' : item === 'landscape' ? 'Wide' : item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
        )}
        <div className="crop-toolbar">
          <button type="button" onClick={reset}><Undo2 size={19} />Reset</button>
          <button type="button" onClick={() => void rotate(-90)}><RotateCcw size={19} />Left</button>
          <input type="range" min={1} max={3} step={0.05} value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="Zoom image" />
          <button type="button" onClick={() => void rotate(90)}><RotateCw size={19} />Right</button>
        </div>
        {error && <p className="crop-error" role="alert">{error}</p>}
      </footer>
    </div>
  )
}
