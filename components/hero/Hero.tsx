"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MouseEvent, useEffect, useRef } from "react";
import HeroVideo from "./HeroVideo";
import styles from "./Hero.module.css";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

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
/** Normalized (0-1) rectangle of the SOURCE video that must stay visible:
 *  the trainer's head (top right) + the lifter's face. ESTIMATES - recalibrate from a real frame. */
const SAFE_BOX = { left: 0.64, right: 0.93, top: 0.08, bottom: 0.74 } as const;
/** Must match --video-focus-x / --video-focus-y in HeroVideo.module.css (fractions) */
const FOCUS_X = 0.9;
const FOCUS_Y = 0;
/** Minimum px of air kept above the safe box (headroom above the trainer's head) */
const SAFE_TOP_MARGIN_PX = 16;
/** Desktop vertical transform-origin % (unchanged behavior) */
const ZOOM_ORIGIN_Y = 50;
/** Mobile vertical transform-origin %: anchoring near the top keeps the head in frame while zooming */
const MOBILE_ORIGIN_Y = 30;
/** Parallax safety: max yPercent per unit of scale overflow (theoretical max is 50 at origin 50%) */
const PARALLAX_SAFETY = 45;
const FALLBACK_VIDEO_ASPECT = 16 / 9;
/** Minimum length of the bottom fade on the mid-mobile strip */
const SCRIM_FADE_MIN_PX = 72;
/** ...and as a fraction of the strip height (whichever is larger wins) */
const SCRIM_FADE_MIN_RATIO = 0.22;

/** Largest scale at which SAFE_BOX stays fully inside the box, for a video drawn with
 *  object-fit: cover, object-position (FOCUS_X, FOCUS_Y) and scaled around (originXPct, originYPct). */
const getMaxSafeScale = (
  boxW: number,
  boxH: number,
  videoAspect: number,
  originXPct: number,
  originYPct: number,
) => {
  const boxAspect = boxW / boxH;
  const dispW = boxAspect > videoAspect ? boxW : boxH * videoAspect;
  const dispH = boxAspect > videoAspect ? boxW / videoAspect : boxH;
  const offX = -(dispW - boxW) * FOCUS_X;
  const offY = -(dispH - boxH) * FOCUS_Y;

  const axisLimit = (
    start: number,
    end: number,
    size: number,
    origin: number,
    startMargin: number,
  ) => {
    let limit = Infinity;
    if (start < origin) {
      limit = Math.min(limit, (origin - startMargin) / (origin - start));
    }
    if (end > origin) {
      limit = Math.min(limit, (size - origin) / (end - origin));
    }
    return limit;
  };

  const x = axisLimit(
    offX + SAFE_BOX.left * dispW,
    offX + SAFE_BOX.right * dispW,
    boxW,
    (originXPct / 100) * boxW,
    0,
  );
  const y = axisLimit(
    offY + SAFE_BOX.top * dispH,
    offY + SAFE_BOX.bottom * dispH,
    boxH,
    (originYPct / 100) * boxH,
    SAFE_TOP_MARGIN_PX,
  );
  return Math.min(x, y);
};

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

        const applyScrimClear = (
          boxW: number,
          boxH: number,
          videoAspect: number,
          startScale: number,
          endScale: number,
        ) => {
          const media = video.parentElement;
          if (!media) return;
          const boxAspect = boxW / boxH;
          const dispH =
            boxAspect > videoAspect ? boxW / videoAspect : boxH;
          const offY = -(dispH - boxH) * FOCUS_Y;
          const safeBottomY = offY + SAFE_BOX.bottom * dispH;
          const originY = (MOBILE_ORIGIN_Y / 100) * boxH;
          const zoomedAt = (scale: number) =>
            originY + (safeBottomY - originY) * scale;
          // Use the larger on-screen bottom so the face stays clear at both zoom ends
          const zoomedBottomY = Math.max(
            zoomedAt(startScale),
            zoomedAt(endScale),
          );
          const minFade = Math.max(
            SCRIM_FADE_MIN_PX,
            boxH * SCRIM_FADE_MIN_RATIO,
          );
          const clearPx = Math.min(
            Math.max(zoomedBottomY + 12, boxH * 0.5),
            boxH - minFade,
          );
          media.style.setProperty("--scrim-clear", `${clearPx}px`);
        };

        const resolveZoom = (isDesktop: boolean) => {
          const startCfg = isDesktop ? ZOOM_START : MOBILE_ZOOM_START;
          const endCfg = isDesktop ? ZOOM_END : MOBILE_ZOOM_END;
          const media = video.parentElement;
          const boxW = media?.offsetWidth ?? 0;
          const boxH = media?.offsetHeight ?? 0;
          if (!boxW || !boxH) return { start: startCfg, end: endCfg };
          const aspect =
            video.videoWidth > 0 && video.videoHeight > 0
              ? video.videoWidth / video.videoHeight
              : FALLBACK_VIDEO_ASPECT;
          const fit = getMaxSafeScale(
            boxW,
            boxH,
            aspect,
            isDesktop ? ZOOM_ORIGIN_X : MOBILE_ORIGIN_X,
            isDesktop ? ZOOM_ORIGIN_Y : MOBILE_ORIGIN_Y,
          );
          const end = Math.max(1, Math.min(endCfg, fit));
          const start = Math.max(end, Math.min(startCfg, fit));
          if (!isDesktop) {
            applyScrimClear(boxW, boxH, aspect, start, end);
          }
          return { start, end };
        };

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
            start: () => {
              const header = document.querySelector("[data-site-header]");
              const offset = header
                ? Math.round(header.getBoundingClientRect().height)
                : 0;
              return `top ${offset}px`;
            },
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
            scale: resolveZoom(true).start,
            yPercent: 0,
            transformOrigin: `${ZOOM_ORIGIN_X}% ${ZOOM_ORIGIN_Y}%`,
          });

          zoomTimeline.fromTo(
            video,
            {
              scale: () => resolveZoom(true).start,
              yPercent: 0,
              transformOrigin: `${ZOOM_ORIGIN_X}% ${ZOOM_ORIGIN_Y}%`,
            },
            {
              scale: () => resolveZoom(true).end,
              yPercent: () =>
                Math.min(
                  PARALLAX_Y,
                  (resolveZoom(true).end - 1) * PARALLAX_SAFETY,
                ),
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
            scale: resolveZoom(false).start,
            transformOrigin: `${MOBILE_ORIGIN_X}% ${MOBILE_ORIGIN_Y}%`,
          });

          zoomTimeline.fromTo(
            video,
            {
              scale: () => resolveZoom(false).start,
              transformOrigin: `${MOBILE_ORIGIN_X}% ${MOBILE_ORIGIN_Y}%`,
            },
            {
              scale: () => resolveZoom(false).end,
              ease: "none",
              duration: 1,
            },
            0,
          );
        }

        const onVideoMeta = () => ScrollTrigger.refresh();
        if (video.readyState < 1) {
          video.addEventListener("loadedmetadata", onVideoMeta, { once: true });
        }

        return () => {
          video.removeEventListener("loadedmetadata", onVideoMeta);
          video.parentElement?.style.removeProperty("--scrim-clear");
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
      className={styles.hero}
      aria-labelledby="hero-heading"
    >
      <HeroVideo ref={videoRef} />
      <div className={`container ${styles.shell}`}>
        <div className={styles.content}>
          <p ref={eyebrowRef} className={`eyebrow ${styles.eyebrow}`}>
            Elite personal training
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
              className={`btn btn-primary ${styles.primaryCta}`}
              onMouseMove={handleMagneticMove}
              onMouseLeave={handleMagneticLeave}
            >
              Book a Session
            </a>
            <a href="#approach" className={`btn btn-ghost ${styles.ghostCta}`}>
              Learn More
            </a>
          </div>
          <div ref={badgesRef} className={styles.badges}>
            <span className={`badge ${styles.badge}`}>Free consultation</span>
            <span className={`badge ${styles.badge}`}>No commitment</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
