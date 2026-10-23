# SIS 2: Test automation with Playwright

CSCS5107 Software Testing and Debugging, KBTU, Fall 2026. Student: Zhumabayev Askar.

End-to-end tests for the Toolshop, https://practicesoftwaretesting.com, written in TypeScript with `@playwright/test`.

## Run it

```bash
cd week6-sis2
npm ci
npx playwright install chromium
npx playwright test            # all five suites, in parallel, random worker order
npx playwright show-report     # HTML report with a screenshot of every test
```

Useful while developing:

```bash
npx playwright test --ui                       # watch mode, time travel
npx playwright test tests/login.spec.ts --headed
npm run discover                               # dumps the live data-test attributes to ci-out/discovery.md
```

Node 20 or newer. No environment variables are needed; the base URL is in `playwright.config.ts`.

## What is covered

| Spec | Test case from the Week 6 brief | What the test proves |
|------|--------------------------------|----------------------|
| `tests/register.spec.ts` | TC-01 Register a new customer | A unique account is created, the user lands on the login page, and the same credentials then open the account page. A second test checks that an existing email is rejected. |
| `tests/login.spec.ts` | TC-02 Log in | Valid credentials reach `/account` with the customer's name in the menu; a wrong password shows the error, stays on the login page and does not sign in. |
| `tests/buy-product.spec.ts` | TC-03 Buy a product | Add to cart, badge shows 1, cart shows the right item, quantity and price, four-step checkout completes with a payment success message. |
| `tests/compare-products.spec.ts` | TC-04 Compare two products | Opens two products, captures name and price, asserts they are distinct and match the catalogue API, and that the cheaper one in the UI is the cheaper one in the API. A second test puts both in the cart and checks the summed total. |
| `tests/reset-password.spec.ts` | TC-05 Reset a password | A known email gets a confirmation; an invalid email gets a validation error and stays on the page. |

Nine tests in five files. Every test creates the data it needs: registration uses a fresh email per run (`data/user.factory.ts`), the product tests pick in-stock products through the API instead of hard-coding one, and every test starts in its own browser context (empty cart, not signed in).

## Structure

```
tests/        one spec per test case; no locators here
pages/        one page object per screen; business actions, not element wrappers
fixtures/     page objects and an API helper handed to every test
data/         user factory (unique email per run)
tools/        discover.mjs: lists the live data-test attributes
screenshots/  evidence for the SIS 2 submission
playwright.config.ts
```

Config settings that matter: `baseURL`, `testIdAttribute: 'data-test'` (the Toolshop does not use `data-testid`), `trace: 'on-first-retry'`, `retries` only in CI, `screenshot: 'on'` so every test leaves a picture for the evidence folder.

Rules the suite follows: no `waitForTimeout`, no CSS classes and no positional XPath in locators, no locator in any spec file, tests pass alone, in parallel and in any order.

## What was not automated, and why

- The reset e-mail itself. The hosted Toolshop does not expose the mailbox, so TC-05 is scoped to the UI outcome (confirmation or validation error), as the brief allows.
- Product comparison as a feature. The Toolshop has no compare page, so TC-04 performs the comparison in the test (two product pages, name and price, assertions stated in the test) rather than exercising a feature that does not exist.
- The exact catalogue count or a fixed product. The site is shared and its stock changes, so tests ask the API for in-stock products at run time instead of asserting "there are 9 products".
- Payment by card. Cash on delivery is the simplest method that completes an order; card validation is a separate feature with its own test cases.

## Known dependency on the live site

The `data-test` attribute names in `pages/` were checked against the live build on 2026-10-23 (`npm run discover` prints them). See `Review.md` for the changes and the verification log.
