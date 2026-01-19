# Getting Started with Shopify Subscription App Development

## Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18.20+ required, v20.10+ recommended for latest Polaris)
2. **Shopify Partner Account** - [Create one here](https://partners.shopify.com/signup)
3. **Test Store** - A development store or Shopify Plus sandbox store
4. **Shopify CLI** - Install via npm: `npm install -g @shopify/cli`

## Option 1: Start from Shopify's Reference App (Recommended)

Shopify provides a complete subscription reference app that you can use as a starting point:

```bash
shopify app init --template https://github.com/Shopify/subscriptions-reference-app
```

This clones the Shopify Subscription App repository and installs all dependencies.

### What's Included in the Reference App

- **Framework**: Remix with React
- **Database**: SQLite with Prisma ORM
- **Authentication**: Shopify App Remix package
- **UI Components**: Polaris design system
- **App Bridge**: Seamless Shopify Admin integration

### Important Note for App Store Submission

If you're building for the Shopify App Store using the reference app, your submission must be **substantively different** from the reference app to provide added value for merchants.

## Option 2: Start from Scratch with Remix Template

```bash
# Create a new Shopify app
shopify app init

# Select "Start with Remix (recommended)"
# Choose your preferred language (JavaScript or TypeScript)
```

## Required API Access Scopes

You must request these access scopes in your Partner Dashboard under **API access**:

### Protected Scopes (Require Application)

| Scope | Description |
|-------|-------------|
| `read_customer_payment_methods` | Read customer stored payment methods |
| `write_own_subscription_contracts` | Create/update subscription contracts your app owns |
| `read_own_subscription_contracts` | Read subscription contracts your app owns |

### Standard Scopes

| Scope | Description |
|-------|-------------|
| `write_products` | Required for creating selling plans |
| `read_all_orders` | Access to read all orders (for subscription orders) |

## Applying for Protected Scopes

1. Go to your Partner Dashboard
2. Navigate to your app's **API access** section
3. Request access to the protected scopes
4. Provide justification for why your app needs these scopes
5. Wait for Shopify approval (typically a few business days)

## Project Structure (Reference App)

```
├── app/
│   ├── routes/                    # Remix routes
│   │   ├── app._index.tsx         # Main dashboard
│   │   ├── app.contracts.tsx      # Subscription contracts
│   │   └── app.settings.tsx       # App settings
│   ├── components/                # React components
│   ├── graphql/                   # GraphQL queries/mutations
│   ├── jobs/                      # Background jobs (billing)
│   ├── models/                    # Data models
│   └── utils/                     # Utility functions
├── extensions/
│   ├── admin-purchase-option/     # Purchase options extension
│   ├── checkout-ui/               # Checkout UI extension
│   └── theme-extension/           # Theme app extension
├── prisma/
│   └── schema.prisma              # Database schema
├── shopify.app.toml               # App configuration
└── package.json
```

## Local Development

```bash
# Start development server
shopify app dev
```

This command:
- Logs into your Partner account
- Connects to your app
- Provides environment variables
- Creates a tunnel for webhooks
- Enables hot reloading

## Database Setup

The reference app uses Prisma with SQLite by default:

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio
```

### Production Database Considerations

SQLite works for single-instance deployments. For production at scale, consider:
- PostgreSQL
- MySQL
- MongoDB (with appropriate Prisma adapter)

## GraphQL Type Generation

The reference app uses GraphQL Codegen for type safety:

```bash
# Generate TypeScript types from Shopify's schema
npm run graphql-codegen
```

Configuration is in `.graphqlrc.ts`.

## Environment Variables

Key environment variables (automatically set by `shopify app dev`):

```env
SHOPIFY_API_KEY=your_api_key
SHOPIFY_API_SECRET=your_api_secret
SCOPES=write_products,read_customer_payment_methods,...
HOST=your_tunnel_url
```

## Next Steps

1. [Understand the Core APIs](./03-core-apis.md)
2. [Build Extensions](./04-extensions.md)
3. [Implement Webhooks](./05-webhooks.md)
4. [App Store Requirements](./06-app-store-requirements.md)

## Sources

- [Build a Shopify app using Remix](https://shopify.dev/docs/apps/build/build?framework=remix)
- [Building a Subscriptions App](https://shopify.dev/docs/apps/build/purchase-options/subscriptions/subscriptions-app/start-building)
- [GitHub: Shopify Subscription Reference App](https://github.com/Shopify/subscriptions-reference-app)
- [GitHub: Shopify App Template Remix](https://github.com/Shopify/shopify-app-template-remix)
