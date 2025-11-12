# Admin Panel Login Guide

## What Was Fixed

The admin panel now has a complete authentication system with:

1. **Login/Signup Form** - Create an admin account or sign in
2. **Session Management** - Secure authentication via Supabase Auth
3. **Email Whitelist** - Optional admin email restriction
4. **Error Handling** - Clear error messages for all auth issues
5. **Logout Functionality** - Sign out from both the admin panel and access pages

## How to Access the Admin Panel

### Step 1: Navigate to Admin
Go to: `http://localhost:5173/admin` (or your deployed URL + `/admin`)

### Step 2: Create Your Admin Account
1. You'll see a login form with "Admin Access" as the title
2. Click "Need an account? Sign up" at the bottom
3. Enter your email and password (minimum 6 characters)
4. Click "Sign Up"

### Step 3: Access the Admin Panel
After signing up, you'll be automatically logged in and can access all admin features:
- **Media** - Upload and manage images/videos
- **Essays** - Create and publish blog posts
- **Shop** - Manage products and inventory
- **LTO** - Limited Time Offer campaigns
- **Settings** - Site configuration

## Admin Email Configuration

### Current Setting (Recommended for Setup)
```env
VITE_ADMIN_EMAILS=
```
**Empty = All authenticated users can access admin panel**

This is perfect for getting started. Any user who creates an account can access the admin.

### Restrict to Specific Emails (Production)
Once you're ready to lock down admin access, update `.env`:
```env
VITE_ADMIN_EMAILS=your@email.com,colleague@email.com
```

After updating `.env`, restart your dev server for changes to take effect.

## Features

### On the Login Page
- Toggle between Login and Signup modes
- Password validation (minimum 6 characters)
- Clear error messages for auth issues
- Shows current admin email configuration

### Inside the Admin Panel
- Sidebar navigation for all admin sections
- "Sign Out" button at the bottom of the sidebar
- Error boundaries to prevent crashes
- Lazy-loaded components for better performance

## Troubleshooting

### "Auth session missing!" Error
**Fixed!** This was the original issue. The admin panel now shows a login form instead of this error.

### Can't Access After Login
1. Check browser console for errors
2. Verify your email matches `VITE_ADMIN_EMAILS` (if configured)
3. Try logging out and back in

### Forgot Password
Currently, there's no password reset flow. You can:
1. Create a new account with a different email
2. Reset password via Supabase dashboard manually
3. Implement a password reset flow if needed

## Database Tables

All required tables are already created:
- ✅ `media_items` - Media library
- ✅ `essays` - Blog posts
- ✅ `products` - Shop items
- ✅ `site_settings` - Configuration
- ✅ `lto_offers` - Limited time campaigns
- ✅ `lto_variants` - Campaign products

## Security Notes

1. **RLS Enabled** - Row Level Security is active on all tables
2. **Authenticated Access** - Admin operations require authentication
3. **Session-Based** - Uses Supabase Auth sessions (secure & automatic)
4. **Email Confirmation** - Disabled by default in Supabase for faster testing

## Next Steps

1. **Create Your Admin Account** - Use the signup form at `/admin`
2. **Upload Media** - Add images for your gallery and products
3. **Create Products** - Set up your shop inventory
4. **Write Essays** - Publish blog content
5. **Configure Settings** - Customize your site

## Production Deployment

Before deploying to production:
1. Set specific admin emails in `VITE_ADMIN_EMAILS`
2. Enable email confirmation in Supabase Auth settings
3. Consider adding 2FA for admin accounts
4. Review and tighten RLS policies if needed

---

**Quick Start**: Visit `/admin`, click "Sign up", create your account, and start managing your site!
