import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Gallery, GalleryItem } from '../../lib/types';
import slugify from '../../lib/slugify';

export function AdminGalleries() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [editing, setEditing] = useState<Gallery | null>(null);
  const [editingItems, setEditingItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGalleries();
  }, []);

  async function loadGalleries() {
    try {
      const { data, error } = await supabase
        .from('galleries')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setGalleries(data || []);
    } catch (error) {
      console.error('Failed to load galleries:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadGalleryItems(galleryId: string) {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .eq('gallery_id', galleryId)
        .order('position');

      if (error) throw error;
      setEditingItems(data || []);
    } catch (error) {
      console.error('Failed to load gallery items:', error);
    }
  }

  async function saveGallery() {
    if (!editing) return;

    try {
      const galleryData = {
        title: (editing as any).title,
        slug: (editing as any).slug || slugify((editing as any).title),
        description: (editing as any).description,
        cover_media_id: (editing as any).cover_media_id,
        is_active: (editing as any).published || (editing as any).is_active || true,
        updated_at: new Date().toISOString()
      };

      if ((editing as any).id) {
        const { error } = await supabase
          .from('galleries')
          .update(galleryData)
          .eq('id', (editing as any).id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('galleries')
          .insert({ ...galleryData, created_at: new Date().toISOString() });

        if (error) throw error;
      }

      await loadGalleries();
      setEditing(null);
      setEditingItems([]);
      alert('Gallery saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save gallery');
    }
  }

  async function deleteGallery(id: string) {
    if (!confirm('Delete this gallery and all its items?')) return;

    try {
      const { error } = await supabase
        .from('galleries')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadGalleries();
      alert('Gallery deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete gallery');
    }
  }

  async function addGalleryItem() {
    if (!(editing as any)?.id) return;
    const mediaId = prompt('Enter media item ID:');
    if (!mediaId) return;

    try {
      const { error } = await supabase
        .from('gallery_items')
        .insert({
          gallery_id: (editing as any).id,
          media_id: mediaId,
          position: editingItems.length
        });

      if (error) throw error;

      await loadGalleryItems((editing as any).id);
    } catch (error) {
      console.error('Add item error:', error);
      alert('Failed to add item');
    }
  }

  async function deleteGalleryItem(itemId: string) {
    if (!confirm('Remove this item from gallery?')) return;

    try {
      const { error } = await supabase
        .from('gallery_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;

      if ((editing as any)?.id) {
        await loadGalleryItems((editing as any).id);
      }
    } catch (error) {
      console.error('Delete item error:', error);
      alert('Failed to delete item');
    }
  }

  async function editGallery(gallery: Gallery) {
    setEditing(gallery);
    await loadGalleryItems(gallery.id);
  }

  function createNew() {
    setEditing({
      title: '',
      slug: '',
      description: '',
      cover_media_id: undefined,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setEditingItems([]);
  }

  if (loading) return <div className="p-4 text-white">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Galleries</h2>
        <button
          onClick={createNew}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          New Gallery
        </button>
      </div>

      {editing ? (
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {editing.id ? 'Edit Gallery' : 'New Gallery'}
            </h3>
            <button
              onClick={() => { setEditing(null); setEditingItems([]);  }}
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
              <label className="block text-sm text-gray-300 mb-2">Description</label>
              <textarea
                value={editing.description || ''}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded h-20"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2">Cover Image URL</label>
              <input
                type="text"
                value={editing.cover_image || ''}
                onChange={(e) => setEditing({ ...editing, cover_image: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded"
              />
            </div>

            <div>
              <label className="flex items-center text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={editing.published}
                  onChange={(e) => setEditing({ ...editing, published: e.target.checked })}
                  className="mr-2"
                />
                Published
              </label>
            </div>

            <div className="flex gap-2">
              <button
                onClick={saveGallery}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save
              </button>
              <button
                onClick={() => { setEditing(null); setEditingItems([]); }}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>

          {editing.id && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-white">Gallery Items</h4>
                <button
                  onClick={addGalleryItem}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Item
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4">
                {editingItems.map((item) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.media_url}
                      alt=""
                      className="w-full aspect-square object-cover rounded"
                    />
                    <button
                      onClick={() => deleteGalleryItem(item.id)}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="space-y-4">
        {galleries.map((gallery) => (
          <div key={gallery.id} className="bg-gray-800 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div className="flex gap-4 flex-1">
                {gallery.cover_image && (
                  <img
                    src={gallery.cover_image}
                    alt={gallery.title}
                    className="w-24 h-24 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">{gallery.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">/{gallery.slug}</p>
                  {gallery.description && (
                    <p className="text-sm text-gray-300 mt-2">{gallery.description}</p>
                  )}
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>{gallery.published ? 'Published' : 'Draft'}</span>
                    <span>{new Date(gallery.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => editGallery(gallery)}
                  className="p-2 text-blue-400 hover:text-blue-300"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteGallery(gallery.id)}
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
