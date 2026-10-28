# Section A1 — Manual test suite

**Application:** https://www.saucedemo.com/  
**Test data:** public demo users (`standard_user`, `locked_out_user`, `problem_user`) and password `secret_sauce`.  
**Status:** Designed, **not executed**. Expected outcomes are specifications to verify, not observed results.  
**Priority:** P1 critical, P2 high, P3 medium. **Automate:** Yes/No (reason).

## Five product questions and assumptions
1. **Can a user checkout with an empty cart?** Assume no; verify expected validation with product owner.
2. **How is tax calculated and rounded?** Assume displayed total = subtotal + displayed tax, rounded to two decimals; ask for official tax rules.
3. **What should happen after finishing an order?** Assume order confirmation appears and cart is emptied.
4. **What should happen if a user directly opens a protected URL while logged out?** Assume redirected to login with no protected data.
5. **Should sorting persist when returning from cart or refreshing?** Assume no persistence requirement; document observed behavior and confirm.

## Test cases

| ID | Area | Type | Title | Preconditions | Steps | Test data | Expected result | Priority | Automate? |
|---|---|---|---|---|---|---|---|---|---|
| TC01 | Login | Positive | Standard login | Login page | Enter credentials; click Login | standard_user / secret_sauce | Inventory shown | P1 | Yes: smoke |
| TC02 | Login | Negative | Wrong password | Login page | Enter username, invalid password; Login | standard_user / wrongpass | Error; no access | P1 | Yes: security regression |
| TC03 | Login | Negative | Locked user | Login page | Enter locked credentials; Login | locked_out_user / secret_sauce | Locked-out error; no access | P1 | Yes: role behavior |
| TC04 | Login | Boundary | Blank credentials | Login page | Leave both blank; Login | empty | Required field error | P2 | Yes: validation |
| TC05 | Login | Negative | Blank password | Login page | Fill username only; Login | standard_user / blank | Password required; no access | P2 | Yes: validation |
| TC06 | Sort | Positive | Price ascending | Logged in | Choose Price low to high; inspect every price | lohi | Full list is nondecreasing | P1 | Yes: core requirement |
| TC07 | Sort | Positive | Price descending | Logged in | Choose Price high to low; inspect every price | hilo | Full list is nonincreasing | P2 | Yes: regression |
| TC08 | Sort | Positive | Name A–Z | Logged in | Choose Name A to Z; inspect all names | az | Full list alphabetical | P2 | Yes: regression |
| TC09 | Sort | Positive | Name Z–A | Logged in | Choose Name Z to A; inspect all names | za | Full list reverse alphabetical | P2 | Yes: regression |
| TC10 | Cart | Positive | Add two, remove one in cart | Logged in, empty cart | Add Backpack, Bike Light; open cart; remove Bike Light | two products | Badge 2 then 1; Backpack retained | P1 | Yes: cart correctness |
| TC11 | Cart | Positive | Remove last item on inventory | Logged in, empty cart | Add Backpack; remove on inventory; open cart | Backpack | Badge disappears; cart empty | P1 | Yes: cart correctness |
| TC12 | Cart | Positive | Cart persists on navigation | Logged in | Add Backpack; open cart; Continue Shopping; reopen | Backpack | Item remains once | P2 | Yes: navigation |
| TC13 | Cart | Negative | No duplicate from rapid clicks | Logged in | Add item; attempt repeated clicks | Backpack | One cart line, badge 1 | P2 | No: manual exploratory timing first |
| TC14 | Checkout | Positive | Full order with accurate totals | Logged in, empty cart | Add two items; checkout; enter fields; continue; compare totals; finish | Test / Customer / 600001 | Subtotal matches items; total=subtotal+tax; confirmation; cart empty | P1 | Yes: end-to-end |
| TC15 | Checkout | Negative | Missing first name | One cart item | Checkout; leave first name blank; Continue | blank / Customer / 600001 | Required first-name error | P1 | Yes: validation |
| TC16 | Checkout | Positive | Cancel information step | One cart item | Checkout; Cancel | n/a | Returns to cart, item preserved | P2 | Yes: cancellation |
| TC17 | Checkout | Negative | Missing postal code | One cart item | Checkout; fill names, leave postal empty; Continue | Test / Customer / blank | Postal code required error | P1 | Yes: validation |
| TC18 | Session | Security | Logout and protected URL | Logged in | Logout; directly visit /inventory.html | n/a | Login required; inventory not accessible | P1 | Yes: access control |
| TC19 | Session | Security | Protected URL in fresh session | New context | Directly navigate to /cart.html | n/a | Login required | P1 | Yes: access control |
| TC20 | Checkout | Negative | Empty cart checkout | Logged in, empty cart | Open cart; try Checkout | n/a | **Clarify expected behavior**: order should not be placed without items | P2 | No: specification pending |
| TC21 | Checkout | Boundary | Long postal code | One cart item | Enter very long postal value; Continue | 100+ chars | **Clarify max length/validation**; no crash or truncation without notice | P3 | No: exploratory boundary |
| TC22 | UI | Exploratory | Problem user product images | Logged in as problem_user | Compare images/names and details | problem_user | Correct mapping or documented defect | P2 | No: visual inspection |
| TC23 | UI | Accessibility | Keyboard-only checkout | Logged in | Tab through inputs, controls and submit | keyboard only | Visible focus and operable flow | P2 | No: accessibility review |
| TC24 | UI | Responsive | Small viewport checkout | Logged in | Use 375×812 viewport; complete cart/checkout | mobile viewport | No clipped required actions or unusable fields | P2 | No: responsive exploratory |
| TC25 | Reliability | Negative | Refresh checkout information | Cart has item; checkout page | Fill fields; refresh; inspect state | Test / Customer / 600001 | No accidental order or cart loss; field persistence **to confirm** | P3 | No: requirements discovery |

## Exploratory charter (15 minutes)
Use `problem_user` to explore product image/name mismatch, sorting, item removal, and navigation. Record build, browser, steps, screenshots, and whether behavior reproduces under `standard_user`. Keep expected behavior distinct from observations.
