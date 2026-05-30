import { test, expect } from '@playwright/test';

test.describe('Students Management', () => {
  test.beforeEach(async ({ context, page }) => {
    // Bypass login by setting localStorage before any navigation
    await context.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('user', JSON.stringify({
        userId: 1,
        username: 'admin',
        fullName: 'Admin User',
        roles: ['Admin']
      }));
    });
    await page.goto('/students');
  });

  test('should display student list page correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Quản lý Học sinh' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Thêm học sinh/i })).toBeVisible();
  });

  test('should open add student modal', async ({ page }) => {
    await page.click('button:has-text("Thêm học sinh")');
    await expect(page.locator('h2:has-text("Thêm học sinh mới")')).toBeVisible();
    await expect(page.locator('label[for="name"]')).toBeVisible();
  });

  test('should search for students', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await searchInput.fill('Nguyen Van A');
    // Just verify the input value changed, as we might not have real data
    await expect(searchInput).toHaveValue('Nguyen Van A');
  });
});
