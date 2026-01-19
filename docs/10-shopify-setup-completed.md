# Shopify Dashboard Setup - Completed

This document summarizes the Shopify Partner Dashboard and store setup completed for the SubscribeIt subscription app.

## App Details

| Field | Value |
|-------|-------|
| App Name | subscribe-it |
| Client ID | `5a2f9738ab594fed7f930672192e88b2` |
| Distribution | Custom (single organization) |
| Active Version | subscribe-it-2 |
| Created | January 19, 2026 |

## Development Store

| Field | Value |
|-------|-------|
| Store Name | test-subscribe-it |
| Store URL | test-subscribe-it.myshopify.com |

## API Scopes

### Approved Scopes (Subscriptions APIs)

These scopes were approved immediately via "Subscriptions APIs" access:

| Scope | Status | Purpose |
|-------|--------|---------|
| `read_customer_payment_methods` | Approved | Access vaulted payment methods for recurring charges |
| `write_own_subscription_contracts` | Approved | Create and manage subscription contracts |
| `read_own_subscription_contracts` | Approved | Read subscription contract data |

### Pending Approval

| Scope | Status | Purpose |
|-------|--------|---------|
| `read_all_orders` | Pending | Access all orders (not just last 60 days) |

### Standard Scopes (Add to app version)

These can be added without approval:

```
write_products, read_products, read_customers, write_customers
```

### Network Access

- **Allow network access in checkout and account UI extensions**: Enabled

## Setup Steps Completed

### 1. Partner Account
- [x] Created Shopify Partner account

### 2. Development Store
- [x] Created development store: `test-subscribe-it.myshopify.com`

### 3. App Creation
- [x] Created app via Partner Dashboard → Apps → Create app
- [x] Selected "Start from Dev Dashboard" option
- [x] Named app "subscribe-it"

### 4. Distribution Model
- [x] Set distribution to "Custom"
- [x] Linked to test-subscribe-it.myshopify.com organization
- [x] Generated custom install link

### 5. Protected Scopes
- [x] Requested Subscriptions APIs access (approved)
- [x] Requested `read_all_orders` (pending)
- [x] Enabled network access for checkout/account UI extensions

### 6. App Versions
- [x] Released subscribe-it-1 (11:56 am)
- [x] Released subscribe-it-2 (12:00 pm) - Active

## Next Steps (Development Store)

Before testing the app, complete these steps in the development store admin:

### Enable Customer Accounts
1. Go to store admin → Settings → Customer accounts
2. Enable "New customer accounts"

### Set Up Test Payment Provider
1. Settings → Payments
2. Enable Shopify Payments (test mode) or Bogus Gateway

### Create Test Products
1. Products → Add product
2. Create 2-3 test products for subscription testing

### Create Test Customers
1. Customers → Add customer
2. Create test customers with emails you control

## Connecting the Code

When the coding agent runs the app, use these credentials:

```env
SHOPIFY_API_KEY=5a2f9738ab594fed7f930672192e88b2
SHOPIFY_API_SECRET=<get from Partner Dashboard → Apps → subscribe-it → Settings>
```

### CLI Commands

```bash
# Link local project to this app
shopify app config link

# Start development server
shopify app dev

# Deploy extensions
shopify app deploy
```

## Install Link

Custom install link for the app:
```
https://admin.shopify.com/oauth/install_custom_app?client_id=5a2f9738ab594fed7f930672192e88b2
```

## Useful Dashboard Links

- Partner Dashboard: https://partners.shopify.com
- App Settings: Partner Dashboard → Apps → subscribe-it → Settings
- API Access: Partner Dashboard → Apps → subscribe-it → Versions → (select version)
- Dev Store Admin: https://admin.shopify.com/store/test-subscribe-it

## Test Payment Cards

| Card Number | Result |
|-------------|--------|
| `4242424242424242` | Success |
| `4000000000000002` | Always declines (for dunning tests) |

Use any future expiry date and any 3-digit CVV.
