# SIS 1 / Week 3 Homework — Test Design

**Course:** CSCS5107 Software Testing and Debugging · KBTU · Fall 2026
**Student:** Zhumabayev Askar Erikuli

> Converted from the original Google Doc submission. The content is unchanged; only the formatting was cleaned up for Markdown. Week 4 builds on this design: see [../week4-sis1](../week4-sis1/README.md).

---

## Task A · Amount Analysis

### 1. Equivalence Partitions

According to the requirement brief, a single transfer amount must be between 100 and 500,000 KZT (whole integers only).

| Partition ID | Partition Description | Validity | Representative Value | Expected Behavior |
|---|---|---|---|---|
| **P1** | 100 <= Amount <= 500,000 KZT (Integers) | **Valid** | 250,000 KZT | Transfer accepted for processing |
| **P2** | Amount < 100 KZT | **Invalid** | 50 KZT | Error: Amount below minimum limit |
| **P3** | Amount > 500,000 KZT | **Invalid** | 600,000 KZT | Error: Amount exceeds maximum limit |
| **P4** | Fractional amounts (decimals/tiyn) | **Invalid** | 100.50 KZT | Error: Only whole KZT amounts allowed |
| **P5** | Negative values | **Invalid** | -100 KZT | Error: Invalid negative amount |
| **P6** | Non-numeric characters / Text | **Invalid** | "abc" | Error: Invalid field input format |
| **P7** | Empty input / NULL | **Invalid** | "" (Empty) | Error: Required field cannot be empty |

### 2. Boundary Value Analysis (BVA)

System Step Size = 1 KZT (since only integer values are permitted).

- **2-value BVA (Boundary + 1 Closest Neighbor):**
  - Lower boundary (100 KZT): **99**, **100**
  - Upper boundary (500,000 KZT): **500,000**, **500,001**
  - *Total:* 4 values.
- **3-value BVA (Boundary + 2 Neighbors):**
  - Lower boundary (100 KZT): **98**, **99**, **100**, **101**
  - Upper boundary (500,000 KZT): **499,999**, **500,000**, **500,001**, **500,002**
  - *Total:* 8 values.

### 3. Test Cases (ISO/IEC/IEEE 29119-3 Standard)

> **Combination Rule:** Each invalid test case includes **exactly one invalid parameter** to prevent error masking.

#### Test Case 1: Minimum Valid Amount Boundary

- **ID:** TC-AMT-001
- **Traces to:** REQ-AMT-001 (Min Amount Limit)
- **Preconditions:** User is authenticated; account balance = 1,000,000 KZT; daily spent limit = 0 KZT.
- **Inputs:** Enter amount "100 KZT" and tap "Transfer".
- **Expected Result:** Transfer accepted; SMS code not requested; 100 KZT debited from balance.
- **Postconditions:** Daily spent limit updated to 100 KZT.

#### Test Case 2: Maximum Valid Amount Boundary

- **ID:** TC-AMT-002
- **Traces to:** REQ-AMT-002 (Max Amount Limit & SMS Trigger)
- **Preconditions:** User is authenticated; account balance = 1,000,000 KZT; daily spent limit = 0 KZT.
- **Inputs:** Enter amount "500,000 KZT" and tap "Transfer".
- **Expected Result:** SMS verification prompt displayed (since amount > 100,000 KZT); funds are not debited prior to SMS entry.
- **Postconditions:** Transfer status set to "Pending SMS Verification".

#### Test Case 3: Valid Amount Triggering SMS Threshold Boundary

- **ID:** TC-AMT-003
- **Traces to:** REQ-AMT-003 (SMS Boundary Check)
- **Preconditions:** User is authenticated; account balance = 1,000,000 KZT; daily spent limit = 0 KZT.
- **Inputs:** Enter amount "100,001 KZT" and tap "Transfer".
- **Expected Result:** 6-digit SMS verification screen displayed.
- **Postconditions:** 120-second SMS timer initiated.

#### Test Case 4: Invalid Amount Below Minimum (Negative Boundary)

- **ID:** TC-AMT-004
- **Traces to:** REQ-AMT-001 (Min Amount Restriction)
- **Preconditions:** User is authenticated; account balance = 1,000,000 KZT.
- **Inputs:** Enter amount "99 KZT" and tap "Transfer".
- **Expected Result:** Error message displayed: "Minimum transfer amount is 100 KZT"; transfer button disabled/rejected; no funds debited.
- **Postconditions:** Account balance and limit counters remain unchanged.

#### Test Case 5: Invalid Amount Exceeding Maximum (Positive Boundary)

- **ID:** TC-AMT-005
- **Traces to:** REQ-AMT-002 (Max Amount Restriction)
- **Preconditions:** User is authenticated; account balance = 1,000,000 KZT.
- **Inputs:** Enter amount "500,001 KZT" and tap "Transfer".
- **Expected Result:** Error message displayed: "Maximum transfer amount per transaction is 500,000 KZT"; transaction rejected.
- **Postconditions:** Account balance and limit counters remain unchanged.

#### Test Case 6: Invalid Non-Numeric Input Format

- **ID:** TC-AMT-006
- **Traces to:** REQ-AMT-004 (Input Format Validation)
- **Preconditions:** User is on the transfer screen.
- **Inputs:** Enter string "abc" into the amount input field.
- **Expected Result:** Field rejects non-numeric input or displays error "Invalid amount format".
- **Postconditions:** Form submission blocked.

---

## Task B · Approval Rules (Decision Tables)

### 1. Full Decision Table (2^3 = 8 Combinations)

*Conditions:*

- **C1:** Is transfer amount valid (100 – 500,000 KZT)?
- **C2:** Is daily limit respected (<= 1,000,000 KZT)?
- **C3:** Is transfer amount > 100,000 KZT?

*Actions:*

- **A1:** Reject: Transfer Amount Error
- **A2:** Reject: Daily Limit Exceeded Error
- **A3:** Request 6-digit SMS Code
- **A4:** Execute Transfer Immediately

| Conditions / Rules | R1 | R2 | R3 | R4 | R5 | R6 | R7 | R8 |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **C1: Amount valid (100–500k)?** | Y | Y | Y | Y | N | N | N | N |
| **C2: Daily limit OK (<= 1M)?** | Y | Y | N | N | Y | Y | N | N |
| **C3: Amount > 100k?** | Y | N | Y | N | Y | N | Y | N |
| **A1: Reject (Amount Error)** |  |  |  |  | X | X | **X** | **X** |
| **A2: Reject (Daily Limit Error)** |  |  | X | X |  |  | **?** | **?** |
| **A3: Request SMS Code** | X |  |  |  |  |  |  |  |
| **A4: Execute Immediately** |  | X |  |  |  |  |  |  |

### 2. Collapsed Decision Table

Applying the priority rule collapses rules R5–R8 and R3–R4 using don't-care states (`—`):

| Conditions / Rules | Rule 1 (R5–R8) | Rule 2 (R3–R4) | Rule 3 (R1) | Rule 4 (R2) |
|---|:-:|:-:|:-:|:-:|
| **C1: Amount valid (100–500k)?** | **N** | **Y** | **Y** | **Y** |
| **C2: Daily limit OK (<= 1M)?** | **—** | **N** | **Y** | **Y** |
| **C3: Amount > 100k?** | **—** | **—** | **Y** | **N** |
| **A1: Reject (Amount Error)** | **X** |  |  |  |
| **A2: Reject (Daily Limit Error)** |  | **X** |  |  |
| **A3: Request SMS Code** |  |  | **X** |  |
| **A4: Execute Immediately** |  |  |  | **X** |

### 3. Test Cases for Collapsed Decision Table

- **TC-DEC-01 (Rule 1 Coverage):**
  - *Inputs:* Amount = 600,000 KZT, Spent daily limit = 900,000 KZT (Total 1.5M > 1M).
  - *Expected Result:* Amount error displayed ("Amount exceeds 500,000 KZT"). Daily limit error masked per priority rule.
- **TC-DEC-02 (Rule 2 Coverage):**
  - *Inputs:* Amount = 200,000 KZT, Spent daily limit = 900,000 KZT (Amount valid, but total 1.1M > 1M).
  - *Expected Result:* Daily limit error displayed ("Daily limit of 1,000,000 KZT exceeded").
- **TC-DEC-03 (Rule 3 Coverage):**
  - *Inputs:* Amount = 150,000 KZT, Spent daily limit = 0 KZT.
  - *Expected Result:* 6-digit SMS verification form displayed.
- **TC-DEC-04 (Rule 4 Coverage):**
  - *Inputs:* Amount = 50,000 KZT, Spent daily limit = 0 KZT.
  - *Expected Result:* Transfer executed immediately without SMS prompt.

### 4. Questions & Gaps for Business Analyst

1. **Balance Check Priority:** The brief does not define system behavior when amount and daily limit are valid, but the user has insufficient account balance. Does balance error take precedence over daily limit or amount rules?
2. **Daily Limit Reset Timezone:** The requirement specifies midnight Almaty time (UTC+5). What is the expected system behavior if a user initiates a transfer from a different timezone (e.g., UTC+3)?
3. **Handling Decimal Amounts:** What happens if a user submits a decimal amount (e.g., 100.50 KZT)? Is an error displayed or is the amount automatically rounded?

---

## Task C · SMS Code State Model

### 1. State Table

*States:*

- **S1:** Waiting (Attempt 1)
- **S2:** Waiting (Attempt 2)
- **S3:** Waiting (Attempt 3)
- **S4:** Confirmed (Transfer Executed)
- **S5:** Blocked (Transfer Canceled via 3 Failed Attempts)
- **S6:** Expired (Transfer Canceled via 120s Timeout)

| Current State / Event | Correct Code Entered | Wrong Code Entered | Timer 120s Expires |
|---|---|---|---|
| **S1: Waiting (Attempt 1)** | → **S4 (Confirmed)** | → **S2 (Waiting Attempt 2)** | → **S6 (Expired)** |
| **S2: Waiting (Attempt 2)** | → **S4 (Confirmed)** | → **S3 (Waiting Attempt 3)** | → **S6 (Expired)** |
| **S3: Waiting (Attempt 3)** | → **S4 (Confirmed)** | → **S5 (Blocked)** | → **S6 (Expired)** |
| **S4: Confirmed** | *[Empty 1: Double-click]* | *[Empty 2: Late input]* | *[Empty 3: Late timer]* |
| **S5: Blocked** | Ignored / Error | Ignored / Error | Ignored / Error |
| **S6: Expired** | Ignored / Error | Ignored / Error | Ignored / Error |

### 2. Valid-Transitions Coverage (0-switch Coverage Tests)

To cover all 9 valid transitions, 3 test scenarios are required:

1. **Test 1 (Happy Path):** S1 → (Correct Code) → S4 (Confirmed).
2. **Test 2 (Recovery & Failure by Attempts):** S1 → (Wrong) → S2 → (Wrong) → S3 → (Wrong) → S5 (Blocked).
3. **Test 3 (Expiration Path):** S1 → (120s Pass) → S6 (Expired).

### 3. Top 3 Dangerous Invalid Transitions & Business Risks

1. **Invalid Transition: S4 (Confirmed) + Event: Correct Code Entered (Double-click / Network Retry)**
   - *Risk:* Rapid double-tapping of the "Confirm" button or network retries without idempotency checks re-processes the transaction.
   - *Business Impact:* **Double-Debit Defect** (debiting funds twice from the user's card).
2. **Invalid Transition: S6 (Expired) + Event: Correct Code Entered (Late SMS Submission)**
   - *Risk:* Delayed SMS delivery leads user to submit code right after the 120s timer expires, but backend validates it anyway.
   - *Business Impact:* Execution of an expired transfer without valid security authorization.
3. **Invalid Transition: S4 (Confirmed) + Event: Timer 120s Expires (Asynchronous Post-Success Timeout)**
   - *Risk:* Timer callback fires milliseconds after transfer status transitions to Confirmed.
   - *Business Impact:* System attempts to cancel or reverse an already processed transaction.

---

## Task D · AI Comparison & Critique

### 1. Executed Prompt (Slide 124)

Prompt from slides 125 was submitted to a Gemini 3.8 Flash

### 2. Critical Analysis of AI Output

#### What AI Got Right

- **Base Structure:** AI quickly and neatly constructed decision tables and equivalence partitions.
- **Direct Boundaries:** Accurately identified boundaries at 100 and 500,000 KZT with +/- 1 steps.

#### What AI Missed

1. **Implicit Boundaries:** AI missed fractional decimal steps (tiyn) and did not notice the midnight reset boundary under Almaty timezone (UTC+5).
2. **Empty Cells in State Table:** AI generated only happy paths and ignored unplanned transitions from `Confirmed` and `Expired` states.
3. **Balance Check Omission:** AI failed to flag the absence of account balance validation rules in the requirement brief.

#### What AI Invented (Hallucinations)

- AI invented a non-existent rule: *"User card/account is blocked for 24 hours after 3 failed SMS attempts"*. In the original brief, only the **current transfer** is canceled.

### Conclusion

AI serves as an excellent tool for initial formatting and draft table generation. However, a human QA engineer is essential for uncovering implicit boundaries, analyzing invalid state transitions, and identifying hallucinated business rules.
