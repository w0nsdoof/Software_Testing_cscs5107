# 6. AI appendix (Level 1 disclosure)

Course policy, Level 1: AI use is allowed if the prompts, the raw output and the human changes are attached. Undisclosed use counts as plagiarism.

| Field | Value |
|-------|-------|
| Tool | Claude (Anthropic), agent session in the Claude app. Configured model `claude-opus-5-5` |
| Date | 2026-10-12 |
| Used for | Checking the Week 4 slides against the task, drafting all six Week 4 documents, converting the Week 3 Google Doc to Markdown, pushing the files to this repository, and a style pass over the Week 4 prose (P4) |
| Not used for | The Week 3 test design itself: partitions, BVA, decision table, state model and risks. That is the student's own work, and Week 4 builds on it. Week 3 has its own AI section (Gemini) |
| Raw output | Branch `ai-raw-draft` holds the unedited AI output (commit `4e07921`). Every later commit is a review fix or a human change, so `git diff ai-raw-draft main` shows exactly what changed. Link: [compare ai-raw-draft...main](https://github.com/w0nsdoof/Software_Testing_cscs5107/compare/ai-raw-draft...main) |

## Prompt log

### P1: check the slides against the task

*Attached: `Week_4_Masters_ST.pptx`*

<details><summary><b>Prompt P1 (verbatim)</b></summary>

```text
Goal: Complete the Week 4 Assignment (SIS 1 Documentation Pack) in Markdown (.md) for the course "CSCS5107: Software Testing and Debugging" (KBTU). Feature Brief (Money Transfer with SMS Verification): - Transfer Amount: 100 KZT to 500,000 KZT (whole integers only). - Daily Limit: 1,000,000 KZT per day (resets at midnight UTC+5 Almaty). - SMS Authorization: Triggered for transfers > 100,000 KZT. 6-digit code, 120s timer, 3 failed attempts cancels transfer. - Priority Rule: Amount validation error overrides daily limit error if both are breached. Existing Foundations (from Week 3 Test Design): - Equivalence Partitions & BVA: 2-value (99, 100, 500k, 500k+1) and 3-value (98..101, 499,999..500,002). - Decision Table: 4 collapsed rules (Rule 1: Invalid Amount; Rule 2: Exceeded Daily Limit; Rule 3: Valid > 100k -> SMS; Rule 4: Valid <= 100k -> Immediate). - SMS State Machine: S1-S3 Waiting, S4 Confirmed, S5 Blocked, S6 Expired. Top risks identified: Double-debit on double click, late SMS input, post-success timer execution. Required Deliverables to Draft in Markdown (.md): 1. 1-Page Test Plan: Scope (In/Out), Approach, Entry/Exit Criteria, Top 3 Product Risks. 2. 12 Executable Test Cases: Full ISO/IEC/IEEE 29119-3 format (ID, Traces to, Preconditions, Concrete Inputs, Expected Results, Postconditions). 3. Requirements Traceability Matrix (RTM): Requirement-to-Test mapping highlighting coverage gaps. 4. Release Checklist: Max 12 items specifically for the SMS code flow deployment. 5. 3 Defect Reports: Reproducible bug reports (Title formula, Environment, Steps, Expected vs Actual, Severity vs Priority). 6. AI Appendix (Level 1): Log of prompts used, raw outputs, human refinements, and justifications. Output Requirement: Produce clean, audit-ready Markdown formatted for a GitHub repository.

outline me task (Is it present in pptx i sended, matched with prompt above?)
```

</details>

<details><summary><b>Raw output P1 (verbatim)</b></summary>

> Yes, it matches. Slide 38 ("Assignment — deadline 9 October") lists the same six deliverables as your prompt, in the same order. Your prompt leaves out a few requirements that appear elsewhere in the deck, though, and the lecturer's grading note makes them matter.
>
> **Deadline:** the slide says **9 October**, and today is 12 October. Check whether it was extended.
>
> **How it's graded** (speaker notes, slide 38): the lecturer picks one test case and one defect report at random and tries to follow them exactly as written. Those two documents are the grade.
>
> **Deliverables: your prompt vs. the deck**
>
> | # | Deliverable | Matches? | What your prompt is missing (and the slide it comes from) |
> |---|---|---|---|
> | 1 | One-page test plan: scope in/out, approach, entry/exit, top 3 product risks | ✅ | Exit criteria must be measurable, something a person who wasn't there could check (slide 13). Write down any gap between the criteria and reality and who accepted it (slide 12). |
> | 2 | 12 test cases, each traced to a requirement | ⚠️ | **Your field list has no Steps.** The deck's runnable example (slide 16) has numbered steps, one action each. Also: exact preconditions (account, balance, daily total, time), real values instead of "a large amount", results you can check, and each test runnable on its own (slide 15). |
> | 3 | Traceability matrix, including requirements you can't cover, and why | ✅ | Add a Technique column and a Status column (slide 17). The gap the lecturer planted on purpose is **REQ-3.4, insufficient balance**: it isn't in your decision table, so mark it NOT COVERED and give the reason. |
> | 4 | SMS release checklist, ≤12 items | ✅ | Slide 18 has a 7-item starting point: arrives within 30 s, expires at 120 s, 3rd wrong code cancels, expired code rejected, double tap debits once, SMS text in KZ/RU/EN, daily total updates. Each item should trace back to a state or boundary from week 3. |
> | 5 | 3 defect reports | ⚠️ | The deck lets you **mock them or base them on gaps in the requirements**. Your field list is short of slide 21's: add **Preconditions, Reproducibility (e.g. 5 of 5), Evidence (request ID or video), and Traces to**. The title formula is [Where] + [what happens] + [under what condition] (slide 22). Report what you observed, not your guess at the cause, and keep the tone neutral (slides 21, 29). |
> | 6 | AI appendix (Level 1): prompts, raw output, what you changed and why | ✅ | Use the slide 35 prompt with its "write MISSING, don't guess" rule. Show the three checks from slide 36. Leaving the AI use undisclosed counts as plagiarism. |
>
> **In your prompt but not in this deck:** these probably come from the week 3 brief, so check them there: the 6-digit code, the midnight reset in Almaty time (UTC+5), and the rule that an amount error takes priority over a daily-limit error. The deck itself confirms 100–500,000, the 1,000,000 daily limit, SMS above 100,000, 120 s, and 3 attempts.
>
> **Suggested repo outline (reusing the deck's IDs):** `week4-sis1/` with `README.md`, `01-test-plan.md`, `02-test-cases.md`, `03-rtm.md`, `04-sms-release-checklist.md`, `05-defect-reports.md`, `06-ai-appendix.md`. The IDs follow the deck's own examples: REQ-3.1 amount, 3.2 daily limit, 3.3 SMS, 3.4 balance; tests TR-AMT, TR-DAY, TR-OTP. Your three top risks (double debit, late SMS input, the timer still running after success) work as both the plan's product risks and the subjects of the three defect reports.
>
> The deck also assigns reading: ISTQB CTFL v4.0, chapter 5 (sections 5.1, 5.3, 5.5). It's useful background for the plan and the defect reports.

</details>

### P2: the Week 3 work and running the task end to end

> *Attached: `SIS1` (Week 3 homework) and a Google Doc link with the same content*
> also earlier assignment 1 if its related
> https://docs.google.com/document/d/10FTIwVNsdv-5hkAVbE-ufsQfWORMVLxr837oOsEgM6I/edit?usp=sharing
>
> read it and propose on can you do it e2e? (creating repo and so on, i only need link to share it)/.

**Raw output:**

- A proposal: repo structure, keep the Week 3 IDs, label the defect reports as mocks, and do not invent the human-refinement part of this appendix.
- Two questions: where the repo should live, and whether to include Week 3.

### P3: decisions

> Where should the pack go? → **New public repo** · Include Week 3? → **No, Week 4 only**
> *(a few minutes later)* **nvm add wek3 too**

**Raw output:** the full draft of this repository, stored on branch `ai-raw-draft`.

### P4: repository and style pass

> https://github.com/w0nsdoof/Software_Testing_cscs5107
>
> is it fine?

> do it for me too, use humanizer skill

**Raw output:**

- Pushed `main` and the `ai-raw-draft` branch to the repository the student created.
- Ran the humanizer skill, which removes AI writing patterns, over the Week 4 prose: dashes, decorative bold, title-case headings and staged contrasts. Requirements, test data, numbers and IDs did not change. The Week 3 file and the verbatim prompt logs were not edited.
- The second request was to fill in the human refinements table. The AI did not write content edits in the student's name, because the table would then misstate who did the work. It recorded the decisions the student actually made in this session (H1 to H5) and left space for the student's own edits.

## Judgements the AI made

None of these comes from the brief. The student should check each one:

| # | AI decision | Where |
|---|-------------|-------|
| D1 | Picked these 12 test cases out of the Week 3 design. Dropped TC-AMT-006 (non-numeric input) and added TC-AMT-007 (100,000 KZT) and TC-LIM-001 (exactly 1,000,000 KZT) | [02](02-test-cases.md) |
| D2 | Invented the test environment: ENV-T2, the SMS stub, *Test Support → Reset customer*, test customers TD-01/TD-02, and the UI path *Transfers → Between my accounts* | [README](README.md#shared-test-environment-and-data) |
| D3 | Gave both test customers 2,000,000 KZT so the undefined balance rule cannot affect any result | README, RTM G1 |
| D4 | New requirement IDs (REQ-LIM, REQ-PRI, REQ-SMS, REQ-BAL), and REQ-SMS-004 (exactly once) derived from the Week 3 invalid transitions | [README](README.md#requirement-catalogue) |
| D5 | Waits 125 s in TC-SMS-003 instead of testing exactly 120 s, because manual timing is imprecise | [02](02-test-cases.md#tc-sms-003) |
| D6 | All details in the mock defect reports: build numbers, request IDs, reproducibility rates, the 1-second window in DEF-003 | [05](05-defect-reports.md) |
| D7 | Found that the Week 3 claim "3 scenarios cover all 9 valid transitions" is wrong: they cover 5 of 9 | [RTM](03-rtm.md#state-model-coverage-week-3-sms-state-table) |
| D8 | Added a new BA question: does a pending SMS transfer reserve its amount against the daily limit? (RTM G8) | [RTM](03-rtm.md#coverage-gaps) |

## AI self-corrections before handover

| # | Error in the AI's own draft | Correction |
|---|-----------------------------|------------|
| C1 | (before the first commit) RTM G8 first used 900,000 KZT already spent plus two transfers of 500,000 KZT. Each of those already breaks the limit on its own, so the example proved nothing | Changed to 100,000 KZT spent plus 2 × 500,000 KZT, where each transfer passes alone and both together reach 1,100,000 KZT |

Findings from the independent run-through (another AI agent followed one test case and one defect report exactly as written, the way the lecturer grades) are listed in the [verification log](#verification-log).

## Human decisions and refinements

These rows are decisions the student made during the session, taken from the prompt log above.

| # | Decision by the student | Effect on the pack | Source |
|---|-------------------------|--------------------|--------|
| H1 | Wrote the task prompt: the feature brief, the six deliverables, the test case and defect report fields, and the three top risks | Fixed the scope and the risks that the plan, test cases and defect reports are built around | P1 |
| H2 | Did the Week 3 design: partitions, BVA, decision table, SMS state model and the three invalid transitions | Week 4 reuses its IDs, values and risks; every Week 4 test traces back to it | Week 3 |
| H3 | Chose a new public repository instead of the private `masters` repo | The lecturer can open the link without being added as a collaborator | P3 |
| H4 | First chose Week 4 only, then changed the decision to include Week 3 | Week 3 sits next to Week 4, so the Week 3 → Week 4 trace can be followed in one repository | P3 |
| H5 | Created and named the repository, and asked for a style pass over the AI prose | Repository `Software_Testing_cscs5107`; style pass logged as AI work under P4 | P4 |

Content edits the student makes after reading the pack are added below, with the commit and the reason.

| # | What I changed | Why | Commit |
|---|----------------|-----|--------|
| H6 | | | |

## Checks before submission (slide 36, adapted)

- [ ] Every invented fact (D2, D6) is marked hypothetical or mock in the document where it appears.
- [ ] I followed TC-SMS-001 and DEF-001 myself, step by step, without asking anyone.
- [ ] Severity and priority in 05 are my decisions. I agree with the reasoning or changed it.
- [ ] H6 lists every content edit I made, with the commit and the reason.

## Verification log

A separate AI agent that had not seen the drafting checked the pack. It followed TC-SMS-002 and DEF-003 exactly as written, as the lecturer will, skimmed TC-DEC-02 and DEF-001, and audited the arithmetic, the IDs and the links across all files.
It found 20 issues. Every balance and *Used today* value, the RTM counts and all links were correct. The fixes are in the commit after `ai-raw-draft` on `main`.

| # | Finding | Fix |
|---|---------|-----|
| V1 | The test plan claimed all 9 valid transitions were covered; the RTM says 5 of 9 | The plan now says 5 of 9 and points to the backlog |
| V2 | REQ-AMT-004 was in scope but had no test, so exit criterion 3 could never be met | Moved to out of scope, referencing gap G3 |
| V3 | Defect reproducibility counts were impossible: repeated attempts would hit the daily limit | Each report says TD-01 was reset before each attempt |
| V4 | DEF-003 contradicted RTM G6 ("cannot be triggered by hand") and itself ("no money lost" vs "may pay twice") | Wording aligned in G6, R3 and DEF-003 |
| V5 | DEF-003 timing ("at 0:01") was ambiguous, and ES-01 was undefined | Tap as the countdown turns to 0:01; repeat with a reset up to 20 times; ES-01 and its charter defined in the plan |
| V6 | TC-SMS-002 had no stopwatch, no expected result for steps 2 to 3, unobservable states and no check of "not blocked" | Rewritten: countdown rule (≥ 0:30), expected results for every step, step 9 checks the customer can still transfer |
| V7 | Status was checked on the Statement, but the README did not say the Statement shows status | README defines Transfers → History for status; Statement lists only real debits |
| V8 | Labels said "3-value BVA" although the 2-value set was used | Relabelled 2-value; the 3-value neighbours stay in G7 |
| V9 | TC-LIM-001 traces differed between the summary and the detail | Aligned |
| V10 | Checklist: item 6 mixed ENV-T2 and production, item 1 traced to the wrong criterion, item 2 could not be executed by hand | Split 6a/6b, retraced item 1, item 2 uses the unit test plus 20 sampled codes |
| V11 | Defects dated 8 Oct, before this work | Dated 2026-10-12 |
| V12 | The AI-invented environment was not marked as hypothetical | Note added to the README |
| V13 | TC-DEC-02 used the SMS stub without opening it in the preconditions, and did not say where the error appears | Fixed |
| V14 | Entry criteria ignored REQ-SMS-004 and the new BA question G8 | Added to entry criterion 5 |
| V15 | Week 3 labels S4 + wrong code as "late input", while its risk list defines it as S6 + correct code | Noted in the RTM; S4 + wrong code listed as uncovered |
| V16 | TC-SMS-003 cannot detect the server accepting an expired code | Limitation stated in the case; covered by checklist item 4 |
| V17 | Raw output P1 was only a summary, and the prompts were shortened | Verbatim prompt and output added |
| V18 | Found during the P4 style pass: the V6 rewrite of TC-SMS-002 had left a copy of the old case below the new one | Duplicate removed |
