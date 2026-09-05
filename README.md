# Pookie Dashboard 🎀

A cute, anime-themed expense tracker and food court hub built for a closed
group of 11 people. No public sign-up — you log in as one of the 11, split
bills, settle up via UPI, and order off a shared canteen menu that everyone
can see and edit.

Live at: _add your Vercel URL here once deployed_

## What's in here

- **Expense tracking** — log who paid, split evenly or unevenly, see
  per-friend balances and a one-tap "smart settle" that collapses group debts
  into the fewest possible payments.
- **UPI settlements** — generate a real `upi://pay` deep link + scannable QR
  to settle up, using whichever side's saved UPI ID applies.
- **Food Court Pookies** — an opt-in circle. Subscribe to see (and get
  notified about) every food court order from everyone, not just your own.
  Unsubscribe any time.
- **Shared canteen menu** — seeded from the real campus price list; any of
  the 11 can add, edit, or remove items.
- **Profile pictures** — pick from a fixed set of avatar images, nothing
  custom-uploaded.
- **Live-ish sync** — the shared feeds (transactions, menu, circles, profiles)
  poll every 25s and refetch instantly when you switch back to the tab, so
  two people at the food court at once actually see each other's orders.
- **Mobile shell** — a thin Expo/React Native WebView wrapper in `mobile/`
  for shipping this to phones without a second UI to maintain.

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind
- Prisma + Neon (serverless Postgres)
- Vitest for unit tests (split math, debt simplification)
- Expo (WebView shell) for the mobile app

## Getting started

```bash
npm install
```

Create `.env.local` with:

```bash
# Neon connection strings — get both from your Neon project dashboard.
# DATABASE_URL is the pooled (PgBouncer) connection, used at runtime.
# DIRECT_URL is the unpooled connection, required for migrations.
DATABASE_URL="postgresql://...-pooler.../neondb?sslmode=require"
DIRECT_URL="postgresql://.../neondb?sslmode=require"

# Signs login session tokens. Generate one with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET="a-long-random-string"
```

Run the migrations, then start the dev server:

```bash
npx prisma migrate dev
npm run dev
```

The member roster (names, emails, default avatars) lives in
`src/lib/members.ts`; login credentials are server-only, in
`src/app/api/auth/login/route.ts` — edit both if you're forking this for a
different group.

## Scripts

| Command                  | What it does                                      |
| ------------------------ | -------------------------------------------------- |
| `npm run dev`             | Start the dev server                               |
| `npm run build`           | Production build                                   |
| `npm test`                | Run the test suite once                            |
| `npm run test:watch`      | Run tests in watch mode                            |
| `npm run optimize-images` | Re-compress `public/waifu` and `public/mascot`      |

## Deploying

Deployed on Vercel. Set `DATABASE_URL`, `DIRECT_URL`, and `SESSION_SECRET` as
environment variables in the Vercel project settings (they're intentionally
not committed).

`mobile/` is a separate Expo project — update `mobile/src/config.ts` (or set
`EXPO_PUBLIC_WEB_URL`) to point at your deployed URL before building it.

## Project layout

```
src/app/api/       API routes (auth, friends, transactions, circles, menu, food-court, profile)
src/components/    UI, grouped by feature (foodcourt, ledger, history, profile, layout, ui)
src/context/       PookieContext — the app's shared state + data-fetching
src/lib/           Domain logic: currency/split math, debt simplification, members, menu
prisma/            Schema + migrations
mobile/            Expo WebView shell for the mobile app
```
