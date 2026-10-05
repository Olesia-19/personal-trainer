"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RefObject, useEffect } from "react";

gsap.registerPlugin(ScrollTrigger);

/** Defaults mirrored from TrainingExperiences intro reveal */
const FROM_Y = 24;
const DURATION = 0.7;
const STAGGER = 0.08;
const EASE = "power2.out";
const START = "top 80%";

/**
 * Same motion gates as TrainingExperiences when it runs setupIntro
 * (desktop stack OR mobile stack, never reduced-motion / short static).
 */
const MOTION_MEDIA =
  "(min-width: 761px) and (min-height: 641px) and (prefers-reduced-motion: no-preference), (max-width: 760px) and (min-height: 600px) and (prefers-reduced-motion: no-preference)";

type UseHeaderRevealOptions = {
  triggerRef: RefObject<HTMLElement | null>;
  eyebrowRef?: RefObject<HTMLElement | null>;
  headingRef?: RefObject<HTMLElement | null>;
  leadRef?: RefObject<HTMLElement | null>;
};

export const useHeaderReveal = ({
  triggerRef,
  eyebrowRef,
  headingRef,
  leadRef,
}: UseHeaderRevealOptions) => {
  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const elements = [
      eyebrowRef?.current,
      headingRef?.current,
      leadRef?.current,
    ].filter(Boolean) as HTMLElement[];

    if (elements.length === 0) {
      return;
    }

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_MEDIA, () => {
        gsap.set(elements, { autoAlpha: 0, y: FROM_Y });

        ScrollTrigger.create({
          trigger,
          start: START,
          once: true,
          onEnter: () => {
            gsap.to(elements, {
              autoAlpha: 1,
              y: 0,
              duration: DURATION,
              stagger: STAGGER,
              ease: EASE,
              overwrite: "auto",
            });
          },
        });
      });

      void document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }, trigger);

    return () => {
      ctx.revert();
    };
  }, [triggerRef, eyebrowRef, headingRef, leadRef]);
};
