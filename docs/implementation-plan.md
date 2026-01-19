# Comprehensive Shopify Subscription App Implementation Plan

## Executive Summary

This implementation plan outlines the complete development of a production-ready Shopify subscription app, built using Remix + React, Prisma + SQLite (upgradeable to PostgreSQL), and Shopify's latest APIs and extensions. The plan covers all phases from initial setup through App Store submission, with a focus on meeting all requirements while incorporating differentiation features based on competitor analysis.

---

## Phase 1: Project Setup

### 1.1 Environment Setup

**Prerequisites:**
- Node.js v18.20+ (v20.10+ recommended)
- npm or yarn
- Shopify Partner Account
- Development store for testing

**Directory Structure to Create:**

```
subscription-app/
├── app/
│   ├── routes/
│   │   ├── app._index.tsx                    # Dashboard
│   │   ├── app.contracts._index.tsx          # Contract list
│   │   ├── app.contracts.$id.tsx             # Contract details
│   │   ├── app.selling-plans._index.tsx      # Selling plan list
│   │   ├── app.selling-plans.create.tsx      # Create selling plan
│   │   ├── app.selling-plans.$id.tsx         # Edit selling plan
│   │   ├── app.settings.tsx                  # App settings
│   │   ├── app.analytics.tsx                 # Analytics dashboard
│   │   ├── webhooks.tsx                      # Webhook handler router
│   │   ├── webhooks.subscription-contract-create.tsx
│   │   ├── webhooks.subscription-contract-update.tsx
│   │   ├── webhooks.billing-attempt-success.tsx
│   │   ├── webhooks.billing-attempt-failure.tsx
│   │   └── portal.$customerId.tsx            # Customer portal
│   ├── components/
│   │   ├── SellingPlanForm.tsx
│   │   ├── ContractCard.tsx
│   │   ├── ContractList.tsx
│   │   ├── AnalyticsCharts.tsx
│   │   ├── DunningSettings.tsx
│   │   └── CustomerPortal/
│   │       ├── SubscriptionList.tsx
│   │       ├── SubscriptionDetails.tsx
│   │       ├── SkipDeliveryModal.tsx
│   │       ├── CancelModal.tsx
│   │       └── PaymentUpdateButton.tsx
│   ├── graphql/
│   │   ├── mutations/
│   │   │   ├── sellingPlanGroupCreate.ts
│   │   │   ├── sellingPlanGroupUpdate.ts
│   │   │   ├── sellingPlanGroupAddProducts.ts
│   │   │   ├── sellingPlanGroupRemoveProducts.ts
│   │   │   ├── subscriptionContractUpdate.ts
│   │   │   ├── subscriptionDraftUpdate.ts
│   │   │   ├── subscriptionDraftCommit.ts
│   │   │   ├── subscriptionBillingCycleSkip.ts
│   │   │   ├── subscriptionBillingAttemptCreate.ts
│   │   │   ├── subscriptionBillingCycleBulkCharge.ts
│   │   │   ├── customerPaymentMethodSendUpdateEmail.ts
│   │   │   └── webhookSubscriptionCreate.ts
│   │   └── queries/
│   │       ├── getSubscriptionContracts.ts
│   │       ├── getSubscriptionContract.ts
│   │       ├── getSellingPlanGroups.ts
│   │       ├── getSellingPlanGroup.ts
│   │       ├── getBillingCycles.ts
│   │       ├── getCustomerPaymentMethods.ts
│   │       ├── getProducts.ts
│   │       └── getCustomerSubscriptions.ts
│   ├── services/
│   │   ├── billing.server.ts                 # Billing logic
│   │   ├── dunning.server.ts                 # Dunning/retry logic
│   │   ├── contracts.server.ts               # Contract management
│   │   ├── sellingPlans.server.ts            # Selling plan management
│   │   ├── sync.server.ts                    # Data sync utilities
│   │   ├── notifications.server.ts           # Email notifications
│   │   └── analytics.server.ts               # Analytics calculations
│   ├── jobs/
│   │   ├── billingScheduler.ts               # Cron-based billing
│   │   ├── syncContracts.ts                  # Contract sync job
│   │   └── cleanupWebhooks.ts                # Webhook log cleanup
│   ├── models/
│   │   ├── sellingPlan.server.ts
│   │   ├── contract.server.ts
│   │   ├── billingJob.server.ts
│   │   └── webhook.server.ts
│   ├── utils/
│   │   ├── shopify.server.ts                 # Shopify client config
│   │   ├── db.server.ts                      # Prisma client
│   │   ├── formatters.ts                     # Currency, date formatters
│   │   └── constants.ts                      # App constants
│   └── types/
│       ├── admin.generated.d.ts              # Generated GraphQL types
│       ├── contracts.ts
│       ├── sellingPlans.ts
│       └── billing.ts
├── extensions/
│   ├── purchase-options/                     # Admin Purchase Options Extension
│   │   ├── src/
│   │   │   ├── ActionExtension.tsx
│   │   │   ├── CreatePlan.tsx
│   │   │   ├── EditPlan.tsx
│   │   │   └── components/
│   │   ├── shopify.extension.toml
│   │   └── package.json
│   ├── theme-extension/                      # Theme App Extension
│   │   ├── assets/
│   │   │   ├── subscription-selector.js
│   │   │   └── subscription-selector.css
│   │   ├── blocks/
│   │   │   └── subscription-selector.liquid
│   │   └── shopify.extension.toml
│   ├── checkout-ui/                          # Checkout UI Extension
│   │   ├── src/
│   │   │   └── ThankYouPage.tsx
│   │   ├── shopify.extension.toml
│   │   └── package.json
│   └── customer-account/                     # Customer Account Extension
│       ├── src/
│       │   ├── SubscriptionsPage.tsx
│       │   ├── SubscriptionDetails.tsx
│       │   └── components/
│       ├── shopify.extension.toml
│       └── package.json
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── shopify.app.toml
├── .graphqlrc.ts
├── package.json
├── tsconfig.json
├── remix.config.js
└── README.md
```

### 1.2 App Initialization

**Command to run:**
```bash
# Option 1: Start from reference app (recommended for faster start)
shopify app init --template https://github.com/Shopify/subscriptions-reference-app

# Option 2: Start fresh with Remix template
shopify app init
```

**shopify.app.toml configuration:**
```toml
name = "SubscribeIt"
client_id = "YOUR_CLIENT_ID"
application_url = "https://your-app-url.com"
embedded = true

[access_scopes]
scopes = "write_products,read_all_orders"

[access_scopes.protected]
scopes = "read_customer_payment_methods,write_own_subscription_contracts,read_own_subscription_contracts"

[webhooks]
api_version = "2024-10"

[[webhooks.subscriptions]]
topics = ["subscription_contracts/create", "subscription_contracts/update"]
uri = "/webhooks/subscription-contract"

[[webhooks.subscriptions]]
topics = ["subscription_billing_attempts/success", "subscription_billing_attempts/failure", "subscription_billing_attempts/challenged"]
uri = "/webhooks/billing-attempt"

[[webhooks.subscriptions]]
topics = ["subscription_billing_cycle_edits/create", "subscription_billing_cycle_edits/update", "subscription_billing_cycle_edits/delete"]
uri = "/webhooks/billing-cycle"

[auth]
redirect_urls = ["https://your-app-url.com/auth/callback"]

[pos]
embedded = false
```

### 1.3 Protected Scopes Application

**Scopes to Request:**

| Scope | Purpose |
|-------|---------|
| `read_customer_payment_methods` | Access stored payment methods for automatic renewals |
| `write_own_subscription_contracts` | Create and modify subscription contracts |
| `read_own_subscription_contracts` | Read subscription contract data |

**Application Process:**
1. Navigate to Partner Dashboard > Apps > Your App > Configuration > API access
2. Request access to protected scopes
3. Provide justification: "Building a subscription management app that requires access to customer payment methods for automatic recurring billing and subscription contract management for creating and modifying subscription agreements."
4. Wait for approval (typically 1-5 business days)

### 1.4 Database Setup

**Prisma Schema (`prisma/schema.prisma`):**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"  // Change to "postgresql" for production
  url      = env("DATABASE_URL")
}

// Session management (required by Shopify App Remix)
model Session {
  id            String    @id
  shop          String
  state         String
  isOnline      Boolean   @default(false)
  scope         String?
  expires       DateTime?
  accessToken   String
  userId        BigInt?
  firstName     String?
  lastName      String?
  email         String?
  accountOwner  Boolean   @default(false)
  locale        String?
  collaborator  Boolean?  @default(false)
  emailVerified Boolean?  @default(false)

  @@index([shop])
}

// Shop tracking
model Shop {
  id                    String   @id @default(uuid())
  shopDomain            String   @unique
  accessToken           String
  installedAt           DateTime @default(now())
  uninstalledAt         DateTime?

  // Settings
  dunningMaxRetries     Int      @default(5)
  dunningRetryIntervalDays Int   @default(3)
  notificationEmail     String?

  subscriptionContracts SubscriptionContract[]
  billingJobs           BillingJob[]
  sellingPlanGroups     SellingPlanGroup[]

  @@index([shopDomain])
}

// Local cache of selling plan groups
model SellingPlanGroup {
  id                  String   @id @default(uuid())
  shopifyId           String   @unique
  shopId              String
  shop                Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)

  name                String
  merchantCode        String?
  productCount        Int      @default(0)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([shopId])
  @@index([shopifyId])
}

// Local cache of subscription contracts
model SubscriptionContract {
  id                  String   @id @default(uuid())
  shopifyContractId   String   @unique
  shopId              String
  shop                Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)

  customerId          String
  customerEmail       String?
  status              ContractStatus @default(ACTIVE)
  nextBillingDate     DateTime?

  // Line items (stored as JSON for flexibility)
  linesJson           String?  // JSON array of line items

  // Billing info
  currencyCode        String   @default("USD")
  totalPrice          Decimal?

  // Dunning tracking
  failedAttemptCount  Int      @default(0)
  lastBillingAttempt  DateTime?
  lastFailureReason   String?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  billingJobs         BillingJob[]

  @@index([shopId])
  @@index([shopifyContractId])
  @@index([customerId])
  @@index([status])
  @@index([nextBillingDate])
}

enum ContractStatus {
  ACTIVE
  PAUSED
  CANCELLED
  EXPIRED
  FAILED
}

// Billing job tracking
model BillingJob {
  id                  String   @id @default(uuid())
  shopId              String
  shop                Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  contractId          String?
  contract            SubscriptionContract? @relation(fields: [contractId], references: [id], onDelete: SetNull)

  scheduledFor        DateTime
  executedAt          DateTime?
  status              JobStatus @default(PENDING)
  jobType             JobType   @default(BILLING)

  // Result tracking
  shopifyJobId        String?
  result              String?   // JSON result
  errorMessage        String?
  retryCount          Int       @default(0)

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  @@index([shopId])
  @@index([contractId])
  @@index([status])
  @@index([scheduledFor])
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

enum JobType {
  BILLING
  RETRY
  SYNC
  NOTIFICATION
}

// Webhook idempotency tracking
model ProcessedWebhook {
  id          String   @id @default(uuid())
  webhookId   String   @unique
  topic       String
  shopDomain  String
  processedAt DateTime @default(now())

  @@index([webhookId])
  @@index([shopDomain])
  @@index([processedAt])
}

// Analytics events (optional - for custom analytics)
model AnalyticsEvent {
  id          String   @id @default(uuid())
  shopId      String
  eventType   String
  eventData   String?  // JSON
  occurredAt  DateTime @default(now())

  @@index([shopId])
  @@index([eventType])
  @@index([occurredAt])
}
```

**Database Initialization Commands:**
```bash
# Generate Prisma client
npx prisma generate

# Create initial migration
npx prisma migrate dev --name init

# View database (optional)
npx prisma studio
```

---

## Phase 2: Core Functionality

### 2.1 Selling Plans Implementation

#### GraphQL Mutations

**Create Selling Plan Group (`app/graphql/mutations/sellingPlanGroupCreate.ts`):**

```typescript
export const SELLING_PLAN_GROUP_CREATE = `#graphql
  mutation SellingPlanGroupCreate($input: SellingPlanGroupInput!) {
    sellingPlanGroupCreate(input: $input) {
      sellingPlanGroup {
        id
        name
        merchantCode
        options
        sellingPlans(first: 10) {
          edges {
            node {
              id
              name
              options
              billingPolicy {
                ... on SellingPlanRecurringBillingPolicy {
                  interval
                  intervalCount
                  anchors {
                    type
                    day
                    month
                  }
                }
              }
              deliveryPolicy {
                ... on SellingPlanRecurringDeliveryPolicy {
                  interval
                  intervalCount
                  anchors {
                    type
                    day
                    month
                  }
                }
              }
              pricingPolicies {
                ... on SellingPlanFixedPricingPolicy {
                  adjustmentType
                  adjustmentValue {
                    ... on SellingPlanPricingPolicyPercentageValue {
                      percentage
                    }
                    ... on MoneyV2 {
                      amount
                      currencyCode
                    }
                  }
                }
                ... on SellingPlanRecurringPricingPolicy {
                  adjustmentType
                  adjustmentValue {
                    ... on SellingPlanPricingPolicyPercentageValue {
                      percentage
                    }
                    ... on MoneyV2 {
                      amount
                      currencyCode
                    }
                  }
                  afterCycle
                }
              }
            }
          }
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export interface SellingPlanInput {
  name: string;
  options: string[];
  billingPolicy: {
    recurring: {
      interval: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
      intervalCount: number;
      anchors?: Array<{
        type: 'WEEKDAY' | 'MONTHDAY' | 'YEARDAY';
        day?: number;
        month?: number;
      }>;
    };
  };
  deliveryPolicy: {
    recurring: {
      interval: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';
      intervalCount: number;
      anchors?: Array<{
        type: 'WEEKDAY' | 'MONTHDAY' | 'YEARDAY';
        day?: number;
        month?: number;
      }>;
    };
  };
  pricingPolicies: Array<{
    recurring: {
      adjustmentType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'PRICE';
      adjustmentValue: {
        percentage?: number;
        fixedValue?: number;
      };
      afterCycle: number;
    };
  }>;
}

export interface SellingPlanGroupInput {
  name: string;
  merchantCode: string;
  options: string[];
  sellingPlansToCreate: SellingPlanInput[];
}
```

**Associate Products (`app/graphql/mutations/sellingPlanGroupAddProducts.ts`):**

```typescript
export const SELLING_PLAN_GROUP_ADD_PRODUCTS = `#graphql
  mutation SellingPlanGroupAddProducts($id: ID!, $productIds: [ID!]!) {
    sellingPlanGroupAddProducts(id: $id, productIds: $productIds) {
      sellingPlanGroup {
        id
        productCount
        products(first: 50) {
          edges {
            node {
              id
              title
              handle
            }
          }
        }
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const SELLING_PLAN_GROUP_REMOVE_PRODUCTS = `#graphql
  mutation SellingPlanGroupRemoveProducts($id: ID!, $productIds: [ID!]!) {
    sellingPlanGroupRemoveProducts(id: $id, productIds: $productIds) {
      removedProductIds
      userErrors {
        field
        message
        code
      }
    }
  }
`;
```

#### Service Layer

**Selling Plans Service (`app/services/sellingPlans.server.ts`):**

```typescript
import type { AdminApiClient } from "@shopify/shopify-app-remix/server";
import { SELLING_PLAN_GROUP_CREATE, type SellingPlanGroupInput } from "~/graphql/mutations/sellingPlanGroupCreate";
import { SELLING_PLAN_GROUP_ADD_PRODUCTS } from "~/graphql/mutations/sellingPlanGroupAddProducts";
import db from "~/utils/db.server";

export async function createSellingPlanGroup(
  admin: AdminApiClient,
  shopDomain: string,
  input: SellingPlanGroupInput
) {
  const response = await admin.graphql(SELLING_PLAN_GROUP_CREATE, {
    variables: { input },
  });

  const { data } = await response.json();

  if (data.sellingPlanGroupCreate.userErrors.length > 0) {
    throw new Error(
      data.sellingPlanGroupCreate.userErrors
        .map((e: any) => e.message)
        .join(", ")
    );
  }

  const group = data.sellingPlanGroupCreate.sellingPlanGroup;

  // Cache locally
  const shop = await db.shop.findUnique({ where: { shopDomain } });
  if (shop) {
    await db.sellingPlanGroup.create({
      data: {
        shopifyId: group.id,
        shopId: shop.id,
        name: group.name,
        merchantCode: input.merchantCode,
      },
    });
  }

  return group;
}

export async function addProductsToSellingPlanGroup(
  admin: AdminApiClient,
  groupId: string,
  productIds: string[]
) {
  const response = await admin.graphql(SELLING_PLAN_GROUP_ADD_PRODUCTS, {
    variables: { id: groupId, productIds },
  });

  const { data } = await response.json();

  if (data.sellingPlanGroupAddProducts.userErrors.length > 0) {
    throw new Error(
      data.sellingPlanGroupAddProducts.userErrors
        .map((e: any) => e.message)
        .join(", ")
    );
  }

  return data.sellingPlanGroupAddProducts.sellingPlanGroup;
}

// Common subscription presets
export const SUBSCRIPTION_PRESETS = {
  weekly: {
    interval: "WEEK" as const,
    intervalCount: 1,
    label: "Weekly",
  },
  biweekly: {
    interval: "WEEK" as const,
    intervalCount: 2,
    label: "Every 2 weeks",
  },
  monthly: {
    interval: "MONTH" as const,
    intervalCount: 1,
    label: "Monthly",
  },
  bimonthly: {
    interval: "MONTH" as const,
    intervalCount: 2,
    label: "Every 2 months",
  },
  quarterly: {
    interval: "MONTH" as const,
    intervalCount: 3,
    label: "Quarterly",
  },
};
```

### 2.2 Subscription Contracts Management

#### GraphQL Queries

**Get Subscription Contracts (`app/graphql/queries/getSubscriptionContracts.ts`):**

```typescript
export const GET_SUBSCRIPTION_CONTRACTS = `#graphql
  query GetSubscriptionContracts($first: Int!, $after: String, $query: String) {
    subscriptionContracts(first: $first, after: $after, query: $query) {
      edges {
        cursor
        node {
          id
          status
          nextBillingDate
          currencyCode
          customer {
            id
            email
            firstName
            lastName
          }
          customerPaymentMethod {
            id
            instrument {
              ... on CustomerCreditCard {
                brand
                lastDigits
                expiryMonth
                expiryYear
              }
              ... on CustomerPaypalBillingAgreement {
                paypalAccountEmail
              }
            }
          }
          deliveryPolicy {
            interval
            intervalCount
          }
          billingPolicy {
            interval
            intervalCount
          }
          lines(first: 10) {
            edges {
              node {
                id
                title
                variantTitle
                quantity
                currentPrice {
                  amount
                  currencyCode
                }
                productId
                variantId
                variantImage {
                  url
                  altText
                }
              }
            }
          }
          originOrder {
            id
            name
          }
          lastPaymentStatus
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

export const GET_SUBSCRIPTION_CONTRACT = `#graphql
  query GetSubscriptionContract($id: ID!) {
    subscriptionContract(id: $id) {
      id
      status
      nextBillingDate
      currencyCode
      customer {
        id
        email
        firstName
        lastName
        phone
      }
      customerPaymentMethod {
        id
        instrument {
          ... on CustomerCreditCard {
            brand
            lastDigits
            expiryMonth
            expiryYear
          }
        }
      }
      deliveryPolicy {
        interval
        intervalCount
      }
      billingPolicy {
        interval
        intervalCount
      }
      deliveryPrice {
        amount
        currencyCode
      }
      lines(first: 50) {
        edges {
          node {
            id
            title
            variantTitle
            quantity
            currentPrice {
              amount
              currencyCode
            }
            productId
            variantId
            sku
            requiresShipping
            variantImage {
              url
              altText
            }
          }
        }
      }
      billingCycles(first: 10) {
        edges {
          node {
            cycleIndex
            cycleStartAt
            cycleEndAt
            billingAttemptExpectedDate
            status
            skipped
          }
        }
      }
      orders(first: 10) {
        edges {
          node {
            id
            name
            createdAt
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
          }
        }
      }
      originOrder {
        id
        name
      }
      lastPaymentStatus
      createdAt
      updatedAt
    }
  }
`;
```

#### Contract Management Mutations

**Update Contract (`app/graphql/mutations/subscriptionContractUpdate.ts`):**

```typescript
export const SUBSCRIPTION_CONTRACT_UPDATE = `#graphql
  mutation SubscriptionContractUpdate($contractId: ID!) {
    subscriptionContractUpdate(contractId: $contractId) {
      draft {
        id
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const SUBSCRIPTION_DRAFT_UPDATE = `#graphql
  mutation SubscriptionDraftUpdate($draftId: ID!, $input: SubscriptionDraftInput!) {
    subscriptionDraftUpdate(draftId: $draftId, input: $input) {
      draft {
        id
        status
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const SUBSCRIPTION_DRAFT_COMMIT = `#graphql
  mutation SubscriptionDraftCommit($draftId: ID!) {
    subscriptionDraftCommit(draftId: $draftId) {
      contract {
        id
        status
        nextBillingDate
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
```

#### Contracts Service

**Contracts Service (`app/services/contracts.server.ts`):**

```typescript
import type { AdminApiClient } from "@shopify/shopify-app-remix/server";
import {
  SUBSCRIPTION_CONTRACT_UPDATE,
  SUBSCRIPTION_DRAFT_UPDATE,
  SUBSCRIPTION_DRAFT_COMMIT,
} from "~/graphql/mutations/subscriptionContractUpdate";
import db from "~/utils/db.server";
import type { ContractStatus } from "@prisma/client";

export async function updateContractStatus(
  admin: AdminApiClient,
  contractId: string,
  newStatus: "ACTIVE" | "PAUSED" | "CANCELLED"
) {
  // Step 1: Create draft
  const draftResponse = await admin.graphql(SUBSCRIPTION_CONTRACT_UPDATE, {
    variables: { contractId },
  });
  const { data: draftData } = await draftResponse.json();

  if (draftData.subscriptionContractUpdate.userErrors.length > 0) {
    throw new Error(
      draftData.subscriptionContractUpdate.userErrors
        .map((e: any) => e.message)
        .join(", ")
    );
  }

  const draftId = draftData.subscriptionContractUpdate.draft.id;

  // Step 2: Update draft with new status
  const updateResponse = await admin.graphql(SUBSCRIPTION_DRAFT_UPDATE, {
    variables: {
      draftId,
      input: { status: newStatus },
    },
  });
  const { data: updateData } = await updateResponse.json();

  if (updateData.subscriptionDraftUpdate.userErrors.length > 0) {
    throw new Error(
      updateData.subscriptionDraftUpdate.userErrors
        .map((e: any) => e.message)
        .join(", ")
    );
  }

  // Step 3: Commit the draft
  const commitResponse = await admin.graphql(SUBSCRIPTION_DRAFT_COMMIT, {
    variables: { draftId },
  });
  const { data: commitData } = await commitResponse.json();

  if (commitData.subscriptionDraftCommit.userErrors.length > 0) {
    throw new Error(
      commitData.subscriptionDraftCommit.userErrors
        .map((e: any) => e.message)
        .join(", ")
    );
  }

  // Update local cache
  await db.subscriptionContract.updateMany({
    where: { shopifyContractId: contractId },
    data: {
      status: newStatus as ContractStatus,
      updatedAt: new Date(),
    },
  });

  return commitData.subscriptionDraftCommit.contract;
}

export async function cancelContract(admin: AdminApiClient, contractId: string) {
  return updateContractStatus(admin, contractId, "CANCELLED");
}

export async function pauseContract(admin: AdminApiClient, contractId: string) {
  return updateContractStatus(admin, contractId, "PAUSED");
}

export async function resumeContract(admin: AdminApiClient, contractId: string) {
  return updateContractStatus(admin, contractId, "ACTIVE");
}
```

### 2.3 Billing Cycle Handling

#### Billing Mutations

**Skip Billing Cycle (`app/graphql/mutations/subscriptionBillingCycleSkip.ts`):**

```typescript
export const SUBSCRIPTION_BILLING_CYCLE_SKIP = `#graphql
  mutation SubscriptionBillingCycleSkip($contractId: ID!, $cycleIndex: Int!) {
    subscriptionBillingCycleSkip(
      subscriptionContractId: $contractId
      billingCycleInput: { selector: { cycleIndex: $cycleIndex } }
    ) {
      billingCycle {
        cycleIndex
        skipped
        billingAttemptExpectedDate
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const SUBSCRIPTION_BILLING_CYCLE_UNSKIP = `#graphql
  mutation SubscriptionBillingCycleUnskip($contractId: ID!, $cycleIndex: Int!) {
    subscriptionBillingCycleUnskip(
      subscriptionContractId: $contractId
      billingCycleInput: { selector: { cycleIndex: $cycleIndex } }
    ) {
      billingCycle {
        cycleIndex
        skipped
        billingAttemptExpectedDate
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
```

**Create Billing Attempt (`app/graphql/mutations/subscriptionBillingAttemptCreate.ts`):**

```typescript
export const SUBSCRIPTION_BILLING_ATTEMPT_CREATE = `#graphql
  mutation SubscriptionBillingAttemptCreate(
    $contractId: ID!
    $originTime: DateTime!
    $idempotencyKey: String!
  ) {
    subscriptionBillingAttemptCreate(
      subscriptionContractId: $contractId
      subscriptionBillingAttemptInput: {
        originTime: $originTime
        idempotencyKey: $idempotencyKey
      }
    ) {
      subscriptionBillingAttempt {
        id
        ready
        errorCode
        errorMessage
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export const SUBSCRIPTION_BILLING_CYCLE_BULK_CHARGE = `#graphql
  mutation SubscriptionBillingCycleBulkCharge(
    $subscriptionContractId: ID!
    $date: Date!
  ) {
    subscriptionBillingCycleBulkCharge(
      subscriptionContractId: $subscriptionContractId
      datePicker: { from: $date, to: $date }
    ) {
      jobs {
        id
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
```

#### Billing Service

**Billing Service (`app/services/billing.server.ts`):**

```typescript
import type { AdminApiClient } from "@shopify/shopify-app-remix/server";
import { SUBSCRIPTION_BILLING_ATTEMPT_CREATE, SUBSCRIPTION_BILLING_CYCLE_BULK_CHARGE } from "~/graphql/mutations/subscriptionBillingAttemptCreate";
import db from "~/utils/db.server";
import { v4 as uuidv4 } from "uuid";

export async function createBillingAttempt(
  admin: AdminApiClient,
  contractId: string,
  originTime: Date
) {
  const idempotencyKey = uuidv4();

  const response = await admin.graphql(SUBSCRIPTION_BILLING_ATTEMPT_CREATE, {
    variables: {
      contractId,
      originTime: originTime.toISOString(),
      idempotencyKey,
    },
  });

  const { data } = await response.json();

  if (data.subscriptionBillingAttemptCreate.userErrors.length > 0) {
    throw new Error(
      data.subscriptionBillingAttemptCreate.userErrors
        .map((e: any) => e.message)
        .join(", ")
    );
  }

  return data.subscriptionBillingAttemptCreate.subscriptionBillingAttempt;
}

export async function bulkChargeBillingCycles(
  admin: AdminApiClient,
  contractId: string,
  date: Date
) {
  const formattedDate = date.toISOString().split("T")[0];

  const response = await admin.graphql(SUBSCRIPTION_BILLING_CYCLE_BULK_CHARGE, {
    variables: {
      subscriptionContractId: contractId,
      date: formattedDate,
    },
  });

  const { data } = await response.json();

  if (data.subscriptionBillingCycleBulkCharge.userErrors.length > 0) {
    throw new Error(
      data.subscriptionBillingCycleBulkCharge.userErrors
        .map((e: any) => e.message)
        .join(", ")
    );
  }

  return data.subscriptionBillingCycleBulkCharge.jobs;
}

export async function getContractsDueToBill(shopDomain: string) {
  const now = new Date();
  const shop = await db.shop.findUnique({ where: { shopDomain } });

  if (!shop) return [];

  return db.subscriptionContract.findMany({
    where: {
      shopId: shop.id,
      status: "ACTIVE",
      nextBillingDate: {
        lte: now,
      },
    },
    orderBy: {
      nextBillingDate: "asc",
    },
  });
}
```

### 2.4 Customer Payment Methods

**Payment Method Query (`app/graphql/queries/getCustomerPaymentMethods.ts`):**

```typescript
export const GET_CUSTOMER_PAYMENT_METHODS = `#graphql
  query GetCustomerPaymentMethods($customerId: ID!) {
    customer(id: $customerId) {
      id
      email
      paymentMethods(first: 10) {
        edges {
          node {
            id
            instrument {
              ... on CustomerCreditCard {
                brand
                lastDigits
                expiryMonth
                expiryYear
                name
              }
              ... on CustomerPaypalBillingAgreement {
                paypalAccountEmail
              }
              ... on CustomerShopPayAgreement {
                lastDigits
                name
              }
            }
            revokedAt
            subscriptionContracts(first: 10) {
              edges {
                node {
                  id
                  status
                }
              }
            }
          }
        }
      }
    }
  }
`;
```

**Send Payment Update Email (`app/graphql/mutations/customerPaymentMethodSendUpdateEmail.ts`):**

```typescript
export const CUSTOMER_PAYMENT_METHOD_SEND_UPDATE_EMAIL = `#graphql
  mutation CustomerPaymentMethodSendUpdateEmail($subscriptionContractId: ID!) {
    customerPaymentMethodSendUpdateEmail(
      subscriptionContractId: $subscriptionContractId
    ) {
      customer {
        id
        email
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;
```

---

## Phase 3: Extensions

### 3.1 Purchase Options Extension (Admin)

**Generate Extension:**
```bash
shopify app generate extension \
  --template admin_purchase_option \
  --name purchase-options \
  --flavor react
```

**Extension Configuration (`extensions/purchase-options/shopify.extension.toml`):**
```toml
api_version = "2024-10"

[[extensions]]
type = "ui_extension"
name = "Purchase Options"
handle = "purchase-options"

[[extensions.targeting]]
module = "./src/ActionExtension.tsx"
target = "admin.product-details.action.render"
```

**Main Extension Component (`extensions/purchase-options/src/ActionExtension.tsx`):**

```typescript
import {
  reactExtension,
  useApi,
  AdminAction,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  Checkbox,
  Button,
  Banner,
  Divider,
} from "@shopify/ui-extensions-react/admin";
import { useState, useEffect } from "react";

export default reactExtension(
  "admin.product-details.action.render",
  () => <PurchaseOptionsAction />
);

function PurchaseOptionsAction() {
  const { close, data, query, applyAttributeChange } = useApi<"admin.product-details.action.render">();

  const [mode, setMode] = useState<"create" | "edit" | "add">("create");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [planName, setPlanName] = useState("Subscribe & Save");
  const [merchantCode, setMerchantCode] = useState("subscribe-save");
  const [interval, setInterval] = useState("MONTH");
  const [intervalCount, setIntervalCount] = useState("1");
  const [discountType, setDiscountType] = useState("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("10");

  const productId = data?.selected?.[0]?.id;

  const handleSave = async () => {
    setLoading(true);
    setError(null);

    try {
      // Call app backend to create selling plan
      const response = await fetch("/api/selling-plans/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          planName,
          merchantCode,
          interval,
          intervalCount: parseInt(intervalCount),
          discountType,
          discountValue: parseFloat(discountValue),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create subscription plan");
      }

      setSuccess(true);
      setTimeout(() => close(), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminAction
      title="Manage Subscription Options"
      primaryAction={{
        content: "Save",
        onAction: handleSave,
        loading,
        disabled: loading || success,
      }}
      secondaryAction={{
        content: "Cancel",
        onAction: () => close(),
      }}
    >
      <BlockStack gap="400">
        {error && (
          <Banner status="critical" onDismiss={() => setError(null)}>
            {error}
          </Banner>
        )}

        {success && (
          <Banner status="success">
            Subscription plan created successfully!
          </Banner>
        )}

        <TextField
          label="Plan Group Name"
          value={planName}
          onChange={setPlanName}
          helpText="Displayed to customers (e.g., 'Subscribe & Save')"
        />

        <TextField
          label="Merchant Code"
          value={merchantCode}
          onChange={setMerchantCode}
          helpText="Internal identifier (no spaces)"
        />

        <Divider />

        <Text variant="headingMd">Delivery Frequency</Text>

        <InlineStack gap="200">
          <Select
            label="Interval"
            value={interval}
            onChange={setInterval}
            options={[
              { label: "Day", value: "DAY" },
              { label: "Week", value: "WEEK" },
              { label: "Month", value: "MONTH" },
              { label: "Year", value: "YEAR" },
            ]}
          />

          <TextField
            label="Every"
            type="number"
            value={intervalCount}
            onChange={setIntervalCount}
            min={1}
            max={365}
          />
        </InlineStack>

        <Divider />

        <Text variant="headingMd">Discount</Text>

        <InlineStack gap="200">
          <Select
            label="Discount Type"
            value={discountType}
            onChange={setDiscountType}
            options={[
              { label: "Percentage", value: "PERCENTAGE" },
              { label: "Fixed Amount", value: "FIXED_AMOUNT" },
            ]}
          />

          <TextField
            label={discountType === "PERCENTAGE" ? "Percentage (%)" : "Amount"}
            type="number"
            value={discountValue}
            onChange={setDiscountValue}
            min={0}
            max={discountType === "PERCENTAGE" ? 100 : undefined}
          />
        </InlineStack>
      </BlockStack>
    </AdminAction>
  );
}
```

### 3.2 Theme App Extension (Storefront)

**Generate Extension:**
```bash
shopify app generate extension \
  --template theme_app_extension \
  --name subscription-widget
```

**App Block (`extensions/theme-extension/blocks/subscription-selector.liquid`):**

```liquid
{% schema %}
{
  "name": "Subscription Options",
  "target": "section",
  "settings": [
    {
      "type": "text",
      "id": "title",
      "label": "Title",
      "default": "Subscribe & Save"
    },
    {
      "type": "text",
      "id": "one_time_label",
      "label": "One-time purchase label",
      "default": "One-time purchase"
    },
    {
      "type": "color",
      "id": "accent_color",
      "label": "Accent color",
      "default": "#5C6AC4"
    },
    {
      "type": "checkbox",
      "id": "show_savings",
      "label": "Show savings badge",
      "default": true
    }
  ]
}
{% endschema %}

{% if product.selling_plan_groups.size > 0 %}
<div class="subscription-widget" data-product-id="{{ product.id }}">
  <style>
    .subscription-widget {
      margin: 1.5rem 0;
      padding: 1rem;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
    }

    .subscription-widget__title {
      font-weight: 600;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .subscription-option {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      border: 2px solid #e5e5e5;
      border-radius: 6px;
      cursor: pointer;
      transition: border-color 0.2s, background-color 0.2s;
    }

    .subscription-option:hover {
      border-color: {{ block.settings.accent_color }};
    }

    .subscription-option.selected {
      border-color: {{ block.settings.accent_color }};
      background-color: {{ block.settings.accent_color }}10;
    }

    .subscription-option__radio {
      margin-right: 0.75rem;
      accent-color: {{ block.settings.accent_color }};
    }

    .subscription-option__label {
      flex: 1;
    }

    .subscription-option__name {
      font-weight: 500;
    }

    .subscription-option__details {
      font-size: 0.875rem;
      color: #666;
      margin-top: 0.25rem;
    }

    .subscription-option__savings {
      background-color: {{ block.settings.accent_color }};
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }

    .subscription-option__price {
      font-weight: 600;
      margin-left: 0.5rem;
    }
  </style>

  <h3 class="subscription-widget__title">{{ block.settings.title }}</h3>

  <!-- One-time purchase option -->
  <label class="subscription-option selected" data-option="one-time">
    <input
      type="radio"
      name="selling_plan"
      value=""
      class="subscription-option__radio"
      form="product-form-{{ product.id }}"
      checked
    >
    <div class="subscription-option__label">
      <div class="subscription-option__name">{{ block.settings.one_time_label }}</div>
      <div class="subscription-option__details">{{ product.price | money }}</div>
    </div>
  </label>

  <!-- Subscription options -->
  {% for group in product.selling_plan_groups %}
    {% for plan in group.selling_plans %}
      {% assign price_adjustment = plan.price_adjustments | first %}
      {% assign savings_value = price_adjustment.value %}

      <label class="subscription-option" data-option="subscription">
        <input
          type="radio"
          name="selling_plan"
          value="{{ plan.id }}"
          class="subscription-option__radio"
          form="product-form-{{ product.id }}"
        >
        <div class="subscription-option__label">
          <div class="subscription-option__name">{{ plan.name }}</div>
          <div class="subscription-option__details">
            {% if plan.recurring_deliveries %}
              Delivers {{ plan.delivery_policy.interval | downcase }}
            {% endif %}
          </div>
        </div>

        {% if block.settings.show_savings and savings_value > 0 %}
          <span class="subscription-option__savings">
            Save {{ savings_value }}%
          </span>
        {% endif %}

        <span class="subscription-option__price">
          {{ product.price | times: 100 | minus: product.price | times: savings_value | divided_by: 100 | money }}
        </span>
      </label>
    {% endfor %}
  {% endfor %}

  <script>
    (function() {
      const widget = document.querySelector('.subscription-widget[data-product-id="{{ product.id }}"]');
      const options = widget.querySelectorAll('.subscription-option');

      options.forEach(option => {
        option.addEventListener('click', function() {
          options.forEach(o => o.classList.remove('selected'));
          this.classList.add('selected');
          this.querySelector('input').checked = true;
        });
      });
    })();
  </script>
</div>
{% endif %}
```

### 3.3 Checkout UI Extension (Thank You Page)

**Generate Extension:**
```bash
shopify app generate extension \
  --template checkout_ui \
  --name subscription-confirmation
```

**Extension Component (`extensions/checkout-ui/src/ThankYouPage.tsx`):**

```typescript
import {
  reactExtension,
  Banner,
  BlockStack,
  Text,
  Link,
  useApi,
  useSubscription,
} from "@shopify/ui-extensions-react/checkout";

export default reactExtension(
  "purchase.thank-you.block.render",
  () => <SubscriptionConfirmation />
);

function SubscriptionConfirmation() {
  const { lines, shop } = useApi<"purchase.thank-you.block.render">();

  // Check if any line items have a subscription
  const subscriptionLines = lines.current.filter(
    (line) => line.merchandise.sellingPlan !== null
  );

  if (subscriptionLines.length === 0) {
    return null;
  }

  return (
    <Banner status="success" title="Subscription Created!">
      <BlockStack spacing="tight">
        <Text>
          Thank you for subscribing! Your subscription has been set up successfully.
        </Text>
        <Text>
          You can manage your subscription, skip deliveries, or update your payment method from your customer account.
        </Text>
        <Link to={`${shop.storefrontUrl}/account`}>
          Manage My Subscriptions
        </Link>
      </BlockStack>
    </Banner>
  );
}
```

### 3.4 Customer Account Extension

**Generate Extension:**
```bash
shopify app generate extension \
  --template customer_account_ui \
  --name subscription-portal
```

See full implementation in the detailed plan above.

---

## Phase 4: Webhooks & Background Jobs

### 4.1 Webhook Handlers Setup

Key webhooks to handle:
- `subscription_contracts/create`
- `subscription_contracts/update`
- `subscription_billing_attempts/success`
- `subscription_billing_attempts/failure`
- `subscription_billing_attempts/challenged`

### 4.2 Billing Job Scheduler

- Run every hour via node-cron
- Process pending billing jobs
- Handle retry logic with exponential backoff

### 4.3 Dunning Management

- Track failed payment counts
- Schedule retries (max 30 in 35 days)
- Send customer notifications
- Pause/cancel on max retries

---

## Phase 5: Customer Portal

Required features for App Store compliance:
- View all active subscriptions
- Subscription details (products, frequency, price, schedule)
- Skip delivery functionality
- Update payment method
- Cancel subscription

---

## Phase 6: Testing & Compliance

### App Store Requirements Checklist

- [ ] Protected scopes approved
- [ ] Using GraphQL Admin API exclusively
- [ ] Selling plan name visible on product page
- [ ] Price and savings displayed correctly
- [ ] Selling plan name visible in cart
- [ ] Multi-currency tested
- [ ] Theme extension uses app blocks
- [ ] Purchase Options Extension implemented
- [ ] Customer portal accessible
- [ ] Cancel functionality works
- [ ] Payment update functionality works

### Test Card Numbers

| Card | Purpose |
|------|---------|
| `4242424242424242` | Always succeeds |
| `4000000000000002` | Always declines |
| `4000000000009995` | Insufficient funds |
| `4000000000000069` | Expired card |

---

## Phase 7: Differentiation Features (Optional)

Based on competitor analysis:
- AI-powered churn prediction
- Smart retention flows
- Analytics dashboard with MRR, churn rate, LTV

---

## Key Architectural Decisions

1. **Framework**: Remix + React for seamless Shopify integration
2. **Database**: SQLite for development, PostgreSQL for production
3. **ORM**: Prisma for type-safe database access
4. **Job Scheduler**: node-cron for billing jobs (consider BullMQ for production)
5. **Data Strategy**: Hybrid - Shopify as source of truth, local cache for performance
6. **Extensions**: All new extension types (Purchase Options, Customer Account UI)
7. **API**: GraphQL Admin API exclusively (REST deprecated)
