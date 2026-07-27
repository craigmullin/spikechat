export interface Person {
  id: string
  name: string
  handle?: string
  instagramHandle?: string
  instagramDisplayName?: string
  instagramPhotoUrl?: string
  instagramVerified?: boolean
  redditUsername?: string
  redditPhotoUrl?: string
  redditDefaultCommunity?: string
  photoUrl?: string
  status?: string
  pronouns?: string
  bio?: string
  isVerified?: boolean
  accentColor?: string
  archivedAt?: number
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
  reaction?: string
  deliveryStatus?: 'sent' | 'delivered' | 'read'
  createdAt: number
}
