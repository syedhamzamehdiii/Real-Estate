import { z } from 'zod'

/** Admin form may send a data URL; upload to Storage before final validation. */
const imageSourceSchema = z.string().trim().min(1).max(15_000_000)

/** Persisted cover must be a short HTTP(S) URL (Storage download URL). */
const imageUrlSchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .refine((value) => /^https?:\/\//i.test(value), {
    message: 'Image must be an HTTP(S) URL after upload',
  })

const resourceFieldsBase = {
  id: z.string().min(1).max(40).optional(),
  slug: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().min(1).max(500),
  content: z.string().trim().min(1).max(50000),
  author: z.string().trim().min(1).max(120),
  readMinutes: z.number().int().min(1).max(120),
  publishedAt: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'publishedAt must be YYYY-MM-DD'),
  featured: z.boolean().optional(),
}

/** Pre-upload validation (data URLs allowed). */
export const resourceDraftSchema = z
  .object({
    ...resourceFieldsBase,
    image: imageSourceSchema,
  })
  .strict()

/** Post-upload validation (Storage / HTTPS URLs only). */
export const resourceInputSchema = z
  .object({
    ...resourceFieldsBase,
    image: imageUrlSchema,
  })
  .strict()

export type ResourceDraft = z.infer<typeof resourceDraftSchema>
export type ResourceInput = z.infer<typeof resourceInputSchema>

export function validateResourceDraft(input: unknown): ResourceDraft {
  return resourceDraftSchema.parse(input)
}

export function validateResourceInput(input: unknown): ResourceInput {
  return resourceInputSchema.parse(input)
}

export function safeValidateResourceInput(input: unknown) {
  return resourceInputSchema.safeParse(input)
}
