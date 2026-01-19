# Shopify App Store Requirements for Subscription Apps

To publish a subscription app on the Shopify App Store, you must meet specific requirements.

## API Access Requirements

### Protected Scopes

You must apply for access to these protected scopes:

| Scope | Required |
|-------|----------|
| `read_customer_payment_methods` | Yes |
| `write_own_subscription_contracts` | Yes |
| `read_own_subscription_contracts` | Yes |

**Important**: Only request scopes that are necessary for your app to function. If you request `write..._contracts` scopes, you may need to provide evidence of necessity.

### API Usage Rules

- Apps must use the Selling Plan and Subscription Contract APIs properly
- Use only authorized selling plan types: subscriptions, pre-orders, try-before-you-buy
- **Prohibited use cases**: installments, layaways, crowdfunding campaigns

## Storefront Requirements

### Product Page

Display subscription information clearly:
- Selling plan name
- Price
- Savings amount (if applicable)

```liquid
{# Example: Required information display #}
{% for selling_plan in product.selling_plan_groups.first.selling_plans %}
  <div class="selling-plan-option">
    <span class="plan-name">{{ selling_plan.name }}</span>
    <span class="plan-price">{{ selling_plan.price | money }}</span>
    {% if selling_plan.price_adjustments.first %}
      <span class="plan-savings">
        Save {{ selling_plan.price_adjustments.first.value }}%
      </span>
    {% endif %}
  </div>
{% endfor %}
```

### Cart Page

- Must display the selling plan name in cart
- Name identifies the product's purchase option and details

### Online Store 2.0 Compatibility

- Use **app blocks** for theme integration
- Must be compatible with all Shopify themes
- Cannot use hard-coded snippets

## Admin Integration Requirements

### Product Extension

Apps must implement the product extension to allow merchants to:
- Create selling plans from the Admin product page
- Choose which products are subscriptions
- Remove products from selling plans

### Navigation

Provide direct links from your app to:
- Orders in Shopify Admin
- Customers in Shopify Admin

## Customer Portal Requirements

### Portal Access

- Must be accessible from the order status page
- Must be accessible from post-purchase emails
- Must use single login (integrated with Shopify customer accounts)

### Portal Features (Required)

| Feature | Requirement |
|---------|-------------|
| Display subscriptions | Show all active subscriptions |
| Subscription details | Products, delivery frequency, price, schedule |
| Cancel subscription | Allow customers to cancel |
| Update payment method | Allow payment method changes |

```typescript
// Example: Minimum portal functionality
interface CustomerPortalRequirements {
  // View all subscriptions
  listSubscriptions(): Subscription[];

  // View subscription details
  getSubscriptionDetails(id: string): {
    products: Product[];
    deliveryFrequency: string;
    price: Money;
    nextDeliveryDate: Date;
    schedule: BillingSchedule;
  };

  // Customer actions
  cancelSubscription(id: string): void;
  updatePaymentMethod(id: string): void;
}
```

## Multi-Currency Support

- Pricing and discounts must display correctly in all currencies
- **Do not hard-code** prices in plan names or descriptions

```typescript
// BAD: Hard-coded price
const planName = "Subscribe for $9.99/month";

// GOOD: Dynamic pricing
const planName = "Monthly Subscription";
// Price shown separately using Shopify's currency formatting
```

## Checkout Integration

### Subscription Checkout Extension

Implement a checkout UI extension for the thank you page:
- Render after customer checks out with a subscription
- Allow navigation to customer account
- Show subscription details

## App Store Submission Checklist

### Before Submission

- [ ] Protected scopes approved
- [ ] Selling plan name visible on product page
- [ ] Selling plan name visible in cart
- [ ] Price and savings displayed correctly
- [ ] Product extension implemented
- [ ] Customer portal accessible
- [ ] Portal shows all subscriptions
- [ ] Cancel functionality works
- [ ] Payment update functionality works
- [ ] Multi-currency tested
- [ ] Online Store 2.0 app blocks work
- [ ] Links to Admin orders/customers exist

### Reference App Users

If building from the Shopify Subscriptions Reference App:
- Your app must be **substantively different**
- Must provide **added value** for merchants
- Cannot be a direct clone

## Prohibited Actions

| Action | Status |
|--------|--------|
| Using APIs for installments | Prohibited |
| Using APIs for layaways | Prohibited |
| Using APIs for crowdfunding | Prohibited |
| Hard-coding prices | Prohibited |
| Missing customer portal | Prohibited |
| Unclear subscription terms | Prohibited |

## "Built for Shopify" Badge

To earn the "Built for Shopify" badge, meet additional requirements:

- Meet all standard App Store requirements
- Exceptional merchant experience
- High-quality code and performance
- Comprehensive documentation
- Excellent support

See [Built for Shopify Requirements](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements) for full details.

## Extension Migration Timeline

| Date | Action Required |
|------|-----------------|
| Now | Start building with Purchase Options Extension |
| December 3, 2025 | Product subscription app extension sunset begins |
| February 9, 2026 | Old extensions no longer supported |

## Testing Requirements

Before submission, test:

1. **Happy path**: Customer subscribes, receives products
2. **Payment failures**: Proper handling and customer notification
3. **Cancellation**: Customer can cancel
4. **Payment updates**: Customer can update payment method
5. **Multi-currency**: Prices display correctly
6. **Theme compatibility**: Works with multiple themes

## Review Process

1. Submit app for review
2. Shopify reviews against requirements
3. May request changes or additional evidence
4. Approval or rejection with feedback

Typical review time: 2-4 weeks (varies)

## Sources

- [App Store Requirements](https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements)
- [Checklist of Requirements](https://shopify.dev/docs/apps/launch/app-requirements-checklist)
- [Built for Shopify Requirements](https://shopify.dev/docs/apps/launch/built-for-shopify/requirements)
- [Introducing the Shopify Subscriptions Reference App](https://www.shopify.com/partners/blog/introducing-the-shopify-subscriptions-reference-app)
