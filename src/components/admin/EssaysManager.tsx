import React, { useMemo, useState } from "react";
import { ExternalLink, ImagePlus } from "lucide-react";
import useSupabaseTable from "../../hooks/useSupabaseTable";
import { Essay, Media } from "../../lib/types";
import slugify from "../../lib/slugify";
import ConfirmDialogNew from "./ConfirmDialogNew";
import ImageService from "../../lib/imageService";
import { useSelection } from "./SelectionBus";
import { supabase } from "../../lib/supabase";
import EmbeddedMediaManager from "./EmbeddedMediaManager";

export default function EssaysManager() {
  const { items, insert, update, remove, loading, error } = useSupabaseTable<Essay>({
    table: "essays",
    order: { column: "created_at", ascending: false },
  });

  const [editing, setEditing] = useState<Essay | null>(null);
  const [confirm, setConfirm] = useState<Essay | null>(null);
  const [q, setQ] = useState("");
  const sel = useSelection();

  const filtered = useMemo(() => {
    const qq = q.toLowerCase().trim();
    if (!qq) return items;
    return items.filter((e) =>
      [e.title, e.excerpt, e.slug, (e.tags ?? []).join(" ")].join(" ").toLowerCase().includes(qq)
    );
  }, [items, q]);

  async function attachSelectedToEssay() {
    const essayTitle = prompt("Attach to which Essay? Type title (exact or partial).");
    if (!essayTitle) return;
    const essay = items.find((e) => e.title.toLowerCase().includes(essayTitle.toLowerCase()));
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
  }

  return (
    <div className="p-4 space-y-4">
      <header className="flex flex-wrap items-center gap-2">
        <div className="text-xl font-semibold text-white">Essays</div>
        <button
          className="ml-auto px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white"
          onClick={() => {
            setEditing({
              id: "new",
              title: "",
              slug: "",
              excerpt: "",
              publish_status: "draft",
              tags: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as any);
          }}
        >
          New Essay
        </button>
        <button
          disabled={sel.count === 0}
          className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-white disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={attachSelectedToEssay}
        >
          Attach Selected Media ({sel.count})
        </button>
        <input
          className="px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/50"
          placeholder="Search..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </header>

      {loading && <div className="text-white/70 text-sm">Loading...</div>}
      {error && <div className="text-red-400 text-sm">Error: {String(error.message || error)}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="text-left text-white/70 border-b border-white/10">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Status</th>
              <th className="p-2">Tags</th>
              <th className="p-2">Updated</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-2">{e.title}</td>
                <td className="p-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                      e.publish_status === "published"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    }`}
                  >
                    {e.publish_status}
                  </span>
                </td>
                <td className="p-2 text-white/60">{(e.tags ?? []).join(", ")}</td>
                <td className="p-2 text-white/60">{new Date(e.updated_at).toLocaleDateString()}</td>
                <td className="p-2">
                  <div className="flex gap-2 justify-end">
                    <a
                      className="text-white/70 hover:text-white underline flex items-center gap-1"
                      href={`/essays/${e.slug}`}
                      target="_blank"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Preview
                    </a>
                    <button
                      className="px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-white"
                      onClick={() => setEditing(e)}
                    >
                      Edit
                    </button>
                    <button
                      className="px-2 py-1 bg-red-500/80 hover:bg-red-500 rounded text-white"
                      onClick={() => setConfirm(e)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EssayEditor
          essay={editing}
          onClose={() => setEditing(null)}
          onSave={async (payload) => {
            if (editing.id === "new") {
              await insert(payload as any);
            } else {
              await update("id", editing.id, payload as any);
            }
            setEditing(null);
          }}
        />
      )}

      {confirm && (
        <ConfirmDialogNew
          title="Delete essay"
          description={`Remove "${confirm.title}"?`}
          onCancel={() => setConfirm(null)}
          onConfirm={async () => {
            await remove("id", confirm.id);
            setConfirm(null);
          }}
        />
      )}
    </div>
  );
}

function EssayEditor({ essay, onClose, onSave }: {
  essay: Essay;
  onClose: () => void;
  onSave: (v: Partial<Essay>) => Promise<any>;
}) {
  const [title, setTitle] = useState(essay.title);
  const [slug, setSlug] = useState(essay.slug || "");
  const [subtitle, setSubtitle] = useState(essay.subtitle ?? "");
  const [excerpt, setExcerpt] = useState(essay.excerpt ?? "");
  const [tags, setTags] = useState((essay.tags ?? []).join(", "));
  const [status, setStatus] = useState<Essay["publish_status"]>(essay.publish_status);
  const [cover, setCover] = useState<string | null>(essay.featured_image_id ?? null);
  const [stagedMediaIds, setStagedMediaIds] = useState<string[]>([]);

  function autoSlug() {
    if (!slug) setSlug(slugify(title));
  }

  async function handleSave() {
    const essayData = {
      title,
      slug,
      subtitle,
      excerpt,
      tags: tags.split(",").map((s) => s.trim()).filter(Boolean),
      publish_status: status,
      featured_image_id: cover,
    };

    if (essay.id === "new") {
      const { data: newEssay, error } = await supabase
        .from("essays")
        .insert(essayData)
        .select()
        .single();

      if (error || !newEssay) {
        alert("Failed to create essay: " + (error?.message || "Unknown error"));
        return;
      }

      if (stagedMediaIds.length > 0) {
        const mediaInserts = stagedMediaIds.map((media_id, index) => ({
          essay_id: newEssay.id,
          media_id,
          position: index,
        }));

        await supabase.from("essays_media").insert(mediaInserts);
      }

      await onSave(essayData);
    } else {
      await onSave(essayData);
    }

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 grid place-items-center p-4">
      <div className="bg-black/90 border border-white/10 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <div className="font-semibold text-white">Edit Essay</div>
          <button className="ml-auto px-3 py-1 bg-white/10 rounded text-white" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="p-4 grid lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <label className="block">
              <div className="text-xs text-white/70 mb-1">Title</div>
              <input
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={autoSlug}
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
              <div className="text-xs text-white/70 mb-1">Subtitle</div>
              <input
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
              />
            </label>
            <label className="block">
              <div className="text-xs text-white/70 mb-1">Status</div>
              <select
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <label className="block">
              <div className="text-xs text-white/70 mb-1">Excerpt</div>
              <textarea
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded h-24 text-white"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
            </label>
            <label className="block">
              <div className="text-xs text-white/70 mb-1">Tags (comma separated)</div>
              <input
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </label>
          </div>
          <div className="space-y-3">
            <CoverPicker coverId={cover} onChange={setCover} />
            {essay.id === "new" && (
              <EmbeddedMediaManager
                mode="multiple"
                selectedMediaIds={stagedMediaIds}
                onMediaChange={setStagedMediaIds}
                context={{ type: "essay", name: title }}
                label="Essay Images (staged)"
              />
            )}
          </div>
        </div>
        <div className="p-4 border-t border-white/10 flex justify-end gap-2">
          <button
            className="px-4 py-2 bg-white/10 rounded text-white"
            onClick={handleSave}
          >
            {essay.id === "new" && stagedMediaIds.length > 0
              ? `Save Essay & Attach ${stagedMediaIds.length} Image(s)`
              : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CoverPicker({ coverId, onChange }: { coverId: string | null; onChange: (v: string | null) => void }) {
  const { items } = useSupabaseTable<Media>({
    table: "media_items",
    order: { column: "created_at", ascending: false },
  });

  return (
    <div>
      <div className="text-xs text-white/70 mb-1">Cover Image</div>
      {coverId && (() => {
        const m = items.find((x) => x.id === coverId);
        return m ? (
          <div className="mb-2">
            <img
              className="w-full rounded"
              src={ImageService.getOptimizedUrl(m.bucket_name, m.storage_path, "small")}
              alt={m.alt_text ?? ""}
            />
          </div>
        ) : null;
      })()}
      <div className="grid grid-cols-4 gap-2 max-h-[240px] overflow-auto border border-white/10 rounded p-2 bg-black/20">
        {items.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={`border ${
              coverId === m.id ? "border-white/80" : "border-white/10"
            } rounded overflow-hidden`}
          >
            <img
              className="w-full aspect-[4/3] object-cover"
              src={ImageService.getOptimizedUrl(m.bucket_name, m.storage_path, "thumbnail")}
              alt={m.alt_text ?? ""}
              loading="lazy"
            />
          </button>
        ))}
      </div>
      {coverId && (
        <button className="mt-2 px-3 py-1 bg-white/10 rounded text-white" onClick={() => onChange(null)}>
          Clear cover
        </button>
      )}
    </div>
  );
}
