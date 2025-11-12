import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function importBackupImages() {
  console.log('🔍 Loading backup file...');

  const backupPath = path.join(process.cwd(), 'backups/2025-10-30T17-20-54-456Z/supabase-backup.json');
  const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

  const oldImages = backupData.tables.media_items || [];
  console.log(`📦 Found ${oldImages.length} images in backup`);

  // Get the current Backgrounds folder ID
  const { data: folder } = await supabase
    .from('media_folders')
    .select('id')
    .eq('name', 'Backgrounds')
    .single();

  if (!folder) {
    console.error('❌ Backgrounds folder not found');
    process.exit(1);
  }

  console.log(`✅ Found Backgrounds folder: ${folder.id}`);
  console.log('');

  let added = 0;
  let skipped = 0;

  for (const img of oldImages) {
    // Check if this image already exists (by title)
    const { data: existing } = await supabase
      .from('media_items')
      .select('id')
      .eq('title', img.title)
      .maybeSingle();

    if (existing) {
      console.log(`⏭️  Skip: ${img.title} (already exists)`);
      skipped++;
      continue;
    }

    // Insert the image with the old public URL (still accessible)
    const { error } = await supabase
      .from('media_items')
      .insert({
        filename: img.filename,
        storage_path: img.storage_path,
        bucket_name: 'backgrounds', // Normalize to current bucket
        public_url: img.public_url, // Keep old URL - still works!
        media_type: img.media_type,
        mime_type: img.mime_type,
        file_size: img.file_size,
        width: img.width,
        height: img.height,
        title: img.title,
        description: img.description,
        alt_text: img.alt_text,
        tags: img.tags || [],
        is_active: true,
        folder_id: folder.id,
        device_orientation: img.device_orientation || 'horizontal',
      });

    if (error) {
      console.error(`❌ Error adding ${img.title}:`, error.message);
    } else {
      console.log(`✅ Added: ${img.title}`);
      added++;
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Import complete!`);
  console.log(`   Added: ${added} images`);
  console.log(`   Skipped: ${skipped} images`);
  console.log(`   Total in Backgrounds folder: ${added + skipped + 10}`);
  console.log('═══════════════════════════════════════');
}

importBackupImages().catch(console.error);
