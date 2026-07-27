import type { Person } from '../../types'

export function instagramHandle(person: Person) {
  return person.instagramHandle || person.handle || slug(person.name)
}

export function redditUsername(person: Person) {
  return person.redditUsername || person.handle || slug(person.name)
}

export function instagramProfile(person: Person) {
  return {
    handle: instagramHandle(person),
    displayName: person.instagramDisplayName || person.name,
    photoUrl: person.instagramPhotoUrl || person.photoUrl,
    verified: person.instagramVerified ?? person.isVerified ?? false,
  }
}

export function redditProfile(person: Person) {
  return {
    username: redditUsername(person),
    photoUrl: person.redditPhotoUrl || person.photoUrl,
    defaultCommunity: person.redditDefaultCommunity,
  }
}

export function personInitials(person: Person) {
  return person.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}
