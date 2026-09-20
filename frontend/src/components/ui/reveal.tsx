"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Section entrance animation.
 *
 * Deliberately restrained: a short fade with a small upward offset, played
 * once when the element scrolls into view. `useReducedMotion` collapses it to
 * a plain fade so the page stays usable for anyone who has asked for less
 * movement at the OS level.
 */

/**
 * React's DOM event handlers (onDrag, onAnimationStart, …) collide with Framer
 * Motion's same-named gesture and animation props, so they are omitted here.
 */
type MotionSafeHTMLProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  | "onDrag"
  | "onDragStart"
  | "onDragEnd"
  | "onDragEnter"
  | "onDragLeave"
  | "onDragOver"
  | "onDrop"
  | "onAnimationStart"
  | "onAnimationEnd"
  | "onAnimationIteration"
  | "onTransitionEnd"
  | "style"
>;

interface RevealProps extends MotionSafeHTMLProps {
  delay?: number;
  /** Distance travelled, in pixels. Keep small — this is a nudge, not a slide. */
  y?: number;
  as?: "div" | "section" | "li" | "ul" | "ol" | "article" | "header" | "aside" | "figure";
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 18,
  as = "div",
  ...props
}: RevealProps) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={cn(className)}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </Component>
  );
}

/** Parent that staggers its RevealItem children as the group enters view. */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  as = "div",
  ...props
}: Omit<RevealProps, "delay" | "y"> & { stagger?: number }) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: reduce ? 0 : stagger } },
  };

  return (
    <Component
      className={cn(className)}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  className,
  y = 16,
  as = "div",
  ...props
}: Omit<RevealProps, "delay">) {
  const reduce = useReducedMotion();
  const Component = motion[as];

  const item: Variants = {
    hidden: { opacity: 0, y: reduce ? 0 : y },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <Component className={cn(className)} variants={item} {...props}>
      {children}
    </Component>
  );
}
