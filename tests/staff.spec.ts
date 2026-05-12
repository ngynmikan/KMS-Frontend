import { test, expect } from '@playwright/test';

test.describe('Staff Management', () => {
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
    await page.goto('/staff');
  });

  test('should display staff list page correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Quản lý Nhân sự' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Thêm nhân viên/i })).toBeVisible();
  });

  test('should open add staff modal', async ({ page }) => {
    await page.click('button:has-text("Thêm nhân viên")');
    await expect(page.locator('h2:has-text("Thêm nhân viên mới")')).toBeVisible();
    await expect(page.locator('label[for="name"]')).toBeVisible();
    await expect(page.locator('label[for="role"]')).toBeVisible();
  });

  test('should filter staff by role', async ({ page }) => {
    const roleSelect = page.locator('select');
    await roleSelect.selectOption({ label: 'Giáo viên' });
    await expect(roleSelect).toHaveValue('Giáo viên');
  });
});
