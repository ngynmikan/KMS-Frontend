import { test, expect } from '@playwright/test';

test.describe('Sidebar Navigation', () => {
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
    await page.goto('/dashboard');
  });

  test('should navigate to Students page', async ({ page }) => {
    await page.click('a:has-text("Học sinh")');
    await expect(page).toHaveURL(/\/students/);
    await expect(page.getByRole('heading', { name: 'Quản lý Học sinh' })).toBeVisible();
  });

  test('should navigate to Staff page', async ({ page }) => {
    await page.click('a:has-text("Nhân sự")');
    await expect(page).toHaveURL(/\/staff/);
    await expect(page.getByRole('heading', { name: 'Quản lý Nhân sự' })).toBeVisible();
  });

  test('should navigate to Classes page', async ({ page }) => {
    await page.click('a:has-text("Lớp học")');
    await expect(page).toHaveURL(/\/classes/);
    await expect(page.getByRole('heading', { name: 'Quản lý Lớp học' })).toBeVisible();
  });

  test('should navigate to Menu page', async ({ page }) => {
    await page.click('a:has-text("Thực đơn")');
    await expect(page).toHaveURL(/\/menu/);
    await expect(page.getByRole('heading', { name: 'Quản lý Thực đơn' })).toBeVisible();
  });

  test('should navigate to Billing page', async ({ page }) => {
    await page.click('a:has-text("Tài chính")');
    await expect(page).toHaveURL(/\/billing/);
    await expect(page.getByRole('heading', { name: 'Quản lý Tài chính' })).toBeVisible();
  });
});
