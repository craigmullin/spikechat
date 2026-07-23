import type { Message, Person } from './types'

const PEOPLE_KEY = 'spikechat.people'
const MESSAGES_KEY = 'spikechat.messages'

export function loadPeople(): Person[] {
  try {
    const saved = localStorage.getItem(PEOPLE_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function savePeople(people: Person[]) {
  localStorage.setItem(PEOPLE_KEY, JSON.stringify(people))
}

export function loadMessages(): Message[] {
  try {
    const saved = localStorage.getItem(MESSAGES_KEY)
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export function saveMessages(messages: Message[]) {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
}