# Printful Integration Guide

Complete guide for setting up and using the Printful print-on-demand integration for your photography shop.

## Overview

This integration allows you to automatically fulfill print orders through Printful's print-on-demand service. When customers order prints of your photography, the orders are automatically sent to Printful for printing and shipping, with no inventory required.

## Prerequisites

1. **Printful Account**
   - Create an account at https://www.printful.com
   - Set up your store in the Printful dashboard
   - Get your API key from Settings > API

2. **Environment Configuration**
   - Add your Printful API key to `.env`:
     ```
     VITE_PRINTFUL_API_KEY=your_printful_api_key_here
     ```

## Setup Process

### Step 1: Sync Printful Catalog

1. Navigate to `/admin` in your site
2. Click the "Printful Catalog" tab
3. Click "Sync from Printful" button
4. Wait for the sync to complete (this may take 2-3 minutes)
5. You'll see all available print products from Printful's catalog

**What gets synced:**
- Posters (various sizes)
- Canvas prints
- Framed prints
- All available variants (sizes and materials)
- Base costs from Printful
- Product images

### Step 2: Upload Your Photography

1. Go to "Media Upload" tab in admin
2. Upload your high-resolution photography
3. Add titles and descriptions
4. Images are stored in Supabase Storage

### Step 3: Map Photos to Printful Products

1. Click the "Map to Printful" tab in admin
2. **Select Your Photo** (Step 1)
   - Browse your uploaded photography
   - Click an image to select it
3. **Select Print Type** (Step 2)
   - Choose a Printful product (poster, canvas, framed print)
   - See base costs and variant counts
4. **Select Variants** (Step 3)
   - Choose which sizes to offer
   - See cost vs retail price for each
   - Adjust markup percentage (default 40%)
5. **Configure Product Details**
   - Enter product title
   - Write description
   - Review profit margins
6. Click "Create Product"

**Result:** A new product is created in your shop with:
- Your photography as the product image
- Selected print sizes as variants
- Retail prices calculated from markup
- Linked to Printful for fulfillment

### Step 4: Configure Webhook (Optional but Recommended)

Set up webhooks in Printful dashboard to receive order updates:

1. Go to https://www.printful.com/dashboard/store
2. Navigate to Settings > API
3. Add webhook URL: `https://your-site.netlify.app/.netlify/functions/printful-webhook`
4. Enable these events:
   - `order_created`
   - `order_updated`
   - `package_shipped`
   - `order_failed`
   - `order_canceled`

**Benefits:**
- Automatic tracking number updates
- Order status synchronization
- Email notifications (when implemented)
- Real-time fulfillment monitoring

## How Orders Flow

### Customer Purchase Flow

1. **Customer Orders**
   - Selects print size and quantity
   - Completes checkout with Stripe

2. **Payment Processing**
   - Stripe processes payment
   - Order created in database

3. **Automatic Fulfillment**
   - System detects Printful product
   - Sends order to Printful API
   - Printful order ID stored in database
   - Order status updated to "processing"

4. **Printful Fulfillment**
   - Printful receives order
   - Prints product with your photo
   - Ships directly to customer
   - Webhooks update your database

5. **Customer Receives Product**
   - Tracking updates via webhooks
   - Customer gets professional print
   - You earn profit margin

### Manual Fulfillment Trigger

If you need to manually send an order to Printful:

```javascript
// In browser console or via API
fetch('/.netlify/functions/printful-fulfill-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ order_id: 'your-order-uuid' })
});
```

## Admin Management

### Viewing Printful Orders

In the admin panel Orders tab, Printful orders show:
- Fulfillment type: "printful"
- Fulfillment status: "sent_to_printful", "printing", "shipped", etc.
- Printful dashboard URL (direct link to view in Printful)
- Tracking information (when shipped)

### Order Statuses

**Fulfillment Status Values:**
- `pending` - Order created, not sent to Printful yet
- `sent_to_printful` - Successfully submitted to Printful
- `printing` - Printful is printing the product
- `shipped` - Product shipped, tracking available
- `delivered` - Customer received product
- `failed` - Fulfillment failed (requires action)
- `cancelled` - Order cancelled

### Handling Failed Orders

If an order fails at Printful:
1. Check the "requires_action" flag in admin
2. Review "action_notes" for reason
3. Common issues:
   - Invalid image URL
   - Image resolution too low
   - Incorrect variant ID
   - Address validation failed
4. Fix the issue and retry manually

## Pricing Strategy

### Understanding Costs

**Printful Base Cost:** What Printful charges you
**Your Retail Price:** What customer pays
**Profit Margin:** Your retail price - Printful cost

### Recommended Markup

- **Posters/Prints:** 40-60% markup
- **Canvas:** 50-70% markup
- **Framed Prints:** 30-50% markup

### Example Pricing

| Product | Printful Cost | 40% Markup | Your Price | Profit |
|---------|---------------|------------|------------|--------|
| 8x10" Poster | $8.95 | $12.53 | $12.99 | $4.04 |
| 16x20" Canvas | $29.95 | $41.93 | $42.99 | $13.04 |
| 12x16" Framed | $36.95 | $51.73 | $51.99 | $15.04 |

### Dynamic Pricing

You can adjust markup percentage per product in the mapping interface:
- Higher markups for exclusive/limited work
- Lower markups for volume sales
- Seasonal promotions by updating product prices

## Image Requirements

### Printful Requirements

**Minimum Resolution:**
- 8x10": 2400x3000 pixels (300 DPI)
- 16x20": 4800x6000 pixels (300 DPI)
- 24x36": 7200x10800 pixels (300 DPI)

**File Format:**
- JPEG or PNG
- RGB color space
- sRGB color profile recommended

**File Size:**
- Maximum 100MB per image
- Recommended: 5-20MB for optimal processing

### Upload Best Practices

1. Upload highest resolution available
2. Use original uncompressed files when possible
3. Ensure proper color calibration
4. Test print one sample before selling
5. Check mockup previews for positioning

## Testing the Integration

### Test Mode Checklist

1. **Sync Catalog**
   - [ ] Successfully synced Printful products
   - [ ] Products appear in catalog tab
   - [ ] Variants loaded correctly

2. **Create Test Product**
   - [ ] Upload test image
   - [ ] Map to Printful product
   - [ ] Select variants
   - [ ] Product appears in shop

3. **Test Order Flow** (Optional)
   - [ ] Create test order
   - [ ] Verify order in database
   - [ ] Check Printful dashboard
   - [ ] Confirm order details match

4. **Webhook Testing**
   - [ ] Webhook URL configured
   - [ ] Test webhook delivery
   - [ ] Verify status updates
   - [ ] Check tracking updates

## Troubleshooting

### Sync Issues

**Problem:** Catalog sync fails
- Check API key is correct
- Verify environment variable loaded
- Check Printful API status
- Review browser console for errors

**Problem:** No products synced
- Printful may have changed product availability
- Try syncing again after a few minutes
- Check if account has access to catalog

### Fulfillment Issues

**Problem:** Order not sent to Printful
- Verify product has `printful_product_id`
- Check variant has `printful_variant_id`
- Ensure image URL is publicly accessible
- Review serverless function logs

**Problem:** Invalid variant ID error
- Re-sync Printful catalog
- Check if variant still available
- Update product mapping

**Problem:** Image upload failed
- Check image meets resolution requirements
- Verify file is under 100MB
- Ensure image is RGB color space
- Try different image format

### Webhook Issues

**Problem:** Status not updating
- Verify webhook URL correct
- Check webhook secret if using
- Test webhook manually from Printful
- Review webhook function logs

## Cost Management

### Estimating Costs

**Per Order Costs:**
- Printful base cost (varies by product)
- Shipping cost (calculated by Printful)
- Payment processing (Stripe: 2.9% + $0.30)

**No Monthly Fees:**
- Printful charges per order only
- No inventory costs
- No storage fees
- No minimum orders

### Profit Tracking

Track your profits in the admin panel:
1. View orders with Printful fulfillment
2. Compare retail price vs base cost
3. Calculate total profit margins
4. Export data for accounting

## Support Resources

### Printful Resources
- API Documentation: https://developers.printful.com
- Product Catalog: https://www.printful.com/products
- Mockup Generator: https://www.printful.com/mockup-generator
- Support: https://www.printful.com/contact

### Your Implementation
- Serverless Functions: `netlify/functions/printful-*.ts`
- Admin Components: `src/components/admin/Printful*.tsx`
- Database Schema: `supabase/migrations/`

## Advanced Features

### Mockup Generation (Implemented)

Automatically generate product mockups showing your photography on Printful products:

```javascript
// Generate mockup for a variant
const mockup = await fetch('/.netlify/functions/printful-generate-mockup', {
  method: 'POST',
  body: JSON.stringify({
    variant_id: 12345,
    image_url: 'https://your-image-url.jpg'
  })
});
```

### Batch Product Creation

Create multiple products from one photo:
1. Select photo in mapper
2. Choose multiple Printful products
3. System creates separate listings
4. Same photo, different print types

### Seasonal Collections

Organize products by season or theme:
1. Tag products in database
2. Create collection pages
3. Feature limited-time prints
4. Rotate featured products

## Security Notes

**API Key Security:**
- Never expose API key in client code
- Keep in environment variables only
- Use serverless functions for API calls
- Rotate keys periodically

**Order Data:**
- Customer data stored securely in Supabase
- PII protected with RLS policies
- Payment info never stored locally
- Stripe handles all payment data

## Next Steps

1. **Configure Printful account fully**
   - Add business details
   - Set up billing
   - Configure shipping options
   - Order sample prints

2. **Populate your catalog**
   - Upload best photography
   - Create initial products
   - Set competitive pricing
   - Write compelling descriptions

3. **Test thoroughly**
   - Place test order (use Printful test mode if available)
   - Verify fulfillment flow
   - Check webhook updates
   - Review product quality

4. **Launch**
   - Enable products in shop
   - Announce to customers
   - Monitor first orders closely
   - Gather customer feedback

## Summary

You now have a complete Printful integration that:
- ✅ Syncs Printful's catalog automatically
- ✅ Maps your photography to print products
- ✅ Calculates profitable pricing
- ✅ Fulfills orders automatically
- ✅ Tracks shipments via webhooks
- ✅ Requires no inventory management
- ✅ Scales with your business

Focus on creating great photography and marketing your shop - Printful handles the rest!
