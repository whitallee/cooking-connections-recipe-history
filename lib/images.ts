import sharp from 'sharp'

/**
 * Normalise an uploaded image file:
 *  - Converts HEIC/HEIF to JPEG
 *  - Resizes so the longest edge is at most `maxPx` (never upscales)
 *  - Compresses to JPEG at the given quality
 */
export async function normaliseImage(
  file: File,
  { maxPx = 1600, quality = 85 }: { maxPx?: number; quality?: number } = {}
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    ext === 'heic' ||
    ext === 'heif'

  let inputBuffer: Buffer

  if (isHeic) {
    const { default: convert } = await import('heic-convert')
    const converted = await convert({
      buffer: await file.arrayBuffer(),
      format: 'JPEG',
      quality: 0.9,
    })
    inputBuffer = Buffer.from(converted)
  } else {
    inputBuffer = Buffer.from(await file.arrayBuffer())
  }

  const optimised = await sharp(inputBuffer)
    .resize(maxPx, maxPx, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality })
    .toBuffer()

  return { buffer: optimised, contentType: 'image/jpeg', ext: 'jpg' }
}
