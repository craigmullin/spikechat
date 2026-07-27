import { describe, expect, it } from 'vitest'
import { formatComments, parseComments } from './fictionalComments'

describe('fictional comments', () => {
  it('parses roots and threaded replies', () => {
    const comments = parseComments('alex | Great post | 2h | 12\n> sam | Agreed | 1h | 3')
    expect(comments).toHaveLength(1)
    expect(comments[0].replies?.[0].author).toBe('sam')
    expect(formatComments(comments)).toContain('> sam | Agreed | 1h | 3')
  })
})
