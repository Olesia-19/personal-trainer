"use client";

import { useEffect, useRef } from "react";
import styles from "./StatStrip.module.css";

const COUNT_DURATION_MS = 1200;
const VISIBILITY_RATIO = 0.4;

const STATS = [
  {
    target: 9,
    suffix: " yrs",
    label: "in personal coaching practice",
  },
  {
    target: 420,
    suffix: "+",
    label: "clients coached since 2017",
  },
  {
    target: 92,
    suffix: "%",
    label: "still training after 12 months",
  },
  {
    target: 45,
    suffix: "+",
    label: "years — a client age we specialize in",
  },
] as const;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

const StatStrip = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const countRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const setFinalValues = () => {
      STATS.forEach((stat, index) => {
        const el = countRefs.current[index];
        if (el) el.textContent = String(stat.target);
      });
    };

    if (prefersReducedMotion()) {
      setFinalValues();
      return;
    }

    let rafId = 0;
    let hasAnimated = false;

    const animateCounts = () => {
      if (hasAnimated) return;
      hasAnimated = true;

      const start = performance.now();

      const tick = (now: number) => {
        const elapsed = now - start;
        const progress = Math.min(elapsed / COUNT_DURATION_MS, 1);
        const eased = easeOutCubic(progress);

        STATS.forEach((stat, index) => {
          const el = countRefs.current[index];
          if (!el) return;
          el.textContent = String(Math.round(stat.target * eased));
        });

        if (progress < 1) {
          rafId = window.requestAnimationFrame(tick);
        } else {
          setFinalValues();
        }
      };

      rafId = window.requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          animateCounts();
          observer.disconnect();
        }
      },
      { threshold: VISIBILITY_RATIO },
    );

    observer.observe(section);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={styles.section}
      aria-label="Practice statistics"
    >
      <div className="container">
        <div className={styles.grid}>
          {STATS.map((stat, index) => (
            <div key={stat.label} className={styles.stat}>
              <b className={styles.value}>
                <span
                  ref={(el) => {
                    countRefs.current[index] = el;
                  }}
                  className={styles.count}
                  data-target={stat.target}
                >
                  0
                </span>
                {stat.suffix}
              </b>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatStrip;
