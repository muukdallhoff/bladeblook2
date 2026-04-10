// tests/book-appointment.spec.js
import { test, expect } from "@playwright/test";

test.describe("Client - Book Appointment", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Enter username").fill("client");
    await page.getByPlaceholder("Enter password").fill("barber1234");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByRole("heading", { name: /find your barber/i })).toBeVisible();
  });

  test("should display the list of shops on the home screen", async ({ page }) => {
    await expect(page.getByText("The Sharp Edge")).toBeVisible();
    await expect(page.getByText("Blade & Bone")).toBeVisible();
  });

  test("should navigate to shop detail and show barbers", async ({ page }) => {
    await page.getByText("The Sharp Edge").click();
    await expect(page.getByRole("heading", { name: /the sharp edge/i })).toBeVisible();
    await expect(page.getByText("Marcus Webb")).toBeVisible();
    await expect(page.getByText("Jordan Ellis")).toBeVisible();
  });

  test("should navigate to the booking calendar when selecting a barber", async ({ page }) => {
    await page.getByText("The Sharp Edge").click();
    await page.getByText("Marcus Webb").click();
    // Barber header card should be visible on the booking screen
    await expect(page.getByRole("heading", { name: /marcus webb/i })).toBeVisible();
    await expect(page.getByText("The Sharp Edge")).toBeVisible();
  });

  test("should complete a full booking and land on My Appointments", async ({ page }) => {
    // Navigate to barber
    await page.getByText("The Sharp Edge").click();
    await page.getByText("Jordan Ellis").click();

    // Navigate to next week to find a free slot (avoids today's already-booked/past slots)
    await page.getByRole("button", { name: "›" }).click();

    // Click the first available (non-red, non-greyed) slot
    const availableSlot = page
      .locator("div.border-l.border-gray-100.min-h-8")
      .filter({ hasNot: page.locator("span.text-red-400") })
      .first();
    await availableSlot.click();

    // Should land on confirm step
    await expect(page.getByRole("heading", { name: /confirm appointment/i })).toBeVisible();
    await expect(page.getByText(/jordan ellis/i)).toBeVisible();

    // Fill in the form
    const nameInput = page.getByPlaceholder("Full name");
    await nameInput.clear();
    await nameInput.fill("Alex Turner");
    await page.getByPlaceholder("555-0000").fill("555-9999");

    // Select "Beard Trim" service
    await page.getByRole("button", { name: /beard trim/i }).click();

    // Confirm
    await page.getByRole("button", { name: /confirm booking/i }).click();

    // Should land on My Appointments with the new booking visible
    await expect(page.getByRole("heading", { name: /my appointments/i })).toBeVisible();
    await expect(page.getByText("Confirmed").first()).toBeVisible();
  });

  test("should show a success toast after booking", async ({ page }) => {
    await page.getByText("The Sharp Edge").click();
    await page.getByText("Jordan Ellis").click();
    await page.getByRole("button", { name: "›" }).click();

    const availableSlot = page
      .locator("div.border-l.border-gray-100.min-h-8")
      .filter({ hasNot: page.locator("span.text-red-400") })
      .first();
    await availableSlot.click();

    await page.getByPlaceholder("Full name").clear();
    await page.getByPlaceholder("Full name").fill("Alex Turner");
    await page.getByPlaceholder("555-0000").fill("555-9999");
    await page.getByRole("button", { name: /confirm booking/i }).click();

    await expect(page.getByText(/appointment booked with jordan ellis/i)).toBeVisible();
  });

  test("should disable Confirm Booking button when name or phone is empty", async ({ page }) => {
    await page.getByText("The Sharp Edge").click();
    await page.getByText("Jordan Ellis").click();
    await page.getByRole("button", { name: "›" }).click();

    const availableSlot = page
      .locator("div.border-l.border-gray-100.min-h-8")
      .filter({ hasNot: page.locator("span.text-red-400") })
      .first();
    await availableSlot.click();

    // Clear the pre-filled name and leave phone empty
    await page.getByPlaceholder("Full name").clear();
    await expect(page.getByRole("button", { name: /confirm booking/i })).toBeDisabled();
  });

  test("should go back from confirm step to the calendar", async ({ page }) => {
    await page.getByText("The Sharp Edge").click();
    await page.getByText("Marcus Webb").click();
    await page.getByRole("button", { name: "›" }).click();

    const availableSlot = page
      .locator("div.border-l.border-gray-100.min-h-8")
      .filter({ hasNot: page.locator("span.text-red-400") })
      .first();
    await availableSlot.click();

    await expect(page.getByRole("heading", { name: /confirm appointment/i })).toBeVisible();
    await page.getByRole("button", { name: /^back$/i }).click();

    // Should be back on the calendar
    await expect(page.getByText(/booked/i)).toBeVisible(); // legend item
  });
});
