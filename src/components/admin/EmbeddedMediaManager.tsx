import React, { useState, useEffect, useMemo } from 'react';
import { Upload, X, Image as ImageIcon, FolderOpen, ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Media, MediaFolder } from '../../lib/types';
import ImageService from '../../lib/imageService';
import slugify from '../../lib/slugify';

interface EmbeddedMediaManagerProps {
  mode: 'single' | 'multiple';
  selectedMediaIds: string[];
  onMediaChange: (mediaIds: string[]) => void;
  context?: {
    type: 'essay' | 'gallery' | 'product' | 'page' | 'project';
    id?: string;
    name?: string;
  };
  label?: string;
  showUpload?: boolean;
}

export default function EmbeddedMediaManager({
  mode,
  selectedMediaIds,
  onMediaChange,
  context,
  label = 'Media',
  showUpload = true,
}: EmbeddedMediaManagerProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const selectedMedia = useMemo(() => {
    return media.filter(m => selectedMediaIds.includes(m.id));
  }, [media, selectedMediaIds]);

  const loadMediaLibrary = async () => {
    setLoading(true);
    try {
      const [foldersRes, mediaRes] = await Promise.all([
        supabase.from('media_folders').select('*').order('name', { ascending: true }),
        supabase.from('media_items').select('*').eq('is_active', true).order('created_at', { ascending: false })
      ]);

      if (foldersRes.data) setFolders(foldersRes.data);
      if (mediaRes.data) setMedia(mediaRes.data as Media[]);
    } catch (error) {
      console.error('Error loading media:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showPicker) {
      loadMediaLibrary();
    }
  }, [showPicker]);

  const filteredMedia = useMemo(() => {
    const search = searchQuery.toLowerCase().trim();
    return media.filter(m => {
      const inFolder = activeFolder ? m.folder_id === activeFolder : true;
      const matches = !search ||
        [m.title, m.alt_text, m.description, m.filename, ...(m.tags || [])].join(' ').toLowerCase().includes(search);
      return inFolder && matches;
    });
  }, [media, searchQuery, activeFolder]);

  const toggleMedia = (mediaId: string) => {
    if (mode === 'single') {
      onMediaChange([mediaId]);
      setShowPicker(false);
    } else {
      const newSelection = selectedMediaIds.includes(mediaId)
        ? selectedMediaIds.filter(id => id !== mediaId)
        : [...selectedMediaIds, mediaId];
      onMediaChange(newSelection);
    }
  };

  const removeMedia = (mediaId: string) => {
    onMediaChange(selectedMediaIds.filter(id => id !== mediaId));
  };

  const moveMedia = (index: number, direction: 'up' | 'down') => {
    const newIds = [...selectedMediaIds];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newIds.length) return;

    [newIds[index], newIds[targetIndex]] = [newIds[targetIndex], newIds[index]];
    onMediaChange(newIds);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setUploadFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeUploadFile = (index: number) => {
    setUploadFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (uploadFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const uploadedIds: string[] = [];
    const totalFiles = uploadFiles.length;

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const bucket = 'public';
        const path = `uploads/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: false });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

        const tags = context ? [context.type, context.name || ''].filter(Boolean) : [];

        const { data: insertedMedia, error: insertError } = await supabase
          .from('media_items')
          .insert({
            filename: file.name,
            storage_path: path,
            bucket_name: bucket,
            public_url: urlData.publicUrl,
            media_type: file.type.startsWith('image') ? 'image' : 'video',
            mime_type: file.type,
            file_size: file.size,
            title: file.name.replace(/\.[^/.]+$/, ''),
            folder_id: activeFolder,
            tags,
            is_active: true,
          })
          .select()
          .single();

        if (!insertError && insertedMedia) {
          uploadedIds.push(insertedMedia.id);
        }

        setUploadProgress(Math.round(((i + 1) / totalFiles) * 100));
      }

      await loadMediaLibrary();

      if (mode === 'multiple') {
        onMediaChange([...selectedMediaIds, ...uploadedIds]);
      } else if (uploadedIds.length > 0) {
        onMediaChange([uploadedIds[0]]);
      }

      setUploadFiles([]);
      setActiveTab('browse');
      setShowPicker(false);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload some files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs text-white/70 mb-1">{label}</label>
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-colors flex items-center gap-1"
        >
          <ImageIcon className="w-3 h-3" />
          {mode === 'single' && selectedMediaIds.length === 0 ? 'Select Image' :
           mode === 'single' ? 'Change Image' :
           'Add Images'}
        </button>
      </div>

      {selectedMedia.length > 0 && (
        <div className={`grid ${mode === 'single' ? 'grid-cols-1' : 'grid-cols-3'} gap-2`}>
          {selectedMedia.map((m, index) => (
            <div key={m.id} className="relative group border border-white/10 rounded overflow-hidden bg-black/40">
              <img
                src={ImageService.getOptimizedUrl(m.bucket_name, m.storage_path, 'small')}
                alt={m.alt_text || m.title || ''}
                className="w-full aspect-[4/3] object-cover"
              />
              <div className="p-2 bg-black/60">
                <div className="text-xs text-white truncate">{m.title || m.filename}</div>
              </div>
              <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {mode === 'multiple' && index > 0 && (
                  <button
                    type="button"
                    onClick={() => moveMedia(index, 'up')}
                    className="p-1 bg-black/80 hover:bg-black rounded"
                    title="Move up"
                  >
                    <ArrowUp className="w-3 h-3 text-white" />
                  </button>
                )}
                {mode === 'multiple' && index < selectedMedia.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveMedia(index, 'down')}
                    className="p-1 bg-black/80 hover:bg-black rounded"
                    title="Move down"
                  >
                    <ArrowDown className="w-3 h-3 text-white" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(m.id)}
                  className="p-1 bg-red-500/80 hover:bg-red-500 rounded"
                  title="Remove"
                >
                  <Trash2 className="w-3 h-3 text-white" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPicker && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-black/95 border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">
                {mode === 'single' ? 'Select Image' : 'Select Images'}
              </h3>

              <div className="flex gap-2 ml-auto">
                <button
                  onClick={() => setActiveTab('browse')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    activeTab === 'browse'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  Browse Library
                </button>
                {showUpload && (
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      activeTab === 'upload'
                        ? 'bg-white/20 text-white'
                        : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload New
                  </button>
                )}
              </div>

              <button
                onClick={() => {
                  setShowPicker(false);
                  setUploadFiles([]);
                  setActiveTab('browse');
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-hidden flex">
              {activeTab === 'browse' ? (
                <>
                  <aside className="w-48 border-r border-white/10 p-3 overflow-y-auto">
                    <div className="text-xs font-semibold text-white mb-2">Folders</div>
                    <button
                      onClick={() => setActiveFolder(null)}
                      className={`block w-full text-left px-2 py-1.5 rounded text-xs transition-colors mb-1 ${
                        activeFolder === null ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
                      }`}
                    >
                      All Media
                    </button>
                    {folders.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setActiveFolder(f.id)}
                        className={`block w-full text-left px-2 py-1.5 rounded text-xs transition-colors mb-1 ${
                          activeFolder === f.id ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </aside>

                  <main className="flex-1 p-4 overflow-y-auto">
                    <input
                      type="text"
                      placeholder="Search media..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 mb-4"
                    />

                    {loading ? (
                      <div className="flex items-center justify-center py-12 text-white/60">
                        Loading media...
                      </div>
                    ) : filteredMedia.length === 0 ? (
                      <div className="flex items-center justify-center py-12 text-white/60">
                        No media found
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {filteredMedia.map(m => {
                          const isSelected = selectedMediaIds.includes(m.id);
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => toggleMedia(m.id)}
                              className={`relative border rounded overflow-hidden transition-all ${
                                isSelected ? 'border-white ring-2 ring-white/30' : 'border-white/10 hover:border-white/30'
                              }`}
                            >
                              <img
                                src={ImageService.getOptimizedUrl(m.bucket_name, m.storage_path, 'small')}
                                alt={m.alt_text || ''}
                                className="w-full aspect-square object-cover"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-black font-bold">✓</div>
                                </div>
                              )}
                              <div className="p-1 bg-black/60">
                                <div className="text-xs text-white truncate">{m.title || m.filename}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </main>
                </>
              ) : (
                <div className="flex-1 p-6 overflow-y-auto">
                  <div
                    className="border-2 border-dashed border-white/20 rounded-lg p-12 flex flex-col items-center justify-center hover:border-white/40 transition-colors"
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    {uploadFiles.length === 0 ? (
                      <>
                        <Upload className="w-16 h-16 text-white/40 mb-4" />
                        <p className="text-white/80 text-lg mb-2">Drop files here or click to browse</p>
                        <p className="text-white/50 text-sm mb-4">Supports images and videos</p>
                        <label className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white cursor-pointer transition-colors">
                          Browse Files
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            className="hidden"
                            onChange={handleFileSelect}
                          />
                        </label>
                      </>
                    ) : (
                      <div className="w-full">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-white font-medium">{uploadFiles.length} file(s) ready</h4>
                          <button
                            onClick={() => setUploadFiles([])}
                            className="text-white/60 hover:text-white text-sm"
                            disabled={uploading}
                          >
                            Clear
                          </button>
                        </div>

                        <div className="max-h-[40vh] overflow-auto space-y-2 mb-4">
                          {uploadFiles.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                              <div className="w-12 h-12 bg-white/10 rounded overflow-hidden flex-shrink-0">
                                {file.type.startsWith('image') && (
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white text-sm truncate">{file.name}</div>
                                <div className="text-white/50 text-xs">
                                  {(file.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                              </div>
                              {!uploading && (
                                <button
                                  onClick={() => removeUploadFile(i)}
                                  className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {uploading && (
                          <div className="mb-4">
                            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-white h-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                              />
                            </div>
                            <p className="text-white/60 text-sm mt-2 text-center">
                              Uploading...
                            </p>
                          </div>
                        )}

                        <button
                          onClick={handleUpload}
                          disabled={uploading}
                          className="w-full px-6 py-3 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {uploading ? 'Uploading...' : `Upload ${uploadFiles.length} File(s)`}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-white/60 text-sm">
                {selectedMediaIds.length} selected
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
