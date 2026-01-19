# Shopify Subscription App Documentation

This documentation covers everything you need to know to build a Shopify subscription app.

## Table of Contents

1. [Overview](./01-overview.md) - Core concepts, architecture, and key APIs
2. [Getting Started](./02-getting-started.md) - Prerequisites, setup, and project structure
3. [Core APIs](./03-core-apis.md) - Selling Plans, Subscription Contracts, Billing Cycles
4. [Extensions](./04-extensions.md) - Admin, Theme, Checkout, and Customer Account extensions
5. [Webhooks](./05-webhooks.md) - Event handling, billing attempts, and dunning
6. [App Store Requirements](./06-app-store-requirements.md) - Compliance checklist for publishing
7. [Data Architecture](./07-data-architecture.md) - Database design, metaobjects, and syncing
8. [Customer Portal](./08-customer-portal.md) - Building the subscription management portal
9. [Next Steps](./09-next-steps.md) - Development roadmap and differentiation ideas
10. [Test Cases](./10-test-cases.md) - Comprehensive test cases for QA and validation

## Quick Start

```bash
# Clone the reference app
shopify app init --template https://github.com/Shopify/subscriptions-reference-app

# Install dependencies
npm install

# Start development
shopify app dev
```

## Key Concepts Summary

| Concept | Description |
|---------|-------------|
| **Selling Plan** | Defines how a product can be purchased (frequency, pricing, policies) |
| **Subscription Contract** | Agreement created when customer purchases a subscription |
| **Billing Cycle** | Individual billing period within a subscription |
| **Billing Attempt** | Attempt to charge customer for a billing cycle |

## Required Access Scopes

```
read_customer_payment_methods
write_own_subscription_contracts
read_own_subscription_contracts
write_products
```

## Important Dates

| Date | Event |
|------|-------|
| April 1, 2025 | New public apps must use GraphQL Admin API exclusively |
| December 3, 2025 | Product subscription app extension sunset begins |
| February 9, 2026 | Old extensions no longer supported |

## Technology Stack (Reference App)

- **Framework**: Remix
- **UI**: React + Polaris
- **Database**: Prisma + SQLite
- **API**: GraphQL Admin API
- **Auth**: Shopify App Remix

## External Resources

- [Official Shopify Subscriptions Docs](https://shopify.dev/docs/apps/build/purchase-options/subscriptions)
- [Reference App GitHub](https://github.com/Shopify/subscriptions-reference-app)
- [GraphQL Admin API Reference](https://shopify.dev/docs/api/admin-graphql)
- [App Store Requirements](https://shopify.dev/docs/apps/launch/app-requirements-checklist)
