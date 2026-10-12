# 1. Test plan: money transfer with SMS verification

| Field | Value |
|-------|-------|
| Document | Test plan (ISO/IEC/IEEE 29119-3), project level, one page |
| Test item | Mobile app transfer flow + transfer service, release under test on ENV-T2 |
| Requirements | REQ-AMT-001…004, REQ-LIM-001…002, REQ-PRI-001, REQ-SMS-001…004 ([catalogue](README.md#requirement-catalogue)) |
| Author / date | Zhumabayev A. · 2026-10-12 |

## Scope

### In scope

- Amount validation: minimum and maximum (REQ-AMT-001, 002).
- SMS threshold at 100,000 KZT (REQ-AMT-003).
- Daily limit of 1,000,000 KZT, its boundary, and the amount-over-limit priority rule (REQ-LIM-001, REQ-PRI-001).
- SMS code flow: correct code, three wrong codes, 120-second expiry, and repeated or late events after the flow has ended (REQ-SMS-001…004).

### Out of scope

- Insufficient balance (REQ-BAL-001). The brief does not define it, so it goes to the BA and gets tested once defined.
- Decimal, negative, empty and text amounts (REQ-AMT-004). Decimal behaviour is undefined (Week 3 BA question 3), and these cases are lower risk than the SMS flow. Deferred to the Week 5 API suite ([RTM gap G3](03-rtm.md#coverage-gaps)).
- Midnight reset (REQ-LIM-002). Testing it needs control of the server clock, and ENV-T2 does not have that. See project risk PR-1.
- Customer device in another timezone (Week 3 BA question 2).
- Fees, currency conversion, and transfers to other banks or other customers.
- SMS gateway load and delivery performance, and security testing of the code (brute force, SIM swap).
- Web banking, accessibility, and localisation beyond the checks in the release checklist.

## Approach

- Level and type: system testing of functional behaviour through the mobile UI. Every result is read from the balance, *Used today*, the Statement or Transfer history, so no check needs database access.
- Techniques (all from Week 3):
  - equivalence partitions, and 2-value boundary value analysis on the amount, the SMS threshold and the daily limit (the 3-value neighbours are in the backlog, [RTM gap G7](03-rtm.md#coverage-gaps));
  - the collapsed decision table (4 rules);
  - state transition testing: 5 of the 9 valid transitions this cycle (the other 4 are backlog TC-SMS-005…008, see the [RTM](03-rtm.md#state-model-coverage-week-3-sms-state-table)), plus the 3 invalid transitions that create risk.
- Execution:
  - 12 scripted test cases ([02-test-cases.md](02-test-cases.md));
  - exploratory session ES-01, 60 minutes, on SMS timing. Charter: tap Confirm in the last 1 to 2 s of the countdown; slow SMS delivery; put the app in the background or switch network while the code screen is open; enter 5- and 7-digit codes;
  - the [release checklist](04-sms-release-checklist.md) on release day.
- Automation: none in this cycle. TC-AMT and TC-DEC are the first candidates for the API suite in Week 5.
- Defects: logged in the tracker with the fields of [05-defect-reports.md](05-defect-reports.md). The tester sets severity; the product owner sets priority.

## Entry criteria

All of these must be true before execution starts:

1. The build is deployed to ENV-T2, and its build number is recorded.
2. A smoke check passes: `test01` can log in and complete one 100 KZT transfer.
3. Test Support → Reset customer works for TD-01 and TD-02, and restores the values in the [README](README.md#shared-test-environment-and-data).
4. The SMS stub inbox shows a code within 30 s of a request sent to +7 700 000 0001.
5. The BA has answered, or explicitly deferred, questions 1 to 3 from Week 3 and the pending-transfer question ([RTM G8](03-rtm.md#coverage-gaps)). The BA has also confirmed derived requirement REQ-SMS-004.

## Exit criteria

All of these must be true for the test to be complete:

1. 12 of 12 planned test cases executed. Every *Blocked* case has a written reason.
2. Zero open defects of severity Critical or High. Any exception is accepted in writing by the product owner, with the defect ID.
3. Every requirement in scope has at least one passed test in the [RTM](03-rtm.md). The out-of-scope requirements are listed in the test completion report as residual risk.
4. All 12 checklist items pass on the release candidate.

## Top 3 product risks

| ID | Risk | Likelihood | Impact | Mitigation in this plan |
|----|------|:----------:|:------:|-------------------------|
| R1 | Double debit. The customer taps *Confirm* twice, or the network retries, and the money is taken twice (Confirmed + correct code) | Medium | Critical: direct financial loss, complaints, regulator | TC-SMS-004; checklist item 6, which also checks the idempotency key in production |
| R2 | Late code accepted. An SMS arrives late and a code entered after 120 s still executes the transfer (Expired + correct code) | Medium | High: a security control is bypassed | TC-SMS-003, checklist items 3 and 4 |
| R3 | Timer fires after success. The 120 s timeout fires just after confirmation and cancels or reverses a completed transfer (Confirmed + timer expires) | Low | High: the status contradicts the real money movement | ES-01; TC-SMS-004 step 5 (coarse); checklist item 7. A manual repro is possible but rare; reliable detection needs the automated race test proposed for Week 5 |

## Project risks

- PR-1. ENV-T2 has no clock control, so the midnight reset (REQ-LIM-002) cannot be tested.
- PR-2. The SMS stub is shared with other teams and may delay codes, which would make the 120 s tests flaky.
- PR-3. Test customers are reset manually through the back office, which can slow execution.
