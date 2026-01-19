# Test Cases for Shopify Subscription App

This document outlines the test cases required to ensure a robust, reliable, and App Store-compliant subscription application.

## Table of Contents

1. [Selling Plans](#1-selling-plans)
2. [Subscription Contracts](#2-subscription-contracts)
3. [Billing & Payment](#3-billing--payment)
4. [Customer Portal](#4-customer-portal)
5. [Admin Extension](#5-admin-extension)
6. [Theme Extension (Storefront)](#6-theme-extension-storefront)
7. [Checkout Extension](#7-checkout-extension)
8. [Webhooks](#8-webhooks)
9. [Data Synchronization](#9-data-synchronization)
10. [Multi-Currency & Internationalization](#10-multi-currency--internationalization)
11. [Security & Authentication](#11-security--authentication)
12. [Edge Cases & Error Handling](#12-edge-cases--error-handling)
13. [Performance & Load Testing](#13-performance--load-testing)
14. [App Store Compliance](#14-app-store-compliance)

---

## 1. Selling Plans

### 1.1 Selling Plan Group Creation

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| SP-001 | Create a selling plan group with valid name and merchant code | Group created successfully with unique ID | High |
| SP-002 | Create selling plan group with duplicate merchant code | Error returned, creation blocked | High |
| SP-003 | Create selling plan group with empty name | Validation error returned | Medium |
| SP-004 | Create selling plan group with special characters in name | Group created or appropriate sanitization applied | Low |
| SP-005 | Create selling plan group with maximum allowed name length | Group created successfully | Medium |

### 1.2 Selling Plan Creation

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| SP-006 | Create selling plan with WEEK interval (every 1 week) | Plan created with correct billing/delivery policy | High |
| SP-007 | Create selling plan with MONTH interval (every 2 months) | Plan created with correct billing/delivery policy | High |
| SP-008 | Create selling plan with DAY interval (every 7 days) | Plan created with correct billing/delivery policy | Medium |
| SP-009 | Create selling plan with YEAR interval | Plan created with correct billing/delivery policy | Medium |
| SP-010 | Create selling plan with percentage discount (10% off) | Plan created with correct pricing policy | High |
| SP-011 | Create selling plan with fixed amount discount ($5 off) | Plan created with correct pricing policy | High |
| SP-012 | Create selling plan with fixed price ($19.99) | Plan created with correct pricing policy | Medium |
| SP-013 | Create selling plan with tiered discounts (5% first 3 months, 10% after) | Plan created with multiple pricing policies | Medium |
| SP-014 | Create prepaid selling plan (pay for 3 months upfront) | Plan created with prepaid billing policy | Medium |
| SP-015 | Create selling plan with billing anchors (charge on 1st of month) | Plan created with correct anchor configuration | Medium |

### 1.3 Selling Plan Updates

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| SP-016 | Update selling plan name | Name updated, existing contracts unaffected | High |
| SP-017 | Update selling plan pricing policy | Pricing updated for new subscriptions only | High |
| SP-018 | Update selling plan interval | Interval updated for new subscriptions only | High |
| SP-019 | Delete selling plan with no active contracts | Plan deleted successfully | Medium |
| SP-020 | Attempt to delete selling plan with active contracts | Appropriate error or warning shown | High |

### 1.4 Product Association

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| SP-021 | Associate single product with selling plan group | Product associated successfully | High |
| SP-022 | Associate multiple products with selling plan group | All products associated successfully | High |
| SP-023 | Associate specific variant with selling plan group | Variant associated successfully | Medium |
| SP-024 | Remove product from selling plan group | Product removed, existing contracts unaffected | High |
| SP-025 | Associate product already in another selling plan group | Product associated to both groups | Medium |

---

## 2. Subscription Contracts

### 2.1 Contract Creation (via Checkout)

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| SC-001 | Customer completes checkout with subscription product | Contract created with ACTIVE status | High |
| SC-002 | Customer completes checkout with multiple subscription items | Single contract with multiple lines created | High |
| SC-003 | Customer completes checkout mixing subscription and one-time items | Contract created for subscription items only | High |
| SC-004 | Customer completes checkout with prepaid subscription | Contract created with correct prepaid configuration | Medium |
| SC-005 | Contract created with correct nextBillingDate based on selling plan | Next billing date matches expected schedule | High |

### 2.2 Contract Status Transitions

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| SC-006 | Active contract transitions to PAUSED | Status updated, billing suspended | High |
| SC-007 | Paused contract transitions back to ACTIVE | Status updated, billing resumes | High |
| SC-008 | Active contract transitions to CANCELLED | Status updated, no future billing | High |
| SC-009 | Contract expires at end date | Status changes to EXPIRED | Medium |
| SC-010 | Contract with repeated payment failures | Status changes to FAILED | High |
| SC-011 | Attempt invalid status transition (CANCELLED to ACTIVE) | Appropriate error returned | Medium |

### 2.3 Contract Modifications (Draft Workflow)

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| SC-012 | Create draft from active contract | Draft created successfully | High |
| SC-013 | Update draft with new delivery frequency | Draft updated successfully | High |
| SC-014 | Update draft with new shipping address | Draft updated successfully | Medium |
| SC-015 | Update draft by adding line item | Draft updated successfully | Medium |
| SC-016 | Update draft by removing line item | Draft updated successfully | Medium |
| SC-017 | Update draft by changing quantity | Draft updated successfully | High |
| SC-018 | Commit draft changes | Contract updated, draft removed | High |
| SC-019 | Discard draft without committing | Original contract unchanged | Medium |
| SC-020 | Attempt to create second draft on same contract | Error or queued appropriately | Medium |

### 2.4 Contract Queries

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| SC-021 | Fetch all contracts for a shop | All contracts returned with pagination | High |
| SC-022 | Fetch contracts filtered by status | Only matching contracts returned | High |
| SC-023 | Fetch contracts for specific customer | Only customer's contracts returned | High |
| SC-024 | Fetch single contract by ID | Contract details returned | High |
| SC-025 | Fetch contract with all line items | Line items included in response | High |

---

## 3. Billing & Payment

### 3.1 Billing Cycles

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| BP-001 | Fetch billing cycles for a contract | All cycles returned with correct dates | High |
| BP-002 | Billing cycle created automatically on schedule | Next cycle generated after current completes | High |
| BP-003 | Skip a billing cycle | Cycle marked as skipped, no charge attempted | High |
| BP-004 | Unskip a previously skipped cycle | Cycle unmarked, charge will be attempted | Medium |
| BP-005 | Skip already-billed cycle | Appropriate error returned | Medium |
| BP-006 | Change billing date for a cycle | Date updated successfully | Medium |

### 3.2 Billing Attempts

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| BP-007 | Create billing attempt with valid payment method | Attempt initiated, order created on success | High |
| BP-008 | Billing attempt with sufficient funds | Payment succeeds, order created | High |
| BP-009 | Billing attempt with insufficient funds (test card 4000000000000002) | Payment fails, failure webhook triggered | High |
| BP-010 | Billing attempt with expired card | Payment fails with EXPIRED_CARD error | High |
| BP-011 | Billing attempt with card declined | Payment fails with CARD_DECLINED error | High |
| BP-012 | Bulk billing for multiple contracts on same date | All contracts processed | High |
| BP-013 | Billing attempt during maintenance window | Appropriate retry or queuing | Medium |

### 3.3 Dunning (Payment Recovery)

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| BP-014 | First payment failure triggers retry scheduling | Retry scheduled with appropriate delay | High |
| BP-015 | Retry billing attempt after delay | Second attempt initiated | High |
| BP-016 | Exponential backoff between retries | Each retry has increasing delay | High |
| BP-017 | Customer notified of payment failure | Email sent with payment update link | High |
| BP-018 | Max retries reached | Contract status updated, final notice sent | High |
| BP-019 | Retryable error (INSUFFICIENT_FUNDS) handled differently than non-retryable | Retry for retryable, update payment for non-retryable | High |
| BP-020 | Retry count does not exceed 30 in 35 days | Billing throttled appropriately | High |

### 3.4 Payment Methods

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| BP-021 | Fetch customer payment methods | All stored methods returned (masked) | High |
| BP-022 | Send payment method update email | Email sent with secure update link | High |
| BP-023 | Customer updates payment method via link | New method stored, used for future charges | High |
| BP-024 | Payment method expires | Notification sent, update requested | Medium |
| BP-025 | Multiple payment methods on account | Correct default used for subscription | Medium |

---

## 4. Customer Portal

### 4.1 Portal Access

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| CP-001 | Access portal from order status page | Portal loads with subscription details | High |
| CP-002 | Access portal from post-purchase email link | Portal loads with subscription details | High |
| CP-003 | Access portal from customer account page | Portal loads with subscription details | High |
| CP-004 | Single sign-on with Shopify customer account | No separate login required | High |
| CP-005 | Unauthenticated user attempts to access portal | Redirected to Shopify login | High |

### 4.2 View Subscriptions

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| CP-006 | View list of all active subscriptions | All subscriptions displayed with key info | High |
| CP-007 | View paused subscriptions | Paused subscriptions shown with status | High |
| CP-008 | View cancelled subscriptions history | Historical data accessible | Medium |
| CP-009 | Customer with no subscriptions | Appropriate empty state message | Medium |
| CP-010 | Subscription list shows product name, frequency, price, next delivery | All required info visible | High |

### 4.3 Subscription Details

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| CP-011 | View full subscription details | Products, schedule, price, payment info shown | High |
| CP-012 | View upcoming billing schedule | Next 3+ billing dates displayed | Medium |
| CP-013 | View order history for subscription | Past orders linked and accessible | Medium |
| CP-014 | View payment method (masked) | Last 4 digits and card type shown | High |

### 4.4 Skip Delivery

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| CP-015 | Skip next upcoming delivery | Billing cycle skipped, confirmation shown | High |
| CP-016 | Skip delivery multiple months ahead | Future cycle skipped | Medium |
| CP-017 | Unskip a previously skipped delivery | Skip reversed, billing will occur | Medium |
| CP-018 | Attempt to skip delivery too close to billing date | Appropriate error or warning | Medium |

### 4.5 Update Payment Method

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| CP-019 | Request payment method update email | Email sent with secure link | High |
| CP-020 | Update payment method from portal (if direct update supported) | Method updated successfully | Medium |
| CP-021 | Payment update link expires after time limit | Link invalid, user must request new one | Medium |

### 4.6 Cancel Subscription

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| CP-022 | Cancel subscription from portal | Confirmation prompt shown | High |
| CP-023 | Confirm cancellation | Subscription cancelled, confirmation displayed | High |
| CP-024 | Cancel with reason selection | Reason captured for analytics | Medium |
| CP-025 | Cancellation flow offers alternatives (pause, skip) | Options presented before final cancel | Medium |
| CP-026 | Cancel prepaid subscription with remaining value | Refund policy clearly communicated | Medium |

### 4.7 Modify Subscription (Optional Features)

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| CP-027 | Change delivery frequency | Frequency updated, next billing date adjusted | Medium |
| CP-028 | Change product quantity | Quantity updated, price recalculated | Medium |
| CP-029 | Swap product for different variant | Variant changed in subscription | Medium |
| CP-030 | Update shipping address | Address updated for future deliveries | Medium |
| CP-031 | Pause subscription | Subscription paused, resume date optional | Medium |
| CP-032 | Resume paused subscription | Subscription reactivated | Medium |

---

## 5. Admin Extension

### 5.1 Purchase Options Extension

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| AE-001 | Extension loads on product details page | Extension renders without errors | High |
| AE-002 | Create new selling plan from product page | Plan created and associated with product | High |
| AE-003 | Add existing selling plan to product | Product added to selling plan group | High |
| AE-004 | Edit selling plan from product page | Edit interface loads with current values | High |
| AE-005 | Remove selling plan from product | Product removed from group | High |
| AE-006 | Extension shows current plans associated with product | Correct plans displayed | High |

### 5.2 Admin Navigation

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| AE-007 | Direct link from app to Shopify orders | Navigates to correct order in admin | High |
| AE-008 | Direct link from app to customer profile | Navigates to correct customer in admin | High |
| AE-009 | Subscription contract links to origin order | Order accessible from contract view | Medium |

### 5.3 Merchant Dashboard

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| AE-010 | View all subscription contracts | Contracts list with filtering/sorting | High |
| AE-011 | Search contracts by customer email | Correct results returned | Medium |
| AE-012 | Filter contracts by status | Only matching contracts shown | Medium |
| AE-013 | View subscription analytics/metrics | MRR, active subscribers, churn displayed | Medium |
| AE-014 | Bulk actions on contracts (pause, cancel) | Actions applied to selected contracts | Low |

---

## 6. Theme Extension (Storefront)

### 6.1 App Block Display

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| TE-001 | App block renders on product page | Subscription options displayed | High |
| TE-002 | App block shows selling plan name | Plan name clearly visible | High |
| TE-003 | App block shows subscription price | Correct price displayed | High |
| TE-004 | App block shows savings amount/percentage | Discount clearly communicated | High |
| TE-005 | App block works with Online Store 2.0 themes | Compatible with modern themes | High |
| TE-006 | App block works with vintage themes | Degraded gracefully or compatible | Medium |

### 6.2 Subscription Selection

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| TE-007 | Customer selects subscription option | Form input updated with selling plan ID | High |
| TE-008 | Customer switches between subscription frequencies | Correct plan selected | High |
| TE-009 | Customer switches from subscription to one-time | One-time purchase selected | High |
| TE-010 | Multiple selling plan groups on one product | All groups displayed correctly | Medium |
| TE-011 | Price updates when subscription selected | Displayed price reflects discount | High |

### 6.3 Cart Integration

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| TE-012 | Add subscription product to cart | Product added with selling plan | High |
| TE-013 | Cart displays selling plan name | Plan name visible in cart | High |
| TE-014 | Cart displays subscription price | Correct price shown | High |
| TE-015 | Cart displays frequency/interval | Delivery schedule shown | High |
| TE-016 | Update quantity in cart | Quantity updated, price recalculated | Medium |
| TE-017 | Remove subscription item from cart | Item removed successfully | Medium |

### 6.4 Theme Compatibility

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| TE-018 | Test with Dawn theme (default) | Full functionality | High |
| TE-019 | Test with 3 additional popular themes | Functional on each | High |
| TE-020 | Test on mobile viewport | Responsive and usable | High |
| TE-021 | Test on tablet viewport | Responsive and usable | Medium |
| TE-022 | Test with theme customizations | App block adapts appropriately | Medium |

---

## 7. Checkout Extension

### 7.1 Thank You Page Extension

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| CE-001 | Extension renders on thank you page for subscription orders | Subscription confirmation displayed | High |
| CE-002 | Extension does not render for non-subscription orders | No extension content shown | High |
| CE-003 | Extension shows subscription summary | Products, frequency, next delivery shown | High |
| CE-004 | Extension provides link to customer portal | Link to manage subscription present | High |
| CE-005 | Extension handles multiple subscriptions in one order | All subscriptions summarized | Medium |

### 7.2 Order Status Page

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| CE-006 | Subscription info shown on order status page | Subscription details visible | Medium |
| CE-007 | Link to manage subscription from order status | Portal accessible | Medium |

---

## 8. Webhooks

### 8.1 Contract Webhooks

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| WH-001 | Receive subscription_contracts/create webhook | Payload processed, local DB updated | High |
| WH-002 | Receive subscription_contracts/update webhook | Local DB synced with changes | High |
| WH-003 | Webhook signature verification succeeds for valid request | Webhook processed | High |
| WH-004 | Webhook signature verification fails for tampered request | Webhook rejected with 401 | High |
| WH-005 | Idempotent handling of duplicate webhooks | Second delivery ignored | High |

### 8.2 Billing Webhooks

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| WH-006 | Receive subscription_billing_attempts/success webhook | Order tracked, contract updated | High |
| WH-007 | Receive subscription_billing_attempts/failure webhook | Dunning flow triggered | High |
| WH-008 | Receive subscription_billing_attempts/challenged webhook | Verification flow initiated | Medium |
| WH-009 | Receive subscription_billing_cycle_edits/create webhook | Edit tracked in local DB | Medium |
| WH-010 | Receive subscription_billing_cycle_edits/update webhook | Edit updated in local DB | Medium |
| WH-011 | Receive subscription_billing_cycle_edits/delete webhook | Edit removed from local DB | Medium |

### 8.3 Webhook Reliability

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| WH-012 | Webhook endpoint returns 200 within timeout | Delivery marked successful | High |
| WH-013 | Webhook endpoint times out | Shopify retries delivery | High |
| WH-014 | Webhook endpoint returns 500 | Shopify retries delivery | High |
| WH-015 | Webhook processing handles malformed payload gracefully | Error logged, 400 returned | Medium |
| WH-016 | High volume of concurrent webhooks | All processed without loss | High |

---

## 9. Data Synchronization

### 9.1 Initial Sync

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| DS-001 | New shop installs app - sync existing contracts | All contracts imported to local DB | High |
| DS-002 | Initial sync handles pagination (>50 contracts) | All pages processed | High |
| DS-003 | Initial sync handles rate limits | Backoff and retry implemented | High |
| DS-004 | Initial sync with no existing contracts | Empty state handled gracefully | Medium |

### 9.2 Ongoing Sync

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| DS-005 | Contract created via checkout syncs to local DB | Record created via webhook | High |
| DS-006 | Contract updated syncs to local DB | Record updated via webhook | High |
| DS-007 | Local DB and Shopify state match after operations | Data consistency verified | High |
| DS-008 | Sync recovery after missed webhook | Manual sync fills gaps | Medium |

### 9.3 Metaobjects Sync

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| DS-009 | App settings stored in metaobjects | Settings persist with shop | Medium |
| DS-010 | Metaobject settings retrieved correctly | Configuration loaded on app start | Medium |
| DS-011 | Settings updated via admin | Metaobject updated | Medium |

---

## 10. Multi-Currency & Internationalization

### 10.1 Multi-Currency

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| MC-001 | Selling plan displays in store's primary currency | Correct currency shown | High |
| MC-002 | Selling plan displays in customer's local currency | Converted price shown | High |
| MC-003 | Discount calculated correctly in different currencies | Percentage applies to local price | High |
| MC-004 | Fixed amount discount respects currency | Amount converted appropriately | Medium |
| MC-005 | Customer portal displays prices in correct currency | Matches customer's preferences | High |

### 10.2 Internationalization

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| MC-006 | App supports multiple languages | UI translated correctly | Medium |
| MC-007 | Date formats respect locale | Dates formatted per region | Medium |
| MC-008 | Currency symbols displayed correctly | $ vs € vs £ etc. | Medium |
| MC-009 | Selling plan names not hard-coded with prices | Dynamic pricing displayed | High |

---

## 11. Security & Authentication

### 11.1 OAuth & Sessions

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| SA-001 | OAuth flow completes successfully | Access token obtained | High |
| SA-002 | Session persists across requests | User remains authenticated | High |
| SA-003 | Session expires after timeout | Re-authentication required | Medium |
| SA-004 | Invalid session handled gracefully | Redirect to auth flow | High |
| SA-005 | Offline access token refreshed | New token obtained before expiry | High |

### 11.2 API Security

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| SA-006 | GraphQL requests authenticated | API calls succeed | High |
| SA-007 | Requests without valid token rejected | 401 Unauthorized returned | High |
| SA-008 | Shop isolation enforced | Cannot access other shop's data | High |
| SA-009 | Rate limiting respected | Backoff on 429 responses | High |

### 11.3 Data Protection

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| SA-010 | Sensitive data encrypted at rest | Database encryption enabled | High |
| SA-011 | Payment method data not stored in app DB | Only references stored | High |
| SA-012 | Customer PII handled per privacy requirements | GDPR/CCPA compliance | High |
| SA-013 | API secrets not exposed in client-side code | Secrets server-side only | High |

---

## 12. Edge Cases & Error Handling

### 12.1 Edge Cases

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| EC-001 | Product deleted while in selling plan group | Graceful handling, contract unaffected | High |
| EC-002 | Variant deleted from subscribed product | Appropriate notification/handling | High |
| EC-003 | Product price changed after subscription created | Existing contract maintains original terms | High |
| EC-004 | Shop changes timezone | Billing dates handled correctly | Medium |
| EC-005 | Customer account deleted | Subscriptions handled per policy | Medium |
| EC-006 | Zero-quantity line item attempted | Validation error | Medium |
| EC-007 | Very long subscription (5+ years) | System handles distant dates | Low |
| EC-008 | Subscription with >100 line items | Performance acceptable | Low |

### 12.2 Error Recovery

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| EC-009 | GraphQL API unavailable | Retry with backoff, user notified | High |
| EC-010 | Database connection lost | Graceful degradation, reconnection | High |
| EC-011 | Webhook processing fails | Logged, can be reprocessed | High |
| EC-012 | Draft commit fails | Draft preserved, error shown | High |
| EC-013 | Billing job fails mid-execution | Can be resumed/retried | High |

### 12.3 Input Validation

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| EC-014 | XSS attempt in selling plan name | Input sanitized | High |
| EC-015 | SQL injection attempt in search | Query parameterized, attack fails | High |
| EC-016 | Invalid date format in API request | Validation error returned | Medium |
| EC-017 | Negative quantity submitted | Validation error returned | Medium |
| EC-018 | Invalid GraphQL ID format | Appropriate error | Medium |

---

## 13. Performance & Load Testing

### 13.1 Response Times

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| PL-001 | Admin dashboard loads in <2 seconds | Acceptable performance | High |
| PL-002 | Customer portal loads in <2 seconds | Acceptable performance | High |
| PL-003 | Product page with subscription widget loads in <1 second | No significant impact | High |
| PL-004 | Contract list with 1000+ items loads with pagination | Responsive pagination | Medium |
| PL-005 | Bulk billing job processes 1000 contracts | Completes within reasonable time | Medium |

### 13.2 Concurrent Users

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| PL-006 | 100 concurrent admin users | System remains responsive | Medium |
| PL-007 | 1000 concurrent portal users | System remains responsive | Medium |
| PL-008 | Concurrent contract modifications | Data integrity maintained | High |

### 13.3 Database Performance

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| PL-009 | Query performance with 100k contracts | Queries complete in <1 second | Medium |
| PL-010 | Index effectiveness verified | Explain plans show index usage | Medium |
| PL-011 | Connection pooling under load | Connections managed efficiently | Medium |

---

## 14. App Store Compliance

### 14.1 Required Features Checklist

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| AS-001 | Selling plan name visible on product page | Name clearly displayed | High |
| AS-002 | Selling plan name visible in cart | Name visible with product | High |
| AS-003 | Price and savings displayed correctly | Accurate pricing shown | High |
| AS-004 | Purchase options extension implemented | Merchants can manage plans | High |
| AS-005 | Customer portal accessible | Portal loads and functions | High |
| AS-006 | Portal shows all subscriptions | Complete list displayed | High |
| AS-007 | Cancel functionality works | Customer can cancel | High |
| AS-008 | Payment update functionality works | Customer can update payment | High |
| AS-009 | Multi-currency displays correctly | Prices in correct currency | High |
| AS-010 | Online Store 2.0 app blocks work | Compatible with modern themes | High |
| AS-011 | Links to Admin orders exist | Navigation functions | High |
| AS-012 | Links to Admin customers exist | Navigation functions | High |

### 14.2 Prohibited Actions Check

| ID | Test Case | Expected Result | Priority |
|----|-----------|-----------------|----------|
| AS-013 | App does not use APIs for installments | Not implemented | High |
| AS-014 | App does not use APIs for layaways | Not implemented | High |
| AS-015 | App does not use APIs for crowdfunding | Not implemented | High |
| AS-016 | Prices not hard-coded in plan names | Dynamic pricing used | High |
| AS-017 | Subscription terms clearly communicated | No ambiguity | High |

---

## Test Data Requirements

### Test Cards
| Card Number | Behavior |
|-------------|----------|
| 4242424242424242 | Always succeeds |
| 4000000000000002 | Always declines |
| 4000000000009995 | Insufficient funds |
| 4000000000000069 | Expired card |

### Test Scenarios Setup
1. **Basic Shop**: Single product with monthly subscription
2. **Multi-Product Shop**: 10+ products with various selling plans
3. **High-Volume Shop**: 1000+ active contracts
4. **Multi-Currency Shop**: Multiple currencies enabled
5. **International Shop**: Multiple languages/locales

---

## Test Execution Priority

### Phase 1: Core Functionality (Must Pass)
- Selling Plans: SP-001 to SP-010, SP-016, SP-021
- Contracts: SC-001 to SC-009, SC-012, SC-018, SC-021
- Billing: BP-001 to BP-011, BP-014, BP-021
- Portal: CP-001 to CP-011, CP-015, CP-019, CP-022, CP-023
- Webhooks: WH-001 to WH-007

### Phase 2: Extensions & Integration
- Admin Extension: AE-001 to AE-009
- Theme Extension: TE-001 to TE-017
- Checkout Extension: CE-001 to CE-005

### Phase 3: Compliance & Quality
- App Store: AS-001 to AS-017
- Multi-Currency: MC-001 to MC-009
- Security: SA-001 to SA-013

### Phase 4: Edge Cases & Performance
- Edge Cases: EC-001 to EC-018
- Performance: PL-001 to PL-011

---

## Automation Recommendations

### Unit Tests
- GraphQL query builders
- Pricing calculations
- Date/billing cycle logic
- Validation functions

### Integration Tests
- Webhook handlers
- Database operations
- API client interactions

### E2E Tests
- Complete checkout flow
- Portal user journeys
- Admin management flows

### Tools
- **Unit/Integration**: Jest, Vitest
- **E2E**: Playwright, Cypress
- **API Testing**: Postman, Insomnia
- **Load Testing**: k6, Artillery
