import { useEffect, useState } from 'react'
import { loadMedia } from '../mediaDb'
import type { Message } from '../types'

interface MessageBubbleProps {
  message: Message
  onClick: (message: Message) => void
}

export function MessageBubble({
  message,
  onClick,
}: MessageBubbleProps) {
  const [imageUrl, setImageUrl] = useState<string>()

  useEffect(() => {
    if (message.type !== 'image' || !message.mediaId) {
      return
    }

    let objectUrl: string | undefined

    loadMedia(message.mediaId).then((blob) => {
      if (!blob) {
        return
      }

      objectUrl = URL.createObjectURL(blob)
      setImageUrl(objectUrl)
    })

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [message.mediaId, message.type])

  return (
    <button
      type="button"
      className={`message-row ${message.direction}`}
      onClick={() => onClick(message)}
      aria-label="Message options"
    >
      {message.type === 'image' ? (
        <div className="image-message">
          {imageUrl ? (
            <img src={imageUrl} alt="Chat attachment" />
          ) : (
            <div className="image-loading">
              Loading image…
            </div>
          )}
        </div>
      ) : (
        <div className="message-bubble">
          {message.text}
        </div>
      )}
    </button>
  )
}