# Glossary

One name per thing, used the same way in specs, code, API and UI. In code, use the English term. The Swedish UI word is in brackets.

## People and accounts
- **Customer** (kund): a person using the customer app. Today's `User` model.
- **Organisation** (företag): the legal business behind one or more stores, identified by its Swedish org number (organisationsnummer). It is the business account.
- **Store** (butik): one physical location that issues receipts. Belongs to exactly one organisation.
- **Business user** (företagsanvändare): a person who logs in to the business app. This is a separate account type from customer.
- **Membership**: links a business user to an organisation, with a role.
- **Role**:
  - `OWNER`: full access to the organisation (stores, staff, API keys).
  - `STAFF`: read access to the stores they've been given.

## Receipts and payments
- **POS** (kassasystem): the till system in a store. It sends receipts to Qvitto.
- **PSP**: the payment provider (Stripe, Zettle, Braintree, ...). It sends payment events to Qvitto.
- **Store API key**: the secret one store's POS uses to send receipts. One store can have several keys, so a key can be rotated.
- **Receipt** (kvitto): what the store sold: line items, total, VAT, time. Always belongs to one store (from spec 001 onward).
- **Receipt item** (kvittorad): one line on a receipt.
- **Transaction** (transaktion): the card payment as seen by the PSP or bank. Belongs to a customer.
- **Match**: the link between a receipt and a transaction. When a receipt is matched, the customer gets it.
- **Match status**:
  - `PENDING`: no transaction found yet.
  - `MATCHED`: linked to exactly one transaction.
  - `UNMATCHED`: no match found within the time window, or more than one possible match.

## Words to avoid
- **Merchant**: ambiguous. It currently exists as a free-text field on `Receipt` and `Transaction`. Say Organisation or Store instead. Spec 001 replaces the field on `Receipt` with a link to a Store.
- **User** on its own: say Customer or Business user.
