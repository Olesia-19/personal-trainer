"use client";

import { Fraunces, Inter } from "next/font/google";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MouseEvent, useEffect, useRef } from "react";
import HeroVideo from "./HeroVideo";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

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

const HEADLINE_LINES = [
  "Transform Your Body.",
  "Elevate Your Performance.",
] as const;

/** Desktop reverse-zoom start scale (pulled-in camera) */
const ZOOM_START = 1.18;
/** Desktop reverse-zoom end scale — keeps ~3% overflow per side for cover */
const ZOOM_END = 1.06;
/** Vertical parallax drift (%); must stay below overflow from ZOOM_END */
const PARALLAX_Y = 2.5;
/** Max opacity of the --hero-dim darkening overlay */
const DIM_MAX = 0.30;
/** Horizontal transform-origin % — bias toward the subject on the right */
const ZOOM_ORIGIN_X = 70;
/** Desktop pin length as a fraction of viewport height */
const PIN_RATIO_DESKTOP = 0.6;
/** Mobile pin length as a fraction of viewport height */
const PIN_RATIO_MOBILE = 0.4;
/** Mobile reverse-zoom start scale */
const MOBILE_ZOOM_START = 1.2;
/** Mobile reverse-zoom end scale — keeps cover overflow on ~46svh media */
const MOBILE_ZOOM_END = 1.06;
/** Mobile horizontal transform-origin % */
const MOBILE_ORIGIN_X = 78;

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headlineLineInnerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hero = heroRef.current;
    const video = videoRef.current;
    const eyebrow = eyebrowRef.current;
    const lead = leadRef.current;
    const actions = actionsRef.current;
    const badges = badgesRef.current;
    const headlineInners = headlineLineInnerRefs.current.filter(
      Boolean,
    ) as HTMLSpanElement[];

    if (
      !hero ||
      !video ||
      !eyebrow ||
      !lead ||
      !actions ||
      !badges ||
      headlineInners.length === 0
    ) {
      return;
    }

    const mm = gsap.matchMedia();

    mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        reduced: "(prefers-reduced-motion: reduce)",
        desktop: "(min-width: 761px)",
      },
      (context) => {
        const { motion, reduced, desktop } = context.conditions as {
          motion: boolean;
          reduced: boolean;
          desktop: boolean;
        };

        if (reduced) {
          gsap.set([eyebrow, lead, actions, badges], {
            opacity: 1,
            y: 0,
          });
          gsap.set(headlineInners, { y: 0, yPercent: 0, opacity: 1 });
          gsap.set(video, { scale: 1 });
          gsap.set(hero, { "--hero-dim": 0 });
          return;
        }

        if (!motion) return;

        const PIN_RATIO = desktop ? PIN_RATIO_DESKTOP : PIN_RATIO_MOBILE;

        gsap.set([eyebrow, lead, actions, badges], {
          opacity: 0,
          y: 16,
        });
        // Clear CSS-parsed pixel y so only yPercent drives the mask reveal
        gsap.set(headlineInners, { y: 0, yPercent: 110, opacity: 0 });
        gsap.set(hero, { "--hero-dim": 0 });

        // Load-time text reveal — no ScrollTrigger
        const loadTimeline = gsap.timeline({ delay: 0.1 });

        loadTimeline.to(
          eyebrow,
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          0,
        );
        loadTimeline.to(
          headlineInners[0],
          {
            yPercent: 0,
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
          },
          0.3,
        );
        loadTimeline.to(
          headlineInners[1],
          {
            yPercent: 0,
            y: 0,
            opacity: 1,
            duration: 1.1,
            ease: "power3.out",
          },
          0.6,
        );
        loadTimeline.to(
          lead,
          { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
          1.15,
        );
        loadTimeline.to(
          actions,
          { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" },
          1.45,
        );
        loadTimeline.to(
          badges,
          { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
          1.75,
        );

        // Scroll: reverse zoom pinned until the effect finishes (no dead scroll)
        const zoomTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: hero,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * PIN_RATIO)}`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });

        if (desktop) {
          gsap.set(video, {
            scale: ZOOM_START,
            yPercent: 0,
            transformOrigin: `${ZOOM_ORIGIN_X}% 50%`,
          });

          zoomTimeline.fromTo(
            video,
            {
              scale: ZOOM_START,
              yPercent: 0,
              transformOrigin: `${ZOOM_ORIGIN_X}% 50%`,
            },
            {
              scale: ZOOM_END,
              yPercent: PARALLAX_Y,
              ease: "none",
              duration: 1,
            },
            0,
          );
          zoomTimeline.fromTo(
            hero,
            { "--hero-dim": 0 },
            { "--hero-dim": DIM_MAX, ease: "none", duration: 1 },
            0,
          );
        } else {
          // Mobile: stronger pull-out, no parallax / dimming
          gsap.set(video, {
            scale: MOBILE_ZOOM_START,
            transformOrigin: `${MOBILE_ORIGIN_X}% 50%`,
          });

          zoomTimeline.fromTo(
            video,
            {
              scale: MOBILE_ZOOM_START,
              transformOrigin: `${MOBILE_ORIGIN_X}% 50%`,
            },
            { scale: MOBILE_ZOOM_END, ease: "none", duration: 1 },
            0,
          );
        }

        return () => {
          loadTimeline.kill();
          zoomTimeline.scrollTrigger?.kill();
          zoomTimeline.kill();
          gsap.set(
            [eyebrow, lead, actions, badges, ...headlineInners, video],
            { clearProps: "all" },
          );
          gsap.set(hero, { clearProps: "--hero-dim" });
        };
      },
    );

    return () => {
      mm.revert();
    };
  }, []);

  const handleMagneticMove = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

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
      ref={heroRef}
      className={`${styles.hero} ${fraunces.variable} ${inter.variable}`}
      aria-labelledby="hero-heading"
    >
      <HeroVideo ref={videoRef} />
      <div className={styles.shell}>
        <div className={styles.content}>
          <p ref={eyebrowRef} className={styles.eyebrow}>
            ELITE PERSONAL TRAINING
          </p>
          <h1 id="hero-heading" className={styles.headline}>
            {HEADLINE_LINES.map((line, index) => (
              <span key={line} className={styles.headlineLine}>
                <span
                  ref={(el) => {
                    headlineLineInnerRefs.current[index] = el;
                  }}
                  className={styles.headlineLineInner}
                >
                  {line}
                </span>
              </span>
            ))}
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
