# Blood Donation & Emergency Platform — Backend (B7A6)

Scaffold for the B7A6 assignment, built the same layered way as RentNest:
**Routes → Controllers → Services → Prisma**.

## What's already built (fully working pattern)

- **Prisma schema** (`prisma/schema.prisma`) — User, BloodRequest, DonationMatch,
  Donation, BloodBankInventory, Payment, with enums, relations, indexes.
- **`auth` module** — register, login, Google (GCP) social login, JWT issuing.
- **`bloodRequest` module** — full workflow: create request → donor volunteers
  (creates a `DonationMatch`) → requester/admin accepts → donation logged +
  request marked `FULFILLED`. Uses `prisma.$transaction` for the multi-table
  updates (matches your rubric's "Prisma transactions" point).
- **Shared layer**: `ApiResponse`/`ApiError` (matches the mandatory success/error
  JSON shape), `catchAsync`, `authenticate` + `authorize(...roles)` middleware,
  Zod `validate` middleware, central `errorHandler`.

## Still to build (stub folders already created)

1. **`modules/user`** — profile view/update, donor availability toggle, admin
   user management (verify/ban), list nearby donors by blood group + city.
2. **`modules/donation`** — donor's own donation history endpoint.
3. **`modules/bloodBank`** — admin-only CRUD on `BloodBankInventory`.
4. **`modules/payment`** — Stripe (or SSLCommerz/bKash) checkout session for
   `PRIORITY_LISTING` / `DONATION_CERTIFICATE`, plus a webhook route that
   verifies the event and flips `Payment.status` to `SUCCESS`/`FAILED`. Mirror
   the pattern you already used in RentNest.
5. **`prisma/seed.ts`** — seed one ADMIN, a couple DONORs and REQUESTERs so you
   have working demo credentials for submission.
6. **Swagger** — wire `swagger-ui-express` at `/api-docs`, or export a Postman
   collection instead (either satisfies the docs requirement).
7. **Deployment** — same Vercel serverless setup as RentNest/DevPulse.

## Setup

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, GOOGLE_CLIENT_ID, STRIPE_SECRET_KEY
npx prisma migrate dev --name init
npm run dev
```

## Role model

- **ADMIN** — manages blood bank inventory, verifies users, can override any request/match status.
- **DONOR** — browses open requests, volunteers, views own donation history.
- **REQUESTER** — creates blood requests, accepts/rejects donor matches, pays for priority listing.
