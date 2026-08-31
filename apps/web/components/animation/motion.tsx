"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export const MotionDiv = motion.div;
export const MotionSection = motion.section;

export const DURATION_FAST = 0.2;
export const DURATION_NORMAL = 0.35;
export const DURATION_SLOW = 0.5;

// Premium cubic-bezier easing for smooth travel-grade feel
export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_SMOOTH: [number, number, number, number] = [0.16, 1, 0.3, 1];

export type MotionBoxProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
};

export type StaggerProps = MotionBoxProps & {
  stagger?: number;
};

function viewportConfig() {
  return { once: true, margin: "-40px" } as const;
}

/**
 * Fade in opacity gently
 */
export function FadeIn({
  children,
  delay = 0,
  duration = DURATION_NORMAL,
  className,
}: MotionBoxProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={viewportConfig()}
      transition={{ duration: reduced ? 0 : duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Subtle upward reveal with GPU-friendly translateY
 */
export function FadeUp({
  children,
  delay = 0,
  duration = DURATION_NORMAL,
  className,
}: MotionBoxProps) {
  const reduced = useReducedMotion();
  const distance = reduced ? 0 : 16;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportConfig()}
      transition={{ duration: reduced ? 0 : duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Subtle downward reveal
 */
export function FadeDown({
  children,
  delay = 0,
  duration = DURATION_NORMAL,
  className,
}: MotionBoxProps) {
  const reduced = useReducedMotion();
  const distance = reduced ? 0 : -16;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportConfig()}
      transition={{ duration: reduced ? 0 : duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Subtle scale-in reveal
 */
export function ScaleIn({
  children,
  delay = 0,
  duration = DURATION_NORMAL,
  className,
}: MotionBoxProps) {
  const reduced = useReducedMotion();
  const scale = reduced ? 1 : 0.96;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={viewportConfig()}
      transition={{ duration: reduced ? 0 : duration, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Stagger container orchestrating child StaggerItem entrances
 */
export function Stagger({ children, delay = 0, stagger = 0.08, className }: StaggerProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={viewportConfig()}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: reduced ? 0 : stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Child item inside a Stagger container
 */
export function StaggerItem({ children, className }: Omit<MotionBoxProps, "delay" | "duration">) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION_NORMAL, ease: EASE_OUT },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// Aliases for clear semantic terminology
export const StaggerContainer = Stagger;

/**
 * Animated Section wrapper that fades up smoothly when scrolled into view
 */
export function AnimatedSection({
  children,
  delay = 0,
  duration = DURATION_SLOW,
  className,
}: MotionBoxProps) {
  const reduced = useReducedMotion();
  const distance = reduced ? 0 : 20;

  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={viewportConfig()}
      transition={{ duration: reduced ? 0 : duration, delay, ease: EASE_SMOOTH }}
    >
      {children}
    </motion.section>
  );
}

/**
 * Micro-interaction container for cards and interactive tiles
 * Applies GPU-accelerated lift on hover
 */
export function HoverLift({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ duration: DURATION_FAST, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}
