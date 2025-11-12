# Search Functionality Troubleshooting Guide

## Primary Issue Identified

**Your database has 0 products**, which is why product searches return no results.

### Database Status
- **Products**: 0 active products
- **Media Items**: 14 active items ✓
- **Essays**: 5 published essays ✓

### RLS Policies Status ✓
All Row Level Security policies are correctly configured:
- Products: Public can view active products
- Media Items: Public can view active media
- Essays: Public can view published essays

## Quick Fix: Add Products to Your Database

You have two options to add products:

### Option 1: Use the Admin Panel
1. Navigate to `/admin` on your site
2. Go to the "Products" section
3. Click "Create Product" and add your products manually

### Option 2: Use Printful Integration
If you're using Printful for print-on-demand:
1. Ensure `VITE_PRINTFUL_API_KEY` is set in your environment variables
2. Navigate to `/admin` > "Printful Catalog"
3. Click "Sync Catalog" to import products from Printful
4. Map your media to Printful products

## Environment Variables Checklist

Ensure these are set in your hosting platform (Netlify/Vercel):

### Required for Basic Functionality
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Required for Search & Chat (AI Features)
```bash
OPENAI_API_KEY=your_openai_api_key
VITE_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
```

### Required for Shop Features
```bash
VITE_PRINTFUL_API_KEY=your_printful_api_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

## Search Feature Overview

### How Search Works
1. User types a query in the SearchBar
2. System detects if it's conversational (opens AI chat) or keyword-based
3. Keyword searches query the database for:
   - Products (in `products` table)
   - Media items (in `media_items` table)
   - Essays (in `essays` table)
4. Results are ranked by relevance and displayed

### Search Components Used
- `SearchBarNew.tsx` - Primary search component (currently used)
- `searchManager.ts` - Handles search logic and routing
- `database.ts` - Product queries
- `mediaService.ts` - Media queries
- `essayService.ts` - Essay queries

## Testing Search

### Test with Keywords
Try these searches once you have products:
- "print" - Should find products with "print" in title/description
- "photo" - Should find media items and essays
- "essay" - Should route to essays page

### Test with Conversational Queries
These should open AI chat (if configured):
- "What prints do you have available?"
- "Can you show me your wedding photography?"
- "How much does a portrait session cost?"

## Common Issues and Solutions

### Issue: Search returns no results
**Solution**: Check if you have data in your database
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM products WHERE is_active = true;
SELECT COUNT(*) FROM media_items WHERE is_active = true;
SELECT COUNT(*) FROM essays WHERE publish_status = 'published';
```

### Issue: "Missing Supabase environment variables" error
**Solution**: Set environment variables in your hosting platform:
- **Netlify**: Site settings > Environment variables
- **Vercel**: Project settings > Environment Variables

### Issue: Search works locally but not in production
**Checklist**:
1. Verify environment variables are set in production
2. Check that Supabase allows requests from your production domain
3. Review browser console for JavaScript errors
4. Verify the build process completed successfully

### Issue: AI chat not working
**Requirements**:
1. `OPENAI_API_KEY` must be set (server-side)
2. `VITE_TURNSTILE_SITE_KEY` must be set (client-side)
3. `TURNSTILE_SECRET_KEY` must be set (server-side)
4. Netlify Functions or Edge Functions must be deployed

## Deployment Platform Configuration

### Netlify Deployment
```bash
# Build command
npm run build

# Publish directory
dist

# Functions directory (if using)
netlify/functions
```

### Vercel Deployment
Uses `vercel.json` configuration file (already configured)

## Next Steps

1. **Add products to your database** using one of the methods above
2. **Verify environment variables** are set in production
3. **Test search functionality** with actual queries
4. **Check browser console** for any errors

## Support Resources

- Supabase Dashboard: https://app.supabase.com
- Printful API Docs: https://developers.printful.com
- OpenAI API Keys: https://platform.openai.com/api-keys
- Cloudflare Turnstile: https://dash.cloudflare.com

## Database Schema Quick Reference

### Products Table
```sql
- id (uuid)
- title (text) - searchable
- description (text) - searchable
- category (text)
- base_price (numeric)
- images (text[])
- is_active (boolean) - must be true
- tags (text[])
```

### Key Point
**The search will only return products where `is_active = true`**. Make sure when you create products, you set `is_active` to `true`.
