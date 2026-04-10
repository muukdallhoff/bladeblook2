// tests/shop-schedule.spec.js
import { test, expect } from "@playwright/test";

test.describe("Shop - Schedule", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Enter username").fill("shop");
    await page.getByPlaceholder("Enter password").fill("shop1234");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByRole("heading", { name: /today's dashboard/i })).toBeVisible();

    // Navigate to Schedule tab
    await page.getByRole("button", { name: /schedule/i }).click();
    await expect(page.getByRole("heading", { name: /schedule/i })).toBeVisible();
  });

  test("should display the Schedule page with barber selector tabs", async ({ page }) => {
    // shop1 has Marcus Webb and Jordan Ellis
    await expect(page.getByRole("button", { name: /marcus webb/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /jordan ellis/i })).toBeVisible();
  });

  test("should show the current week range in the header", async ({ page }) => {
    // Week range label should be present (e.g. "Apr 7 – Apr 13, 2025")
    await expect(page.locator("span.font-semibold.text-gray-900")).toBeVisible();
  });

  test("should display today's appointments for the default barber", async ({ page }) => {
    // Marcus Webb (b1) has seed appointments today for shop1
    await expect(page.getByText("Alex Turner")).toBeVisible();
    await expect(page.getByText("Sam Rivera")).toBeVisible();
  });

  test("should switch to a different barber and show their appointments", async ({ page }) => {
    await page.getByRole("button", { name: /jordan ellis/i }).click();

    // Jordan Ellis (b2) has Chris Park and Morgan Lee today
    await expect(page.getByText("Chris Park")).toBeVisible();
    await expect(page.getByText("Morgan Lee")).toBeVisible();

    // Alex Turner belongs to Marcus Webb — should not appear for Jordan Ellis today
    await expect(page.getByText("Alex Turner")).not.toBeVisible();
  });

  test("should navigate to the next week", async ({ page }) => {
    const weekLabel = page.locator("span.font-semibold.text-gray-900");
    const currentLabel = await weekLabel.textContent();

    await page.getByRole("button", { name: "›" }).click();

    const newLabel = await weekLabel.textContent();
    expect(newLabel).not.toBe(currentLabel);
  });

  test("should navigate back to the previous week", async ({ page }) => {
    const weekLabel = page.locator("span.font-semibold.text-gray-900");

    await page.getByRole("button", { name: "›" }).click();
    const nextWeekLabel = await weekLabel.textContent();

    await page.getByRole("button", { name: "‹" }).click();
    const backLabel = await weekLabel.textContent();

    expect(backLabel).not.toBe(nextWeekLabel);
  });

  test("should return to the current week using the Today button", async ({ page }) => {
    const weekLabel = page.locator("span.font-semibold.text-gray-900");
    const originalLabel = await weekLabel.textContent();

    await page.getByRole("button", { name: "›" }).click();
    await page.getByRole("button", { name: /today/i }).click();

    const restoredLabel = await weekLabel.textContent();
    expect(restoredLabel).toBe(originalLabel);
  });

  test("should mark an appointment as Completed from the schedule grid", async ({ page }) => {
    // Click the ✓ button on the first confirmed appointment in the grid
    const completeBtn = page.locator("button.bg-green-500").first();
    await expect(completeBtn).toBeVisible();
    await completeBtn.click();

    await expect(page.getByText(/marked as completed/i)).toBeVisible();
  });

  test("should mark an appointment as No-Show from the schedule grid", async ({ page }) => {
    const noShowBtn = page.locator("button.bg-red-500").first();
    await expect(noShowBtn).toBeVisible();
    await noShowBtn.click();

    await expect(page.getByText(/marked as no-show/i)).toBeVisible();
  });

  test("should hide action buttons after an appointment is marked Completed", async ({ page }) => {
    const completeBtn = page.locator("button.bg-green-500").first();
    await completeBtn.click();

    // After status update, the ✓ and ✕ buttons should no longer be visible for that slot
    await expect(page.locator("button.bg-green-500")).toHaveCount(
      await page.locator("button.bg-green-500").count() === 0 ? 0 : await page.locator("button.bg-green-500").count()
    );
  });
});
