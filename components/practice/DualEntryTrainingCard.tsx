"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import "./DualEntryTrainingCard.css";

const RULES_TOPICS = [
  "基础规则",
  "牌型介绍",
  "出牌流程",
  "进贡还贡",
  "升级规则",
  "特殊情况讲解"
] as const;

const MEMORY_TOPICS = [
  "记鬼牌",
  "记级牌",
  "A/K/Q 关键牌",
  "剩余牌推算",
  "局势分析",
  "实战记牌训练"
] as const;

interface DualEntryTrainingCardProps {
  memoryHref?: string;
  onMemoryClick?: () => void;
  onRulesClick?: () => void;
  rulesHref?: string;
}

function PanelTrigger({
  children,
  className,
  href,
  onClick
}: {
  children: ReactNode;
  className: string;
  href?: string;
  onClick?: () => void;
}) {
  if (onClick) {
    return (
      <button className={className} onClick={onClick} type="button">
        {children}
      </button>
    );
  }

  return (
    <Link className={className} href={href ?? "#"}>
      {children}
    </Link>
  );
}

function NeuralBackdrop() {
  return (
    <svg aria-hidden="true" className="dual-entry-card__neural" viewBox="0 0 320 200">
      <path className="dual-entry-card__neural-line" d="M28 148 C72 118, 108 168, 148 126" />
      <path className="dual-entry-card__neural-line" d="M148 126 C188 88, 214 132, 252 96" />
      <path className="dual-entry-card__neural-line" d="M72 72 C108 54, 142 88, 176 62" />
      <path className="dual-entry-card__neural-line" d="M176 62 C214 38, 246 72, 286 48" />
      <circle className="dual-entry-card__neural-node" cx="28" cy="148" r="3.5" />
      <circle className="dual-entry-card__neural-node" cx="148" cy="126" r="3.5" />
      <circle className="dual-entry-card__neural-node" cx="252" cy="96" r="3.5" />
      <circle className="dual-entry-card__neural-node" cx="72" cy="72" r="3" />
      <circle className="dual-entry-card__neural-node" cx="176" cy="62" r="3" />
      <circle className="dual-entry-card__neural-node" cx="286" cy="48" r="3" />
    </svg>
  );
}

export function DualEntryTrainingCard({
  memoryHref = "/training/memory-methods",
  onMemoryClick,
  onRulesClick,
  rulesHref = "/training/memory-methods"
}: DualEntryTrainingCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      className="dual-entry-card"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
    >
      <div className="dual-entry-card__panels">
        <motion.div
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="dual-entry-card__panel dual-entry-card__panel--rules"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          transition={{ delay: 0, duration: 0.55, ease: "easeOut" }}
        >
          <div aria-hidden="true" className="dual-entry-card__panel-bg" />
          <div aria-hidden="true" className="dual-entry-card__panel-glow" />
          <PanelTrigger className="dual-entry-card__panel-link" href={rulesHref} onClick={onRulesClick}>
            <span className="dual-entry-card__icon">
              <span className="material-symbols-outlined text-[24px]">menu_book</span>
            </span>
            <h2 className="dual-entry-card__title">掼蛋规则</h2>
            <p className="dual-entry-card__subtitle">从零快速掌握所有规则</p>
            <ul className="dual-entry-card__list">
              {RULES_TOPICS.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
            <span className="dual-entry-card__cta dual-entry-card__cta--rules">
              开始学习
              <span aria-hidden="true">→</span>
            </span>
          </PanelTrigger>
        </motion.div>

        <div aria-hidden="true" className="dual-entry-card__divider" />

        <motion.div
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          className="dual-entry-card__panel dual-entry-card__panel--memory"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          transition={{ delay: 0.12, duration: 0.55, ease: "easeOut" }}
        >
          <div aria-hidden="true" className="dual-entry-card__panel-bg" />
          <div aria-hidden="true" className="dual-entry-card__panel-glow" />
          <NeuralBackdrop />
          <span aria-hidden="true" className="dual-entry-card__float-digit dual-entry-card__float-digit--a">
            A
          </span>
          <span aria-hidden="true" className="dual-entry-card__float-digit dual-entry-card__float-digit--b">
            K
          </span>
          <span aria-hidden="true" className="dual-entry-card__float-digit dual-entry-card__float-digit--c">
            Q
          </span>
          <PanelTrigger className="dual-entry-card__panel-link" href={memoryHref} onClick={onMemoryClick}>
            <span className="dual-entry-card__icon">
              <span className="material-symbols-outlined text-[24px]">neurology</span>
            </span>
            <h2 className="dual-entry-card__title">记牌方法论</h2>
            <p className="dual-entry-card__subtitle">建立完整记牌体系</p>
            <ul className="dual-entry-card__list">
              {MEMORY_TOPICS.map((topic) => (
                <li key={topic}>{topic}</li>
              ))}
            </ul>
            <span className="dual-entry-card__cta dual-entry-card__cta--memory">
              开始训练
              <span aria-hidden="true">→</span>
            </span>
          </PanelTrigger>
        </motion.div>
      </div>
    </motion.article>
  );
}
