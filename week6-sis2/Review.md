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

## 4. Things the AI decided that the student should check

| # | Decision | Where |
|---|----------|-------|
| D1 | The `data-test` names (`first-name`, `postal_code`, `proceed-1..3`, `payment-method`, `finish`, `payment-success-message`, `login-error`, `register-error`, `email-error`, `nav-menu`, `cart-quantity`, `product-title`, `product-quantity`, `line-price`, `cart-total`) were written from memory of the Toolshop, not read from the live build. `npm run discover` prints the real ones. | `pages/*.ts` |
| D2 | Country is selected by ISO code `KZ` in the register form and by label `Kazakhstan` in checkout; one of these may need to change once the real `<select>` values are known. | `data/user.factory.ts`, `buy-product.spec.ts` |
| D3 | Payment method value `cash-on-delivery`. | `buy-product.spec.ts` |
| D4 | Expected error texts: "already exists", "Invalid email or password", and a success message matched loosely with `/sent|success|mail/i` for the password reset. | specs |
| D5 | The cart rows are located with `tbody tr` (a tag selector). If the live table exposes a row-level `data-test`, switch to it. | `cart.page.ts` |

## 5. Verification log (live runs)

To be filled in from the first local run: date, machine, `npx playwright test` summary, each failing test, its cause (wrong attribute name, wrong expected text, real site behaviour) and the fix commit. Until this section has a green run recorded, the suite is a reviewed draft, not a verified one.

| Run | Date | Result | Failures and fixes |
|-----|------|--------|--------------------|
| 1 | 2026-10-23 | GitHub Actions, 0/9 passed | All tests blocked by the Cloudflare bot check before reaching the app. Not a suite defect. See R2. |
| 2 | | | |

## 6. Three checks before commit (from the Week 5 rules)

| Check | Status |
|-------|--------|
| Run against a deliberately broken build (`with-bugs.practicesoftwaretesting.com`) and confirm the suite goes red | Pending the local run |
| Read every locator: no CSS class, no positional XPath | Done (R1) |
| Break one expected value and confirm the failure message names the behaviour | Pending the local run |
