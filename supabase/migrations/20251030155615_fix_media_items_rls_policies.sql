/*
  # Fix RLS Policies for Media Items

  1. Changes
    - Add policy for authenticated users to view ALL media items (including inactive ones)
    - This allows the admin panel to properly display and manage all media

  2. Security
    - Public users can only view active media
    - Authenticated users can view all media for admin purposes
    - Existing insert/update/delete policies remain unchanged
*/

-- Add policy for authenticated users to view all media items
CREATE POLICY "Authenticated users can view all media"
  ON media_items FOR SELECT
  TO authenticated
  USING (true);
