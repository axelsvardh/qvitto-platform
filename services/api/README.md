# qvitto-backend

Express 5, Prisma 6 and PostgreSQL.

## Setup
1. Create `.env` from the template below and fill it in.
2. `npm install` from the repo root.
3. `npm run api` from the repo root.

## Environment
The server **refuses to start** without these, and there are no defaults:

| Variable | What it is |
|---|---|
| `JWT_SECRET` | Signs customer login tokens. |
| `POS_API_KEY` | The key a till sends as `x-api-key` to `POST /api/pos/receipts`. |
| `PSP_API_KEY` | The key for `POST /api/psp/webhook`. |

Generate each one with `openssl rand -hex 32`, and use different values in every environment.

Everything else in the template is optional. Each integration (Braintree, Stripe, Zettle) answers with an error until its secret is set.

`ENABLE_DEV_ENDPOINTS=true` turns on the test-payment and simulated bank feed endpoints, which need `POS_API_KEY`. Keep it off anywhere public.

### `.env` template
```dotenv
# Required: the server refuses to start without these.
JWT_SECRET=
POS_API_KEY=
PSP_API_KEY=

DATABASE_URL=postgresql://user:password@localhost:5432/qvitto
PORT=4000

# Optional. Each integration answers with an error until its secret is set.
BRAINTREE_CHARGE_API_KEY=
BRAINTREE_MERCHANT_ID=
BRAINTREE_PUBLIC_KEY=
BRAINTREE_PRIVATE_KEY=
BRAINTREE_GRAPHQL_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
ZETTLE_WEBHOOK_SHARED_SECRET=

# Dev-only endpoints (test payments, simulated bank feed). Never on anywhere public.
ENABLE_DEV_ENDPOINTS=false
```

## Tools
- `scripts/`: read the same keys from the environment, e.g. `POS_API_KEY=... PSP_API_KEY=... node scripts/simulate-pos-psp.js`.
- Postman: set a `posApiKey` variable in your Postman environment to your local `POS_API_KEY`.

## Tests
`npm test` (vitest). Prisma is mocked, so no database is needed.
