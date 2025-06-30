import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display landing page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/Echofy\.ai/);
    await expect(page.locator('h1')).toContainText('The Future of Voice AI');
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*signup/);
    await expect(page.locator('h2')).toContainText('Create your account');
  });

  test('should navigate to signin page', async ({ page }) => {
    await page.click('text=Sign In');
    await expect(page).toHaveURL(/.*signin/);
    await expect(page.locator('h2')).toContainText('Welcome back');
  });

  test('should show validation errors on empty signup form', async ({ page }) => {
    await page.goto('/signup');
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('should show password strength indicator', async ({ page }) => {
    await page.goto('/signup');
    await page.fill('input[name="password"]', 'weak');
    await expect(page.locator('text=Weak')).toBeVisible();
    
    await page.fill('input[name="password"]', 'StrongPassword123!');
    await expect(page.locator('text=Strong')).toBeVisible();
  });

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/signup');
    const passwordInput = page.locator('input[name="password"]');
    const toggleButton = page.locator('button[type="button"]').first();
    
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
  });
});