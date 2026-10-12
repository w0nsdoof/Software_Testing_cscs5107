# 2. Test case specification: money transfer with SMS verification

The cases follow the ISO/IEC/IEEE 29119-3 test case specification. The environment, test customers and result screens used by every case are defined once in the [README](README.md#shared-test-environment-and-data).

Rules for every case:

- Independent. Each case starts with *Reset customer* and depends on no other case.
- One invalid input at a time. Each negative case breaks exactly one rule, except TC-DEC-01, which breaks two on purpose to test the priority rule.
- Error text. The wording below is the provisional copy from Week 3. A different wording counts as a pass if it names the same rule, and is logged as a copy issue, not a defect.
- Observation points:
  - *Balance*: Accounts screen;
  - *Used today*: Profile → Limits;
  - *Statement*: source account → Statement;
  - *SMS stub*: SMS stub inbox filtered by the customer's phone number;
  - *History*: Transfers → History, which shows each transfer's status.

Common navigation (N1):

1. Tap **Transfers → Between my accounts**.
2. In **From**, select the customer's source account. In **To**, select the customer's recipient account.

## Summary

| ID | Title | Traces to | Technique | Prio |
|----|-------|-----------|-----------|:----:|
| [TC-AMT-001](#tc-amt-001) | 100 KZT executes immediately, no SMS | REQ-AMT-001, REQ-AMT-003 | BVA lower boundary (on) | High |
| [TC-AMT-004](#tc-amt-004) | 99 KZT rejected with minimum-amount error | REQ-AMT-001 | BVA lower boundary (below) | High |
| [TC-AMT-002](#tc-amt-002) | 500,000 KZT accepted and sent to SMS confirmation | REQ-AMT-002, REQ-AMT-003 | BVA upper boundary (on) | High |
| [TC-AMT-005](#tc-amt-005) | 500,001 KZT rejected with maximum-amount error | REQ-AMT-002 | BVA upper boundary (above) | High |
| [TC-AMT-007](#tc-amt-007) | 100,000 KZT executes immediately, no SMS | REQ-AMT-003 | BVA SMS threshold (on) | High |
| [TC-DEC-01](#tc-dec-01) | Amount error shown, daily limit error suppressed | REQ-PRI-001, REQ-AMT-002, REQ-LIM-001 | Decision table Rule 1 | High |
| [TC-DEC-02](#tc-dec-02) | Daily limit exceeded by 1 KZT rejected | REQ-LIM-001 | Decision table Rule 2 + BVA limit (above) | High |
| [TC-LIM-001](#tc-lim-001) | Daily total reaching exactly 1,000,000 KZT allowed | REQ-LIM-001, REQ-AMT-003 | BVA limit (on) + Rule 4 | High |
| [TC-SMS-001](#tc-sms-001) | 100,001 KZT confirmed with correct SMS code | REQ-AMT-003, REQ-SMS-001, REQ-LIM-001 | State S1→S4, Rule 3, BVA threshold (above) | Critical |
| [TC-SMS-002](#tc-sms-002) | Third wrong code cancels the transfer | REQ-SMS-003 | State S1→S2→S3→S5 | Critical |
| [TC-SMS-003](#tc-sms-003) | Correct code entered after 120 s is rejected | REQ-SMS-002, REQ-SMS-004 | State S1→S6, invalid S6 + correct code | Critical |
| [TC-SMS-004](#tc-sms-004) | Double tap on Confirm debits once | REQ-SMS-004 | Invalid S4 + correct code, S4 + timer | Critical |

Changes from Week 3:

- TC-AMT-003 (100,001 → SMS screen) is merged into TC-SMS-001, which runs the same input and then completes the confirmation.
- TC-AMT-006 (non-numeric input) is kept in the backlog and not run this cycle. See the [RTM gaps](03-rtm.md#coverage-gaps).
- TC-DEC-02 uses 100,001 KZT instead of 200,000 KZT, so it lands exactly 1 KZT over the daily limit.
- TC-DEC-03 and TC-DEC-04 are covered by TC-SMS-001 and TC-AMT-001.

---

<a id="tc-amt-001"></a>

## TC-AMT-001 · 100 KZT executes immediately, no SMS

| Field | Value |
|-------|-------|
| ID | TC-AMT-001 |
| Traces to | REQ-AMT-001, REQ-AMT-003 · Decision table Rule 4 · Partition P1 |
| Technique | BVA (2-value set), lower boundary, on-point |
| Priority | High |
| Preconditions | TD-01 reset (balance 2,000,000 KZT, used today 0 KZT). Logged in as `test01`. Accounts screen open |
| Test data | From Current ••1001 → To Deposit ••4417; amount `100` |

**Steps**

1. Perform N1 with From = Current ••1001, To = Deposit ••4417.
2. Enter `100` in **Amount**.
3. Tap **Continue**.
4. Open Accounts, then the Statement of ••1001, then Profile → Limits.
5. Open the SMS stub for +7 700 000 0001.

**Expected results**

| After step | Expected |
|:----------:|----------|
| 3 | *Transfer completed* screen within 3 s. No SMS code screen |
| 4 | Balance of ••1001 is 1,999,900 KZT. The Statement has exactly one new debit of 100 KZT. Used today is 100 KZT |
| 5 | No new message since the reset |

**Postconditions:** TD-01 balance 1,999,900 KZT, used today 100 KZT. Reset TD-01 before reuse.

---

<a id="tc-amt-004"></a>

## TC-AMT-004 · 99 KZT rejected with minimum-amount error

| Field | Value |
|-------|-------|
| ID | TC-AMT-004 |
| Traces to | REQ-AMT-001 · Decision table Rule 1 · Partition P2 |
| Technique | BVA (2-value set), lower boundary, below |
| Priority | High |
| Preconditions | TD-01 reset (balance 2,000,000 KZT, used today 0 KZT). Logged in as `test01`. Accounts screen open |
| Test data | From Current ••1001 → To Deposit ••4417; amount `99` |

**Steps**

1. Perform N1 with From = Current ••1001, To = Deposit ••4417.
2. Enter `99` in **Amount**.
3. Tap **Continue**.
4. Open Accounts, then the Statement of ••1001, then Profile → Limits.

**Expected results**

| After step | Expected |
|:----------:|----------|
| 3 | Error under the Amount field: *«Minimum transfer amount is 100 KZT»*. The transfer screen stays open. No SMS code screen |
| 4 | Balance is 2,000,000 KZT. No new Statement entry. Used today is 0 KZT |

**Postconditions:** TD-01 unchanged.

---

<a id="tc-amt-002"></a>

## TC-AMT-002 · 500,000 KZT accepted and sent to SMS confirmation

| Field | Value |
|-------|-------|
| ID | TC-AMT-002 |
| Traces to | REQ-AMT-002, REQ-AMT-003 · Decision table Rule 3 · Partition P1 |
| Technique | BVA (2-value set), upper boundary, on-point |
| Priority | High |
| Preconditions | TD-01 reset (balance 2,000,000 KZT, used today 0 KZT). Logged in as `test01`. Accounts screen open |
| Test data | From Current ••1001 → To Deposit ••4417; amount `500000` |

**Steps**

1. Perform N1 with From = Current ••1001, To = Deposit ••4417.
2. Enter `500000` in **Amount**.
3. Tap **Continue**.
4. Open the SMS stub for +7 700 000 0001.
5. Without entering the code, switch back to the app, open Accounts, then the Statement of ••1001.

**Expected results**

| After step | Expected |
|:----------:|----------|
| 3 | SMS code screen with 6 input cells and a countdown starting at 2:00. No amount error |
| 4 | Exactly one new message, containing a 6-digit code |
| 5 | Balance is still 2,000,000 KZT. No new Statement entry. Nothing is debited before the code is entered |

**Postconditions:** the transfer is waiting for the code (state S1) and expires 120 s after step 3. Reset TD-01 after it expires.

---

<a id="tc-amt-005"></a>

## TC-AMT-005 · 500,001 KZT rejected with maximum-amount error

| Field | Value |
|-------|-------|
| ID | TC-AMT-005 |
| Traces to | REQ-AMT-002 · Decision table Rule 1 · Partition P3 |
| Technique | BVA (2-value set), upper boundary, above |
| Priority | High |
| Preconditions | TD-01 reset (balance 2,000,000 KZT, used today 0 KZT). Logged in as `test01`. Accounts screen open |
| Test data | From Current ••1001 → To Deposit ••4417; amount `500001` |

**Steps**

1. Perform N1 with From = Current ••1001, To = Deposit ••4417.
2. Enter `500001` in **Amount**.
3. Tap **Continue**.
4. Open the SMS stub for +7 700 000 0001.
5. Open Accounts, then the Statement of ••1001, then Profile → Limits.

**Expected results**

| After step | Expected |
|:----------:|----------|
| 3 | Error under the Amount field: *«Maximum transfer amount per transaction is 500,000 KZT»*. No SMS code screen |
| 4 | No new message. No code is sent for a rejected amount |
| 5 | Balance is 2,000,000 KZT. No new Statement entry. Used today is 0 KZT |

**Postconditions:** TD-01 unchanged.

---

<a id="tc-amt-007"></a>

## TC-AMT-007 · 100,000 KZT executes immediately, no SMS

| Field | Value |
|-------|-------|
| ID | TC-AMT-007 (new in Week 4) |
| Traces to | REQ-AMT-003 · Decision table Rule 4 |
| Technique | BVA on the SMS threshold, on-point. The brief says *above* 100,000, so 100,000 itself must not trigger SMS |
| Priority | High |
| Preconditions | TD-01 reset (balance 2,000,000 KZT, used today 0 KZT). Logged in as `test01`. Accounts screen open |
| Test data | From Current ••1001 → To Deposit ••4417; amount `100000` |

**Steps**

1. Perform N1 with From = Current ••1001, To = Deposit ••4417.
2. Enter `100000` in **Amount**.
3. Tap **Continue**.
4. Open Accounts, then the Statement of ••1001, then Profile → Limits.
5. Open the SMS stub for +7 700 000 0001.

**Expected results**

| After step | Expected |
|:----------:|----------|
| 3 | *Transfer completed* screen within 3 s. No SMS code screen |
| 4 | Balance is 1,900,000 KZT. Exactly one new debit of 100,000 KZT. Used today is 100,000 KZT |
| 5 | No new message |

**Postconditions:** TD-01 balance 1,900,000 KZT, used today 100,000 KZT. Reset TD-01 before reuse.

---

<a id="tc-dec-01"></a>

## TC-DEC-01 · Amount error shown, daily limit error suppressed

| Field | Value |
|-------|-------|
| ID | TC-DEC-01 |
| Traces to | REQ-PRI-001, REQ-AMT-002, REQ-LIM-001 · Decision table Rule 1 (R7) |
| Technique | Decision table. Both conditions C1 and C2 are false on purpose |
| Priority | High |
| Preconditions | TD-02 reset (balance 2,000,000 KZT, used today 900,000 KZT). Logged in as `test02`. Accounts screen open |
| Test data | From Current ••2001 → To Deposit ••4427; amount `600000`. The amount is above 500,000, and 900,000 + 600,000 = 1,500,000 is above 1,000,000 |

**Steps**

1. Perform N1 with From = Current ••2001, To = Deposit ••4427.
2. Enter `600000` in **Amount**.
3. Tap **Continue**.
4. Open Accounts, then the Statement of ••2001, then Profile → Limits.

**Expected results**

| After step | Expected |
|:----------:|----------|
| 3 | Only the amount error is shown: *«Maximum transfer amount per transaction is 500,000 KZT»*. No daily limit message anywhere on screen. No SMS code screen |
| 4 | Balance is 2,000,000 KZT. No new Statement entry. Used today is still 900,000 KZT |

**Postconditions:** TD-02 unchanged.

---

<a id="tc-dec-02"></a>

## TC-DEC-02 · Daily limit exceeded by 1 KZT rejected

| Field | Value |
|-------|-------|
| ID | TC-DEC-02 |
| Traces to | REQ-LIM-001 · Decision table Rule 2 (R3) |
| Technique | Decision table + BVA on the daily limit, 1 KZT above. The amount is valid and above 100,000; C3 is "don't care" for Rule 2 |
| Priority | High |
| Preconditions | TD-02 reset (balance 2,000,000 KZT, used today 900,000 KZT). Logged in as `test02`. Accounts screen open. SMS stub inbox open for +7 700 000 0002 |
| Test data | From Current ••2001 → To Deposit ••4427; amount `100001`. 900,000 + 100,001 = 1,000,001 |

**Steps**

1. Perform N1 with From = Current ••2001, To = Deposit ••4427.
2. Enter `100001` in **Amount**.
3. Tap **Continue**.
4. Open the SMS stub for +7 700 000 0002.
5. Open Accounts, then the Statement of ••2001, then Profile → Limits.

**Expected results**

| After step | Expected |
|:----------:|----------|
| 3 | Error under the Amount field: *«Daily limit of 1,000,000 KZT exceeded»*. No SMS code screen: the limit is checked before a code is requested |
| 4 | No new message |
| 5 | Balance is 2,000,000 KZT. No new Statement entry. Used today is still 900,000 KZT |

**Postconditions:** TD-02 unchanged.

---

<a id="tc-lim-001"></a>

## TC-LIM-001 · Daily total reaching exactly 1,000,000 KZT allowed

| Field | Value |
|-------|-------|
| ID | TC-LIM-001 (new in Week 4) |
| Traces to | REQ-LIM-001, REQ-AMT-003 · Decision table Rule 4 |
| Technique | BVA on the daily limit, on-point. The limit means "not more than", so a total equal to the limit is allowed |
| Priority | High |
| Preconditions | TD-02 reset (balance 2,000,000 KZT, used today 900,000 KZT). Logged in as `test02`. Accounts screen open |
| Test data | From Current ••2001 → To Deposit ••4427; amount `100000`. 900,000 + 100,000 = 1,000,000 |

**Steps**

1. Perform N1 with From = Current ••2001, To = Deposit ••4427.
2. Enter `100000` in **Amount**.
3. Tap **Continue**.
4. Open Accounts, then the Statement of ••2001, then Profile → Limits.

**Expected results**

| After step | Expected |
|:----------:|----------|
| 3 | *Transfer completed* screen within 3 s. No limit error. No SMS code screen (100,000 is not above the threshold) |
| 4 | Balance is 1,900,000 KZT. Exactly one new debit of 100,000 KZT. Used today is 1,000,000 KZT |

**Postconditions:** TD-02 at its limit (used today 1,000,000 KZT). Reset TD-02 before reuse.

---

<a id="tc-sms-001"></a>

## TC-SMS-001 · 100,001 KZT confirmed with correct SMS code

| Field | Value |
|-------|-------|
| ID | TC-SMS-001 (absorbs Week 3 TC-AMT-003 and TC-DEC-03) |
| Traces to | REQ-AMT-003, REQ-SMS-001, REQ-LIM-001 · Decision table Rule 3 · State transition S1 → S4 |
| Technique | BVA on the SMS threshold (above) + state transition, valid path |
| Priority | Critical |
| Preconditions | TD-01 reset (balance 2,000,000 KZT, used today 0 KZT). Logged in as `test01`. Accounts screen open. SMS stub inbox open in a browser |
| Test data | From Current ••1001 → To Deposit ••4417; amount `100001`; code = the newest code in the SMS stub for +7 700 000 0001 |

**Steps**

1. Perform N1 with From = Current ••1001, To = Deposit ••4417.
2. Enter `100001` in **Amount**.
3. Tap **Continue**.
4. In the SMS stub, read the newest code for +7 700 000 0001.
5. Within 60 s of step 3, enter that code in the 6 cells and tap **Confirm** once.
6. Open Accounts, then the Statement of ••1001, then Profile → Limits.

**Expected results**

| After step | Expected |
|:----------:|----------|
| 3 | SMS code screen with 6 input cells and a countdown starting at 2:00. Balance not yet changed |
| 4 | Exactly one new message. The code is exactly 6 digits |
| 5 | *Transfer completed* screen within 3 s |
| 6 | Balance is 1,899,999 KZT. Exactly one new debit of 100,001 KZT. Used today is 100,001 KZT |

**Postconditions:** the transfer is Confirmed (S4). TD-01 balance 1,899,999 KZT, used today 100,001 KZT. Reset TD-01 before reuse.

---

<a id="tc-sms-002"></a>

## TC-SMS-002 · Third wrong code cancels the transfer

| Field | Value |
|-------|-------|
| ID | TC-SMS-002 |
| Traces to | REQ-SMS-003 · State transition S1 → S2 → S3 → S5 |
| Technique | State transition testing, valid transitions on the "wrong code" event |
| Priority | Critical |
| Preconditions | TD-01 reset (balance 2,000,000 KZT, used today 0 KZT). Logged in as `test01`. Accounts screen open. SMS stub inbox open for +7 700 000 0001 |
| Test data | From Current ••1001 → To Deposit ••4417; amount `150000`. **Wrong code W** = the newest code in the SMS stub with its last digit raised by 1 (9 → 0). Example: real `482913` → W = `482914` |

**Steps**

1. Perform N1 with From = Current ••1001, To = Deposit ••4417.
2. Enter `150000` in **Amount** and tap **Continue**.
3. In the SMS stub, read the newest code for +7 700 000 0001 and work out W.
4. Clear the code cells if they are not empty, enter W and tap **Confirm**.
5. Repeat step 4.
6. Repeat step 4.
7. Open Accounts, then the Statement of ••1001, then Profile → Limits.
8. Open Transfers → History and check the newest transfer.
9. Perform N1 again, enter `100`, tap **Continue**.

Steps 4 to 6 must all be finished while the countdown still shows 0:30 or more, so the timer cannot cancel the transfer first.

**Expected results**

| After step | Expected |
|:----------:|----------|
| 2 | SMS code screen, countdown starting at 2:00 |
| 3 | Exactly one new message, with a 6-digit code |
| 4 | Error saying the code is wrong. The code screen stays open and the countdown keeps running |
| 5 | Same as step 4. The code screen stays open |
| 6 | The code screen closes. A message says the transfer is cancelled |
| 7 | Balance is 2,000,000 KZT. No new Statement entry. Used today is 0 KZT |
| 8 | Status Cancelled, amount 150,000 KZT |
| 9 | *Transfer completed*: the customer is not blocked. The brief cancels only the current transfer (see the [Week 3 AI hallucination note](../week3-test-design/README.md#what-ai-invented-hallucinations)) |

The brief does not define the wrong-code error text or an attempts-remaining counter, so step 4 checks only that *an* error appears and the screen stays open.

**Postconditions:** the 150,000 KZT transfer is Cancelled (state S5). TD-01 balance 1,999,900 KZT and used today 100 KZT, from step 9. Reset TD-01 before reuse.

---

<a id="tc-sms-003"></a>

## TC-SMS-003 · Correct code entered after 120 s is rejected

| Field | Value |
|-------|-------|
| ID | TC-SMS-003 |
| Traces to | REQ-SMS-002, REQ-SMS-004 · State transition S1 → S6, then invalid event S6 + correct code · Product risk R2 |
| Technique | State transition testing, timeout path plus one invalid transition |
| Priority | Critical |
| Preconditions | TD-01 reset (balance 2,000,000 KZT, used today 0 KZT). Logged in as `test01`. Accounts screen open. SMS stub inbox open. A stopwatch is ready |
| Test data | From Current ••1001 → To Deposit ••4417; amount `200000`; code = the newest code in the SMS stub. Waiting time 125 s: 5 s of margin for manual timing. The exact 119 s / 121 s boundary is left for automation |

**Steps**

1. Perform N1 with From = Current ••1001, To = Deposit ••4417.
2. Enter `200000` in **Amount**, tap **Continue**, and start the stopwatch as soon as the code screen appears.
3. Read the code in the SMS stub. Do not enter it.
4. Wait until the stopwatch shows 125 s.
5. If the code cells can still be edited, enter the correct code and tap **Confirm**.
6. Open Accounts, then the Statement of ••1001, then Profile → Limits.

**Expected results**

| After step | Expected |
|:----------:|----------|
| 4 | Countdown has reached 0:00. The app shows that the code has expired and the transfer is cancelled (S6) |
| 5 | Either the cells or **Confirm** are disabled, or **Confirm** returns a code-expired error. The transfer is not completed |
| 6 | Balance is 2,000,000 KZT. No new Statement entry. Used today is 0 KZT |

**Limitation:** this case runs through the app, so it passes if the app only disables the cells. It cannot show whether the server would still accept the code. That is checked by release checklist item 4 and, in Week 5, by an API test.

**Postconditions:** the transfer is Expired (S6). TD-01 unchanged.

---

<a id="tc-sms-004"></a>

## TC-SMS-004 · Double tap on Confirm debits once

| Field | Value |
|-------|-------|
| ID | TC-SMS-004 |
| Traces to | REQ-SMS-004 · Invalid transitions S4 + correct code and S4 + timer expires · Product risks R1, R3 |
| Technique | State transition testing, invalid transitions from the Confirmed state |
| Priority | Critical |
| Preconditions | TD-01 reset (balance 2,000,000 KZT, used today 0 KZT). Logged in as `test01`. Accounts screen open. SMS stub inbox open |
| Test data | From Current ••1001 → To Deposit ••4417; amount `100001`; code = the newest code in the SMS stub |

**Steps**

1. Perform N1 with From = Current ••1001, To = Deposit ••4417.
2. Enter `100001` in **Amount** and tap **Continue**.
3. Read the code in the SMS stub and enter it in the 6 cells.
4. Tap **Confirm** twice in quick succession (a double tap, under 0.5 s between taps).
5. Stay on the result screen for 130 s. The original 120 s code timer has now passed.
6. Open Accounts, then the Statement of ••1001, then Profile → Limits.
7. Open Transfers → History and check the newest transfer.

**Expected results**

| After step | Expected |
|:----------:|----------|
| 4 | **One** *Transfer completed* screen. No second confirmation, no error |
| 5 | No *expired* or *cancelled* message appears |
| 6 | Balance is 1,899,999 KZT. Exactly one new debit of 100,001 KZT. Used today is 100,001 KZT |
| 7 | Exactly one transfer of 100,001 KZT, with status Completed (not Expired or Cancelled) |

**Postconditions:** the transfer is Confirmed (S4). TD-01 balance 1,899,999 KZT, used today 100,001 KZT. Reset TD-01 before reuse.
