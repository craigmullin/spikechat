import { Image, Send, X } from 'lucide-react'
import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { MessageDirection } from '../types'
import { CropEditor } from '../features/media/CropEditor'
import { imageProcessingError, validateImage } from '../features/media/imageProcessing'

interface ChatInputProps {
  onSendTextMessage: (
    text: string,
    direction: MessageDirection,
  ) => void

  onSendImageMessage: (
    file: File,
    direction: MessageDirection,
    caption?: string,
  ) => Promise<void>
}

export function ChatInput({
  onSendTextMessage,
  onSendImageMessage,
}: ChatInputProps) {
  const [text, setText] = useState('')
  const [pendingImage, setPendingImage] = useState<{
    file: File
    previewUrl: string
  } | null>(null)
  const [cropSource, setCropSource] = useState<{
    file: File
    url: string
  } | null>(null)
  const [imageError, setImageError] = useState('')
  const [sendingImage, setSendingImage] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]

    if (!file) return
    try {
      validateImage(file)
      setImageError('')
      setCropSource({ file, url: URL.createObjectURL(file) })
    } catch (error) {
      setImageError(imageProcessingError(error))
    }

    event.target.value = ''
  }

  const cancelCrop = () => {
    if (cropSource) URL.revokeObjectURL(cropSource.url)
    setCropSource(null)
  }

  const completeCrop = (blob: Blob) => {
    if (!cropSource) return

    if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl)

    const croppedFile = new File(
      [blob],
      cropSource.file.name.replace(/\.[^.]+$/, '') + '-cropped.jpg',
      { type: blob.type },
    )

    URL.revokeObjectURL(cropSource.url)
    setCropSource(null)
    setPendingImage({
      file: croppedFile,
      previewUrl: URL.createObjectURL(croppedFile),
    })
  }

  const clearPendingImage = () => {
    if (pendingImage) {
      URL.revokeObjectURL(pendingImage.previewUrl)
    }

    setPendingImage(null)
  }

  const submit = async (direction: MessageDirection) => {
    if (pendingImage) {
      try {
        setSendingImage(true)
        await onSendImageMessage(pendingImage.file, direction, text.trim() || undefined)
        clearPendingImage()
        setText('')
        setImageError('')
      } catch (error) {
        setImageError(imageProcessingError(error))
      } finally {
        setSendingImage(false)
      }
      return
    }

    const trimmedText = text.trim()

    if (!trimmedText) {
      return
    }

    onSendTextMessage(trimmedText, direction)
    setText('')
  }

  const hasContent =
    text.trim().length > 0 || pendingImage !== null

  return (
    <div className="composer-wrapper">
      {cropSource && (
        <CropEditor
          imageUrl={cropSource.url}
          onCancel={cancelCrop}
          onComplete={completeCrop}
        />
      )}
      {pendingImage && (
        <div className="composer-image-preview">
          <img
            src={pendingImage.previewUrl}
            alt="Selected attachment"
          />

          <button
            type="button"
            className="remove-preview-button"
            onClick={clearPendingImage}
            aria-label="Remove selected image"
          >
            <X size={16} />
          </button>
        </div>
      )}
      {imageError && <p className="form-error composer-error" role="alert">{imageError}</p>}

      <div className="chat-input-area">
        {/* <button
          type="button"
          className="composer-action-button"
          aria-label="More options"
        >
          <Plus size={25} />
        </button> */}

        <button
          type="button"
          className="composer-action-button"
          aria-label="Add image"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={23} />
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
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                void submit('sent')
              }
            }}
            placeholder={
              pendingImage ? 'Add an optional caption' : 'Message'
            }
            aria-label="Message"
          />

          {/* <button
            type="button"
            className="emoji-button"
            aria-label="Choose emoji"
          >
            <Smile size={23} />
          </button> */}
        </div>

        <div
          className={`split-send-button ${
            hasContent ? '' : 'disabled'
          }`}
        >
          <button
            type="button"
            className="split-send-half receive-half"
            onClick={() => void submit('received')}
            disabled={!hasContent || sendingImage}
            aria-label="Add as received message"
            title="Receive"
          >
            <Send size={20} />
          </button>

          <div className="split-send-divider" />

          <button
            type="button"
            className="split-send-half send-half"
            onClick={() => void submit('sent')}
            disabled={!hasContent || sendingImage}
            aria-label="Add as sent message"
            title="Send"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}
