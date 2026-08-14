"use client";

import { motion, useReducedMotion } from "framer-motion";

export const MotionDiv = motion.div;

const DURATION = 0.3;
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type MotionBoxProps = {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
};

type StaggerProps = MotionBoxProps & {
  stagger?: number;
};

function viewportConfig() {
  return { once: true, margin: "-40px" } as const;
}

export function FadeIn({
  children,
  delay = 0,
  duration = DURATION,
  className,
}: MotionBoxProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={viewportConfig()}
      transition={{ duration: reduced ? 0 : duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function FadeUp({
  children,
  delay = 0,
  duration = DURATION,
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
      transition={{ duration: reduced ? 0 : duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function FadeDown({
  children,
  delay = 0,
  duration = DURATION,
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
      transition={{ duration: reduced ? 0 : duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  delay = 0,
  duration = DURATION,
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
      transition={{ duration: reduced ? 0 : duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function Stagger({
  children,
  delay = 0,
  stagger = 0.08,
  className,
}: StaggerProps) {
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

export function StaggerItem({
  children,
  className,
}: Omit<MotionBoxProps, "delay" | "duration">) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: reduced ? 0 : 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DURATION, ease: EASE },
        },
      }}
    >
      {children}
    </motion.div>
  );
}