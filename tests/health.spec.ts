import { test, expect } from '@playwright/test';

test.describe('Health Management', () => {
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
    await page.goto('/health');
  });

  test('should display health page correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Quản lý Sức khỏe' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Lên lịch kiểm tra/i })).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.click('button:has-text("Sự cố y tế")');
    await expect(page.getByRole('button', { name: /Ghi nhận sự cố/i })).toBeVisible();
    
    await page.click('button:has-text("Kiểm tra định kỳ")');
    await expect(page.getByRole('button', { name: /Lên lịch kiểm tra/i })).toBeVisible();
  });

  test('should open health check modal', async ({ page }) => {
    await page.click('button:has-text("Lên lịch kiểm tra")');
    await expect(page.locator('h2:has-text("Thêm mới Phiếu kiểm tra sức khỏe")')).toBeVisible();
    await expect(page.locator('label:has-text("Ngày kiểm tra")')).toBeVisible();
  });

  test('should search in health checks', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Tìm kiếm"]');
    await searchInput.fill('Nguyen');
    await expect(searchInput).toHaveValue('Nguyen');
  });
});
