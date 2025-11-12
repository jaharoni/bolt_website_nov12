import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Essay } from '../../lib/types';
import slugify from '../../lib/slugify';

type EssayEdit = {
  id?: string;
  title: string;
  slug: string;
  subtitle?: string;
  excerpt?: string;
  featured_image_id?: string;
  publish_status: 'draft' | 'published';
  is_featured: boolean;
  tags?: string[];
};

export function AdminEssays() {
  const [essays, setEssays] = useState<Essay[]>([]);
  const [editing, setEditing] = useState<Essay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEssays();
  }, []);

  async function loadEssays() {
    try {
      const { data, error } = await supabase
        .from('essays')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setEssays(data || []);
    } catch (error) {
      console.error('Failed to load essays:', error);
    } finally {
      setLoading(false);
    }
  }

  async function saveEssay() {
    if (!editing) return;

    try {
      const essayData = {
        title: (editing as any).title,
        slug: (editing as any).slug || slugify((editing as any).title),
        subtitle: (editing as any).subtitle,
        excerpt: (editing as any).excerpt,
        featured_image_id: (editing as any).featured_image_id,
        publish_status: (editing as any).published ? 'published' : 'draft',
        is_featured: (editing as any).is_featured || false,
        tags: (editing as any).tags || [],
        updated_at: new Date().toISOString()
      };

      if ((editing as any).id) {
        const { error } = await supabase
          .from('essays')
          .update(essayData)
          .eq('id', (editing as any).id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('essays')
          .insert({ ...essayData, created_at: new Date().toISOString() });

        if (error) throw error;
      }

      await loadEssays();
      setEditing(null);
      alert('Essay saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save essay');
    }
  }

  async function deleteEssay(id: string) {
    if (!confirm('Delete this essay?')) return;

    try {
      const { error } = await supabase
        .from('essays')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadEssays();
      alert('Essay deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete essay');
    }
  }

  function createNew() {
    setEditing({
      title: '',
      slug: '',
      subtitle: '',
      excerpt: '',
      featured_image_id: undefined,
      publish_status: 'draft',
      is_featured: false,
      tags: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any);
  }

  if (loading) return <div className="p-4 text-white">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Essays</h2>
        <button
          onClick={createNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Essay
        </button>
      </div>

      {editing ? (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editing.id ? 'Edit Essay' : 'New Essay'}
            </h3>
            <button
              onClick={() => setEditing(null)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Slug</label>
              <input
                type="text"
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Excerpt</label>
              <textarea
                value={editing.excerpt || ''}
                onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded h-20"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Content</label>
              <textarea
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded h-64"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Featured Image URL</label>
              <input
                type="text"
                value={editing.featured_image || ''}
                onChange={(e) => setEditing({ ...editing, featured_image: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>

            <div>
              <label className="flex items-center text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={(editing as any).published || (editing as any).publish_status === 'published'}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked, publish_status: e.target.checked ? 'published' : 'draft' } as any)}
                  className="mr-2"
                />
                Published
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveEssay}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => setEditing(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-4">
        {essays.map((essay) => (
          <div key={essay.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{essay.title}</h3>
                <p className="text-sm text-gray-400 mt-1">/{essay.slug}</p>
                {essay.excerpt && (
                  <p className="text-sm text-gray-300 mt-2">{essay.excerpt}</p>
                )}
                <div className="flex gap-4 mt-2 text-xs text-gray-400">
                  <span>{essay.publish_status === 'published' ? 'Published' : 'Draft'}</span>
                  <span>{new Date(essay.updated_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(essay)}
                  className="p-2 text-blue-400 hover:text-blue-300"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteEssay(essay.id)}
                  className="p-2 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
