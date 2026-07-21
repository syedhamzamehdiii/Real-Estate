/** Read an image file as a compressed JPEG data URL for local storage. */
export async function fileToDataUrl(
  file: File,
  options: { maxEdge?: number; quality?: number } = {},
): Promise<string> {
  const maxEdge = options.maxEdge ?? 1600
  const quality = options.quality ?? 0.82

  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file')
  }

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('Could not process image')
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  return canvas.toDataURL('image/jpeg', quality)
}

export async function filesToDataUrls(files: FileList | File[]): Promise<string[]> {
  const list = Array.from(files)
  const urls: string[] = []
  for (const file of list) {
    urls.push(await fileToDataUrl(file))
  }
  return urls
}
