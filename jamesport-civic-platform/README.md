# Jamesport Civic Platform

Full-stack civic engagement platform for the Jamesport NY Civic Association. Built with Next.js 16 App Router, Supabase, Tailwind CSS, and automated meeting monitoring to help residents stay informed about property development.

## Getting Started

```bash
npm install
npm run dev
```

The app runs at http://localhost:3000. Use the `/admin/login` route to reach the password-protected dashboard.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the following:

- `NEXT_PUBLIC_*` – tenant branding + base URL
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_DASHBOARD_PASSWORD`, `ADMIN_DASHBOARD_SESSION_SALT`
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`
- `TWILIO_*` (optional for SMS)
- `OPENAI_API_KEY` (optional for AI summaries)
- `SCRAPER_TARGET_URLS`, `SCRAPER_KEYWORDS`

## Database Schema

SQL migrations live in `supabase/migrations`. Apply `0001_init_schema.sql` to seed tenants, users, timeline events, scraper logs, and trigger helpers.

## Key Features

- **Interactive timeline** – filterable events with source docs and mobile-friendly cards.
- **Email/SMS registration** – double opt-in flow via `/api/register` with SendGrid + Twilio stubs.
- **Admin dashboard** – login via shared password, timeline CRUD, subscriber CSV export, scraper log viewer.
- **Automated detection** – Playwright-based script (`npm run scrape:riverhead`) monitors Riverhead sites and logs keyword matches.
- **AI summaries** – `src/lib/ai/summarize.ts` integrates OpenAI when an API key is supplied.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run lint` | Run ESLint |
| `npm run build && npm start` | Production build & serve |
| `npm run scrape:riverhead` | Execute the meeting detection script |

## Accessibility & Design

- Base font size 18px, high-contrast palette, focus-visible states.
- Senior-friendly forms with large hit areas and clear instructions.
- Fully responsive timeline and registration components.

## Deployment Notes

Deploy to Vercel. Provide production secrets via the dashboard. Schedule the scraper via GitHub Actions, Vercel Cron, or Supabase Edge Functions to run every 2–4 hours, and connect it to Supabase via REST/RPC for persistence.
