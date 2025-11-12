# Deployment Guide

This guide covers deploying your photography portfolio and print shop to production.

## Prerequisites

Before deploying, ensure you have:

1. **Supabase Project** - Already configured
2. **OpenAI API Key** - For AI chat functionality (optional)
3. **Printful Account** - For print fulfillment
4. **Stripe Account** - For payment processing (optional)

## Environment Variables

Copy `.env.example` to `.env` and configure the following:

### Required
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Optional but Recommended
```
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_PRINTFUL_API_KEY=your_printful_api_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Deployment Platforms

### Vercel (Recommended)

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables in Vercel dashboard or via CLI:
   ```bash
   vercel env add VITE_OPENAI_API_KEY
   vercel env add VITE_PRINTFUL_API_KEY
   vercel env add VITE_STRIPE_PUBLISHABLE_KEY
   ```

4. Deploy to production:
   ```bash
   vercel --prod
   ```

### Netlify

1. Install Netlify CLI:
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Set environment variables in Netlify dashboard under Site Settings > Environment Variables

## Database Migration

Run migrations on your Supabase project:

1. Go to Supabase Dashboard > SQL Editor
2. Run each migration file in order from `supabase/migrations/`
3. Verify tables are created correctly

## Post-Deployment Checklist

### Supabase Configuration

1. **CORS Settings**
   - Go to Authentication > URL Configuration
   - Add your production domain to Site URL and Redirect URLs

2. **Storage Buckets**
   - Verify `product-images` and `backgrounds` buckets exist
   - Ensure public access is properly configured

3. **Row Level Security**
   - Verify all RLS policies are active
   - Test anonymous and authenticated access

### Printful Integration

1. **API Key**
   - Generate API key from Printful Dashboard > Stores > API
   - Add to environment variables

2. **Webhook Setup** (Optional)
   - Create webhook endpoint in your Printful dashboard
   - Point to: `https://yourdomain.com/api/printful-webhook`
   - Select events: Order.created, Order.updated, Order.shipped

### Stripe Integration

1. **API Keys**
   - Get publishable and secret keys from Stripe Dashboard
   - Use test keys for testing, live keys for production

2. **Webhook Setup**
   - Create webhook in Stripe Dashboard
   - Point to: `https://yourdomain.com/api/stripe-webhook`
   - Select events: payment_intent.succeeded, charge.succeeded

### OpenAI Configuration

1. **API Key**
   - Generate API key from OpenAI Platform
   - Set usage limits to control costs
   - Monitor usage in OpenAI dashboard

## Testing in Production

1. **Test Search Bar**
   - Try navigation queries (e.g., "gallery", "shop")
   - Try conversational queries to trigger AI chat (if configured)

2. **Test Shop**
   - Add items to cart
   - Complete test checkout (use Stripe test card: 4242 4242 4242 4242)
   - Verify order appears in admin panel

3. **Test Admin Panel**
   - Access `/admin` route
   - Upload media to galleries
   - Manage products
   - View orders

4. **Test Mobile**
   - Check responsive design
   - Test touch interactions
   - Verify images load properly

## Performance Optimization

1. **Image Optimization**
   - Images are already optimized via Supabase storage transformations
   - Use `?width=X&quality=Y` parameters for further optimization

2. **Bundle Size**
   - Current bundle is ~580KB (gzipped ~162KB)
   - Consider code splitting for larger features if needed

3. **Caching**
   - Static assets cached for 1 year
   - API responses use appropriate cache headers

## Security Best Practices

1. **API Keys**
   - Never commit `.env` file to git
   - Rotate keys periodically
   - Use environment-specific keys

2. **Database**
   - RLS policies are enforced
   - All mutations require authentication or specific conditions
   - Regular backups via Supabase

3. **Payment Security**
   - Stripe handles PCI compliance
   - Never store card details
   - Use HTTPS only (enforced by hosting platforms)

## Monitoring

1. **Error Tracking**
   - Consider adding Sentry or similar
   - Monitor console errors in production

2. **Analytics**
   - Add Google Analytics or Plausible
   - Track conversion rates in shop

3. **Performance**
   - Use Lighthouse for performance audits
   - Monitor Core Web Vitals

## Support & Maintenance

1. **Regular Updates**
   - Keep dependencies updated: `npm update`
   - Review security advisories: `npm audit`

2. **Backup Strategy**
   - Supabase handles database backups
   - Export media periodically
   - Keep local copies of important data

3. **Content Updates**
   - Upload new images via Admin panel
   - Update product catalog as needed
   - Manage orders through admin interface

## Troubleshooting

### Build Fails
- Check Node version (requires 18+)
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### Images Not Loading
- Verify Supabase storage bucket permissions
- Check CORS settings in Supabase
- Ensure public URL is accessible

### AI Chat Not Working
- Verify VITE_OPENAI_API_KEY is set
- Check OpenAI API usage limits
- Monitor browser console for errors

### Orders Not Creating
- Check Supabase RLS policies
- Verify database schema is up to date
- Test with admin account first

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Printful API](https://developers.printful.com/)
- [Stripe Docs](https://stripe.com/docs)
- [OpenAI API](https://platform.openai.com/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Netlify Docs](https://docs.netlify.com/)
