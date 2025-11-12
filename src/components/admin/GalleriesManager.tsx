import React, { useMemo, useState } from "react";
import { ArrowUp, ArrowDown, X, Image as ImageIcon, CheckCircle, ImagePlus } from "lucide-react";
import useSupabaseTable from "../../hooks/useSupabaseTable";
import { Gallery, GalleryItem, Media, SiteZone } from "../../lib/types";
import slugify from "../../lib/slugify";
import { supabase } from "../../lib/supabase";
import ImageService from "../../lib/imageService";
import { useSelection } from "./SelectionBus";
import EmbeddedMediaManager from "./EmbeddedMediaManager";

export default function GalleriesManager() {
  const gQ = useSupabaseTable<Gallery>({
    table: "galleries",
    order: { column: "updated_at", ascending: false },
  });
  const giQ = useSupabaseTable<GalleryItem>({
    table: "gallery_items",
    order: { column: "position", ascending: true },
  });
  const mediaQ = useSupabaseTable<Media>({
    table: "media_items",
    order: { column: "created_at", ascending: false },
  });
  const zonesQ = useSupabaseTable<SiteZone>({
    table: "site_zones",
    order: { column: "updated_at", ascending: false },
  });

  const [editing, setEditing] = useState<Gallery | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const sel = useSelection();

  const galleries = useMemo(() => {
    const s = searchQuery.toLowerCase().trim();
    return !s
      ? gQ.items
      : gQ.items.filter((x) => (x.title + " " + (x.description ?? "")).toLowerCase().includes(s));
  }, [gQ.items, searchQuery]);

  async function createGallery() {
    const title = prompt("Gallery title?");
    if (!title) return;
    await gQ.insert({ title, slug: slugify(title), description: "", is_active: true } as any);
  }

  async function addSelectedToGallery(g: Gallery) {
    const ids = Array.from(sel.selected);
    const existing = giQ.items.filter((x) => x.gallery_id === g.id);
    let pos = existing.length;

    for (const mediaId of ids) {
      await supabase.from("gallery_items").insert({
        gallery_id: g.id,
        media_id: mediaId,
        position: pos++,
      });
    }
    sel.clear();
    await giQ.fetchAll();
  }

  async function createOrUpdateBackgroundZone(g: Gallery) {
    const key = `page.gallery.${g.slug}.background`;
    const existing = zonesQ.items.find((z) => z.key === key);

    const config = {
      mode: "random" as const,
      source: { type: "gallery" as const, value: g.id },
      limit: 1,
      refreshSec: 0,
    };

    if (existing) {
      await supabase.from("site_zones").update({ config_json: config }).eq("id", existing.id);
    } else {
      await supabase.from("site_zones").insert({ key, config_json: config });
    }

    await zonesQ.fetchAll();
    alert(`Background zone "${key}" ${existing ? "updated" : "created"}!`);
  }

  function hasBackgroundZone(g: Gallery): boolean {
    const key = `page.gallery.${g.slug}.background`;
    return zonesQ.items.some((z) => z.key === key);
  }

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center gap-3">
        <div className="text-xl font-semibold text-white">Galleries</div>
        <button
          className="ml-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white"
          onClick={createGallery}
        >
          New Gallery
        </button>
        <input
          className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/50"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="text-left text-white/70 border-b border-white/10">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Active</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {galleries.map((g) => (
              <tr key={g.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-3">{g.title}</td>
                <td className="p-3 text-white/60">{g.slug}</td>
                <td className="p-3">{g.is_active ? "Yes" : "No"}</td>
                <td className="p-3">
                  <div className="flex gap-2 justify-end items-center">
                    {hasBackgroundZone(g) && (
                      <CheckCircle className="w-4 h-4 text-green-400" title="Has background zone" />
                    )}
                    <button
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white"
                      onClick={() => setEditing(g)}
                    >
                      Edit
                    </button>
                    <button
                      disabled={sel.count === 0}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-40 disabled:cursor-not-allowed"
                      onClick={() => addSelectedToGallery(g)}
                    >
                      Add Selected Media
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-500/80 hover:bg-blue-500 rounded text-white flex items-center gap-1"
                      onClick={() => createOrUpdateBackgroundZone(g)}
                      title="Create or update page background zone"
                    >
                      <ImageIcon className="w-4 h-4" />
                      {hasBackgroundZone(g) ? "Update" : "Create"} Zone
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <GalleryEditor g={editing} onClose={() => setEditing(null)} mediaQ={mediaQ} giQ={giQ} />
      )}
    </div>
  );
}

function GalleryEditor({
  g,
  onClose,
  mediaQ,
  giQ,
}: {
  g: Gallery;
  onClose: () => void;
  mediaQ: any;
  giQ: any;
}) {
  const [title, setTitle] = useState(g.title);
  const [slug, setSlug] = useState(g.slug);
  const [desc, setDesc] = useState(g.description ?? "");
  const [isActive, setIsActive] = useState(g.is_active);
  const [coverMediaId, setCoverMediaId] = useState<string[]>(g.cover_media_id ? [g.cover_media_id] : []);
  const [stagedMediaIds, setStagedMediaIds] = useState<string[]>([]);

  const items: GalleryItem[] = giQ.items
    .filter((x: GalleryItem) => x.gallery_id === g.id)
    .sort((a: GalleryItem, b: GalleryItem) => a.position - b.position);

  async function save() {
    const galleryData = {
      title,
      slug,
      description: desc,
      is_active: isActive,
      cover_media_id: coverMediaId[0] || null,
    };

    await supabase.from("galleries").update(galleryData).eq("id", g.id);
    await giQ.fetchAll();
    onClose();
  }

  async function removeItem(id: string) {
    await supabase.from("gallery_items").delete().eq("id", id);
    await giQ.fetchAll();
  }

  async function moveItem(id: string, direction: -1 | 1) {
    const idx = items.findIndex((i) => i.id === id);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const itemA = items[idx];
    const itemB = items[targetIdx];

    await supabase.from("gallery_items").update({ position: itemB.position }).eq("id", itemA.id);
    await supabase.from("gallery_items").update({ position: itemA.position }).eq("id", itemB.id);
    await giQ.fetchAll();
  }

  async function addStagedImages() {
    if (stagedMediaIds.length === 0) return;

    let pos = items.length;
    for (const media_id of stagedMediaIds) {
      await supabase.from("gallery_items").insert({
        gallery_id: g.id,
        media_id,
        position: pos++,
      });
    }
    setStagedMediaIds([]);
    await giQ.fetchAll();
  }

  return (
    <div className="mt-6 border border-white/10 rounded-xl overflow-hidden bg-black/40">
      <div className="p-4 border-b border-white/10 flex items-center gap-2">
        <div className="font-semibold text-white">Edit Gallery</div>
        <button className="ml-auto px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white" onClick={onClose}>
          Close
        </button>
      </div>

        <div className="p-6 grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="block">
              <div className="text-xs text-white/70 mb-1">Title</div>
              <input
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setSlug(slugify(title))}
              />
            </label>
            <label className="block">
              <div className="text-xs text-white/70 mb-1">Slug</div>
              <input
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </label>
            <label className="block">
              <div className="text-xs text-white/70 mb-1">Description</div>
              <textarea
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white h-28"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 text-white">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4"
              />
              <span>Active (visible)</span>
            </label>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white" onClick={save}>
              Save
            </button>
          </div>

          <div>
            <EmbeddedMediaManager
              mode="single"
              selectedMediaIds={coverMediaId}
              onMediaChange={setCoverMediaId}
              context={{ type: "gallery", id: g.id, name: g.title }}
              label="Cover Image"
            />

            <div className="mt-6">
              <EmbeddedMediaManager
                mode="multiple"
                selectedMediaIds={stagedMediaIds}
                onMediaChange={setStagedMediaIds}
                context={{ type: "gallery", id: g.id, name: g.title }}
                label="Add New Images"
              />
              {stagedMediaIds.length > 0 && (
                <button
                  className="mt-2 w-full px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white text-sm flex items-center justify-center gap-1"
                  onClick={addStagedImages}
                >
                  <ImagePlus className="w-4 h-4" />
                  Add {stagedMediaIds.length} Image(s) to Gallery
                </button>
              )}
            </div>

            <div className="mt-6">
              <div className="text-xs text-white/70 mb-3">Current Gallery Images (reorder with arrows)</div>
              <div className="grid grid-cols-3 gap-3">
              {items.map((it) => {
                const m: Media | undefined = mediaQ.items.find((x: Media) => x.id === it.media_id);
                if (!m) return null;

                return (
                  <div key={it.id} className="border border-white/10 rounded overflow-hidden bg-black/40">
                    <img
                      className="w-full aspect-[4/3] object-cover"
                      src={ImageService.getOptimizedUrl(m.bucket_name, m.storage_path, "thumbnail")}
                      alt={m.alt_text ?? ""}
                    />
                    <div className="p-2 text-xs text-white flex items-center justify-between">
                      <div>#{it.position}</div>
                      <div className="flex gap-1">
                        <button
                          className="p-1 bg-white/10 hover:bg-white/20 rounded"
                          onClick={() => moveItem(it.id, -1)}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          className="p-1 bg-white/10 hover:bg-white/20 rounded"
                          onClick={() => moveItem(it.id, 1)}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          className="p-1 bg-red-500/80 hover:bg-red-500 rounded"
                          onClick={() => removeItem(it.id)}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
