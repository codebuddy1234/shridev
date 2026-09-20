"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Field, FormMessage, Honeypot, Input, Select, Textarea } from "@/components/ui/field";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/states";
import { collectErrors, enquirySchema, type EnquiryErrors } from "@/lib/enquiry-schema";
import { serviceEnquiryOptions } from "@/content/services";
import {
  budgetOptions,
  contactMethodOptions,
  projectTypeOptions,
  referralOptions,
  timelineOptions,
} from "@/content/enquiry-options";
import { siteConfig } from "@/content/site";

type Status = "idle" | "submitting" | "error" | "success";

/**
 * Project enquiry form.
 *
 * Handles all four states explicitly — idle, submitting, error and success —
 * so the visitor is never looking at an unexplained screen. Validation runs
 * client-side for immediate feedback and again on the server, which is the
 * authoritative check.
 *
 * The service field can be pre-selected via `?service=` from a service page,
 * and project type via `?project_type=` from a solution.
 */
export function EnquiryForm() {
  const reduce = useReducedMotion();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  // Pre-fill from the link the visitor arrived on.
  const presetService = searchParams.get("service") ?? "";
  const presetProjectType = searchParams.get("project_type") ?? "";

  // Move focus to the confirmation so screen reader users are told it worked.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    const parsed = enquirySchema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = collectErrors(parsed.error);
      setErrors(fieldErrors);
      setFormError("Please correct the highlighted fields.");
      setStatus("error");

      // Focus the first invalid control so keyboard users are not left
      // hunting for the problem.
      const firstField = Object.keys(fieldErrors)[0];
      if (firstField) {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${firstField}"]`)
          ?.focus({ preventScroll: false });
      }
      return;
    }

    setStatus("submitting");
    setErrors({});
    setFormError(null);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrors(body.errors ?? {});
        setFormError(
          body.message ?? "We couldn't submit the enquiry. Please try again.",
        );
        setStatus("error");
        return;
      }

      setReference(body.reference ?? null);
      setStatus("success");
    } catch {
      // Network-level failure — the request never reached the server.
      setFormError(
        "We couldn't reach the server. Check your connection and try again.",
      );
      setStatus("error");
    }
  }

  /* ------------------------------------------------------------------ */
  /* Success state                                                       */
  /* ------------------------------------------------------------------ */

  if (status === "success") {
    return (
      <motion.div
        ref={successRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-panel border border-hairline-strong bg-surface p-8 text-center outline-none sm:p-12"
      >
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full border border-positive/30 bg-positive/10 text-positive">
          <Icon name="CheckCircle2" size={26} />
        </span>

        <h2 className="mt-7 font-display text-2xl font-semibold text-ink">Thank you.</h2>
        <p className="mx-auto mt-4 max-w-md text-[0.9375rem] leading-relaxed text-ink-muted">
          Your project enquiry has been received. Our team will review the
          information and get in touch.
        </p>

        {reference ? (
          <p className="mt-6 inline-flex items-center gap-2 rounded-full border border-hairline bg-surface-2 px-4 py-2 font-mono text-sm text-ink-muted">
            <Icon name="Hash" size={13} className="text-accent-400" />
            {reference}
          </p>
        ) : null}

        <p className="mx-auto mt-6 max-w-md text-xs leading-relaxed text-ink-faint">
          This confirmation means the enquiry reached our system. We do not send
          an automated email, so there is nothing to look for in your inbox — a
          person will reply directly.
        </p>

        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/projects" variant="secondary">
            Explore Our Work
            <Icon name="ArrowRight" size={16} className="btn-arrow" />
          </ButtonLink>
          <ButtonLink href="/" variant="ghost">
            Back Home
          </ButtonLink>
        </div>
      </motion.div>
    );
  }

  /* ------------------------------------------------------------------ */
  /* Form                                                                */
  /* ------------------------------------------------------------------ */

  const submitting = status === "submitting";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="relative rounded-panel border border-hairline bg-surface/60 p-6 sm:p-9"
    >
      <Honeypot />

      {formError ? (
        <FormMessage tone="error" title={formError} className="mb-8">
          {status === "error" && Object.keys(errors).length === 0 ? (
            <>
              If this keeps happening, contact us directly
              {siteConfig.contact.email ? ` at ${siteConfig.contact.email}` : ""}.
            </>
          ) : null}
        </FormMessage>
      ) : null}

      <fieldset disabled={submitting} className="space-y-9">
        {/* ---- About you ---- */}
        <div>
          <legend className="sr-only">About you</legend>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-accent-400">
            About you
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" required error={errors.name}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  required
                />
              )}
            </Field>

            <Field label="Email" required error={errors.email}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  aria-describedby={describedBy}
                  invalid={invalid}
                  required
                />
              )}
            </Field>

            <Field
              label="Phone / WhatsApp"
              hint="Optional — include the country code."
              error={errors.phone}
            >
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+91 98765 43210"
                  aria-describedby={describedBy}
                  invalid={invalid}
                />
              )}
            </Field>

            <Field label="Company / Organisation" error={errors.company}>
              {({ id, describedBy, invalid }) => (
                <Input
                  id={id}
                  name="company"
                  type="text"
                  autoComplete="organization"
                  placeholder="Optional"
                  aria-describedby={describedBy}
                  invalid={invalid}
                />
              )}
            </Field>
          </div>
        </div>

        {/* ---- About the project ---- */}
        <div className="border-t border-hairline pt-9">
          <legend className="sr-only">About the project</legend>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-accent-400">
            About the project
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Service" required error={errors.service}>
              {({ id, describedBy, invalid }) => (
                <Select
                  id={id}
                  name="service"
                  defaultValue={presetService}
                  aria-describedby={describedBy}
                  invalid={invalid}
                  required
                >
                  <option value="" disabled>
                    Select a service
                  </option>
                  {serviceEnquiryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Project type" error={errors.project_type}>
              {({ id, describedBy, invalid }) => (
                <Select
                  id={id}
                  name="project_type"
                  defaultValue={presetProjectType}
                  aria-describedby={describedBy}
                  invalid={invalid}
                >
                  <option value="">Not sure yet</option>
                  {projectTypeOptions.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                  {/* A solution page may pass a type not in the list above. */}
                  {presetProjectType &&
                  !projectTypeOptions.some((option) => option.label === presetProjectType) ? (
                    <option value={presetProjectType}>{presetProjectType}</option>
                  ) : null}
                </Select>
              )}
            </Field>

            <Field
              label="Estimated budget"
              hint="A range is enough — it helps us scope realistically."
              error={errors.budget}
            >
              {({ id, describedBy, invalid }) => (
                <Select id={id} name="budget" aria-describedby={describedBy} invalid={invalid}>
                  <option value="">Prefer not to say</option>
                  {budgetOptions.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="Expected timeline" error={errors.timeline}>
              {({ id, describedBy, invalid }) => (
                <Select id={id} name="timeline" aria-describedby={describedBy} invalid={invalid}>
                  <option value="">Not decided</option>
                  {timelineOptions.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>

          <Field
            label="Project description"
            required
            className="mt-5"
            hint="What are you trying to build or fix? Include any existing systems, deadlines or constraints."
            error={errors.message}
          >
            {({ id, describedBy, invalid }) => (
              <Textarea
                id={id}
                name="message"
                rows={7}
                placeholder="Describe the problem, who it affects, and what a good outcome would look like."
                aria-describedby={describedBy}
                invalid={invalid}
                required
              />
            )}
          </Field>
        </div>

        {/* ---- Getting back to you ---- */}
        <div className="border-t border-hairline pt-9">
          <legend className="sr-only">Getting back to you</legend>
          <h2 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-accent-400">
            Getting back to you
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <Field label="Preferred contact method" error={errors.contact_method}>
              {({ id, describedBy, invalid }) => (
                <Select
                  id={id}
                  name="contact_method"
                  defaultValue="EMAIL"
                  aria-describedby={describedBy}
                  invalid={invalid}
                >
                  {contactMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>

            <Field label="How did you hear about us?" error={errors.referral_source}>
              {({ id, describedBy, invalid }) => (
                <Select
                  id={id}
                  name="referral_source"
                  aria-describedby={describedBy}
                  invalid={invalid}
                >
                  <option value="">Prefer not to say</option>
                  {referralOptions.map((option) => (
                    <option key={option.value} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </div>
        </div>
      </fieldset>

      {/* ---- Submit ---- */}
      <div className="mt-9 flex flex-col gap-4 border-t border-hairline pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink-faint sm:max-w-sm">
          Please do not include confidential information. If your requirement
          needs a confidentiality agreement, say so and we will arrange one first.
        </p>

        <Button type="submit" size="lg" disabled={submitting} className="sm:shrink-0">
          {submitting ? (
            <>
              <Spinner size={17} />
              Sending your enquiry…
            </>
          ) : (
            <>
              Send Project Enquiry
              <Icon name="ArrowRight" size={17} className="btn-arrow" />
            </>
          )}
        </Button>
      </div>

      {/* Politely announced to assistive technology while in flight. */}
      <p aria-live="polite" className="sr-only">
        {submitting ? "Sending your enquiry, please wait." : ""}
      </p>
    </form>
  );
}
