import { test, expect } from '@playwright/test';

test.describe('Voice Transcription', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for testing
    await page.addInitScript(() => {
      window.localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'mock-token',
        user: { id: 'test-user', email: 'test@example.com' }
      }));
    });
    
    await page.goto('/app/transcription');
  });

  test('should display transcription interface', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Enhanced Voice Transcription');
    await expect(page.locator('button')).toContainText('Start');
  });

  test('should show browser compatibility warning for unsupported browsers', async ({ page }) => {
    // Mock unsupported browser
    await page.addInitScript(() => {
      delete (window as any).SpeechRecognition;
      delete (window as any).webkitSpeechRecognition;
    });
    
    await page.reload();
    await expect(page.locator('text=Browser Not Supported')).toBeVisible();
  });

  test('should enable/disable action buttons based on content', async ({ page }) => {
    // Initially buttons should be disabled
    await expect(page.locator('button:has-text("Copy Text")')).toBeDisabled();
    await expect(page.locator('button:has-text("Download")')).toBeDisabled();
    await expect(page.locator('button:has-text("Clear")')).toBeDisabled();
  });

  test('should display language selection', async ({ page }) => {
    const languageSelect = page.locator('select');
    await expect(languageSelect).toBeVisible();
    await expect(languageSelect.locator('option[value="en-US"]')).toContainText('English (US)');
  });

  test('should show settings panel when settings button is clicked', async ({ page }) => {
    await page.click('button[aria-label="Settings"]');
    await expect(page.locator('text=Advanced Settings')).toBeVisible();
    await expect(page.locator('text=Auto-restart sessions')).toBeVisible();
  });
});