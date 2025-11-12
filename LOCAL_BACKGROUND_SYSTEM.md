# Local Background System Implementation

## Overview

Successfully converted the background system from Supabase database dependency to a local file-based system. Backgrounds now load from local JSON manifest and image files with no external API calls.

## What Changed

### New Files Created

1. **`/src/data/media.manifest.json`** - JSON manifest containing image metadata for all pages
2. **`/src/lib/localBackgroundService.ts`** - Service to load manifest and select images
3. **`/src/hooks/useLocalPageBackground.ts`** - Hook to provide background images
4. **`/src/lib/backgroundSettings.ts`** - localStorage-based settings management
5. **`/public/images/`** - Directory structure for organizing backgrounds by page

### Modified Files

1. **`RandomizedPageBackground.tsx`** - Now uses local hook instead of Supabase queries
2. **`PageBackground.tsx`** - Simplified to use local image selection
3. **`tsconfig.app.json`** - Added `resolveJsonModule: true` for JSON imports
4. **`src/lib/random.ts`** - Exported `seededRandom` and `mulberry32` functions

### Directory Structure

```
public/images/
├── home/          (slideshow mode, 6-second rotation)
├── gallery/       (random mode)
├── essays/        (random mode)
├── about/         (random mode)
├── shop/          (random mode)
└── contact/       (random mode)
```

## How It Works

### Image Selection

- **Home Page**: Slideshow mode with 6-second interval (configurable)
- **Other Pages**: Session-stable random selection using Mulberry32 PRNG
- Same image throughout session, changes on browser reload

### Settings Storage

- Settings stored in localStorage with keys: `bg-settings:{pageKey}`
- Manifest includes default settings for each page
- Can be overridden per-session via localStorage

### Session Seeds

- Seeds stored in sessionStorage with keys: `bg-seed:{pageKey}`
- Ensures same random selection throughout session
- Different seed per browser tab/window

## Adding New Backgrounds

1. Add image file to appropriate folder in `/public/images/`
2. Update `/src/data/media.manifest.json`:
   ```json
   {
     "id": "unique-id",
     "path": "/images/home/my-image.jpg",
     "alt": "Description",
     "title": "Image Title"
   }
   ```

## API

### `useLocalPageBackground(pageKey: string)`

Returns: `{ image: LocalBackgroundImage | null, loading: boolean }`

Example:
```tsx
const { image, loading } = useLocalPageBackground('home');
```

### `selectRandomImage(pageKey: string)`

Returns session-stable random image for the given page.

### `getBackgroundSettings(pageKey: string)`

Returns current settings for page (localStorage overrides manifest defaults).

### `updateBackgroundSettings(pageKey, settings)`

Updates localStorage settings for a page.

## Benefits

- **No database dependency** for backgrounds
- **Faster load times** (no API calls)
- **Simpler deployment** (just static files)
- **Full local control** over images
- **Session-stable selection** preserved
- **Smooth crossfade** transitions maintained

## Migration Notes

- Old Supabase components (`UnifiedBackground`, `useRandomPageImage`) still exist but are unused
- `ZonesManager` and related admin UI can be removed or adapted for localStorage
- All existing crossfade and preload optimizations preserved
- Backwards compatible - old components won't break existing pages

## Status

✅ Build successful
✅ No Supabase queries for backgrounds
✅ Local manifest system working
✅ Session-stable random selection
✅ Slideshow mode for home page
✅ localStorage settings management
