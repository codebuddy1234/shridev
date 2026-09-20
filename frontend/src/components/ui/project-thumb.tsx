import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Project thumbnail.
 *
 * When a project has no uploaded image we render a deterministic abstract
 * composition derived from its slug rather than a broken image or a grey box —
 * so an unillustrated case study still looks intentional.
 */

function hash(input: string): number {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value * 31 + input.charCodeAt(i)) >>> 0;
  }
  return value;
}

export function ProjectThumb({
  src,
  alt,
  slug,
  className,
  priority,
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw",
}: {
  src: string | null;
  alt: string;
  slug: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-surface-2", className)}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover transition-transform duration-500 ease-[var(--ease-out-soft)] group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  const seed = hash(slug);
  const rotation = seed % 360;
  const offsetX = 25 + (seed % 40);
  const offsetY = 25 + ((seed >> 3) % 40);

  return (
    <div
      className={cn("relative overflow-hidden bg-surface-2", className)}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(${rotation}deg, rgba(109,93,251,0.30), rgba(34,211,197,0.16) 55%, transparent), radial-gradient(60% 60% at ${offsetX}% ${offsetY}%, rgba(132,114,252,0.35), transparent 70%)`,
        }}
      />
      <div className="bg-dotgrid absolute inset-0 opacity-60" />
      <svg
        viewBox="0 0 320 200"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="rgba(255,255,255,0.18)" strokeWidth="1" fill="none">
          <rect x={30 + (seed % 20)} y="44" width="120" height="76" rx="10" />
          <rect x={168 + ((seed >> 2) % 20)} y="70" width="94" height="62" rx="10" />
          <path d={`M150 82 C 166 82, 170 96, ${168 + ((seed >> 2) % 20)} 100`} />
        </g>
        <circle cx={44 + (seed % 20)} cy="58" r="2.5" fill="rgba(34,211,197,0.8)" />
        <circle cx={182 + ((seed >> 2) % 20)} cy="84" r="2.5" fill="rgba(132,114,252,0.9)" />
      </svg>
    </div>
  );
}
