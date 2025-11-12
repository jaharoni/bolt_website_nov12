import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Trash2, Package } from 'lucide-react';
import { mediaService, MediaCollection } from '../../../lib/mediaService';

interface CollectionManagerProps {
  onClose: () => void;
  selectedMediaIds: string[];
}

const CollectionManager: React.FC<CollectionManagerProps> = ({
  onClose,
  selectedMediaIds
}) => {
  const [collections, setCollections] = useState<MediaCollection[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [newCollection, setNewCollection] = useState({
    title: '',
    slug: '',
    description: '',
    collection_type: 'general',
  });

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    setLoading(true);
    try {
      const data = await mediaService.getAllCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setNewCollection({
      ...newCollection,
      title,
      slug: generateSlug(title),
    });
  };

  const handleCreateCollection = async () => {
    if (!newCollection.title) {
      alert('Please enter a collection title');
      return;
    }

    try {
      const created = await mediaService.createCollection({
        ...newCollection,
        is_active: false,
        sort_order: 0,
      });

      if (selectedMediaIds.length > 0) {
        await mediaService.addMediaToCollection(created.id, selectedMediaIds);
      }

      alert('Collection created successfully!');
      setShowCreateForm(false);
      setNewCollection({ title: '', slug: '', description: '', collection_type: 'general' });
      await loadCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
      alert('Failed to create collection');
    }
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (selectedMediaIds.length === 0) {
      alert('No media items selected');
      return;
    }

    try {
      await mediaService.addMediaToCollection(collectionId, selectedMediaIds);
      alert(`Added ${selectedMediaIds.length} items to collection!`);
    } catch (error) {
      console.error('Error adding to collection:', error);
      alert('Failed to add items to collection');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="glass-card p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-display text-white flex items-center gap-2">
            <Package className="w-6 h-6" />
            Collection Manager
          </h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {selectedMediaIds.length > 0 && (
          <div className="mb-6 p-4 bg-yellow-400/20 border border-yellow-400/50 rounded-lg">
            <p className="text-white">
              {selectedMediaIds.length} media item{selectedMediaIds.length !== 1 ? 's' : ''} selected
            </p>
            <p className="text-white/60 text-sm mt-1">
              Create a new collection or add to an existing one
            </p>
          </div>
        )}

        {/* Create New Collection */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary flex items-center gap-2 w-full"
          >
            <Plus className="w-4 h-4" />
            Create New Collection
          </button>

          {showCreateForm && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg space-y-4">
              <div>
                <label className="block text-white/80 mb-2 text-sm">Title</label>
                <input
                  type="text"
                  value={newCollection.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Summer 2024 Photo Essay"
                  className="input-glass w-full"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Slug (URL)</label>
                <input
                  type="text"
                  value={newCollection.slug}
                  onChange={(e) => setNewCollection({ ...newCollection, slug: e.target.value })}
                  placeholder="summer-2024-photo-essay"
                  className="input-glass w-full"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Description</label>
                <textarea
                  value={newCollection.description}
                  onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                  placeholder="A collection of photos from..."
                  className="input-glass w-full h-20 resize-none"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm">Type</label>
                <select
                  value={newCollection.collection_type}
                  onChange={(e) => setNewCollection({ ...newCollection, collection_type: e.target.value })}
                  className="select-glass-dark w-full"
                >
                  <option value="general">General</option>
                  <option value="essay">Photo Essay</option>
                  <option value="series">Series</option>
                  <option value="campaign">Campaign</option>
                  <option value="portfolio">Portfolio</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCreateCollection}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Create Collection
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Existing Collections */}
        <div>
          <h4 className="text-white font-semibold mb-4">Existing Collections</h4>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-white/20 border-t-yellow-400 rounded-full animate-spin"></div>
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-white/20 mx-auto mb-2" />
              <p className="text-white/60">No collections yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {collections.map(collection => (
                <div
                  key={collection.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="text-white font-medium truncate">
                      {collection.title}
                    </h5>
                    <p className="text-white/60 text-sm truncate">
                      {collection.description || 'No description'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                        {collection.collection_type}
                      </span>
                      {!collection.is_active && (
                        <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-300 rounded">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>

                  {selectedMediaIds.length > 0 && (
                    <button
                      onClick={() => handleAddToCollection(collection.id)}
                      className="btn-secondary text-sm ml-4"
                    >
                      Add Selected
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={onClose}
            className="btn-secondary w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectionManager;
