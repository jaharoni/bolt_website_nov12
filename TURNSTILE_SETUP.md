# Cloudflare Turnstile Setup Guide

This guide will help you set up Cloudflare Turnstile for bot protection on your AI chat features.

## What is Turnstile?

Cloudflare Turnstile is a user-friendly CAPTCHA alternative that provides bot protection without annoying your users with image puzzles. It runs invisibly in the background and only challenges suspicious traffic.

## Why We Need It

Your AI chat feature now requires Turnstile verification to:
- Prevent automated bots from abusing your OpenAI API
- Stop malicious actors from draining your budget
- Ensure only real humans can access the chat
- Protect against credential stuffing and scraping attacks

## Setup Instructions

### Step 1: Access Cloudflare Dashboard

1. Go to https://dash.cloudflare.com/
2. Log in with your Cloudflare account
   - If you don't have an account, create one (it's free!)

### Step 2: Navigate to Turnstile

1. In the left sidebar, find **"Turnstile"** under the Security section
2. If you can't find it, use the search bar at the top and search for "Turnstile"

### Step 3: Create a New Site

1. Click the **"Add Site"** button
2. Fill in the form:

   **Site Name:** Give it a recognizable name (e.g., "My Portfolio Chat")

   **Domain:** Add your domains:
   - `localhost` (for development)
   - `yourdomain.com` (your production domain)
   - You can add multiple domains

   **Widget Type:** Choose **"Invisible"**
   - This provides the best user experience
   - Users won't see a checkbox unless Turnstile detects suspicious behavior

   **Widget Mode:** Choose **"Managed"**
   - Cloudflare automatically adjusts difficulty based on threat level

### Step 4: Get Your Keys

After creating the site, you'll see two keys:

1. **Site Key** (starts with `0x...`)
   - This is public and goes in your frontend code
   - Copy this value

2. **Secret Key** (starts with `0x...`)
   - This is private and must stay on your server
   - **NEVER** expose this in client-side code
   - Copy this value

### Step 5: Add Keys to Environment Variables

1. Open your `.env` file in the project root

2. Add your Turnstile keys:

```env
VITE_TURNSTILE_SITE_KEY=0x4AAAA...your-site-key
TURNSTILE_SECRET_KEY=0x4AAAA...your-secret-key
```

3. **Important:** Replace `your-site-key` and `your-secret-key` with your actual keys

### Step 6: Restart Your Development Server

If your dev server is running, restart it to pick up the new environment variables:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Step 7: Test the Integration

1. Open your site
2. Open the chat modal
3. Try sending a message
4. You should see "Initializing security..." briefly, then be able to chat

If you see an error about Turnstile verification, double-check:
- Your keys are correct in `.env`
- You added `localhost` as an allowed domain in Cloudflare
- You restarted your dev server after adding the keys

## Production Deployment

When deploying to production:

### For Netlify:

1. Go to your site settings: Site settings → Environment variables
2. Add the following variables:
   - `VITE_TURNSTILE_SITE_KEY`: Your site key
   - `TURNSTILE_SECRET_KEY`: Your secret key (mark as sensitive)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `OPENAI_API_KEY`: Your OpenAI API key (mark as sensitive)
   - `VITE_PRODUCTION_URL`: Your full production URL (e.g., `https://yourdomain.com`)

### For Vercel:

1. Go to your project settings: Settings → Environment Variables
2. Add the same variables as above
3. Make sure to mark sensitive keys as "Sensitive"

## Troubleshooting

### "Turnstile verification failed"

**Problem:** The verification token is invalid or expired.

**Solutions:**
- Make sure you added `localhost` to allowed domains for development
- Make sure your production domain is added for production
- Check that your secret key is correct
- Turnstile tokens expire after 5 minutes - try refreshing the page

### "Initializing security..." never goes away

**Problem:** Turnstile script failed to load.

**Solutions:**
- Check browser console for errors
- Make sure your site key is correct in `.env`
- Check that you have VITE_TURNSTILE_SITE_KEY (not just TURNSTILE_SITE_KEY)
- Try clearing browser cache and reloading

### "Security verification in progress"

**Problem:** Turnstile token hasn't been generated yet.

**Solutions:**
- Wait a few seconds - Turnstile needs time to load
- Check browser console for JavaScript errors
- Make sure you're not blocking Cloudflare's CDN

### Chat works locally but not in production

**Problem:** Environment variables or domain configuration.

**Solutions:**
- Verify all environment variables are set in your hosting provider
- Make sure your production domain is added in Cloudflare Turnstile settings
- Check that VITE_PRODUCTION_URL matches your actual domain exactly
- Redeploy after adding environment variables

## Security Notes

1. **Never commit your secret key to Git**
   - The `.env` file is in `.gitignore` for this reason
   - Only store keys in environment variables

2. **Use different keys for dev and production**
   - Optional but recommended
   - Create separate Turnstile sites for each environment

3. **Rotate keys if compromised**
   - If you accidentally expose your secret key, generate new keys immediately
   - Update environment variables in all locations

4. **Monitor Turnstile Analytics**
   - Cloudflare provides analytics showing challenge rates and bot attempts
   - Review regularly to understand attack patterns

## Advanced Configuration

### Adjusting Challenge Difficulty

In Cloudflare Turnstile settings, you can adjust:

- **Challenge difficulty:** Auto, Easy, Moderate, or Difficult
- **Pre-clearance:** Verify users before they even try to chat
- **Bot fight mode:** Extra aggressive protection for high-risk sites

### Custom Error Handling

The chat will show user-friendly error messages, but you can customize them in:
- `src/lib/secureChatService.ts` - Error messages
- `src/components/ChatModal.tsx` - Error UI

## Support Resources

- Cloudflare Turnstile Docs: https://developers.cloudflare.com/turnstile/
- Turnstile Dashboard: https://dash.cloudflare.com/
- Issues? Check the browser console for detailed error messages

## Cost

Cloudflare Turnstile is **100% free** with:
- Unlimited verifications
- No user caps
- Full analytics
- 24/7 protection

There's no reason not to use it!

---

**Next Steps After Setup:**

1. Test the chat feature thoroughly
2. Monitor the admin dashboard for usage stats
3. Review moderation logs regularly
4. Adjust rate limits if needed in `netlify/functions/lib/rateLimiter.ts`

Need help? Check the error messages in browser console or server logs for specific issues.
