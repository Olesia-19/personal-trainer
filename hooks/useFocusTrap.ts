"use client";

import { RefObject, useEffect } from "react";

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Focusable elements that are actually rendered (skips display: none). */
const getFocusable = (container: HTMLElement) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter((element) => element.getClientRects().length > 0);

type UseFocusTrapOptions = {
  containerRef: RefObject<HTMLElement | null>;
  active: boolean;
  onEscape: () => void;
  /** Element to focus on activation; defaults to the first focusable one. */
  initialFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * While `active`: moves focus into the container, keeps Tab / Shift+Tab
 * cycling inside it, and calls `onEscape` on Escape.
 * Restoring focus on close is left to the caller.
 */
export const useFocusTrap = ({
  containerRef,
  active,
  onEscape,
  initialFocusRef,
}: UseFocusTrapOptions) => {
  useEffect(() => {
    if (!active) {
      return;
    }

    // Wait a frame so elements revealed by a visibility transition can take focus.
    const frame = requestAnimationFrame(() => {
      const container = containerRef.current;
      const target =
        initialFocusRef?.current ??
        (container ? getFocusable(container)[0] : undefined);
      target?.focus();
    });

    return () => cancelAnimationFrame(frame);
  }, [active, containerRef, initialFocusRef]);

  useEffect(() => {
    if (!active) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const container = containerRef.current;
      if (!container) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        onEscape();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = getFocusable(container);
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const index = focusable.indexOf(document.activeElement as HTMLElement);

      if (index === -1) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && index === 0) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && index === focusable.length - 1) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [active, containerRef, onEscape]);
};
