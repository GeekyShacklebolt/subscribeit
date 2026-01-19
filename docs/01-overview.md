# Shopify Subscription App - Overview

## What is a Shopify Subscription App?

A Shopify subscription app enables merchants to sell products on a recurring basis. Customers can subscribe to receive products at regular intervals (weekly, monthly, etc.) without manually placing orders each time.

## Core Concepts

### Selling Plans
Selling plans define how a product can be purchased. They specify:
- Delivery frequency (e.g., every 2 weeks, monthly)
- Pricing policy (discounts for subscribers, fixed prices)
- Billing policy (when to charge customers)

Selling plans are organized into **Selling Plan Groups**, which represent a collection of related purchase options.

### Subscription Contracts
A subscription contract is the agreement between a merchant and customer created when a customer purchases a product with a selling plan. Key points:
- Created automatically by Shopify when a subscription is purchased through checkout
- Contains details about what the customer subscribed to, payment terms, and delivery schedule
- Detached from the original selling plan (updates to selling plans don't modify existing contracts)

### Billing Cycles
Billing cycles represent when charges occur for a subscription:
- Apps are responsible for initiating billing attempts
- Billing attempts can succeed (order created) or fail (requires retry logic)
- The Billing Cycle API allows modifications like skipping deliveries

### Customer Payment Methods
Stored payment methods that allow future charges without requiring customers to go through checkout again:
- Permission to "vault" the payment method is requested during initial checkout
- Apps can use these for automatic subscription renewals

## Key APIs

| API | Purpose |
|-----|---------|
| Selling Plan API | Create and manage purchase options for products |
| Subscription Contract API | Manage subscription agreements and lifecycle |
| Billing Cycle API | Handle billing schedules, skip deliveries, combine shipments |
| Customer Payment Method API | Access stored payment methods for renewals |

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Shopify Platform                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Selling Plan │  │ Subscription │  │ Customer Payment     │  │
│  │    APIs      │  │ Contract APIs│  │ Method APIs          │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                           │                                     │
│                      GraphQL Admin API                          │
└─────────────────────────────────────────────────────────────────┘
                            │
                    Webhooks │ API Calls
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Your Subscription App                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Remix +    │  │   Prisma +   │  │   Job Scheduler      │  │
│  │   React UI   │  │   SQLite DB  │  │   (Billing Jobs)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Extensions                            │   │
│  │  • Purchase Options Extension (Admin UI)                 │   │
│  │  • Checkout UI Extension (Thank You Page)                │   │
│  │  • Customer Account Extension (Portal)                   │   │
│  │  • Theme App Extension (Product Pages)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Merchant Storefront                        │
├─────────────────────────────────────────────────────────────────┤
│  • Product pages with subscription options                      │
│  • Cart with selling plan details                               │
│  • Checkout with subscription confirmation                      │
│  • Customer portal for subscription management                  │
└─────────────────────────────────────────────────────────────────┘
```

## Sales Channels Supported

Subscriptions can be sold through:
- **Online Store**: Customers purchase through the merchant's storefront
- **Shopify POS**: Merchants can sell subscriptions in physical stores (requires POS UI extension)

## Important Dates & Deadlines

| Date | Change |
|------|--------|
| October 1, 2024 | REST Admin API marked as legacy |
| April 1, 2025 | All new public apps must use GraphQL Admin API exclusively |
| December 3, 2025 | Product subscription app extension sunset begins |
| February 9, 2026 | Product subscription app extensions no longer supported |

## Sources

- [About Subscriptions - Shopify.dev](https://shopify.dev/docs/apps/build/purchase-options/subscriptions)
- [Introducing Shopify Subscription APIs](https://www.shopify.com/partners/blog/shopify-subscription-apis)
- [Model a Subscriptions Solution](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/model-subscriptions-solution)
