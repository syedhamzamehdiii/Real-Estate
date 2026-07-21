import { z } from 'zod'

export const resourceInputSchema = z
  .object({
    id: z.string().min(1).max(40).optional(),
    slug: z.string().trim().min(1).max(120),
    category: z.string().trim().min(1).max(80),
    title: z.string().trim().min(1).max(200),
    excerpt: z.string().trim().min(1).max(500),
    content: z.string().trim().min(1).max(50000),
    image: z.string().trim().min(1).max(2048),
    author: z.string().trim().min(1).max(120),
    readMinutes: z.number().int().min(1).max(120),
    publishedAt: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'publishedAt must be YYYY-MM-DD'),
    featured: z.boolean().optional(),
  })
  .strict()

export type ResourceInput = z.infer<typeof resourceInputSchema>

export function validateResourceInput(input: unknown): ResourceInput {
  return resourceInputSchema.parse(input)
}

export function safeValidateResourceInput(input: unknown) {
  return resourceInputSchema.safeParse(input)
}
