# CSCS5107 Software Testing and Debugging

[![Playwright Tests](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/workflows/playwright.yml)

KBTU, Fall 2026. Student: Zhumabayev Askar Erikuli.

The running feature for this course is a money transfer with SMS verification in a mobile banking app.

| Week | Folder | Content |
|------|--------|---------|
| 3 | [week3-test-design](week3-test-design/README.md) | Test design: equivalence partitions, 3-value BVA, decision table, SMS code state model, AI critique |
| 4 | [week4-sis1](week4-sis1/README.md) | Documentation pack: test plan, 12 test cases, RTM, SMS release checklist, 3 defect reports, AI appendix |
| 6 | [week6-sis2](week6-sis2/README.md) | SIS 2: Playwright end-to-end suite for the Toolshop (5 test cases, page objects, fixtures), Description, Prompt and Review files |
| 8 | [.github/workflows/playwright.yml](.github/workflows/playwright.yml) | SIS 3: GitHub Actions pipeline for the SIS 2 suite, 4 shards merged by [week6-sis2/merge.config.ts](week6-sis2/merge.config.ts) into one HTML and JUnit report; details in [week6-sis2/README.md#ci](week6-sis2/README.md#ci) |

Week 4 traces back to Week 3. It keeps the Week 3 requirement and test case IDs, and its product risks come from the Week 3 invalid state transitions.

## CI

[![Playwright Tests](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/workflows/playwright.yml)

GitHub Actions (`.github/workflows/playwright.yml`) runs the full SIS 2 Playwright suite on every push, pull request and manual trigger. It was chosen because it is built into GitHub where the repository already lives, needs no separate server, is free for public repositories, and supports job matrices for sharding. The suite runs as 4 shards against a local Sprint 5 Toolshop container stack (the public host blocks datacenter IPs with a Cloudflare challenge), and a `merge-reports` job combines the shard results into one HTML report and one JUnit XML file. Full description, settings and artefacts: [week6-sis2/README.md#ci](week6-sis2/README.md#ci).

Verified runs: [push](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42675090214), [pull request](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42675100910) ([#1](https://github.com/w0nsdoof/Software_Testing_cscs5107/pull/1)), [deliberate `test.only` failure under `forbidOnly`](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42677704459).

Timing, median of 3 `workflow_dispatch` runs:

| Configuration | Total run time (median) | `Run Playwright tests` step (slowest shard, median) | Runs (`workflow_dispatch`) |
| --- | --- | --- | --- |
| 1 job, no sharding (`1/1`) | 2 min 02 s | 14 s | [42675408128](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42675408128) (2m 02s / 14s), [42675781228](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42675781228) (2m 04s / 14s), [42676120895](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42676120895) (1m 55s / 12s) |
| 4 shards + merge (`1/4`..`4/4`) | 1 min 57 s | 7 s | [42676463692](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42676463692) (1m 57s / 6s), [42677221361](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42677221361) (1m 58s / 7s), [42677599959](https://github.com/w0nsdoof/Software_Testing_cscs5107/actions/runs/42677599959) (1m 50s / 7s) |

Sharding halves the test step (14 s to 7 s) but saves only 5 s overall (2 min 02 s to 1 min 57 s): each runner spends about 1 min 15 s installing Chromium and starting the Toolshop containers, and the `merge-reports` job adds 10 s.
