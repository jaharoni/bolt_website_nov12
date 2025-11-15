# Vercel Environment Variable Update

The Supabase instance for this project now lives at `https://nbxhmgwbzaufwmpwppbp.supabase.co`. To keep the deployed site in sync with local development:

1. Open your Vercel project → *Settings* → *Environment Variables*.
2. Create or update the following keys in **Production**, **Preview**, and **Development** environments:  
   - `VITE_SUPABASE_URL` → `https://nbxhmgwbzaufwmpwppbp.supabase.co`  
   - `VITE_SUPABASE_ANON_KEY` → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ieGhtZ3diemF1ZndtcHdwcGJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE1MTg1NjUsImV4cCI6MjA0NzA5NDU2NX0.ey3pc3Mi0i1zd4XBhtVmFzZSIstnJlZiI6IbIa5le5eG`
3. Save the changes and redeploy (or trigger “Redeploy” for the latest build) so the environment updates take effect.

Keep any additional secrets (service role key, API keys, etc.) aligned between `.env` and Vercel as needed for parity between local and hosted environments.
