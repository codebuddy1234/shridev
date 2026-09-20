"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/ui/icon";
import { Logo } from "@/components/layout/logo";
import { initials } from "@/lib/utils";
import type { AdminUser } from "@/types/api";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: "LayoutDashboard", exact: true },
  { href: "/admin/enquiries", label: "Enquiries", icon: "Inbox" },
  { href: "/admin/projects", label: "Projects", icon: "FolderKanban" },
  { href: "/admin/posts", label: "Insights", icon: "FileText" },
  { href: "/admin/team", label: "Team", icon: "Users" },
  { href: "/admin/account", label: "Account", icon: "Lock" },
];

/**
 * Admin chrome: a fixed sidebar on desktop, a slide-over on mobile.
 *
 * Only presentation lives here. Every page inside is a Server Component that
 * re-checks the session and fetches its own data, so this component never
 * holds a token or a data-fetching responsibility.
 */
export function AdminShell({
  user,
  children,
}: {
  user: AdminUser;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const navList = (
    <ul className="space-y-1">
      {navigation.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={() => setMenuOpen(false)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm transition-colors duration-200",
                active
                  ? "bg-brand-500/12 text-ink"
                  : "text-ink-muted hover:bg-white/[0.05] hover:text-ink",
              )}
            >
              <Icon
                name={item.icon}
                size={17}
                className={active ? "text-accent-400" : "text-ink-faint"}
              />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="flex min-h-dvh">
      {/* ---- Desktop sidebar ---- */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-hairline bg-surface/40 lg:flex">
        <div className="border-b border-hairline px-5 py-5">
          <Logo href="/admin" markSize={28} />
          <p className="mt-2 text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
            Admin dashboard
          </p>
        </div>

        <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3.5">
          {navList}
        </nav>

        <div className="border-t border-hairline p-3.5">
          <AccountBlock user={user} onSignOut={handleSignOut} signingOut={signingOut} />
        </div>
      </aside>

      {/* ---- Mobile header ---- */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-hairline bg-canvas/85 px-5 py-3.5 backdrop-blur-xl lg:hidden">
          <Logo href="/admin" markSize={26} />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
            aria-label={menuOpen ? "Close admin menu" : "Open admin menu"}
            className="inline-flex size-10 items-center justify-center rounded-xl border border-hairline bg-white/[0.04] text-ink"
          >
            <Icon name={menuOpen ? "X" : "Menu"} size={19} />
          </button>
        </header>

        {menuOpen ? (
          <div
            id="admin-menu"
            className="border-b border-hairline bg-surface/60 p-4 lg:hidden"
          >
            <nav aria-label="Admin">{navList}</nav>
            <div className="mt-4 border-t border-hairline pt-4">
              <AccountBlock user={user} onSignOut={handleSignOut} signingOut={signingOut} />
            </div>
          </div>
        ) : null}

        <main id="admin-main" className="min-w-0 flex-1 px-5 py-7 sm:px-7 lg:px-9 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}

function AccountBlock({
  user,
  onSignOut,
  signingOut,
}: {
  user: AdminUser;
  onSignOut: () => void;
  signingOut: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-3 rounded-xl px-2 py-2">
        <span
          aria-hidden="true"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-brand-400/25 bg-brand-500/15 font-display text-xs font-semibold text-ink"
        >
          {initials(user.full_name)}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{user.full_name}</span>
          <span className="block truncate text-xs text-ink-faint">{user.email}</span>
        </span>
      </div>

      <div className="mt-2 flex gap-2">
        <Link
          href="/"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-xs text-ink-muted transition-colors hover:text-ink"
        >
          <Icon name="ExternalLink" size={13} />
          Site
        </Link>
        <button
          type="button"
          onClick={onSignOut}
          disabled={signingOut}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-hairline px-3 py-2 text-xs text-ink-muted transition-colors hover:border-danger/30 hover:text-danger disabled:opacity-60"
        >
          <Icon name="LogOut" size={13} />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );
}
