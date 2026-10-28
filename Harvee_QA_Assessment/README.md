# Harvee Technologies — QA Automation Assessment

**Candidate:** Santhuru S.  
**Stack:** JavaScript, Playwright Test, Page Object Model (POM)  
**Practice application:** https://www.saucedemo.com/  
**Status:** Prepared code and documentation; **tests have not been executed in this environment**. Do not report them as passing without running them.

## Folder structure
```text
Harvee_QA_Assessment/
├── README.md
├── ANSWERS.md
├── package.json
├── playwright.config.js
├── .gitignore
├── docs/
│   └── MANUAL_TEST_CASES.md
├── pages/
│   └── ShopPage.js
└── tests/
    └── shop.spec.js
```

## Setup and run
Requirements: Node.js 18+ and npm. Run in the project directory:
```bash
npm install
npx playwright install chromium
npm test
npm run test:headed
npm run test:report
```
For a single test: `npx playwright test -g "TC14"`. To run sequentially for debugging: `npx playwright test --workers=1`.

**Reports:** HTML report at `playwright-report/index.html`, JUnit at `test-results/results.xml`. Failed tests retain trace and screenshot; open a trace with `npx playwright show-trace <trace.zip>`.

## Coverage / traceability
| Automated test | Manual test | Purpose |
|---|---|---|
| `TC01` | TC01 | Valid login |
| `TC03` | TC03 | Locked user |
| `TC06` | TC06 | Full ascending price order |
| `TC07` | TC07 | Full descending price order |
| `TC08` | TC08 | Full ascending name order |
| `TC09` | TC09 | Full descending name order |
| `TC10` | TC10 | Add/remove cart items |
| `TC11` | TC11 | Remove last item |
| `TC14` | TC14 | Checkout math, completion, empty cart |
| `TC15` | TC15 | First-name validation |
| `TC16` | TC16 | Cancel checkout |
| `TC18` | TC18 | Logout and direct URL protection |

## Design notes
- Every Playwright test gets an isolated browser context via the built-in `page` fixture; tests do not rely on order or previous state.
- Page Object encapsulates common login, sorting, cart and checkout actions; assertions remain mostly in tests.
- `data-test` locators reduce brittleness. No `waitForTimeout()` sleeps; Playwright actions/assertions auto-wait.
- Demo login credentials are public test values, never real passwords. No external APIs or private systems are used.
- The checkout test validates the actual list of item prices rather than a hardcoded catalog total, compares the displayed tax and total, confirms success and verifies cart cleanup.
- Tests are authored against expected public demo UI. Product changes may require updating selectors or expectations after a real run.

## Submission checklist
1. Run the commands and fix any failures; attach evidence of execution only after actual execution.
2. Review `docs/MANUAL_TEST_CASES.md` and update assumptions after product clarification.
3. Replace the hypothetical Section C2 story with an authentic experience or explicitly label it as a scenario.
4. Create a Git repository, commit the files, and provide the repository URL if requested. Do not commit `node_modules`, test reports, screenshots or secrets.
5. Upload the assessment document and/or ZIP as requested by the portal. A repository URL is not included because no repository was created here.
