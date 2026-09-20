/**
 * Enquiry form options.
 *
 * Editable in one place. The `value` is what gets stored, so changing a label
 * here does not break existing records.
 */

export const budgetOptions = [
  { value: "under-1l", label: "Under ₹1,00,000" },
  { value: "1l-3l", label: "₹1,00,000 – ₹3,00,000" },
  { value: "3l-6l", label: "₹3,00,000 – ₹6,00,000" },
  { value: "6l-12l", label: "₹6,00,000 – ₹12,00,000" },
  { value: "above-12l", label: "Above ₹12,00,000" },
  { value: "not-decided", label: "Not decided yet" },
] as const;

export const timelineOptions = [
  { value: "under-1-month", label: "Less than 1 month" },
  { value: "1-3-months", label: "1–3 months" },
  { value: "3-6-months", label: "3–6 months" },
  { value: "6-plus-months", label: "6+ months" },
  { value: "not-decided", label: "Not decided" },
] as const;

export const projectTypeOptions = [
  { value: "new-build", label: "New product or system" },
  { value: "existing-improvement", label: "Improve an existing system" },
  { value: "rebuild", label: "Rebuild or modernise" },
  { value: "integration", label: "Integration or automation" },
  { value: "ai-feature", label: "Add AI to an existing product" },
  { value: "consulting", label: "Advice or technical review" },
  { value: "other", label: "Something else" },
] as const;

export const contactMethodOptions = [
  { value: "EMAIL", label: "Email" },
  { value: "PHONE", label: "Phone call" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "ANY", label: "Any of these" },
] as const;

export const referralOptions = [
  { value: "search", label: "Search engine" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "referral", label: "Referred by someone" },
  { value: "social", label: "Social media" },
  { value: "other", label: "Other" },
] as const;
