import { useEffect, useState } from 'react'
import { loadMedia } from '../../mediaDb'

interface MediaImageProps {
  mediaId?: string
  alt: string
  className?: string
}

export function MediaImage({ mediaId, alt, className }: MediaImageProps) {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    let active = true
    let objectUrl: string | undefined
    setUrl(undefined)
    if (!mediaId) return

    void loadMedia(mediaId).then((blob) => {
      if (!blob || !active) return
      objectUrl = URL.createObjectURL(blob)
      setUrl(objectUrl)
    })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [mediaId])

  if (!url) return <div className={`media-placeholder ${className ?? ''}`} aria-label={`${alt} unavailable`} />
  return <img className={className} src={url} alt={alt} draggable={false} />
}
