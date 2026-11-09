# SIS 2: Test automation with Playwright

CSCS5107 Software Testing and Debugging, KBTU, Fall 2026. Student: Zhumabayev Askar.

End-to-end tests for the Toolshop, https://practicesoftwaretesting.com, written in TypeScript with `@playwright/test`.

## Run it

```bash
cd week6-sis2
npm ci
npx playwright install chromium
npx playwright test            # all five suites, in parallel, random worker order
npx playwright show-report     # HTML report of the run
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
| `tests/buy-product.spec.ts` | TC-03 Buy a product | Add to cart, badge shows 1, cart shows the right item, quantity and price, four-step checkout ends with "Payment was successful" and then "Thanks for your order". |
| `tests/compare-products.spec.ts` | TC-04 Compare two products | Adds two in-stock products to the comparison from their product pages, opens `/comparison` and checks that the table lists both names with their catalogue prices. A second test puts both in the cart and checks the summed total. |
| `tests/reset-password.spec.ts` | TC-05 Reset a password | A known email gets a confirmation and the old password no longer signs in. An unregistered email and a malformed email are both rejected, and the user stays on the page. |

Ten tests in five files. Every test creates the data it needs: registration uses a fresh email per run (`data/user.factory.ts`), the product tests pick in-stock products through the API instead of hard-coding one, and every test starts in its own browser context (empty cart, not signed in).

## Structure

```
tests/        one spec per test case; no locators here
pages/        one page object per screen, exposing actions such as signIn() and addToCart()
fixtures/     page objects and an API helper handed to every test
data/         user factory (unique email per run)
tools/        discover.mjs: lists the live data-test attributes
screenshots/  evidence for the SIS 2 submission
playwright.config.ts
```

Config settings that matter: `baseURL` (overridable with `BASE_URL`), `testIdAttribute: 'data-test'` (the Toolshop does not use `data-testid`), `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'` and `video: 'retain-on-failure'` so a failing test leaves a picture and a recording. When `CI=true` the config also sets `forbidOnly: true`, `retries: 2`, `workers: 2` and adds the `blob` and `junit` reporters.

Rules the suite follows: no `waitForTimeout`, no CSS classes and no positional XPath in locators, no locator in any spec file, tests pass alone, in parallel and in any order.

## What was not automated, and why

- The reset e-mail itself. The hosted Toolshop does not expose the mailbox, so TC-05 checks what the site shows: the confirmation, and that the old password stops working.
- The exact catalogue count or a fixed product. The site is shared and its stock changes, so tests ask the API for in-stock products at run time instead of asserting "there are 9 products".
- Payment by card. Cash on delivery is the simplest method that completes an order; card validation is a separate feature with its own test cases.

## Known dependency on the live site

The `data-test` attribute names in `pages/` were checked against the live build on 2026-10-23 (`npm run discover` prints them). See `Review.md` for the changes and the verification log.

## CI

[![Playwright Tests](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/workflows/playwright.yml)

**CI system:** GitHub Actions. It is built into GitHub where the repository already lives, needs no separate server, is free for public repositories, and supports job matrices for sharding.

**Pipeline** (`.github/workflows/playwright.yml`):

- runs on every push (`push`), pull request (`pull_request`) and manual trigger (`workflow_dispatch`);
- restores the `~/.npm` cache via `actions/setup-node@v4` (`cache: npm`), runs `npm ci` and installs Chromium with its system libraries (`npx playwright install --with-deps chromium`);
- starts the Sprint 5 Toolshop stack (`testsmith-io/practice-software-testing` via Docker Compose on `localhost:4200` and `localhost:8091`) when `BASE_URL` is not set, because the public `practicesoftwaretesting.com` host blocks datacenter IPs with a Cloudflare challenge;
- runs the full Playwright suite with no `--grep` or project filters, split across 4 parallel shards (`--shard=i/4`);
- merges the four `blob-report-N` artefacts in the `merge-reports` job (`npx playwright merge-reports --config merge.config.ts ./all-blob-reports`) into one HTML report and one combined JUnit XML file;
- uploads artefacts with `if: ${{ !cancelled() }}` and `retention-days: 14`: `playwright-report` (merged HTML report), `test-results-1`…`test-results-4` (per-shard traces, screenshots, videos and JUnit XML) and `junit-report` (`reports/junit-merged.xml`), plus the 1-day intermediate `blob-report-1`…`blob-report-4`.

**CI settings** (`playwright.config.ts`, when `CI=true`): `forbidOnly: true`, `retries: 2`, `workers: 2`, reporters `list`, `blob` and `junit` (`reports/junit.xml`), `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`.

Verified runs:

- Feature branch `push` run: [run 42675090214](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42675090214)
- Pull request (`pull_request`) run: [run 42675100910](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42675100910) (PR [#1](https://github.com/w0nsdoof/Software_Testing_cscs5107/pull/1))
- Deliberate `test.only` failure (`forbidOnly: true`): [run 42677704459](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42677704459) (`Error: item focused with '.only' is not allowed due to the 'forbidOnly' option`)

**Timing** (median of 3 runs via `workflow_dispatch`):

| Configuration | Total run time (median) | `Run Playwright tests` step (slowest shard, median) | Runs (`workflow_dispatch`) |
| --- | --- | --- | --- |
| 1 job, no sharding (`1/1`) | 2 min 02 s | 14 s | [42675408128](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42675408128) (2m 02s / 14s), [42675781228](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42675781228) (2m 04s / 14s), [42676120895](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42676120895) (1m 55s / 12s) |
| 4 shards + merge (`1/4`..`4/4`) | 1 min 57 s | 7 s | [42676463692](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42676463692) (1m 57s / 6s), [42677221361](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42677221361) (1m 58s / 7s), [42677599959](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42677599959) (1m 50s / 7s) |

Sharding four ways halves the test execution step (14 s to 7 s on the slowest shard), but the whole workflow only drops by 5 s (2 min 02 s to 1 min 57 s) because every runner spends about 1 min 15 s installing Chromium and starting the Toolshop containers, and the `merge-reports` job adds 10 s after the shards finish.

Run the suite locally the way CI does:

```bash
npm ci
npx playwright install --with-deps chromium
CI=true npx playwright test
```
