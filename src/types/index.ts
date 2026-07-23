export interface Person {
  id: string
  name: string
  photoUrl?: string
  status?: string
}

export type MessageDirection = 'sent' | 'received'
export type MessageType = 'text' | 'image'

export interface Message {
  id: string
  personId: string
  direction: MessageDirection
  type: MessageType
  text?: string
  mediaId?: string
  createdAt: number
}