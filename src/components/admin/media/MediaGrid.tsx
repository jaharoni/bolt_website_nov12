import React from 'react';
import { Eye, EyeOff, DollarSign, Check, Package } from 'lucide-react';
import { MediaItem } from '../../../lib/mediaService';

interface MediaGridProps {
  items: MediaItem[];
  selectedItems: Set<string>;
  onToggleSelection: (id: string, shiftKey: boolean) => void;
  viewMode: 'grid' | 'list';
  visibilityLocations: Array<{ value: string; label: string; icon: string }>;
}

const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  selectedItems,
  onToggleSelection,
  viewMode,
  visibilityLocations
}) => {
  const getLocationLabel = (location: string) => {
    const loc = visibilityLocations.find(l => l.value === location);
    return loc ? loc.icon : '📍';
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={(e) => onToggleSelection(item.id, e.shiftKey)}
            className={`flex items-center gap-4 p-4 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors ${
              selectedItems.has(item.id) ? 'ring-2 ring-yellow-400' : ''
            }`}
          >
            <div className="flex-shrink-0">
              <input
                type="checkbox"
                checked={selectedItems.has(item.id)}
                onChange={() => {}}
                className="w-4 h-4"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="w-16 h-16 flex-shrink-0 bg-white/5 rounded overflow-hidden">
              <img
                src={item.public_url}
                alt={item.title || item.filename}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">
                {item.title || item.filename}
              </p>
              <p className="text-white/60 text-sm truncate">
                {item.description || 'No description'}
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                    {tag}
                  </span>
                ))}
                {item.tags.length > 3 && (
                  <span className="text-xs px-2 py-0.5 bg-white/10 text-white/60 rounded">
                    +{item.tags.length - 3}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Visibility Indicator */}
              <div className="flex items-center gap-1">
                {item.is_visible ? (
                  <Eye className="w-4 h-4 text-green-400" title="Visible" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white/40" title="Hidden" />
                )}
                {item.visibility_locations.length > 0 && (
                  <span className="text-xs text-white/60">
                    {item.visibility_locations.map(getLocationLabel).join(' ')}
                  </span>
                )}
              </div>

              {/* Pricing Indicator */}
              {item.pricing_enabled && (
                <DollarSign className="w-4 h-4 text-yellow-400" title="Pricing enabled" />
              )}

              {/* Collection Indicator */}
              {item.collection_id && (
                <Package className="w-4 h-4 text-purple-400" title="In collection" />
              )}

              {/* Dimensions */}
              <span className="text-xs text-white/60">
                {item.width} × {item.height}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={(e) => onToggleSelection(item.id, e.shiftKey)}
          className={`group relative glass-card overflow-hidden cursor-pointer hover:scale-105 transition-transform ${
            selectedItems.has(item.id) ? 'ring-2 ring-yellow-400' : ''
          }`}
        >
          {/* Image */}
          <div className="aspect-square bg-white/5 relative">
            <img
              src={item.public_url}
              alt={item.title || item.filename}
              className="w-full h-full object-cover"
            />

            {/* Selection Checkbox */}
            <div className="absolute top-2 left-2">
              {selectedItems.has(item.id) && (
                <div className="bg-yellow-400 rounded-full p-1">
                  <Check className="w-3 h-3 text-black" />
                </div>
              )}
            </div>

            {/* Status Badges */}
            <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
              {!item.is_visible && (
                <span className="px-2 py-1 bg-red-500/90 text-white text-xs rounded">
                  Hidden
                </span>
              )}
              {item.pricing_enabled && (
                <span className="px-2 py-1 bg-yellow-400/90 text-black text-xs rounded flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  For Sale
                </span>
              )}
              {item.collection_id && (
                <span className="px-2 py-1 bg-purple-500/90 text-white text-xs rounded">
                  <Package className="w-3 h-3" />
                </span>
              )}
            </div>

            {/* Dimensions Overlay */}
            <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded">
              {item.width} × {item.height}
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <p className="text-white text-sm font-medium truncate" title={item.title || item.filename}>
              {item.title || item.filename}
            </p>

            {/* Visibility Locations */}
            {item.visibility_locations.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.visibility_locations.map((loc, idx) => (
                  <span key={idx} className="text-xs" title={loc}>
                    {getLocationLabel(loc)}
                  </span>
                ))}
              </div>
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {item.tags.slice(0, 2).map((tag, idx) => (
                  <span key={idx} className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded">
                    {tag}
                  </span>
                ))}
                {item.tags.length > 2 && (
                  <span className="text-xs px-2 py-0.5 bg-white/10 text-white/60 rounded">
                    +{item.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MediaGrid;
