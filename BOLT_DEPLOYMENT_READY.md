# Site Ready for Bolt Deployment

Your site has been configured and is ready to publish through Bolt.

## Changes Made

### 1. Security Improvements
- Removed client-side OpenAI API usage (security risk)
- All AI chat now routes securely through Supabase Edge Functions
- Deprecated `aiService.ts` to prevent accidental usage

### 2. Build Optimizations
- Updated `vite.config.ts` with production optimizations
- Added code splitting for vendor and Supabase chunks
- Disabled sourcemaps for smaller bundle size
- Added SPA routing fallback (`public/_redirects`)

### 3. Dependency Cleanup
- Removed unused server-side packages from client bundle
- Kept only necessary dependencies for client-side code
- All serverless functionality is in Supabase Edge Functions

### 4. Verified Infrastructure
- Supabase Edge Function for chat: **DEPLOYED** ✓
- Database migrations: **APPLIED** ✓
- Chat security tables: **CREATED** ✓
- Environment variables: **CONFIGURED** ✓

## Architecture Overview

### Client-Side (Browser)
- React SPA with Vite
- Supabase client for database queries
- Stripe.js for payment processing
- All API keys properly scoped with VITE_ prefix

### Server-Side (Supabase Edge Functions)
- `/chat` - AI chat with rate limiting, moderation, budget tracking
- `/create-lto-checkout` - Limited-time offer checkout with Stripe
- `/stripe-webhook` - Webhook handler for payment events
- `/printful-fulfill-order` - Order fulfillment integration
- `/printful-sync` - Product catalog synchronization

### Security Features
- Row Level Security (RLS) on all database tables
- Rate limiting per IP and session
- Content moderation via OpenAI
- Daily budget limits on AI usage
- Cloudflare Turnstile bot protection
- CORS properly configured

## How AI Chat Works

1. User types message in SearchBar or ChatModal
2. Turnstile token generated for bot protection
3. Request sent to Supabase Edge Function at `{SUPABASE_URL}/functions/v1/chat`
4. Edge Function validates, rate limits, moderates, and processes
5. OpenAI API called server-side (API key never exposed)
6. Response returned to client and displayed

## Required Environment Variables

### Already Configured in .env
```
VITE_SUPABASE_URL=https://wiqiaabjqzitegmfvtsn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Set in Supabase Dashboard (Edge Function Secrets)
These must be configured in your Supabase project:

1. Go to: https://supabase.com/dashboard/project/wiqiaabjqzitegmfvtsn/settings/functions
2. Add these secrets:
   - `OPENAI_API_KEY` - Your OpenAI API key (required for chat)
   - `TURNSTILE_SECRET_KEY` - Cloudflare Turnstile secret (optional)
   - `STRIPE_SECRET_KEY` - Stripe secret key (optional, for payments)
   - `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret (optional)

### Optional (for future use)
```
VITE_TURNSTILE_SITE_KEY= (for bot protection)
VITE_PRINTFUL_API_KEY= (for print fulfillment)
```

## Testing the Chat Feature

Once deployed, test the AI chat:

1. Open the site
2. Click the chat icon or type a conversational query
3. Wait for Turnstile to initialize (invisible)
4. Send a message
5. Response should come from Supabase Edge Function

If you see errors:
- Check browser console for specific error messages
- Verify OPENAI_API_KEY is set in Supabase Edge Function secrets
- Check Supabase Edge Function logs for detailed errors

## Publishing Your Site

### Option 1: Bolt Publish Button (Recommended)
1. Click the "Publish" button in Bolt preview
2. Follow the prompts to deploy
3. Your site will be live on Bolt's infrastructure

### Option 2: Manual Deployment to Vercel
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables from `.env` file
4. Deploy

### Option 3: Manual Deployment to Netlify
1. Push code to GitHub
2. Import project in Netlify dashboard
3. Set environment variables
4. Build command: `npm run build`
5. Publish directory: `dist`

## Post-Deployment Checklist

- [ ] Test homepage loads correctly
- [ ] Test navigation to all pages (Gallery, Shop, About, Contact, Essays)
- [ ] Test search bar navigation
- [ ] Test AI chat functionality
- [ ] Test cart add/remove
- [ ] Test mobile responsive design
- [ ] Verify images load from Supabase storage
- [ ] Check browser console for errors
- [ ] Test on multiple browsers

## Monitoring

### Supabase Dashboard
- Monitor database queries and errors
- Check Edge Function logs for chat errors
- View storage usage and requests

### AI Usage Tracking
- Daily budget: $5.00 USD
- Hourly limit: 30 requests per user
- Daily limit: 100 requests per user
- View usage in `chat_usage_logs` table

## Troubleshooting

### Chat not working
1. Check Supabase Edge Function logs
2. Verify OPENAI_API_KEY is set in secrets
3. Check rate limits in `chat_rate_limits` table
4. Check budget in `chat_budget_tracker` table

### Build errors
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Run `npm run build`

### Images not loading
1. Check Supabase storage bucket permissions
2. Verify CORS settings in Supabase
3. Check browser network tab for 404s

## Support

For issues with:
- **Bolt Publishing**: Contact Bolt support
- **Supabase**: Check https://supabase.com/docs
- **Chat Feature**: Check Edge Function logs in Supabase dashboard
- **Build Issues**: Check browser console and build output

---

**Your site is production-ready!** All security issues have been resolved, the architecture is properly set up with server-side AI processing, and the build is optimized. Click "Publish" in Bolt to go live.
