// Dumps the data-test attributes and form structure of the Toolshop pages.
// Used once, in CI, to learn the real attribute names before writing page objects.
// Output: ci-out/discovery.md
import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

const BASE = 'https://practicesoftwaretesting.com';
const API = 'https://api.practicesoftwaretesting.com';
const out = [];
const log = (s = '') => out.push(s);

async function dump(page, title) {
  log(`\n## ${title}`);
  log(`URL: ${page.url()}`);
  const rows = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('[data-test]'));
    return els.slice(0, 200).map((el) => {
      const text = (el.innerText || el.value || el.getAttribute('placeholder') || '').trim().replace(/\s+/g, ' ').slice(0, 60);
      return `${el.tagName.toLowerCase()}${el.getAttribute('type') ? '[type=' + el.getAttribute('type') + ']' : ''} | data-test="${el.getAttribute('data-test')}" | ${text}`;
    });
  });
  log('```');
  rows.forEach((r) => log(r));
  log('```');
  const headings = await page.evaluate(() => Array.from(document.querySelectorAll('h1,h2,h3')).map((h) => h.tagName + ': ' + h.innerText.trim()).slice(0, 15));
  log('Headings: ' + headings.join(' | '));
  const alerts = await page.evaluate(() => Array.from(document.querySelectorAll('.alert, [role=alert], .help-block, .text-danger')).map((a) => a.className + ' :: ' + a.innerText.trim().slice(0, 80)).slice(0, 10));
  if (alerts.length) log('Alerts: ' + alerts.join(' || '));
}

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.setDefaultTimeout(20000);

try {
  // API: products and a sample product
  const res = await fetch(`${API}/products?page=1`);
  const json = await res.json();
  log('## API /products?page=1');
  log('```');
  log(JSON.stringify({ total: json.total, per_page: json.per_page, first: json.data?.slice(0, 3).map((p) => ({ id: p.id, name: p.name, price: p.price, in_stock: p.in_stock })) }, null, 2));
  log('```');
  const first = json.data?.[0];
  const second = json.data?.[1];

  await page.goto(BASE + '/');
  await page.waitForLoadState('networkidle');
  await dump(page, 'Home');

  await page.goto(BASE + '/auth/login');
  await page.waitForLoadState('networkidle');
  await dump(page, 'Login');
  // invalid login to see the error element
  await page.locator('[data-test="email"]').fill('nobody@example.com');
  await page.locator('[data-test="password"]').fill('wrongpass1');
  await page.locator('[data-test="login-submit"]').click();
  await page.waitForTimeout(2500);
  await dump(page, 'Login after invalid credentials');

  await page.goto(BASE + '/auth/register');
  await page.waitForLoadState('networkidle');
  await dump(page, 'Register');
  // submit empty to see validation messages
  await page.locator('[data-test="register-submit"]').click().catch(() => {});
  await page.waitForTimeout(1500);
  await dump(page, 'Register after empty submit');

  await page.goto(BASE + '/auth/forgot-password');
  await page.waitForLoadState('networkidle');
  await dump(page, 'Forgot password');
  const fp = page.locator('[data-test="email"]');
  if (await fp.count()) {
    await fp.fill('customer@practicesoftwaretesting.com');
    await page.locator('[data-test="forgot-password-submit"]').click().catch(() => {});
    await page.waitForTimeout(2500);
    await dump(page, 'Forgot password after known email');
    await page.goto(BASE + '/auth/forgot-password');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-test="email"]').fill('not-an-email');
    await page.locator('[data-test="forgot-password-submit"]').click().catch(() => {});
    await page.waitForTimeout(1500);
    await dump(page, 'Forgot password after invalid email');
  }

  if (first) {
    await page.goto(`${BASE}/product/${first.id}`);
    await page.waitForLoadState('networkidle');
    await dump(page, `Product ${first.name}`);
    await page.locator('[data-test="add-to-cart"]').click();
    await page.waitForTimeout(2500);
    await dump(page, 'Product after add to cart');
    await page.goto(BASE + '/checkout');
    await page.waitForLoadState('networkidle');
    await dump(page, 'Checkout step 1 (cart), anonymous');
  }

  // login as seeded customer and look at account + checkout flow
  await page.goto(BASE + '/auth/login');
  await page.locator('[data-test="email"]').fill('customer@practicesoftwaretesting.com');
  await page.locator('[data-test="password"]').fill('welcome01');
  await page.locator('[data-test="login-submit"]').click();
  await page.waitForTimeout(3000);
  await dump(page, 'After valid login');
  await page.goto(BASE + '/checkout');
  await page.waitForLoadState('networkidle');
  await dump(page, 'Checkout step 1 (cart), logged in');
  const proceed1 = page.locator('[data-test="proceed-1"]');
  if (await proceed1.count()) {
    await proceed1.click();
    await page.waitForTimeout(1500);
    await dump(page, 'Checkout step 2 (sign in)');
    const proceed2 = page.locator('[data-test="proceed-2"]');
    if (await proceed2.count()) {
      await proceed2.click();
      await page.waitForTimeout(1500);
      await dump(page, 'Checkout step 3 (billing address)');
      const proceed3 = page.locator('[data-test="proceed-3"]');
      if (await proceed3.count()) {
        // fill any empty address fields with placeholders to reach payment
        for (const f of ['street', 'city', 'state', 'country', 'postal_code', 'postcode']) {
          const l = page.locator(`[data-test="${f}"]`);
          if (await l.count() && !(await l.inputValue())) await l.fill(f === 'postal_code' || f === 'postcode' ? '050000' : 'Test ' + f);
        }
        await proceed3.click();
        await page.waitForTimeout(1500);
        await dump(page, 'Checkout step 4 (payment)');
        const pm = page.locator('[data-test="payment-method"]');
        if (await pm.count()) {
          const opts = await pm.locator('option').allTextContents();
          log('Payment options: ' + opts.join(' | '));
          const vals = await pm.locator('option').evaluateAll((os) => os.map((o) => o.value));
          log('Payment values: ' + vals.join(' | '));
        }
      }
    }
  }
  if (second) {
    await page.goto(`${BASE}/product/${second.id}`);
    await page.waitForLoadState('networkidle');
    await dump(page, `Product 2 ${second.name}`);
  }
} catch (e) {
  log('\n## ERROR\n```\n' + (e && e.stack ? e.stack : String(e)) + '\n```');
} finally {
  mkdirSync('ci-out', { recursive: true });
  writeFileSync('ci-out/discovery.md', out.join('\n'));
  await browser.close();
}
