import { Copy, Crop, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ChatHeader } from '../components/ChatHeader'
import { ChatInput } from '../components/ChatInput'
import { MessageBubble } from '../components/MessageBubble'
import { CropEditor } from '../features/media/CropEditor'
import { optimizeImage } from '../features/media/imageProcessing'
import { deleteMedia, loadMedia, saveMedia } from '../mediaDb'
import {
  loadMessages,
  loadPeople,
  saveMessages,
} from '../storage'
import type {
  Message,
  MessageDirection,
} from '../types'

export function ChatPage() {
  const { personId } = useParams()

  const person = useMemo(
    () => loadPeople().find((item) => item.id === personId),
    [personId],
  )

  const [messages, setMessages] = useState<Message[]>(loadMessages)
  const [selectedMessage, setSelectedMessage] =
    useState<Message | null>(null)

  const [editingText, setEditingText] = useState('')
  const [imageEditUrl, setImageEditUrl] = useState<string | null>(null)
  const replaceImageInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  if (!person || !personId) {
    return <Navigate to="/people" replace />
  }

  const conversationMessages = messages
    .filter((message) => message.personId === personId)
    .sort((a, b) => a.createdAt - b.createdAt)

  const handleSendTextMessage = (
  text: string,
  direction: MessageDirection,
) => {
  const newMessage: Message = {
    id: crypto.randomUUID(),
    personId,
    direction,
    type: 'text',
    text,
    deliveryStatus: direction === 'sent' ? 'read' : undefined,
    createdAt: Date.now(),
  }

  setMessages((current) => [
    ...current,
    newMessage,
  ])
}

const handleSendImageMessage = async (
  file: File,
  direction: MessageDirection,
  caption?: string,
) => {
  const messageId = crypto.randomUUID()
  const mediaId = crypto.randomUUID()

  await saveMedia(mediaId, await optimizeImage(file))

  const newMessage: Message = {
    id: messageId,
    personId,
    direction,
    type: 'image',
    mediaId,
    text: caption,
    deliveryStatus: direction === 'sent' ? 'read' : undefined,
    createdAt: Date.now(),
  }

  setMessages((current) => [
    ...current,
    newMessage,
  ])
}

  const openMessageOptions = (message: Message) => {
    setSelectedMessage(message)
    setEditingText(message.text ?? '')
  }

  const closeMessageOptions = () => {
    if (imageEditUrl) URL.revokeObjectURL(imageEditUrl)
    setImageEditUrl(null)
    setSelectedMessage(null)
    setEditingText('')
  }

  const handleSaveEdit = () => {
    if (!selectedMessage || !editingText.trim()) {
      return
    }

    setMessages((current) =>
      current.map((message) =>
        message.id === selectedMessage.id
          ? {
              ...message,
              text: editingText.trim(),
            }
          : message,
      ),
    )

    closeMessageOptions()
  }

  const handleDelete = async () => {
    if (!selectedMessage) {
        return
    }

    if (
        selectedMessage.type === 'image' &&
        selectedMessage.mediaId
    ) {
        await deleteMedia(selectedMessage.mediaId)
    }

    setMessages((current) =>
        current.filter(
        (message) =>
            message.id !== selectedMessage.id,
        ),
    )

    closeMessageOptions()
    }

  const handleDuplicate = async () => {
    if (!selectedMessage) {
      return
    }

    let mediaId = selectedMessage.mediaId
    if (selectedMessage.type === 'image' && selectedMessage.mediaId) {
      const blob = await loadMedia(selectedMessage.mediaId)
      if (!blob) return

      mediaId = crypto.randomUUID()
      await saveMedia(mediaId, blob)
    }

    const duplicate: Message = {
      ...selectedMessage,
      id: crypto.randomUUID(),
      mediaId,
      createdAt: Date.now(),
    }

    setMessages((current) => [...current, duplicate])

    closeMessageOptions()
  }

  const setReaction = (reaction?: string) => {
    if (!selectedMessage) return
    setMessages((current) => current.map((message) =>
      message.id === selectedMessage.id ? { ...message, reaction } : message,
    ))
    closeMessageOptions()
  }

  const beginImageEdit = async (file?: File) => {
    if (!selectedMessage?.mediaId) return

    const blob = file ?? (await loadMedia(selectedMessage.mediaId))
    if (!blob) return

    if (imageEditUrl) URL.revokeObjectURL(imageEditUrl)
    setImageEditUrl(URL.createObjectURL(blob))
  }

  const finishImageEdit = async (blob: Blob) => {
    if (!selectedMessage?.mediaId) return

    const previousMediaId = selectedMessage.mediaId
    const nextMediaId = crypto.randomUUID()

    await saveMedia(nextMediaId, await optimizeImage(blob))
    setMessages((current) =>
      current.map((message) =>
        message.id === selectedMessage.id
          ? { ...message, mediaId: nextMediaId }
          : message,
      ),
    )
    await deleteMedia(previousMediaId)
    closeMessageOptions()
  }

  return (
    <div className="app-shell">
      <main className="chat-card">
        <ChatHeader person={person} />

        <section className="messages">
          {/* <div className="conversation-intro">
            <div className="avatar avatar-large">
              {person.photoUrl ? (
                <img src={person.photoUrl} alt={person.name} />
              ) : (
                <span>
                  {person.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <strong>{person.name}</strong>
            <span>{person.status || 'Active now'}</span>
          </div> */}

          <div className="message-list">
            {conversationMessages.map((message, index) => {
              const previous = conversationMessages[index - 1]
              const date = new Date(message.createdAt).toDateString()
              const showDate = !previous || new Date(previous.createdAt).toDateString() !== date
              return (
                <div key={message.id} className="message-with-date">
                  {showDate && <div className="chat-date-separator">{new Intl.DateTimeFormat([], { month: 'short', day: 'numeric', year: 'numeric' }).format(message.createdAt)}</div>}
                  <MessageBubble message={message} onClick={openMessageOptions} />
                </div>
              )
            })}
          </div>
        </section>

        <ChatInput
            onSendTextMessage={handleSendTextMessage}
            onSendImageMessage={handleSendImageMessage}
        />
      </main>

      {selectedMessage && (
        <div
          className="message-options-backdrop"
          onClick={closeMessageOptions}
        >
          <div
            className="message-options-sheet"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="message-options-header">
              <div>
                <span className="eyebrow">Message</span>
                <h2>Edit message</h2>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={closeMessageOptions}
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            {selectedMessage.type === 'text' ? (
              <>
            <textarea
              className="message-edit-textarea"
              value={editingText}
              onChange={(event) =>
                setEditingText(event.target.value)
              }
              autoFocus
            />

            <button
              type="button"
              className="primary-button full-width-button"
              onClick={handleSaveEdit}
              disabled={!editingText.trim()}
            >
              <Pencil size={18} />
              Save Changes
            </button>
              </>
            ) : (
              <>
                <input
                  ref={replaceImageInput}
                  className="hidden-file-input"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (file) void beginImageEdit(file)
                    event.target.value = ''
                  }}
                />
                <button
                  type="button"
                  className="primary-button full-width-button"
                  onClick={() => void beginImageEdit()}
                >
                  <Crop size={18} />
                  Crop Image
                </button>
                <button
                  type="button"
                  className="secondary-action-button"
                  onClick={() => replaceImageInput.current?.click()}
                >
                  <Crop size={18} />
                  Replace & Crop
                </button>
              </>
            )}

            {selectedMessage && selectedMessage.type === 'text' && (
            <button
                type="button"
                className="secondary-action-button"
                onClick={handleDuplicate}
            >
                <Copy size={18} />
                Duplicate Message
            </button>
            )}

            <div className="reaction-picker" aria-label="Message reaction">
              {['❤️', '😂', '👍', '😮', '😢', ''].map((reaction) => (
                <button key={reaction || 'remove'} type="button" onClick={() => setReaction(reaction || undefined)} aria-label={reaction ? `React ${reaction}` : 'Remove reaction'}>
                  {reaction || 'None'}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="danger-button full-width-button"
              onClick={handleDelete}
            >
              <Trash2 size={18} />
              Delete Message
            </button>
          </div>
        </div>
      )}

      {imageEditUrl && (
        <CropEditor
          imageUrl={imageEditUrl}
          onCancel={() => {
            URL.revokeObjectURL(imageEditUrl)
            setImageEditUrl(null)
          }}
          onComplete={(blob) => void finishImageEdit(blob)}
        />
      )}
    </div>
  )
}
