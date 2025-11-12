# Admin Dashboard Setup & Usage Guide

## What Changed

Your admin dashboard has been completely redesigned for better organization and usability as your site grows.

### New Admin Interface

**Sidebar Navigation** - Clean, organized sections:
- 📈 Dashboard - Overview and analytics
- 🖼️ Media Library - Upload and manage all images
- 🛍️ Shop - Products and orders
- 📦 Printful - Integration management
- ⚙️ Settings - AI usage and site settings

**Flexible Tab System** - Each section has relevant tabs that adapt to your workflow

### What's Working Now

✅ **Media Manager** - Complete upload and management system
✅ **Printful Integration** - Fixed API calls (requires setup)
✅ **Dashboard Overview** - Stats and recent orders
✅ **Organized Navigation** - Sidebar + tabs

## Getting Started

### 1. Access the Admin

Navigate to: `http://localhost:5173/admin`

### 2. Media Library Workflow

**Upload Images:**
1. Click "Media Library" in sidebar
2. Select files (single or multiple)
3. Choose context (background, gallery, shop, portfolio)
4. Choose storage bucket
5. Add title, description, tags (optional)
6. Click "Upload"

**Manage Images:**
- Search by title, description, or tags
- Filter by context
- Click image to select
- Click tag icon to edit metadata
- Click X icon to delete

**Edit Metadata:**
- Change title/description
- Update context
- Add/remove tags
- Toggle active status

### 3. Printful Setup (Required for Print Shop)

**Prerequisites:**
1. Printful account with API key
2. API key added to `.env` file:
   ```
   VITE_PRINTFUL_API_KEY=your_api_key_here
   ```
3. Netlify Dev server running: `netlify dev`

**Why Netlify Dev?**
- Printful functions are serverless (deployed to Netlify)
- In development, you need `netlify dev` to run these functions locally
- Production doesn't need this - functions work automatically

**Start Development Server:**
```bash
# Terminal 1: Start Netlify dev (includes Vite)
netlify dev

# This runs on http://localhost:8888
# Vite dev server proxies through Netlify
```

**Then Sync Catalog:**
1. Go to Admin > Printful > Catalog
2. You'll see a welcome screen with instructions
3. Click "Sync from Printful" to fetch products
4. Wait 2-3 minutes for sync
5. Browse available print products

**Note:** The Printful tab won't auto-load. This is intentional to avoid errors if the API isn't configured yet. Click to load when ready.

**Map Products:**
1. Go to Admin > Printful > Map Products
2. Select your photo (Step 1)
3. Choose print type (Step 2)
4. Select size variants (Step 3)
5. Configure pricing
6. Create product

## API Configuration

### Development Environment

When running locally, you need both:
1. **Vite Dev Server** - Frontend (automatically started by netlify dev)
2. **Netlify Dev** - Serverless functions

```bash
# Run this instead of npm run dev:
netlify dev
```

This starts Netlify's dev server which:
- Runs Vite dev server internally
- Provides serverless function endpoints
- Proxies API calls correctly

### Production Environment

Deploy to Netlify - functions work automatically with no extra config needed.

### Environment Variables Required

```env
# Supabase (database)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Printful (optional - for print shop)
VITE_PRINTFUL_API_KEY=your_printful_api_key

# OpenAI (optional - for AI features)
OPENAI_API_KEY=your_openai_key

# Cloudflare Turnstile (optional - for security)
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret
```

## Database Schema

Your `media_items` table uses these fields:
- `media_type` - "image" or "video" (NOT item_type)
- `page_context` - Where it's used (background, gallery, shop, etc.)
- `bucket_name` - Which storage bucket
- `tags` - Array of searchable tags

## Troubleshooting

### "Failed to load Printful catalog"

**Problem:** API calls failing
**Solution:**
1. Make sure you're running `netlify dev` (not `npm run dev`)
2. Verify VITE_PRINTFUL_API_KEY is in `.env`
3. Restart the dev server after adding the key
4. Check terminal for function errors

**If you see "credentialless.webcontainer-api" error:**
- This means the browser is trying to reach the API but it's not running
- Solution: Start `netlify dev` instead of `npm run dev`
- The Printful tab now shows helpful instructions instead of erroring

### "Column item_type does not exist"

**Problem:** Old code references wrong column
**Solution:** Fixed - uses `media_type` now

### Functions not found (404)

**Problem:** Running wrong dev server
**Solution:** Use `netlify dev` instead of `npm run dev`

### Images not uploading

**Problem:** Storage bucket doesn't exist
**Solution:**
1. Go to Supabase Dashboard
2. Navigate to Storage
3. Create bucket if missing: `media`, `backgrounds`, `gallery`
4. Set public access for buckets

## Recommended Workflow

### Setting Up Your Site

1. **Configure Environment**
   - Add all API keys to `.env`
   - Run `netlify dev`

2. **Upload Photography**
   - Use Media Manager
   - Upload high-res images
   - Tag appropriately
   - Set context (gallery vs backgrounds vs shop)

3. **Set Up Print Shop** (optional)
   - Sync Printful catalog
   - Map photos to print products
   - Test one order

4. **Organize Gallery**
   - Create projects (coming soon)
   - Assign images to projects
   - Set featured images

### Daily Management

1. **Check Dashboard**
   - View recent orders
   - Monitor revenue
   - See pending items

2. **Process Orders**
   - Orders automatically sent to Printful
   - Track fulfillment status
   - Update as needed

3. **Upload New Content**
   - Add new photography
   - Update product listings
   - Refresh gallery

## Future Enhancements

The new admin structure makes it easy to add:
- Order fulfillment management tab
- Product editor
- Gallery project manager
- Analytics dashboard
- Customer management
- Site settings editor

Just add new tabs to existing sections or create new sections!

## Key Files

**Admin Page:**
- `src/pages/AdminNew.tsx` - Main admin interface

**Components:**
- `src/components/admin/MediaManager.tsx` - Upload & manage media
- `src/components/admin/PrintfulCatalog.tsx` - Browse Printful products
- `src/components/admin/PrintfulProductMapper.tsx` - Map photos to prints
- `src/components/admin/AIUsageMonitor.tsx` - Track AI costs

**API Client:**
- `src/lib/apiClient.ts` - Handles dev/prod API calls

**Functions:**
- `netlify/functions/printful-sync-catalog.ts` - Sync catalog
- `netlify/functions/printful-fulfill-order.ts` - Fulfill orders
- `netlify/functions/printful-webhook.ts` - Receive updates
- `netlify/functions/printful-generate-mockup.ts` - Create previews

## Support

### Common Issues

1. **Printful not loading:** Run `netlify dev`
2. **Media not uploading:** Check Supabase storage buckets
3. **Can't see products:** Sync Printful catalog first
4. **Orders not fulfilling:** Verify API keys and webhook

### Development Commands

```bash
# Development (with functions)
netlify dev

# Build for production
npm run build

# Deploy to Netlify
git push  # Auto-deploys if connected

# Check function logs
netlify functions:log printful-sync-catalog
```

### Resources

- Printful API: https://developers.printful.com
- Supabase Docs: https://supabase.com/docs
- Netlify Functions: https://docs.netlify.com/functions/overview/

## Summary

Your new admin dashboard is:
- **Organized** - Sidebar navigation with contextual tabs
- **Scalable** - Easy to add new sections/tabs
- **Functional** - Media manager working, Printful integration ready
- **Professional** - Clean interface for daily management

Focus on uploading your photography and mapping it to print products - the system handles the rest!
