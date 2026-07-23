import { Image, Plus, Send, Smile } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { MessageDirection } from '../types'

interface ChatInputProps {
  onSendTextMessage: (
    text: string,
    direction: MessageDirection,
  ) => void

  onSendImageMessage: (
    file: File,
    direction: MessageDirection,
  ) => void
}

type PendingContent =
  | {
      type: 'text'
      text: string
    }
  | {
      type: 'image'
      file: File
      previewUrl: string
    }

export function ChatInput({
  onSendTextMessage,
  onSendImageMessage,
}: ChatInputProps) {
  const [text, setText] = useState('')
  const [pendingContent, setPendingContent] =
    useState<PendingContent | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTextSubmit = () => {
    const trimmedText = text.trim()

    if (!trimmedText) {
      return
    }

    setPendingContent({
      type: 'text',
      text: trimmedText,
    })
  }

  const handleImageSelect = (
    event: ChangeEvent<HTMLInputElement>,
    ) => {
    const file = event.target.files?.[0]

    if (!file || !file.type.startsWith('image/')) {
        return
    }

    const previewUrl = URL.createObjectURL(file)

    setPendingContent({
        type: 'image',
        file,
        previewUrl,
    })

    event.target.value = ''
  }

  const chooseDirection = (
    direction: MessageDirection,
  ) => {
    if (!pendingContent) {
      return
    }

    if (pendingContent.type === 'text') {
      onSendTextMessage(
        pendingContent.text,
        direction,
      )

      setText('')
    }

    if (pendingContent.type === 'image') {
        onSendImageMessage(
            pendingContent.file,
            direction,
        )

        URL.revokeObjectURL(
            pendingContent.previewUrl,
        )
    }

    setPendingContent(null)
  }

  return (
    <>
      {pendingContent && (
        <div className="chooser-backdrop">
          <div className="direction-sheet">
            <div className="direction-sheet-handle" />

            <h2>Add message</h2>

            {pendingContent.type === 'image' && (
              <div className="pending-image-preview">
                <img
                  src={pendingContent.previewUrl}
                  alt="Selected attachment preview"
                />
              </div>
            )}

            <p>
              Choose which side should send this message.
            </p>

            <div className="direction-options">
              <button
                className="direction-button received-option"
                onClick={() =>
                  chooseDirection('received')
                }
              >
                Receive
              </button>

              <button
                className="direction-button sent-option"
                onClick={() =>
                  chooseDirection('sent')
                }
              >
                Send
              </button>
            </div>

            <button
              className="cancel-button"
              onClick={() => {
            if (pendingContent.type === 'image') {
                URL.revokeObjectURL(
                pendingContent.previewUrl,
                )
            }

            setPendingContent(null)
            }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="chat-input-area">
        <button
          className="icon-button composer-icon"
          aria-label="More options"
        >
          <Plus size={22} />
        </button>

        <button
          className="icon-button composer-icon"
          aria-label="Add image"
          onClick={() =>
            fileInputRef.current?.click()
          }
        >
          <Image size={22} />
        </button>

        <input
          ref={fileInputRef}
          className="hidden-file-input"
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
        />

        <div className="composer-field">
          <input
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleTextSubmit()
              }
            }}
            placeholder="Aa"
            aria-label="Message"
          />

          <button
            className="emoji-button"
            aria-label="Choose emoji"
          >
            <Smile size={21} />
          </button>
        </div>

        <button
          className="send-button"
          onClick={handleTextSubmit}
          disabled={!text.trim()}
          aria-label="Add message"
        >
          <Send size={21} />
        </button>
      </div>
    </>
  )
}