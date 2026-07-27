import { toBlob } from 'html-to-image'

function waitForImages(element: HTMLElement) {
  const images = [...element.querySelectorAll('img')]
  return Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve()
      return new Promise<void>((resolve) => {
        image.addEventListener('load', () => resolve(), { once: true })
        image.addEventListener('error', () => resolve(), { once: true })
      })
    }),
  )
}

export async function capturePng(element: HTMLElement): Promise<Blob> {
  await document.fonts.ready
  await waitForImages(element)
  const blob = await toBlob(element, {
    cacheBust: true,
    pixelRatio: Math.min(3, Math.max(2, window.devicePixelRatio || 1)),
    backgroundColor: '#000000',
  })
  if (!blob) throw new Error('The PNG could not be created.')
  return blob
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function shareOrDownload(blob: Blob, filename: string) {
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.share && (!navigator.canShare || navigator.canShare({ files: [file] }))) {
    await navigator.share({ files: [file], title: 'Created with SpikeChat' })
    return
  }
  downloadBlob(blob, filename)
}
