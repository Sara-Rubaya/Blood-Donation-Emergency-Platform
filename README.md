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

## Build & Deploy (Vercel)

Vercel detects `api/index.ts` automatically as a serverless function — it
exports the Express `app` (no `app.listen()` there). `src/server.ts` with
`app.listen()` is only used for local development (`npm run dev`); it is
never deployed.

```bash
npm i -g vercel
vercel login
vercel --prod       # picks up api/index.ts + vercel.json rewrites automatically
```

After the first deploy, add your `.env` values in the Vercel dashboard
(Project → Settings → Environment Variables) — `vercel --prod` does **not**
upload your local `.env` file.

If you still get a `404: NOT_FOUND` after deploying:
- Confirm `api/index.ts` exists and exports the app as `export default app;`
- Check the Vercel deployment's "Functions" tab — `api/index` should be listed
- Make sure you didn't leave an old `builds`/`routes` block in `vercel.json` pointing at `dist/server.js` (that file is never uploaded, since `dist/` is gitignored)

### Serverless constraints (Vercel free tier)

Functions here are stateless and spin down between requests, so avoid:

| Don't use | Why | Instead |
|---|---|---|
| `node-cron` / `setInterval` for scheduled tasks (e.g. auto-expiring old requests) | Instance halts when idle | Vercel Cron Jobs / GitHub Actions calling an endpoint |
| Local `fs` writes (e.g. saving uploaded donor ID photos to disk) | Disk is read-only/ephemeral | Upload to Cloudinary/S3 via signed URL, store the URL in Postgres |
| In-memory caching/state | Not shared across instances | Redis (Upstash) or just query Postgres |
| Socket.io / persistent WebSocket connections for live emergency alerts | Not supported on serverless functions | Pusher/Ably, or client-side polling `/api/blood-requests` |

None of the current modules hit these, but keep them in mind if you add
donor ID photo uploads or real-time emergency broadcast later.

## Role model

- **ADMIN** — manages blood bank inventory, verifies users, can override any request/match status.
- **DONOR** — browses open requests, volunteers, views own donation history.
- **REQUESTER** — creates blood requests, accepts/rejects donor matches, pays for priority listing.

## Postman / API testing

Import the routes below into Postman as a collection, or use `curl`:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Rifat Hasan","email":"rifat@example.com","password":"password123","role":"DONOR","bloodGroup":"O_POS"}'
```
