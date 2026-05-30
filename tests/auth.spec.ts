import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('#username', 'wronguser');
    await page.fill('#password', 'wrongpass');
    await page.click('button[type="submit"]');
    
    // Check for error message - using a more flexible matcher
    const errorAlert = page.locator('.bg-destructive\\/10');
    await expect(errorAlert).toBeVisible();
    // It seems the server returns English error messages
    await expect(errorAlert).toContainText(/invalid|thất bại/i);
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Đăng ký ngay');
    await expect(page).toHaveURL(/\/register/);
  });
});

test.describe('Dashboard Navigation', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});
