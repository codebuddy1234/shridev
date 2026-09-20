"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/**
 * Hero visual.
 *
 * An original abstract composition representing what we build: a product
 * surface (the dashboard panel), the API carrying data between systems, and a
 * model inferring from it. Drawn as a single SVG so it scales perfectly from
 * 320px to 1920px with no layout shift and no raster asset to download.
 *
 * Motion is deliberately slow and low-contrast — a sense of a live system,
 * not a screensaver. Everything stops under `prefers-reduced-motion`.
 */

const VIEW_W = 560;
const VIEW_H = 470;

export function HeroVisual() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  // Very small pointer parallax. Skipped entirely for reduced motion and never
  // attached on touch devices, where there is no hover pointer to track.
  useEffect(() => {
    if (reduce) return;
    const node = containerRef.current;
    if (!node) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    const onPointerMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const relX = (event.clientX - rect.left) / rect.width - 0.5;
        const relY = (event.clientY - rect.top) / rect.height - 0.5;
        setParallax({ x: relX * 14, y: relY * 10 });
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(frame);
      setParallax({ x: 0, y: 0 });
    };

    node.addEventListener("pointermove", onPointerMove);
    node.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      node.removeEventListener("pointermove", onPointerMove);
      node.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  /** Gentle float applied to the secondary panels. */
  const float = (distance: number, duration: number, delay = 0) =>
    reduce
      ? {}
      : {
          animate: { y: [0, -distance, 0] },
          transition: { duration, delay, repeat: Infinity, ease: "easeInOut" as const },
        };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Ambient brand light behind the composition. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[120%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(45% 45% at 55% 40%, rgba(109,93,251,0.30), transparent 70%), radial-gradient(35% 35% at 30% 75%, rgba(34,211,197,0.18), transparent 70%)",
        }}
      />

      <motion.svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-auto w-full overflow-visible"
        role="img"
        aria-labelledby="hero-visual-title hero-visual-desc"
        animate={{ x: parallax.x * 0.4, y: parallax.y * 0.4 }}
        transition={{ type: "spring", stiffness: 60, damping: 18 }}
      >
        <title id="hero-visual-title">ShriDev product engineering</title>
        <desc id="hero-visual-desc">
          An abstract diagram of a product interface, an API carrying data between
          systems, and a machine learning model producing a prediction.
        </desc>

        <defs>
          <linearGradient id="hv-panel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#151d33" stopOpacity="0.96" />
            <stop offset="100%" stopColor="#0c1120" stopOpacity="0.96" />
          </linearGradient>
          <linearGradient id="hv-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.16" />
            <stop offset="55%" stopColor="#6d5dfb" stopOpacity="0.26" />
            <stop offset="100%" stopColor="#22d3c5" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="hv-spark" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6d5dfb" />
            <stop offset="100%" stopColor="#22d3c5" />
          </linearGradient>
          <linearGradient id="hv-sparkfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6d5dfb" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#6d5dfb" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="hv-bar" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#6d5dfb" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#8472fc" stopOpacity="0.95" />
          </linearGradient>

          <pattern id="hv-grid" width="28" height="28" patternUnits="userSpaceOnUse">
            <path d="M28 0H0V28" fill="none" stroke="#ffffff" strokeOpacity="0.045" strokeWidth="1" />
          </pattern>

          <radialGradient id="hv-gridfade" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="hv-gridmask">
            <rect width={VIEW_W} height={VIEW_H} fill="url(#hv-gridfade)" />
          </mask>
        </defs>

        {/* Grid, faded toward the edges so it never forms a hard box. */}
        <rect width={VIEW_W} height={VIEW_H} fill="url(#hv-grid)" mask="url(#hv-gridmask)" />

        {/* ---- Data flow: API panel → product panel → model panel ---- */}
        <g fill="none" strokeWidth="1.25">
          <path
            d="M148 352 C 148 320, 132 312, 132 282"
            stroke="#22d3c5"
            strokeOpacity="0.28"
            strokeDasharray="3 5"
          />
          <path
            d="M372 178 C 410 178, 416 206, 428 226"
            stroke="#6d5dfb"
            strokeOpacity="0.32"
            strokeDasharray="3 5"
          />
          {!reduce ? (
            <>
              <motion.circle
                r="2.6"
                fill="#22d3c5"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.8 }}
                style={{ offsetPath: 'path("M148 352 C 148 320, 132 312, 132 282")' }}
              />
              <motion.circle
                r="2.6"
                fill="#8472fc"
                initial={{ offsetDistance: "0%" }}
                animate={{ offsetDistance: "100%" }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 1.1,
                  delay: 1.4,
                }}
                style={{ offsetPath: 'path("M372 178 C 410 178, 416 206, 428 226")' }}
              />
            </>
          ) : null}
        </g>

        {/* ================= Product panel ================= */}
        <motion.g
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <g transform={`translate(${parallax.x * 0.25} ${parallax.y * 0.25})`}>
            <rect
              x="62"
              y="62"
              width="310"
              height="220"
              rx="15"
              fill="url(#hv-panel)"
              stroke="url(#hv-stroke)"
              strokeWidth="1.25"
            />
            {/* Window chrome */}
            <g>
              <circle cx="84" cy="83" r="3.5" fill="#f87171" fillOpacity="0.55" />
              <circle cx="96" cy="83" r="3.5" fill="#fbbf24" fillOpacity="0.55" />
              <circle cx="108" cy="83" r="3.5" fill="#34d399" fillOpacity="0.55" />
              <rect x="126" y="78" width="88" height="10" rx="5" fill="#ffffff" fillOpacity="0.07" />
              <rect x="324" y="77" width="30" height="12" rx="6" fill="#22d3c5" fillOpacity="0.14" />
              <circle cx="331" cy="83" r="2.4" fill="#22d3c5" />
            </g>
            <line x1="62" y1="102" x2="372" y2="102" stroke="#ffffff" strokeOpacity="0.07" />

            {/* Sparkline with an area fill, drawn in once on load */}
            <g transform="translate(84 118)">
              <motion.path
                d="M0 66 L26 52 L52 58 L78 34 L104 41 L130 20 L156 26 L182 6"
                fill="none"
                stroke="url(#hv-spark)"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.path
                d="M0 66 L26 52 L52 58 L78 34 L104 41 L130 20 L156 26 L182 6 L182 80 L0 80 Z"
                fill="url(#hv-sparkfill)"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 1.2 }}
              />
              {/* Live point at the leading edge */}
              <motion.circle
                cx="182"
                cy="6"
                r="3.4"
                fill="#22d3c5"
                initial={{ opacity: 0 }}
                animate={reduce ? { opacity: 1 } : { opacity: [0.45, 1, 0.45] }}
                transition={
                  reduce
                    ? { delay: 1.6 }
                    : { duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 1.6 }
                }
              />
            </g>

            {/* Metric bars */}
            <g transform="translate(286 128)">
              {[30, 46, 22, 58].map((height, index) => (
                <motion.rect
                  key={index}
                  x={index * 16}
                  y={62 - height}
                  width="9"
                  height={height}
                  rx="3"
                  fill="url(#hv-bar)"
                  initial={reduce ? { scaleY: 1 } : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  style={{ transformOrigin: `${index * 16 + 4.5}px 62px` }}
                  transition={{ duration: 0.6, delay: 0.7 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                />
              ))}
            </g>

            {/* Record rows: the operational data behind the chart */}
            <g transform="translate(84 216)">
              {[0, 1, 2].map((row) => (
                <g key={row} transform={`translate(0 ${row * 18})`}>
                  <rect width="7" height="7" rx="2" fill="#6d5dfb" fillOpacity={0.9 - row * 0.22} />
                  <rect x="16" y="1" width={116 - row * 22} height="5" rx="2.5" fill="#ffffff" fillOpacity="0.14" />
                  <rect x="200" y="1" width={54 - row * 10} height="5" rx="2.5" fill="#ffffff" fillOpacity="0.08" />
                </g>
              ))}
            </g>
          </g>
        </motion.g>

        {/* ================= API panel ================= */}
        <motion.g
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.g {...float(6, 7.5, 0.4)}>
            <rect
              x="22"
              y="330"
              width="252"
              height="106"
              rx="14"
              fill="url(#hv-panel)"
              stroke="url(#hv-stroke)"
              strokeWidth="1.25"
            />
            <text
              x="42"
              y="360"
              fontFamily="var(--font-mono), monospace"
              fontSize="11.5"
              fill="#a7b0c0"
            >
              POST /api/enquiries
            </text>
            <rect x="42" y="372" width="150" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.12" />
            <rect x="42" y="384" width="112" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.09" />
            <rect x="42" y="396" width="134" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.07" />

            <rect x="42" y="410" width="60" height="15" rx="7.5" fill="#34d399" fillOpacity="0.14" />
            <circle cx="52" cy="417.5" r="2.6" fill="#34d399" />
            <text
              x="60"
              y="421"
              fontFamily="var(--font-mono), monospace"
              fontSize="9.5"
              fill="#34d399"
            >
              201
            </text>
            <text
              x="116"
              y="421"
              fontFamily="var(--font-mono), monospace"
              fontSize="9.5"
              fill="#8792a5"
            >
              validated
            </text>
          </motion.g>
        </motion.g>

        {/* ================= Model panel ================= */}
        <motion.g
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.g {...float(8, 9, 0)}>
            <g transform={`translate(${parallax.x * 0.6} ${parallax.y * 0.6})`}>
              <rect
                x="352"
                y="214"
                width="192"
                height="188"
                rx="14"
                fill="url(#hv-panel)"
                stroke="url(#hv-stroke)"
                strokeWidth="1.25"
              />
              <text
                x="372"
                y="240"
                fontFamily="var(--font-mono), monospace"
                fontSize="10"
                fill="#8792a5"
                letterSpacing="1.4"
              >
                MODEL
              </text>

              <NodeGraph reduce={Boolean(reduce)} />

              <line x1="352" y1="358" x2="544" y2="358" stroke="#ffffff" strokeOpacity="0.07" />
              <text
                x="372"
                y="379"
                fontFamily="var(--font-mono), monospace"
                fontSize="10.5"
                fill="#a7b0c0"
              >
                confidence
              </text>
              <rect x="372" y="386" width="152" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.08" />
              <motion.rect
                x="372"
                y="386"
                height="5"
                rx="2.5"
                fill="url(#hv-spark)"
                initial={{ width: 0 }}
                animate={{ width: 118 }}
                transition={{ duration: 1.3, delay: 1, ease: [0.22, 1, 0.36, 1] }}
              />
            </g>
          </motion.g>
        </motion.g>

        {/* Drifting particles — sparse, slow and low contrast. */}
        {!reduce
          ? [
              { cx: 36, cy: 150, r: 1.8, d: 9, delay: 0 },
              { cx: 470, cy: 96, r: 2.2, d: 11, delay: 1.2 },
              { cx: 520, cy: 160, r: 1.5, d: 8, delay: 2.1 },
              { cx: 300, cy: 424, r: 1.8, d: 10, delay: 0.7 },
              { cx: 404, cy: 56, r: 1.5, d: 12, delay: 1.8 },
            ].map((particle, index) => (
              <motion.circle
                key={index}
                cx={particle.cx}
                cy={particle.cy}
                r={particle.r}
                fill={index % 2 === 0 ? "#6d5dfb" : "#22d3c5"}
                initial={{ opacity: 0.2 }}
                animate={{ y: [0, -particle.d, 0], opacity: [0.2, 0.6, 0.2] }}
                transition={{
                  duration: 7 + index,
                  delay: particle.delay,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            ))
          : null}
      </motion.svg>
    </div>
  );
}

/** Small inference graph: inputs fan into a hidden layer and out to one result. */
function NodeGraph({ reduce }: { reduce: boolean }) {
  const inputs = [268, 292, 316];
  const hidden = [262, 290, 318];
  const output = 290;

  return (
    <g>
      {/* Edges */}
      <g stroke="#6d5dfb" strokeOpacity="0.3" strokeWidth="1">
        {inputs.map((y1) =>
          hidden.map((y2) => <line key={`${y1}-${y2}`} x1="392" y1={y1} x2="458" y2={y2} />),
        )}
        {hidden.map((y1) => (
          <line key={`out-${y1}`} x1="458" y1={y1} x2="518" y2={output} strokeOpacity="0.42" />
        ))}
      </g>

      {/* Input nodes */}
      {inputs.map((cy, index) => (
        <motion.circle
          key={`in-${cy}`}
          cx="392"
          cy={cy}
          r="5"
          fill="#0d1220"
          stroke="#22d3c5"
          strokeWidth="1.5"
          initial={{ opacity: 0.6 }}
          animate={reduce ? { opacity: 1 } : { opacity: [0.55, 1, 0.55] }}
          transition={
            reduce ? {} : { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.4 }
          }
        />
      ))}

      {/* Hidden layer */}
      {hidden.map((cy, index) => (
        <motion.circle
          key={`hid-${cy}`}
          cx="458"
          cy={cy}
          r="6"
          fill="#0d1220"
          stroke="#8472fc"
          strokeWidth="1.5"
          initial={{ opacity: 0.6 }}
          animate={reduce ? { opacity: 1 } : { opacity: [0.6, 1, 0.6] }}
          transition={
            reduce
              ? {}
              : { duration: 3.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 + index * 0.4 }
          }
        />
      ))}

      {/* Output */}
      <circle cx="518" cy={output} r="7.5" fill="#6d5dfb" fillOpacity="0.2" stroke="#6d5dfb" strokeWidth="1.6" />
      {!reduce ? (
        <motion.circle
          cx="518"
          cy={output}
          r="7.5"
          fill="none"
          stroke="#22d3c5"
          strokeWidth="1.2"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: [1, 1.9], opacity: [0.7, 0] }}
          style={{ transformOrigin: `518px ${output}px` }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut", repeatDelay: 0.7 }}
        />
      ) : null}
    </g>
  );
}
