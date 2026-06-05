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

  test("clicking Calendar navigates to the calendar page", async ({ page }) => {
    await login(page);
    await createAndOpenWorkspace(page, `E2E Calendar ${Date.now()}`);

    await page.locator(".hamburger-btn").click();
    await page.locator(".tools-item-label", { hasText: "Calendar" }).click();

    await expect(page).toHaveURL(/\/workspace\/.+\/calendar/);
    await expect(page.locator(".calendar-page")).toBeVisible();
    await expect(page.locator(".calendar-page-title")).toContainText("Calendar");
  });

  test("clicking a day in month view switches to day view, clicking time opens create popup", async ({ page }) => {
    await login(page);
    await createAndOpenWorkspace(page, `E2E Calendar ${Date.now()}`);

    await page.locator(".hamburger-btn").click();
    await page.locator(".tools-item-label", { hasText: "Calendar" }).click();
    await expect(page.locator(".calendar-page")).toBeVisible();

    // click a day number in month view — switches to timeGridDay
    await page.locator(".fc-daygrid-day:not(.fc-other-month) .fc-daygrid-day-number").first().click();
    await expect(page.locator(".fc-timegrid")).toBeVisible();

    // now click a time slot in the day view — opens create popup
    await page.locator(".fc-timegrid-slot").first().click();

    await expect(page.locator(".event-popup")).toBeVisible();
    await expect(page.locator(".event-popup-title")).toContainText("Create event");

    await page.locator(".event-popup-title-input").fill("Test Event");
    const createReq = page.waitForResponse(
      (r) => /\/projects\/.+\/calendar-events$/.test(r.url()) && r.request().method() === "POST",
      { timeout: 20_000 },
    );
    await page.locator(".event-popup-save-btn").click();
    const created = await createReq;
    expect(created.ok()).toBeTruthy();

    await expect(page.locator(".event-popup")).not.toBeVisible();
  });

  test("clicking an event in day view opens edit popup", async ({ page }) => {
    await login(page);
    await createAndOpenWorkspace(page, `E2E Calendar ${Date.now()}`);

    await page.locator(".hamburger-btn").click();
    await page.locator(".tools-item-label", { hasText: "Calendar" }).click();

    // navigate to day view via month view click
    await page.locator(".fc-daygrid-day:not(.fc-other-month) .fc-daygrid-day-number").first().click();

    // create event via slot click + popup
    await page.locator(".fc-timegrid-slot").first().click();
    await page.locator(".event-popup-title-input").fill("Click Test Event");
    const createReq = page.waitForResponse(
      (r) => /\/projects\/.+\/calendar-events$/.test(r.url()) && r.request().method() === "POST",
    );
    await page.locator(".event-popup-save-btn").click();
    await createReq;

    // Switch to day view and click the event block
    await page.locator(".fc-timeGridDay-button").click();
    await page.locator(".fc-timegrid-event").first().click();

    // edit popup shows event details
    await expect(page.locator(".event-popup")).toBeVisible();
    await expect(page.locator(".event-popup-title")).toContainText("Edit event");
    await expect(page.locator(".event-popup-title-input")).toHaveValue("Click Test Event");
  });

  test("events survive page reload", async ({ page }) => {
    await login(page);
    await createAndOpenWorkspace(page, `E2E Calendar ${Date.now()}`);

    await page.locator(".hamburger-btn").click();
    await page.locator(".tools-item-label", { hasText: "Calendar" }).click();

    // navigate to day view
    await page.locator(".fc-daygrid-day:not(.fc-other-month) .fc-daygrid-day-number").first().click();

    // create event via popup
    await page.locator(".fc-timegrid-slot").first().click();
    await page.locator(".event-popup-title-input").fill("Persisted Event");
    const createReq = page.waitForResponse(
      (r) => /\/projects\/.+\/calendar-events$/.test(r.url()) && r.request().method() === "POST",
    );
    await page.locator(".event-popup-save-btn").click();
    await createReq;

    // reload
    await page.reload();
    await page.locator(".hamburger-btn").click();

    // navigate back to calendar — fetches from API
    const fetchReq = page.waitForResponse(
      (r) => /\/projects\/.+\/calendar-events$/.test(r.url()) && r.request().method() === "GET",
      { timeout: 20_000 },
    );
    await page.locator(".tools-item-label", { hasText: "Calendar" }).click();
    await fetchReq;

    // events should have day-header dots in month view
    await expect(page.locator(".fc-day-header-dot").first()).toBeVisible();
  });
});
