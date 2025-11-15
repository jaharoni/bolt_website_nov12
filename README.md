## Jamesport Civic Platform

Full-stack civic engagement platform for the Jamesport NY Civic Association. Residents can browse an accessible property history timeline, register for email/SMS alerts, and admins can manage content, subscribers, and automated meeting detection from a secure dashboard.

### Tech stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Tailwind CSS 3 + Chakra UI components for accessibility
- Supabase (Postgres, Auth, Storage) via SQL migrations
- SendGrid (email) + Twilio (SMS) integrations
- Playwright-based scraper + cron-friendly scripts
- OpenAI API for zoning/meeting summaries

### Getting started

1. Install dependencies

   ```bash
   npm install
   ```

2. Copy the environment template and configure credentials

   ```bash
   cp .env.example .env.local
   ```

   At a minimum set:

   | Variable | Purpose |
   | --- | --- |
   | `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Database access |
   | `SESSION_PASSWORD` | 32+ char secret for admin sessions |
   | `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` | Transactional email |
   | `TWILIO_*` | SMS notifications (optional) |
   | `OPENAI_API_KEY` | AI summaries (optional) |

3. Run database migrations through Supabase CLI or SQL editor (`supabase/migrations/20251115090000_jamesport_civic_schema.sql`).

4. Start the dev server

   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` for the public site and `http://localhost:3000/admin` for the dashboard (defaults to the seed credentials in `.env` until real admin users exist).

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js dev server |
| `npm run build` / `npm start` | Production build & run |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript verification |
| `npm run scraper:run` | Execute the Playwright meeting detector locally |
| `npm run alerts:simulate` | Fire a sample email/SMS alert |
| `npm run db:backup` / `npm run db:restore` | Utility scripts for Supabase backups |

### Admin dashboard

- Email/password login (seed credentials via `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` until Supabase `admin_users` rows exist).
- Timeline CRUD with filtering, high-contrast UI, and document metadata.
- Subscriber export, manual alert trigger, AI summary tool, and scraper log visibility.

### Accessibility & seniors-first defaults

- Minimum 18px body text, 4.5:1 color contrast, keyboard focus indicators.
- Layouts tested across desktop/tablet breakpoints; Chakra components ensure ARIA-compliant inputs.

### Cron-friendly automation

- Deploy `app/api/scraper/run` as a Vercel Cron target every 2–4 hours.
- Scripts in `scripts/scraper` can also run inside CI/containers.

### Next steps

- Wire document uploads into Supabase Storage for timeline attachments.
- Add multi-town config + theming via env vars.
- Expand tests + monitoring hooks for SendGrid/Twilio responses.
