"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { CSSProperties, useEffect, useRef } from "react";
import { useHeaderReveal } from "@/hooks/useHeaderReveal";
import styles from "./TrainingExperiences.module.css";

gsap.registerPlugin(ScrollTrigger);

const STRENGTH_VIDEO =
  "https://res.cloudinary.com/dzqk9wipf/video/upload/q_auto,w_1280/v1792485906/Muscular_arm_pressing_heavy_kett__20261020094227_oueoqi.mp4";
const STRENGTH_POSTER =
  "https://res.cloudinary.com/dzqk9wipf/video/upload/so_0,q_auto,w_1280/v1792485906/Muscular_arm_pressing_heavy_kett__20261020094227_oueoqi.jpg";

const ATHLETIC_VIDEO =
  "https://res.cloudinary.com/dzqk9wipf/video/upload/q_auto,w_1280/v1792491779/Athlete_running_on_curved_treadmill_20261020112237_lmjezm.mp4";
const ATHLETIC_POSTER =
  "https://res.cloudinary.com/dzqk9wipf/video/upload/so_0,q_auto,w_1280/v1792491779/Athlete_running_on_curved_treadmill_20261020112237_lmjezm.jpg";

const ONLINE_VIDEO =
  "https://res.cloudinary.com/dzqk9wipf/video/upload/q_auto,w_1280/v1792498410/Woman_rising_from_dumbbell_lunge_20261020131256_qyd3ky.mp4";
const ONLINE_POSTER =
  "https://res.cloudinary.com/dzqk9wipf/video/upload/so_0,q_auto,w_1280/v1792498410/Woman_rising_from_dumbbell_lunge_20261020131256_qyd3ky.jpg";

const EXPERIENCES = [
  {
    id: "strength-coaching",
    number: "01",
    title: "Strength Coaching",
    description:
      "Progressive overload, precise form, and programs built for measurable strength gains.",
    subtitle: "Program modules",
    items: [
      "Progressive Overload",
      "Precise Form & Technique",
      "Periodized Programming",
    ],
    price: "$199 / month",
    theme: "flat",
    video: STRENGTH_VIDEO,
    poster: STRENGTH_POSTER,
  },
  {
    id: "athletic-performance",
    number: "02",
    title: "Athletic Performance",
    description:
      "Speed, power, and agility work tailored to your sport and competition calendar.",
    subtitle: "Performance pillars",
    items: [
      "Speed & Acceleration",
      "Power Development",
      "Sport-Specific Conditioning",
    ],
    price: "$249 / month",
    theme: "soft",
    video: ATHLETIC_VIDEO,
    poster: ATHLETIC_POSTER,
  },
  {
    id: "online-transformation",
    number: "03",
    title: "Online Transformation",
    description:
      "Remote coaching with weekly check-ins, custom training, and accountability that scales.",
    subtitle: "Remote coaching",
    items: [
      "Custom Training Plans",
      "Weekly Video Check-ins",
      "Nutrition & Habit Tracking",
    ],
    price: "$149 / month",
    theme: "accent",
    video: ONLINE_VIDEO,
    poster: ONLINE_POSTER,
    /** Slight top bias so head stays in frame after cover-crop + scale. */
    objectPosition: "50% 42%",
    /**
     * New source has ~2–3px black rows at top/bottom (measured); oversize
     * inside overflow:hidden so they sit outside the clipped frame.
     */
    videoBleed: 4,
    /** More air around subject — modest zoom inside the clipped frame only. */
    videoScale: 1.15,
  },
] as const;

type Experience = Omit<
  (typeof EXPERIENCES)[number],
  "video" | "poster" | "objectPosition" | "videoBleed" | "videoScale"
> & {
  image?: string;
  video?: string;
  poster?: string;
  objectPosition?: string;
  videoBleed?: number;
  videoScale?: number;
};

const CARD_COUNT = EXPERIENCES.length;

/** Desktop covered-card fall-back */
const COVER_SCALE = 0.9;
const COVER_ROTATE_X = 10;
const COVER_ROTATE_Z = 0.8;
const COVER_DIM = 0.55;
const COVER_DIM_SOFT = 0.65;
const PERSPECTIVE = 1400;

/** Mobile covered-card fall-back */
const M_COVER_SCALE = 0.92;
const M_COVER_ROTATE_X = 8;
const M_COVER_ROTATE_Z = 0.6;
const M_COVER_DIM = 0.55;
const M_COVER_DIM_SOFT = 0.65;
const M_PERSPECTIVE = 1000;

type StackAnimConfig = {
  coverScale: number;
  coverRotateX: number;
  coverRotateZ: number;
  coverDim: number;
  coverDimSoft: number;
  perspective: number;
  /** Scrub for covered-card fall-back (unchanged from prior stack). */
  scrub: number;
  /**
   * Scrub for media zoom enter — matched to reference (scrub: 1).
   * Kept separate so cover fall-back timing is not altered.
   */
  mediaScrub: number;
  enterStart: string;
  enterEnd: string;
  mediaFromScale: number;
  mediaFromOpacity: number;
  mediaOrigin: string;
  revealY: number;
  revealStagger: number;
};

/**
 * Media zoom matched to horeca-social.com "Our SERVICES" (GSAP ScrollTrigger):
 * frame (.media / [data-gsap-image]) scales 0.3 → 1, origin top-right,
 * mediaScrub: 1, start "top 80%", end "top 30%", ease none, no opacity change.
 * Source: cdn.jsdelivr.net/gh/upgreight/horeca-website@v1.11.0/script-min.js
 */
const DESKTOP_STACK: StackAnimConfig = {
  coverScale: COVER_SCALE,
  coverRotateX: COVER_ROTATE_X,
  coverRotateZ: COVER_ROTATE_Z,
  coverDim: COVER_DIM,
  coverDimSoft: COVER_DIM_SOFT,
  perspective: PERSPECTIVE,
  scrub: 0.6,
  mediaScrub: 1,
  enterStart: "top 80%",
  enterEnd: "top 30%",
  mediaFromScale: 0.3,
  mediaFromOpacity: 1,
  mediaOrigin: "100% 0%",
  revealY: 24,
  revealStagger: 0.08,
};

/** Same media zoom params as desktop; cover fall-back stays mobile-tuned. */
const MOBILE_STACK: StackAnimConfig = {
  coverScale: M_COVER_SCALE,
  coverRotateX: M_COVER_ROTATE_X,
  coverRotateZ: M_COVER_ROTATE_Z,
  coverDim: M_COVER_DIM,
  coverDimSoft: M_COVER_DIM_SOFT,
  perspective: M_PERSPECTIVE,
  scrub: 0.5,
  mediaScrub: 1,
  enterStart: "top 80%",
  enterEnd: "top 30%",
  mediaFromScale: 0.3,
  mediaFromOpacity: 1,
  mediaOrigin: "100% 0%",
  revealY: 16,
  revealStagger: 0.06,
};

type CardVideoProps = {
  src: string;
  poster?: string;
  objectPosition?: string;
  videoBleed?: number;
  videoScale?: number;
};

/** One instance per card video — own ref, observer, and cleanup. */
const CardVideo = ({
  src,
  poster,
  objectPosition,
  videoBleed,
  videoScale,
}: CardVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      video.pause();
      return;
    }

    video.muted = true;

    const card = video.closest("article");

    const cardIsShown = () =>
      !card || getComputedStyle(card).visibility !== "hidden";

    const tryPlay = () => {
      if (!cardIsShown()) {
        video.pause();
        return;
      }
      video.muted = true;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          /* Autoplay blocked — leave poster visible. */
        });
      }
    };

    const syncFromEntry = (entry: IntersectionObserverEntry) => {
      // Observe the media box (not the full sticky li) so a peeking neighbor
      // does not keep decoding while another card is primary.
      if (
        entry.isIntersecting &&
        entry.intersectionRatio >= 0.35 &&
        cardIsShown()
      ) {
        tryPlay();
      } else {
        video.pause();
      }
    };

    let lastRatio = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }
        lastRatio = entry.intersectionRatio;
        syncFromEntry(entry);
      },
      { threshold: [0, 0.15, 0.35, 0.5, 0.75, 1] },
    );

    observer.observe(video);

    // GSAP cover toggles visibility — IO may not re-fire; pause/resume accordingly.
    const mo = card
      ? new MutationObserver(() => {
          if (!cardIsShown()) {
            video.pause();
          } else if (lastRatio >= 0.35) {
            tryPlay();
          }
        })
      : null;
    if (card && mo) {
      mo.observe(card, { attributes: true, attributeFilter: ["style"] });
    }

    return () => {
      observer.disconnect();
      mo?.disconnect();
      video.pause();
    };
  }, [src]);

  const videoStyle = {
    ...(objectPosition ? { objectPosition } : {}),
    ...(videoBleed != null && videoBleed > 0
      ? { ["--video-bleed" as string]: `${videoBleed}px` }
      : {}),
    ...(videoScale != null && videoScale !== 1
      ? { ["--video-scale" as string]: String(videoScale) }
      : {}),
  } as CSSProperties;

  return (
    <video
      ref={videoRef}
      className={styles.mediaVideo}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
      style={Object.keys(videoStyle).length ? videoStyle : undefined}
    />
  );
};

type ExperienceMediaProps = {
  experience: Experience;
};

const ExperienceMedia = ({ experience }: ExperienceMediaProps) => {
  if (experience.video) {
    return (
      <CardVideo
        src={experience.video}
        poster={experience.poster}
        objectPosition={experience.objectPosition}
        videoBleed={experience.videoBleed}
        videoScale={experience.videoScale}
      />
    );
  }

  if (experience.image) {
    return (
      <Image
        src={experience.image}
        alt=""
        fill
        sizes="(max-width: 760px) 100vw, 58vw"
        className={styles.mediaImage}
      />
    );
  }

  return (
    <div className={styles.mediaPlaceholder} aria-hidden="true">
      <span>image placeholder</span>
    </div>
  );
};

const TrainingExperiences = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const stackRef = useRef<HTMLUListElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);

  useHeaderReveal({
    triggerRef: sectionRef,
    eyebrowRef,
    headingRef,
    leadRef,
  });

  useEffect(() => {
    const section = sectionRef.current;
    const stack = stackRef.current;
    const items = itemRefs.current.filter(Boolean) as HTMLLIElement[];

    if (!section || !stack || items.length === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      const readHeaderHeight = () => {
        const header = document.querySelector("[data-site-header]");
        return header
          ? Math.round(header.getBoundingClientRect().height)
          : 72;
      };

      const syncHeaderHeight = () => {
        stack.style.setProperty("--header-h", `${readHeaderHeight()}px`);
      };

      const setupCardStack = (
        config: StackAnimConfig,
        getHeaderHeight: () => number,
      ) => {
        items.forEach((item) => {
          const media = item.querySelector(`.${styles.media}`);
          const reveals = item.querySelectorAll("[data-reveal]");
          const card = item.querySelector(`.${styles.card}`);

          if (media) {
            gsap.set(media, {
              scale: config.mediaFromScale,
              opacity: config.mediaFromOpacity,
              transformOrigin: config.mediaOrigin,
            });
          }
          if (reveals.length) {
            gsap.set(reveals, { autoAlpha: 0, y: config.revealY });
          }
          if (card) {
            const theme = item.getAttribute("data-theme");
            gsap.set(card, {
              scale: 1,
              rotationX: 0,
              rotationZ: 0,
              "--dim": 0,
              ...(theme === "soft" || theme === "accent"
                ? { "--shadow-o": 1 }
                : {}),
              transformPerspective: config.perspective,
              transformOrigin: "50% 100%",
              visibility: "visible",
            });
          }
        });

        items.forEach((item, index) => {
          const media = item.querySelector(`.${styles.media}`);
          const reveals = item.querySelectorAll("[data-reveal]");
          const card = item.querySelector(`.${styles.card}`);

          const enterTl = gsap.timeline({
            scrollTrigger: {
              trigger: item,
              start: config.enterStart,
              end: config.enterEnd,
              scrub: config.mediaScrub,
              invalidateOnRefresh: true,
            },
          });

          if (media) {
            enterTl.fromTo(
              media,
              {
                scale: config.mediaFromScale,
                opacity: config.mediaFromOpacity,
              },
              { scale: 1, opacity: 1, ease: "none", duration: 1 },
              0,
            );
          }

          if (reveals.length) {
            enterTl.fromTo(
              reveals,
              { autoAlpha: 0, y: config.revealY },
              {
                autoAlpha: 1,
                y: 0,
                stagger: config.revealStagger,
                ease: "none",
                duration: 1,
              },
              0.1,
            );
          }

          const nextItem = items[index + 1];
          if (nextItem && card) {
            const theme = item.getAttribute("data-theme");
            const rotateZ =
              index % 2 === 0 ? -config.coverRotateZ : config.coverRotateZ;
            const coverDim =
              theme === "soft" ? config.coverDimSoft : config.coverDim;

            const fromState: gsap.TweenVars = {
              scale: 1,
              rotationX: 0,
              rotationZ: 0,
              "--dim": 0,
            };
            const toState: gsap.TweenVars = {
              scale: config.coverScale,
              rotationX: config.coverRotateX,
              rotationZ: rotateZ,
              "--dim": coverDim,
              ease: "none",
              duration: 1,
            };

            if (theme === "soft") {
              fromState["--shadow-o"] = 1;
              toState["--shadow-o"] = 0;
            }

            gsap
              .timeline({
                scrollTrigger: {
                  trigger: nextItem,
                  start: "top bottom",
                  end: () => `top ${getHeaderHeight()}px`,
                  scrub: config.scrub,
                  invalidateOnRefresh: true,
                  onLeave: () => {
                    gsap.set(card, { visibility: "hidden" });
                  },
                  onEnterBack: () => {
                    gsap.set(card, { visibility: "visible" });
                  },
                },
              })
              .fromTo(card, fromState, toState, 0);
          }
        });
      };

      syncHeaderHeight();

      mm.add(
        {
          desktop:
            "(min-width: 761px) and (min-height: 641px) and (prefers-reduced-motion: no-preference)",
          mobileStack:
            "(max-width: 760px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)",
          reduced: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, mobileStack, reduced } = context.conditions as {
            desktop: boolean;
            mobileStack: boolean;
            reduced: boolean;
          };

          syncHeaderHeight();

          if (reduced) {
            return;
          }

          if (desktop || mobileStack) {
            setupCardStack(
              desktop ? DESKTOP_STACK : MOBILE_STACK,
              readHeaderHeight,
            );

            const onResize = () => {
              syncHeaderHeight();
              ScrollTrigger.refresh();
            };

            window.addEventListener("resize", onResize);

            return () => {
              window.removeEventListener("resize", onResize);
            };
          }
        },
      );

      void document.fonts.ready.then(() => {
        syncHeaderHeight();
        ScrollTrigger.refresh();
      });
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="services"
      className={styles.section}
      aria-labelledby="training-experiences-heading"
    >
      <div className="container">
        <header className="sectionHeader">
          <p ref={eyebrowRef} className="eyebrow">
            What we offer
          </p>
          <h2
            ref={headingRef}
            id="training-experiences-heading"
            className="sectionTitle"
          >
            Training Experiences
          </h2>
          <p ref={leadRef} className="sectionLead">
            Three focused paths—each structured, coached, and built for results.
          </p>
        </header>
      </div>

      <ul
        ref={stackRef}
        className={styles.stack}
        role="list"
        style={{ "--count": CARD_COUNT } as CSSProperties}
      >
        {(EXPERIENCES as readonly Experience[]).map((experience, index) => (
          <li
            key={experience.id}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            className={styles.item}
            style={{ "--i": index } as CSSProperties}
            data-theme={experience.theme}
          >
            <article className={styles.card}>
              <div className={`container ${styles.cardInner}`}>
                <div className={styles.cardTop}>
                  <span className={styles.number}>{experience.number}</span>
                  <h3 className={styles.cardTitle}>{experience.title}</h3>
                </div>

                <div className={styles.cardBody}>
                  <p className={styles.cardDescription} data-reveal>
                    {experience.description}
                  </p>
                  <p className={styles.subtitle} data-reveal>
                    {experience.subtitle}
                  </p>
                  <ul className={styles.items} data-reveal>
                    {experience.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                  <div className={styles.cardFooter} data-reveal>
                    <p className={styles.price}>{experience.price}</p>
                    <a
                      href="#book"
                      className={`btn btn-primary ${styles.applyBtn}`}
                    >
                      Apply Now
                    </a>
                  </div>
                </div>

                <div className={styles.media}>
                  <ExperienceMedia experience={experience} />
                </div>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TrainingExperiences;
