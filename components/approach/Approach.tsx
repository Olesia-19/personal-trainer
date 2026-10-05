"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ReactNode, useEffect, useRef } from "react";
import { useHeaderReveal } from "@/hooks/useHeaderReveal";
import styles from "./Approach.module.css";

gsap.registerPlugin(ScrollTrigger);

const PulseIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M1 8h2.2l1.4-3.2L7.2 12l1.8-4H15"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.25" />
    <path
      d="M8 4.75V8l2.1 1.4"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ShieldIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M8 2.25 12.5 4v3.4c0 2.85-1.9 4.9-4.5 5.85C5.4 12.3 3.5 10.25 3.5 7.4V4L8 2.25Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinejoin="round"
    />
  </svg>
);

const APPROACH_COLUMNS: {
  title: string;
  text: string;
  index: string;
  icon: ReactNode;
}[] = [
  {
    index: "01",
    title: "Precision coaching",
    text: "Every session is built on testing, goals, and your current baseline — not a generic plan pulled off the internet. Progress is tracked in numbers, not guesswork.",
    icon: <PulseIcon />,
  },
  {
    index: "02",
    title: "Nutrition without restriction",
    text: "No crash diets. A flexible eating plan that fits your real life and keeps working through packed weeks, travel, or broken sleep.",
    icon: <ClockIcon />,
  },
  {
    index: "03",
    title: "Safety first, always",
    text: "Before your first session: a full check on joints, blood pressure, and injury history. Load only increases as fast as your body is ready for it.",
    icon: <ShieldIcon />,
  },
];

/** Peek offsets / rotations while stacked on card 0 */
const CARD_STACK = [
  { rotation: -4, x: -10, y: -6 },
  { rotation: -1, x: 6, y: -3 },
  { rotation: 3, x: -4, y: 5 },
] as const;

const PIN_HEIGHT_BUFFER_PX = 40;
const HEADER_CLEARANCE_PX = 24;
const CARD_GAP = 24;
const EASE_OUT_QUAD = "power2.out";
const SEPARATE_DURATION = 0.5;
const SEPARATE_OVERLAP = "-=0.35";

const getHeaderClearOffset = () => {
  const header = document.querySelector("header");
  const headerHeight = header?.getBoundingClientRect().height ?? 0;
  return headerHeight + HEADER_CLEARANCE_PX;
};

const Approach = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pinWrapperRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const columnsPinRef = useRef<HTMLDivElement>(null);
  const columnsRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useHeaderReveal({
    triggerRef: sectionRef,
    eyebrowRef,
    headingRef,
  });

  useEffect(() => {
    const container = containerRef.current;
    const pinWrapper = pinWrapperRef.current;
    const intro = introRef.current;
    const columnsPin = columnsPinRef.current;
    const columns = columnsRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (
      !container ||
      !pinWrapper ||
      !intro ||
      !columnsPin ||
      !columns ||
      cards.length === 0
    ) {
      return;
    }

    /** TranslateX from each card's final slot onto card 0's slot */
    let stackXs = cards.map(() => 0);

    const syncPinHeight = () => {
      let tallest = 0;
      cards.forEach((card) => {
        tallest = Math.max(tallest, card.offsetHeight);
      });
      if (tallest <= 0) return;
      columnsPin.style.height = `${tallest + PIN_HEIGHT_BUFFER_PX}px`;
    };

    const clearPinHeight = () => {
      columnsPin.style.height = "";
    };

    /**
     * Absolute cards resolve against .container (positioning context).
     * One shared CARD_WIDTH + CARD_GAP for all three — content box only,
     * so the last card's right edge lands exactly at the content right.
     * Height is equalized to the tallest card after natural content measure.
     */
    const measureLayout = () => {
      const cs = getComputedStyle(container);
      const padL = parseFloat(cs.paddingLeft) || 0;
      const padR = parseFloat(cs.paddingRight) || 0;
      const containerRect = container.getBoundingClientRect();
      const contentWidth = containerRect.width - padL - padR;
      const contentLeft = containerRect.left + padL;
      const cardWidth = (contentWidth - CARD_GAP * 2) / 3;

      // Shared width first; clear height so natural content height can be measured
      cards.forEach((card) => {
        card.style.height = "";
        card.style.width = `${cardWidth}px`;
      });

      let maxHeight = 0;
      cards.forEach((card) => {
        maxHeight = Math.max(maxHeight, card.getBoundingClientRect().height);
      });

      const parent = (cards[0]?.offsetParent as HTMLElement | null) ?? container;
      const parentRect = parent.getBoundingClientRect();
      const top =
        parent === container
          ? pinWrapper.offsetTop + intro.offsetHeight + 8
          : intro.offsetHeight + 8;

      const finalLefts = cards.map((card, index) => {
        const finalLeftViewport =
          contentLeft + index * (cardWidth + CARD_GAP);
        const left = finalLeftViewport - parentRect.left;

        card.style.width = `${cardWidth}px`;
        if (maxHeight > 0) {
          card.style.height = `${maxHeight}px`;
        }
        card.style.left = `${left}px`;
        card.style.top = `${top}px`;
        return left;
      });

      stackXs = finalLefts.map((left) => finalLefts[0] - left);
      syncPinHeight();
    };

    const applyStackedState = () => {
      cards.forEach((card, index) => {
        const peek = CARD_STACK[index];
        gsap.set(card, {
          x: stackXs[index] + peek.x,
          y: peek.y,
          rotation: peek.rotation,
          opacity: 1,
          zIndex: index + 1,
        });
      });
    };

    const applyFinalRowState = () => {
      cards.forEach((card, index) => {
        gsap.set(card, {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          zIndex: index + 1,
        });
      });
    };

    const clearDesktopLayout = () => {
      cards.forEach((card) => {
        card.style.left = "";
        card.style.top = "";
        card.style.width = "";
        card.style.height = "";
        gsap.set(card, { clearProps: "all" });
      });
      clearPinHeight();
    };

    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 801px) and (prefers-reduced-motion: no-preference)",
        reduced: "(min-width: 801px) and (prefers-reduced-motion: reduce)",
      },
      (context) => {
        const { desktop, reduced } = context.conditions as {
          desktop: boolean;
          reduced: boolean;
        };

        if (reduced) {
          measureLayout();
          applyFinalRowState();
          ScrollTrigger.refresh();

          const onResize = () => {
            measureLayout();
            applyFinalRowState();
            ScrollTrigger.refresh();
          };
          window.addEventListener("resize", onResize);

          const fonts = document.fonts;
          const onFontsReady = () => {
            measureLayout();
            applyFinalRowState();
            ScrollTrigger.refresh();
          };
          fonts?.ready.then(onFontsReady).catch(() => undefined);

          return () => {
            window.removeEventListener("resize", onResize);
            clearDesktopLayout();
          };
        }

        if (!desktop) {
          clearDesktopLayout();
          return;
        }

        measureLayout();
        applyStackedState();

        const card0 = cards[0];
        const card1 = cards[1];
        const card2 = cards[2];

        const timeline = gsap.timeline({ paused: true });

        timeline.to(card2, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: SEPARATE_DURATION,
          ease: EASE_OUT_QUAD,
        });
        timeline.to(
          card1,
          {
            x: 0,
            y: 0,
            rotation: 0,
            duration: SEPARATE_DURATION,
            ease: EASE_OUT_QUAD,
          },
          SEPARATE_OVERLAP,
        );
        timeline.to(
          card0,
          {
            x: 0,
            y: 0,
            rotation: 0,
            duration: SEPARATE_DURATION,
            ease: EASE_OUT_QUAD,
          },
          SEPARATE_OVERLAP,
        );

        const scrollTrigger = ScrollTrigger.create({
          trigger: pinWrapper,
          start: () => `top top+=${getHeaderClearOffset()}`,
          end: "+=350",
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefreshInit: () => {
            measureLayout();
          },
          onEnter: () => {
            timeline.play();
          },
          onEnterBack: () => {
            timeline.play();
          },
          onLeaveBack: () => {
            timeline.reverse();
          },
        });

        // If we mount already past the trigger, show the separated row
        if (scrollTrigger.scroll() >= scrollTrigger.start) {
          timeline.progress(1);
        }

        const remeasure = () => {
          measureLayout();
          if (timeline.progress() <= 0) {
            applyStackedState();
          } else if (timeline.progress() >= 1) {
            applyFinalRowState();
          }
          ScrollTrigger.refresh();
        };

        window.addEventListener("resize", remeasure);
        document.fonts?.ready.then(remeasure).catch(() => undefined);

        return () => {
          window.removeEventListener("resize", remeasure);
          scrollTrigger.kill();
          timeline.kill();
          clearDesktopLayout();
        };
      },
    );

    return () => {
      mm.revert();
      clearDesktopLayout();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="approach"
      className={styles.section}
      aria-labelledby="approach-heading"
    >
      <div className={styles.sectionGlow} aria-hidden="true" />
      <div ref={containerRef} className={`container ${styles.container}`}>
        <div ref={pinWrapperRef} className={styles.pinWrapper}>
          <div ref={introRef} className={styles.intro}>
            <p ref={eyebrowRef} className={`eyebrow ${styles.center}`}>
              Approach
            </p>
            <h2
              ref={headingRef}
              id="approach-heading"
              className={styles.headline}
            >
              We don&apos;t just change bodies. We change how you live.
            </h2>
          </div>

          <div ref={columnsPinRef} className={styles.columnsPin}>
            <div
              ref={columnsRef}
              className={styles.columns}
              role="list"
              aria-label="Approach pillars"
            >
              {APPROACH_COLUMNS.map((column, index) => (
                <article
                  key={column.title}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className={`card ${styles.column}`}
                  role="listitem"
                  data-card-index={index}
                >
                  <span className={styles.cardIndex} aria-hidden="true">
                    {column.index}
                  </span>
                  <span className={styles.iconBadge} aria-hidden="true">
                    {column.icon}
                  </span>
                  <h3 className={styles.columnTitle}>{column.title}</h3>
                  <p className={styles.columnText}>{column.text}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Approach;
