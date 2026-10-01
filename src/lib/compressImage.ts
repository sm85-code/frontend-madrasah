/** Re-encodes an image client-side before it's uploaded for OCR. A phone
 * photo or scan is often 3-10MB -- over OCR.space's 1MB free-plan limit, and
 * slow enough to upload on a mobile connection to hit the platform's gateway
 * timeout (502/504). Keeps the original resolution and the highest JPEG
 * quality that still fits under TARGET_BYTES, so small table text stays
 * legible. */
// OCR.space's free plan rejects files over 1 MB, so this is a hard ceiling,
// not a quality target: stay just under it.
const TARGET_BYTES = 950 * 1024
// Start at the original resolution and high quality (sharp small print in a
// scanned KK table matters more than upload size), and only step down until
// the file fits under TARGET_BYTES. maxDimension: Infinity = never downscale.
const ATTEMPTS: { maxDimension: number; quality: number }[] = [
  { maxDimension: Infinity, quality: 0.92 },
  { maxDimension: Infinity, quality: 0.85 },
  { maxDimension: 3000, quality: 0.8 },
  { maxDimension: 2400, quality: 0.75 },
  { maxDimension: 1800, quality: 0.7 },
  { maxDimension: 1400, quality: 0.6 },
  { maxDimension: 1100, quality: 0.5 },
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
