# SIS 1 — Test Documentation Pack: Money Transfer with SMS Verification

**Course:** CSCS5107 Software Testing and Debugging · KBTU · Fall 2026
**Assignment:** Week 4 — Test documentation and bug reporting
**Student:** Zhumabayev Askar Erikuli
**Builds on:** [Week 3 test design](../week3-test-design/README.md) (equivalence partitions, 3-value BVA, collapsed decision table, SMS state model)
**Standard:** ISO/IEC/IEEE 29119-3 document names and test case fields

## Contents

| # | Document | What it answers |
|---|----------|-----------------|
| 1 | [Test plan](01-test-plan.md) | What we test on this release, how, and when we start and stop |
| 2 | [Test cases](02-test-cases.md) | 12 executable test case specifications |
| 3 | [Traceability matrix](03-rtm.md) | Which requirement is covered by which test, and which requirement has no test |
| 4 | [SMS release checklist](04-sms-release-checklist.md) | What to verify on release day for the SMS code flow (12 items) |
| 5 | [Defect reports](05-defect-reports.md) | 3 reproducible defect reports (mock) |
| 6 | [AI appendix](06-ai-appendix.md) | Level 1 disclosure: prompts, raw output, human changes |

## Feature brief

A customer sends money from their current account in the mobile app.

- A single transfer is **100 to 500,000 KZT**, in whole tenge only.
- The total sent per day is limited to **1,000,000 KZT**. The daily total resets at **00:00 Almaty time (UTC+5)**.
- A transfer **above 100,000 KZT** needs an **SMS code**: 6 digits, valid for **120 seconds**. The **third wrong code** cancels the transfer.
- If a transfer breaks both the amount rule and the daily limit, the **amount error is shown** (amount error has priority).

## Requirement catalogue

IDs `REQ-AMT-001…004` are kept from Week 3 so the Week 3 → Week 4 trace stays intact. The other IDs are new in Week 4.

| ID | Requirement | Source |
|----|-------------|--------|
| REQ-AMT-001 | A single transfer amount must be at least 100 KZT | Brief |
| REQ-AMT-002 | A single transfer amount must be at most 500,000 KZT | Brief |
| REQ-AMT-003 | A transfer above 100,000 KZT requires an SMS code; a transfer of 100,000 KZT or less executes immediately | Brief |
| REQ-AMT-004 | The amount must be a whole number of KZT; non-numeric input is rejected | Brief |
| REQ-LIM-001 | Daily total of executed transfers, including the new one, must not exceed 1,000,000 KZT | Brief |
| REQ-LIM-002 | The daily total resets at 00:00 Almaty time (UTC+5) | Brief |
| REQ-PRI-001 | If both the amount rule and the daily limit are broken, only the amount error is shown | Brief |
| REQ-SMS-001 | The SMS code has exactly 6 digits | Brief |
| REQ-SMS-002 | The SMS code is valid for 120 seconds; after that the transfer is cancelled and the code is rejected | Brief |
| REQ-SMS-003 | The third wrong code cancels the transfer | Brief |
| REQ-SMS-004 | A confirmed transfer is executed exactly once; events that arrive after the transfer has reached Confirmed, Blocked or Expired do not change it | Derived from the Week 3 state model. Waiting for BA confirmation |
| REQ-BAL-001 | Behaviour when the balance is lower than the amount | **Not in the brief** (Week 3 BA question 1) |

**Change from Week 3:** in Week 3 the SMS trigger was cited under both REQ-AMT-002 and REQ-AMT-003. From Week 4 it belongs to REQ-AMT-003 only.

## Shared test environment and data

Every test case in this pack uses the setup below. Test cases refer to it by ID.

**Environment ENV-T2**

- Mobile app (iOS) installed from the TEST-2 distribution channel. The build number is recorded in each execution log.
- Back end: test environment TEST-2.
- SMS gateway stub. Every code sent to a test phone number appears in the **SMS stub inbox** (web page, filter by phone number).
- Back-office **Test Support → Reset customer** restores a test customer to the balance and daily total in the table below.

**Test customers**

| ID | Login | Phone | Source account | Recipient account | Balance after reset | Daily total after reset |
|----|-------|-------|----------------|-------------------|--------------------:|------------------------:|
| TD-01 | `test01` | +7 700 000 0001 | Current ••1001 | Deposit ••4417 | 2,000,000 KZT | 0 KZT |
| TD-02 | `test02` | +7 700 000 0002 | Current ••2001 | Deposit ••4427 | 2,000,000 KZT | 900,000 KZT |

Both customers hold **2,000,000 KZT**, so the balance can never be the reason a transfer is rejected. REQ-BAL-001 is undefined and is kept out of every test on purpose.

**Where to read the results**

- **Balance:** Accounts screen, source account card.
- **Daily total:** Profile → Limits → *Used today*.
- **Debit entries:** source account → Statement. Every entry shows amount, time and transfer ID.

**Timing rule:** run tests between 01:00 and 23:00 Almaty time, so the midnight reset cannot interfere.
