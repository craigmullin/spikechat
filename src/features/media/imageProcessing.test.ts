import { describe, expect, it } from 'vitest'
import { containedSize, validateImage } from './imageProcessing'

describe('image processing', () => {
  it('contains landscape and portrait images without enlarging', () => {
    expect(containedSize(6000, 4000, 2048)).toEqual({ width: 2048, height: 1365 })
    expect(containedSize(3000, 6000, 2048)).toEqual({ width: 1024, height: 2048 })
    expect(containedSize(400, 300, 2048)).toEqual({ width: 400, height: 300 })
  })

  it('rejects invalid sources', () => {
    expect(() => validateImage(new Blob(['x'], { type: 'text/plain' }))).toThrow('image file')
    expect(() => validateImage(
      new Blob([new Uint8Array(40 * 1024 * 1024 + 1)], { type: 'image/jpeg' }),
    )).toThrow('over 40 MB')
  })
})
