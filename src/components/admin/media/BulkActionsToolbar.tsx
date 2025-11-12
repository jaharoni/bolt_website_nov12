import React, { useState } from 'react';
import { X, Trash2, Eye, EyeOff, DollarSign, Edit, Tag, Package } from 'lucide-react';
import { MediaItem } from '../../../lib/mediaService';

interface BulkActionsToolbarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkVisibilityUpdate: (locations: string[]) => void;
  onBulkUpdate: (updates: Partial<MediaItem>) => void;
  onEdit: () => void;
  visibilityLocations: Array<{ value: string; label: string; icon: string }>;
}

const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkVisibilityUpdate,
  onBulkUpdate,
  onEdit,
  visibilityLocations
}) => {
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  return (
    <div className="sticky top-0 z-10 mb-6 p-4 bg-yellow-400/20 border border-yellow-400/50 rounded-lg">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <span className="text-white font-semibold">
            {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClearSelection}
            className="text-white/60 hover:text-white"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit Button */}
          <button
            onClick={onEdit}
            className="btn-secondary flex items-center gap-2 text-sm"
          >
            <Edit className="w-4 h-4" />
            Edit Selected
          </button>

          {/* Visibility Actions */}
          <div className="relative">
            <button
              onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Eye className="w-4 h-4" />
              Visibility
            </button>

            {showVisibilityMenu && (
              <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-white/20 rounded-lg p-3 min-w-64 shadow-xl z-20">
                <div className="space-y-2">
                  <p className="text-white/80 text-xs font-semibold mb-2">Set Visibility Locations</p>
                  {visibilityLocations.map(loc => (
                    <button
                      key={loc.value}
                      onClick={() => {
                        onBulkVisibilityUpdate([loc.value]);
                        setShowVisibilityMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2"
                    >
                      <span>{loc.icon}</span>
                      <span>Add to {loc.label}</span>
                    </button>
                  ))}
                  <div className="border-t border-white/10 pt-2 mt-2">
                    <button
                      onClick={() => {
                        onBulkVisibilityUpdate([]);
                        setShowVisibilityMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10 rounded flex items-center gap-2"
                    >
                      <EyeOff className="w-4 h-4" />
                      Remove All Visibility
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowVisibilityMenu(false)}
                  className="absolute top-2 right-2 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="relative">
            <button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <Tag className="w-4 h-4" />
              Quick Actions
            </button>

            {showQuickActions && (
              <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-white/20 rounded-lg p-3 min-w-56 shadow-xl z-20">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      onBulkUpdate({ is_visible: true });
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Make Visible
                  </button>
                  <button
                    onClick={() => {
                      onBulkUpdate({ is_visible: false });
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2"
                  >
                    <EyeOff className="w-4 h-4" />
                    Make Hidden
                  </button>
                  <button
                    onClick={() => {
                      onBulkUpdate({ is_active: true });
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Activate All
                  </button>
                  <button
                    onClick={() => {
                      onBulkUpdate({ is_active: false });
                      setShowQuickActions(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded flex items-center gap-2"
                  >
                    <EyeOff className="w-4 h-4" />
                    Deactivate All
                  </button>
                </div>
                <button
                  onClick={() => setShowQuickActions(false)}
                  className="absolute top-2 right-2 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={onBulkDelete}
            className="btn-secondary flex items-center gap-2 text-sm text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;
