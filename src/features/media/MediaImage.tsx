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

  useEffect(() => {
    let active = true
    let objectUrl: string | undefined
    setUrl(undefined)
    if (!mediaId) {
      setUrl(fallbackUrl)
      return
    }

    void loadMedia(mediaId).then((blob) => {
      if (!active) return
      if (!blob) {
        setUrl(fallbackUrl)
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

  if (!url) return <div className={`media-placeholder ${className ?? ''}`} aria-label={`${alt} unavailable`} />
  return <img className={className} src={url} alt={alt} draggable={false} />
}
