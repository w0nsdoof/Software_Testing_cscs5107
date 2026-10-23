# Review

What the AI produced, how it was reviewed and changed, and why.

## 1. What the AI produced

Branch `ai-raw-draft-sis2` (commit `7c420e5`) holds the first draft exactly as generated:

- `playwright.config.ts` with `baseURL`, `testIdAttribute: 'data-test'`, `trace: 'on-first-retry'`, retries in CI only, `screenshot: 'on'`, `fullyParallel: true`.
- Seven page objects (`login`, `register`, `forgot-password`, `product`, `home`, `cart`, `checkout`) on a `BasePage` that owns the navigation elements (`cart-quantity`, `nav-menu`, `page-title`).
- Two fixture files merged with `mergeTests`: page objects, and an API helper that reads in-stock products from `api.practicesoftwaretesting.com` so tests do not hard-code a product.
- `data/user.factory.ts`: seeded customer plus a `newUser()` factory with a unique email per call.
- Five specs, nine tests, mapped to TC-01 to TC-05 in `Description.md`.
- `tools/discover.mjs`: visits every page the suite touches and prints each element's `data-test` value, text and type, including the error states (invalid login, duplicate registration, invalid reset email) and the four checkout steps.
- A GitHub Actions workflow (removed later, see 3).

## 2. Review against the grading criteria

| Criterion | Check performed | Result |
|-----------|-----------------|--------|
| No locator in a spec file | `grep -n "getBy\|locator(" tests/` | Zero matches. Specs only call page-object methods and assert on page-object getters. |
| No `waitForTimeout` | `grep -rn waitForTimeout tests pages fixtures` | Zero matches in the suite. The only occurrence is in `tools/discover.mjs`, a one-off DOM dump that is not a test. |
| No CSS class or positional XPath | Read every locator in `pages/` | All `getByTestId` or `getByRole`, except two tag selectors in `cart.page.ts` (`tbody tr`) and the product cards in `home.page.ts` (`a.card`, a class). |
| Unique data per run | `data/user.factory.ts` | Email `sis2.<timestamp><random>@example.com`; last name carries the suffix too. |
| Independent tests | Config and specs | `fullyParallel: true`; each test gets a fresh context; the two-product cart test adds both products itself. |
| Every test has an assertion that can fail | Read each spec | Yes. Each test asserts URL plus visible state, and the buy test asserts name, quantity, price, total and the payment message. |
| At least one fixture | `fixtures/` | Two, merged. |
| Compiles | `npx tsc --noEmit` and `npx playwright test --list` | Clean; 9 tests in 5 files listed. |

## 3. Changes made after the raw draft, and why

| # | Change | Reason |
|---|--------|--------|
| R1 | Deleted `pages/home.page.ts` and its fixture | Its only locator was `a.card`, a CSS class, which the brief forbids. No spec used it: products are opened by id from the API instead. |
| R2 | Removed the GitHub Actions workflow and the `ci-results` publishing step (branch `ci-results` still exists on GitHub and can be deleted) | The first CI run (run 2 of the workflow) failed all 9 tests on a Cloudflare "Performing security verification" page. The site blocks datacenter IPs. Automating a click on a bot check is not acceptable, and the lecturer will run the suite from a laptop anyway, so cloud execution was abandoned. The failure screenshot is kept in `screenshots/` as evidence. |
| R3 | Added the `house_number` field to the register page object and `houseNumber` to the user factory; street is now `Tole bi`, number `59` (`ec1881d`) | The live register form has a required `house_number` input (`npm run discover`). Without it the form never submits, so both TC-01 tests stayed on `/auth/register`. |
| R4 | New `customer` fixture in `fixtures/api.fixture.ts`: registers a fresh account through `POST /users/register` for each test. Login, checkout and password-reset tests use it; `existingCustomer` was deleted from the factory (`009dc78`) | The seeded account `customer@practicesoftwaretesting.com` is locked on the shared site ("Account locked, too many failed attempts. Please contact the administrator."), confirmed through the UI and the API. Every class's wrong-password test hits that account, so it cannot be relied on. The wrong-password test now uses its own fresh account (one failed attempt), so this suite no longer adds to the lockout. The duplicate-email test still uses the seeded address: registration does not care about the lock. |
| R5 | Password-reset confirmation asserted with `toHaveText('page.forgot-password.confirm')` instead of `/sent\|success\|mail/i` (`632bba6`) | The live success alert (`role="alert"`, green) shows the untranslated i18n key, not a sentence. The assertion now pins the exact text the site shows, which is stricter than the original pattern. The untranslated key is itself a localisation defect on the site. |
| R6 | Checkout address step: country set with `selectOption`, house number filled, and street/city/state filled only after the `/postcode-lookup` response (`040689a`) | `fill()` on the country `<select>` throws. The profile prefill arrives asynchronously, so "fill only empty fields" raced it. Entering postcode + house number triggers a lookup that overwrites street, city and state with a made-up US address ("Lake Daniela, California"); when it landed after our fills, `POST /invoices` returned 422 "The city does not belong to the selected country". That failed 5 of 10 runs at 4 workers. After the fix: 10 of 10. The wait uses `waitForResponse`, not a sleep. |
| R7 | After "Payment was successful", click the same button again (`confirmOrder()`, label "Confirm") before asserting the order confirmation (`040689a`) | On the live site the first click only checks the payment; the second places the order and shows "Thanks for your order! Your invoice number is INV-…". |
| R8 | Order confirmation locator narrowed from `/thanks for your order\|order was placed\|invoice/i` + `.first()` to `/thanks for your order/i` (`040689a`) | `.first()` picked the hidden "My invoices" link in the signed-in user menu, so `toBeVisible()` could never pass. |
| R9 | `tools/discover.mjs`: nine `waitForTimeout` calls replaced by waits for the element each step produces (`01ab2c6`) | The rule is "no `waitForTimeout` anywhere", and the script is in the repository. Re-ran `npm run discover` afterwards: same sections and data. |

Outcome of the section 4 decisions on the live site: D1 all names correct except the missing `house_number` (R3); D2 `KZ` is the option value and `Kazakhstan` its label, both valid; D3 `cash-on-delivery` is correct; D4 "already exists" and "Invalid email or password" correct, reset text wrong (R5); D5 the cart table has no row-level `data-test`, `tbody tr` kept.

## 4. Things the AI decided that the student should check

| # | Decision | Where |
|---|----------|-------|
| D1 | The `data-test` names (`first-name`, `postal_code`, `proceed-1..3`, `payment-method`, `finish`, `payment-success-message`, `login-error`, `register-error`, `email-error`, `nav-menu`, `cart-quantity`, `product-title`, `product-quantity`, `line-price`, `cart-total`) were written from memory of the Toolshop, not read from the live build. `npm run discover` prints the real ones. | `pages/*.ts` |
| D2 | Country is selected by ISO code `KZ` in the register form and by label `Kazakhstan` in checkout; one of these may need to change once the real `<select>` values are known. | `data/user.factory.ts`, `buy-product.spec.ts` |
| D3 | Payment method value `cash-on-delivery`. | `buy-product.spec.ts` |
| D4 | Expected error texts: "already exists", "Invalid email or password", and a success message matched loosely with `/sent|success|mail/i` for the password reset. | specs |
| D5 | The cart rows are located with `tbody tr` (a tag selector). If the live table exposes a row-level `data-test`, switch to it. | `cart.page.ts` |

## 5. Verification log (live runs)

Local runs on 2026-10-23, Ubuntu 26.04.1 LTS (12 cores), Node 24.18.0, Playwright 1.49.1, Chromium headless, default config (6 workers), against https://practicesoftwaretesting.com. The site was reachable from a home connection; no Cloudflare check.

| Run | Date | Result | Failures and fixes |
|-----|------|--------|--------------------|
| 1 | 2026-10-23 | GitHub Actions, 0/9 passed | All tests blocked by the Cloudflare bot check before reaching the app. Not a suite defect. See R2. |
| 2 | 2026-10-23 | Local, 3/9 passed | TC-02a and TC-02b: seeded account locked (R4). TC-01a and TC-01b: required `house_number` empty, form not submitted (R3). TC-05a: no confirmation matched (R4, R5). TC-03: `proceed-2` never appeared because the inline sign-in was refused for the locked account (R4). |
| 3 | 2026-10-23 | Local, 8/9 passed | TC-03: `fill()` on the country `<select>` (R6). |
| 4 | 2026-10-23 | Local, TC-03 failing | Order confirmation never visible: second click missing (R7) and `.first()` on the hidden "My invoices" link (R8). |
| 5 | 2026-10-23 | TC-03 `--repeat-each=10 --workers=4`, 5/10 passed | `POST /invoices` 422, postcode lookup overwrote the address (found in the trace's network log) (R6). |
| 6 | 2026-10-23 | TC-03 `--repeat-each=10 --workers=4`, 10/10 passed | After R6. |
| 7 | 2026-10-23 | `npx playwright test`: 9/9 passed (13.8s) | |
| 8 | 2026-10-23 | `npx playwright test --workers=4`: 9/9 passed (13.7s) | Parallel independence. |
| 9 | 2026-10-23 | `npx playwright test --repeat-each=2`: 18/18 passed (19.0s) | Order independence; every repeat registers its own customer. |
| 10 | 2026-10-23 | with-bugs build, 0/9 passed | See section 6: not a valid signal. |
| 11 | 2026-10-23 19:48 Almaty | Final `npx playwright test`: 9/9 passed (11.9s) | Recorded in `screenshots/03-local-run-*.png`. |

## 6. Three checks before commit (from the Week 5 rules)

| Check | Status |
|-------|--------|
| Run against a deliberately broken build (`with-bugs.practicesoftwaretesting.com`) and confirm the suite goes red | Ran, 0/9 passed, but **not valid evidence**. The with-bugs build is an older generation of the app: it uses hash routes (`/#/auth/login`; `/auth/login` returns Apache 404), so all 9 failed on the first element lookup. A second, uncommitted run with hash routes and `api-with-bugs` got further and still failed 8/9 on structural differences: the register API wants a flat `address` and rejects digits in the last name, products have no `in_stock` field, and the register form has no `street` field. None of these failures is an assertion catching a seeded bug. Evidence that the assertions assert comes from run 2 above, where `toContainText(/invalid email or password/i)` caught the real "Account locked" message, and from the third check. |
| Read every locator: no CSS class, no positional XPath | Done (R1) |
| Break one expected value and confirm the failure message names the behaviour | Done. Changed the TC-03 cart badge expectation from `'1'` to `'2'` (reverted, not committed). Failure: `expect(locator).toHaveText(expected)`, `Locator: getByTestId('cart-quantity')`, `Expected string: "2"`, `Received string: "1"`. It names the cart badge and the wrong count. |
