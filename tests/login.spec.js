// tests/login.spec.js
import { test, expect } from "@playwright/test";

test.describe("Auth - Login", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  // ── Successful logins ──────────────────────────────────────────────────────

  test("should log in as client and land on the shop list", async ({ page }) => {
    await page.getByPlaceholder("Enter username").fill("client");
    await page.getByPlaceholder("Enter password").fill("barber1234");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Client home: "Find Your Barber" heading is visible
    await expect(page.getByRole("heading", { name: /find your barber/i })).toBeVisible();
  });

  test("should log in as shop manager and land on the dashboard", async ({ page }) => {
    await page.getByPlaceholder("Enter username").fill("shop");
    await page.getByPlaceholder("Enter password").fill("shop1234");
    await page.getByRole("button", { name: /sign in/i }).click();

    // Shop home: "Today's Dashboard" heading is visible
    await expect(page.getByRole("heading", { name: /today's dashboard/i })).toBeVisible();
  });

  // ── Failed login ───────────────────────────────────────────────────────────

  test("should show an error message for invalid credentials", async ({ page }) => {
    await page.getByPlaceholder("Enter username").fill("wrong");
    await page.getByPlaceholder("Enter password").fill("wrongpass");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    // Must stay on the login screen — no navigation occurs
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("should show an error for correct username but wrong password", async ({ page }) => {
    await page.getByPlaceholder("Enter username").fill("client");
    await page.getByPlaceholder("Enter password").fill("wrongpass");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  // ── Password visibility toggle ─────────────────────────────────────────────

  test("should toggle password visibility", async ({ page }) => {
    const passwordInput = page.getByPlaceholder("Enter password");
    await passwordInput.fill("barber1234");

    // Initially the input type is "password"
    await expect(passwordInput).toHaveAttribute("type", "password");

    // Click SHOW
    await page.getByRole("button", { name: /show/i }).click();
    await expect(passwordInput).toHaveAttribute("type", "text");

    // Click HIDE
    await page.getByRole("button", { name: /hide/i }).click();
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  // ── Sign out ───────────────────────────────────────────────────────────────

  test("should sign out and return to the login screen", async ({ page }) => {
    // Log in first
    await page.getByPlaceholder("Enter username").fill("client");
    await page.getByPlaceholder("Enter password").fill("barber1234");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByRole("heading", { name: /find your barber/i })).toBeVisible();

    // Sign out via the sidebar button
    await page.getByRole("button", { name: /sign out/i }).click();

    // Should be back on the login screen
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });
});
