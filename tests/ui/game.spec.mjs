import { test, expect } from '@playwright/test';

function percentValue(text) {
  return Number.parseInt(String(text).replace('%', ''), 10) || 0;
}

async function scrubRainbowArea(page) {
  const canvas = page.locator('#c');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas bounding box is unavailable');

  const left = box.x + box.width * 0.08;
  const right = box.x + box.width * 0.92;
  const rows = 9;

  for (let i = 0; i < rows; i++) {
    const y = box.y + box.height * (0.24 + i * 0.075);
    const from = i % 2 === 0 ? left : right;
    const to = i % 2 === 0 ? right : left;
    await page.mouse.move(from, y);
    await page.mouse.down();
    await page.mouse.move(to, y, { steps: 8 });
    await page.mouse.up();
  }
}

test.describe('Rainbow Relay prototype UI', () => {
  test('boots without page errors and starts at 0%', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    await expect(page.locator('.title')).toHaveText('Rainbow Sky Cleaner');
    await expect(page.locator('#pct')).toHaveText('0%');
    await expect(page.locator('#c')).toBeVisible();
    await expect(page.locator('#reset')).toBeVisible();

    const canvasBox = await page.locator('#c').boundingBox();
    expect(canvasBox).not.toBeNull();
    expect(canvasBox.height).toBeGreaterThan(canvasBox.width);
    expect(canvasBox.width / canvasBox.height).toBeCloseTo(9 / 16, 2);
    expect(pageErrors).toEqual([]);
  });

  test('scrubbing the visible sky increases reveal progress and Restart resets it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    await scrubRainbowArea(page);

    await expect.poll(async () => {
      return percentValue(await page.locator('#pct').textContent());
    }).toBeGreaterThan(20);

    await page.locator('#reset').click();
    await expect(page.locator('#pct')).toHaveText('0%');
  });

  test('portrait viewport remains usable without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    await expect(page.locator('#c')).toBeVisible();
    await expect(page.locator('#pct')).toHaveText('0%');
    await expect(page.locator('#reset')).toBeVisible();

    const layout = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      innerHeight: window.innerHeight,
      scrollHeight: document.documentElement.scrollHeight,
    }));

    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
    expect(layout.scrollHeight).toBeLessThanOrEqual(layout.innerHeight + 1);
  });

  test('basic play still works with external network requests blocked', async ({ page }) => {
    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') {
        await route.continue();
      } else {
        await route.abort();
      }
    });

    await page.goto('/');
    await expect(page.locator('#pct')).toHaveText('0%');

    await scrubRainbowArea(page);

    await expect.poll(async () => {
      return percentValue(await page.locator('#pct').textContent());
    }).toBeGreaterThan(20);
  });
});
