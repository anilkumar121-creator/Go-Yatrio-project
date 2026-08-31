"use client";

import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE_OUT } from "@/components/animation/motion";

type HeroContentMotionProps = {
  eyebrow?: React.ReactNode;
  heading: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  searchArea?: React.ReactNode;
  isCentered?: boolean;
};

export function HeroContentMotion({
  eyebrow,
  heading,
  subtitle,
  actions,
  searchArea,
  isCentered = true,
}: HeroContentMotionProps) {
  const reduced = useReducedMotion();

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : 0.1,
        delayChildren: reduced ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: reduced ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: EASE_OUT },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={
        isCentered
          ? "flex flex-col items-center text-center w-full"
          : "flex flex-col items-start w-full"
      }
    >
      {eyebrow ? <motion.div variants={itemVariants}>{eyebrow}</motion.div> : null}
      <motion.div variants={itemVariants}>{heading}</motion.div>
      {subtitle ? <motion.div variants={itemVariants}>{subtitle}</motion.div> : null}
      {actions ? <motion.div variants={itemVariants}>{actions}</motion.div> : null}
      {searchArea ? (
        <motion.div variants={itemVariants} className="w-full">
          {searchArea}
        </motion.div>
      ) : null}
    </motion.div>
  );
}
