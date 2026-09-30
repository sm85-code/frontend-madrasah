/** Resizes + re-encodes an image client-side before it's uploaded for OCR.
 * A phone camera photo is often 3-10MB at very high resolution -- far more
 * than OCR needs to read printed text, and slow enough to upload that it
 * can blow past the platform's gateway timeout (504) before the OCR
 * request even finishes. Downscaling to a max dimension and re-encoding as
 * JPEG keeps text legible while cutting upload time drastically. */
const MAX_DIMENSION = 1800
const JPEG_QUALITY = 0.82

export async function compressImageForOcr(file: File): Promise<File> {
  // Not a raster image we can draw to canvas (e.g. HEIC on some browsers,
  // or already small) -- upload as-is rather than risk mangling it.
  if (!file.type.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY))
  if (!blob || blob.size >= file.size) return file

  const name = file.name.replace(/\.\w+$/, '') + '.jpg'
  return new File([blob], name, { type: 'image/jpeg' })
}
