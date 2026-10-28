# Harvee Technologies — Written answers (Sections A, B and C)

> **Integrity note:** These are prepared assessment responses and examples. No browser execution, defect reproduction, client contact, or real production incident is claimed. Replace sample incident details with your own genuine experience before submitting or presenting.

## Section A — Approach
The 25 manual test cases in `docs/MANUAL_TEST_CASES.md` cover login, sorting, cart, checkout, session, validation, accessibility, responsive UI, and exploratory behavior. `tests/shop.spec.js` maps automated test names to manual IDs. The test suite uses public SauceDemo credentials, Playwright locators, a Page Object, isolated browser contexts, and assertions on outcomes. See `README.md` for running and reporting.

## Section B1 — Review AI-generated code
**Do not merge the AI snippet as-is.** It has these issues:

1. `test('cart total is correct', async ({ page }) => { ... })` depends on a `page` fixture; the generated code should import `{ test, expect }` from `@playwright/test`.
2. It navigates to a site and fills login inputs using `#user-name` / `#password`, which may work today, but stable `data-test` locators are preferable.
3. It uses an ambiguous `click('button')` to log in, which can select the wrong button. Use `[data-test="login-button"]`.
4. It clicks a shopping cart link before adding products. The cart can be empty, so the test cannot validate a meaningful cart total.
5. It appears to click checkout before providing first name, last name, and postal code; checkout cannot advance correctly without these.
6. It mixes selectors for checkout pages and expects a `summary_total_label` even if the previous steps fail to reach the overview.
7. It checks `toBeTruthy()` on a text string. Any nonempty string (including an incorrect total) passes; it never verifies arithmetic.
8. It does not verify item prices, subtotal, tax, rounding, order completion, or that the cart is emptied.
9. It lacks meaningful assertions on navigation and error states, making failures hard to diagnose.
10. The code is not isolated from previous cart state and does not use a maintainable Page Object.

**Better implementation:** `TC14` in `tests/shop.spec.js` logs in, adds two named products, enters checkout details, extracts all overview item prices, compares subtotal, verifies `total ≈ subtotal + displayed tax`, finishes, checks confirmation, and checks the cart is empty. `toBeCloseTo(..., 2)` tolerates floating-point representation; for money-sensitive production code, compare integer cents or use a decimal library. Run it against the actual site and review its report before merging.

## Section B2 — Test an AI feature
**Chosen scenario: Defect report summarizer.** An LLM converts long defect reports into three bullets: steps, observed behavior, and expected behavior.

| Check | How to score | Review |
|---|---|---|
| Factual grounding | Extract asserted entities, versions, steps, severity; count unsupported facts; target zero critical hallucinations | Automatic comparison + human for critical cases |
| Coverage | Required facts preserved / required facts in source; target ≥95% on labeled dataset | Human-labeled benchmark + automated scoring |
| Format | Exactly three labeled bullets, valid lengths and ordering | Deterministic parser |
| Sensitive data | Seed PII/API tokens in inputs; measure leaks; target zero leaked secrets | DLP checks + security review |

Use a representative evaluation set: short/long reports, contradictory notes, missing repro steps, multilingual content, prompt injection, and near-duplicate defects. Split into development and held-out datasets; version prompts and models; review false positives/negatives. Never treat an LLM-as-judge score as the sole release gate. Escalate high-risk outputs to human reviewers.

## Section B3 — Trace a test case generator
**Data path:** test case description → prompt/template with schema → model output → JSON parsing → schema validation → semantic validation → saved test case.

**Checks:** (1) validate required fields `id`, `title`, `preconditions`, `steps[]`, `expectedResult`, `priority`; (2) enforce data types, enums and nonempty strings; (3) reject unknown fields if schema forbids them; (4) ensure every step has a matching expected result; (5) check unique IDs and no duplicate test cases; (6) reject invented product behavior or missing assumptions; (7) use adversarial prompts including malformed JSON, markdown fences, truncated arrays, escaped quotes, unicode, and injection text; (8) verify failures are safely logged and never silently accepted. Example negative case: `{"id":"TC1","steps":"click login"}` must fail because `steps` is not an array and required fields are missing. Measure schema pass rate and semantic acceptance separately.

## Section B4 — CI failure triage
When an AI bot reads a failed CI test log and labels it `product defect`, `flaky test`, or `environment problem`, keep its classification **advisory**, not a merge gate. Redact secrets from logs, restrict bot access to the minimal repository and CI data, validate structured output, and attach evidence (test name, build, environment, trace, screenshot, retry history). Compare bot labels to human-reviewed ground truth using a confusion matrix, per-class precision/recall, and especially false negatives for product defects. Monitor confidence calibration and label drift. Do not auto-close defects or auto-retry indefinitely. On uncertain classifications, route to an engineer. Use a deterministic policy for release blocking based on actual test results and risk, not only an AI label.

## Section B5 — Defect report (hypothetical; reproduce before filing)
**Title:** Price low-to-high sorting displays an out-of-order product in SauceDemo 4.2.0  
**Environment:** Chrome; SauceDemo 4.2.0 (as specified in assessment; version not independently verified)  
**Precondition:** `standard_user` logged in; inventory visible.  
**Steps:** 1. Open inventory. 2. Select `Price (low to high)`. 3. Record the prices of every product from top to bottom.  
**Expected:** Every adjacent pair satisfies `price[i] <= price[i+1]`.  
**Reported observation in task:** A $29.99 item appears before a $15.99 item after sorting.  
**Impact:** Misleading price comparison and customer friction; incorrect merchandising order.  
**Suggested severity:** Major / S2 (core sorting function incorrect). **Priority:** P1/high for a release with sorting as a key requirement; final prioritization depends on usage and business impact.  
**Evidence to attach:** Full inventory screenshot with selected sort option, browser/version, URL, timestamp, Playwright trace, and reproducibility count.  
**Status:** Not independently reproduced. Do not claim this as a confirmed live bug without executing TC06.

## Section B6 — Client message (under 150 words)
Hi [Product Manager],

Our release checks identified a price-sorting issue: after selecting “Price (low to high),” a $29.99 item appears above a $15.99 item. We are validating the issue with a fresh session and collecting evidence. Separately, the checkout test failed once in ten runs and passed on retry; we are investigating whether this is a product, test, or environment issue rather than assuming it is safe.

I recommend holding Friday's release until the sorting issue is fixed or formally accepted as a documented risk, and until the checkout failure is triaged. We can prioritize a focused fix, rerun the impacted regression tests, and share a go/no-go update with evidence. If timing is critical, we can discuss a controlled rollout or feature rollback plan.

Thanks,
QA Team

## Section C1 — Live issue analysis: checkout fails for some users
1. **Clarify and scope:** Which users, regions, browsers, devices, accounts, time window, and checkout step? Is it a complete failure, timeout, or intermittent error? Determine business impact and whether payments were charged.
2. **Check signals:** Recent deployments and feature flags, browser console/network traces, API 4xx/5xx rates, latency, gateway errors, application logs, distributed traces, database health, and failed order/payment metrics.
3. **Reproduce safely:** Use affected account type or sanitized test data in a staging environment; test a minimal checkout path, then vary one dimension at a time (browser, account, item, payment method, network). Avoid duplicate real orders/charges.
4. **Narrow root cause:** Compare affected vs unaffected requests, correlation IDs, deployment versions, API payloads, authorization, inventory, tax, and payment provider responses. Use logs to distinguish data-specific defects from environmental instability.
5. **Communicate:** Give product and engineering a short update: impact, start time, known reproduction, suspected component, workaround, owner, and next update time. State hypotheses as hypotheses.
6. **Contain and prevent:** Consider rollback or disabling a faulty feature if safe; patch, add targeted automated tests and monitoring alerts, document root cause and post-incident actions.

## Section C2 — Recent production issue (adapt to your real experience)
**Practice example, NOT a claim about an actual production incident:**

1. **What happened:** A mobile application's login flow unexpectedly navigated to Home after entering only an email address, without a password. This could permit unauthorized access if the server also accepted the session.
2. **Root cause:** Not established by the UI observation alone. Potential causes include a client-side navigation bug or a backend authorization defect; inspect auth responses, tokens, and protected API access before concluding.
3. **Explaining it to the client:** Report the reproduction steps and impact, distinguish visible UI navigation from confirmed unauthorized backend access, and escalate for immediate security investigation.
4. **Prevention:** Add negative login tests for missing passwords, verify protected API endpoints reject unauthenticated requests, add security-focused regression coverage and release gates.
5. **Next time:** Capture network traces and token/session evidence earlier, test on clean devices, and coordinate with developers to establish root cause before assigning severity.

**Interview guidance:** Replace this with a real incident you personally investigated. Be ready to explain exact evidence, how it was fixed, and what changed after the fix. If you have not handled production incidents, say so and explain the investigation method instead.
