"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Section, Shell } from "@/components/ui/shell";
import { SectionHeader } from "@/components/ui/section-header";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { processPhases } from "@/content/company";

/**
 * Delivery lifecycle.
 *
 * An interactive timeline: selecting a phase reveals its detail and artefacts
 * below. Implemented as a proper tablist so arrow keys move between phases and
 * screen readers announce the selected panel — the animation is decoration on
 * top of a standard widget, not a replacement for one.
 */
export function ProcessTimeline() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const phase = processPhases[active];

  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = processPhases.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = active === last ? 0 : active + 1;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = active === 0 ? last : active - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = last;

    if (next === null) return;
    event.preventDefault();
    setActive(next);
    document.getElementById(`phase-tab-${next}`)?.focus();
  };

  return (
    <Section id="process">
      <Shell>
        <SectionHeader
          eyebrow="Our process"
          title="From idea to production."
          description="Seven phases, each with something concrete at the end of it. The sequence is the same whether the engagement lasts three weeks or nine months — the depth of each phase is what changes."
        />

        <div className="mt-14">
          {/* ---- Phase rail ---- */}
          <div
            role="tablist"
            aria-label="Delivery process phases"
            onKeyDown={onKeyDown}
            className="relative grid grid-cols-2 gap-px overflow-hidden rounded-card border border-hairline bg-hairline sm:grid-cols-4 lg:grid-cols-7"
          >
            {processPhases.map((item, index) => {
              const selected = index === active;
              return (
                <button
                  key={item.index}
                  id={`phase-tab-${index}`}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`phase-panel-${index}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(index)}
                  className={cn(
                    "group relative flex flex-col gap-2 p-5 text-left transition-colors duration-300",
                    selected ? "bg-surface-2" : "bg-surface/70 hover:bg-surface-2/60",
                  )}
                >
                  {/* Progress rule at the top of each phase cell. */}
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-0.5 w-8 rounded-full transition-all duration-300",
                      selected
                        ? "w-12 bg-gradient-to-r from-brand-400 to-accent-500"
                        : "bg-hairline-strong group-hover:w-10",
                    )}
                  />
                  <span
                    className={cn(
                      "font-mono text-[0.6875rem] tracking-widest transition-colors",
                      selected ? "text-accent-400" : "text-ink-faint",
                    )}
                  >
                    {item.index}
                  </span>
                  <span
                    className={cn(
                      "font-display text-base font-medium transition-colors",
                      selected ? "text-ink" : "text-ink-muted group-hover:text-ink",
                    )}
                  >
                    {item.title}
                  </span>
                  <span className="text-xs leading-relaxed text-ink-faint">
                    {item.summary}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ---- Selected phase detail ---- */}
          <div
            id={`phase-panel-${active}`}
            role="tabpanel"
            aria-labelledby={`phase-tab-${active}`}
            tabIndex={0}
            className="mt-5 rounded-card border border-hairline bg-surface/60 p-7 sm:p-10"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={phase.index}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-14"
              >
                <div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl border border-brand-400/25 bg-brand-500/10 text-brand-200">
                      <Icon name={phase.icon} size={19} />
                    </span>
                    <h3 className="font-display text-xl font-medium text-ink">
                      {phase.index} &middot; {phase.title}
                    </h3>
                  </div>
                  <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink-muted">
                    {phase.detail}
                  </p>
                </div>

                <div className="rounded-xl border border-hairline bg-canvas/50 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                    What exists afterwards
                  </p>
                  <ul className="mt-4 space-y-3">
                    {phase.artefacts.map((artefact) => (
                      <li key={artefact} className="flex items-start gap-2.5 text-sm text-ink-muted">
                        <Icon name="Check" size={15} className="mt-0.5 shrink-0 text-accent-500" />
                        {artefact}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Shell>
    </Section>
  );
}
