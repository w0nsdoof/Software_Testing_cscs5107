# Screenshots

Evidence for the SIS 2 submission.

| File | What it shows |
|------|---------------|
| `01-ci-cloudflare-block.png` | First execution attempt from GitHub Actions: every test stopped at the Cloudflare bot check (see Review.md, R2) |
| `02-ai-session-*.png` | The AI session that produced the draft (to be added by the student) |
| `03-local-run-summary.png` | Final local `npx playwright test` output, 10 passed (10.3s), 2026-10-23 20:21 Almaty. Rendered from the captured terminal output, not a window capture. |
| `03-local-run-html-report.png` | The HTML report of the same run (`npx playwright show-report`): 10 passed, 0 failed, 0 flaky |

Playwright also saves a screenshot of every test under `test-results/` on each run (`screenshot: 'on'` in the config).
