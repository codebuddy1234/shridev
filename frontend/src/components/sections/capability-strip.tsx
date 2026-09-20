import { Shell } from "@/components/ui/shell";
import { Icon } from "@/components/ui/icon";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { capabilityStrip } from "@/content/company";

/**
 * Capability strip.
 *
 * Deliberately minimal: a quiet statement of range directly beneath the hero,
 * with no card treatment competing with the sections that follow.
 */
export function CapabilityStrip() {
  return (
    <section className="border-y border-hairline bg-surface/30">
      <Shell>
        <RevealGroup
          as="ul"
          className="grid grid-cols-2 gap-x-6 gap-y-5 py-8 sm:grid-cols-3 lg:grid-cols-6 lg:py-7"
        >
          {capabilityStrip.map((capability) => (
            <RevealItem
              as="li"
              key={capability.label}
              className="flex items-center gap-2.5 text-sm text-ink-muted"
            >
              <Icon name={capability.icon} size={17} className="shrink-0 text-accent-500/80" />
              <span className="leading-tight">{capability.label}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </Shell>
    </section>
  );
}
