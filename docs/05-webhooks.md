# Webhooks for Shopify Subscription Apps

Webhooks keep your app synchronized with Shopify's subscription system. They notify your app when subscription-related events occur.

## Available Subscription Webhook Topics

### Contract Webhooks

| Topic | Trigger |
|-------|---------|
| `subscription_contracts/create` | New subscription contract created |
| `subscription_contracts/update` | Subscription contract modified |

### Billing Cycle Webhooks

| Topic | Trigger |
|-------|---------|
| `subscription_billing_cycle_edits/create` | Billing cycle edit created |
| `subscription_billing_cycle_edits/update` | Billing cycle edit modified |
| `subscription_billing_cycle_edits/delete` | Billing cycle edit removed |

### Billing Attempt Webhooks

| Topic | Trigger |
|-------|---------|
| `subscription_billing_attempts/success` | Payment successful, order created |
| `subscription_billing_attempts/failure` | Payment failed |
| `subscription_billing_attempts/challenged` | Payment requires verification |

## Setting Up Webhooks

### Using GraphQL (Recommended)

```graphql
mutation CreateWebhookSubscription($topic: WebhookSubscriptionTopic!, $callbackUrl: URL!) {
  webhookSubscriptionCreate(
    topic: $topic
    webhookSubscription: {
      callbackUrl: $callbackUrl
      format: JSON
    }
  ) {
    webhookSubscription {
      id
      topic
      endpoint {
        __typename
        ... on WebhookHttpEndpoint {
          callbackUrl
        }
      }
    }
    userErrors {
      field
      message
    }
  }
}
```

### With Shopify App Remix

```typescript
// app/shopify.server.ts
import { shopifyApp } from "@shopify/shopify-app-remix/server";

const shopify = shopifyApp({
  // ... other config
  webhooks: {
    SUBSCRIPTION_CONTRACTS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/subscription-contract-create",
    },
    SUBSCRIPTION_BILLING_ATTEMPTS_SUCCESS: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/billing-success",
    },
    SUBSCRIPTION_BILLING_ATTEMPTS_FAILURE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/billing-failure",
    },
  },
});
```

### Webhook Handler Route

```typescript
// app/routes/webhooks.subscription-contract-create.tsx
import { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Process the new subscription contract
  const contract = payload;

  // Store in your database
  await db.subscriptionContract.create({
    data: {
      shopifyContractId: contract.admin_graphql_api_id,
      customerId: contract.customer.admin_graphql_api_id,
      status: contract.status,
      nextBillingDate: contract.next_billing_date,
    },
  });

  return new Response("OK", { status: 200 });
};
```

## Webhook Payload Examples

### subscription_contracts/create

```json
{
  "admin_graphql_api_id": "gid://shopify/SubscriptionContract/123456789",
  "status": "ACTIVE",
  "next_billing_date": "2025-02-01T00:00:00Z",
  "customer": {
    "admin_graphql_api_id": "gid://shopify/Customer/987654321",
    "email": "customer@example.com"
  },
  "origin_order": {
    "admin_graphql_api_id": "gid://shopify/Order/111111111"
  },
  "lines": [
    {
      "admin_graphql_api_id": "gid://shopify/SubscriptionLine/222222222",
      "product_id": "gid://shopify/Product/333333333",
      "variant_id": "gid://shopify/ProductVariant/444444444",
      "quantity": 1,
      "title": "Premium Coffee Subscription"
    }
  ]
}
```

### subscription_billing_attempts/failure

```json
{
  "admin_graphql_api_id": "gid://shopify/SubscriptionBillingAttempt/555555555",
  "subscription_contract_id": "gid://shopify/SubscriptionContract/123456789",
  "ready": true,
  "error_code": "INSUFFICIENT_FUNDS",
  "error_message": "The card has insufficient funds to complete the purchase."
}
```

## Handling Billing Failures (Dunning)

Dunning is the process of retrying failed payments and communicating with customers.

### Best Practices

1. **Check error codes before retrying**:
   - `INSUFFICIENT_FUNDS` - Retry makes sense
   - `CARD_DECLINED` - May retry after delay
   - `EXPIRED_CARD` - Don't retry, request new payment method

2. **Retry limits**:
   - Avoid re-billing more than 30 times in 35 days
   - Excessive retries will cause payment method revocation

3. **Customer communication**:
   - Notify customer of failed payment
   - Send payment update link
   - Warn before cancellation

### Example Dunning Handler

```typescript
// app/routes/webhooks.billing-failure.tsx
import { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { sendPaymentFailureEmail, scheduleRetry } from "~/services/dunning";

const RETRYABLE_ERRORS = [
  "INSUFFICIENT_FUNDS",
  "PROCESSING_ERROR",
  "TEMPORARY_ERROR",
];

export const action = async ({ request }: ActionFunctionArgs) => {
  const { payload, admin } = await authenticate.webhook(request);

  const attempt = payload;
  const contractId = attempt.subscription_contract_id;

  // Get retry count from database
  const contract = await db.subscriptionContract.findUnique({
    where: { shopifyContractId: contractId },
  });

  const retryCount = contract?.failedAttemptCount ?? 0;
  const isRetryable = RETRYABLE_ERRORS.includes(attempt.error_code);
  const maxRetries = 5;

  if (isRetryable && retryCount < maxRetries) {
    // Schedule retry with exponential backoff
    const delayHours = Math.pow(2, retryCount) * 24; // 1, 2, 4, 8, 16 days
    await scheduleRetry(contractId, delayHours);

    // Notify customer
    await sendPaymentFailureEmail(contract.customerId, {
      type: "retry_scheduled",
      retryDate: new Date(Date.now() + delayHours * 60 * 60 * 1000),
    });

    // Update retry count
    await db.subscriptionContract.update({
      where: { id: contract.id },
      data: { failedAttemptCount: retryCount + 1 },
    });
  } else {
    // Final failure - cancel or pause subscription
    await sendPaymentFailureEmail(contract.customerId, {
      type: "final_notice",
    });

    // Update contract status based on app settings
    // (pause, cancel, or require action)
  }

  return new Response("OK", { status: 200 });
};
```

## Webhook Security

### Verify Webhook Signatures

Shopify signs webhooks with HMAC-SHA256. Always verify:

```typescript
import crypto from "crypto";

function verifyWebhook(body: string, hmacHeader: string, secret: string): boolean {
  const calculatedHmac = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(
    Buffer.from(calculatedHmac),
    Buffer.from(hmacHeader)
  );
}
```

Note: The Shopify App Remix package handles verification automatically in `authenticate.webhook()`.

### Handle Idempotency

Webhooks may be delivered multiple times. Use idempotency keys:

```typescript
export const action = async ({ request }: ActionFunctionArgs) => {
  const webhookId = request.headers.get("X-Shopify-Webhook-Id");

  // Check if already processed
  const existing = await db.processedWebhook.findUnique({
    where: { webhookId },
  });

  if (existing) {
    return new Response("Already processed", { status: 200 });
  }

  // Process webhook...

  // Mark as processed
  await db.processedWebhook.create({
    data: { webhookId, processedAt: new Date() },
  });

  return new Response("OK", { status: 200 });
};
```

## Job Scheduler for Billing

The reference app uses a job scheduler to automate billing:

```typescript
// jobs/billingScheduler.ts
import cron from "node-cron";
import { getShopsDueToBill, billShop } from "~/services/billing";

// Run every hour
cron.schedule("0 * * * *", async () => {
  const shops = await getShopsDueToBill();

  for (const shop of shops) {
    try {
      await billShop(shop);
    } catch (error) {
      console.error(`Failed to bill shop ${shop.id}:`, error);
    }
  }
});

async function billShop(shop: Shop) {
  const admin = await getAdminApiClient(shop);

  await admin.graphql(`
    mutation {
      subscriptionBillingCycleBulkCharge(
        subscriptionContractId: "..."
        datePicker: { from: "...", to: "..." }
      ) {
        jobs { id }
        userErrors { message }
      }
    }
  `);
}
```

## Testing Webhooks

### Testing Billing Failures

Use Shopify's test credit card numbers:
- `4000000000000002` - Always declines (use for testing failure webhooks)

### Local Development

The Shopify CLI creates a tunnel automatically during `shopify app dev`, allowing webhooks to reach your local server.

## Sources

- [Webhook - GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql/latest/objects/webhooksubscription)
- [Adding Webhooks to Subscription Billing Cycles API](https://shopify.dev/changelog/adding-webhooks-to-the-subscription-billing-cycles-api)
- [Build a Subscription Contract](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/contracts/build-a-subscription-contract)
