import { Copy, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { ChatHeader } from '../components/ChatHeader'
import { ChatInput } from '../components/ChatInput'
import { MessageBubble } from '../components/MessageBubble'
import { deleteMedia, saveMedia } from '../mediaDb'
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

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  if (!person || !personId) {
    return <Navigate to="/" replace />
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
) => {
  const messageId = crypto.randomUUID()
  const mediaId = crypto.randomUUID()

  await saveMedia(mediaId, file)

  const newMessage: Message = {
    id: messageId,
    personId,
    direction,
    type: 'image',
    mediaId,
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

  const handleDuplicate = () => {
    if (!selectedMessage) {
      return
    }

    const duplicate: Message = {
      ...selectedMessage,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }

    setMessages((current) => [...current, duplicate])

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
            {conversationMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onClick={openMessageOptions}
              />
            ))}
          </div>
        </section>

        <ChatInput
            onSendTextMessage={handleSendTextMessage}
            onSendImageMessage={handleSendImageMessage}
        />
      </main>

      {selectedMessage && selectedMessage.type === 'text' && (
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
    </div>
  )
}