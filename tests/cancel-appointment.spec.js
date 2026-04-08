// tests/cancel-appointment.spec.js
import { test, expect } from "@playwright/test";

test.describe("Client - Cancel Appointment", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");

    // Log in as client
    await page.getByPlaceholder("Enter username").fill("client");
    await page.getByPlaceholder("Enter password").fill("barber1234");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Navigate to My Appointments
    await page.getByRole("button", { name: /my appointments/i }).click();
  });

  test("should display upcoming appointments with a cancel button", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /my appointments/i })).toBeVisible();

    // At least one upcoming appointment should be visible (from seed data)
    const cancelButton = page.getByRole("button", { name: /cancel appointment/i }).first();
    await expect(cancelButton).toBeVisible();
  });

  test("should cancel an upcoming appointment and update its status", async ({ page }) => {
    // Grab the first upcoming appointment card before cancelling
    const cancelButton = page.getByRole("button", { name: /cancel appointment/i }).first();
    await expect(cancelButton).toBeVisible();

    await cancelButton.click();

    // Cancel button should disappear for that appointment
    // (only future confirmed appointments show it)
    await expect(cancelButton).not.toBeVisible();

    // The appointment should now show a "Cancelled" status badge
    await expect(page.getByText("Cancelled").first()).toBeVisible();
  });

  test("should show a toast notification after cancellation", async ({ page }) => {
    const cancelButton = page.getByRole("button", { name: /cancel appointment/i }).first();
    await cancelButton.click();

    // Toast message should appear
    await expect(page.getByText(/appointment cancelled/i)).toBeVisible();

    // Toast should auto-dismiss after ~3.5s
    await expect(page.getByText(/appointment cancelled/i)).not.toBeVisible({ timeout: 5000 });
  });

  test("should move cancelled appointment to the past section", async ({ page }) => {
    const cancelButton = page.getByRole("button", { name: /cancel appointment/i }).first();
    await cancelButton.click();

    // The "Past" section should exist and contain the cancelled appointment
    await expect(page.getByText(/^past$/i)).toBeVisible();
    await expect(page.getByText("Cancelled").first()).toBeVisible();
  });

  test("should not show cancel button for past or already cancelled appointments", async ({ page }) => {
    // Cancel the first upcoming appointment
    const cancelButtons = page.getByRole("button", { name: /cancel appointment/i });
    const initialCount = await cancelButtons.count();

    await cancelButtons.first().click();

    // There should be one fewer cancel button now
    await expect(cancelButtons).toHaveCount(initialCount - 1);
  });
});
