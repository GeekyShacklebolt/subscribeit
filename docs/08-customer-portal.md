# Customer Portal for Subscription Management

The customer portal is a required component that allows customers to view and manage their subscriptions.

## Requirements

### Access Points

The portal must be accessible from:
- Order status page
- Post-purchase confirmation emails
- Customer account page

### Single Sign-On

Customers must use a **single login** to access:
- Subscription management
- Order history
- Account settings

## Customer Account API

Shopify's Customer Account API enables authenticated customer experiences.

### Key Features

- View orders
- Manage profile
- Access subscriptions
- Handle returns

### Rate Limits

| Limit | Value |
|-------|-------|
| Cost points per store/customer | 7,500 |

### Authentication Flow

```
Customer clicks "Manage Subscription"
            │
            ▼
    Shopify Login Page
            │
            ▼
    Customer authenticated
            │
            ▼
    Redirect to your portal
    (with customer token)
            │
            ▼
    Fetch subscription data
    using Customer Account API
```

## Building the Customer Portal

### Option 1: Customer Account UI Extension

Integrate directly into Shopify's customer account pages:

```typescript
// extensions/customer-account/src/SubscriptionPage.tsx
import {
  reactExtension,
  Page,
  BlockStack,
  Card,
  Text,
  Button,
  useApi,
  useSubscriptions,
} from '@shopify/ui-extensions-react/customer-account';

export default reactExtension(
  'customer-account.page.render',
  () => <SubscriptionManagement />
);

function SubscriptionManagement() {
  const { subscriptions, loading } = useSubscriptions();

  if (loading) {
    return <Text>Loading subscriptions...</Text>;
  }

  return (
    <Page title="My Subscriptions">
      <BlockStack gap="400">
        {subscriptions.length === 0 ? (
          <Card>
            <Text>You have no active subscriptions.</Text>
          </Card>
        ) : (
          subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
            />
          ))
        )}
      </BlockStack>
    </Page>
  );
}

function SubscriptionCard({ subscription }) {
  return (
    <Card>
      <BlockStack gap="200">
        <Text variant="headingMd">{subscription.productTitle}</Text>
        <Text>Status: {subscription.status}</Text>
        <Text>Next delivery: {subscription.nextBillingDate}</Text>
        <Text>Price: {subscription.price}</Text>

        <BlockStack direction="horizontal" gap="200">
          <Button onPress={() => handleSkip(subscription.id)}>
            Skip Next Delivery
          </Button>
          <Button onPress={() => handleUpdatePayment(subscription.id)}>
            Update Payment
          </Button>
          <Button
            onPress={() => handleCancel(subscription.id)}
            tone="critical"
          >
            Cancel Subscription
          </Button>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
```

### Option 2: Standalone Portal

Build a separate portal page in your app:

```typescript
// app/routes/portal.$customerId.tsx
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { authenticate } from "~/shopify.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { admin, session } = await authenticate.public(request);

  // Fetch customer's subscriptions
  const response = await admin.graphql(`
    query GetCustomerSubscriptions($customerId: ID!) {
      customer(id: $customerId) {
        id
        email
        subscriptionContracts(first: 50) {
          edges {
            node {
              id
              status
              nextBillingDate
              lines(first: 10) {
                edges {
                  node {
                    title
                    quantity
                    currentPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
              deliveryPolicy {
                interval
                intervalCount
              }
            }
          }
        }
      }
    }
  `, {
    variables: { customerId: `gid://shopify/Customer/${params.customerId}` }
  });

  const { data } = await response.json();
  return json({ customer: data.customer });
}

export default function CustomerPortal() {
  const { customer } = useLoaderData<typeof loader>();

  return (
    <div className="customer-portal">
      <h1>My Subscriptions</h1>
      {customer.subscriptionContracts.edges.map(({ node }) => (
        <SubscriptionCard key={node.id} subscription={node} />
      ))}
    </div>
  );
}
```

## Required Portal Features

### 1. View All Subscriptions

Display all customer subscriptions with:
- Product name and image
- Delivery frequency
- Price per delivery
- Next delivery date
- Status (Active, Paused, Cancelled)

### 2. Subscription Details

For each subscription, show:
- Full product details
- Billing schedule
- Order history
- Payment method (masked)

### 3. Skip Delivery

Allow customers to skip upcoming deliveries:

```typescript
async function skipDelivery(contractId: string, cycleIndex: number) {
  const response = await admin.graphql(`
    mutation SkipBillingCycle($contractId: ID!, $cycleIndex: Int!) {
      subscriptionBillingCycleSkip(
        subscriptionContractId: $contractId
        billingCycleInput: {
          selector: { cycleIndex: $cycleIndex }
        }
      ) {
        billingCycle {
          skipped
          billingAttemptExpectedDate
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: { contractId, cycleIndex }
  });

  return response.json();
}
```

### 4. Update Payment Method

Send payment update email to customer:

```typescript
async function sendPaymentUpdateEmail(contractId: string) {
  const response = await admin.graphql(`
    mutation SendPaymentUpdateEmail($contractId: ID!) {
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
  `);

  return response.json();
}
```

### 5. Cancel Subscription

```typescript
async function cancelSubscription(contractId: string) {
  // First create a draft
  const draftResponse = await admin.graphql(`
    mutation CreateDraft($contractId: ID!) {
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
  `, { variables: { contractId } });

  const { data: draftData } = await draftResponse.json();
  const draftId = draftData.subscriptionContractUpdate.draft.id;

  // Update status to cancelled
  await admin.graphql(`
    mutation UpdateDraft($draftId: ID!) {
      subscriptionDraftUpdate(
        draftId: $draftId
        input: { status: CANCELLED }
      ) {
        draft {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `, { variables: { draftId } });

  // Commit the draft
  const commitResponse = await admin.graphql(`
    mutation CommitDraft($draftId: ID!) {
      subscriptionDraftCommit(draftId: $draftId) {
        contract {
          id
          status
        }
        userErrors {
          field
          message
        }
      }
    }
  `, { variables: { draftId } });

  return commitResponse.json();
}
```

### 6. Change Frequency (Optional Enhancement)

Allow customers to change delivery frequency:

```typescript
async function changeFrequency(
  contractId: string,
  interval: "DAY" | "WEEK" | "MONTH" | "YEAR",
  intervalCount: number
) {
  // Create draft
  // Update delivery policy
  // Commit draft
}
```

## Portal UI Example (Polaris)

```typescript
import {
  Page,
  Layout,
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Button,
  Modal,
} from "@shopify/polaris";

function CustomerSubscriptions({ subscriptions }) {
  return (
    <Page title="My Subscriptions">
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList
              items={subscriptions}
              renderItem={(subscription) => (
                <ResourceItem
                  id={subscription.id}
                  accessibilityLabel={`View ${subscription.productTitle}`}
                >
                  <div className="subscription-item">
                    <div className="subscription-info">
                      <Text variant="headingMd">
                        {subscription.productTitle}
                      </Text>
                      <Text variant="bodyMd" color="subdued">
                        Every {subscription.intervalCount}{" "}
                        {subscription.interval.toLowerCase()}s
                      </Text>
                      <Text variant="bodyMd">
                        {subscription.price.amount}{" "}
                        {subscription.price.currencyCode}
                      </Text>
                    </div>

                    <div className="subscription-status">
                      <Badge
                        status={
                          subscription.status === "ACTIVE"
                            ? "success"
                            : "warning"
                        }
                      >
                        {subscription.status}
                      </Badge>
                      <Text>
                        Next delivery:{" "}
                        {formatDate(subscription.nextBillingDate)}
                      </Text>
                    </div>

                    <div className="subscription-actions">
                      <Button onClick={() => handleSkip(subscription.id)}>
                        Skip
                      </Button>
                      <Button onClick={() => handleManage(subscription.id)}>
                        Manage
                      </Button>
                    </div>
                  </div>
                </ResourceItem>
              )}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
```

## Email Links to Portal

Include portal links in transactional emails:

```liquid
{# In order confirmation email #}
{% if order.has_subscription %}
  <a href="{{ shop.url }}/apps/your-app/portal/{{ customer.id }}">
    Manage your subscription
  </a>
{% endif %}
```

## Testing the Portal

1. Create a test subscription in your dev store
2. Access the portal as the test customer
3. Verify all features work:
   - View subscription list
   - View individual subscription details
   - Skip delivery
   - Update payment method
   - Cancel subscription

## Sources

- [Customer Account API Reference](https://shopify.dev/docs/api/customer)
- [Customer Account UI Extensions API](https://shopify.dev/docs/api/customer-account-ui-extensions/latest/apis/customer-account-api)
- [Build a Personalized Headless Experience with Customer Account API](https://www.shopify.com/partners/blog/introducing-customer-account-api-for-headless-stores)
