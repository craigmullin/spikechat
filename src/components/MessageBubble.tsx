import { useEffect, useRef, useState } from 'react'
import { loadMedia } from '../mediaDb'
import type { Message } from '../types'

interface MessageBubbleProps {
  message: Message
  onClick: (message: Message) => void
}

const LONG_PRESS_MS = 450

export function MessageBubble({
  message,
  onClick,
}: MessageBubbleProps) {
  const [imageUrl, setImageUrl] = useState<string>()

  const longPressTimer = useRef<number | null>(null)
  const longPressTriggered = useRef(false)

  useEffect(() => {
    if (message.type !== 'image' || !message.mediaId) {
      setImageUrl(undefined)
      return
    }

    let objectUrl: string | undefined
    let cancelled = false

    loadMedia(message.mediaId).then((blob) => {
      if (!blob || cancelled) {
        return
      }

      objectUrl = URL.createObjectURL(blob)
      setImageUrl(objectUrl)
    })

    return () => {
      cancelled = true

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [message.mediaId, message.type])

  const clearLongPressTimer = () => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }

  const handlePointerDown = () => {
    longPressTriggered.current = false

    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true
      onClick(message)

      if ('vibrate' in navigator) {
        navigator.vibrate(30)
      }
    }, LONG_PRESS_MS)
  }

  const handlePointerUp = () => {
    clearLongPressTimer()
  }

  const handlePointerCancel = () => {
    clearLongPressTimer()
  }

  const handleClick = () => {
    clearLongPressTimer()

    if (longPressTriggered.current) {
      longPressTriggered.current = false
      return
    }

    onClick(message)
  }

  return (
    <button
      type="button"
      className={`message-row ${message.direction}`}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
      onContextMenu={(event) => {
        event.preventDefault()
        clearLongPressTimer()
        onClick(message)
      }}
      aria-label="Open message options"
    >
      {message.type === 'image' ? (
        <div className="image-message">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Chat attachment"
              draggable={false}
              onDragStart={(event) => event.preventDefault()}
            />
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
