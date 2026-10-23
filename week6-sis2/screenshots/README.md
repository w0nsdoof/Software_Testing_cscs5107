# Screenshots

Evidence for the SIS 2 submission.

| File | What it shows |
|------|---------------|
| `01-ci-cloudflare-block.png` | First execution attempt from GitHub Actions: every test stopped at the Cloudflare bot check (see Review.md, R2) |
| `02-ai-session-*.png` | The AI session that produced the draft (to be added by the student) |
| `03-local-run-*.png` | `npx playwright test` summary and the HTML report from the local run (to be added by the student) |

Playwright also saves a screenshot of every test under `test-results/` on each run (`screenshot: 'on'` in the config).
