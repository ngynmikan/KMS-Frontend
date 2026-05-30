import { test, expect } from '@playwright/test';

test.describe('Classes Management', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.addInitScript(() => {
      window.localStorage.setItem('token', 'mock-token');
      window.localStorage.setItem('user', JSON.stringify({
        userId: 1,
        username: 'admin',
        fullName: 'Admin User',
        roles: ['Admin']
      }));
    });
    await page.goto('/classes');
  });

  test('should display class list page correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Quản lý Lớp học' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Tạo lớp mới/i })).toBeVisible();
  });

  test('should open create class modal', async ({ page }) => {
    await page.click('button:has-text("Tạo lớp mới")');
    await expect(page.locator('h2:has-text("Tạo lớp học mới")')).toBeVisible();
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator('label[for="room"]')).toBeVisible();
  });

  test('should search for classes', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await searchInput.fill('Mầm Chồi');
    await expect(searchInput).toHaveValue('Mầm Chồi');
  });
});
