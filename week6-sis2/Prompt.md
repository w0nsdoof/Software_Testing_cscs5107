# Prompt log

Tool: Claude (Anthropic), agent session in the Claude app, configured model `claude-fable-5-1` (Claude Fable 5.1), default effort. Date: 2026-10-23. The session already held the Week 1 to Week 6 lecture decks and the syllabus, uploaded earlier for midterm revision, so the AI knew the Week 6 brief, the grading criteria and the required repository structure before the prompts below.

Course AI policy, Level 1: AI use is allowed if the prompts, the raw output and the human changes are attached.

## P1: scope the task

*Attached: the SIS 2 task file (Google Doc export), the Google Doc link and the submission form link.*

```text
Week 6 Materials and SIS 2 link
DEADLINE: Oct 23, 23:59:59

https://docs.google.com/document/d/1yE3XSVYyyF7gs4CCXYmJIrvwMTS9alSSXpKx5YtELj0/edit?usp=sharing

Link to submit your work

https://docs.google.com/forms/d/e/1FAIpQLSeG3uxaPlfoz9ECk9a46oP2qo4d-mm9g5LjeTKrUIpSRMDnxw/viewform?usp=publish-editor

What sis2 is about, what are delivarables, od we alr have git repo  to use and can yo udod it e2e?
```

Raw output (summary): the five test cases from the Week 6 deck, the grading criteria (runs from a clean clone, structured, asserts), the seven deliverables from the task file, confirmation that the course repository `w0nsdoof/Software_Testing_cscs5107` already exists, and two constraints: the AI's cloud workspace cannot reach practicesoftwaretesting.com, and the student's computer was not linked, so the AI could write the suite but not execute it. It offered two options (link the computer, or run locally and send results).

## P2: run it in the cloud

```text
can you do it in cloud env and smth like that?
```

Raw output (summary): the AI proposed GitHub Actions as the execution environment, cloned the repository, scaffolded `week6-sis2/` (config, page objects, fixtures, data factory, five specs, a discovery script that lists the live `data-test` attributes) and a workflow that pushed results to a `ci-results` branch. The first draft is preserved unchanged on branch `ai-raw-draft-sis2`. The CI run reached the site but every test failed on a Cloudflare "verify you are human" page: the Toolshop blocks datacenter IPs. The AI did not attempt to bypass the check, removed the workflow, and reported that the suite has to be executed from a developer machine.

## Prompts to the AI that were not issued

No prompt asked the AI to generate the tests from a tutorial or to copy `data-test` names from one. The attribute names in `pages/` come from the AI's knowledge of the Toolshop and are flagged in `Review.md` as the first thing to verify against the live site.

## P3: local run

Tool: Claude Code (Anthropic CLI) on the student's laptop (Ubuntu 26.04), model Claude Opus 5.5 (`claude-opus-5-5`). Date: 2026-10-23. Unlike P1 and P2, this session could reach the live site and run the suite.

```text
Clone https://github.com/w0nsdoof/Software_Testing_cscs5107 and work in week6-sis2/. This is SIS 2 for CSCS5107 (Software Testing, KBTU): a Playwright TypeScript suite for https://practicesoftwaretesting.com (the Toolshop). The suite and docs were drafted by an AI session without access to the live site; your job is to make it run green locally, then record what you changed. Deadline tonight 23:59.

Start by reading README.md, Description.md and Review.md (sections 4 and 5 list the unverified decisions and the empty verification log).

Steps:
1. cd week6-sis2 && npm ci && npx playwright install chromium
2. npm run discover  -> writes ci-out/discovery.md with the real data-test attribute names, error texts, checkout steps and payment-method values on the live site. Read it.
3. npx playwright test. For every failure, fix the cause in pages/ or data/ (attribute names, select values, expected texts) or, if the live behaviour differs from the assumption, adjust the assertion to the real observable behaviour. Do not weaken assertions to make tests pass.
4. Repeat until all 9 tests pass. Then run twice more: npx playwright test --workers=4 and npx playwright test --repeat-each=2, to confirm order and parallel independence.
5. Run the suite against the deliberately broken build: change baseURL to https://with-bugs.practicesoftwaretesting.com for one run and confirm at least some tests go red (proves the assertions assert). Note which failed.
6. Fill Review.md: section 3 (add every change you made, with the reason), section 5 (verification log: date, machine/OS, run results, each failure and its fix), section 6 (the three checks). Fill screenshots/README.md rows for the files you add, and save the final `npx playwright test` summary and HTML report screenshot into screenshots/ as 03-local-run-*.png.
7. Append to Prompt.md a section "P3: local run" with this prompt verbatim and the tool you are (model name).

Rules the grader checks, keep them intact: no locator in any file under tests/ (only page-object calls), no waitForTimeout anywhere, no CSS-class or positional-XPath locators (getByTestId / getByRole / getByLabel only; tag selectors like tbody tr are tolerated), at least one fixture used, unique data per run (data/user.factory.ts), tests independent.

Commit in small steps with clear messages and push to main. Finish by printing: the final test summary, the list of files you changed, and anything still unverified.
```

Raw output (summary): discovery confirmed most attribute names and showed the seeded customer account is locked on the shared site. Six of nine tests failed on the first run. The fixes, with reasons, are R3 to R9 in `Review.md`, and the runs are in its section 5. The with-bugs run went fully red but only because that build is an older app (hash routes, different API), so it is recorded as not valid evidence. The broken-expected-value check was used instead.

## P4: compare with other students' repositories

Tool: Claude Code on the student's laptop, model Claude Opus 5.5 (`claude-opus-5-5`). Date: 2026-10-23.

*Pasted: a list of eight public GitHub repositories from the course, found by searching GitHub for the course code and "KBTU software testing".*

```text
check if those relevant users and can help us to shape sis2 in more correct way. if needed copy in tmp and explore relevant ones
```

Raw output (summary): cloned the repositories. Three had a SIS 2 suite. Two of them test the Toolshop's comparison page (`add-to-compare`, `compare-link`, `/comparison`), which our TC-04 said did not exist, and our own `ci-out/discovery.md` already listed those buttons. One also checks that the old password stops working after a reset, and covers an unregistered email. The AI proposed rewriting TC-04 and strengthening TC-05.

```text
both, show plan and execute it and also is our sis2 ready to be served and doesnt have AI looks of i
```

Raw output (summary): probed the live site to confirm the comparison flow and the reset behaviour, made the changes R10 and R11 in `Review.md`, ran the suite (runs 12 to 14) and checked the README, Description, Prompt and Review files for AI writing patterns. No test code was copied from the other repositories; they were used to find what our suite had missed.
