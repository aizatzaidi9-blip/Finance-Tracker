# Harian & Simpanan

Premium mobile-first personal finance tracker for Malaysian Ringgit users. The app tracks only `Duit Masuk` and `Duit Keluar`, separates balances into `Harian` and `Simpanan`, and supports split income through `Bahagikan`.

## Main Features

- Dashboard with Baki Harian, Simpanan, Jumlah Keseluruhan, recent transactions, charts, and Malay insights.
- Bottom-sheet transaction flow for Duit Masuk and Duit Keluar.
- Bahagikan appears only after selecting Duit Masuk.
- No unsupported payment-source fields or transfer transaction type.
- Transaction history with search, type filters, grouped dates, and action controls.
- Reports for weekly, monthly, yearly, and custom periods with Recharts visuals.
- Profile preferences, category management surface, export to CSV/JSON, dark-mode-ready styling, and PWA shell.
- Tested finance logic for income, expenses, split rounding, edits, deletes, and negative-balance prevention.

## Technology Stack

Next.js App Router, TypeScript, Tailwind CSS, Supabase Auth/Database, React Hook Form-ready validation with Zod, Recharts, Framer Motion, Lucide React, date-fns, Vitest, ESLint, Prettier.

## Local Installation

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Without Supabase variables, the app runs in demo mode with local sample data.

## Environment Setup

Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in browser code.

## Supabase Setup

1. Create a Supabase project.
2. Enable Email/Password auth.
3. Run the migration in `supabase/migrations/001_initial_schema.sql`.
4. Run `supabase/seed.sql` to insert default categories.
5. Add the Supabase URL and anon key to `.env.local`.

The migration enables RLS on every user-owned table. Users can only read, create, update, and delete their own rows. Default categories are readable by all users because their `user_id` is `null`.

## Running Migrations And Seed

With Supabase CLI:

```bash
supabase db push
supabase db execute --file supabase/seed.sql
```

Or paste the SQL files into Supabase SQL Editor in this order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/seed.sql`

## Development Commands

```bash
npm run dev
npm run lint
npm run test
npm run build
npm run format
```

## Production Build

```bash
npm run build
npm run start
```

## GitHub Workflow

Create a branch, commit changes, push to GitHub, and open a pull request. Keep `.env.local` out of Git. The included `.gitignore` already excludes local environment files.

## Vercel Deployment

1. Import the GitHub repository into Vercel.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_APP_URL`.
3. Do not add `SUPABASE_SERVICE_ROLE_KEY` unless future server-only admin tasks require it.
4. Keep the default Next.js build command: `npm run build`.
5. Deploy.

## Troubleshooting

- If login redirects fail, check Supabase Auth URL settings and `NEXT_PUBLIC_APP_URL`.
- If categories are missing, rerun `supabase/seed.sql`.
- If expenses fail, check the selected Harian or Simpanan balance; negative balances are blocked.
- If the PWA service worker seems stale, unregister it from browser dev tools and reload.
