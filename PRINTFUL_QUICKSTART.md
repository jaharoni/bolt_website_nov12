# Printful Integration - Quick Start

## 5-Minute Setup

### 1. Get Your Printful API Key
```
1. Go to https://www.printful.com/dashboard/store
2. Click Settings > API
3. Copy your API key
```

### 2. Add to Environment
```bash
# Add to .env file
VITE_PRINTFUL_API_KEY=your_printful_api_key_here
```

### 3. Sync Catalog (First Time Only)
```
1. Go to https://your-site.com/admin
2. Click "Printful Catalog" tab
3. Click "Sync from Printful" button
4. Wait 2-3 minutes for sync to complete
```

### 4. Create Your First Product
```
1. Click "Map to Printful" tab
2. Select a photo (Step 1)
3. Choose a print type (Step 2)
4. Select sizes to offer (Step 3)
5. Set title and adjust markup
6. Click "Create Product"
```

### 5. Configure Webhook (Optional)
```
Printful Dashboard > Settings > API > Webhooks
Add: https://your-site.netlify.app/.netlify/functions/printful-webhook

Enable events:
☑ order_created
☑ order_updated
☑ package_shipped
☑ order_failed
```

## What Happens When Customer Orders

```
1. Customer selects print size → Adds to cart
2. Customer checks out → Stripe processes payment
3. Order automatically sent to Printful → Prints & ships
4. Tracking updates via webhook → Customer notified
5. You get paid (profit margin) → Printful gets base cost
```

## Files Created

**Serverless Functions:**
- `netlify/functions/printful-sync-catalog.ts` - Syncs Printful catalog
- `netlify/functions/printful-fulfill-order.ts` - Sends orders to Printful
- `netlify/functions/printful-webhook.ts` - Receives order updates
- `netlify/functions/printful-generate-mockup.ts` - Generates product previews

**Admin Components:**
- `src/components/admin/PrintfulCatalog.tsx` - Browse Printful products
- `src/components/admin/PrintfulProductMapper.tsx` - Map photos to prints

**Documentation:**
- `PRINTFUL_INTEGRATION_GUIDE.md` - Complete guide
- `PRINTFUL_QUICKSTART.md` - This file

## Key Features

✅ **Automatic Catalog Sync** - Pull Printful's latest products
✅ **Visual Product Mapper** - Easy photo-to-print mapping
✅ **Smart Pricing** - Calculate profitable markups
✅ **Auto Fulfillment** - Orders sent to Printful automatically
✅ **Webhook Updates** - Real-time tracking info
✅ **No Inventory** - Print on demand, ship direct
✅ **Profit Tracking** - See margins for each product

## Pricing Example

```
Printful Base Cost:    $15.00  (8x10" poster)
Your Markup (40%):     + $6.00
Customer Pays:         $21.00
Your Profit:           $6.00 per sale
```

## Support

- Full Guide: See `PRINTFUL_INTEGRATION_GUIDE.md`
- Printful Docs: https://developers.printful.com
- Test the integration thoroughly before launching!

## Next Steps

1. ✅ Sync catalog
2. ✅ Upload your best photography
3. ✅ Create 5-10 test products
4. ✅ Order one sample print
5. ✅ Set up webhook
6. ✅ Launch to customers

**You're ready to sell prints with zero inventory!**
