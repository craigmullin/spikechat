import type { PixelCrop } from 'react-image-crop'
import { containedSize } from './imageProcessing'

export async function cropImage(
  image: HTMLImageElement,
  crop: PixelCrop,
): Promise<Blob> {
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const canvas = document.createElement('canvas')
  const outputSize = containedSize(
    Math.max(1, Math.round(crop.width * scaleX)),
    Math.max(1, Math.round(crop.height * scaleY)),
    2048,
  )
  canvas.width = outputSize.width
  canvas.height = outputSize.height

  const context = canvas.getContext('2d')
  if (!context) throw new Error('Image cropping is not supported.')

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) =>
        blob ? resolve(blob) : reject(new Error('Could not crop the image.')),
      'image/jpeg',
      0.92,
    )
  })
}
