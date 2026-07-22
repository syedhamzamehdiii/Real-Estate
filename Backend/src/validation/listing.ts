import { z } from 'zod'
import { PROPERTY_STATUSES, PROPERTY_TYPES } from '../config/constants'
import { MAX_GALLERY_IMAGES } from '../types/models'

const listingDetailsSchema = z
  .object({
    beds: z.number().int().nonnegative().optional(),
    baths: z.number().int().nonnegative().optional(),
    floors: z.number().int().positive().optional(),
    yearBuilt: z.number().int().min(1800).max(2100).optional(),
    parking: z.string().max(200).optional(),
    kitchen: z.string().max(200).optional(),
    furnishing: z.string().max(120).optional(),
    facing: z.string().max(120).optional(),
    possession: z.string().max(120).optional(),
    plotSize: z.string().max(80).optional(),
    builtArea: z.string().max(80).optional(),
    servantQuarters: z.string().max(200).optional(),
    features: z.array(z.string().max(120)).max(40).optional(),
    notes: z.string().max(2000).optional(),
  })
  .strict()

/** Admin form may send a data URL; upload to Storage before final validation. */
const imageSourceSchema = z.string().trim().min(1).max(15_000_000)

/** Persisted cover/gallery must be a short HTTP(S) URL (Storage download URL). */
const imageUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(4096)
  .refine((value) => /^https?:\/\//i.test(value), {
    message: 'Image must be an HTTP(S) URL after upload',
  })

const listingFieldsBase = {
  id: z.string().min(1).max(80).optional(),
  title: z.string().trim().min(1).max(200),
  location: z.string().trim().min(1).max(200),
  locationKey: z.string().trim().min(1).max(80),
  type: z.enum(PROPERTY_TYPES),
  status: z.enum(PROPERTY_STATUSES),
  priceLabel: z.string().trim().min(1).max(80),
  priceValue: z.number().nonnegative(),
  beds: z.number().int().nonnegative().optional(),
  baths: z.number().int().nonnegative().optional(),
  sizeLabel: z.string().trim().min(1).max(80),
  description: z.string().trim().min(1).max(10000),
  featured: z.boolean().optional(),
  details: listingDetailsSchema.optional(),
}

/** Pre-upload validation (data URLs allowed). */
export const listingDraftSchema = z
  .object({
    ...listingFieldsBase,
    image: imageSourceSchema,
    thumbnail: imageSourceSchema.optional(),
    images: z.array(imageSourceSchema).max(MAX_GALLERY_IMAGES).optional(),
    imageThumbnails: z.array(imageSourceSchema).max(MAX_GALLERY_IMAGES).optional(),
  })
  .strict()

/** Post-upload validation (Storage / HTTPS URLs only). */
export const listingInputSchema = z
  .object({
    ...listingFieldsBase,
    image: imageUrlSchema,
    thumbnail: imageUrlSchema.optional(),
    images: z.array(imageUrlSchema).max(MAX_GALLERY_IMAGES).optional(),
    imageThumbnails: z.array(imageUrlSchema).max(MAX_GALLERY_IMAGES).optional(),
  })
  .strict()

export type ListingDraft = z.infer<typeof listingDraftSchema>
export type ListingInput = z.infer<typeof listingInputSchema>

export function validateListingDraft(input: unknown): ListingDraft {
  return listingDraftSchema.parse(input)
}

export function validateListingInput(input: unknown): ListingInput {
  return listingInputSchema.parse(input)
}

export function safeValidateListingInput(input: unknown) {
  return listingInputSchema.safeParse(input)
}
