"use client";

/**
 * TEMPORARY scroll debug overlay for the iOS scroll investigation.
 * Enabled only with ?debug=1 in the URL; otherwise it renders nothing and
 * registers no listeners. Remove this file and its <ScrollDebugOverlay /> in
 * app/page.tsx once the iOS issue is fixed.
 */

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useSyncExternalStore } from "react";
import styles from "./ScrollDebugOverlay.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Frame-to-frame scrollY change that counts as a jump */
const JUMP_PX = 50;
const MAX_REFRESHES_SHOWN = 5;
const MAX_JUMPS_SHOWN = 3;

const noopSubscribe = () => () => {};
const readDebugFlag = () =>
  new URLSearchParams(window.location.search).get("debug") === "1";

type RefreshEntry = { t: number; yBefore: number; yAfter: number; ih: number };
type JumpEntry = { t: number; from: number; to: number; ih: number };

const seconds = (ms: number) => (ms / 1000).toFixed(2);

/** Each signal reported separately so the real device shows which one matched. */
const detectIOS = () => {
  const ua = navigator.userAgent;
  return {
    touchCallout:
      typeof CSS !== "undefined" &&
      CSS.supports("-webkit-touch-callout", "none"),
    iDeviceUA: /iP(hone|od|ad)/.test(ua),
    iPadAsMac: navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1,
  };
};

const DebugPanel = () => {
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const output = outputRef.current;
    if (!output) return;

    const refreshes: RefreshEntry[] = [];
    const jumps: JumpEntry[] = [];
    let refreshCount = 0;
    let pendingY = 0;
    let lastY = window.scrollY;
    let rafId = 0;
    const ios = detectIOS();
    const vv = window.visualViewport;

    const onRefreshInit = () => {
      pendingY = window.scrollY;
    };
    const onRefresh = () => {
      refreshCount += 1;
      refreshes.unshift({
        t: performance.now(),
        yBefore: Math.round(pendingY),
        yAfter: Math.round(window.scrollY),
        ih: window.innerHeight,
      });
      refreshes.length = Math.min(refreshes.length, MAX_REFRESHES_SHOWN);
    };

    const describePins = () => {
      const pins = ScrollTrigger.getAll().filter((trigger) => trigger.pin);
      if (pins.length === 0) return "pins: none";
      return pins
        .map((trigger) => {
          const pin = trigger.pin as HTMLElement;
          const spacer = pin.parentElement;
          const name = pin.getAttribute("aria-labelledby") ?? pin.className.split(" ")[0];
          return `${trigger.isActive ? "ACTIVE" : "idle"} ${name}: pinH ${pin.offsetHeight} spacerH ${spacer?.offsetHeight ?? "-"} dist ${Math.round(trigger.end - trigger.start)} pos ${getComputedStyle(pin).position}`;
        })
        .join("\n");
    };

    const render = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) > JUMP_PX) {
        jumps.unshift({
          t: performance.now(),
          from: Math.round(lastY),
          to: Math.round(y),
          ih: window.innerHeight,
        });
        jumps.length = Math.min(jumps.length, MAX_JUMPS_SHOWN);
      }
      lastY = y;

      output.textContent = [
        `t ${seconds(performance.now())}s`,
        `scrollY ${Math.round(y)}  innerH ${window.innerHeight}`,
        `vv.h ${vv ? Math.round(vv.height) : "n/a"}  vv.top ${vv ? Math.round(vv.offsetTop) : "n/a"}`,
        `docH ${document.documentElement.scrollHeight}`,
        `iOS callout ${ios.touchCallout ? "Y" : "N"} ua ${ios.iDeviceUA ? "Y" : "N"} ipadMac ${ios.iPadAsMac ? "Y" : "N"}  isTouch ${ScrollTrigger.isTouch}`,
        describePins(),
        `refreshes ${refreshCount}`,
        ...refreshes.map(
          (r) =>
            `  @${seconds(r.t)}s y ${r.yBefore}->${r.yAfter} ih ${r.ih}`,
        ),
        `jumps>${JUMP_PX}px (frame to frame)`,
        ...jumps.map(
          (j) => `  @${seconds(j.t)}s ${j.from}->${j.to} ih ${j.ih}`,
        ),
      ].join("\n");

      rafId = requestAnimationFrame(render);
    };

    ScrollTrigger.addEventListener("refreshInit", onRefreshInit);
    ScrollTrigger.addEventListener("refresh", onRefresh);
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      ScrollTrigger.removeEventListener("refreshInit", onRefreshInit);
      ScrollTrigger.removeEventListener("refresh", onRefresh);
    };
  }, []);

  return <pre ref={outputRef} className={styles.overlay} aria-hidden="true" />;
};

const ScrollDebugOverlay = () => {
  // Server snapshot false: no hydration mismatch, nothing rendered on the server.
  const enabled = useSyncExternalStore(noopSubscribe, readDebugFlag, () => false);
  return enabled ? <DebugPanel /> : null;
};

export default ScrollDebugOverlay;
