# 001: Plan

How we build [spec.md](./spec.md). The spec says what, this file says how. If they disagree, the spec wins.

## Scope
Backend only (`services/api`). It stays plain JavaScript (ESM) for this spec. Moving the API to TypeScript is its own spec, so this one doesn't turn into a rewrite.

## 1. Data model (Prisma)
```prisma
enum OrganisationStatus { PENDING ACTIVE SUSPENDED }
enum MembershipRole { OWNER STAFF }

model Organisation {
  id          String             @id @default(uuid())
  name        String
  orgNumber   String             @unique   // normalised "NNNNNN-NNNN"
  status      OrganisationStatus @default(PENDING)
  stores      Store[]
  memberships Membership[]
  invites     Invite[]
  createdAt   DateTime           @default(now())
}

model Store {
  id             String        @id @default(uuid())
  organisation   Organisation  @relation(fields: [organisationId], references: [id])
  organisationId String
  name           String
  address        String
  apiKeys        StoreApiKey[]
  receipts       Receipt[]
  staffAccess    MembershipStore[]
  createdAt      DateTime      @default(now())
}

model BusinessUser {
  id           String       @id @default(uuid())
  name         String
  email        String       @unique   // stored lower-case
  passwordHash String
  memberships  Membership[]
  createdAt    DateTime     @default(now())
}

model Membership {
  id             String            @id @default(uuid())
  businessUser   BusinessUser      @relation(fields: [businessUserId], references: [id])
  businessUserId String
  organisation   Organisation      @relation(fields: [organisationId], references: [id])
  organisationId String
  role           MembershipRole
  storeAccess    MembershipStore[] // only used for STAFF, OWNER sees all stores
  createdAt      DateTime          @default(now())
  @@unique([businessUserId, organisationId])
}

model MembershipStore {
  membership   Membership @relation(fields: [membershipId], references: [id], onDelete: Cascade)
  membershipId String
  store        Store      @relation(fields: [storeId], references: [id], onDelete: Cascade)
  storeId      String
  @@id([membershipId, storeId])
}

model StoreApiKey {
  id        String    @id @default(uuid())
  store     Store     @relation(fields: [storeId], references: [id])
  storeId   String
  prefix    String    @unique   // e.g. "qv_live_ab12cd34", safe to show
  hash      String              // sha256 of the full key
  createdAt DateTime  @default(now())
  revokedAt DateTime?
}

model Invite {
  id             String         @id @default(uuid())
  organisation   Organisation   @relation(fields: [organisationId], references: [id])
  organisationId String
  email          String
  role           MembershipRole
  storeIds       String[]
  tokenHash      String         @unique
  expiresAt      DateTime
  acceptedAt     DateTime?
  createdAt      DateTime       @default(now())
}
```
`Receipt` gets `storeId String` plus a relation to `Store`. The migration deletes existing receipts and receipt items first (they're test data, see decision 4), then makes `storeId` required. `Receipt.merchant` stays for now and is filled from `store.name` on the server. It gets removed in a later spec.

## 2. Auth
- **One token per account type.** JWTs get an `aud` claim: customer tokens use `aud: "customer"` and business tokens use `aud: "business"` (payload `{ businessUserId }`).
  - `authenticateToken` (customer) rejects anything that isn't `aud: "customer"`.
  - The new `authenticateBusiness` rejects anything that isn't `aud: "business"`. This covers AC15.
  - Existing customer tokens have no `aud`, so customers log in again once. That's fine with test data only.
- **Organisation context comes from the path:** `/api/business/orgs/:orgId/...`. The `requireMembership({ role })` middleware loads the membership for (user, orgId).
  - No membership: 404.
  - Wrong role: 403 (AC13, AC18).
- `requireStoreAccess` checks that `:storeId` belongs to `:orgId` and that the member is the owner or has the store in `storeAccess`. Otherwise 404 (AC12).
- **Startup config** (`src/config.js`) reads `JWT_SECRET` and throws if it's missing (AC17). All `|| "supersecretkey"` fallbacks are removed. The same goes for the `test-pos-key` and `test-psp-key` fallbacks.

## 3. Store API keys
- **Format:** `qv_<env>_<8 random chars>_<32 random bytes, base64url>`, e.g. `qv_live_ab12cd34_...`. `env` is `live` or `test`.
- **Storage:** only `prefix` and `sha256(fullKey)` are saved. sha256 is enough here because keys are long random strings, not passwords.
- **The `requireStoreApiKey` middleware**, used on `POST /api/pos/receipts`, does this:
  1. Parse the prefix and look the key up.
  2. Compare the hashes with `timingSafeEqual`.
  3. If the key is revoked, answer 401 (AC8).
  4. If the store's organisation isn't `ACTIVE`, answer 403 (AC4).
  5. Otherwise set `req.store`.
- `submitPosReceipt` uses `req.store.id` and ignores any merchant or store fields in the body (AC9).
- The global `POS_API_KEY` check is removed from the POS route (AC10). The PSP webhook keeps its own key for now.

## 4. Endpoints (new)
All under `/api/business`. Only signup, login and invite-accept are public.

| Method | Path | Who | AC |
|---|---|---|---|
| POST | `/signup` | public | 1, 2, 3 |
| POST | `/login` | public | |
| GET | `/me` | any business user | 19 |
| GET | `/orgs/:orgId/stores` | member (staff only see their stores) | 11, 12 |
| POST | `/orgs/:orgId/stores` | OWNER | 6, 13, 18 |
| POST | `/orgs/:orgId/stores/:storeId/api-keys` | OWNER | 7 |
| GET | `/orgs/:orgId/stores/:storeId/api-keys` | OWNER | 7 (prefix only) |
| DELETE | `/orgs/:orgId/stores/:storeId/api-keys/:keyId` | OWNER | 8 |
| POST | `/orgs/:orgId/invites` | OWNER | 11, 13 |
| POST | `/invites/accept` | public, needs the invite token | 11 |
| GET | `/orgs/:orgId/stores/:storeId/receipts` | member with store access | 9, 12, 14 |

**Signup** creates `BusinessUser`, `Organisation (PENDING)` and an `OWNER` `Membership` in one transaction. It validates the org number format (`NNNNNN-NNNN`, also accepting `NNNNNNNNNN` and normalising it).

**Invites** (pilot version, no email service yet): the response gives back a one-time invite link, and the owner sends it to the person themselves.
- On accept, if no business user exists for the invite email, one is created with the name and password given.
- If a business user already exists for that email, they must give that account's password. Then a membership is added to it, which covers decision 3.
- Invites expire after 7 days.

**Receipts for business** go through one serializer, `toBusinessReceipt()`. It only picks receipt fields, items, store and match status, never transaction or user fields (AC14). A test checks the exact set of keys.

## 5. Security fixes in this spec
- Delete `GET /api/users` (AC16).
- `registerUser` and every other response: never return `password` / `passwordHash`. Add a `toPublicUser()` helper.

## 6. Admin script (decision 2)
Run it with `npm run admin:activate-org --workspace services/api -- <orgNumber>`. It sets the organisation's status to `ACTIVE` and prints the organisation and its stores.

## 7. Tests
- **Setup:** Vitest and Supertest. Split `server.js` into `app.js` (builds the Express app) and `server.js` (only calls `listen`), so tests can import the app without starting a server.
- **Database:** tests run against a separate database, `DATABASE_URL_TEST`, which is reset with `prisma migrate reset --force` before the run.
- **Coverage:** at least one test per AC. Test names start with the AC id, e.g. `it("AC12: staff cannot see another store's receipts")`.

## 8. API contract
Add `services/api/openapi.yaml` with the endpoints above, plus `POST /api/pos/receipts` with the new key auth. This is the start of the contract from the constitution. Generating types into `packages/shared` comes in a later spec.

## Risks
- **Customers have to log in again:** the `aud` change logs out existing customer sessions. That's acceptable with test data only.
- **Matching:** the matching service reads receipts. It needs a quick check that it still works with the required `storeId`, and a test for it.
