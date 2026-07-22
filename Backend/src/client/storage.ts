import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type UploadMetadata,
} from 'firebase/storage'
import { storagePaths } from '../config/constants'
import { randomFileId } from '../utils/ids'
import { getFirebaseAuth, getFirebaseStorage } from './firebase'

const JPEG_META: UploadMetadata = {
  contentType: 'image/jpeg',
  cacheControl: 'public,max-age=31536000,immutable',
}

/** Ensure Auth token is attached before Storage writes. */
async function ensureStorageAuth(): Promise<void> {
  const user = getFirebaseAuth().currentUser
  if (!user) {
    throw new Error('You must be signed in to upload images. Please log in again.')
  }
  await user.getIdToken(true)
}

function asJpegBlob(data: Blob | ArrayBuffer | Uint8Array): Blob {
  if (data instanceof Blob) {
    if (data.type.startsWith('image/')) return data
    return new Blob([data], { type: 'image/jpeg' })
  }
  const part =
    data instanceof ArrayBuffer
      ? data
      : data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
  return new Blob([part as ArrayBuffer], { type: 'image/jpeg' })
}

async function uploadBlob(path: string, data: Blob | ArrayBuffer | Uint8Array): Promise<string> {
  await ensureStorageAuth()
  const storage = getFirebaseStorage()
  const objectRef = ref(storage, path)
  const blob = asJpegBlob(data)
  try {
    await uploadBytes(objectRef, blob, JPEG_META)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    if (/permission|unauthorized|insufficient/i.test(message)) {
      throw new Error(
        'Image upload was blocked by Storage permissions. Confirm you are logged in as admin and Storage rules are deployed.',
      )
    }
    throw err
  }
  return getDownloadURL(objectRef)
}

export async function uploadListingCover(
  listingId: string,
  data: Blob | ArrayBuffer | Uint8Array,
): Promise<string> {
  return uploadBlob(storagePaths.listingCover(listingId), data)
}

export async function uploadListingCoverThumb(
  listingId: string,
  data: Blob | ArrayBuffer | Uint8Array,
): Promise<string> {
  return uploadBlob(storagePaths.listingCoverThumb(listingId), data)
}

export async function uploadListingGalleryImage(
  listingId: string,
  data: Blob | ArrayBuffer | Uint8Array,
  fileName = `${randomFileId()}.jpg`,
): Promise<string> {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120)
  return uploadBlob(storagePaths.listingGallery(listingId, safe), data)
}

export async function uploadResourceCover(
  resourceId: string,
  data: Blob | ArrayBuffer | Uint8Array,
): Promise<string> {
  return uploadBlob(storagePaths.resourceCover(resourceId), data)
}

export async function uploadResourceCoverThumb(
  resourceId: string,
  data: Blob | ArrayBuffer | Uint8Array,
): Promise<string> {
  return uploadBlob(storagePaths.resourceCoverThumb(resourceId), data)
}

export async function uploadImageSource(
  pathBuilder: () => string,
  source: string | Blob,
): Promise<string> {
  const blob = await toBlob(source)
  return uploadBlob(pathBuilder(), blob)
}

export async function deleteStoragePath(path: string): Promise<void> {
  try {
    await deleteObject(ref(getFirebaseStorage(), path))
  } catch {
    // Missing objects are fine during cleanup
  }
}

export async function deleteListingMedia(listingId: string, galleryFileNames: string[] = []) {
  await deleteStoragePath(storagePaths.listingCover(listingId))
  await deleteStoragePath(storagePaths.listingCoverThumb(listingId))
  await Promise.all(
    galleryFileNames.map((name) =>
      deleteStoragePath(storagePaths.listingGallery(listingId, name)),
    ),
  )
}

export async function deleteResourceMedia(resourceId: string) {
  await deleteStoragePath(storagePaths.resourceCover(resourceId))
  await deleteStoragePath(storagePaths.resourceCoverThumb(resourceId))
}

async function toBlob(source: string | Blob): Promise<Blob> {
  if (typeof source !== 'string') return asJpegBlob(source)
  if (source.startsWith('data:')) {
    const res = await fetch(source)
    return asJpegBlob(await res.blob())
  }
  const res = await fetch(source)
  if (!res.ok) throw new Error('Could not fetch image for upload')
  return asJpegBlob(await res.blob())
}

export function isDataUrl(value: string): boolean {
  return value.startsWith('data:')
}

async function persistUrl(value: string | undefined, upload: () => Promise<string>) {
  if (!value) return undefined
  if (isDataUrl(value)) return upload()
  return value
}

/**
 * Ensure listing cover + gallery are HTTPS Storage (or external) URLs.
 * Uploads both originals and cropped thumbnails when provided as data URLs.
 */
export async function persistListingImages(
  listingId: string,
  image: string,
  images: string[] = [],
  thumbnail?: string,
  imageThumbnails: string[] = [],
): Promise<{
  image: string
  thumbnail?: string
  images: string[]
  imageThumbnails?: string[]
}> {
  const cover = (await persistUrl(image, async () =>
    uploadListingCover(listingId, await toBlob(image)),
  )) as string

  const coverThumb = await persistUrl(thumbnail, async () =>
    uploadListingCoverThumb(listingId, await toBlob(thumbnail!)),
  )

  const gallery: string[] = []
  for (let i = 0; i < images.length; i++) {
    const src = images[i]
    const fileId = randomFileId()
    if (isDataUrl(src)) {
      gallery.push(
        await uploadListingGalleryImage(listingId, await toBlob(src), `${fileId}.jpg`),
      )
    } else {
      gallery.push(src)
    }
  }

  const galleryThumbs: string[] = []
  for (let i = 0; i < imageThumbnails.length; i++) {
    const src = imageThumbnails[i]
    const fileId = randomFileId()
    if (isDataUrl(src)) {
      galleryThumbs.push(
        await uploadListingGalleryImage(listingId, await toBlob(src), `${fileId}-thumb.jpg`),
      )
    } else {
      galleryThumbs.push(src)
    }
  }

  return {
    image: cover,
    thumbnail: coverThumb,
    images: gallery,
    imageThumbnails: galleryThumbs.length ? galleryThumbs : undefined,
  }
}

export async function persistResourceImage(
  resourceId: string,
  image: string,
  thumbnail?: string,
): Promise<{ image: string; thumbnail?: string }> {
  const cover = (await persistUrl(image, async () =>
    uploadResourceCover(resourceId, await toBlob(image)),
  )) as string

  const coverThumb = await persistUrl(thumbnail, async () =>
    uploadResourceCoverThumb(resourceId, await toBlob(thumbnail!)),
  )

  return { image: cover, thumbnail: coverThumb }
}
