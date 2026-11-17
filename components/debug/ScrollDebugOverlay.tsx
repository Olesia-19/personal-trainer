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
import { getIOSSignals, isIOSWebKit } from "@/lib/isIOSWebKit";
import styles from "./ScrollDebugOverlay.module.css";

gsap.registerPlugin(ScrollTrigger);

/** Frame-to-frame scrollY change that counts as a jump */
const JUMP_PX = 50;
const MAX_REFRESHES_SHOWN = 5;
const MAX_JUMPS_SHOWN = 4;
/** A jump this soon after a ScrollTrigger refresh is attributed to it */
const AFTER_REFRESH_MS = 300;

const noopSubscribe = () => () => {};
const readDebugFlag = () =>
  new URLSearchParams(window.location.search).get("debug") === "1";

type RefreshEntry = { t: number; yBefore: number; yAfter: number; ih: number };
type JumpEntry = {
  t: number;
  from: number;
  to: number;
  ih: number;
  /** ms since the last refresh, or null when it wasn't within AFTER_REFRESH_MS */
  afterRefreshMs: number | null;
};

const seconds = (ms: number) => (ms / 1000).toFixed(2);

const DebugPanel = () => {
  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const output = outputRef.current;
    if (!output) return;

    const refreshes: RefreshEntry[] = [];
    const jumps: JumpEntry[] = [];
    let refreshCount = 0;
    let lastRefreshAt = -Infinity;
    let afterRefreshJumps = 0;
    let lastInnerHeight = window.innerHeight;
    let innerHeightChanges = 0;
    let pendingY = 0;
    let lastY = window.scrollY;
    let rafId = 0;
    const ios = getIOSSignals();
    const iosOn = isIOSWebKit();
    const vv = window.visualViewport;

    const onRefreshInit = () => {
      pendingY = window.scrollY;
    };
    const onRefresh = () => {
      refreshCount += 1;
      lastRefreshAt = performance.now();
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

    /** Reads the live state of each iOS fix, not just the detection flag. */
    const describeFixes = () => {
      const heroTrigger = ScrollTrigger.getAll().find(
        (trigger) =>
          (trigger.pin as HTMLElement | undefined)?.getAttribute(
            "aria-labelledby",
          ) === "hero-heading",
      );
      const heroPin = heroTrigger?.pin as HTMLElement | undefined;
      const spacerPainted = !!heroPin?.parentElement?.style.backgroundColor;
      const noAnticipate = heroTrigger ? !heroTrigger.vars.anticipatePin : false;
      const on = (value: boolean) => (value ? "on" : "off");
      return `fix A ${on(iosOn)}, B ${on(spacerPainted)}, C ${on(noAnticipate)}`;
    };

    const render = () => {
      const now = performance.now();
      const y = window.scrollY;
      if (window.innerHeight !== lastInnerHeight) {
        innerHeightChanges += 1;
        lastInnerHeight = window.innerHeight;
      }
      if (Math.abs(y - lastY) > JUMP_PX) {
        const sinceRefresh = now - lastRefreshAt;
        const afterRefresh = sinceRefresh <= AFTER_REFRESH_MS;
        if (afterRefresh) afterRefreshJumps += 1;
        jumps.unshift({
          t: now,
          from: Math.round(lastY),
          to: Math.round(y),
          ih: window.innerHeight,
          afterRefreshMs: afterRefresh ? Math.round(sinceRefresh) : null,
        });
        jumps.length = Math.min(jumps.length, MAX_JUMPS_SHOWN);
      }
      lastY = y;

      output.textContent = [
        `t ${seconds(now)}s  ${describeFixes()}`,
        `scrollY ${Math.round(y)}  innerH ${window.innerHeight} (changed ${innerHeightChanges}x)`,
        `vv.h ${vv ? Math.round(vv.height) : "n/a"}  vv.top ${vv ? Math.round(vv.offsetTop) : "n/a"}`,
        `docH ${document.documentElement.scrollHeight}`,
        `iOS ${iosOn ? "YES" : "no"}: callout ${ios.touchCallout ? "Y" : "N"} ua ${ios.iDeviceUA ? "Y" : "N"} ipadMac ${ios.iPadAsMac ? "Y" : "N"}  isTouch ${ScrollTrigger.isTouch}`,
        describePins(),
        `refreshes ${refreshCount}`,
        ...refreshes.map(
          (r) =>
            `  @${seconds(r.t)}s y ${r.yBefore}->${r.yAfter} ih ${r.ih}`,
        ),
        `jumps>${JUMP_PX}px  after refresh (<=${AFTER_REFRESH_MS}ms): ${afterRefreshJumps}`,
        ...jumps.map(
          (j) =>
            `  @${seconds(j.t)}s ${j.from}->${j.to} ih ${j.ih} ${j.afterRefreshMs === null ? "flick" : `AFTER REFRESH +${j.afterRefreshMs}ms`}`,
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
