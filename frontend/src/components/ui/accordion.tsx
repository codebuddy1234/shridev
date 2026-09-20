"use client";

import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import type { Faq } from "@/content/company";

/**
 * FAQ accordion.
 *
 * Radix supplies the roving focus, aria-expanded/aria-controls wiring and
 * arrow-key navigation; Framer Motion supplies the height transition, which is
 * skipped entirely under prefers-reduced-motion.
 */
export function FaqAccordion({
  items,
  className,
  defaultOpen,
}: {
  items: Faq[];
  className?: string;
  /** Index of the item expanded on first render, if any. */
  defaultOpen?: number;
}) {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState<string>(
    defaultOpen !== undefined ? `item-${defaultOpen}` : "",
  );

  return (
    <AccordionPrimitive.Root
      type="single"
      collapsible
      value={open}
      onValueChange={setOpen}
      className={cn("divide-y divide-hairline border-y border-hairline", className)}
    >
      {items.map((item, index) => {
        const value = `item-${index}`;
        const isOpen = open === value;

        return (
          <AccordionPrimitive.Item key={item.question} value={value}>
            <AccordionPrimitive.Header asChild>
              <h3>
                <AccordionPrimitive.Trigger
                  className={cn(
                    "group flex w-full items-start justify-between gap-6 py-6 text-left",
                    "transition-colors duration-200 hover:text-brand-200",
                    "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-500",
                  )}
                >
                  <span
                    className={cn(
                      "font-display text-base font-medium sm:text-lg",
                      isOpen ? "text-ink" : "text-ink/90",
                    )}
                  >
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border",
                      "transition-all duration-300 ease-[var(--ease-out-soft)]",
                      isOpen
                        ? "rotate-180 border-brand-400/40 bg-brand-500/15 text-brand-200"
                        : "border-hairline text-ink-faint group-hover:border-hairline-strong",
                    )}
                  >
                    <Icon name="ChevronDown" size={15} />
                  </span>
                </AccordionPrimitive.Trigger>
              </h3>
            </AccordionPrimitive.Header>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <AccordionPrimitive.Content forceMount asChild>
                  <motion.div
                    key="content"
                    initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                    exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="max-w-3xl pb-7 pr-10 text-[0.9375rem] leading-relaxed text-ink-muted">
                      {item.answer}
                    </p>
                  </motion.div>
                </AccordionPrimitive.Content>
              ) : null}
            </AnimatePresence>
          </AccordionPrimitive.Item>
        );
      })}
    </AccordionPrimitive.Root>
  );
}
