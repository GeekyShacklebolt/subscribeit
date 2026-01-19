# Core APIs for Shopify Subscriptions

All new apps must use the **GraphQL Admin API** exclusively (REST is deprecated as of April 2025).

## Selling Plan APIs

Selling plans define how products can be purchased on a subscription basis.

### Key Concepts

- **Selling Plan Group**: A collection of related selling plans (e.g., "Subscribe & Save")
- **Selling Plan**: A specific purchase option (e.g., "Deliver every 2 weeks - 10% off")
- **Pricing Policy**: How the price is calculated (percentage discount, fixed price, etc.)
- **Billing Policy**: When and how often to charge (recurring, fixed number of cycles)
- **Delivery Policy**: When and how often to fulfill orders

### Creating a Selling Plan Group

```graphql
mutation CreateSellingPlanGroup($input: SellingPlanGroupInput!) {
  sellingPlanGroupCreate(input: $input) {
    sellingPlanGroup {
      id
      name
      sellingPlans(first: 10) {
        edges {
          node {
            id
            name
          }
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

### Input Structure

```graphql
{
  "input": {
    "name": "Subscribe & Save",
    "merchantCode": "subscribe-save",
    "options": ["Delivery frequency"],
    "sellingPlansToCreate": [
      {
        "name": "Deliver every 2 weeks",
        "options": ["2 Weeks"],
        "billingPolicy": {
          "recurring": {
            "interval": "WEEK",
            "intervalCount": 2,
            "anchors": []
          }
        },
        "deliveryPolicy": {
          "recurring": {
            "interval": "WEEK",
            "intervalCount": 2,
            "anchors": []
          }
        },
        "pricingPolicies": [
          {
            "recurring": {
              "adjustmentType": "PERCENTAGE",
              "adjustmentValue": {
                "percentage": 10
              },
              "afterCycle": 0
            }
          }
        ]
      }
    ]
  }
}
```

### Associating Selling Plans with Products

```graphql
mutation AddProductsToSellingPlanGroup(
  $id: ID!
  $productIds: [ID!]!
) {
  sellingPlanGroupAddProducts(id: $id, productIds: $productIds) {
    sellingPlanGroup {
      id
      products(first: 10) {
        edges {
          node {
            id
            title
          }
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

## Subscription Contract APIs

Subscription contracts represent the agreement between merchant and customer.

### Contract Lifecycle

```
Customer Checkout → Contract Created → Billing Cycles → Renewals/Cancellation
     │                    │                 │                    │
     │                    ▼                 ▼                    ▼
     │           SUBSCRIPTION_CONTRACTS   Billing          Contract
     │              /CREATE webhook      Attempts         Status Change
     └──────────────────────────────────────────────────────────────────
```

### Fetching Subscription Contracts

```graphql
query GetSubscriptionContracts($first: Int!) {
  subscriptionContracts(first: $first) {
    edges {
      node {
        id
        status
        nextBillingDate
        customer {
          id
          email
        }
        lines(first: 10) {
          edges {
            node {
              id
              title
              quantity
              currentPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  }
}
```

### Contract Statuses

| Status | Description |
|--------|-------------|
| `ACTIVE` | Contract is active and will be billed |
| `PAUSED` | Contract is paused (no billing) |
| `CANCELLED` | Contract has been cancelled |
| `EXPIRED` | Contract has reached its end date |
| `FAILED` | Contract failed (payment issues) |

### Updating a Contract

```graphql
mutation UpdateSubscriptionContract($contractId: ID!) {
  subscriptionContractUpdate(contractId: $contractId) {
    draft {
      id
    }
    userErrors {
      field
      message
    }
  }
}
```

Note: Updates to contracts go through a draft → commit workflow.

## Billing Cycle APIs

Manage when subscriptions are billed.

### Fetching Billing Cycles

```graphql
query GetBillingCycles($contractId: ID!, $first: Int!) {
  subscriptionContract(id: $contractId) {
    billingCycles(first: $first) {
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
  }
}
```

### Skipping a Billing Cycle

```graphql
mutation SkipBillingCycle($contractId: ID!, $cycleIndex: Int!) {
  subscriptionBillingCycleSkip(
    subscriptionContractId: $contractId
    billingCycleInput: { selector: { cycleIndex: $cycleIndex } }
  ) {
    billingCycle {
      skipped
    }
    userErrors {
      field
      message
    }
  }
}
```

### Creating a Billing Attempt

```graphql
mutation CreateBillingAttempt($contractId: ID!, $originTime: DateTime!) {
  subscriptionBillingAttemptCreate(
    subscriptionContractId: $contractId
    subscriptionBillingAttemptInput: { originTime: $originTime }
  ) {
    subscriptionBillingAttempt {
      id
      ready
    }
    userErrors {
      field
      message
    }
  }
}
```

### Bulk Billing (Recommended for Production)

```graphql
mutation BulkChargeBillingCycles($subscriptionContractId: ID!, $date: Date!) {
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
    }
  }
}
```

## Customer Payment Method APIs

Access stored payment methods for recurring charges.

### Fetching Customer Payment Methods

```graphql
query GetCustomerPaymentMethods($customerId: ID!) {
  customer(id: $customerId) {
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
            }
          }
        }
      }
    }
  }
}
```

### Sending an Update Payment Method Email

```graphql
mutation SendUpdatePaymentMethodEmail($contractId: ID!) {
  customerPaymentMethodSendUpdateEmail(
    subscriptionContractId: $contractId
  ) {
    customer {
      id
    }
    userErrors {
      field
      message
    }
  }
}
```

## Rate Limits

The GraphQL Admin API has rate limits based on calculated query cost:
- Each field has a cost
- Total cost is the sum of all fields requested
- Limits are per-app per-store

Best practices:
- Request only needed fields
- Use pagination appropriately
- Implement retry logic with exponential backoff

## Error Handling

Always check `userErrors` in mutation responses:

```typescript
const response = await admin.graphql(mutation, { variables });
const { data } = await response.json();

if (data.sellingPlanGroupCreate.userErrors.length > 0) {
  const errors = data.sellingPlanGroupCreate.userErrors;
  // Handle errors
  throw new Error(errors.map(e => e.message).join(', '));
}
```

## Sources

- [About Selling Plans](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/selling-plans)
- [Build a Selling Plan](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/selling-plans/build-a-selling-plan)
- [About Subscription Contracts](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/contracts)
- [Build a Subscription Contract](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/contracts/build-a-subscription-contract)
