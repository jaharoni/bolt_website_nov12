import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  Upload, Edit2, Trash2, FolderOpen, Folder, ChevronRight, ChevronDown,
  Plus, Move, Copy, Image as ImageIcon, ArrowUp, MoreVertical, Search,
  Tag, Eye, EyeOff, ShoppingBag, FileText, Grid as GridIcon, Layers,
  Check, X, Download, Loader2, AlertCircle
} from "lucide-react";
import useSupabaseTable from "../../hooks/useSupabaseTable";
import { Media, MediaFolder, Essay, Gallery } from "../../lib/types";
import { supabase } from "../../lib/supabase";
import ImageService from "../../lib/imageService";
import { useSelection } from "./SelectionBus";
import slugify from "../../lib/slugify";

interface FolderNode extends MediaFolder {
  children: FolderNode[];
  itemCount: number;
  isExpanded: boolean;
}

type ViewMode = 'grid' | 'list' | 'tree';
type ItemType = 'media' | 'folder';

interface MediaUsage {
  usage_type: string;
  reference_title: string;
  reference_slug: string;
}

export default function MediaLibraryPro() {
  const foldersQ = useSupabaseTable<MediaFolder>({
    table: "media_folders",
    order: { column: "name", ascending: true },
  });
  const mediaQ = useSupabaseTable<Media>({
    table: "media_items",
    order: { column: "created_at", ascending: false },
  });
  const essaysQ = useSupabaseTable<Essay>({
    table: "essays",
    order: { column: "updated_at", ascending: false },
  });
  const galleriesQ = useSupabaseTable<Gallery>({
    table: "galleries",
    order: { column: "updated_at", ascending: false },
  });

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  // Debug currentFolderId changes
  useEffect(() => {
    console.log('[MediaLibrary] currentFolderId changed:', currentFolderId);
    console.log('[MediaLibrary] currentFolderItems count:', mediaQ.items.filter(m => m.folder_id === currentFolderId).length);
    console.log('[MediaLibrary] Total media items:', mediaQ.items.length);
  }, [currentFolderId, mediaQ.items]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: Media | MediaFolder; type: ItemType } | null>(null);
  const [editingFolder, setEditingFolder] = useState<MediaFolder | null>(null);
  const [uploadingToFolder, setUploadingToFolder] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<MediaFolder[]>([]);
  const [mediaUsage, setMediaUsage] = useState<Record<string, MediaUsage[]>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [operationLoading, setOperationLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const sel = useSelection();

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error) {
          console.error('Auth check error:', error);
          setIsAuthenticated(false);
          showToast('Authentication check failed. Some operations may not work.', 'error');
        } else {
          setIsAuthenticated(!!user);
          console.log('Auth status:', { authenticated: !!user, email: user?.email });
        }
      } catch (err) {
        console.error('Auth check exception:', err);
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    }
    checkAuth();
  }, []);

  // Toast notification helper
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const folderTree = useMemo(() => {
    const buildTree = (parentId: string | null): FolderNode[] => {
      return foldersQ.items
        .filter(f => f.parent_id === parentId)
        .map(folder => ({
          ...folder,
          children: buildTree(folder.id),
          itemCount: mediaQ.items.filter(m => m.folder_id === folder.id).length,
          isExpanded: expandedFolders.has(folder.id)
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    };
    return buildTree(null);
  }, [foldersQ.items, mediaQ.items, expandedFolders]);

  const currentFolderItems = useMemo(() => {
    return mediaQ.items.filter(m => m.folder_id === currentFolderId);
  }, [mediaQ.items, currentFolderId]);

  const currentSubfolders = useMemo(() => {
    // Get direct child folders from all folders, not from folderTree
    return foldersQ.items.filter(f => f.parent_id === currentFolderId);
  }, [foldersQ.items, currentFolderId]);

  const filteredItems = useMemo(() => {
    const search = searchQuery.toLowerCase().trim();
    if (!search) return currentFolderItems;

    return currentFolderItems.filter(m =>
      [m.title ?? "", m.alt_text ?? "", m.description ?? "", m.filename ?? "", (m.tags ?? []).join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(search)
    );
  }, [currentFolderItems, searchQuery]);

  React.useEffect(() => {
    if (currentFolderId) {
      const buildPath = (folderId: string): MediaFolder[] => {
        const folder = foldersQ.items.find(f => f.id === folderId);
        if (!folder) return [];
        if (folder.parent_id) {
          return [...buildPath(folder.parent_id), folder];
        }
        return [folder];
      };
      setFolderPath(buildPath(currentFolderId));
    } else {
      setFolderPath([]);
    }
  }, [currentFolderId, foldersQ.items]);

  React.useEffect(() => {
    const loadUsage = async () => {
      const { data } = await supabase.from('media_usage').select('*');
      if (data) {
        const usageMap: Record<string, MediaUsage[]> = {};
        data.forEach((u: any) => {
          if (!usageMap[u.media_id]) usageMap[u.media_id] = [];
          usageMap[u.media_id].push({
            usage_type: u.usage_type,
            reference_title: u.reference_title,
            reference_slug: u.reference_slug
          });
        });
        setMediaUsage(usageMap);
      }
    };
    loadUsage();
  }, [mediaQ.items]);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const handleUpload = useCallback(async (files: FileList | null, targetFolderId: string | null = null) => {
    if (!files) return;
    const folderId = targetFolderId ?? currentFolderId;

    for (const file of Array.from(files)) {
      const bucket = "public";
      const path = `uploads/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        continue;
      }

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

      await supabase.from("media_items").insert({
        filename: file.name,
        storage_path: path,
        bucket_name: bucket,
        public_url: urlData.publicUrl,
        media_type: file.type.startsWith("image") ? "image" : "video",
        mime_type: file.type,
        file_size: file.size,
        title: file.name.replace(/\.[^/.]+$/, ""),
        folder_id: folderId,
        tags: [],
        is_active: true,
      });
    }
    await mediaQ.fetchAll();
    setUploadingToFolder(null);
  }, [currentFolderId, mediaQ]);

  const createFolder = useCallback(async (parentId: string | null = null) => {
    const name = prompt("New folder name?");
    if (!name) return;

    await supabase.from("media_folders").insert({
      name: name.trim(),
      slug: slugify(name.trim()),
      parent_id: parentId ?? currentFolderId,
      is_active: true
    });
    await foldersQ.fetchAll();
  }, [currentFolderId, foldersQ]);

  const renameFolder = useCallback(async (folder: MediaFolder) => {
    const newName = prompt("New folder name?", folder.name);
    if (!newName || newName.trim() === folder.name) return;

    await supabase.from("media_folders").update({
      name: newName.trim(),
      slug: slugify(newName.trim()),
      updated_at: new Date().toISOString()
    }).eq("id", folder.id);
    await foldersQ.fetchAll();
  }, [foldersQ]);

  const deleteFolder = useCallback(async (folder: MediaFolder) => {
    const itemsInFolder = mediaQ.items.filter(m => m.folder_id === folder.id);
    const hasItems = itemsInFolder.length > 0;

    if (hasItems) {
      const action = confirm(
        `This folder contains ${itemsInFolder.length} item(s).\n\n` +
        `Click OK to move items to parent folder and delete.\n` +
        `Click Cancel to abort.`
      );
      if (!action) return;

      setOperationLoading(true);
      showToast(`Moving ${itemsInFolder.length} items...`, 'info');

      try {
        for (const item of itemsInFolder) {
          const { error } = await supabase.from("media_items").update({ folder_id: folder.parent_id }).eq("id", item.id);
          if (error) {
            console.error(`Failed to move item ${item.id}:`, error);
            throw new Error(`Failed to move item: ${error.message}`);
          }
        }
      } catch (error: any) {
        console.error('Failed to move items:', error);
        showToast(`Failed to move items: ${error.message}`, 'error');
        setOperationLoading(false);
        return;
      }
    } else {
      if (!confirm(`Delete folder "${folder.name}"?`)) return;
      setOperationLoading(true);
    }

    try {
      console.log('Attempting to delete folder:', folder.id, folder.name);
      const { error } = await supabase.from("media_folders").delete().eq("id", folder.id);

      if (error) {
        console.error('Folder deletion error:', error);
        showToast(`Failed to delete folder: ${error.message}`, 'error');
        setOperationLoading(false);
        return;
      }

      showToast(`Folder "${folder.name}" deleted successfully`, 'success');
      await foldersQ.fetchAll();
      await mediaQ.fetchAll();

      if (currentFolderId === folder.id) {
        setCurrentFolderId(folder.parent_id);
      }
    } catch (error: any) {
      console.error('Folder deletion exception:', error);
      showToast(`Failed to delete folder: ${error.message}`, 'error');
    } finally {
      setOperationLoading(false);
    }
  }, [mediaQ, foldersQ, currentFolderId, showToast]);

  const moveSelectedToFolder = useCallback(async (targetFolderId: string | null) => {
    const ids = Array.from(sel.selected);
    for (const id of ids) {
      await supabase.from("media_items").update({ folder_id: targetFolderId }).eq("id", id);
    }
    sel.clear();
    await mediaQ.fetchAll();
  }, [sel, mediaQ]);

  const attachToEssay = useCallback(async () => {
    const essayTitle = prompt("Attach to which Essay? Type title (exact or partial).");
    if (!essayTitle) return;

    const essay = essaysQ.items.find((e) => e.title.toLowerCase().includes(essayTitle.toLowerCase()));
    if (!essay) {
      alert("Essay not found");
      return;
    }

    const ids = Array.from(sel.selected);
    const { data: existing } = await supabase
      .from("essays_media")
      .select("position")
      .eq("essay_id", essay.id)
      .order("position", { ascending: false })
      .limit(1);

    let pos = existing && existing.length > 0 ? existing[0].position + 1 : 0;

    for (const mediaId of ids) {
      await supabase.from("essays_media").insert({
        essay_id: essay.id,
        media_id: mediaId,
        position: pos++,
      });
    }
    sel.clear();
    alert(`Attached ${ids.length} image(s) to "${essay.title}"`);
  }, [sel, essaysQ]);

  const attachToGallery = useCallback(async () => {
    const gTitle = prompt("Attach to which Gallery? Type title (exact or partial).");
    if (!gTitle) return;

    const gallery = galleriesQ.items.find((g) => g.title.toLowerCase().includes(gTitle.toLowerCase()));
    if (!gallery) {
      alert("Gallery not found");
      return;
    }

    const ids = Array.from(sel.selected);
    const { data: existing } = await supabase
      .from("gallery_items")
      .select("position")
      .eq("gallery_id", gallery.id)
      .order("position", { ascending: false })
      .limit(1);

    let pos = existing && existing.length > 0 ? existing[0].position + 1 : 0;

    for (const mediaId of ids) {
      await supabase.from("gallery_items").insert({
        gallery_id: gallery.id,
        media_id: mediaId,
        position: pos++,
      });
    }
    sel.clear();
    alert(`Added ${ids.length} image(s) to gallery "${gallery.title}"`);
  }, [sel, galleriesQ]);

  const selectAllInFolder = useCallback(() => {
    const allIds = filteredItems.map(m => m.id);
    const currentSelection = Array.from(sel.selected);
    const combined = new Set([...currentSelection, ...allIds]);
    sel.setMultiple(Array.from(combined));
  }, [filteredItems, sel]);

  const deselectAll = useCallback(() => {
    sel.clear();
  }, [sel]);

  const selectFolder = useCallback((folderId: string) => {
    const itemsInFolder = mediaQ.items.filter(m => m.folder_id === folderId);
    const currentSelection = Array.from(sel.selected);
    const folderIds = itemsInFolder.map(item => item.id);
    const combined = new Set([...currentSelection, ...folderIds]);
    sel.setMultiple(Array.from(combined));
  }, [mediaQ.items, sel]);

  const deleteSelected = useCallback(async () => {
    if (!confirm(`Delete ${sel.count} selected item(s)? This cannot be undone.`)) return;

    const ids = Array.from(sel.selected);
    let successCount = 0;
    let errorCount = 0;

    for (const id of ids) {
      try {
        const media = mediaQ.items.find(m => m.id === id);
        if (media) {
          const { error: storageError } = await supabase.storage.from(media.bucket_name).remove([media.storage_path]);
          if (storageError) {
            console.warn(`Storage deletion failed for ${media.storage_path}:`, storageError);
          }
          const { error: dbError } = await supabase.from("media_items").delete().eq("id", id);
          if (dbError) {
            console.error(`Database deletion failed for ${id}:`, dbError);
            errorCount++;
          } else {
            successCount++;
          }
        }
      } catch (error) {
        console.error(`Failed to delete item ${id}:`, error);
        errorCount++;
      }
    }

    sel.clear();
    await mediaQ.fetchAll();

    if (errorCount > 0) {
      alert(`Deleted ${successCount} items. ${errorCount} items failed to delete.`);
    }
  }, [sel, mediaQ]);

  const renderFolderTree = (nodes: FolderNode[], depth: number = 0): React.ReactNode => {
    return nodes.map(node => (
      <div key={node.id} style={{ paddingLeft: `${depth * 16}px` }}>
        <div
          className={`flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded cursor-pointer group transition-colors ${
            currentFolderId === node.id ? "bg-white/10 border-l-2 border-blue-400" : ""
          }`}
          onClick={(e) => {
            e.stopPropagation();
            console.log('[MediaLibrary] Folder clicked:', { id: node.id, name: node.name, itemCount: node.itemCount });
            console.log('[MediaLibrary] Setting currentFolderId to:', node.id);
            setCurrentFolderId(node.id);
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('[MediaLibrary] Toggle folder:', node.id);
              toggleFolder(node.id);
            }}
            className="p-0.5 hover:bg-white/10 rounded"
          >
            {node.children.length > 0 ? (
              node.isExpanded ? <ChevronDown className="w-3 h-3 text-white/60" /> : <ChevronRight className="w-3 h-3 text-white/60" />
            ) : (
              <span className="w-3 inline-block" />
            )}
          </button>
          <div
            className={`flex-1 flex items-center gap-2 text-sm ${
              currentFolderId === node.id ? "text-white font-medium" : "text-white/70"
            }`}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setContextMenu({ x: e.clientX, y: e.clientY, item: node, type: 'folder' });
            }}
          >
            {node.isExpanded ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
            <span className="truncate">{node.name}</span>
            <span className="ml-auto text-xs text-white/40">{node.itemCount}</span>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                createFolder(node.id);
              }}
              className="p-1 hover:bg-white/10 rounded"
              title="Create subfolder"
            >
              <Plus className="w-3 h-3 text-white/60" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                renameFolder(node);
              }}
              className="p-1 hover:bg-white/10 rounded"
              title="Rename folder"
            >
              <Edit2 className="w-3 h-3 text-white/60" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteFolder(node);
              }}
              className="p-1 hover:bg-red-500/20 rounded"
              title="Delete folder"
              disabled={operationLoading}
            >
              {operationLoading ? (
                <Loader2 className="w-3 h-3 text-white/60 animate-spin" />
              ) : (
                <Trash2 className="w-3 h-3 text-red-400" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setContextMenu({ x: e.clientX, y: e.clientY, item: node, type: 'folder' });
              }}
              className="p-1 hover:bg-white/10 rounded"
            >
              <MoreVertical className="w-3 h-3 text-white/60" />
            </button>
          </div>
        </div>
        {node.isExpanded && renderFolderTree(node.children, depth + 1)}
      </div>
    ));
  };

  const renderMediaUsageBadges = (mediaId: string) => {
    const usage = mediaUsage[mediaId] || [];
    if (usage.length === 0) return null;

    const iconMap: Record<string, React.ReactNode> = {
      essay: <FileText className="w-3 h-3" />,
      gallery: <GridIcon className="w-3 h-3" />,
      lto_offer: <Tag className="w-3 h-3" />,
      gallery_cover: <ImageIcon className="w-3 h-3" />
    };

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {usage.slice(0, 3).map((u, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs"
            title={`${u.usage_type}: ${u.reference_title}`}
          >
            {iconMap[u.usage_type]}
            <span className="truncate max-w-[80px]">{u.reference_title}</span>
          </span>
        ))}
        {usage.length > 3 && (
          <span className="inline-flex items-center px-1.5 py-0.5 bg-white/10 text-white/60 rounded text-xs">
            +{usage.length - 3} more
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-12 gap-0 min-h-screen">
      {/* Sidebar - Folder Tree */}
      <aside className="col-span-12 lg:col-span-3 border-r border-white/10 p-4 space-y-4 bg-black/20 overflow-y-auto max-h-screen">
        <div className="flex items-center justify-between">
          <div className="font-semibold text-white">Folders</div>
          <button
            className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-xs flex items-center gap-1"
            onClick={() => createFolder(null)}
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>

        <button
          onClick={() => setCurrentFolderId(null)}
          className={`block w-full text-left px-3 py-2 rounded text-white flex items-center gap-2 ${
            currentFolderId === null ? "bg-white/20" : "hover:bg-white/10"
          }`}
        >
          <Folder className="w-4 h-4" />
          <span>All Media</span>
          <span className="ml-auto text-xs text-white/40">{mediaQ.items.length}</span>
        </button>

        <div className="space-y-0.5 text-sm">
          {renderFolderTree(folderTree)}
        </div>

        {sel.count > 0 && (
          <div className="pt-4 border-t border-white/10 space-y-2">
            <div className="text-xs text-white/70 mb-2">Move {sel.count} selected to:</div>
            <button
              onClick={() => moveSelectedToFolder(null)}
              className="w-full px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs text-left"
            >
              📁 Root
            </button>
            {foldersQ.items.map((f) => (
              <button
                key={f.id}
                onClick={() => moveSelectedToFolder(f.id)}
                className="w-full px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs text-left truncate"
              >
                📁 {f.name}
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="col-span-12 lg:col-span-9 p-6 space-y-4 overflow-y-auto max-h-screen">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <button onClick={() => setCurrentFolderId(null)} className="hover:text-white">
              All Media
            </button>
            {folderPath.map((f, i) => (
              <React.Fragment key={f.id}>
                <ChevronRight className="w-3 h-3" />
                <button
                  onClick={() => setCurrentFolderId(f.id)}
                  className="hover:text-white"
                >
                  {f.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-white">
              {currentFolderId ? folderPath[folderPath.length - 1]?.name || "Media Library" : "All Media"}
            </h1>

            {currentFolderId && (
              <button
                onClick={() => setCurrentFolderId(folderPath[folderPath.length - 2]?.id || null)}
                className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm flex items-center gap-1"
              >
                <ArrowUp className="w-3 h-3" />
                Up
              </button>
            )}

            <div className="ml-auto flex items-center gap-2 flex-wrap">
              <button
                onClick={selectAllInFolder}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
                disabled={filteredItems.length === 0}
              >
                Select All ({filteredItems.length})
              </button>
              {sel.count > 0 && (
                <button
                  onClick={deselectAll}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
                >
                  Deselect All
                </button>
              )}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  className="pl-9 pr-3 py-2 bg-zinc-900 border border-white/10 rounded text-white placeholder-white/40 text-sm w-64"
                  placeholder="Search media..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <label className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded cursor-pointer text-white flex items-center gap-2 text-sm">
                <Upload className="w-4 h-4" />
                Upload
                <input type="file" multiple className="hidden" onChange={(e) => handleUpload(e.target.files)} />
              </label>

              <button
                onClick={() => createFolder(currentFolderId)}
                className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white flex items-center gap-2 text-sm"
              >
                <FolderOpen className="w-4 h-4" />
                New Folder
              </button>
            </div>
          </div>

          {sel.count > 0 && (
            <div className="flex items-center gap-2 p-3 bg-yellow-400/10 border border-yellow-400/30 rounded">
              <span className="text-yellow-400 font-semibold">{sel.count} selected</span>
              <div className="flex items-center gap-2 ml-4 flex-wrap">
                <button
                  onClick={attachToEssay}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
                >
                  Add to Essay
                </button>
                <button
                  onClick={attachToGallery}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
                >
                  Add to Gallery
                </button>
                <button
                  onClick={deleteSelected}
                  className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-sm"
                >
                  Delete
                </button>
                <button
                  onClick={() => sel.clear()}
                  className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white text-sm ml-auto"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Subfolders */}
        {currentSubfolders.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {currentSubfolders.map(folder => {
              const folderMediaIds = mediaQ.items.filter(m => m.folder_id === folder.id).map(m => m.id);
              const isFolderSelected = folderMediaIds.length > 0 && folderMediaIds.every(id => sel.has(id));

              return (
                <div
                  key={folder.id}
                  className={`p-4 bg-white/5 hover:bg-white/10 border rounded-lg text-left group relative ${
                    isFolderSelected ? 'border-yellow-400 ring-2 ring-yellow-400/30' : 'border-white/10'
                  }`}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ x: e.clientX, y: e.clientY, item: folder, type: 'folder' });
                  }}
                >
                  <label
                    className={`absolute top-2 left-2 z-10 rounded w-6 h-6 flex items-center justify-center text-sm font-semibold transition-all cursor-pointer ${
                      isFolderSelected ? 'bg-yellow-400 text-black' : 'bg-black/60 text-white hover:bg-black/80'
                    }`}
                    title={isFolderSelected ? 'Deselect all items in folder' : 'Select all items in folder'}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isFolderSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newSel = new Set(sel.selected);
                        if (isFolderSelected) {
                          folderMediaIds.forEach(id => newSel.delete(id));
                        } else {
                          folderMediaIds.forEach(id => newSel.add(id));
                        }
                        sel.setMultiple(Array.from(newSel));
                        console.log(isFolderSelected ? "Deselected folder media" : "Selected folder media", folderMediaIds);
                      }}
                    />
                    {isFolderSelected ? <Check className="w-4 h-4" /> : ''}
                  </label>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('[MediaLibrary] Subfolder clicked:', { id: folder.id, name: folder.name });
                      setCurrentFolderId(folder.id);
                    }}
                    className="w-full text-left"
                  >
                    <FolderOpen className="w-8 h-8 text-yellow-400 mb-2" />
                    <div className="text-white text-sm font-medium truncate">{folder.name}</div>
                    <div className="text-white/50 text-xs">{folder.itemCount} items</div>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Media Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filteredItems.map((m) => {
            const isSelected = sel.has(m.id);
            const usage = mediaUsage[m.id] || [];

            return (
              <div
                key={m.id}
                className={`relative group border rounded-lg overflow-hidden bg-black/40 ${
                  isSelected ? "border-yellow-400 ring-2 ring-yellow-400/30" : "border-white/10"
                }`}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setContextMenu({ x: e.clientX, y: e.clientY, item: m, type: 'media' });
                }}
              >
                <button
                  onClick={() => sel.toggle(m.id)}
                  className={`absolute top-2 left-2 z-10 rounded w-6 h-6 flex items-center justify-center text-sm font-semibold transition-all ${
                    isSelected ? "bg-yellow-400 text-black" : "bg-black/60 text-white hover:bg-black/80"
                  }`}
                >
                  {isSelected ? <Check className="w-4 h-4" /> : ""}
                </button>

                {usage.length > 0 && (
                  <div className="absolute top-2 right-2 z-10 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    {usage.length}
                  </div>
                )}

                <img
                  src={
                    m.bucket_name && m.storage_path
                      ? ImageService.getOptimizedUrl(m.bucket_name, m.storage_path, "small")
                      : m.public_url || "/placeholder-image.jpg"
                  }
                  srcSet={
                    m.bucket_name && m.storage_path
                      ? ImageService.getResponsiveSrcSet(m.bucket_name, m.storage_path)
                      : undefined
                  }
                  sizes="(min-width: 1024px) 16vw, (min-width: 768px) 25vw, 50vw"
                  alt={m.alt_text ?? ""}
                  loading="lazy"
                  decoding="async"
                  className="w-full aspect-[4/3] object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (img.src !== m.public_url && m.public_url) {
                      img.src = m.public_url;
                    }
                  }}
                />

                <div className="p-2">
                  <div className="text-xs text-white truncate font-medium">{m.title ?? m.filename}</div>
                  <div className="text-xs text-white/50 truncate">{(m.tags ?? []).join(", ")}</div>
                  {renderMediaUsageBadges(m.id)}
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-white/50">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <p>No media items found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </main>

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-black/95 border border-white/20 rounded-lg shadow-xl py-1 min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {contextMenu.type === 'folder' ? (
              <>
                <button
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 text-sm"
                  onClick={() => {
                    renameFolder(contextMenu.item as MediaFolder);
                    setContextMenu(null);
                  }}
                >
                  <Edit2 className="w-4 h-4" />
                  Rename
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 text-sm"
                  onClick={() => {
                    createFolder((contextMenu.item as MediaFolder).id);
                    setContextMenu(null);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Subfolder
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 text-sm"
                  onClick={() => {
                    deleteFolder(contextMenu.item as MediaFolder);
                    setContextMenu(null);
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 text-sm"
                  onClick={() => {
                    sel.toggle((contextMenu.item as Media).id);
                    setContextMenu(null);
                  }}
                >
                  {sel.has((contextMenu.item as Media).id) ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  {sel.has((contextMenu.item as Media).id) ? "Deselect" : "Select"}
                </button>
                <button
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-2 text-sm"
                  onClick={() => {
                    const media = contextMenu.item as Media;
                    window.open(media.public_url, '_blank');
                    setContextMenu(null);
                  }}
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </>
            )}
          </div>
        </>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl border flex items-center gap-3 animate-in slide-in-from-bottom-2 ${
          toast.type === 'success' ? 'bg-green-500/90 border-green-400 text-white' :
          toast.type === 'error' ? 'bg-red-500/90 border-red-400 text-white' :
          'bg-blue-500/90 border-blue-400 text-white'
        }`}>
          {toast.type === 'success' && <Check className="w-5 h-5" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
          {toast.type === 'info' && <Loader2 className="w-5 h-5 animate-spin" />}
          <span className="font-medium">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-70"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}
