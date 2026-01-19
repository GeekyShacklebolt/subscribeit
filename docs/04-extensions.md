# Shopify Subscription App Extensions

Extensions allow your app to integrate directly into Shopify's Admin, checkout, and storefront.

## Types of Extensions

| Extension | Purpose | Location |
|-----------|---------|----------|
| Purchase Options Extension | Create/edit selling plans | Admin product page |
| Theme App Extension | Display subscription options | Storefront product page |
| Checkout UI Extension | Post-purchase information | Thank you page |
| Customer Account Extension | Subscription management | Customer portal |
| POS UI Extension | In-store subscriptions | Shopify POS |

## Important: Extension Migration

**Product subscription app extensions are being deprecated:**

| Date | Status |
|------|--------|
| December 3, 2025 | Sunset begins |
| February 9, 2026 | No longer supported |

**Action Required**: Migrate to the new **Purchase Options Extension**.

## Purchase Options Extension (Admin)

This is the recommended extension for managing selling plans in the Shopify Admin.

### Generate the Extension

```bash
shopify app generate extension \
  --template admin_purchase_option \
  --name purchase-options-action \
  --flavor react
```

### Extension Modes

| Mode | Description |
|------|-------------|
| `Add` | Add an existing purchase option to a product/variant |
| `Create` | Create a new purchase option |
| `Edit` | Edit an existing purchase option |
| `Remove` | Remove a purchase option from a product/variant |

### Basic Structure

```typescript
// extensions/admin-purchase-option/src/ActionExtension.tsx
import { useApi, reactExtension, AdminAction } from '@shopify/ui-extensions-react/admin';

export default reactExtension(
  'admin.product-details.action.render',
  () => <PurchaseOptionAction />
);

function PurchaseOptionAction() {
  const { close, data } = useApi();
  const productId = data?.selected?.[0]?.id;

  return (
    <AdminAction
      title="Manage Subscription"
      primaryAction={{
        content: 'Save',
        onAction: () => handleSave(),
      }}
      secondaryAction={{
        content: 'Cancel',
        onAction: () => close(),
      }}
    >
      {/* Your UI components */}
    </AdminAction>
  );
}
```

## Theme App Extension (Storefront)

Display subscription options on product pages using Online Store 2.0 app blocks.

### Generate the Extension

```bash
shopify app generate extension \
  --template theme_app_extension \
  --name subscription-widget
```

### App Block Structure

```liquid
<!-- extensions/theme-extension/blocks/subscription-selector.liquid -->
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
    }
  ]
}
{% endschema %}

<div class="subscription-widget">
  <h3>{{ block.settings.title }}</h3>

  {% if product.selling_plan_groups.size > 0 %}
    {% for group in product.selling_plan_groups %}
      <div class="selling-plan-group">
        <h4>{{ group.name }}</h4>
        {% for plan in group.selling_plans %}
          <label>
            <input
              type="radio"
              name="selling_plan"
              value="{{ plan.id }}"
              form="product-form-{{ product.id }}"
            >
            {{ plan.name }}
            {% if plan.price_adjustments.size > 0 %}
              - Save {{ plan.price_adjustments[0].value }}%
            {% endif %}
          </label>
        {% endfor %}
      </div>
    {% endfor %}
  {% endif %}
</div>
```

### Important Requirements

- Must use **app blocks** (not snippets) for Online Store 2.0 compatibility
- Subscription info must display: selling plan name, price, and savings
- Must work with all Shopify themes

## Checkout UI Extension (Thank You Page)

Display subscription confirmation and next steps after checkout.

### Generate the Extension

```bash
shopify app generate extension \
  --template checkout_ui \
  --name subscription-confirmation
```

### Extension Target

```typescript
// extensions/checkout-ui/src/Checkout.tsx
import {
  reactExtension,
  Banner,
  useApi,
} from '@shopify/ui-extensions-react/checkout';

export default reactExtension(
  'purchase.thank-you.block.render',
  () => <SubscriptionConfirmation />
);

function SubscriptionConfirmation() {
  const { lines } = useApi();

  const hasSubscription = lines.some(
    line => line.sellingPlanAllocation !== null
  );

  if (!hasSubscription) return null;

  return (
    <Banner title="Subscription Created!">
      You can manage your subscription from your customer account.
    </Banner>
  );
}
```

## Customer Account Extension

Allow customers to manage their subscriptions from their account.

### Integration Points

1. **Customer Account API**: For fetching subscription data
2. **Account UI Extensions**: For rendering management interface

### Key Features Required

- Display all active subscriptions
- Show subscription details (products, frequency, price, next delivery)
- Allow customers to:
  - Cancel subscriptions
  - Update payment methods
  - Skip deliveries
  - Change frequency

```typescript
// Example: Customer Account UI Extension
import {
  reactExtension,
  useApi,
  Page,
  ResourceList,
  ResourceItem,
} from '@shopify/ui-extensions-react/customer-account';

export default reactExtension(
  'customer-account.page.render',
  () => <SubscriptionsPage />
);

function SubscriptionsPage() {
  const { customerSubscriptions } = useSubscriptionData();

  return (
    <Page title="My Subscriptions">
      <ResourceList>
        {customerSubscriptions.map(subscription => (
          <ResourceItem
            key={subscription.id}
            title={subscription.productTitle}
            subtitle={`Next delivery: ${subscription.nextBillingDate}`}
          />
        ))}
      </ResourceList>
    </Page>
  );
}
```

## POS UI Extension

Enable in-store subscription sales via Shopify POS.

### Requirements

- POS UI extensions version 2025-10+
- Shopify POS version 10.15+

### Generate the Extension

```bash
shopify app generate extension \
  --template pos_ui_extension \
  --name pos-subscription
```

## Extension Configuration

Extensions are configured in `shopify.app.toml`:

```toml
[extensions]
[[extensions.checkout_ui]]
  name = "subscription-confirmation"
  type = "checkout_ui_extension"

[[extensions.theme]]
  name = "subscription-widget"
  type = "theme_app_extension"

[[extensions.admin]]
  name = "purchase-options"
  type = "admin_purchase_option_extension"
```

## Testing Extensions

```bash
# Start development server with extensions
shopify app dev

# Extensions will automatically load in the dev store
```

### Preview URLs

The CLI provides preview URLs for testing each extension type in the appropriate context.

## Sources

- [Subscription Extensions](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/subscriptions-app/extensions)
- [About Product Subscription App Extensions](https://shopify.dev/docs/apps/build/purchase-options/product-subscription-app-extensions)
- [Start Building Purchase Options Extensions](https://shopify.dev/docs/apps/build/purchase-options/purchase-options-extensions/start-building)
- [Core Shopify Subscriptions Reference App Components](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/subscriptions-app/core-system-components)
