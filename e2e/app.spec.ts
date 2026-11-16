import { expect, test } from '@playwright/test';

test('shows the login form for a logged out user', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('ion-title')).toContainText('Přihlášení');
});
