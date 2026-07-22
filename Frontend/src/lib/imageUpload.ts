/** Shared image prep for admin uploads: originals stay high-quality; thumbs are cropped. */

export type PreparedImage = {
  /** Full-resolution (or lightly compressed) original for detail / lightbox. */
  original: string
  /** Cropped frame for cards and admin thumbs. */
  thumbnail: string
}

export type PixelCrop = {
  x: number
  y: number
  width: number
  height: number
}

const ORIGINAL_MAX_EDGE = 4000
const ORIGINAL_QUALITY = 0.92
const THUMB_MAX_EDGE = 1400
const THUMB_QUALITY = 0.88

function assertImageFile(file: File) {
  if (file.type && !file.type.startsWith('image/')) {
    throw new Error('Please choose an image file')
  }
}

async function loadBitmap(source: File | string): Promise<ImageBitmap> {
  if (typeof source === 'string') {
    const res = await fetch(source)
    const blob = await res.blob()
    return createImageBitmap(blob)
  }
  return createImageBitmap(source)
}

async function bitmapToJpegDataUrl(
  bitmap: ImageBitmap,
  options: { maxEdge: number; quality: number; sx?: number; sy?: number; sw?: number; sh?: number },
): Promise<string> {
  const sx = options.sx ?? 0
  const sy = options.sy ?? 0
  const sw = options.sw ?? bitmap.width
  const sh = options.sh ?? bitmap.height
  const scale = Math.min(1, options.maxEdge / Math.max(sw, sh))
  const width = Math.max(1, Math.round(sw * scale))
  const height = Math.max(1, Math.round(sh * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('Could not process image')
  }
  ctx.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', options.quality)
}

/** High-quality original for detail pages (minimal downscale). */
export async function fileToOriginalDataUrl(file: File): Promise<string> {
  assertImageFile(file)
  const bitmap = await loadBitmap(file)
  try {
    return await bitmapToJpegDataUrl(bitmap, {
      maxEdge: ORIGINAL_MAX_EDGE,
      quality: ORIGINAL_QUALITY,
    })
  } finally {
    bitmap.close()
  }
}

/** Legacy helper — prefer fileToOriginalDataUrl + crop for new flows. */
export async function fileToDataUrl(
  file: File,
  options: { maxEdge?: number; quality?: number } = {},
): Promise<string> {
  assertImageFile(file)
  const bitmap = await loadBitmap(file)
  try {
    return await bitmapToJpegDataUrl(bitmap, {
      maxEdge: options.maxEdge ?? 1600,
      quality: options.quality ?? 0.82,
    })
  } finally {
    bitmap.close()
  }
}

export async function filesToDataUrls(files: FileList | File[]): Promise<string[]> {
  const list = Array.from(files)
  const urls: string[] = []
  for (const file of list) {
    urls.push(await fileToDataUrl(file))
  }
  return urls
}

/** Read a local file as an object URL for the crop editor (revoked by caller). */
export function fileToObjectUrl(file: File): string {
  assertImageFile(file)
  return URL.createObjectURL(file)
}

/**
 * Build cropped JPEG data URL from an image source + pixel crop
 * (from react-easy-crop `croppedAreaPixels`).
 */
export async function cropImageToDataUrl(
  source: string,
  crop: PixelCrop,
  options: { maxEdge?: number; quality?: number } = {},
): Promise<string> {
  if (crop.width < 1 || crop.height < 1) {
    throw new Error('Could not crop image — try adjusting the frame')
  }
  const bitmap = await loadBitmap(source)
  try {
    return await bitmapToJpegDataUrl(bitmap, {
      maxEdge: options.maxEdge ?? THUMB_MAX_EDGE,
      quality: options.quality ?? THUMB_QUALITY,
      sx: Math.round(crop.x),
      sy: Math.round(crop.y),
      sw: Math.round(crop.width),
      sh: Math.round(crop.height),
    })
  } finally {
    bitmap.close()
  }
}

/** Prepare both original + cropped thumbnail from a selected file. */
export async function prepareImagePair(
  file: File,
  crop: PixelCrop,
  objectUrl?: string,
): Promise<PreparedImage> {
  const previewUrl = objectUrl ?? fileToObjectUrl(file)
  try {
    const [original, thumbnail] = await Promise.all([
      fileToOriginalDataUrl(file),
      cropImageToDataUrl(previewUrl, crop),
    ])
    return { original, thumbnail }
  } finally {
    if (!objectUrl) URL.revokeObjectURL(previewUrl)
  }
}

/** Card / table image: prefer cropped thumbnail when present. */
export function cardImageSrc(item: { image: string; thumbnail?: string }): string {
  return item.thumbnail?.trim() || item.image
}
