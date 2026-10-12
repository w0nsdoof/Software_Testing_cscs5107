# 3. Requirements Traceability Matrix

Requirement → test case → technique → coverage. Requirement IDs are defined in the [catalogue](README.md#requirement-catalogue); test cases in [02-test-cases.md](02-test-cases.md); defects in [05-defect-reports.md](05-defect-reports.md).

**Coverage key:**

- ✅ **Covered:** every boundary or rule of the requirement has a test in this cycle. Boundaries use the 2-value set: on the boundary and one step beyond it.
- 🟡 **Partial:** part of the requirement is tested; the rest is listed in the gaps.
- ❌ **Not covered:** no test in this cycle.

## Requirement → test

| Requirement | Source | Test cases | Technique | Coverage | Defects (mock) |
|-------------|--------|------------|-----------|:--------:|----------------|
| REQ-AMT-001 Min 100 KZT | Brief | TC-AMT-004 (99), TC-AMT-001 (100) | BVA (2-value) | ✅ | — |
| REQ-AMT-002 Max 500,000 KZT | Brief | TC-AMT-002 (500,000), TC-AMT-005 (500,001), TC-DEC-01 (600,000) | BVA (2-value), decision table | ✅ | — |
| REQ-AMT-003 SMS above 100,000 KZT | Brief | TC-AMT-007 (100,000 → no SMS), TC-SMS-001 (100,001 → SMS), TC-AMT-001, TC-LIM-001, TC-AMT-002 | BVA on threshold, decision table Rules 3–4 | ✅ | — |
| REQ-AMT-004 Whole KZT, numeric only | Brief | — (Week 3 TC-AMT-006 in backlog) | EP (P4–P7) | ❌ | — |
| REQ-LIM-001 Daily limit 1,000,000 KZT | Brief | TC-LIM-001 (= 1,000,000), TC-DEC-02 (1,000,001), TC-DEC-01; *Used today* checked in TC-AMT-001, TC-AMT-007, TC-SMS-001, TC-SMS-004 | BVA on limit, decision table Rule 2 | ✅ | — |
| REQ-LIM-002 Reset at 00:00 UTC+5 | Brief | — | — | ❌ | — |
| REQ-PRI-001 Amount error has priority | Brief | TC-DEC-01 | Decision table Rule 1 | ✅ | — |
| REQ-SMS-001 6-digit code | Brief | TC-SMS-001, TC-AMT-002 (the code sent has 6 digits) | — | 🟡 | — |
| REQ-SMS-002 120 s validity | Brief | TC-SMS-003 (125 s) | State transition S1 → S6 | 🟡 | DEF-002 |
| REQ-SMS-003 3rd wrong code cancels | Brief | TC-SMS-002 | State transition S1 → S2 → S3 → S5 | ✅ | — |
| REQ-SMS-004 Exactly-once, terminal states final | Derived (Week 3) | TC-SMS-004 (S4 + code, S4 + timer), TC-SMS-003 (S6 + code) | Invalid transitions | 🟡 | DEF-001, DEF-002, DEF-003 |
| REQ-BAL-001 Insufficient balance | **Missing from brief** | — | — | ❌ | — |

**Summary:**

- 12 requirements: **6 covered**, **3 partial**, **3 not covered**.
- 12 of 12 test cases trace to at least one requirement. No test is orphaned.

## State model coverage (Week 3 SMS state table)

| Transition | Test case | Covered |
|------------|-----------|:-------:|
| S1 → S4 (correct code) | TC-SMS-001, TC-SMS-004 | ✅ |
| S1 → S2 (wrong code) | TC-SMS-002 | ✅ |
| S2 → S3 (wrong code) | TC-SMS-002 | ✅ |
| S3 → S5 (wrong code) | TC-SMS-002 | ✅ |
| S1 → S6 (timer) | TC-SMS-003 | ✅ |
| S2 → S4, S3 → S4 (correct code after 1 or 2 wrong) | — | ❌ |
| S2 → S6, S3 → S6 (timer after 1 or 2 wrong) | — | ❌ |
| **Invalid:** S4 + correct code (double tap) | TC-SMS-004 | ✅ |
| **Invalid:** S6 + correct code (late input) | TC-SMS-003 | ✅ |
| **Invalid:** S4 + timer expires (post-success timer) | TC-SMS-004 (coarse, 130 s) | 🟡 |
| **Invalid:** S4 + wrong code (wrong code after success) | — | ❌ |
| **Invalid:** S5 / S6 + any event (except S6 + correct code) | — | ❌ |

**Note on Week 3 labels:** the Week 3 table puts *Late input* in the cell S4 + wrong code. Week 3's risk list, however, defines late input as **S6 + correct code**. Week 4 follows the risk list, and leaves S4 + wrong code uncovered (above).

**Correction to Week 3:** Week 3 says the three scenarios cover all 9 valid transitions. They cover **5 of 9**. The other 4 need four more short paths (backlog TC-SMS-005…008):

- S1 → S2 → S4
- S1 → S2 → S3 → S4
- S1 → S2 → S6
- S1 → S2 → S3 → S6

<a id="coverage-gaps"></a>

## Coverage gaps and why

| # | Gap | Why it is not covered | Action / owner |
|---|-----|-----------------------|----------------|
| G1 | **REQ-BAL-001.** Behaviour when the balance is below the amount | The brief does not define it: nothing says which error appears, or in what order against the amount and limit errors (Week 3 BA Q1). A test needs an expected result, and there is none | BA to define the rule and its priority. Test data holds 2,000,000 KZT so this gap cannot hide failures in other tests |
| G2 | **REQ-LIM-002.** Midnight reset in Almaty time | ENV-T2 has no clock control. The boundary is 23:59:59 → 00:00:00 UTC+5 (project risk PR-1) | DevOps: provide a time offset on TEST-2, or the dev team adds a unit test on the reset job. Device timezone question goes to the BA (Week 3 Q2) |
| G3 | **REQ-AMT-004.** Decimals, negative, empty, text | Decimal behaviour (reject or round) is undefined (Week 3 BA Q3). The other partitions are lower risk than the SMS flow, so they were not picked for this 12-case cycle | Week 3 TC-AMT-006 stays in the backlog. Partitions P4–P7 go to the Week 5 API suite |
| G4 | **REQ-SMS-001.** Entering a 5- or 7-digit code | Not picked for this cycle; lower risk than the timer and the attempts | Add to the exploratory session charter |
| G5 | **REQ-SMS-002.** Exact 120 s boundary (119 s accepted / 121 s rejected) | Manual timing is not precise enough, so TC-SMS-003 uses 125 s | Automate against the API in Week 5 with a controlled clock |
| G6 | **REQ-SMS-004.** Post-success timer race (R3) | Tapping in the last second triggers it by hand only rarely: about 3 times in 20 in DEF-003, found in ES-01. A scripted manual case would pass most of the time and prove nothing | Automated race test (confirm at T = 119.9 s, repeated 100×) |
| G7 | 3-value BVA neighbours 98, 101, 499,999, 500,002 | The 2-value set was used in this cycle to keep it to 12 cases | Week 5 data-driven API test |
| G8 | Pending transfers and the daily limit | **Not in the brief.** Start with 100,000 KZT already used, then open two transfers of 500,000 KZT each (two devices or two tabs). Each one alone passes the limit check (600,000 ≤ 1,000,000). If both are then confirmed, the day's total is 1,100,000 KZT | New BA question: does a pending transfer reserve its amount against the daily limit? |
