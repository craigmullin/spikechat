export type ImagePurpose = 'content' | 'avatar'

const MAX_SOURCE_BYTES = 40 * 1024 * 1024
const MAX_DIMENSION: Record<ImagePurpose, number> = { content: 2048, avatar: 512 }

export function imageProcessingError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : 'That image could not be processed. Try a JPEG, PNG, or WebP file.'
}

export function validateImage(blob: Blob): void {
  if (!blob.type.startsWith('image/')) throw new Error('Please choose an image file.')
  if (blob.size > MAX_SOURCE_BYTES) {
    throw new Error('That image is over 40 MB. Please choose a smaller file.')
  }
}

export function containedSize(width: number, height: number, maxDimension: number) {
  const scale = Math.min(1, maxDimension / Math.max(width, height))
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('This image format is not supported by your browser. Try JPEG, PNG, or WebP.'))
    }
    image.src = url
  })
}

export async function optimizeImage(blob: Blob, purpose: ImagePurpose = 'content'): Promise<Blob> {
  validateImage(blob)
  const image = await loadImage(blob)
  const size = containedSize(image.naturalWidth, image.naturalHeight, MAX_DIMENSION[purpose])
  const canvas = document.createElement('canvas')
  canvas.width = size.width
  canvas.height = size.height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Image processing is not supported in this browser.')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, 0, 0, size.width, size.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error('The image could not be compressed.')),
      'image/jpeg',
      purpose === 'avatar' ? 0.86 : 0.84,
    )
  })
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string'
      ? resolve(reader.result)
      : reject(new Error('Could not read that image.'))
    reader.onerror = () => reject(new Error('Could not read that image.'))
    reader.readAsDataURL(blob)
  })
}
