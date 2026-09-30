/** Resizes + re-encodes an image client-side before it's uploaded for OCR.
 * A phone camera photo is often 3-10MB at very high resolution -- far more
 * than OCR needs to read printed text, and slow enough to upload (especially
 * on a slow mobile connection) that it never finishes within the platform's
 * gateway timeout (502/504), sometimes before the request even reaches the
 * backend's own logs. Downscaling and re-encoding as JPEG, retrying at a
 * lower quality/size until under TARGET_BYTES, keeps text legible while
 * keeping the upload small regardless of the original photo/connection. */
const TARGET_BYTES = 600 * 1024
const ATTEMPTS: { maxDimension: number; quality: number }[] = [
  { maxDimension: 1600, quality: 0.8 },
  { maxDimension: 1400, quality: 0.7 },
  { maxDimension: 1100, quality: 0.6 },
  { maxDimension: 900, quality: 0.5 },
]

function drawToBlob(bitmap: ImageBitmap, maxDimension: number, quality: number): Promise<Blob | null> {
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.resolve(null)
  ctx.drawImage(bitmap, 0, 0, width, height)

  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
}

export async function compressImageForOcr(file: File): Promise<File> {
  // Not a raster image we can draw to canvas (e.g. HEIC on some browsers,
  // or already small) -- upload as-is rather than risk mangling it.
  if (!file.type.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file).catch(() => null)
  if (!bitmap) return file

  let best: Blob | null = null
  for (const { maxDimension, quality } of ATTEMPTS) {
    const blob = await drawToBlob(bitmap, maxDimension, quality)
    if (!blob) continue
    if (!best || blob.size < best.size) best = blob
    if (blob.size <= TARGET_BYTES) break
  }

  if (!best || best.size >= file.size) return file

  const name = file.name.replace(/\.\w+$/, '') + '.jpg'
  return new File([best], name, { type: 'image/jpeg' })
}
