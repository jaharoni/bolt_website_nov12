# Limited Time Offer (LTO) Print Shop Setup Guide

## Overview

Your site now has a complete system for managing limited-time print campaigns. You can launch new campaigns in minutes without writing any code!

## Quick Start

### 1. Access the Admin Panel

1. Navigate to `/admin` on your site
2. Click "Print Campaigns" in the sidebar
3. Click "New Campaign"

### 2. Create Your First Campaign

#### Campaign Settings:
- **Campaign Title**: "No Place Like Home"
- **URL Slug**: `no-place-like-home` (will create `/lto/no-place-like-home`)
- **Description**: Write the story behind your print
- **Hero Image**: Search and select from your media library
- **Status**: Start as "draft" to test, change to "active" when ready
- **Max Quantity**: Default is 10 per order

#### Adding Variants:

1. After creating the campaign, click "Manage Variants"
2. Click "Add Variant" for each size you want to offer
3. For each variant, enter:
   - **Variant Label**: e.g., "Poster - 12×18"
   - **Description**: e.g., "Museum-quality matte finish"
   - **Price**: e.g., $45.00
   - **Printful Product ID**: Found in Printful dashboard
   - **Printful Variant ID**: Specific size variant from Printful

### 3. Map Printful Products

To find your Printful IDs:

1. Go to [Printful Dashboard](https://www.printful.com/dashboard)
2. Click "Store" → "Products"
3. Create a new product or select existing
4. The Product ID is in the URL: `/products/{PRODUCT_ID}`
5. Click on a specific size to see the Variant ID

**Common Printful Products:**
- Enhanced Matte Paper Poster: Product ID `1`
- Canvas Prints: Product ID `3`
- Framed Prints: Product ID `19`

### 4. Configure Stripe (Required)

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys from "Developers" → "API keys"
3. Add to your `.env` file:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

4. Set up webhook endpoint:
   - URL: `https://your-domain.com/.netlify/functions/stripe-webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `payment_intent.payment_failed`
     - `charge.refunded`
   - Copy the webhook secret to `.env`:

```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Test Your Campaign

1. Set campaign status to "active"
2. Visit `/lto/no-place-like-home`
3. Select a variant, enter test info
4. Use Stripe test card: `4242 4242 4242 4242`
5. Check order appears in admin panel

## Campaign URLs

Each campaign gets a clean URL:
- `/lto/no-place-like-home`
- `/lto/summer-collection`
- `/lto/holiday-special`

Perfect for social media sharing!

## Managing Campaigns

### Campaign Statuses

- **Draft**: Not visible to public, for testing
- **Active**: Live and accepting orders
- **Paused**: Temporarily disabled
- **Ended**: Closed, kept for records

### Campaign Actions

- **Preview**: Opens campaign in new tab
- **Edit**: Modify title, description, settings
- **Duplicate**: Clone campaign with variants
- **Manage Variants**: Add/edit/remove sizes
- **Analytics**: View performance metrics

### Analytics Dashboard

Track for each campaign:
- Page views
- Conversion rate
- Total revenue
- Units sold per variant
- Order list with statuses

## Order Fulfillment Flow

1. Customer completes Stripe checkout
2. Stripe webhook marks order as paid
3. System automatically sends order to Printful
4. Printful fulfills and ships order
5. Printful webhook updates tracking info
6. Customer receives tracking email

## Advanced Features

### Date-Based Campaigns

Set start/end dates for automatic activation:
- **Start Date**: Campaign becomes visible
- **End Date**: Campaign closes automatically

### Stock Limits

Set limited quantities per variant:
- Shows "X remaining" to customers
- Automatically disables when sold out

### Featured Campaigns

Toggle "Featured" to show on main shop page alongside regular products.

### Campaign Templates

1. Create a successful campaign
2. Click "Duplicate"
3. Change slug and media
4. Reuse same variants and pricing

## Pricing Strategy

When setting prices, consider:
- Printful base cost (check their calculator)
- Shipping costs (included in Printful cost)
- Your markup/profit margin
- Platform fees (Stripe ~3%)

**Example Pricing:**
- Printful cost: $15
- Your retail price: $45
- Gross profit: $30
- Stripe fee (~3%): $1.35
- Net profit: $28.65

## Troubleshooting

### Campaign Not Visible
- Check status is "active"
- Verify start_date is in past (or null)
- Check end_date hasn't passed

### Checkout Fails
- Verify Stripe keys are correct
- Check Turnstile is configured
- Review browser console for errors

### Order Not Fulfilled
- Check Printful API key is valid
- Verify variant has printful_variant_id
- Check order has media URL attached
- Review Netlify function logs

### Tracking Not Updated
- Verify Printful webhook is configured
- URL: `https://your-domain.com/.netlify/functions/printful-webhook`
- Check webhook signature if enabled

## Database Schema

The system uses two main tables:

**lto_offers**:
- Campaign metadata
- Analytics counters
- Status and dates

**lto_variants**:
- Size/format options
- Pricing
- Printful mappings
- Stock tracking

**orders** table extended with:
- `lto_offer_id`: Links to campaign
- `lto_variant_id`: Links to selected variant

## Future Enhancements

Consider adding:
- Email collection for launch notifications
- Countdown timers for urgency
- Social proof ("10 sold today")
- Discount codes
- Bundle pricing (buy 2, get 10% off)
- International shipping
- Multiple image galleries per campaign

## Support & Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Printful API Docs](https://developers.printful.com/)
- [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/)

---

## Example Campaign: "No Place Like Home"

### Step-by-Step:

1. **Find Your Image**
   - Go to Admin → Media Library
   - Search for "No Place Like Home"
   - Note the image ID

2. **Create Campaign**
   - Title: "No Place Like Home"
   - Slug: `no-place-like-home`
   - Description: Tell your story
   - Select the image

3. **Add Variants**
   - Poster 12×18: $45.00 (Printful variant: check dashboard)
   - Canvas 16×24: $129.00
   - Framed 18×24: $189.00

4. **Test & Launch**
   - Set to "draft"
   - Visit `/lto/no-place-like-home`
   - Test checkout
   - Set to "active"
   - Share link on social media!

## Share Your Campaign

Once active, share these URLs:
- Direct: `https://your-domain.com/lto/no-place-like-home`
- Social: Add to Instagram/Twitter bio
- Email: Send to your mailing list

The clean URLs and mobile-optimized checkout make it perfect for social media drops!

---

**Need Help?** Check the admin analytics to see how your campaigns are performing and iterate on pricing and messaging for future launches.
