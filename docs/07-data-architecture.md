# Data Architecture for Shopify Subscription Apps

## Hybrid Data Persistence

The recommended approach uses both **Metaobjects** (Shopify-hosted) and a **local database** (app-hosted).

```
┌─────────────────────────────────────────────────────────────────┐
│                     Shopify (Source of Truth)                   │
├─────────────────────────────────────────────────────────────────┤
│  • Subscription Contracts                                       │
│  • Selling Plans                                                │
│  • Billing Cycles                                               │
│  • Customer Payment Methods                                     │
│  • Orders                                                       │
│  • Metaobjects (shop-specific settings)                        │
└─────────────────────────────────────────────────────────────────┘
                            │
                    Webhooks │ API Sync
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Your App Database                            │
├─────────────────────────────────────────────────────────────────┤
│  • Session data (authentication)                                │
│  • Billing schedules & retry logic                              │
│  • Cross-shop analytics                                         │
│  • Processed webhook tracking                                   │
│  • Job queue state                                              │
└─────────────────────────────────────────────────────────────────┘
```

## What to Store Where

### Metaobjects (Shopify)

Use for shop-specific data that should persist with the shop:

| Data Type | Example |
|-----------|---------|
| App settings | Email templates, retry policies |
| Shop preferences | Notification settings |
| Custom configuration | Branding, feature flags |

```typescript
// Creating a settings metaobject
async function createSettingsMetaobject(admin: AdminApiClient) {
  const response = await admin.graphql(`
    mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition {
          id
          type
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      definition: {
        type: "$app:subscription_settings",
        name: "Subscription Settings",
        fieldDefinitions: [
          {
            key: "retry_count",
            name: "Max Retry Count",
            type: "number_integer",
          },
          {
            key: "notification_email",
            name: "Notification Email",
            type: "single_line_text_field",
          },
        ],
      },
    },
  });
}
```

### Local Database (Prisma + SQLite/PostgreSQL)

Use for:

| Data Type | Reason |
|-----------|--------|
| Session data | Required for OAuth |
| Cross-shop data | Analytics, aggregations |
| Job scheduling | Billing job state |
| Webhook tracking | Idempotency |
| Cache/sync data | Performance optimization |

## Database Schema (Prisma)

### Core Tables

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // or "postgresql" for production
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
}

// Track shops using your app
model Shop {
  id                String   @id @default(uuid())
  shopDomain        String   @unique
  accessToken       String
  installedAt       DateTime @default(now())
  uninstalledAt     DateTime?

  subscriptionContracts SubscriptionContract[]
  billingJobs           BillingJob[]
}

// Local cache of subscription contracts
model SubscriptionContract {
  id                  String   @id @default(uuid())
  shopifyContractId   String   @unique
  shopId              String
  shop                Shop     @relation(fields: [shopId], references: [id])

  customerId          String
  status              String   // ACTIVE, PAUSED, CANCELLED, etc.
  nextBillingDate     DateTime?

  failedAttemptCount  Int      @default(0)
  lastBillingAttempt  DateTime?

  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  billingJobs         BillingJob[]
}

// Track billing jobs
model BillingJob {
  id                  String   @id @default(uuid())
  shopId              String
  shop                Shop     @relation(fields: [shopId], references: [id])
  contractId          String?
  contract            SubscriptionContract? @relation(fields: [contractId], references: [id])

  scheduledFor        DateTime
  executedAt          DateTime?
  status              String   // PENDING, RUNNING, COMPLETED, FAILED
  result              String?  // JSON result

  createdAt           DateTime @default(now())
}

// Webhook idempotency
model ProcessedWebhook {
  id          String   @id @default(uuid())
  webhookId   String   @unique
  topic       String
  shopDomain  String
  processedAt DateTime @default(now())
}
```

## Syncing with Shopify

### Initial Sync

When a shop installs your app:

```typescript
async function performInitialSync(shop: string, admin: AdminApiClient) {
  // Fetch all existing subscription contracts
  let hasNextPage = true;
  let cursor: string | null = null;

  while (hasNextPage) {
    const response = await admin.graphql(`
      query GetContracts($cursor: String) {
        subscriptionContracts(first: 50, after: $cursor) {
          edges {
            cursor
            node {
              id
              status
              nextBillingDate
              customer {
                id
              }
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `, { variables: { cursor } });

    const { data } = await response.json();
    const contracts = data.subscriptionContracts.edges;

    for (const { node } of contracts) {
      await db.subscriptionContract.upsert({
        where: { shopifyContractId: node.id },
        create: {
          shopifyContractId: node.id,
          shopId: shop,
          status: node.status,
          nextBillingDate: node.nextBillingDate,
          customerId: node.customer.id,
        },
        update: {
          status: node.status,
          nextBillingDate: node.nextBillingDate,
        },
      });
    }

    hasNextPage = data.subscriptionContracts.pageInfo.hasNextPage;
    cursor = contracts[contracts.length - 1]?.cursor;
  }
}
```

### Ongoing Sync via Webhooks

Keep local database in sync using webhooks:

```typescript
// Handle contract updates
async function handleContractUpdate(payload: any) {
  const contractId = payload.admin_graphql_api_id;

  await db.subscriptionContract.update({
    where: { shopifyContractId: contractId },
    data: {
      status: payload.status,
      nextBillingDate: payload.next_billing_date,
      updatedAt: new Date(),
    },
  });
}
```

## Multi-Tenant Architecture

Each merchant's data is isolated:

```typescript
// Always scope queries by shop
async function getContractsForShop(shopDomain: string) {
  const shop = await db.shop.findUnique({
    where: { shopDomain },
    include: { subscriptionContracts: true },
  });

  return shop?.subscriptionContracts ?? [];
}
```

## Production Considerations

### Database Choice

| Database | Use Case |
|----------|----------|
| SQLite | Development, single-instance apps |
| PostgreSQL | Production, multi-instance apps |
| MySQL | Production alternative |
| PlanetScale | Serverless MySQL |

### Scaling

For high-volume apps:

1. **Read replicas** for analytics queries
2. **Connection pooling** (PgBouncer, Prisma Data Proxy)
3. **Caching layer** (Redis) for frequently accessed data
4. **Job queues** (Bull, Agenda) for background processing

### Data Retention

- Keep webhook logs for debugging (30-90 days)
- Archive old billing job records
- Comply with data retention requirements

## GraphQL Type Generation

Generate TypeScript types from Shopify's GraphQL schema:

```typescript
// .graphqlrc.ts
export default {
  projects: {
    default: {
      schema: "https://shopify.dev/admin-graphql-direct-proxy/2024-01",
      documents: ["app/**/*.{ts,tsx}"],
      extensions: {
        codegen: {
          generates: {
            "types/admin.generated.d.ts": {
              plugins: ["typescript", "typescript-operations"],
            },
          },
        },
      },
    },
  },
};
```

Run generation:

```bash
npm run graphql-codegen
```

## Sources

- [Core Shopify Subscriptions Reference App Components](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/subscriptions-app/core-system-components)
- [Designing Your Shopify App's Data Architecture](https://nebulab.com/blog/shopify-data-architecture)
- [Prisma for Shopify: Best Practices](https://www.oscprofessionals.com/shopify-app/prisma-for-shopify-best-practices-database-management/)
