# Quick Start Guide

## Your Site is Fixed! 🎉

Everything is working and your data is backed up. Here's what you need to know:

## Current Status

✅ **Site builds successfully**
✅ **All Supabase connections working**
✅ **Full admin panel restored**
✅ **Complete backup created**
✅ **Shop disabled** (as requested)
✅ **Analytics disabled** (as requested)

## Your Backup

**Location**: `backups/2025-10-30T15-44-07-084Z/`

Your current data:
- 14 media items
- 6 essays
- 10 site settings
- 12 printful products
- 4 printful settings

To restore if needed:
```bash
npm run db:backup  # Create new backup
npm run db:restore 2025-10-30T15-44-07-084Z  # Restore
```

## Admin Panel Overview

Access at: `/admin`

### 1. Media Library
- Upload images to Supabase
- Edit titles, alt text, tags
- Bulk operations
- Copy image URLs

### 2. Shop Manager
- **Currently DISABLED**
- Toggle on when ready
- Full product management
- Category filtering
- Image galleries
- Inventory tracking

### 3. Essays Manager
- Create/edit essays
- Add featured images
- Publish/draft workflow
- Tag management
- Preview functionality

### 4. LTO Campaign Manager
- Create limited-time print offers
- Manage variants (sizes, prices)
- Set end conditions
- Track progress

### 5. Settings
- Shop toggle (currently OFF)
- AI features configuration
- SEO defaults
- Background images

## Enable Shop When Ready

Two ways:

**Option 1 - Settings Manager**:
1. Go to Admin → Settings
2. Check "Enable Shop"
3. Click "Save Changes"

**Option 2 - Shop Manager**:
1. Go to Admin → Shop
2. Click "Enable Shop" button
3. Shop goes live immediately

## Add Your First Product

1. Go to Admin → Shop → Products tab
2. Click "New Product"
3. Fill in details:
   - Product name
   - Description
   - Price
   - Category
4. Add images from media library
5. Click "Create Product"
6. Toggle "Active" to make it visible

## What Changed

### New Files
- `scripts/backup-supabase.ts` - Backup utility
- `scripts/restore-supabase.ts` - Restore utility
- `src/components/admin/ProductsManager.tsx` - Full product CRUD
- Updated `src/components/admin/ShopManagerNew.tsx` - With toggle

### New Database Tables
- `lto_offers` - Campaign management
- `lto_variants` - Variant options

### Updated Files
- `package.json` - Added backup/restore scripts
- All admin components verified working

## Common Tasks

### Create a Backup
```bash
npm run db:backup
```

### Upload Media
1. Admin → Media
2. Click "Upload"
3. Select images
4. Edit metadata
5. Use in products/essays

### Publish an Essay
1. Admin → Essays
2. Click "New Essay" or edit existing
3. Add title, content, featured image
4. Change status to "Published"
5. Click "Save"

### Create a Campaign
1. Admin → LTO
2. Click "New Campaign"
3. Set title, description, end conditions
4. Add variants (sizes/prices)
5. Activate when ready

## Troubleshooting

**Site won't build?**
```bash
npm install  # Reinstall dependencies
npm run build  # Check for errors
```

**Images not showing?**
- Verify Supabase Storage permissions
- Check media items have valid public_url
- Ensure bucket_name is correct

**Admin panel won't load?**
- Check your email is in VITE_ADMIN_EMAILS (.env file)
- Verify you're logged in
- Check browser console for errors

## Need to Revert?

If anything goes wrong, restore your backup:

```bash
# Restore safely (requires confirmation)
npm run db:restore 2025-10-30T15-44-07-084Z

# Force restore (skips confirmation)
CONFIRM_RESTORE=yes npm run db:restore 2025-10-30T15-44-07-084Z
```

## Next Steps

1. ✅ **Data is backed up** - You're safe!
2. 🎨 **Add products** - When shop is enabled
3. 📝 **Publish essays** - Content is ready
4. 🖼️ **Upload media** - Add your images
5. 🎯 **Create campaigns** - Limited-time offers
6. 🚀 **Enable shop** - Go live when ready

---

Everything is working. Your data is safe. You can start using the admin panel immediately!

**Need help?** Check `IMPLEMENTATION_COMPLETE.md` for detailed documentation.
