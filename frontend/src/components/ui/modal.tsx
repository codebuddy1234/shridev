"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";

/**
 * Modal dialog built on Radix, which handles the focus trap, scroll lock,
 * escape handling and `aria-modal` semantics. Used by the admin interface for
 * enquiry detail and record editing.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-canvas/80 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2",
            "flex-col overflow-hidden rounded-panel border border-hairline-strong bg-surface shadow-lift",
            size === "md" && "max-w-lg",
            size === "lg" && "max-w-2xl",
            size === "xl" && "max-w-4xl",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-hairline px-6 py-5">
            <div>
              <Dialog.Title className="font-display text-lg font-semibold text-ink">
                {title}
              </Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-ink-muted">
                  {description}
                </Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-white/[0.06] hover:text-ink"
              aria-label="Close dialog"
            >
              <Icon name="X" size={18} />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

          {footer ? (
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-hairline bg-surface-2/50 px-6 py-4">
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
