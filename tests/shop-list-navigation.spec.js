// tests/shop-list-navigation.spec.js
import { test, expect } from "@playwright/test";

test.describe("Client - Shop List & Shop Detail Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Enter username").fill("client");
    await page.getByPlaceholder("Enter password").fill("barber1234");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByRole("heading", { name: /find your barber/i })).toBeVisible();
  });

  test("should display both shops with their names and ratings", async ({ page }) => {
    await expect(page.getByText("The Sharp Edge")).toBeVisible();
    await expect(page.getByText("Blade & Bone")).toBeVisible();
    await expect(page.getByText("4.8")).toBeVisible();
    await expect(page.getByText("4.6")).toBeVisible();
  });

  test("should display shop address and tagline", async ({ page }) => {
    await expect(page.getByText(/142 West 34th Street/i)).toBeVisible();
    await expect(page.getByText(/precision cuts/i)).toBeVisible();
  });

  test("should navigate to shop detail when clicking a shop card", async ({ page }) => {
    await page.getByText("The Sharp Edge").first().click();
    await expect(page.getByRole("heading", { name: /the sharp edge/i })).toBeVisible();
    await expect(page.getByText(/142 West 34th Street/i)).toBeVisible();
    await expect(page.getByText("4.8")).toBeVisible();
  });

  test("should show barbers for the selected shop", async ({ page }) => {
    await page.getByText("The Sharp Edge").first().click();
    await expect(page.getByRole("heading", { name: /our barbers/i })).toBeVisible();
    await expect(page.getByText("Marcus Webb")).toBeVisible();
    await expect(page.getByText("Jordan Ellis")).toBeVisible();
    // Barbers from the other shop should NOT appear
    await expect(page.getByText("Priya Okonkwo")).not.toBeVisible();
  });

  test("should show barber specialties on the detail page", async ({ page }) => {
    await expect(page.getByText("Fades")).toBeVisible();
    await expect(page.getByText("Classic Cuts")).toBeVisible();
  });

  test("should navigate back to the shop list from shop detail", async ({ page }) => {
    await page.getByText("The Sharp Edge").first().click();
    await expect(page.getByRole("heading", { name: /the sharp edge/i })).toBeVisible();

    await page.getByRole("button", { name: /back to shops/i }).click();
    await expect(page.getByRole("heading", { name: /find your barber/i })).toBeVisible();
  });

  test("should navigate to booking when clicking Book Now on a barber", async ({ page }) => {
    await page.getByText("The Sharp Edge").first().click();
    await page.getByText("Marcus Webb").click();
    await expect(page.getByRole("heading", { name: /marcus webb/i })).toBeVisible();
  });
});
