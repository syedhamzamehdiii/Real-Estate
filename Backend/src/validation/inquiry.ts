import { z } from 'zod'

export const inquiryInputSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(7).max(40),
    message: z.string().trim().min(10).max(5000),
    interest: z.string().trim().min(1).max(120),
  })
  .strict()

export type InquiryInput = z.infer<typeof inquiryInputSchema>

export function validateInquiryInput(input: unknown): InquiryInput {
  return inquiryInputSchema.parse(input)
}

export function safeValidateInquiryInput(input: unknown) {
  return inquiryInputSchema.safeParse(input)
}
