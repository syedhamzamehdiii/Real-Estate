export {
  initFirebase,
  isFirebaseConfigComplete,
  isFirebaseInitialized,
  getFirebaseApp,
  getFirebaseAuth,
  getDb,
  getFirebaseStorage,
  type EstateFirebaseConfig,
} from './firebase'

export {
  loginWithEmailPassword,
  logout,
  getCurrentUser,
  getIdToken,
  subscribeAuth,
  toAuthSession,
  type AuthSession,
} from './auth'

export {
  uploadListingCover,
  uploadListingGalleryImage,
  uploadResourceCover,
  persistListingImages,
  persistResourceImage,
  deleteListingMedia,
  deleteResourceMedia,
  isDataUrl,
} from './storage'

export {
  getListingsMeta,
  getResourcesMeta,
  saveListingsMeta,
  saveResourcesMeta,
  subscribeListingsMeta,
  subscribeResourcesMeta,
  upsertMainArea,
  removeMainAreaIfUnused,
  syncMainAreasFromListings,
  placeListingFeatured,
  commitListingMetaWrite,
  placeResourceFeatured,
  allocateResourceId,
} from './meta'

export {
  listAllListings,
  subscribeListings,
  getListingById,
  queryListings,
  createListing,
  updateListing,
  deleteListing,
  syncListingFeaturedFlags,
  getFeaturedListings,
} from './listings'

export {
  listAllResources,
  subscribeResources,
  getResourceById,
  getResourceBySlug,
  queryResources,
  createResource,
  updateResource,
  deleteResource,
  syncResourceFeaturedFlags,
  getFeaturedResources,
  collectCategories,
} from './resources'

export {
  createInquiry,
  listInquiries,
  subscribeInquiries,
  updateInquiryStatus,
} from './inquiries'

export type {
  ListingsMeta,
  ResourcesMeta,
  Listing,
  BlogPost,
  ListingWriteOptions,
  ResourceWriteOptions,
  ContactFormData,
  InquiryDocument,
  MainArea,
} from '../types/models'
