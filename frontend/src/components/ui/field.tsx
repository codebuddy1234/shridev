"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

/**
 * Form primitives.
 *
 * A native `<select>` is used rather than a custom listbox: it is keyboard and
 * screen-reader correct by default and gives a far better experience on mobile
 * for a form this long.
 *
 * Errors are wired through `aria-describedby` and `aria-invalid` so assistive
 * technology announces them, and are never communicated by colour alone — each
 * message carries an icon and text.
 */

const controlBase = [
  "w-full rounded-xl border bg-surface-2/60 px-4 text-[0.9375rem] text-ink",
  "placeholder:text-ink-faint",
  "transition-colors duration-200",
  "focus:border-brand-400/60 focus:bg-surface-2 focus:outline-none",
  "focus-visible:ring-2 focus-visible:ring-brand-500/30",
  "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

interface FieldProps {
  label: string;
  /** Marks the control required and renders the required indicator. */
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => React.ReactNode;
}

/** Label + control + hint/error wrapper that owns the accessibility wiring. */
export function Field({ label, required, hint, error, className, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
        {required ? (
          <>
            <span aria-hidden="true" className="ml-1 text-accent-400">
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        ) : null}
      </label>

      {children({ id, describedBy, invalid: Boolean(error) })}

      {hint && !error ? (
        <p id={hintId} className="text-xs text-ink-faint">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="flex items-center gap-1.5 text-xs text-danger">
          <Icon name="AlertCircle" size={13} />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function Input({
  className,
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      className={cn(
        controlBase,
        "h-12",
        invalid ? "border-danger/60" : "border-hairline-strong",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Textarea({
  className,
  invalid,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      className={cn(
        controlBase,
        "min-h-36 resize-y py-3 leading-relaxed",
        invalid ? "border-danger/60" : "border-hairline-strong",
        className,
      )}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

export function Select({
  className,
  invalid,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return (
    <div className="relative">
      <select
        className={cn(
          controlBase,
          "h-12 appearance-none pr-10",
          invalid ? "border-danger/60" : "border-hairline-strong",
          // Native option lists inherit the OS palette; force a readable one.
          "[&>option]:bg-surface-2 [&>option]:text-ink",
          className,
        )}
        aria-invalid={invalid || undefined}
        {...props}
      >
        {children}
      </select>
      <Icon
        name="ChevronDown"
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
      />
    </div>
  );
}

/** Inline status message used for whole-form success and failure states. */
export function FormMessage({
  tone,
  title,
  children,
  className,
}: {
  tone: "error" | "success" | "info";
  title: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const icon = tone === "error" ? "AlertCircle" : tone === "success" ? "CheckCircle2" : "Info";
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-xl border p-4 text-sm",
        tone === "error" && "border-danger/30 bg-danger/10 text-danger",
        tone === "success" && "border-positive/30 bg-positive/10 text-positive",
        tone === "info" && "border-info/30 bg-info/10 text-info",
        className,
      )}
    >
      <Icon name={icon} size={18} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-medium">{title}</p>
        {children ? <div className="mt-1 opacity-90">{children}</div> : null}
      </div>
    </div>
  );
}

/**
 * Off-screen text input that real users never see or focus.
 * A submission with this filled is almost certainly a bot, and the server
 * rejects it. Not a replacement for rate limiting — an inexpensive addition.
 */
export function Honeypot({ name = "website" }: { name?: string }) {
  return (
    <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
      <label htmlFor={`hp-${name}`}>Leave this field empty</label>
      <input id={`hp-${name}`} name={name} type="text" tabIndex={-1} autoComplete="off" />
    </div>
  );
}
