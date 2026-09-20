import Link from "next/link";
import { Card, IconTile } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import type { Service } from "@/content/services";

/**
 * Service card used on the homepage grid and the services index.
 *
 * The whole card is a link target via a stretched overlay, so the click area
 * matches the visual card while the accessible name still comes from the
 * single anchor.
 */
export function ServiceCard({ service }: { service: Service }) {
  return (
    <Card interactive className="group flex flex-col p-7">
      <div className="flex items-start justify-between gap-4">
        <IconTile>
          <Icon name={service.icon} size={21} />
        </IconTile>
        <span className="font-mono text-xs tracking-widest text-ink-faint transition-colors duration-300 group-hover:text-brand-300">
          {service.index}
        </span>
      </div>

      <h3 className="mt-6 font-display text-lg font-medium text-ink">
        <Link href={`/services/${service.slug}`} className="outline-none">
          {/* Stretched hit area — keeps one anchor per card for screen readers. */}
          <span className="absolute inset-0" aria-hidden="true" />
          {service.name}
        </Link>
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">{service.summary}</p>

      <ul className="mt-6 flex flex-wrap gap-1.5">
        {service.tags.slice(0, 4).map((tag) => (
          <li key={tag}>
            <Badge variant="tech" size="sm">
              {tag}
            </Badge>
          </li>
        ))}
      </ul>

      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-accent-400 transition-colors duration-200 group-hover:text-accent-300">
        Explore Service
        <Icon
          name="ArrowRight"
          size={15}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </span>
    </Card>
  );
}
