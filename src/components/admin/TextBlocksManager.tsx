import React, { useState } from "react";
import { X } from "lucide-react";
import useSupabaseTable from "../../hooks/useSupabaseTable";
import { TextBlock } from "../../lib/types";
import { supabase } from "../../lib/supabase";

export default function TextBlocksManager() {
  const tQ = useSupabaseTable<TextBlock>({
    table: "text_blocks",
    order: { column: "updated_at", ascending: false },
  });

  const [editing, setEditing] = useState<TextBlock | null>(null);

  async function createBlock() {
    const key = prompt("New text key (e.g. 'home.hero.subtitle')?");
    if (!key) return;
    const created = await tQ.insert({ key, content_md: "" } as any);
    setEditing(created);
  }

  return (
    <div className="p-6 space-y-4">
      <header className="flex items-center gap-3">
        <div className="text-xl font-semibold text-white">Text Blocks</div>
        <button className="ml-auto px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white" onClick={createBlock}>
          New Block
        </button>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="text-left text-white/70 border-b border-white/10">
            <tr>
              <th className="p-3">Key</th>
              <th className="p-3">Updated</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {tQ.items.map((tb) => (
              <tr key={tb.id} className="border-t border-white/10 hover:bg-white/5">
                <td className="p-3 font-mono text-sm">{tb.key}</td>
                <td className="p-3 text-white/60">{new Date(tb.updated_at).toLocaleString()}</td>
                <td className="p-3 text-right">
                  <button
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-white"
                    onClick={() => setEditing(tb)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && <TextBlockEditor tb={editing} onClose={() => setEditing(null)} onSave={() => tQ.fetchAll()} />}
    </div>
  );
}

function TextBlockEditor({
  tb,
  onClose,
  onSave,
}: {
  tb: TextBlock;
  onClose: () => void;
  onSave: () => void;
}) {
  const [content, setContent] = useState(tb.content_md ?? "");

  async function save() {
    await supabase.from("text_blocks").update({ content_md: content }).eq("id", tb.id);
    onSave();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 grid place-items-center p-4">
      <div className="bg-black/95 border border-white/10 rounded-xl w-[min(900px,95vw)] max-h-[90vh] overflow-auto">
        <div className="p-4 border-b border-white/10 flex items-center gap-2">
          <div className="font-semibold text-white">Edit: {tb.key}</div>
          <button className="ml-auto p-1 hover:bg-white/10 rounded" onClick={onClose}>
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-6">
          <textarea
            className="w-full h-[420px] px-3 py-2 bg-white/5 border border-white/10 rounded text-white font-mono text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter markdown content..."
          />
          <div className="mt-4 text-right">
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded text-white" onClick={save}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
