import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto('http://localhost:5174');
await page.waitForTimeout(3500);

// Navigate to groups
await page.evaluate(() => {
  function findAndClick(root, text) {
    for (const btn of root.querySelectorAll('button')) {
      if (btn.textContent?.trim() === text) { btn.click(); return true; }
    }
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot && findAndClick(el.shadowRoot, text)) return true;
    }
    return false;
  }
  findAndClick(document, 'Grupos');
});
await page.waitForTimeout(2000);

// Click first match
await page.evaluate(() => {
  function clickFirst(root, depth = 0) {
    if (depth > 10) return false;
    const item = root.querySelector('.match-item');
    if (item) { item.click(); return true; }
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot && clickFirst(el.shadowRoot, depth + 1)) return true;
    }
    return false;
  }
  clickFirst(document);
});
await page.waitForTimeout(2000);

// Screenshot at top (should show showdown + cronica)
await page.screenshot({ path: 'C:/tmp/modal-top.png' });

// Scroll to see pitch
await page.evaluate(() => {
  function scrollModal(root, depth = 0) {
    if (depth > 10) return;
    const body = root.querySelector('.modal-body');
    if (body) { body.scrollTop = 500; return; }
    for (const el of root.querySelectorAll('*')) {
      if (el.shadowRoot) scrollModal(el.shadowRoot, depth + 1);
    }
  }
  scrollModal(document);
});
await page.waitForTimeout(400);
await page.screenshot({ path: 'C:/tmp/modal-pitch.png' });

await browser.close();
console.log('Done');
