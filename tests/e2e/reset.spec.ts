import { test, expect } from '@playwright/test';

const TEST_EMAIL = '';
const TEST_PASSWORD = '';

test('login and reset redux when clicking Trocar de empresa', async ({ page }) => {
  // go to login
  await page.goto('/login');

  // fill form
  await page.fill('#email', TEST_EMAIL);
  await page.fill('#password', TEST_PASSWORD);

  // click connect
  await page.click('text=Conectar');

  // wait for navigation; the app should redirect to /access/company-selection
  await page.waitForURL('**/access/company-selection', { timeout: 15000 });

  // navigate to a page where the sidebar is visible (new order)
  await page.goto('/pages/new-order');
  await page.waitForLoadState('networkidle');

  // set a fake persisted state to simulate existing store
  await page.evaluate(() => {
    // Set a sentinel value
    localStorage.setItem('persist:root', JSON.stringify({ test: 'value' }));
  });

  // ensure the key is set
  const before = await page.evaluate(() => localStorage.getItem('persist:root'));
  expect(before).not.toBeNull();

  // hover the sidebar to expand it (desktop behaviour) and then click the "Trocar de empresa" button
  // attempt a direct click; use force in case the sidebar is collapsed / overlapping
  await page.click('text=Trocar de empresa', { force: true });

  // wait for navigation to company selection
  await page.waitForURL('**/access/company-selection', { timeout: 15000 });

  // check localStorage is cleared
  const after = await page.evaluate(() => localStorage.getItem('persist:root'));
  expect(after).toBeNull();
});
