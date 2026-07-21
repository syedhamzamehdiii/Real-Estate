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

export const listingInputSchema = z
  .object({
    id: z.string().min(1).max(80).optional(),
    title: z.string().trim().min(1).max(200),
    location: z.string().trim().min(1).max(200),
    locationKey: z.string().trim().min(1).max(80),
    type: z.enum(PROPERTY_TYPES),
    status: z.enum(PROPERTY_STATUSES),
    priceLabel: z.string().trim().min(1).max(80),
    priceValue: z.number().nonnegative(),
    image: z.string().trim().min(1).max(2048),
    images: z.array(z.string().min(1).max(2048)).max(MAX_GALLERY_IMAGES).optional(),
    beds: z.number().int().nonnegative().optional(),
    baths: z.number().int().nonnegative().optional(),
    sizeLabel: z.string().trim().min(1).max(80),
    description: z.string().trim().min(1).max(10000),
    featured: z.boolean().optional(),
    details: listingDetailsSchema.optional(),
  })
  .strict()

export type ListingInput = z.infer<typeof listingInputSchema>

export function validateListingInput(input: unknown): ListingInput {
  return listingInputSchema.parse(input)
}

export function safeValidateListingInput(input: unknown) {
  return listingInputSchema.safeParse(input)
}
