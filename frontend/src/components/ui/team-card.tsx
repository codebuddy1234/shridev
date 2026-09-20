import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { GithubIcon, LinkedInIcon } from "@/components/ui/brand-icons";
import { initials } from "@/lib/utils";
import type { TeamMember } from "@/types/api";

/**
 * Team member card.
 *
 * Falls back to an initials avatar when no photograph has been uploaded, so a
 * partially completed team page still looks deliberate.
 */
export function TeamCard({ member }: { member: TeamMember }) {
  return (
    <Card interactive className="group flex flex-col overflow-hidden p-7">
      <div className="flex items-center gap-4">
        {member.photo_url ? (
          <div className="relative size-16 shrink-0 overflow-hidden rounded-full border border-hairline-strong">
            <Image
              src={member.photo_url}
              alt={`${member.name}, ${member.role}`}
              fill
              sizes="64px"
              className="object-cover"
            />
          </div>
        ) : (
          <span
            aria-hidden="true"
            className="inline-flex size-16 shrink-0 items-center justify-center rounded-full border border-brand-400/25 bg-gradient-to-br from-brand-500/25 to-accent-500/15 font-display text-lg font-semibold text-ink"
          >
            {initials(member.name)}
          </span>
        )}

        <div className="min-w-0">
          <h3 className="truncate font-display text-lg font-medium text-ink">{member.name}</h3>
          <p className="mt-0.5 truncate text-sm text-accent-400">{member.role}</p>
        </div>
      </div>

      {member.bio ? (
        <p className="mt-6 flex-1 text-sm leading-relaxed text-ink-muted">{member.bio}</p>
      ) : (
        <div className="flex-1" />
      )}

      {member.github_url || member.linkedin_url ? (
        <ul className="mt-6 flex items-center gap-2 border-t border-hairline pt-5">
          {member.linkedin_url ? (
            <li>
              <a
                href={member.linkedin_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on LinkedIn`}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline text-ink-faint transition-colors hover:border-brand-400/40 hover:text-ink"
              >
                <LinkedInIcon size={15} />
              </a>
            </li>
          ) : null}
          {member.github_url ? (
            <li>
              <a
                href={member.github_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${member.name} on GitHub`}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-hairline text-ink-faint transition-colors hover:border-brand-400/40 hover:text-ink"
              >
                <GithubIcon size={15} />
              </a>
            </li>
          ) : null}
        </ul>
      ) : null}
    </Card>
  );
}

/** Placeholder card describing a role we staff, used when the roster is empty. */
export function RoleCard({ role, description }: { role: string; description: string }) {
  return (
    <div className="rounded-card border border-dashed border-hairline-strong bg-surface/40 p-7">
      <span className="inline-flex size-11 items-center justify-center rounded-xl border border-hairline bg-white/[0.03] text-ink-faint">
        <Icon name="User" size={19} />
      </span>
      <h3 className="mt-6 font-display text-base font-medium text-ink">{role}</h3>
      <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">{description}</p>
    </div>
  );
}
