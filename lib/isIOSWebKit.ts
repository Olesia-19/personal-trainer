/**
 * iOS / iPadOS WebKit detection (Safari, and in-app browsers such as
 * Telegram that use WKWebView). Client-only: call it inside effects or event
 * handlers, never during render, so server and client markup always match.
 *
 * Three independent signals, any one is enough:
 * - touchCallout: `-webkit-touch-callout` is implemented only by iOS/iPadOS
 *   WebKit (not macOS Safari, Blink or Gecko), so it doesn't depend on the UA.
 * - iDeviceUA: iPhone / iPod / iPad in the user agent (iPad in mobile mode).
 * - iPadAsMac: iPadOS 13+ requests desktop sites with a Mac UA and
 *   platform "MacIntel"; no Mac has a touchscreen (maxTouchPoints is 0).
 */

export type IOSSignals = {
  touchCallout: boolean;
  iDeviceUA: boolean;
  iPadAsMac: boolean;
};

let cached: boolean | null = null;

export const getIOSSignals = (): IOSSignals => {
  if (typeof window === "undefined") {
    return { touchCallout: false, iDeviceUA: false, iPadAsMac: false };
  }
  return {
    touchCallout:
      typeof CSS !== "undefined" &&
      CSS.supports("-webkit-touch-callout", "none"),
    iDeviceUA: /iP(hone|od|ad)/.test(navigator.userAgent),
    iPadAsMac:
      navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1,
  };
};

export const isIOSWebKit = (): boolean => {
  if (typeof window === "undefined") return false;
  if (cached === null) {
    const { touchCallout, iDeviceUA, iPadAsMac } = getIOSSignals();
    cached = touchCallout || iDeviceUA || iPadAsMac;
  }
  return cached;
};
