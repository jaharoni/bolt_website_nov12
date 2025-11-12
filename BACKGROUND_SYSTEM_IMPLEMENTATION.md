# Flicker-Free Background System Implementation

## Overview

This document summarizes the implementation of the enhanced background system, improved admin UI, and folder management features for the portfolio CMS.

## Core Features Implemented

### 1. Flicker-Free Background System

**New Utilities:**
- `src/lib/random.ts` - Session-seeded random selection using Mulberry32 PRNG
- `src/lib/imagePreload.ts` - Image decode-before-swap functionality

**New Components:**
- `src/components/CrossfadeBackground.tsx` - Two-layer crossfade with opacity transitions
- `src/components/PageBackground.tsx` - Zone-based routing with automatic fallback
- `src/components/AppLayout.tsx` - Persistent wrapper to prevent background unmount

**Key Benefits:**
- No flicker on route changes (background layer persists)
- Session-stable random selection (no jitter on re-renders)
- Smooth crossfade transitions with decode-before-swap
- Automatic zone-to-route mapping

### 2. Zone-Based Page Control

**Route-to-Zone Mapping:**
- `/` → `home.background`
- `/gallery` → `page.gallery.background`
- `/gallery/:slug` → `page.gallery.{slug}.background` (with fallback)
- `/about` → `page.about.background`
- `/essays` → `page.essays.background`
- `/shop` → `page.shop.background`
- `/contact` → `page.contact.background`

**Fallback Logic:**
1. Try specific zone (e.g., `page.gallery.wedding.background`)
2. Try general zone (e.g., `page.gallery.background`)
3. For galleries: Auto-fallback to gallery items with seeded random

### 3. Enhanced Admin UI

**ZonesManager Improvements:**
- Modern card-based layout with better spacing
- Dropdown selectors for folders and galleries
- Live preview functionality
- Visual mode explanations with tooltips
- Quick reference sidebar with folder/gallery lists
- Improved form controls with focus states

**MediaLibraryPro Enhancements:**
- Folder deletion with cascade options
- Inline folder renaming
- Item count display per folder
- Hover-activated edit/delete buttons
- Confirmation dialogs for destructive operations

**GalleriesManager Features:**
- One-click "Create Zone" button per gallery
- Visual indicator for galleries with background zones
- Auto-generates zone key: `page.gallery.{slug}.background`
- Links zone directly to gallery source

### 4. Text Blocks Integration

**New Hook:**
- `src/hooks/useTextBlock.ts` - Fetch text blocks from Supabase

**Integrated Components:**
- **Navbar**: `nav.brand` (default: "Justin Aharoni")
- **Footer**:
  - `footer.quote` (default: "eat more waffles")
  - `footer.copyright` (default: "© 2025 Justin Aharoni")

### 5. Router Architecture Update

**Changes:**
- Added `AppLayout` wrapper around all routes
- Added `/gallery/:slug` route for detail pages
- Maintains lazy loading for code splitting
- Background layer persists across all route changes

## Technical Details

### Performance Optimizations

1. **CSS Contain**: `contain: paint` on background layer
2. **Will Change**: `will-change: opacity` for smooth transitions
3. **Session Cache**: Decoded images cached in session
4. **RAF Throttling**: Scroll handlers use requestAnimationFrame

### Session-Seeded Random Algorithm

Uses Mulberry32 PRNG with session-persistent seeds stored in `sessionStorage`:
- Key format: `zone-seed:{zoneKey}`
- Same image shows throughout session
- Refreshes on browser reload/new tab

### Crossfade Implementation

Two-layer system:
1. **Front Layer**: Currently visible image (opacity: 1)
2. **Back Layer**: Staging area for next image (opacity: 0)

Process:
1. Set new image on back layer
2. Decode image asynchronously
3. Swap: back becomes front (CSS transition)
4. Clean up old front after 450ms

## Usage Guide

### Creating a Background Zone

1. Navigate to **Admin → Zones**
2. Select or create zone key (e.g., `page.about.background`)
3. Configure:
   - **Mode**: random (session-stable)
   - **Source**: tag, folder, or gallery
   - **Limit**: number of candidates
4. Click "Preview Images" to test
5. Click "Save Changes"

### Quick Gallery Background Setup

1. Navigate to **Admin → Galleries**
2. Find your gallery in the list
3. Click "Create Zone" button
4. Zone auto-created with gallery source
5. Green checkmark indicates zone exists

### Managing Folders

**Create Folder:**
- Click "New" in sidebar

**Rename Folder:**
- Hover over folder
- Click pencil icon
- Enter new name

**Delete Folder:**
- Hover over folder
- Click trash icon
- Confirm action
- Items auto-moved to root

### Editing Text Blocks

1. Navigate to **Admin → Text**
2. Click "New Block" or "Edit" existing
3. Enter key (e.g., `footer.quote`)
4. Add markdown content
5. Save

## Migration Notes

### Existing Backgrounds

Your existing `UnifiedBackground` component is still in use on pages that don't use the Layout (like admin). The new system runs in parallel and doesn't interfere.

### Database Requirements

All features use existing Supabase tables:
- `site_zones` - Zone configurations
- `text_blocks` - Editable text content
- `media_items` - Media library
- `media_folders` - Folder organization
- `galleries` - Gallery management
- `gallery_items` - Gallery-media relationships

## Testing Checklist

- [x] Build completes without errors
- [ ] Navigate between routes (no flicker)
- [ ] Create a zone in Admin → Zones
- [ ] Preview images in zone manager
- [ ] Create background zone from gallery
- [ ] Edit text block and see it on page
- [ ] Create/rename/delete folder
- [ ] Check green checkmark on galleries with zones

## Future Enhancements

**Potential Additions:**
- Drag-and-drop folder organization
- Bulk zone operations
- Zone templates
- Background transition effects selector
- Text block markdown preview
- Image-specific zones (per media item)
- Weighted random mode implementation

## Support

The new background system coexists with your existing setup. If you need to revert:
1. Remove `AppLayout` from Router
2. Keep using `UnifiedBackground` component
3. New zones and text blocks remain in database

All new features are backward compatible and opt-in through the admin interface.
