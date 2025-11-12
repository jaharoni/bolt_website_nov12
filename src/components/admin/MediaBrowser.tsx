import { useState, useEffect } from 'react';
import { Folder, Image as ImageIcon, Upload, Trash2, FolderPlus } from 'lucide-react';
import { supabase, getMediaFolders } from '../../lib/supabase';
import type { Media, MediaFolder } from '../../lib/types';

type MediaBrowserProps = {
  onSelect?: (url: string) => void;
  allowUpload?: boolean;
  allowDelete?: boolean;
  allowFolders?: boolean;
};

export function MediaBrowser({
  onSelect,
  allowUpload = true,
  allowDelete = true,
  allowFolders = true
}: MediaBrowserProps) {
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [mediaItems, setMediaItems] = useState<Media[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentFolderId]);

  async function loadData() {
    setLoading(true);
    try {
      const folderData = await getMediaFolders();
      setFolders(folderData);

      const { data: media, error } = await supabase
        .from('media_items')
        .select('*')
        .eq('folder_id', currentFolderId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMediaItems(media || []);
    } catch (error) {
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!selectedFile) return;

    try {
      const bucket = 'public';
      const path = `uploads/${Date.now()}-${selectedFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, selectedFile, { upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

      await supabase.from('media_items').insert({
        filename: selectedFile.name,
        storage_path: path,
        bucket_name: bucket,
        public_url: urlData.publicUrl,
        media_type: selectedFile.type.startsWith('image') ? 'image' : 'video',
        mime_type: selectedFile.type,
        file_size: selectedFile.size,
        title: selectedFile.name.replace(/\.[^/.]+$/, ''),
        folder_id: currentFolderId,
        tags: [],
        is_active: true,
      });

      setSelectedFile(null);
      await loadData();
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed');
    }
  }

  async function handleDeleteMedia(mediaId: string, storagePath: string, bucketName: string) {
    if (!confirm('Delete this file?')) return;

    try {
      await supabase.storage.from(bucketName).remove([storagePath]);
      await supabase.from('media_items').delete().eq('id', mediaId);
      await loadData();
      alert('Deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed');
    }
  }

  async function createFolder() {
    const name = prompt('Enter folder name:');
    if (!name) return;

    try {
      await supabase.from('media_folders').insert({
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        parent_id: currentFolderId,
        is_active: true
      });

      await loadData();
      alert('Folder created successfully!');
    } catch (error) {
      console.error('Create folder error:', error);
      alert('Failed to create folder');
    }
  }

  function navigateToFolder(folderId: string) {
    setCurrentFolderId(folderId);
  }

  function navigateUp() {
    const currentFolder = folders.find(f => f.id === currentFolderId);
    setCurrentFolderId(currentFolder?.parent_id || null);
  }

  const currentFolderPath = currentFolderId
    ? folders.find(f => f.id === currentFolderId)?.name || 'media'
    : 'media';

  const subfolders = folders.filter(f => f.parent_id === currentFolderId);

  if (loading) return <div className="p-4 text-white">Loading...</div>;

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={navigateUp}
            disabled={!currentFolderId}
            className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            ← Back
          </button>
          <span className="text-white">/{currentFolderPath}</span>
        </div>
        <div className="flex gap-2">
          {allowFolders && (
            <button
              onClick={createFolder}
              className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
          )}
        </div>
      </div>

      {allowUpload && (
        <div className="mb-4 p-4 bg-gray-700 rounded">
          <div className="flex gap-2">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="flex-1 text-white"
              accept="image/*,video/*"
            />
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {subfolders.map((folder) => (
          <div key={folder.id} className="relative group">
            <button
              onClick={() => navigateToFolder(folder.id)}
              className="w-full aspect-square bg-gray-700 rounded flex flex-col items-center justify-center hover:bg-gray-600"
            >
              <Folder className="w-12 h-12 text-blue-400" />
              <span className="text-sm text-white mt-2">{folder.name}</span>
            </button>
          </div>
        ))}

        {mediaItems.map((media) => (
          <div key={media.id} className="relative group">
            <div
              onClick={() => onSelect?.(media.public_url)}
              className="cursor-pointer"
            >
              <img
                src={media.public_url}
                alt={media.alt_text || media.filename}
                className="w-full aspect-square object-cover rounded"
              />
              <p className="text-xs text-white mt-1 truncate">{media.title || media.filename}</p>
            </div>

            {allowDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteMedia(media.id, media.storage_path, media.bucket_name);
                }}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
