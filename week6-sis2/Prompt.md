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
