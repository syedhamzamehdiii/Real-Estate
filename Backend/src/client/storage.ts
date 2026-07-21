import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
  type UploadMetadata,
} from 'firebase/storage'
import { storagePaths } from '../config/constants'
import { randomFileId } from '../utils/ids'
import { getFirebaseStorage } from './firebase'

const JPEG_META: UploadMetadata = {
  contentType: 'image/jpeg',
  cacheControl: 'public,max-age=31536000,immutable',
}

async function uploadBlob(path: string, data: Blob | ArrayBuffer | Uint8Array): Promise<string> {
  const storage = getFirebaseStorage()
  const objectRef = ref(storage, path)
  await uploadBytes(objectRef, data, JPEG_META)
  return getDownloadURL(objectRef)
}

/** Upload listing cover → returns public download URL. */
export async function uploadListingCover(
  listingId: string,
  data: Blob | ArrayBuffer | Uint8Array,
): Promise<string> {
  return uploadBlob(storagePaths.listingCover(listingId), data)
}

/** Upload one gallery image → returns public download URL. */
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

/**
 * Convert a browser File / Blob / data-URL string into bytes and upload.
 * Keeps admin forms free to preview with data URLs before persistence.
 */
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
  await Promise.all(
    galleryFileNames.map((name) =>
      deleteStoragePath(storagePaths.listingGallery(listingId, name)),
    ),
  )
}

export async function deleteResourceMedia(resourceId: string) {
  await deleteStoragePath(storagePaths.resourceCover(resourceId))
}

async function toBlob(source: string | Blob): Promise<Blob> {
  if (typeof source !== 'string') return source
  if (source.startsWith('data:')) {
    const res = await fetch(source)
    return res.blob()
  }
  // Remote HTTPS URL — re-host into Storage
  const res = await fetch(source)
  if (!res.ok) throw new Error('Could not fetch image for upload')
  return res.blob()
}

/** True when the string still needs uploading to Storage. */
export function isDataUrl(value: string): boolean {
  return value.startsWith('data:')
}

/**
 * Ensure listing cover + gallery are HTTPS Storage (or external) URLs.
 * Data URLs from the SPA image picker are uploaded under the listing id.
 */
export async function persistListingImages(
  listingId: string,
  image: string,
  images: string[] = [],
): Promise<{ image: string; images: string[] }> {
  let cover = image
  if (isDataUrl(cover)) {
    cover = await uploadListingCover(listingId, await toBlob(cover))
  }

  const gallery: string[] = []
  for (const src of images) {
    if (isDataUrl(src)) {
      gallery.push(await uploadListingGalleryImage(listingId, await toBlob(src)))
    } else {
      gallery.push(src)
    }
  }

  return { image: cover, images: gallery }
}

export async function persistResourceImage(
  resourceId: string,
  image: string,
): Promise<string> {
  if (!isDataUrl(image)) return image
  return uploadResourceCover(resourceId, await toBlob(image))
}
