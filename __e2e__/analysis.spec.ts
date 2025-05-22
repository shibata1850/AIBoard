import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Document analysis flow', () => {
  test.beforeEach(async ({ page }) => {
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
    
    await page.route('**/api/analyze', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ 
          text: 'This is a sample analysis result for your document. It shows various financial metrics and recommendations.'
        })
      });
    });
    
    await page.route('**/rest/v1/business_documents', async (route) => {
      await route.fulfill({ status: 200 });
    });
    
    await page.route('**/rest/v1/document_analyses', async (route) => {
      await route.fulfill({ status: 200 });
    });
  });

  test('analysis page allows file upload', async ({ page }) => {
    await page.goto('/analysis');
    
    await expect(page.getByText('経営資料分析')).toBeVisible();
    await expect(page.getByText('ファイルをアップロードして分析')).toBeVisible();
    
    await page.evaluate(() => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.id = 'mock-file-input';
      document.body.appendChild(fileInput);
    });
    
    const testFile = path.join(__dirname, 'fixtures/test.pdf');
    await page.locator('#mock-file-input').setInputFiles(testFile);
    
    await page.evaluate(() => {
      const event = new CustomEvent('fileSelected', {
        detail: {
          name: 'test.pdf',
          type: 'application/pdf',
          content: 'base64content'
        }
      });
      window.dispatchEvent(event);
    });
    
    await expect(page.getByText('分析中...')).toBeVisible();
    await expect(page.getByText('test.pdf の分析結果')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('This is a sample analysis result')).toBeVisible();
    
    await expect(page.getByText('新しい分析')).toBeVisible();
  });

  test('document type selection works', async ({ page }) => {
    await page.goto('/analysis');
    
    await page.getByText('貸借対照表').click();
    await expect(page.getByText('貸借対照表')).toHaveClass(/backgroundColor/);
    
    await page.getByText('損益計算書').click();
    await expect(page.getByText('損益計算書')).toHaveClass(/backgroundColor/);
    
    await page.getByText('事業計画書').click();
    await expect(page.getByText('事業計画書')).toHaveClass(/backgroundColor/);
  });
});
