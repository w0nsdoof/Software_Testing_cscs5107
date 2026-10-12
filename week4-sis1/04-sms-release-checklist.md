# 4. Release checklist: SMS code flow

Run it on release day against the release candidate. Items 1, 6b and 12 are checked against the production configuration. All other items are checked on ENV-T2 with the test customers from the [README](README.md#shared-test-environment-and-data).

The release tester ticks an item only after checking it on this build. An unticked item blocks the release unless the product owner accepts it in writing.

The checklist says what to verify and leaves the how to the tester. Each line traces to a state or boundary from Week 3.

| # | Check | Traces to | Pass |
|:-:|-------|-----------|:----:|
| 1 | A code sent to the release team's phone through the production SMS gateway arrives within 30 s, from the correct sender ID | Production readiness · project risk PR-2 | ☐ |
| 2 | Codes are always 6 digits, including a leading zero. A code like `004213` must be sent and accepted as six digits, not as `4213`. A tester cannot force a leading zero by hand, so check the developers' unit test for the code generator, and check that 20 codes in the SMS stub all have 6 characters | REQ-SMS-001 | ☐ |
| 3 | The countdown starts at 2:00. At 0:00 the transfer is cancelled and the app says the code has expired | REQ-SMS-002 · S1 → S6 | ☐ |
| 4 | A correct code sent after expiry is rejected by the server, not just disabled in the app (send it again from the API or repeat the request) | REQ-SMS-002, REQ-SMS-004 · S6 + code · R2 | ☐ |
| 5 | The third wrong code cancels the transfer, and the customer can start a new transfer straight away | REQ-SMS-003 · S3 → S5 | ☐ |
| 6 | (a) On ENV-T2, tapping **Confirm** twice debits once. (b) The idempotency key on the confirm request is switched on in the production config | REQ-SMS-004 · S4 + code · R1 | ☐ |
| 7 | After a successful confirmation, no *expired* or *cancelled* status or notification appears after the 120 s mark | REQ-SMS-004 · S4 + timer · R3 | ☐ |
| 8 | 100,000 KZT executes without a code. 100,001 KZT asks for a code | REQ-AMT-003 | ☐ |
| 9 | A transfer over the daily limit is rejected before a code is sent: no SMS is sent for TD-02 + 100,001 KZT | REQ-LIM-001 · Rule 2 | ☐ |
| 10 | *Used today* equals the sum of the day's Completed transfers. Expired and cancelled transfers are not counted | REQ-LIM-001, REQ-SMS-002, REQ-SMS-003 | ☐ |
| 11 | The SMS text is correct in KZ, RU and EN and shows the code, the amount, the 2-minute validity and a *do not share this code* warning | Localisation, security notice | ☐ |
| 12 | Monitoring alerts on code delivery failures and on duplicate debits for the same transfer ID. The rollback to the previous build has been rehearsed on staging | R1, PR-2 | ☐ |

**Sign-off:** release tester ____________ · product owner ____________ · date ____________ · build ____________
