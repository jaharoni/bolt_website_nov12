import { useEffect, useMemo, useState } from "react";
import { X, Search, Upload, FolderOpen } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Media, MediaFolder } from "../../lib/types";
import ImageService from "../../lib/imageService";
import slugify from "../../lib/slugify";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (mediaIds: string[]) => void;
  multi?: boolean;
  title?: string;
  contextInfo?: { type: 'essay' | 'gallery' | 'shop'; id: string; name: string };
};

export default function MediaPickerModal({
  open,
  onClose,
  onConfirm,
  multi = true,
  title = "Select Media",
  contextInfo,
}: Props) {
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [media, setMedia] = useState<Media[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    if (!open) {
      setUploadFiles([]);
      setUploadProgress(0);
      setActiveTab('browse');
      return;
    }

    setLoading(true);
    (async () => {
      try {
        const { data: f } = await supabase
          .from("media_folders")
          .select("*")
          .order("created_at", { ascending: true });
        setFolders(f ?? []);

        const { data: m } = await supabase
          .from("media_items")
          .select("*")
          .order("created_at", { ascending: false })
          .eq("is_active", true);
        setMedia((m ?? []) as Media[]);
        setSelected(new Set());
      } catch (error) {
        console.error("Error loading media:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [open]);

  const items = useMemo(() => {
    const term = q.trim().toLowerCase();
    return media.filter((m) => {
      const inFolder = activeFolder ? m.folder_id === activeFolder : true;
      const matches =
        !term ||
        `${m.title ?? ""} ${(m.tags ?? []).join(" ")} ${m.alt_text ?? ""} ${m.description ?? ""}`
          .toLowerCase()
          .includes(term);
      return inFolder && matches;
    });
  }, [media, q, activeFolder]);

  if (!open) return null;

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) {
        n.delete(id);
      } else {
        if (!multi) n.clear();
        n.add(id);
      }
      return n;
    });
  }

  function handleConfirm() {
    onConfirm(Array.from(selected));
    onClose();
  }

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setUploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleUploadAll = async () => {
    if (uploadFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const uploadedIds: string[] = [];
    const totalFiles = uploadFiles.length;

    try {
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i];
        const bucket = "public";
        const path = `uploads/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(path, file, { upsert: false });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

        const tags = contextInfo ? [contextInfo.type, contextInfo.name] : [];

        const { data: insertedMedia, error: insertError } = await supabase
          .from("media_items")
          .insert({
            filename: file.name,
            storage_path: path,
            bucket_name: bucket,
            public_url: urlData.publicUrl,
            media_type: file.type.startsWith("image") ? "image" : "video",
            mime_type: file.type,
            file_size: file.size,
            title: file.name.replace(/\.[^/.]+$/, ""),
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

      const { data: updatedMedia } = await supabase
        .from("media_items")
        .select("*")
        .order("created_at", { ascending: false })
        .eq("is_active", true);

      setMedia((updatedMedia ?? []) as Media[]);

      if (multi) {
        setSelected(prev => {
          const newSet = new Set(prev);
          uploadedIds.forEach(id => newSet.add(id));
          return newSet;
        });
      } else if (uploadedIds.length > 0) {
        setSelected(new Set([uploadedIds[0]]));
      }

      setUploadFiles([]);
      setActiveTab('browse');
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload some files");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 grid place-items-center p-4">
      <div className="bg-black/95 border border-white/10 rounded-2xl w-[min(1200px,95vw)] h-[min(85vh,900px)] overflow-hidden grid grid-cols-12 backdrop-blur-sm">
        <aside className="col-span-3 border-r border-white/10 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-white text-sm">Folders</div>
          </div>
          <button
            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              activeFolder === null
                ? "bg-white/10 text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
            onClick={() => setActiveFolder(null)}
          >
            All Media
          </button>
          <ul className="mt-2 space-y-1 max-h-[60vh] overflow-auto pr-1">
            {folders.map((f) => (
              <li key={f.id}>
                <button
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeFolder === f.id
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  }`}
                  onClick={() => setActiveFolder(f.id)}
                >
                  {f.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="col-span-9 p-4 flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white mb-3">{title}</h2>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveTab('browse')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'browse'
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  Choose Existing
                </button>
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    activeTab === 'upload'
                      ? "bg-white/20 text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  Upload New
                </button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {activeTab === 'browse' ? (
            <>
              <div className="mb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <input
                    className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="Search title, tags, alt text..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-3 text-sm">
                <div className="text-white/60">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                  {activeFolder && (
                    <span className="ml-2">
                      in {folders.find((f) => f.id === activeFolder)?.name}
                    </span>
                  )}
                </div>
                <div className="text-white/90 font-medium">
                  {selected.size} selected
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center text-white/60">
                  Loading media...
                </div>
              ) : items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-white/60">
                  No media found
                </div>
              ) : (
                <div className="flex-1 overflow-auto">
                  <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {items.map((m) => (
                      <li
                        key={m.id}
                        className="relative border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-colors"
                      >
                        <button
                          onClick={() => toggle(m.id)}
                          className="w-full text-left"
                        >
                          <div className="relative aspect-[4/3] bg-black/40">
                            <img
                              className="w-full h-full object-cover"
                              src={ImageService.getOptimizedUrl(
                                m.bucket_name,
                                m.storage_path,
                                "small"
                              )}
                              alt={m.alt_text ?? ""}
                              loading="lazy"
                              decoding="async"
                            />
                            <div
                              className={`absolute top-2 left-2 z-10 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold transition-all ${
                                selected.has(m.id)
                                  ? "bg-white text-black scale-110"
                                  : "bg-black/70 text-white border border-white/30"
                              }`}
                            >
                              {selected.has(m.id) ? "✓" : ""}
                            </div>
                          </div>
                          <div className="p-2 bg-black/40">
                            <div className="text-xs text-white truncate font-medium">
                              {m.title || m.filename}
                            </div>
                            {m.tags && m.tags.length > 0 && (
                              <div className="text-xs text-white/50 truncate mt-0.5">
                                {m.tags.join(", ")}
                              </div>
                            )}
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col">
              <div
                className="flex-1 border-2 border-dashed border-white/20 rounded-lg p-8 flex flex-col items-center justify-center hover:border-white/40 transition-colors"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {uploadFiles.length === 0 ? (
                  <>
                    <Upload className="w-16 h-16 text-white/40 mb-4" />
                    <p className="text-white/80 text-lg mb-2">Drop files here or click to browse</p>
                    <p className="text-white/50 text-sm mb-4">Supports images and videos</p>
                    {activeFolder && (
                      <p className="text-white/60 text-xs mb-4">
                        Will be uploaded to: <span className="font-medium">{folders.find(f => f.id === activeFolder)?.name || "Selected folder"}</span>
                      </p>
                    )}
                    {contextInfo && (
                      <p className="text-blue-400 text-xs mb-4">
                        Will be automatically tagged with: {contextInfo.type} - {contextInfo.name}
                      </p>
                    )}
                    <label className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white cursor-pointer transition-colors">
                      Browse Files
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={handleFilesSelected}
                      />
                    </label>
                  </>
                ) : (
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-medium">{uploadFiles.length} file(s) ready</h3>
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
                              onClick={() => setUploadFiles(prev => prev.filter((_, idx) => idx !== i))}
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
                            className="bg-white h-full transition-all duration-300 flex items-center justify-center"
                            style={{ width: `${uploadProgress}%` }}
                          >
                            <span className="text-xs font-bold text-black">{uploadProgress}%</span>
                          </div>
                        </div>
                        <p className="text-white/60 text-sm mt-2 text-center">
                          Uploading {uploadFiles.length} file(s)...
                        </p>
                      </div>
                    )}

                    <button
                      onClick={handleUploadAll}
                      disabled={uploading}
                      className="w-full px-6 py-3 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploading ? "Uploading..." : `Upload ${uploadFiles.length} File(s)`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-white text-black hover:bg-white/90 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirm}
              disabled={selected.size === 0}
            >
              Use {selected.size} {multi ? "Selected" : "Item"}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
