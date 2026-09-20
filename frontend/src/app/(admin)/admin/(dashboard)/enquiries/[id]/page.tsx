import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminPageHeading } from "@/components/admin/page-heading";
import { EnquiryDetailForm } from "@/components/admin/enquiry-detail-form";
import { StatusBadge } from "@/components/admin/status-badge";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { ApiError } from "@/lib/api";
import { getAdminEnquiry } from "@/lib/api";
import { requireAdmin } from "@/lib/session";
import { formatDateTime } from "@/lib/utils";
import { whatsappLink } from "@/content/site";

export const metadata = { title: "Enquiry" };

/**
 * Enquiry detail.
 *
 * The left column is exactly what the enquirer submitted, rendered read-only.
 * The right column holds the internal fields.
 */
export default async function EnquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) notFound();

  const { token } = await requireAdmin(`/admin/enquiries/${id}`);

  let enquiry;
  try {
    enquiry = await getAdminEnquiry(token, numericId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  const wa = enquiry.phone
    ? whatsappLink(`Hello ${enquiry.name}, thank you for your enquiry to ShriDev.`) ??
      `https://wa.me/${enquiry.phone.replace(/\D/g, "")}`
    : null;

  return (
    <div className="space-y-6">
      <Link
        href="/admin/enquiries"
        className="inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-ink-muted"
      >
        <Icon name="ArrowLeft" size={13} />
        All enquiries
      </Link>

      <AdminPageHeading
        title={enquiry.name}
        description={`Reference SD-${String(enquiry.id).padStart(4, "0")} · received ${formatDateTime(enquiry.created_at)}`}
        actions={
          <div className="flex items-center gap-2.5">
            <StatusBadge status={enquiry.status} />
            {enquiry.archived ? <Badge variant="neutral" size="sm">Archived</Badge> : null}
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        {/* ---- Submitted details (read-only) ---- */}
        <div className="space-y-6">
          <section className="rounded-card border border-hairline bg-surface/40 p-6">
            <h2 className="font-display text-base font-medium text-ink">Project description</h2>
            <p className="mt-4 whitespace-pre-wrap text-[0.9375rem] leading-relaxed text-ink-muted">
              {enquiry.message}
            </p>
          </section>

          <section className="rounded-card border border-hairline bg-surface/40 p-6">
            <h2 className="font-display text-base font-medium text-ink">Submitted details</h2>
            <p className="mt-1 text-xs text-ink-faint">
              Exactly as the enquirer provided them. Not editable here.
            </p>

            <dl className="mt-6 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              <DetailRow label="Email">
                <a
                  href={`mailto:${enquiry.email}`}
                  className="text-accent-400 transition-colors hover:text-accent-300"
                >
                  {enquiry.email}
                </a>
              </DetailRow>

              <DetailRow label="Phone / WhatsApp">
                {enquiry.phone ? (
                  <span className="flex flex-wrap items-center gap-3">
                    <a
                      href={`tel:${enquiry.phone.replace(/\s+/g, "")}`}
                      className="text-accent-400 transition-colors hover:text-accent-300"
                    >
                      {enquiry.phone}
                    </a>
                    {wa ? (
                      <a
                        href={wa}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-ink-faint transition-colors hover:text-ink"
                      >
                        <Icon name="MessageSquare" size={12} />
                        WhatsApp
                      </a>
                    ) : null}
                  </span>
                ) : (
                  "—"
                )}
              </DetailRow>

              <DetailRow label="Company">{enquiry.company ?? "—"}</DetailRow>
              <DetailRow label="Service">
                <Badge variant="default" size="sm">
                  {enquiry.service}
                </Badge>
              </DetailRow>
              <DetailRow label="Project type">{enquiry.project_type ?? "—"}</DetailRow>
              <DetailRow label="Budget">{enquiry.budget ?? "—"}</DetailRow>
              <DetailRow label="Timeline">{enquiry.timeline ?? "—"}</DetailRow>
              <DetailRow label="Preferred contact">{enquiry.contact_method}</DetailRow>
              <DetailRow label="Heard about us via">{enquiry.referral_source ?? "—"}</DetailRow>
              <DetailRow label="Last updated">{formatDateTime(enquiry.updated_at)}</DetailRow>
            </dl>

            <div className="mt-7 flex flex-wrap gap-2.5 border-t border-hairline pt-6">
              <a
                href={`mailto:${enquiry.email}?subject=${encodeURIComponent(
                  `Your project enquiry (SD-${String(enquiry.id).padStart(4, "0")})`,
                )}`}
                className="inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-white/[0.04] px-4 py-2 text-sm text-ink transition-colors hover:border-brand-400/40"
              >
                <Icon name="Mail" size={15} />
                Reply by email
              </a>
              {enquiry.phone ? (
                <a
                  href={`tel:${enquiry.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-full border border-hairline-strong bg-white/[0.04] px-4 py-2 text-sm text-ink transition-colors hover:border-brand-400/40"
                >
                  <Icon name="Phone" size={15} />
                  Call
                </a>
              ) : null}
            </div>
          </section>
        </div>

        {/* ---- Internal fields ---- */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <EnquiryDetailForm enquiry={enquiry} />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
      <dd className="mt-1.5 break-words text-sm text-ink-muted">{children}</dd>
    </div>
  );
}
