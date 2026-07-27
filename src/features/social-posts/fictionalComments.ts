import type { FictionalComment } from './types'

// One comment per line: author | text | age | likes/votes. Prefix a reply with ">".
export function parseComments(value: string): FictionalComment[] {
  const roots: FictionalComment[] = []
  let parent: FictionalComment | undefined

  value.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim()
    if (!line) return
    const isReply = line.startsWith('>')
    const parts = (isReply ? line.slice(1) : line).split('|').map((part) => part.trim())
    const comment: FictionalComment = {
      id: `comment-${index}-${parts[0] || 'anonymous'}`,
      author: parts[0] || 'anonymous',
      text: parts[1] || '',
      ageLabel: parts[2] || undefined,
      likeCount: parts[3] || undefined,
      replies: [],
    }
    if (isReply && parent) parent.replies?.push(comment)
    else {
      roots.push(comment)
      parent = comment
    }
  })
  return roots
}

export function formatComments(comments: FictionalComment[] = []): string {
  return comments.flatMap((comment) => [
    formatLine(comment),
    ...(comment.replies ?? []).map((reply) => `> ${formatLine(reply)}`),
  ]).join('\n')
}

function formatLine(comment: FictionalComment) {
  return [comment.author, comment.text, comment.ageLabel ?? '', comment.likeCount ?? '']
    .join(' | ')
    .replace(/\s+\|\s+$/, '')
}
