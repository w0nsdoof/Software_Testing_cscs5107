# 6. AI Appendix (Level 1 disclosure)

Course policy, Level 1: AI use is allowed if the prompts, the raw output and the human changes are attached. Undisclosed use counts as plagiarism.

| Field | Value |
|-------|-------|
| Tool | Claude (Anthropic), agent session in the Claude app. Configured model `claude-opus-5-5` |
| Date | 2026-10-12 |
| Used for | Checking the Week 4 slides against the task, drafting all six Week 4 documents, converting the Week 3 Google Doc to Markdown, and creating this repository |
| Not used for | The Week 3 test design itself: partitions, BVA, decision table, state model and risks. That is the student's own work, and Week 4 builds on it. Week 3 has its own AI section (Gemini) |
| Raw output | The commit tagged **`ai-raw-draft`** is the unedited AI output. Every later commit is a human or review change, so `git diff ai-raw-draft main` shows exactly what changed. Link: REPO_URL/compare/ai-raw-draft...main |

## Prompt log

### P1: check the slides against the task

> *Attached: `Week_4_Masters_ST.pptx`*
> Goal: Complete the Week 4 Assignment (SIS 1 Documentation Pack) in Markdown (.md) for the course "CSCS5107: Software Testing and Debugging" (KBTU). Feature Brief (Money Transfer with SMS Verification): Transfer Amount: 100 KZT to 500,000 KZT (whole integers only). Daily Limit: 1,000,000 KZT per day (resets at midnight UTC+5 Almaty). SMS Authorization: Triggered for transfers > 100,000 KZT. 6-digit code, 120s timer, 3 failed attempts cancels transfer. Priority Rule: Amount validation error overrides daily limit error if both are breached. Existing Foundations (from Week 3 Test Design): Equivalence Partitions & BVA … Decision Table: 4 collapsed rules … SMS State Machine: S1-S3 Waiting, S4 Confirmed, S5 Blocked, S6 Expired. Top risks identified: Double-debit on double click, late SMS input, post-success timer execution. Required Deliverables …: 1. 1-Page Test Plan … 2. 12 Executable Test Cases … 3. RTM … 4. Release Checklist … 5. 3 Defect Reports … 6. AI Appendix (Level 1) … Output Requirement: Produce clean, audit-ready Markdown formatted for a GitHub repository.
> **outline me task (Is it present in pptx i sended, matched with prompt above?)**

**Raw output (summary of the reply):**

- All 6 deliverables match slide 38.
- The deadline on the slide is **9 October**, which had already passed.
- Grading (speaker notes): the lecturer follows one random test case and one random defect report exactly as written.
- The prompt's test case fields are missing **Steps** (slide 16).
- The defect report fields are missing **Preconditions, Reproducibility, Evidence and Traces to** (slide 21).
- The RTM must show the planted **insufficient balance** gap (slide 17).
- A suggested repo layout.

### P2: the Week 3 work and running the task end to end

> *Attached: `SIS1` (Week 3 homework) and a Google Doc link with the same content*
> also earlier assignment 1 if its related … read it and propose on can you do it e2e? (creating repo and so on, i only need link to share it)

**Raw output:**

- A proposal: repo structure, keep the Week 3 IDs, label the defect reports as mocks, and do not invent the human-refinement part of this appendix.
- Two questions: where the repo should live, and whether to include Week 3.

### P3: decisions

> Where should the pack go? → **New public repo** · Include Week 3? → **No, Week 4 only**
> *(a few minutes later)* **nvm add wek3 too**

**Raw output:** the full draft of this repository, stored at tag `ai-raw-draft`.

## What the AI decided, which the student must check

Each of these is a judgement the AI made, not a fact from the brief:

| # | AI decision | Where |
|---|-------------|-------|
| D1 | Picked these 12 test cases out of the Week 3 design. Dropped TC-AMT-006 (non-numeric input) and added TC-AMT-007 (100,000 KZT) and TC-LIM-001 (exactly 1,000,000 KZT) | [02](02-test-cases.md) |
| D2 | Invented the test environment: ENV-T2, the SMS stub, *Test Support → Reset customer*, test customers TD-01/TD-02, and the UI path *Transfers → Between my accounts* | [README](README.md#shared-test-environment-and-data) |
| D3 | Gave both test customers 2,000,000 KZT so the undefined balance rule cannot affect any result | README, RTM G1 |
| D4 | New requirement IDs (REQ-LIM, REQ-PRI, REQ-SMS, REQ-BAL), and REQ-SMS-004 (exactly once) **derived** from the Week 3 invalid transitions | [README](README.md#requirement-catalogue) |
| D5 | Waits 125 s in TC-SMS-003 instead of testing exactly 120 s, because manual timing is imprecise | [02](02-test-cases.md#tc-sms-003) |
| D6 | All details in the mock defect reports: build numbers, request IDs, reproducibility rates, the 1-second window in DEF-003 | [05](05-defect-reports.md) |
| D7 | Found that the Week 3 claim "3 scenarios cover all 9 valid transitions" is wrong: they cover 5 of 9 | [RTM](03-rtm.md#state-model-coverage-week-3-sms-state-table) |
| D8 | Added a new BA question: does a pending SMS transfer reserve its amount against the daily limit? (RTM G8) | [RTM](03-rtm.md#coverage-gaps) |

## AI self-corrections before handover

| # | Error in the AI's own draft | Correction |
|---|-----------------------------|------------|
| C1 | RTM G8 first used 900,000 KZT already spent plus two transfers of 500,000 KZT. Each of those already breaks the limit on its own, so the example proved nothing | Changed to 100,000 KZT spent plus 2 × 500,000 KZT, where each transfer passes alone and both together reach 1,100,000 KZT |

Findings from the independent run-through (another AI agent followed one test case and one defect report exactly as written, the way the lecturer grades) are listed in the [verification log](#verification-log).

## Human refinements

> **To be completed by the student.** This section must record what *you* changed after reading the draft. The AI cannot write it for you without inventing it. For each change, add the commit, what you changed, and why.

| # | What I changed | Why | Commit |
|---|----------------|-----|--------|
| H1 | *Kept / changed the AI's 12 test cases: …* | | |
| H2 | *Checked D2–D6 and replaced …* | | |
| H3 | | | |

## Checks before submission (slide 36, adapted)

- [ ] Every invented fact (D2, D6) is marked hypothetical or mock in the document where it appears.
- [ ] I followed TC-SMS-001 and DEF-001 myself, step by step, without asking anyone.
- [ ] Severity and priority in 05 are my decisions. I agree with the reasoning or changed it.
- [ ] The *Human refinements* table is filled in.

## Verification log

*Filled in after the independent run-through.*
