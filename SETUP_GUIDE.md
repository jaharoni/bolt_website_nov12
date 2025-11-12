# Setup Guide

Complete guide to setting up your photography portfolio and print shop.

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your API keys (see below for details)

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## Feature Configuration

### Core Features (Already Working)

Your site includes these features out of the box:

- Photography portfolio with dynamic backgrounds
- Product catalog with glassmorphic design
- Shopping cart system
- Admin panel for managing media and products
- Contact form
- Responsive mobile design

### Optional Features (Require API Keys)

#### 1. AI-Powered Search & Chat

**What it does:** Transforms your search bar into an intelligent assistant that can answer questions about your work and help visitors navigate the site.

**Setup:**
1. Create an OpenAI account at https://platform.openai.com
2. Generate an API key
3. Add to `.env`:
   ```
   VITE_OPENAI_API_KEY=sk-...your-key-here
   ```

**Usage:**
- Short queries navigate the site (e.g., "gallery", "about")
- Conversational queries trigger AI chat (e.g., "What kind of photography does Justin do?")
- Click the chat icon to open AI assistant anytime

**Cost:** ~$0.002 per conversation (using GPT-4o-mini). Budget $10-20/month for moderate traffic.

#### 2. Printful Print-on-Demand

**What it does:** Automatically fulfills print orders through Printful's print-on-demand service. No inventory needed!

**Setup:**
1. Create a Printful account at https://www.printful.com
2. Set up your store in the Printful dashboard
3. Get your API key from Settings > API
4. Add to `.env`:
   ```
   VITE_PRINTFUL_API_KEY=your-key-here
   ```

**Usage:**
- Mark products as `fulfillment_method: 'printful'` in the database
- When customers order, the system automatically sends the order to Printful
- Printful prints and ships directly to customers
- Track order status in your admin panel

**Cost:** Pay per product printed + shipping. No monthly fees. Typical print costs: $10-30 per item.

#### 3. Stripe Payment Processing

**What it does:** Securely processes credit card payments for your prints and merchandise.

**Setup:**
1. Create a Stripe account at https://stripe.com
2. Get your publishable key from the Dashboard
3. Add to `.env`:
   ```
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...your-key-here
   ```

**Usage:**
- Customers can pay directly on your site
- Payments are processed securely through Stripe
- You receive payouts to your bank account
- Full PCI compliance included

**Cost:** 2.9% + $0.30 per transaction. No monthly fees.

## Brand Logo Configuration

The About page displays logos of brands you've worked with. They appear in random order on each page visit for a dynamic feel.

**To add more brands:**

Edit `src/lib/brandLogos.ts` and add to the `brands` array:

```typescript
{
  name: 'Your Brand',
  logoUrl: 'https://logo.clearbit.com/yourbrand.com',
  fallbackColor: '#000000'
}
```

**Logo sources:**
- Clearbit Logo API automatically fetches logos from domains
- If a logo fails to load, the brand name appears as fallback text
- Logos display in grayscale and reveal color on hover for a classy look

## Database Setup

### Run Migrations

Your Supabase database needs these tables. Run migrations in order:

1. Go to Supabase Dashboard > SQL Editor
2. Run each migration file from `supabase/migrations/`
3. Migrations create:
   - Products catalog
   - Customer records
   - Orders and order items
   - Media library
   - Printful integration tables

### Seed Initial Data

To add sample products for testing:

```bash
# In your browser console on the /admin page:
import('./src/lib/seedProducts').then(m => m.seedProducts())
```

Or add products manually via the Admin panel at `/admin`.

## Admin Panel Usage

Access the admin panel at `/admin` to manage your site:

### Media Library
- Upload images for backgrounds and gallery
- Organize by context (background, commercial, personal, etc.)
- Set device orientation for proper display
- Delete unused images

### Product Management
- Add new prints and merchandise
- Set prices and available sizes
- Upload product images
- Mark as Printful or manual fulfillment
- Set inventory limits

### Order Management
- View all customer orders
- Track fulfillment status
- Export info for manual Miller's Lab orders
- Update order status

## Manual Fulfillment (Miller's Lab)

For premium prints through Miller's Lab:

1. **Mark Products:** Set `fulfillment_method: 'manual'` on premium products
2. **Receive Orders:** Orders appear in admin panel marked "Requires Manual Processing"
3. **Export Details:** Copy customer info and order details
4. **Submit to Miller's Lab:** Manually place order on Miller's Lab website
5. **Update Status:** Mark order as fulfilled in admin panel

## Content Management

### Adding Gallery Images

1. Go to `/admin`
2. Click "Media Library"
3. Upload images
4. Select context (e.g., "commercial", "personal")
5. Set device orientation
6. Images automatically appear in gallery

### Adding Background Images

1. Upload via Media Library
2. Select context: "background"
3. Images rotate automatically on homepage

### Adding Shop Products

1. Go to `/admin`
2. Click "Products"
3. Add new product with:
   - Title and description
   - Base price
   - Available sizes/variants
   - Product images
   - Category (art, digital, merchandise, limited)
   - Fulfillment method

## Customization

### Colors & Branding

The site uses a sophisticated glassmorphic design with warm tones. To customize:

- Edit `tailwind.config.js` for color schemes
- Modify `src/index.css` for glass effects
- Update typography in `tailwind.config.js`

### Homepage Content

Edit `src/pages/Home.tsx`:
- Update name and tagline
- Modify navigation links
- Adjust call-to-action buttons

### About Page

Edit `src/pages/About.tsx`:
- Update bio and experience
- Add or remove skills
- Modify brand collaborators

## Deployment

See `DEPLOYMENT.md` for complete deployment instructions for:
- Vercel (recommended)
- Netlify
- Other hosting platforms

## Troubleshooting

### Search doesn't open AI chat
- Check if VITE_OPENAI_API_KEY is set
- Try a conversational query: "What services does Justin offer?"
- Check browser console for errors

### Brand logos not loading
- Clearbit Logo API requires valid domain names
- Check logo URLs are accessible
- Fallback text appears if logo fails

### Cart items disappear
- Cart is stored in localStorage
- Clearing browser data resets cart
- This is normal behavior

### Images not uploading
- Check Supabase storage bucket permissions
- Verify file size under 10MB
- Ensure bucket "product-images" exists

### Build warnings about chunk size
- Normal for this project size
- Can be optimized with code splitting if needed
- Doesn't affect functionality

## Support

For issues or questions:

1. Check browser console for errors
2. Verify environment variables are set
3. Review `DEPLOYMENT.md` for production setup
4. Check Supabase logs for database issues

## Development Tips

- Use `npm run dev` for hot reloading
- Check `npm run build` before deploying
- Test on mobile devices regularly
- Monitor API usage costs (OpenAI, Printful)
- Keep dependencies updated: `npm update`

## Next Steps

1. Add your actual API keys to `.env`
2. Upload your photography to the gallery
3. Add products to the shop
4. Test the complete purchase flow
5. Deploy to production (see DEPLOYMENT.md)
6. Share your site with the world!
