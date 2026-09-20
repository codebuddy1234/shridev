"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { ButtonLink } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";
import { primaryNav, servicesMegaMenu } from "@/content/navigation";

/**
 * Site navigation.
 *
 * Desktop: a sticky bar that condenses on scroll, with a services mega menu
 * that opens on hover and on keyboard focus, closes on Escape and on focus
 * leaving the group.
 *
 * Mobile: a full-height drawer with the services list collapsed behind a
 * disclosure, so the primary destinations stay reachable without scrolling.
 */
export function Navbar() {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  const megaGroupRef = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Condense the bar once the page has scrolled past the hero's first rows.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Any navigation closes every open surface.
  useEffect(() => {
    setDrawerOpen(false);
    setMegaOpen(false);
    setMobileServicesOpen(false);
  }, [pathname]);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [drawerOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setMegaOpen(false);
      setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // A short close delay keeps the menu open while the pointer crosses the gap
  // between the trigger and the panel.
  const scheduleClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setMegaOpen(false), 140);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => () => cancelClose(), [cancelClose]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300 ease-[var(--ease-out-soft)]",
        scrolled
          ? "border-b border-hairline bg-canvas/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div
        className={cn(
          "shell flex items-center justify-between gap-6 transition-all duration-300 ease-[var(--ease-out-soft)]",
          scrolled ? "h-16" : "h-20",
        )}
      >
        <Logo markSize={scrolled ? 27 : 30} />

        {/* ---------------- Desktop navigation ---------------- */}
        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {primaryNav.map((item) => {
              const hasMega = item.href === "/services";
              const active = isActive(item.href);

              if (!hasMega) {
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                        active ? "text-ink" : "text-ink-muted hover:text-ink",
                      )}
                    >
                      {item.label}
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-x-3.5 -bottom-0.5 h-px bg-accent-500/70"
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              }

              return (
                <li
                  key={item.href}
                  ref={megaGroupRef}
                  onMouseEnter={() => {
                    cancelClose();
                    setMegaOpen(true);
                  }}
                  onMouseLeave={scheduleClose}
                  onFocus={() => setMegaOpen(true)}
                  onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                      setMegaOpen(false);
                    }
                  }}
                >
                  <Link
                    href={item.href}
                    aria-expanded={megaOpen}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors duration-200",
                      active ? "text-ink" : "text-ink-muted hover:text-ink",
                    )}
                  >
                    {item.label}
                    <Icon
                      name="ChevronDown"
                      size={14}
                      className={cn(
                        "transition-transform duration-200",
                        megaOpen && "rotate-180",
                      )}
                    />
                    {active ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-3.5 -bottom-0.5 h-px bg-accent-500/70"
                      />
                    ) : null}
                  </Link>

                  <AnimatePresence>
                    {megaOpen ? (
                      <motion.div
                        initial={{ opacity: 0, y: reduce ? 0 : -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute inset-x-0 top-full z-50 pt-3"
                      >
                        <div className="shell">
                          <MegaMenuPanel onNavigate={() => setMegaOpen(false)} />
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="hidden lg:block">
          <ButtonLink href="/start-project" size="sm" className="pl-5">
            Start a Project
            <Icon name="ArrowRight" size={15} className="btn-arrow" />
          </ButtonLink>
        </div>

        {/* ---------------- Mobile trigger ---------------- */}
        <button
          type="button"
          onClick={() => setDrawerOpen((open) => !open)}
          aria-expanded={drawerOpen}
          aria-controls="mobile-navigation"
          aria-label={drawerOpen ? "Close menu" : "Open menu"}
          className="inline-flex size-10 items-center justify-center rounded-xl border border-hairline bg-white/[0.04] text-ink transition-colors hover:bg-white/[0.08] lg:hidden"
        >
          <Icon name={drawerOpen ? "X" : "Menu"} size={19} />
        </button>
      </div>

      {/* ---------------- Mobile drawer ---------------- */}
      <AnimatePresence>
        {drawerOpen ? (
          <motion.div
            id="mobile-navigation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain border-t border-hairline bg-canvas/98 backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile" className="shell flex min-h-full flex-col py-6">
              <ul className="flex flex-col">
                {primaryNav.map((item) => {
                  if (item.href === "/services") {
                    return (
                      <li key={item.href} className="border-b border-hairline">
                        <div className="flex items-stretch">
                          <Link
                            href={item.href}
                            className="flex-1 py-4 font-display text-lg font-medium text-ink"
                          >
                            {item.label}
                          </Link>
                          <button
                            type="button"
                            onClick={() => setMobileServicesOpen((open) => !open)}
                            aria-expanded={mobileServicesOpen}
                            aria-label={
                              mobileServicesOpen
                                ? "Collapse services list"
                                : "Expand services list"
                            }
                            className="px-3 text-ink-muted"
                          >
                            <Icon
                              name="ChevronDown"
                              size={20}
                              className={cn(
                                "transition-transform duration-200",
                                mobileServicesOpen && "rotate-180",
                              )}
                            />
                          </button>
                        </div>

                        <AnimatePresence initial={false}>
                          {mobileServicesOpen ? (
                            <motion.div
                              initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                              animate={reduce ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                              exit={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-5 pb-5">
                                {servicesMegaMenu.map((column) => (
                                  <div key={column.heading}>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                                      {column.heading}
                                    </p>
                                    <ul className="space-y-1">
                                      {column.links.map((link) => (
                                        <li key={link.href}>
                                          <Link
                                            href={link.href}
                                            className="block rounded-lg py-2 pl-3 text-[0.9375rem] text-ink-muted transition-colors hover:text-ink"
                                          >
                                            {link.label}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </li>
                    );
                  }

                  return (
                    <li key={item.href} className="border-b border-hairline">
                      <Link
                        href={item.href}
                        aria-current={isActive(item.href) ? "page" : undefined}
                        className={cn(
                          "block py-4 font-display text-lg font-medium transition-colors",
                          isActive(item.href) ? "text-accent-400" : "text-ink",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
                <li className="border-b border-hairline">
                  <Link href="/team" className="block py-4 font-display text-lg font-medium text-ink">
                    Team
                  </Link>
                </li>
              </ul>

              <div className="mt-8">
                <ButtonLink href="/start-project" size="lg" full>
                  Start a Project
                  <Icon name="ArrowRight" size={17} className="btn-arrow" />
                </ButtonLink>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

/** Services mega menu contents, shared by the desktop dropdown. */
function MegaMenuPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="overflow-hidden rounded-panel border border-hairline-strong bg-surface/95 shadow-lift backdrop-blur-xl">
      <div className="grid gap-x-8 gap-y-8 p-8 lg:grid-cols-[repeat(3,1fr)_0.85fr]">
        {servicesMegaMenu.map((column) => (
          <div key={column.heading}>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
              {column.heading}
            </p>
            <ul className="space-y-1">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    className="group block rounded-lg px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.05]"
                  >
                    <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
                      {link.label}
                      <Icon
                        name="ArrowUpRight"
                        size={13}
                        className="opacity-0 transition-opacity duration-200 group-hover:opacity-70"
                      />
                    </span>
                    {link.description ? (
                      <span className="mt-0.5 block text-xs leading-relaxed text-ink-faint">
                        {link.description}
                      </span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Closing column: a route into the full catalogue and the enquiry flow. */}
        <div className="flex flex-col justify-between rounded-card border border-hairline bg-gradient-to-b from-brand-500/[0.14] to-transparent p-5">
          <div>
            <p className="font-display text-base font-medium text-ink">
              Not sure which you need?
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Describe the problem and we will tell you what the work actually
              involves — or whether you need us at all.
            </p>
          </div>
          <div className="mt-5 flex flex-col gap-2">
            <Link
              href="/services"
              onClick={onNavigate}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-400 hover:text-accent-300"
            >
              All services
              <Icon name="ArrowRight" size={13} />
            </Link>
            <Link
              href="/start-project"
              onClick={onNavigate}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-400 hover:text-accent-300"
            >
              Start a project
              <Icon name="ArrowRight" size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
