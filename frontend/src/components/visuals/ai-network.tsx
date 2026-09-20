"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Interactive neural-network visual.
 *
 * Nodes near the pointer brighten and lift, and the edges between them gain
 * signal — the visual "attends" to where the user is looking. When there is no
 * pointer (touch, or the cursor is elsewhere) a focus point drifts slowly on
 * its own so the section is never inert. Under `prefers-reduced-motion` the
 * drift stops and the graph renders in a calm static state.
 *
 * Node positions are fixed constants rather than randomised, so the server and
 * client render identically and there is no hydration mismatch.
 */

const VIEW = 440;
const INFLUENCE = 132;

interface Node {
  x: number;
  y: number;
  r: number;
  /** Layer index, used only for colour banding. */
  layer: 0 | 1 | 2;
}

const NODES: Node[] = [
  { x: 58, y: 96, r: 5, layer: 0 },
  { x: 58, y: 176, r: 6.5, layer: 0 },
  { x: 58, y: 256, r: 5, layer: 0 },
  { x: 58, y: 336, r: 6, layer: 0 },

  { x: 168, y: 68, r: 6, layer: 1 },
  { x: 168, y: 148, r: 7.5, layer: 1 },
  { x: 168, y: 228, r: 6, layer: 1 },
  { x: 168, y: 308, r: 7, layer: 1 },
  { x: 168, y: 380, r: 5.5, layer: 1 },

  { x: 282, y: 104, r: 7, layer: 1 },
  { x: 282, y: 192, r: 6, layer: 1 },
  { x: 282, y: 272, r: 7.5, layer: 1 },
  { x: 282, y: 352, r: 6, layer: 1 },

  { x: 386, y: 152, r: 6.5, layer: 2 },
  { x: 386, y: 232, r: 9, layer: 2 },
  { x: 386, y: 312, r: 6.5, layer: 2 },
];

/** Edges between consecutive layers, precomputed once at module scope. */
const EDGES: [number, number][] = (() => {
  const layerOf = (index: number) =>
    index < 4 ? 0 : index < 9 ? 1 : index < 13 ? 2 : 3;
  const pairs: [number, number][] = [];
  NODES.forEach((_, i) => {
    NODES.forEach((__, j) => {
      if (layerOf(j) === layerOf(i) + 1) pairs.push([i, j]);
    });
  });
  return pairs;
})();

const LAYER_COLOUR = ["#22d3c5", "#8472fc", "#6d5dfb"] as const;

export function AiNetwork() {
  const reduce = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [focus, setFocus] = useState<{ x: number; y: number }>({ x: 230, y: 220 });

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    // Track the pointer in viewBox coordinates.
    const toViewBox = (clientX: number, clientY: number) => {
      const rect = svg.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) / rect.width) * VIEW,
        y: ((clientY - rect.top) / rect.height) * VIEW,
      };
    };

    const onPointerMove = (event: PointerEvent) => {
      pointer.current = toViewBox(event.clientX, event.clientY);
    };
    const onPointerLeave = () => {
      pointer.current = null;
    };

    svg.addEventListener("pointermove", onPointerMove);
    svg.addEventListener("pointerleave", onPointerLeave);

    if (reduce) {
      // Static, centred attention — no drift, no animation frames.
      setFocus({ x: 230, y: 220 });
      return () => {
        svg.removeEventListener("pointermove", onPointerMove);
        svg.removeEventListener("pointerleave", onPointerLeave);
      };
    }

    // One animation frame loop: eases toward the pointer, or toward a slow
    // Lissajous drift when the pointer is absent.
    let frame = 0;
    let current = { x: 230, y: 220 };
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const target =
        pointer.current ??
        {
          x: 220 + Math.sin(elapsed * 0.32) * 130,
          y: 220 + Math.cos(elapsed * 0.24) * 110,
        };

      current = {
        x: current.x + (target.x - current.x) * 0.08,
        y: current.y + (target.y - current.y) * 0.08,
      };
      setFocus({ x: Math.round(current.x * 10) / 10, y: Math.round(current.y * 10) / 10 });
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      svg.removeEventListener("pointermove", onPointerMove);
      svg.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reduce]);

  /** 0 → outside the field of attention, 1 → at its centre. */
  const attention = (x: number, y: number) => {
    const distance = Math.hypot(x - focus.x, y - focus.y);
    return Math.max(0, 1 - distance / INFLUENCE);
  };

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 rounded-panel opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(45% 45% at 40% 45%, rgba(109,93,251,0.22), transparent 70%), radial-gradient(40% 40% at 75% 65%, rgba(34,211,197,0.16), transparent 70%)",
        }}
      />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW} ${VIEW}`}
        className="h-auto w-full touch-none"
        role="img"
        aria-label="An interactive neural network diagram: nodes and connections brighten around the pointer."
      >
        <defs>
          <radialGradient id="ai-focus" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#6d5dfb" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#6d5dfb" stopOpacity="0" />
          </radialGradient>
          <pattern id="ai-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="1.2" cy="1.2" r="1.2" fill="#ffffff" fillOpacity="0.07" />
          </pattern>
        </defs>

        <rect width={VIEW} height={VIEW} fill="url(#ai-dots)" rx="16" />

        {/* The field of attention itself. */}
        <circle cx={focus.x} cy={focus.y} r={INFLUENCE} fill="url(#ai-focus)" />

        {/* Edges, brightened by the attention at their midpoint. */}
        <g>
          {EDGES.map(([from, to]) => {
            const a = NODES[from];
            const b = NODES[to];
            const weight = attention((a.x + b.x) / 2, (a.y + b.y) / 2);
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={weight > 0.35 ? "#22d3c5" : "#6d5dfb"}
                strokeOpacity={0.16 + weight * 0.46}
                strokeWidth={0.8 + weight * 1.4}
                style={{ transition: "stroke-opacity 120ms linear, stroke-width 120ms linear" }}
              />
            );
          })}
        </g>

        {/* Nodes. */}
        <g>
          {NODES.map((node, index) => {
            const weight = attention(node.x, node.y);
            const colour = LAYER_COLOUR[node.layer];
            return (
              <g key={index}>
                {weight > 0.15 ? (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.r + 7 * weight}
                    fill={colour}
                    fillOpacity={weight * 0.16}
                  />
                ) : null}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r + weight * 1.8}
                  fill="#0b1020"
                  stroke={colour}
                  strokeOpacity={0.5 + weight * 0.5}
                  strokeWidth={1.3 + weight * 0.8}
                  style={{ transition: "r 120ms linear, stroke-opacity 120ms linear" }}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
