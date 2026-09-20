import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * The single button definition for the product.
 *
 * CTA hierarchy across the site: `primary` for the one action we most want
 * (usually "Start a Project"), `secondary` for the supporting action, and
 * `ghost`/`link` for tertiary navigation. A section should never contain more
 * than one `primary`.
 */
const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full",
    "font-medium tracking-[-0.01em] transition-all duration-200 ease-[var(--ease-out-soft)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
    // Nudge any trailing arrow on hover rather than moving the whole button.
    "[&_.btn-arrow]:transition-transform [&_.btn-arrow]:duration-200",
    "hover:[&_.btn-arrow]:translate-x-0.5",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-brand-500 text-white shadow-[0_10px_30px_-12px_rgba(109,93,251,0.8)]",
          "hover:bg-brand-400 hover:shadow-[0_14px_38px_-12px_rgba(109,93,251,0.95)]",
          "active:bg-brand-600",
        ],
        secondary: [
          "border border-hairline-strong bg-white/[0.04] text-ink backdrop-blur-sm",
          "hover:border-brand-400/50 hover:bg-white/[0.08]",
        ],
        accent: [
          "bg-accent-500 text-canvas shadow-[0_10px_30px_-12px_rgba(34,211,197,0.7)]",
          "hover:bg-accent-400",
        ],
        ghost: "text-ink-muted hover:bg-white/[0.06] hover:text-ink",
        link: "h-auto rounded-none p-0 text-accent-400 underline-offset-4 hover:text-accent-300 hover:underline",
        danger: "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-5 text-[0.9375rem]",
        lg: "h-13 px-7 text-base",
        icon: "size-10 p-0",
      },
      full: { true: "w-full", false: "" },
    },
    compoundVariants: [{ variant: "link", size: ["sm", "md", "lg"], class: "h-auto p-0" }],
    defaultVariants: { variant: "primary", size: "md", full: false },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, full, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, full }), className)} {...props} />;
}

export interface ButtonLinkProps
  extends Omit<React.ComponentProps<typeof Link>, "href">,
    VariantProps<typeof buttonVariants> {
  href: string;
  /** Set for links leaving the site; adds target, rel and an external cue. */
  external?: boolean;
}

/** Anchor styled as a button. Uses next/link for internal navigation. */
export function ButtonLink({
  className,
  variant,
  size,
  full,
  href,
  external,
  children,
  ...props
}: ButtonLinkProps) {
  const classes = cn(buttonVariants({ variant, size, full }), className);

  if (external || /^(https?:)?\/\//.test(href) || href.startsWith("mailto:") || href.startsWith("tel:")) {
    const isHttp = /^https?:/.test(href);
    return (
      <a
        href={href}
        className={classes}
        {...(isHttp ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}

export { buttonVariants };
