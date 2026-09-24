"use client";

import { Fraunces, Inter } from "next/font/google";
import { MouseEvent, useEffect, useRef } from "react";
import HeroVideo from "./HeroVideo";
import styles from "./Hero.module.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const REVEAL_START_FRACTION = 0.15;
const REVEAL_END_FRACTION = 1.0;
const FALLBACK_DURATION_MS = 4000;

const REVEAL_WINDOWS = {
  eyebrow: [0.0, 0.25],
  headline: [0.12, 0.42],
  lead: [0.3, 0.55],
  actions: [0.5, 0.75],
  badges: [0.68, 0.95],
} as const;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const easeOutCubic = (progress: number) => 1 - Math.pow(1 - progress, 3);

const localEasedProgress = (
  overallProgress: number,
  windowStart: number,
  windowEnd: number,
) => {
  const local = clamp(
    (overallProgress - windowStart) / (windowEnd - windowStart),
    0,
    1,
  );
  return easeOutCubic(local);
};

const applyElementReveal = (element: HTMLElement | null, eased: number) => {
  if (!element) return;
  element.style.opacity = String(eased);
  element.style.transform = `translateY(${(1 - eased) * 16}px)`;
};

const Hero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const glassPanelRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);

  const applyOverallReveal = (overallProgress: number) => {
    const progress = clamp(overallProgress, 0, 1);

    if (glassPanelRef.current) {
      glassPanelRef.current.style.opacity = String(progress);
    }

    applyElementReveal(
      eyebrowRef.current,
      localEasedProgress(progress, ...REVEAL_WINDOWS.eyebrow),
    );
    applyElementReveal(
      headlineRef.current,
      localEasedProgress(progress, ...REVEAL_WINDOWS.headline),
    );
    applyElementReveal(
      leadRef.current,
      localEasedProgress(progress, ...REVEAL_WINDOWS.lead),
    );
    applyElementReveal(
      actionsRef.current,
      localEasedProgress(progress, ...REVEAL_WINDOWS.actions),
    );
    applyElementReveal(
      badgesRef.current,
      localEasedProgress(progress, ...REVEAL_WINDOWS.badges),
    );
  };

  useEffect(() => {
    if (prefersReducedMotion()) {
      applyOverallReveal(1);
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let rafId = 0;
    let completed = false;
    let lastTime = 0;
    let durationSec = FALLBACK_DURATION_MS / 1000;

    const resolveDuration = () => {
      const { duration } = video;
      if (Number.isFinite(duration) && duration > 0) {
        durationSec = duration;
      }
    };

    const finishReveal = () => {
      completed = true;
      applyOverallReveal(1);
    };

    const tick = () => {
      if (completed) return;

      resolveDuration();

      const currentTime = video.currentTime;

      // Video looped — first play-through is done; lock text visible.
      if (currentTime < lastTime - 0.2) {
        finishReveal();
        return;
      }
      lastTime = currentTime;

      const overallProgress = clamp(
        (currentTime / durationSec - REVEAL_START_FRACTION) /
          (REVEAL_END_FRACTION - REVEAL_START_FRACTION),
        0,
        1,
      );

      applyOverallReveal(overallProgress);

      if (overallProgress >= 1) {
        finishReveal();
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    const onLoadedMetadata = () => {
      resolveDuration();
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    if (video.readyState >= 1) {
      resolveDuration();
    }

    rafId = window.requestAnimationFrame(tick);

    return () => {
      completed = true;
      window.cancelAnimationFrame(rafId);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  const handleMagneticMove = (event: MouseEvent<HTMLAnchorElement>) => {
    if (prefersReducedMotion()) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const offsetX = event.clientX - rect.left - rect.width / 2;
    const offsetY = event.clientY - rect.top - rect.height / 2;

    button.style.transform = `translate(${offsetX * 0.22}px, ${offsetY * 0.22}px)`;
  };

  const handleMagneticLeave = (event: MouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.transform = "translate(0px, 0px)";
  };

  return (
    <section
      className={`${styles.hero} ${fraunces.variable} ${inter.variable}`}
      aria-labelledby="hero-heading"
    >
      <HeroVideo ref={videoRef} />
      <div className={styles.shell}>
        <div className={styles.content}>
          <div
            ref={glassPanelRef}
            className={styles.glassPanel}
            aria-hidden="true"
          />
          <p ref={eyebrowRef} className={styles.eyebrow}>
            ELITE PERSONAL TRAINING
          </p>
          <h1
            ref={headlineRef}
            id="hero-heading"
            className={styles.headline}
          >
            Transform Your Body. Elevate Your Performance.
          </h1>
          <p ref={leadRef} className={styles.lead}>
            Strength, confidence, and results that last.
          </p>
          <div ref={actionsRef} className={styles.actions}>
            <a
              href="#book"
              className={styles.primaryCta}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              Book a Session
            </a>
            <a href="#about" className={styles.ghostCta}>
              Learn More
            </a>
          </div>
          <div ref={badgesRef} className={styles.badges}>
            <span className={styles.badge}>Free consultation</span>
            <span className={styles.badge}>No commitment</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
