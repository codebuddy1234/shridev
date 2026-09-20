import { Badge } from "@/components/ui/badge";
import type { EnquiryStatus } from "@/types/api";

/** Status vocabulary, shared by the table, the filters and the detail view. */
export const ENQUIRY_STATUSES: {
  value: EnquiryStatus;
  label: string;
  variant: "info" | "brand" | "accent" | "warning" | "positive" | "neutral";
}[] = [
  { value: "NEW", label: "New", variant: "info" },
  { value: "CONTACTED", label: "Contacted", variant: "brand" },
  { value: "DISCOVERY", label: "Discovery", variant: "accent" },
  { value: "PROPOSAL", label: "Proposal", variant: "warning" },
  { value: "IN_PROGRESS", label: "In progress", variant: "brand" },
  { value: "COMPLETED", label: "Completed", variant: "positive" },
  { value: "CLOSED", label: "Closed", variant: "neutral" },
];

export function statusMeta(status: EnquiryStatus) {
  return ENQUIRY_STATUSES.find((entry) => entry.value === status) ?? ENQUIRY_STATUSES[0];
}

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  const meta = statusMeta(status);
  return (
    <Badge variant={meta.variant} size="sm">
      {meta.label}
    </Badge>
  );
}
