import React, { useMemo, useState, useEffect, useCallback } from "react";
import { Eye, RefreshCw, Save, Plus, Info, ImagePlus, FolderOpen, PlayCircle, StopCircle } from "lucide-react";
import useSupabaseTable from "../../hooks/useSupabaseTable";
import { SiteZone, MediaFolder, Gallery, ZoneConfig } from "../../lib/types";
import { supabase } from "../../lib/supabase";
import ImageService from "../../lib/imageService";
import { useMediaPicker } from "./useMediaPicker";
import slugify from "../../lib/slugify";
import { useToast } from "../../hooks/useToast";
import { Toast } from "../Toast";

const PAGE_CONFIGS = [
  { key: "home.background", label: "Homepage", supportsCarousel: true, defaultCarousel: true, defaultRandomization: false },
  { key: "about.background", label: "About Page", supportsCarousel: true, defaultCarousel: false, defaultRandomization: true },
  { key: "essays.background", label: "Essays Page", supportsCarousel: true, defaultCarousel: false, defaultRandomization: true },
  { key: "gallery.background", label: "Gallery Page", supportsCarousel: true, defaultCarousel: false, defaultRandomization: true },
  { key: "shop.background", label: "Shop Page", supportsCarousel: true, defaultCarousel: false, defaultRandomization: true },
  { key: "contact.background", label: "Contact Page", supportsCarousel: true, defaultCarousel: false, defaultRandomization: true },
];

export default function ZonesManager() {
  const { toasts, addToast, removeToast } = useToast();
  const zQ = useSupabaseTable<SiteZone>({
    table: "site_zones",
    order: { column: "updated_at", ascending: false },
  });
  const foldersQ = useSupabaseTable<MediaFolder>({
    table: "media_folders",
    order: { column: "created_at", ascending: true },
  });

  useEffect(() => {
    console.log('[ZonesManager] Folders loaded:', foldersQ?.items?.length || 0);
    if (foldersQ?.items) {
      foldersQ.items.forEach(f => {
        console.log('  - Folder:', { id: f.id, name: f.name });
      });
    }
  }, [foldersQ.items]);

  const gQ = useSupabaseTable<Gallery>({
    table: "galleries",
    order: { column: "updated_at", ascending: false },
  });

  const [activeKey, setActiveKey] = useState<string>(PAGE_CONFIGS[0].key);
  const [previewImages, setPreviewImages] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const { pick, modal } = useMediaPicker({ multi: true, title: "Select Images for Zone" });
  const { pick: pickStatic, modal: modalStatic } = useMediaPicker({ multi: false, title: "Select Static Background" });

  const pageConfig = PAGE_CONFIGS.find(p => p.key === activeKey);

  const randomizationColumnAvailable = useMemo(() => {
    if (zQ.items.length > 0) {
      const sample = zQ.items[0] as Partial<SiteZone>;
      return Object.prototype.hasOwnProperty.call(sample, "randomization_enabled");
    }
    const errMessage = typeof zQ.error?.message === "string" ? zQ.error.message : "";
    if (errMessage.includes("randomization_enabled") || errMessage.includes("schema cache")) {
      return false;
    }
    return true;
  }, [zQ.items, zQ.error]);

  const zone = useMemo(() => {
    const existing = zQ.items.find((z) => z.key === activeKey);
    if (existing) {
      const derivedRandomization = randomizationColumnAvailable
        ? (existing.randomization_enabled ?? true)
        : ((existing.config_json?.randomization_enabled ?? true));
      console.log('[ZonesManager] Zone found:', { key: activeKey, zone: existing, derivedRandomization, randomizationColumnAvailable });
      return {
        ...existing,
        randomization_enabled: derivedRandomization,
      };
    }

    console.log('[ZonesManager] Zone not found, using defaults for:', activeKey);
    const pageDefaults = PAGE_CONFIGS.find(p => p.key === activeKey);
    return {
      id: "new",
      key: activeKey,
      randomization_enabled: pageDefaults?.defaultRandomization ?? true,
      carousel_enabled: pageDefaults?.defaultCarousel ?? false,
      carousel_interval_ms: 8000,
      carousel_transition: "fade",
      static_media_id: null,
      config_json: {
        mode: "random" as const,
        source: { type: "folder" as const, value: "" },
        limit: 10,
      },
      updated_at: new Date().toISOString(),
    };
  }, [zQ.items, activeKey]);

  const config: ZoneConfig = useMemo(() => {
    const defaultConfig = {
      mode: "random" as const,
      source: { type: "tag" as const, value: "homebg" },
      limit: 10,
    };

    if (!zone?.config_json) return defaultConfig;

    const cfg = zone.config_json;
    if (!cfg.source || typeof cfg.source !== 'object') {
      return defaultConfig;
    }

    return {
      mode: cfg.mode || "random",
      source: {
        type: cfg.source.type || "tag",
        value: cfg.source.value || "homebg"
      },
      limit: cfg.limit || 10
    };
  }, [zone]);

  const randomizationEnabled = zone.randomization_enabled ?? true;
  const carouselEnabled = zone.carousel_enabled ?? false;
  const carouselInterval = zone.carousel_interval_ms ?? 8000;
  const staticMediaId = zone.static_media_id;

  async function saveZone(updates: Partial<SiteZone>) {
    setSaving(true);
    try {
      const existing = zQ.items.find((z) => z.key === activeKey);
      const updatesForDb: Partial<SiteZone> = { ...updates };

      if (!randomizationColumnAvailable && updatesForDb.randomization_enabled !== undefined) {
        const desiredRandomization = updatesForDb.randomization_enabled;
        delete (updatesForDb as any).randomization_enabled;
        const baseConfig = {
          ...(existing?.config_json ?? {}),
          randomization_enabled: desiredRandomization,
        };
        updatesForDb.config_json = {
          ...baseConfig,
          ...(updatesForDb.config_json ?? {}),
        } as ZoneConfig;
      }

      if (!randomizationColumnAvailable && updatesForDb.config_json) {
        updatesForDb.config_json = {
          randomization_enabled,
          ...updatesForDb.config_json,
        } as ZoneConfig;
      }

      if (existing) {
        const { error } = await supabase.from("site_zones").update(updatesForDb).eq("id", existing.id);
        if (error) {
          console.error("Error updating zone:", error);
          addToast(`Error updating zone: ${error.message}`, 'error');
          return;
        }
      } else {
        const insertPayload: Partial<SiteZone> = { key: activeKey, ...updatesForDb };
        if (!randomizationColumnAvailable && !insertPayload.config_json) {
          insertPayload.config_json = {
            mode: "random",
            source: { type: "tag", value: "homebg" },
            limit: 10,
            randomization_enabled: randomizationEnabled,
          } as ZoneConfig;
        }
        const { error } = await supabase.from("site_zones").insert(insertPayload);
        if (error) {
          console.error("Error creating zone:", error);
          addToast(`Error creating zone: ${error.message}`, 'error');
          return;
        }
      }
      await zQ.fetchAll();
      console.log("Zone saved successfully:", updates);
      addToast('Zone settings saved successfully', 'success');
    } catch (err) {
      console.error("Unexpected error saving zone:", err);
      addToast("An unexpected error occurred while saving", 'error');
    } finally {
      setSaving(false);
    }
  }

  async function saveConfig(newConfig: ZoneConfig) {
    const configToPersist: ZoneConfig = {
      ...newConfig,
    };
    if (!randomizationColumnAvailable) {
      configToPersist.randomization_enabled = randomizationEnabled;
    }
    await saveZone({ config_json: configToPersist });
  }

  async function toggleRandomization(enabled: boolean) {
    await saveZone({ randomization_enabled: enabled });
  }

  async function toggleCarousel(enabled: boolean) {
    await saveZone({ carousel_enabled: enabled });
  }

  async function updateCarouselInterval(ms: number) {
    await saveZone({ carousel_interval_ms: ms });
  }

  async function selectStaticImage() {
    const ids = await pickStatic();
    if (ids && ids.length > 0) {
      await saveZone({ static_media_id: ids[0], randomization_enabled: false });
    }
  }

  async function loadPreview() {
    try {
      let media: any[] = [];

      if (!config?.source?.type || !config?.source?.value) {
        addToast('Invalid source configuration', 'error');
        return;
      }

      if (config.source.type === "tag") {
        const { data } = await supabase
          .from("media_items")
          .select("*")
          .contains("tags", [config.source.value])
          .eq("is_active", true)
          .limit(config.limit || 10);
        media = data ?? [];
      } else if (config.source.type === "folder") {
        const { data } = await supabase
          .from("media_items")
          .select("*")
          .eq("folder_id", config.source.value)
          .eq("is_active", true)
          .limit(config.limit || 10);
        media = data ?? [];
      } else if (config.source.type === "gallery") {
        const { data } = await supabase
          .from("gallery_items")
          .select("media:media_items(*)")
          .eq("gallery_id", config.source.value)
          .order("position", { ascending: true })
          .limit(config.limit || 10);
        media = (data ?? []).map((r: any) => r.media).filter(Boolean);
      }
      setPreviewImages(media);
    } catch (error) {
      console.error('Error loading preview:', error);
      addToast('Failed to load preview images', 'error');
    }
  }

  async function testRandomSelection() {
    if (!randomizationEnabled) {
      alert("Randomization is disabled. Enable it to test random selection.");
      return;
    }
    await loadPreview();
  }

  async function useFolderFromPicks() {
    try {
      const ids = await pick();
      if (!ids || !ids.length) return;

      const { data: m } = await supabase.from("media_items").select("folder_id").eq("id", ids[0]).maybeSingle();
      if (m?.folder_id) {
        await saveConfig({ ...config, source: { type: "folder", value: m.folder_id } });
      } else {
        alert("Selected image has no folder. Assign a folder first in Media Library.");
      }
    } catch (error) {
      console.error('Error using folder from picks:', error);
      addToast('Failed to use folder from selected image', 'error');
    }
  }

  async function createGalleryFromPicks() {
    try {
      const ids = await pick();
      if (!ids || !ids.length) return;

      const title = prompt("Create a new Gallery title for this zone?");
      if (!title) return;

      const slug = slugify(title);
      const { data: g, error } = await supabase
        .from("galleries")
        .insert({ title, slug, is_active: false })
        .select("*")
        .maybeSingle();

      if (error || !g) {
        alert("Error creating gallery: " + (error?.message || "Unknown"));
        return;
      }

      let pos = 0;
      for (const media_id of ids) {
        await supabase.from("gallery_items").insert({ gallery_id: g.id, media_id, position: pos++ });
      }

      await saveConfig({ ...config, source: { type: "gallery", value: g.id } });
      await gQ.fetchAll();
      alert(`Created gallery "${title}" and linked to zone`);
    } catch (error) {
      console.error('Error creating gallery from picks:', error);
      addToast('Failed to create gallery', 'error');
    }
  }

  const folders = foldersQ?.items || [];
  const galleries = gQ?.items || [];

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      <header className="flex items-center gap-4">
        <div className="text-2xl font-semibold text-white">Page Backgrounds</div>
        {!randomizationColumnAvailable && (
          <div className="ml-4 text-xs text-amber-400 bg-amber-500/10 border border-amber-400/40 px-3 py-2 rounded-lg">
            Schema cache was out of date. Randomization settings will sync automatically after reload.
          </div>
        )}
        <select
          className="ml-auto px-4 py-2.5 bg-zinc-900 border border-white/20 rounded-lg text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
          value={activeKey}
          onChange={(e) => setActiveKey(e.target.value)}
        >
          {PAGE_CONFIGS.map((p) => (
            <option key={p.key} value={p.key} className="bg-zinc-900 text-white">
              {p.label}
            </option>
          ))}
        </select>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg text-white">Background Behavior</h3>
              <div className="text-sm text-white/60">{pageConfig?.label}</div>
            </div>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
              <div>
                <div className="text-white font-medium">Randomization</div>
                <div className="text-sm text-white/60">
                  {randomizationEnabled ? "New random image on each page load" : "Use single static image"}
                </div>
              </div>
              <button
                onClick={() => toggleRandomization(!randomizationEnabled)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  randomizationEnabled
                    ? "bg-green-500/20 text-green-300 border border-green-500/50"
                    : "bg-white/10 text-white/60 border border-white/20"
                }`}
              >
                {randomizationEnabled ? "Enabled" : "Disabled"}
              </button>
            </div>

            {!randomizationEnabled && (
              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="text-sm text-blue-300 mb-3 font-medium">Static Background Image</div>
                <button
                  onClick={selectStaticImage}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
                >
                  <ImagePlus className="w-4 h-4" />
                  {staticMediaId ? "Change Static Image" : "Select Static Image"}
                </button>
                {staticMediaId && (
                  <div className="text-xs text-white/50 mt-2">
                    Current: {staticMediaId.slice(0, 8)}...
                  </div>
                )}
              </div>
            )}

            {pageConfig?.supportsCarousel && (
              <div className="border-t border-white/10 pt-5">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                  <div>
                    <div className="text-white font-medium flex items-center gap-2">
                      <PlayCircle className="w-4 h-4" />
                      Carousel Mode
                    </div>
                    <div className="text-sm text-white/60">
                      Rotate backgrounds while on this page
                      {!randomizationEnabled && (
                        <span className="ml-2 text-amber-400">• Enable Randomization to activate</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (!randomizationEnabled && !carouselEnabled) {
                        await toggleRandomization(true);
                        await toggleCarousel(true);
                      } else {
                        await toggleCarousel(!carouselEnabled);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      carouselEnabled
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/50"
                        : "bg-white/10 text-white/60 border border-white/20"
                    }`}
                  >
                    {carouselEnabled ? "Enabled" : "Disabled"}
                  </button>
                </div>

                {carouselEnabled && (
                  <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/30 space-y-4">
                    <label className="block">
                      <div className="text-sm text-purple-300 mb-2 font-medium">Rotation Interval</div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="3000"
                          max="60000"
                          step="1000"
                          value={carouselInterval}
                          onChange={(e) => updateCarouselInterval(Number(e.target.value))}
                          className="flex-1"
                        />
                        <div className="text-white font-mono text-sm min-w-[80px]">
                          {(carouselInterval / 1000).toFixed(0)}s
                        </div>
                      </div>
                      <div className="text-xs text-white/50 mt-2">
                        How often to switch backgrounds (3-60 seconds)
                      </div>
                    </label>

                    <label className="block">
                      <div className="text-sm text-purple-300 mb-2 font-medium">Transition Effect</div>
                      <select
                        className="w-full px-4 py-2 bg-zinc-900 border border-white/20 rounded-lg text-white"
                        value={zone.carousel_transition || "fade"}
                        onChange={(e) => saveZone({ carousel_transition: e.target.value as any })}
                      >
                        <option value="fade">Fade</option>
                        <option value="slide">Slide</option>
                        <option value="zoom">Zoom</option>
                      </select>
                      <div className="text-xs text-white/50 mt-2">
                        Visual effect when transitioning between images
                      </div>
                    </label>

                    <label className="block">
                      <div className="text-sm text-purple-300 mb-2 font-medium">Number of Images in Rotation</div>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="1"
                          max="50"
                          step="1"
                          value={config.limit || 10}
                          onChange={(e) => saveConfig({ ...config, limit: Number(e.target.value) })}
                          className="flex-1"
                        />
                        <div className="text-white font-mono text-sm min-w-[60px]">
                          {config.limit || 10}
                        </div>
                      </div>
                      <div className="text-xs text-white/50 mt-2">
                        Maximum number of images to include in the carousel
                      </div>
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>

          {randomizationEnabled && (
            <div className="glass-card p-6 space-y-5">
              <div className="flex items-center gap-2 text-white/90 mb-2">
                <h3 className="font-semibold text-lg">Image Source Configuration</h3>
                <Info className="w-4 h-4 text-white/50" />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <label className="block">
                  <div className="text-sm text-white/70 mb-2 font-medium">Source Type</div>
                  <select
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-white/20 rounded-lg text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                    value={config?.source?.type || "tag"}
                    onChange={(e) =>
                      saveConfig({ ...config, source: { type: e.target.value as any, value: config?.source?.value || "" } })
                    }
                  >
                    <option value="tag" className="bg-zinc-900 text-white">Tag</option>
                    <option value="folder" className="bg-zinc-900 text-white">Folder</option>
                    <option value="gallery" className="bg-zinc-900 text-white">Gallery</option>
                  </select>
                </label>

                <label className="block">
                  <div className="text-sm text-white/70 mb-2 font-medium">Source Value</div>
                  {config?.source?.type === "folder" ? (
                    <>
                      <select
                        className="w-full px-4 py-2.5 bg-zinc-900 border border-white/20 rounded-lg text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                        value={config?.source?.value || ""}
                        onChange={(e) => {
                          console.log('[ZonesManager] Folder selected:', e.target.value);
                          const newConfig = { ...config, source: { type: "folder" as const, value: e.target.value } };
                          console.log('[ZonesManager] New config:', newConfig);
                          saveConfig(newConfig);
                        }}
                      >
                        <option value="" className="bg-zinc-900 text-white">Select folder...</option>
                        {folders.map((f) => (
                          <option key={f.id} value={f.id} className="bg-zinc-900 text-white">
                            {f.name}
                          </option>
                        ))}
                      </select>
                      {folders.length === 0 && (
                        <div className="text-xs text-red-400 mt-1">⚠ No folders found. Create folders in Media Library first.</div>
                      )}
                    </>
                  ) : config?.source?.type === "gallery" ? (
                    <select
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-white/20 rounded-lg text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                      value={config?.source?.value || ""}
                      onChange={(e) =>
                        saveConfig({ ...config, source: { type: "gallery" as const, value: e.target.value } })
                      }
                    >
                      <option value="" className="bg-zinc-900 text-white">Select gallery...</option>
                      {galleries.map((g) => (
                        <option key={g.id} value={g.id} className="bg-zinc-900 text-white">
                          {g.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="w-full px-4 py-2.5 bg-zinc-900 border border-white/20 rounded-lg text-white placeholder-white/40 hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                      value={config?.source?.value || ""}
                      onChange={(e) =>
                        saveConfig({ ...config, source: { type: "tag" as const, value: e.target.value } })
                      }
                      placeholder="Tag name (e.g., homebg)..."
                    />
                  )}
                  <div className="text-xs text-white/50 mt-1.5">
                    {config?.source?.type === "tag" && "Images with this tag will be used"}
                    {config?.source?.type === "folder" && "Images from this folder will be used"}
                    {config?.source?.type === "gallery" && "Images from this gallery will be used"}
                  </div>
                </label>
              </div>

              <label className="block">
                <div className="text-sm text-white/70 mb-2 font-medium">Pool Size Limit</div>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-white/20 rounded-lg text-white hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-white/30"
                  value={config.limit ?? 10}
                  onChange={(e) => saveConfig({ ...config, limit: Number(e.target.value) })}
                  min={1}
                  max={100}
                />
                <div className="text-xs text-white/50 mt-1.5">
                  Maximum number of images to include in random selection pool
                </div>
              </label>

              <div className="border-t border-white/10 pt-5 mt-5">
                <div className="text-sm text-white/70 mb-3 font-medium">Quick Setup</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
                    onClick={useFolderFromPicks}
                  >
                    <FolderOpen className="w-4 h-4" />
                    Use Folder from Picked Image
                  </button>
                  <button
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm flex items-center gap-2 transition-colors"
                    onClick={createGalleryFromPicks}
                  >
                    <ImagePlus className="w-4 h-4" />
                    Create Gallery from Picks
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-5 border-t border-white/10 mt-5">
                <button
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg text-white flex items-center gap-2 transition-colors disabled:opacity-50"
                  onClick={testRandomSelection}
                  disabled={!config?.source?.value}
                >
                  <RefreshCw className="w-4 h-4" />
                  Test Random Selection
                </button>
                <button
                  className="px-5 py-2.5 bg-white text-black hover:bg-white/90 rounded-lg flex items-center gap-2 transition-colors font-medium disabled:opacity-50"
                  onClick={() => saveConfig(config)}
                  disabled={saving}
                >
                  <Save className="w-4 h-4" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {previewImages.length > 0 && (
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white">
                  Available Images ({previewImages.length})
                </h3>
                <button
                  onClick={() => setPreviewImages([])}
                  className="text-sm text-white/60 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                {previewImages.map((img) => (
                  <div
                    key={img.id}
                    className="aspect-square rounded-lg overflow-hidden border border-white/10 relative group"
                  >
                    <img
                      src={ImageService.getOptimizedUrl(img.bucket_name, img.storage_path, "thumbnail")}
                      alt={img.alt_text || img.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="text-white text-xs text-center p-2">
                        {img.title || img.filename}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-3 text-sm">Current Status</h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Randomization:</span>
                <span className={randomizationEnabled ? "text-green-400" : "text-white/40"}>
                  {randomizationEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              {pageConfig?.supportsCarousel && (
                <div className="flex justify-between items-center">
                  <span className="text-white/60">Carousel:</span>
                  <span className={carouselEnabled ? "text-purple-400" : "text-white/40"}>
                    {carouselEnabled ? `Every ${(carouselInterval / 1000).toFixed(0)}s` : "Disabled"}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-white/60">Source Type:</span>
                <span className="text-white/90 capitalize">{config?.source?.type || "tag"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Pool Size:</span>
                <span className="text-white/90">{config.limit || 10} images</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-3 text-sm">Available Folders</h3>
            <div className="max-h-40 overflow-auto border border-white/10 rounded-lg p-3 bg-black/40 space-y-1.5">
              {folders.map((f) => (
                <div key={f.id} className="text-xs text-white/80">
                  <div className="font-medium">{f.name}</div>
                  <div className="font-mono text-white/50 text-[10px]">{f.id.slice(0, 16)}...</div>
                </div>
              ))}
              {folders.length === 0 && (
                <div className="text-xs text-white/50">No folders created yet</div>
              )}
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-semibold text-white mb-3 text-sm">Available Galleries</h3>
            <div className="max-h-40 overflow-auto border border-white/10 rounded-lg p-3 bg-black/40 space-y-1.5">
              {galleries.map((g) => (
                <div key={g.id} className="text-xs text-white/80">
                  <div className="font-medium">{g.title}</div>
                  <div className="font-mono text-white/50 text-[10px]">{g.id.slice(0, 16)}...</div>
                </div>
              ))}
              {galleries.length === 0 && (
                <div className="text-xs text-white/50">No galleries created yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
      {modal}
      {modalStatic}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
