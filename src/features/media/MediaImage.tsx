import { ImageOff } from 'lucide-react'
import { useEffect, useState } from 'react'
import { loadMedia } from '../../mediaDb'

interface MediaImageProps {
  mediaId?: string
  fallbackUrl?: string
  alt: string
  className?: string
}

export function MediaImage({ mediaId, fallbackUrl, alt, className }: MediaImageProps) {
  const [url, setUrl] = useState<string>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    let objectUrl: string | undefined
    setUrl(undefined)
    setFailed(false)
    if (!mediaId) {
      setUrl(fallbackUrl)
      return
    }

    void loadMedia(mediaId).then((blob) => {
      if (!active) return
      if (!blob) {
        setUrl(fallbackUrl)
        setFailed(!fallbackUrl)
        return
      }
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fallbackUrl, mediaId])

  if (failed) return (
    <div className={`media-placeholder media-error ${className ?? ''}`} role="img" aria-label={`${alt} unavailable`}>
      <ImageOff size={22} />
      <span>Image unavailable</span>
    </div>
  )
  if (!url) return <div className={`media-placeholder media-loading ${className ?? ''}`} aria-label={`Loading ${alt}`} />
  return <img className={className} src={url} alt={alt} draggable={false} onError={() => setFailed(true)} />
}
