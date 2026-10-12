# 5. Defect reports

> These defects are mocks. The assignment allows designed reports (Week 4, slide 38), so none of them was observed on a real system. Each one plays out a Week 3 invalid state transition, one per product risk R1 to R3 in the [test plan](01-test-plan.md#top-3-product-risks), against a hypothetical build. Environment, build numbers, request IDs and timestamps are illustrative. The steps use the real test data from the [README](README.md#shared-test-environment-and-data), so a build that has the defect would reproduce it as written.

Titles follow the formula `[Where]: [what happens] [under what condition]`. Severity is how bad the effect on the system is, and the tester sets it. Priority is how soon it must be fixed, and the product owner sets it.

| ID | Title | Severity | Priority | Traces to |
|----|-------|:--------:|:--------:|-----------|
| [DEF-001](#def-001) | SMS confirmation: account debited twice when Confirm is double-tapped on a transfer above 100,000 KZT | Critical | P1, fix now | REQ-SMS-004 · TC-SMS-004 · R1 |
| [DEF-002](#def-002) | SMS confirmation: transfer completes when the correct code is submitted after the 120-second timer has expired | High | P1, fix now | REQ-SMS-002 · TC-SMS-003 · R2 |
| [DEF-003](#def-003) | SMS confirmation: completed transfer shows status Expired when Confirm is tapped in the last second of the 120-second window | High | P2, next release | REQ-SMS-004 · ES-01 · R3 |

---

<a id="def-001"></a>

## DEF-001 · SMS confirmation: account debited twice when Confirm is double-tapped on a transfer above 100,000 KZT

| Field | Value |
|-------|-------|
| ID / status | DEF-001 · New |
| Reported | Zhumabayev A. · 2026-10-12 14:20 (UTC+5) |
| Environment | iPhone 13, iOS 18.2 · app 4.11.0 (build 2291) · ENV-T2 (back end TEST-2) · Wi-Fi |
| Preconditions | TD-01 reset: balance 2,000,000 KZT, used today 0 KZT. Logged in as `test01`. SMS stub inbox open for +7 700 000 0001 |
| Traces to | REQ-SMS-004 · TC-SMS-004, step 4 · product risk R1 |

**Steps to reproduce**

1. Tap **Transfers → Between my accounts**. Select From = Current ••1001, To = Deposit ••4417.
2. Enter `100001` and tap **Continue**.
3. Enter the 6-digit code from the SMS stub.
4. Double-tap **Confirm**, with less than 0.5 s between the taps.
5. Open the **Statement** of ••1001.

**Expected result:** exactly one debit of 100,001 KZT. Balance 1,899,999 KZT. *Used today* 100,001 KZT (REQ-SMS-004: a confirmed transfer is executed exactly once).

**Actual result:**

- The app showed one *Transfer completed* screen.
- The Statement shows two debits of 100,001 KZT, both at 14:12:31, with transfer IDs `TRF-20261012-55120` and `TRF-20261012-55121`.
- Balance is 1,799,998 KZT. *Used today* is 200,002 KZT.

**Reproducibility:** 4 of 5 attempts with a double tap. 0 of 5 with a single tap. TD-01 was reset before each attempt, so the daily limit never interfered.

**Severity:** Critical. The customer loses money directly, and the daily limit counter is inflated.
**Priority:** P1, fix now. It blocks the release (exit criterion 2). Every confirmed transfer above 100,000 KZT is exposed.

**Evidence:**

- Screen recording `DEF-001_double_tap.mov` (mock).
- Request IDs of the two confirm requests: `req-7f3a91c2`, `req-7f3a91c9` (mock).
- Screenshot of the Statement with both entries.

---

<a id="def-002"></a>

## DEF-002 · SMS confirmation: transfer completes when the correct code is submitted after the 120-second timer has expired

| Field | Value |
|-------|-------|
| ID / status | DEF-002 · New |
| Reported | Zhumabayev A. · 2026-10-12 15:05 (UTC+5) |
| Environment | iPhone 13, iOS 18.2 · app 4.11.0 (build 2291) · ENV-T2 (back end TEST-2) · Wi-Fi |
| Preconditions | TD-01 reset: balance 2,000,000 KZT, used today 0 KZT. Logged in as `test01`. SMS stub inbox open for +7 700 000 0001. Stopwatch ready |
| Traces to | REQ-SMS-002, REQ-SMS-004 · TC-SMS-003, step 5 · product risk R2 |

**Steps to reproduce**

1. Tap **Transfers → Between my accounts**. Select From = Current ••1001, To = Deposit ••4417.
2. Enter `200000` and tap **Continue**. Start the stopwatch when the code screen appears.
3. Read the code in the SMS stub. Do not enter it yet.
4. When the stopwatch shows 125 s, enter the code and tap **Confirm**.

**Expected result:** at 0:00 the transfer is cancelled. The code entered at 125 s is rejected with a code-expired error. No debit. Balance stays 2,000,000 KZT (REQ-SMS-002).

**Actual result:**

- At 0:00 the countdown label changed to *Code expired*, but the 6 code cells and **Confirm** stayed enabled.
- At 125 s, **Confirm** opened *Transfer completed*.
- Statement: one debit of 200,000 KZT. Balance 1,800,000 KZT. *Used today* 200,000 KZT.

**Reproducibility:** 5 of 5 attempts at 125 s. Also 2 of 2 at 180 s. TD-01 was reset before each attempt.

**Severity:** High. A security control (code validity) is bypassed. The money goes where the customer intended, so this is not a direct loss.
**Priority:** P1, fix now. Expired one-time codes being accepted is a compliance finding in banking, and it is cheap to exploit: wait out the timer, then submit.

**Evidence:**

- Screen recording showing the stopwatch and the countdown together, `DEF-002_late_code.mov` (mock).
- Confirm request ID `req-81bd0e44` (mock), with server time 125 s after the code was issued.

---

<a id="def-003"></a>

## DEF-003 · SMS confirmation: completed transfer shows status Expired when Confirm is tapped in the last second of the 120-second window

| Field | Value |
|-------|-------|
| ID / status | DEF-003 · New |
| Reported | Zhumabayev A. · 2026-10-12 16:40 (UTC+5) |
| Found by | Exploratory session ES-01 (SMS timing, see the [test plan approach](01-test-plan.md#approach)). No scripted test case covers it yet (see [RTM gap G6](03-rtm.md#coverage-gaps)) |
| Environment | iPhone 13, iOS 18.2 · app 4.11.0 (build 2291) · ENV-T2 (back end TEST-2) · Wi-Fi |
| Preconditions | TD-01 reset: balance 2,000,000 KZT, used today 0 KZT. Logged in as `test01`. SMS stub inbox open for +7 700 000 0001. Push notifications allowed for the app |
| Traces to | REQ-SMS-004 · invalid transition S4 + timer expires · product risk R3 |

**Steps to reproduce**

1. Tap **Transfers → Between my accounts**. Select From = Current ••1001, To = Deposit ••4417.
2. Enter `200000` and tap **Continue**.
3. Enter the 6-digit code from the SMS stub. Do not tap Confirm yet.
4. Watch the countdown. As soon as it changes from 0:02 to 0:01, tap **Confirm** once, within about 0.5 s.
5. Wait 10 s. Open **Transfers → History** and check the newest transfer. Then open Accounts and Profile → Limits.
6. If the status is *Completed*, reset TD-01 and repeat steps 1 to 5. Stop after 20 attempts.

**Expected result:** *Transfer completed*. The History entry has status Completed. No *cancelled* notification (REQ-SMS-004: a confirmed transfer cannot be changed by the timer).

**Actual result:**

- The app showed *Transfer completed*.
- About 1 s later a push notification arrived: *«Transfer cancelled: code expired»*.
- The History entry for 200,000 KZT shows status Expired.
- But the balance is 1,800,000 KZT, and *Used today* is 200,000 KZT: the money **was** debited.

**Reproducibility:** 3 of 20 attempts when Confirm is tapped as the countdown turns to 0:01. 0 of 20 when tapped at 0:10. TD-01 was reset before each attempt. Intermittent and timing-dependent.

**Severity:** High. The status the customer sees contradicts the real money movement. A customer who believes the transfer was cancelled may send it again, and pay twice.
**Priority:** P2, next release. The window is about 1 s, and the defect shows up in about 15% of attempts inside it. The transfer itself is correct: the money moved once, to the right account. The risk is the customer's reaction to a false *cancelled* status, and support can resolve that from the Statement. The product owner may accept it for this release only **in writing**, with this ID, as exit criterion 2 requires.

**Evidence:**

- Screen recording with the push notification visible, `DEF-003_status_expired.mov` (mock).
- Screenshots of History (status *Expired*) and of the Statement (the 200,000 KZT debit).
- Request IDs: confirm `req-9c2214aa`, timeout event `evt-9c2214b0` (mock).

---

## Severity versus priority in these reports

DEF-001 and DEF-002 are severe and urgent. DEF-003 has the same severity as DEF-002, because a customer who sees a false cancellation may pay twice. It gets a lower priority because it is rare and support can check the real status from the Statement. The product owner can schedule it for the next release once the residual risk is accepted in writing.
