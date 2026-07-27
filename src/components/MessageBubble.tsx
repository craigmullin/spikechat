import { useRef } from 'react'
import { MediaImage } from '../features/media/MediaImage'
import type { Message } from '../types'

interface MessageBubbleProps {
  message: Message
  onClick: (message: Message) => void
}

const LONG_PRESS_MS = 450

export function MessageBubble({ message, onClick }: MessageBubbleProps) {
  const longPressTimer = useRef<number | null>(null)
  const longPressTriggered = useRef(false)
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
      if ('vibrate' in navigator) navigator.vibrate(30)
    }, LONG_PRESS_MS)
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
      onPointerUp={clearLongPressTimer}
      onPointerCancel={clearLongPressTimer}
      onPointerLeave={clearLongPressTimer}
      onContextMenu={(event) => {
        event.preventDefault()
        clearLongPressTimer()
        onClick(message)
      }}
      aria-label="Open message options"
    >
      {message.type === 'image' ? (
        <div className="image-message">
          <MediaImage mediaId={message.mediaId} alt="Chat attachment" />
        </div>
      ) : (
        <div className="message-bubble">{message.text}</div>
      )}
    </button>
  )
}
