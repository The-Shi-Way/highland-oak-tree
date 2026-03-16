import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:3000';
const API = 'http://localhost:3001/api';

// ── Public Pages ─────────────────────────────────────
test.describe('Public Pages', () => {
  test('Homepage loads with tree branding', async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/Highland Oak Tree/);
  });

  test('Canopy page loads', async ({ page }) => {
    await page.goto(`${BASE}/canopy`);
    await expect(page).toHaveTitle(/Canopy/);
  });

  test('Prose branch page loads', async ({ page }) => {
    await page.goto(`${BASE}/prose`);
    await expect(page).toHaveTitle(/Prose/);
  });

  test('Blossom branch page loads', async ({ page }) => {
    await page.goto(`${BASE}/blossom`);
    await expect(page).toHaveTitle(/Blossom/);
  });

  test('Fruit branch page loads', async ({ page }) => {
    await page.goto(`${BASE}/fruit`);
    await expect(page).toHaveTitle(/Fruit/);
  });

  test('Seed branch page loads', async ({ page }) => {
    await page.goto(`${BASE}/seed`);
    await expect(page).toHaveTitle(/Seed/);
  });

  test('Grove page loads', async ({ page }) => {
    await page.goto(`${BASE}/grove`);
    await expect(page).toHaveTitle(/Grove/);
  });

  test('Roots page loads', async ({ page }) => {
    await page.goto(`${BASE}/roots`);
    await expect(page).toHaveTitle(/Roots/);
  });

  test('Forest Floor page loads', async ({ page }) => {
    await page.goto(`${BASE}/forest-floor`);
    await expect(page).toHaveTitle(/Forest Floor/);
  });

  test('Growth Rings page loads', async ({ page }) => {
    await page.goto(`${BASE}/growth-rings`);
    await expect(page).toHaveTitle(/Growth Rings/);
  });

  test('Search page loads', async ({ page }) => {
    await page.goto(`${BASE}/search`);
    await expect(page).toHaveTitle(/Search/);
  });
});

// ── Admin Pages ──────────────────────────────────────
test.describe('Admin Pages', () => {
  test('Admin login page loads', async ({ page }) => {
    await page.goto(`${BASE}/admin/login`);
    await expect(page).toHaveTitle(/Login/);
  });

  test('Admin dashboard loads', async ({ page }) => {
    await page.goto(`${BASE}/admin`);
    await expect(page).toHaveTitle(/Dashboard/);
  });

  test('Admin leaves list loads', async ({ page }) => {
    await page.goto(`${BASE}/admin/leaves`);
    await expect(page).toHaveTitle(/Leaves/);
  });

  test('Admin grove page loads', async ({ page }) => {
    await page.goto(`${BASE}/admin/grove`);
    await expect(page).toHaveTitle(/Grove/);
  });

  test('Admin media page loads', async ({ page }) => {
    await page.goto(`${BASE}/admin/media`);
    await expect(page).toHaveTitle(/Media/);
  });
});

// ── Public API Endpoints ─────────────────────────────
test.describe('Public API Endpoints', () => {
  test('GET /api/leaves/canopy returns published leaves', async ({ request }) => {
    const res = await request.get(`${API}/leaves/canopy`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('leaves');
  });

  test('GET /api/leaves/trunk returns homepage feed', async ({ request }) => {
    const res = await request.get(`${API}/leaves/trunk`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('feed');
  });

  test('GET /api/leaves/branch/prose returns prose leaves', async ({ request }) => {
    const res = await request.get(`${API}/leaves/branch/prose`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('leaves');
  });

  test('GET /api/leaves/forest-floor returns archive', async ({ request }) => {
    const res = await request.get(`${API}/leaves/forest-floor`);
    expect(res.ok()).toBeTruthy();
  });

  test('GET /api/grove returns JSON', async ({ request }) => {
    const res = await request.get(`${API}/grove`);
    expect(res.ok()).toBeTruthy();
  });

  test('GET /api/search returns results', async ({ request }) => {
    const res = await request.get(`${API}/search`);
    expect(res.ok()).toBeTruthy();
  });

  test('GET /api/feed returns RSS XML', async ({ request }) => {
    const res = await request.get(`${API}/feed`);
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toContain('xml');
  });

  test('GET /api/sitemap.xml returns sitemap', async ({ request }) => {
    const res = await request.get(`${API}/sitemap.xml`);
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toContain('xml');
  });

  test('GET /api/robots.txt returns robots', async ({ request }) => {
    const res = await request.get(`${API}/robots.txt`);
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text.toLowerCase()).toContain('user-agent');
  });

  test('GET /api/prose/feed returns leaf-type feed', async ({ request }) => {
    const res = await request.get(`${API}/prose/feed`);
    expect(res.ok()).toBeTruthy();
  });
});

// ── Auth-Guarded API Endpoints ───────────────────────
test.describe('Auth-Guarded API Endpoints', () => {
  test('GET /api/dashboard/stats returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${API}/dashboard/stats`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/dashboard/recent returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${API}/dashboard/recent`);
    expect(res.status()).toBe(401);
  });

  test('GET /api/leaves/admin/all returns 401 without auth', async ({ request }) => {
    const res = await request.get(`${API}/leaves/admin/all`);
    expect(res.status()).toBe(401);
  });
});
