import { test, expect } from '@playwright/test';

test.describe('Authentication flow', () => {
  test('login page is accessible', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('AIボードにログイン')).toBeVisible();
    await expect(page.getByPlaceholder('メールアドレス')).toBeVisible();
    await expect(page.getByPlaceholder('パスワード')).toBeVisible();
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeVisible();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await page.route('**/auth/v1/token?grant_type=password', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          user: { id: 'test-user-id', email: 'test@example.com' }
        })
      });
    });
    
    await page.route('**/rest/v1/profiles**', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([{
          id: 'test-user-id',
          full_name: 'Test User',
          avatar_url: null
        }])
      });
    });

    await page.goto('/login');
    
    await page.getByPlaceholder('メールアドレス').fill('test@example.com');
    await page.getByPlaceholder('パスワード').fill('password');
    await page.getByRole('button', { name: 'ログイン' }).click();
    
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText('経営資料分析')).toBeVisible();
  });

  test('signup page is accessible', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByText('アカウント作成')).toBeVisible();
    await expect(page.getByPlaceholder('メールアドレス')).toBeVisible();
    await expect(page.getByPlaceholder('パスワード')).toBeVisible();
    await expect(page.getByRole('button', { name: '登録' })).toBeVisible();
  });

  test('logout works correctly', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        access_token: 'test-access-token',
        refresh_token: 'test-refresh-token',
        expires_at: Date.now() + 3600000
      }));
    });
    
    await page.route('**/auth/v1/user', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com'
        })
      });
    });
    
    await page.route('**/auth/v1/logout', async (route) => {
      await route.fulfill({ status: 200 });
    });

    await page.goto('/settings');
    
    await page.getByText('ログアウト').click();
    
    await page.getByRole('button', { name: '確認' }).click();
    
    await expect(page).toHaveURL(/\/login/);
  });
});
