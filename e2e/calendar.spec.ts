import { test, expect } from "@playwright/test";
import { login, createAndOpenWorkspace } from "./helpers";

test.describe("Calendar tool", () => {
  test("//tools section is visible and contains Calendar", async ({ page }) => {
    await login(page);
    await createAndOpenWorkspace(page, `E2E Calendar ${Date.now()}`);

    await page.locator(".hamburger-btn").click();
    await expect(page.locator(".file-explorer[data-open='1']")).toBeVisible();

    await expect(page.locator(".tools-section-header")).toContainText("// tools");
    await expect(page.locator(".tools-item-label")).toContainText("Calendar");
  });

  test("clicking Calendar opens the overlay", async ({ page }) => {
    await login(page);
    await createAndOpenWorkspace(page, `E2E Calendar ${Date.now()}`);

    await page.locator(".hamburger-btn").click();
    await page.locator(".tools-item-label", { hasText: "Calendar" }).click();

    await expect(page.locator(".calendar-overlay")).toBeVisible();
    await expect(page.locator(".calendar-overlay-title")).toContainText("Calendar");

    await page.locator(".calendar-overlay-close").click();
    await expect(page.locator(".calendar-overlay")).not.toBeVisible();
  });

  test("clicking a day in month view switches to day view, clicking time creates event", async ({ page }) => {
    await login(page);
    await createAndOpenWorkspace(page, `E2E Calendar ${Date.now()}`);

    await page.locator(".hamburger-btn").click();
    await page.locator(".tools-item-label", { hasText: "Calendar" }).click();

    // click a day number in month view — switches to timeGridDay
    await page.locator(".fc-daygrid-day:not(.fc-other-month) .fc-daygrid-day-number").first().click();
    await expect(page.locator(".fc-timegrid")).toBeVisible();

    // now click a time slot in the day view — creates an event
    const createReq = page.waitForResponse(
      (r) => /\/projects\/.+\/calendar-events$/.test(r.url()) && r.request().method() === "POST",
      { timeout: 20_000 },
    );
    await page.locator(".fc-timegrid-slot").first().click();
    const created = await createReq;
    expect(created.ok()).toBeTruthy();
  });

  test("clicking an event opens editor panel with details", async ({ page }) => {
    await login(page);
    await createAndOpenWorkspace(page, `E2E Calendar ${Date.now()}`);

    await page.locator(".hamburger-btn").click();
    await page.locator(".tools-item-label", { hasText: "Calendar" }).click();

    // navigate to day view and create event
    await page.locator(".fc-daygrid-day:not(.fc-other-month) .fc-daygrid-day-number").first().click();
    const createReq = page.waitForResponse(
      (r) => /\/projects\/.+\/calendar-events$/.test(r.url()) && r.request().method() === "POST",
    );
    await page.locator(".fc-timegrid-slot").first().click();
    await createReq;

    // click the event pin
    await page.locator(".fc-event").first().click();

    // editor panel shows event details
    await expect(page.locator(".docpanel.is-open")).toBeVisible();
    await expect(page.locator(".docpanel-tag")).toContainText("EVENT");
  });

  test("events survive page reload", async ({ page }) => {
    await login(page);
    await createAndOpenWorkspace(page, `E2E Calendar ${Date.now()}`);

    await page.locator(".hamburger-btn").click();
    await page.locator(".tools-item-label", { hasText: "Calendar" }).click();

    // create event in day view
    await page.locator(".fc-daygrid-day:not(.fc-other-month) .fc-daygrid-day-number").first().click();
    const createReq = page.waitForResponse(
      (r) => /\/projects\/.+\/calendar-events$/.test(r.url()) && r.request().method() === "POST",
    );
    await page.locator(".fc-timegrid-slot").first().click();
    await createReq;

    // close calendar
    await page.locator(".calendar-overlay-close").click();

    // reload
    await page.reload();
    await page.locator(".hamburger-btn").click();

    // reopen — fetches from API
    const fetchReq = page.waitForResponse(
      (r) => /\/projects\/.+\/calendar-events$/.test(r.url()) && r.request().method() === "GET",
      { timeout: 20_000 },
    );
    await page.locator(".tools-item-label", { hasText: "Calendar" }).click();
    await fetchReq;

    // event should be visible in month view
    await expect(page.locator(".fc-event")).toBeVisible();
  });
});
