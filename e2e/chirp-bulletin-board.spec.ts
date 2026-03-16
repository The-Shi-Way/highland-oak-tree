const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const results = [];

  const BASE = 'http://localhost:3000';
  const API = 'http://localhost:3001/api';

  // Helper
  function log(name, passed, detail = '') {
    const icon = passed ? '✅' : '❌';
    results.push(`${icon} ${name}${detail ? ': ' + detail : ''}`);
  }

  try {
    // ── 1. Bulletin Board page loads ──
    await page.goto(`${BASE}/bulletin-board`, { waitUntil: 'networkidle' });
    const bbTitle = await page.title();
    log('Bulletin Board page loads', bbTitle.includes('Bulletin Board'), bbTitle);

    // ── 2. Header visible ──
    const headerVisible = await page.locator('.bulletin-title').isVisible();
    log('Bulletin Board header visible', headerVisible);

    // ── 3. Description visible ──
    const descVisible = await page.locator('.bulletin-desc').isVisible();
    log('Bulletin Board description visible', descVisible);

    // ── 4. Empty state or chirp list shown ──
    await page.waitForSelector('.chirp-list, .empty-state', { timeout: 10000 });
    const hasChirps = await page.locator('.chirp-list').isVisible().catch(() => false);
    const hasEmpty = await page.locator('.empty-state').isVisible().catch(() => false);
    log('Bulletin Board shows content or empty state', hasChirps || hasEmpty);

    // ── 5. Admin chirps page loads ──
    await page.goto(`${BASE}/admin/chirps`, { waitUntil: 'networkidle' });
    const adminTitle = await page.title();
    log('Admin Chirps page loads', adminTitle.includes('Chirps'), adminTitle);

    // ── 6. New Chirp button visible ──
    const newBtnVisible = await page.locator('button:has-text("New Chirp")').isVisible();
    log('New Chirp button visible', newBtnVisible);

    // ── 7. Clicking New Chirp shows form ──
    await page.locator('button:has-text("New Chirp")').click();
    const formVisible = await page.locator('.chirp-form').isVisible();
    log('Form appears on New Chirp click', formVisible);

    // ── 8. Form has title and body fields ──
    const titleInput = await page.locator('.chirp-form input[placeholder="Title"]').isVisible();
    const bodyInput = await page.locator('.chirp-form textarea[placeholder="Body"]').isVisible();
    log('Form has title and body fields', titleInput && bodyInput);

    // ── 9. Cancel hides form ──
    await page.locator('button:has-text("Cancel")').click();
    const formHidden = !(await page.locator('.chirp-form').isVisible());
    log('Cancel hides form', formHidden);

    // ── 10. Public API: GET /chirps ──
    const apiPage = await context.newPage();
    const chirpsRes = await apiPage.request.get(`${API}/chirps`);
    const chirpsOk = chirpsRes.ok();
    let chirpsBody = null;
    if (chirpsOk) {
      chirpsBody = await chirpsRes.json();
    }
    log('GET /api/chirps returns 200', chirpsOk);
    log('GET /api/chirps has chirps array', chirpsBody && Array.isArray(chirpsBody.chirps));
    log('GET /api/chirps has total/page/limit', chirpsBody && 'total' in chirpsBody && 'page' in chirpsBody && 'limit' in chirpsBody);

    // ── 11. Public API: pagination ──
    const paginatedRes = await apiPage.request.get(`${API}/chirps?page=1&limit=5`);
    const paginatedBody = await paginatedRes.json();
    log('GET /api/chirps pagination works', paginatedBody.page === 1 && paginatedBody.limit === 5);

    // ── 12. Auth guard: GET /chirps/admin/all ──
    const adminAllRes = await apiPage.request.get(`${API}/chirps/admin/all`);
    log('GET /api/chirps/admin/all returns 401', adminAllRes.status() === 401);

    // ── 13. Auth guard: POST /chirps ──
    const createRes = await apiPage.request.post(`${API}/chirps`, {
      data: { title: 'Test', body: 'Test body' },
    });
    log('POST /api/chirps returns 401', createRes.status() === 401);

    // ── 14. Auth guard: DELETE /chirps/:id ──
    const deleteRes = await apiPage.request.delete(`${API}/chirps/fake-id`);
    log('DELETE /api/chirps/:id returns 401', deleteRes.status() === 401);

    await apiPage.close();
  } catch (err) {
    log('UNEXPECTED ERROR', false, String(err));
  }

  await browser.close();

  // Print results
  console.log('\n🐦 Chirp Bulletin Board E2E Test Results\n');
  console.log('─'.repeat(50));
  results.forEach((r) => console.log(r));
  console.log('─'.repeat(50));
  const passed = results.filter((r) => r.startsWith('✅')).length;
  const failed = results.filter((r) => r.startsWith('❌')).length;
  console.log(`\n${passed} passed, ${failed} failed out of ${results.length} tests`);
  if (failed > 0) process.exit(1);
})();
