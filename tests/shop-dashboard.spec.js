// tests/shop-dashboard.spec.js
import { test, expect } from "@playwright/test";

test.describe("Shop - Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Enter username").fill("shop");
    await page.getByPlaceholder("Enter password").fill("shop1234");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByRole("heading", { name: /today's dashboard/i })).toBeVisible();
  });

  test("should display today's summary stats", async ({ page }) => {
    await expect(page.getByText(/today's bookings/i)).toBeVisible();
    await expect(page.getByText(/confirmed/i).first()).toBeVisible();
    await expect(page.getByText(/completed/i).first()).toBeVisible();
    await expect(page.getByText(/barbers on/i)).toBeVisible();
  });

  test("should display today's appointment list", async ({ page }) => {
    await expect(page.getByText(/all appointments today/i)).toBeVisible();
    // Seed data has confirmed appointments today for shop1
    await expect(page.getByText("Alex Turner")).toBeVisible();
  });

  test("should mark an appointment as Completed", async ({ page }) => {
    const doneButton = page.getByRole("button", { name: /done/i }).first();
    await expect(doneButton).toBeVisible();
    await doneButton.click();

    await expect(page.getByText("Completed").first()).toBeVisible();
    await expect(page.getByText(/marked as completed/i)).toBeVisible();
  });

  test("should mark an appointment as No-Show", async ({ page }) => {
    const noShowButton = page.getByRole("button", { name: /no-show/i }).first();
    await expect(noShowButton).toBeVisible();
    await noShowButton.click();

    await expect(page.getByText("No-Show").first()).toBeVisible();
    await expect(page.getByText(/marked as no-show/i)).toBeVisible();
  });

  test("should hide Done and No-Show buttons after status is updated", async ({ page }) => {
    const firstRow = page.locator("div.bg-white.rounded-xl.border").first();
    const doneBtn = firstRow.getByRole("button", { name: /done/i });
    await doneBtn.click();

    // After marking done, that row's action buttons should be gone
    await expect(doneBtn).not.toBeVisible();
  });

  test("should show a toast after marking as Completed", async ({ page }) => {
    await page.getByRole("button", { name: /done/i }).first().click();
    await expect(page.getByText(/marked as completed/i)).toBeVisible();
    // Toast auto-dismisses after 3.5s
    await expect(page.getByText(/marked as completed/i)).not.toBeVisible({ timeout: 5000 });
  });
});
