import { z } from "zod";
import { services } from "@/content/services";

/**
 * Enquiry validation, shared by the browser form and the Next.js route
 * handler.
 *
 * This is NOT the authoritative check — the FastAPI backend revalidates every
 * field independently (see `backend/app/schemas/enquiry.py`). Validating here
 * as well simply gives the user immediate, field-level feedback instead of a
 * round trip.
 */

// Permissive on formatting, strict on character set — international numbers
// vary far too much for a single pattern, but letters never belong in one.
const phonePattern = /^[+()\d][\d\s\-().]{5,29}$/;

const serviceValues = [...services.map((service) => service.slug), "other"] as const;

export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your full name.")
    .max(160, "Name is too long."),

  email: z.email("Enter a valid email address.").max(255, "Email address is too long."),

  phone: z
    .string()
    .trim()
    .max(40, "Phone number is too long.")
    .refine((value) => value === "" || phonePattern.test(value), {
      message: "Use digits, spaces and the characters + - ( ) only.",
    })
    .optional(),

  company: z.string().trim().max(160, "Company name is too long.").optional(),

  service: z.enum(serviceValues, "Select the service you need."),

  project_type: z.string().trim().max(120).optional(),
  budget: z.string().trim().max(80).optional(),
  timeline: z.string().trim().max(80).optional(),

  message: z
    .string()
    .trim()
    .min(20, "Please describe the project in at least 20 characters.")
    .max(5000, "Please keep the description under 5000 characters."),

  contact_method: z.enum(["EMAIL", "PHONE", "WHATSAPP", "ANY"]).default("EMAIL"),

  referral_source: z.string().trim().max(160).optional(),

  // Honeypot — hidden from real users, so any value indicates automation.
  website: z.string().max(200).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;

/** Field-keyed error map, in the shape the form renders. */
export type EnquiryErrors = Partial<Record<keyof EnquiryInput | "form", string>>;

/** Flatten a Zod issue list into a single message per field. */
export function collectErrors(error: z.ZodError<EnquiryInput>): EnquiryErrors {
  const errors: EnquiryErrors = {};
  for (const issue of error.issues) {
    const field = issue.path[0] as keyof EnquiryInput | undefined;
    if (field && !errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
