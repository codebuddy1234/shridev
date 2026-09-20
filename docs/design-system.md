# Design system

Tokens are defined once in `frontend/src/app/globals.css` under Tailwind v4's
`@theme`, and consumed through a small set of primitives. The goal is that
roughly thirty pages look like one product without anybody policing it.

---

## Identity

ShriDev's visual language is **near-black, violet-led, teal-accented**.

It was built to be distinct from the reference site that informed the
information architecture: that site is navy-blue with bright cyan as its
primary action colour. Here the canvas is nearly black, the primary action is
violet, and teal appears only as a secondary accent — on eyebrows, links,
confirmations and the AI visuals.

---

## Colour

```css
/* Surfaces — four steps of elevation, not arbitrary greys */
--color-canvas:     #070a12;   /* page background */
--color-surface:    #0d1220;   /* cards, panels */
--color-surface-2:  #121a2c;   /* inputs, raised cards */
--color-surface-3:  #18223a;   /* highest elevation */

/* Text — three levels only */
--color-ink:        #f8fafc;   /* headings, primary */
--color-ink-muted:  #a7b0c0;   /* body */
--color-ink-faint:  #8792a5;   /* captions, metadata */

/* Brand — violet, the primary action colour */
--color-brand-500:  #6d5dfb;   /* 50–900 available */

/* Accent — teal, secondary only */
--color-accent-500: #22d3c5;   /* 300–700 available */

/* Status */
--color-positive:   #34d399;
--color-warning:    #fbbf24;
--color-danger:     #f87171;
--color-info:       #60a5fa;

/* Hairlines — borders are almost always one of these two */
--color-hairline:        rgba(255, 255, 255, 0.08);
--color-hairline-strong: rgba(255, 255, 255, 0.14);
```

### Contrast

Every text token clears WCAG AA (4.5:1) against **every** surface token:

| Token | Worst case (on `surface-3`) |
| --- | --- |
| `ink` | 15.11:1 |
| `ink-muted` | 7.24:1 |
| `ink-faint` | 5.03:1 |
| `accent-500` | 8.42:1 |
| `brand-200` | 8.62:1 |

`ink-faint` was originally `#6b7688`, which measured 4.31:1 on the canvas and
3.44:1 on `surface-3` — it failed AA on 137 elements. The current value is the
result of that audit, and is the floor: anything dimmer fails.

If you add a text colour, check it against `surface-3`, not the canvas.

### Gradients

Used sparingly and only in four places: the hero headline accent, CTA band
washes, AI section highlights, and background lighting. Never on body text,
cards or buttons. Overuse is what makes a dark theme look like a template.

---

## Typography

| Family | Variable | Used for |
| --- | --- | --- |
| **Sora** | `--font-display` | Headings, buttons, numerals |
| **Inter** | `--font-sans` | Body text, UI |
| **JetBrains Mono** | `--font-mono` | Technology tags, code, indices, status values |

All three are self-hosted by `next/font` at build time: no third-party request,
no layout shift, `display: swap`.

### Scale

```css
--text-display-1: clamp(2.75rem, 1.6rem + 4.6vw, 5rem);    /* page h1 */
--text-display-2: clamp(2.25rem, 1.5rem + 3.1vw, 3.5rem);  /* section h2 */
--text-display-3: clamp(1.75rem, 1.35rem + 1.7vw, 2.5rem); /* sub-section */
```

Fluid via `clamp()` rather than breakpoint jumps, so headings scale smoothly
between 320px and 1920px with no awkward intermediate sizes. Each carries its
own tightened line-height and negative letter-spacing — display type needs both.

Body text uses standard Tailwind sizes. Headings get `text-wrap: balance`,
paragraphs `text-wrap: pretty`.

---

## Spacing and layout

```css
--container-shell: 76rem;   /* 1216px measure */
```

- **`.shell`** — the container. Gutters step 1.25rem → 2rem → 2.5rem. Every
  full-width section puts its content inside one, which is what keeps the
  measure identical site-wide.
- **`.section`** — `clamp(4rem, 2.5rem + 6vw, 7.5rem)` vertical rhythm.
- **`.section-tight`** — `clamp(3rem, 2rem + 4vw, 5rem)` for denser bands.

Grid gaps are 5 (`1.25rem`) for cards and 8–20 for major columns. Bordered
grids use `gap-px` over a `bg-hairline` parent — one hairline between cells
instead of doubled borders.

---

## Radii and elevation

```css
--radius-card:  1rem;      /* cards, inputs (rounded-xl) */
--radius-panel: 1.5rem;    /* large panels, modals, CTA bands */
```

Buttons and badges are fully rounded (`rounded-full`). Elevation comes from
three shadow tokens (`soft`, `lift`, `glow`); most surfaces use a hairline
border instead, which reads cleaner on a dark canvas than a drop shadow.

---

## Components

Located in `src/components/ui/`.

| Component | Notes |
| --- | --- |
| `Button` / `ButtonLink` | `primary` · `secondary` · `accent` · `ghost` · `link` · `danger`, in four sizes |
| `Shell` / `Section` / `Divider` | Layout containers |
| `Card` / `IconTile` / `Panel` | Surfaces; `interactive` adds the shared hover treatment |
| `Badge` / `Eyebrow` | Status pills, technology tags, section labels |
| `SectionHeader` | Eyebrow + title + description + optional action |
| `PageHeader` | H1 + breadcrumbs + actions for interior pages |
| `Field` / `Input` / `Textarea` / `Select` | Owns label, hint, error and ARIA wiring |
| `FaqAccordion` | Radix accordion + Framer Motion height |
| `Modal` | Radix dialog: focus trap, scroll lock, Escape |
| `LoadingState` / `EmptyState` / `ErrorState` / `Skeleton` | Every data surface renders one |
| `Reveal` / `RevealGroup` / `RevealItem` | Entrance animation |
| `ServiceCard` / `ProjectCard` / `PostCard` / `TeamCard` | Domain cards |

### CTA hierarchy

One `primary` per section, at most. `secondary` for the supporting action,
`ghost` or `link` for tertiary navigation. Five competing buttons in one band
is the fastest way to make a page look amateur.

### Native selects

The form uses a native `<select>` rather than a custom listbox. It is keyboard
and screen-reader correct by default, and on mobile it opens the platform
picker — which is a markedly better experience on a form this long.

---

## Motion

Framer Motion, used with restraint. Premium interfaces feel calm.

| Pattern | Treatment |
| --- | --- |
| Section entrance | Fade + 16–18px rise, 0.5–0.55s, once, on scroll into view |
| Staggered groups | 0.07s between children |
| Hover | 200–300ms colour, 1px lift, arrow nudge |
| Navbar | Height and blur transition on scroll |
| Accordion | Height + opacity, 0.3s |
| Page visuals | Slow float (7–9s), drifting particles, data-flow pulses |

Standard easing is `cubic-bezier(0.22, 1, 0.36, 1)`.

Avoided entirely: bouncing, particle bursts, infinite attention-seeking loops,
parallax on scroll, and animating everything on the page.

### Reduced motion

Three layers, because one is not enough:

1. `useReducedMotion()` collapses Framer animations to plain fades.
2. A CSS block neutralises any remaining animation and transition.
3. Pointer-driven effects (hero parallax, AI network drift) are skipped
   entirely rather than merely shortened.

Verified: with `prefers-reduced-motion: reduce`, zero elements are still
running a CSS animation and all content is fully visible.

---

## Accessibility rules

- One `h1` per page; heading levels never skip. `EmptyState` and `ErrorState`
  take an `as` prop for exactly this reason.
- A single `:focus-visible` treatment — a 2px `accent-500` ring at 2px offset —
  verified on every interactive element.
- Colour never carries meaning alone; status always pairs with an icon or text.
- Form errors are wired through `aria-describedby` and `aria-invalid`, and the
  first invalid control receives focus on failed submit.
- Decorative visuals are `aria-hidden`; meaningful ones carry `role="img"` and
  a description.
- Every interactive surface is keyboard reachable, with arrow-key support on
  the process timeline (a real tablist) and the FAQ accordion.

Verified with `@axe-core/playwright` across all public and admin routes: zero
violations under WCAG 2.1 A/AA plus best-practice rules.

---

## Extending the system

**Adding a token.** Add it to `@theme` in `globals.css` — **and register it in
`lib/utils.ts`**. `tailwind-merge` cannot tell a custom font-size token from a
custom colour token; without registration, `cn("text-display-2", "text-ink")`
collapses to `text-ink` and silently drops the size. That bug removed the size
from every section heading on the site before it was caught.

**Adding a component.** Compose from existing primitives before writing new
styles. If you find yourself repeating a class string three times, it belongs
in `ui/`.

**Adding a page.** Use `PageHeader` for the H1 and breadcrumbs, `Section` +
`Shell` for each band, and `SectionHeader` for each band's heading. Following
that pattern is what makes a new page look like it was always there.

**Adding an icon.** Add it to the registry in `ui/icon.tsx`. Content modules
reference icons by name, and the static map is what keeps tree-shaking
effective — `import * as lucide` would pull the entire icon library into the
bundle.
