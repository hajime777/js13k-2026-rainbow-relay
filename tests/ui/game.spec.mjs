import { test, expect } from '@playwright/test';

function percentValue(text) {
  return Number.parseInt(String(text).replace('%', ''), 10) || 0;
}

async function dragAlongRainbow(page) {
  const canvas = page.locator('#c');
  const box = await canvas.boundingBox();
  if (!box) throw new Error('Canvas bounding box is unavailable');

  const W = box.width;
  const H = box.height;
  const cx = box.x + W * 0.5;
  const cy = box.y + H * 0.92;
  const base = Math.min(W * 0.43, H * 0.72);
  const band = Math.max(8, Math.min(15, W / 90));
  const radius = base - band * 3;
  const start = Math.PI * 1.06;
  const end = Math.PI * 1.94;
  const steps = 42;

  const first = {
    x: cx + Math.cos(start) * radius,
    y: cy + Math.sin(start) * radius,
  };

  await page.mouse.move(first.x, first.y);
  await page.mouse.down();

  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const angle = start + (end - start) * t;
    await page.mouse.move(
      cx + Math.cos(angle) * radius,
      cy + Math.sin(angle) * radius,
      { steps: 2 },
    );
  }

  await page.mouse.up();
}

test.describe('Rainbow Relay prototype UI', () => {
  test('boots without page errors and starts at 0%', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto('/');

    await expect(page.locator('.title')).toHaveText('Rainbow Sky Cleaner');
    await expect(page.locator('#pct')).toHaveText('0%');
    await expect(page.locator('#c')).toBeVisible();
    await expect(page.locator('#reset')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test('dragging over the hidden rainbow increases reveal progress and Restart resets it', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');

    await dragAlongRainbow(page);

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

    await dragAlongRainbow(page);

    await expect.poll(async () => {
      return percentValue(await page.locator('#pct').textContent());
    }).toBeGreaterThan(20);
  });
});
