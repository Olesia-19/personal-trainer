import { webkit, chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3010";

const installFakeDate = (target, y, m0, d) =>
  target.addInitScript(
    ({ y, m0, d }) => {
      const RealDate = Date;
      const fixed = new RealDate(y, m0, d, 10, 0, 0, 0).getTime();
      class FakeDate extends RealDate {
        constructor(...args) {
          if (args.length === 0) super(fixed);
          else super(...args);
        }
        static now() {
          return fixed;
        }
      }
      FakeDate.parse = RealDate.parse;
      FakeDate.UTC = RealDate.UTC;
      globalThis.Date = FakeDate;
    },
    { y, m0, d },
  );

async function runSuite(engine, name) {
  const browser = await engine.launch();
  const result = { engine: name, hydrationErrors: [], layout: null, chips: null, flow: null };

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // Mock to a day AFTER typical build date (tomorrow relative to conversation date)
  await installFakeDate(context, 2026, 9, 20); // Tue Oct 20 2026 → chips Wed 21–Sun 25

  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (
      msg.type() === "error" ||
      /hydration|Hydration|did not match|Text content does not match/i.test(text)
    ) {
      consoleErrors.push(`[${msg.type()}] ${text}`);
    }
  });
  page.on("pageerror", (err) => consoleErrors.push(`[pageerror] ${err.message}`));

  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60000 });

  // Measure dateGrid height ASAP (placeholders) then after mount
  const before = await page.evaluate(() => {
    const grid = document.querySelector("#book [class*='dateGrid']");
    if (!grid) return null;
    const r = grid.getBoundingClientRect();
    const chips = [...grid.querySelectorAll("button")].map((b) => ({
      disabled: b.disabled,
      ariaHidden: b.getAttribute("aria-hidden"),
      text: b.textContent?.replace(/\s+/g, " ").trim(),
      h: b.getBoundingClientRect().height,
    }));
    return { height: r.height, width: r.width, chipCount: chips.length, chips };
  });

  // Wait for real chips (client effect)
  await page.waitForFunction(() => {
    const grid = document.querySelector("#book [class*='dateGrid']");
    if (!grid) return false;
    const btns = [...grid.querySelectorAll("button")];
    return btns.length === 5 && btns.every((b) => !b.disabled && (b.getAttribute("aria-label") || "").length > 0);
  }, { timeout: 10000 });

  await page.waitForTimeout(100);

  const after = await page.evaluate(() => {
    const grid = document.querySelector("#book [class*='dateGrid']");
    const r = grid.getBoundingClientRect();
    const labels = [...grid.querySelectorAll("button")].map((b) => b.getAttribute("aria-label"));
    const month = document.querySelector("#book [class*='monthLabel']")?.textContent?.trim();
    return { height: r.height, width: r.width, labels, month };
  });

  result.layout = {
    beforeHeight: before?.height,
    afterHeight: after.height,
    heightDelta: before ? Math.abs(before.height - after.height) : null,
    beforeWidth: before?.width,
    afterWidth: after.width,
    placeholderChipCount: before?.chipCount,
    placeholderSample: before?.chips?.[0],
  };
  result.chips = { month: after.month, labels: after.labels };
  result.hydrationErrors = consoleErrors;

  // Flow: select + summary + modal + submit
  await page.locator("#book").scrollIntoViewIfNeeded();
  await page.locator("#book button[aria-label]").first().click();
  await page.locator('#book button[aria-label="11:00 AM"]').click();
  const summaryDate = await page.locator("#book dl >> text=Date").locator("..").locator("dd").textContent();
  const summaryTime = await page.locator("#book dl >> text=Time").locator("..").locator("dd").textContent();
  await page.locator("#book button", { hasText: "Request Invitation" }).click();
  await page.waitForTimeout(200);
  const modalLine = await page.locator('[class*="modalSummary"]').first().textContent();
  await page.fill("#booking-name", "Test User");
  await page.fill("#booking-contact", "555-0100");
  await page.fill("#booking-email", "test@example.com");
  await page.locator('form[class*="modalForm"] button[type="submit"]').click();
  await page.waitForTimeout(300);
  const success = (await page.locator("text=Application Sent").count()) > 0;

  result.flow = {
    summaryDate: summaryDate?.trim(),
    summaryTime: summaryTime?.trim(),
    modalLine: modalLine?.trim(),
    success,
  };

  // Expected chips for Oct 20 2026 with offset 1: Oct 21–25
  const expected = [
    "Wednesday, October 21",
    "Thursday, October 22",
    "Friday, October 23",
    "Saturday, October 24",
    "Sunday, October 25",
  ];
  result.chipsCorrect =
    after.month === "October 2026" &&
    JSON.stringify(after.labels) === JSON.stringify(expected);
  result.noHydrationIssues = consoleErrors.length === 0;
  result.noLayoutShift = result.layout.heightDelta !== null && result.layout.heightDelta <= 1;

  await browser.close();
  return result;
}

const webkitResult = await runSuite(webkit, "webkit");
const chromiumResult = await runSuite(chromium, "chromium");

console.log(JSON.stringify({ webkitResult, chromiumResult }, null, 2));

const ok =
  webkitResult.noHydrationIssues &&
  webkitResult.chipsCorrect &&
  webkitResult.noLayoutShift &&
  webkitResult.flow.success &&
  chromiumResult.noHydrationIssues &&
  chromiumResult.chipsCorrect &&
  chromiumResult.flow.success;

process.exit(ok ? 0 : 1);
