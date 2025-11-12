import { supabase } from './supabase';

export async function setupStorageBuckets() {
  // Storage buckets are now created via database migrations
  // This function just verifies they exist

  const requiredBuckets = ['backgrounds', 'gallery', 'essays', 'shop'];
  const results = [];

  try {
    const { data: existingBuckets, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Error listing buckets:', error);
      return [{ status: 'error', error: error.message }];
    }

    for (const bucketName of requiredBuckets) {
      const bucketExists = existingBuckets?.some(b => b.name === bucketName);

      if (bucketExists) {
        console.log(`✓ Bucket ${bucketName} is available`);
        results.push({ bucket: bucketName, status: 'ready' });
      } else {
        console.warn(`⚠ Bucket ${bucketName} not found - run migrations to create it`);
        results.push({ bucket: bucketName, status: 'missing' });
      }
    }

    return results;
  } catch (error: any) {
    console.error('Error checking storage buckets:', error);
    return [{ status: 'error', error: error.message }];
  }
}

export async function setupStoragePolicies() {
  console.log('Storage policies are managed through RLS on the media_items table');
  console.log('Buckets are public by default for read access');
  console.log('Upload permissions are controlled through authentication');

  return { status: 'policies_configured' };
}
