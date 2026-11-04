# 001: Business accounts and store access

Status: READY FOR REVIEW (open questions answered 2026-10-16, approved when the PR is merged)
Owner: Axel

## Why
The business app needs to know who a business is, which stores it has, and which receipts belong to which store. Today the backend only knows customers:
- Receipts have a free-text `merchant` field and no link to a store.
- Every till shares one global POS API key, so we can't tell which store sent a receipt.
- `GET /api/users` is open to anyone and returns every customer, including password hashes.

Nothing else in the business app can be built until a store owns its receipts, and that leak has to close before any pilot store connects.

## Goal
A store owner can create a business account, add their store, connect their till with a store API key, and invite staff. Each receipt the till sends then belongs to that store, and only that organisation's people can see it.

## Out of scope (later specs)
- All business app screens, including login. This spec is backend only, and the app shell comes in a later spec.
- Self-service org-number verification or BankID. For the pilot, a Qvitto admin activates organisations by hand.
- Billing and pricing.
- Companies that collect receipts for bookkeeping (option B).
- Moving money to integer öre (its own spec, see constitution §4).

## User stories
1. As a **store owner**, I sign up with my organisation's name and org number, so my business has a Qvitto account.
2. As a **Qvitto admin**, I activate a new organisation, so only businesses we've checked can send receipts during the pilot.
3. As a **store owner**, I add my store (name and address), so receipts can belong to it.
4. As a **store owner**, I create and revoke API keys for my store's till, so I control what can send receipts in my name.
5. As a **store owner**, I invite staff and choose which stores they can see.
6. As a **POS**, I send receipts with my store's API key, and they are filed under that store.
7. As a **customer**, I trust that a store never sees my name, email or card through Qvitto.

## Acceptance criteria

### Sign-up and activation
- **AC1**: Given a new email, when someone signs up with name, email, password, organisation name and a valid-format org number (NNNNNN-NNNN), then a business user, an organisation with status `PENDING` and an `OWNER` membership are created.
- **AC2**: Given an org number that is already registered, when someone signs up with it, then the request is rejected (409) and nothing is created.
- **AC3**: Given an email that already belongs to a business user, when someone signs up with it, then the request is rejected (409).
- **AC4**: Given an organisation is `PENDING`, when its till sends a receipt, then it is rejected (403) and nothing is saved.
- **AC5**: Given an admin activates an organisation, then its status becomes `ACTIVE` and its stores can send receipts.

### Stores and API keys
- **AC6**: Given an owner, when they create a store with a name and address, then the store belongs to their organisation.
- **AC7**: Given an owner, when they create an API key for their store, then the full key is shown once and only a hash is stored. A key prefix (e.g. `qv_live_ab12…`) can be shown later.
- **AC8**: Given a revoked key, when a till uses it, then the request is rejected (401) and nothing is saved.
- **AC9**: Given a valid key for store S, when the till sends a receipt, then the receipt is saved with `storeId = S`, regardless of any store or merchant name in the request body.
- **AC10**: Given the global `POS_API_KEY`, when a till uses it after this spec ships, then the request is rejected (401).

### Staff and access
- **AC11**: Given an owner, when they invite an email as `STAFF` with access to stores [A], then that person can log in after accepting and can see store A only.
- **AC12**: Given a staff member with access to store A, when they ask for store B's receipts (same or other organisation), then the API answers 404.
- **AC13**: Given a staff member, when they try to create stores, API keys or invites, then the API answers 403.
- **AC14**: Given a business user, when they look at a receipt, then the response has the receipt items, totals, time, store and match status, and nothing about the customer (no name, email, user id or card details).

### Separation and security
- **AC15**: Given a customer token, when it is used on any `/api/business/*` endpoint, then the API answers 401/403. The same goes the other way: a business token on customer endpoints.
- **AC16**: `GET /api/users` is removed. No endpoint returns password hashes, including the customer `POST /api/register` response, which returns one today.
- **AC17**: Given `JWT_SECRET` is not set, when the server starts, then it refuses to start. There is no hard-coded fallback.

## Data (conceptual, the plan decides the details)
- **Organisation**: name, orgNumber (unique), status (`PENDING` | `ACTIVE` | `SUSPENDED`), createdAt
- **Store**: organisationId, name, address, createdAt
- **BusinessUser**: name, email (unique), passwordHash, createdAt
- **Membership**: businessUserId, organisationId, role (`OWNER` | `STAFF`), storeIds (for staff)
- **StoreApiKey**: storeId, prefix, hash, createdAt, revokedAt
- **Receipt**: gains `storeId`. Existing test receipts without a store are linked to a seeded "Legacy test store", or deleted if they're only test data.

Personal data touched: business user name and email. No new customer data.

## Decisions (answered by Axel, 2026-10-16)
1. **Separate login for business users: yes.** `BusinessUser` is its own account type with its own login and token. One person can still have both a customer and a business account.
2. **Admin activation by hand: yes.** For the pilot it's a script run by a Qvitto admin. There is no admin UI or endpoint.
3. **Several organisations per business user: yes.** An organisation can have several stores, and a business user can be a member of several organisations, with a different role in each. API calls name the organisation in the path, so access is always checked against that one membership.
4. **Existing receipts are test data:** they're deleted in the migration that makes `Receipt.storeId` required.

### Added from the decisions
- **AC18**: Given a business user who is `OWNER` in organisation X and `STAFF` in organisation Y, when they call Y's owner-only endpoints, then the API answers 403. They keep full owner access in X.
- **AC19**: Given a logged-in business user, when they ask who they are (`/me`), then they get every organisation they belong to, with their role and which stores they can see in each.
