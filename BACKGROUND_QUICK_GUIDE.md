# Background Management - Quick Reference

## TL;DR
✅ **All pages now have working backgrounds**
✅ **13 images ready to display**
✅ **Configure everything from Admin panel → Zones tab**

## Quick Access

**Admin Panel**: Navigate to `/admin` → Click "Zones" tab

## Common Tasks

### Change Backgrounds for Homepage
1. Go to Admin → Zones
2. Select "home.background" from dropdown
3. Click "Preview" to see current images
4. To change: Select different folder or modify settings
5. Click "Save Config"

### Create Page-Specific Backgrounds
1. Go to Admin → Media Library
2. Create new folder (e.g., "Shop Backgrounds")
3. Upload/move images to that folder
4. Go to Admin → Zones
5. Select the page (e.g., "page.shop.background")
6. Change source type to "Folder"
7. Select your new folder
8. Save

### Add New Background Images
1. Go to Admin → Media Library
2. Upload new images
3. Assign them to "Backgrounds" folder
4. They'll automatically appear in rotation

### Check What Images Are Being Used
1. Go to Admin → Zones
2. Select any page configuration
3. Click "Preview" button
4. Thumbnails show what's currently configured

## Current Setup

- **All pages**: Using "Backgrounds" folder
- **Total images**: 13 backgrounds
- **Display mode**: Random (new image on each page load)
- **Fallback**: Gradient if images fail to load

## Folder Structure

```
media_folders/
├── Backgrounds (13 images) ← Currently used by all pages
├── Gallery
├── Shop Products
├── Essays
├── Videos
├── Marketing
├── The Well (catch-all)
└── Uncategorized
```

## Page Configurations

All pages point to the same "Backgrounds" folder:
- Homepage: `home.background`
- About: `page.about.background`
- Contact: `page.contact.background`
- Shop: `page.shop.background`
- Gallery: `page.gallery.background`
- Essays: `page.essays.background`

## Troubleshooting

**Backgrounds not showing?**
- Check browser console for `[useRandomPageImage]` logs
- Verify images are in the correct folder in Media Library
- Ensure images have `is_active = true`
- Check zone configuration in Admin → Zones

**Want different backgrounds per page?**
- Create separate folders for each page
- Configure each zone to use its dedicated folder
- Upload page-specific images to respective folders

**Need to update quickly?**
- Go to Admin → Zones
- Use "Preview" to see current images
- Make changes and save
- Backgrounds update immediately on next page load

---

**Everything is working!** Open your site in a browser and navigate between pages to see random backgrounds in action.
