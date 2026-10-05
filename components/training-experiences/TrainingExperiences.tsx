"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { CSSProperties, useEffect, useRef } from "react";
import { useHeaderReveal } from "@/hooks/useHeaderReveal";
import styles from "./TrainingExperiences.module.css";

gsap.registerPlugin(ScrollTrigger);

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
  },
] as const;

type Experience = (typeof EXPERIENCES)[number] & { image?: string };

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
  scrub: number;
  enterStart: string;
  enterEnd: string;
  mediaFromScale: number;
  mediaFromOpacity: number;
  mediaOrigin: string;
  revealY: number;
  revealStagger: number;
};

const DESKTOP_STACK: StackAnimConfig = {
  coverScale: COVER_SCALE,
  coverRotateX: COVER_ROTATE_X,
  coverRotateZ: COVER_ROTATE_Z,
  coverDim: COVER_DIM,
  coverDimSoft: COVER_DIM_SOFT,
  perspective: PERSPECTIVE,
  scrub: 0.6,
  enterStart: "top 90%",
  enterEnd: "top 40%",
  mediaFromScale: 0.62,
  mediaFromOpacity: 0.4,
  mediaOrigin: "100% 100%",
  revealY: 24,
  revealStagger: 0.08,
};

const MOBILE_STACK: StackAnimConfig = {
  coverScale: M_COVER_SCALE,
  coverRotateX: M_COVER_ROTATE_X,
  coverRotateZ: M_COVER_ROTATE_Z,
  coverDim: M_COVER_DIM,
  coverDimSoft: M_COVER_DIM_SOFT,
  perspective: M_PERSPECTIVE,
  scrub: 0.5,
  enterStart: "top 92%",
  enterEnd: "top 40%",
  mediaFromScale: 0.8,
  mediaFromOpacity: 0.5,
  mediaOrigin: "50% 100%",
  revealY: 16,
  revealStagger: 0.06,
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
              scrub: config.scrub,
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
                  {experience.image ? (
                    <Image
                      src={experience.image}
                      alt=""
                      fill
                      sizes="(max-width: 760px) 100vw, 58vw"
                      className={styles.mediaImage}
                    />
                  ) : (
                    <div className={styles.mediaPlaceholder} aria-hidden="true">
                      <span>image placeholder</span>
                    </div>
                  )}
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
