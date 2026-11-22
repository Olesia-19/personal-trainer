"use client";

import { RefObject, useCallback, useEffect, useState } from "react";

/**
 * Helpers for a native scroll-snap carousel (a horizontal scroller whose
 * direct children are the slides). No ScrollTrigger, no vertical scrolling,
 * no layout writes: positions are only read, and only while scrolling.
 */

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const getSlides = (scroller: HTMLElement) =>
  Array.from(scroller.children) as HTMLElement[];

/** Horizontal scrollLeft that centres `slide` in `scroller`, clamped. */
const centredScrollLeft = (scroller: HTMLElement, slide: HTMLElement) => {
  const scrollerRect = scroller.getBoundingClientRect();
  const slideRect = slide.getBoundingClientRect();
  const target =
    scroller.scrollLeft +
    (slideRect.left + slideRect.width / 2) -
    (scrollerRect.left + scroller.clientWidth / 2);
  const max = scroller.scrollWidth - scroller.clientWidth;
  return Math.min(Math.max(target, 0), Math.max(max, 0));
};

/**
 * Index of the slide nearest the scroller's centre, updated at most once per
 * frame while the scroller scrolls. `scrollToIndex` scrolls only the scroller
 * (never the page): smooth, or instant with prefers-reduced-motion.
 */
export const useActiveSlide = (scrollerRef: RefObject<HTMLElement | null>) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const max = scroller.scrollWidth - scroller.clientWidth;
      if (max <= 0) return; // not a carousel at this size (grid layout)
      const slides = getSlides(scroller);
      let next = 0;
      if (scroller.scrollLeft >= max - 2) {
        next = slides.length - 1;
      } else if (scroller.scrollLeft > 2) {
        const rect = scroller.getBoundingClientRect();
        const centre = rect.left + scroller.clientWidth / 2;
        let best = Infinity;
        slides.forEach((slide, index) => {
          const r = slide.getBoundingClientRect();
          const distance = Math.abs(r.left + r.width / 2 - centre);
          if (distance < best) {
            best = distance;
            next = index;
          }
        });
      }
      setActive(next);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [scrollerRef]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const scroller = scrollerRef.current;
      const slide = scroller ? getSlides(scroller)[index] : undefined;
      if (!scroller || !slide) return;
      scroller.scrollTo({
        left: centredScrollLeft(scroller, slide),
        behavior: window.matchMedia(REDUCED_MOTION).matches ? "auto" : "smooth",
      });
    },
    [scrollerRef],
  );

  return { active, scrollToIndex };
};

/** Once per page load, across remounts */
let swipeHintUsed = false;

type SwipeHintOptions = {
  /** Only hint while this media query matches (the carousel layout) */
  media: string;
  /** How far the slides travel left before coming back, px */
  distance?: number;
  duration?: number;
  /** Share of the scroller that must be on screen */
  visibleRatio?: number;
};

/**
 * One-time "you can swipe" nudge: the first time the scroller is at least
 * `visibleRatio` on screen, its slides slide `distance`px left and back.
 *
 * It animates a transform on the slides (Web Animations API, nothing left
 * behind), so scrollLeft, scroll-snap and the page layout are never touched.
 * Skipped if the user already scrolled / touched / keyed the carousel, if it
 * isn't at its start, with prefers-reduced-motion, or outside `media`.
 * Any interaction during the nudge cancels it.
 */
export const useSwipeHint = (
  scrollerRef: RefObject<HTMLElement | null>,
  { media, distance = 32, duration = 600, visibleRatio = 0.6 }: SwipeHintOptions,
) => {
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || swipeHintUsed || typeof IntersectionObserver === "undefined") {
      return;
    }

    let interacted = false;
    let animations: Animation[] = [];
    const interactions = ["pointerdown", "touchstart", "wheel", "keydown", "scroll"];

    const onInteract = () => {
      interacted = true;
      animations.forEach((animation) => animation.cancel());
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry || entry.intersectionRatio < visibleRatio) return;
        observer.disconnect(); // first sighting only, hint or not
        swipeHintUsed = true;
        if (
          interacted ||
          scroller.scrollLeft !== 0 ||
          !window.matchMedia(media).matches ||
          window.matchMedia(REDUCED_MOTION).matches
        ) {
          return;
        }
        const keyframes: Keyframe[] = [
          { transform: "translateX(0)", easing: "ease-in-out" },
          { transform: `translateX(${-distance}px)`, easing: "ease-in-out" },
          { transform: "translateX(0)" },
        ];
        animations = getSlides(scroller).map((slide) =>
          slide.animate(keyframes, { duration }),
        );
      },
      { threshold: [visibleRatio] },
    );

    interactions.forEach((type) =>
      scroller.addEventListener(type, onInteract, { passive: true }),
    );
    observer.observe(scroller);

    return () => {
      observer.disconnect();
      interactions.forEach((type) =>
        scroller.removeEventListener(type, onInteract),
      );
      animations.forEach((animation) => animation.cancel());
    };
  }, [scrollerRef, media, distance, duration, visibleRatio]);
};
