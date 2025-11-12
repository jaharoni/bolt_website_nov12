import React, { useState, useMemo } from 'react';
import { X, FolderOpen, ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { MediaFolder } from '../../../lib/types';

interface BulkMoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetFolderId: string | null) => Promise<void>;
  folders: MediaFolder[];
  selectedCount: number;
  currentFolderId: string | null;
}

interface FolderNode extends MediaFolder {
  children: FolderNode[];
  depth: number;
}

export default function BulkMoveModal({
  isOpen,
  onClose,
  onMove,
  folders,
  selectedCount,
  currentFolderId,
}: BulkMoveModalProps) {
  const [moving, setMoving] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const folderTree = useMemo(() => {
    const buildTree = (parentId: string | null, depth: number = 0): FolderNode[] => {
      return folders
        .filter(f => f.parent_id === parentId)
        .map(folder => ({
          ...folder,
          children: buildTree(folder.id, depth + 1),
          depth,
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    };
    return buildTree(null);
  }, [folders]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleMove = async () => {
    setMoving(true);
    try {
      await onMove(selectedFolder);
      onClose();
    } catch (error) {
      console.error('Move failed:', error);
    } finally {
      setMoving(false);
    }
  };

  const renderFolderTree = (nodes: FolderNode[]): React.ReactNode => {
    return nodes.map(node => {
      const isExpanded = expandedFolders.has(node.id);
      const hasChildren = node.children.length > 0;
      const isSelected = selectedFolder === node.id;
      const isCurrent = currentFolderId === node.id;

      return (
        <div key={node.id}>
          <button
            type="button"
            onClick={() => {
              if (!isCurrent) {
                setSelectedFolder(node.id);
              }
            }}
            disabled={isCurrent}
            className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
              isSelected
                ? 'bg-blue-500/20 border-l-2 border-blue-400 text-white'
                : isCurrent
                ? 'bg-white/5 text-white/40 cursor-not-allowed'
                : 'hover:bg-white/10 text-white/80'
            }`}
            style={{ paddingLeft: `${node.depth * 20 + 12}px` }}
          >
            {hasChildren && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(node.id);
                }}
                className="p-0.5 hover:bg-white/10 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            <Folder className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 truncate">{node.name}</span>
            {isCurrent && <span className="text-xs text-white/40">(current)</span>}
          </button>
          {isExpanded && hasChildren && renderFolderTree(node.children)}
        </div>
      );
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-zinc-900 border border-white/20 rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-semibold text-white">Move {selectedCount} Item{selectedCount !== 1 ? 's' : ''}</h2>
            <p className="text-sm text-white/60 mt-1">Select destination folder</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        {/* Folder Tree */}
        <div className="flex-1 overflow-auto p-4">
          {/* Root folder option */}
          <button
            type="button"
            onClick={() => setSelectedFolder(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 mb-2 text-left rounded-lg transition-colors ${
              selectedFolder === null
                ? 'bg-blue-500/20 border-l-2 border-blue-400 text-white'
                : currentFolderId === null
                ? 'bg-white/5 text-white/40 cursor-not-allowed'
                : 'hover:bg-white/10 text-white/80'
            }`}
            disabled={currentFolderId === null}
          >
            <FolderOpen className="w-4 h-4" />
            <span className="flex-1">Root / All Media</span>
            {currentFolderId === null && <span className="text-xs text-white/40">(current)</span>}
          </button>

          {/* Folder tree */}
          <div className="space-y-0.5">
            {renderFolderTree(folderTree)}
          </div>

          {folders.length === 0 && (
            <div className="text-center py-8 text-white/50">
              No folders available. Files will be moved to root.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <div className="text-sm text-white/60">
            {selectedFolder === null ? (
              'Moving to: Root folder'
            ) : (
              `Moving to: ${folders.find(f => f.id === selectedFolder)?.name || 'Selected folder'}`
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={moving}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleMove}
              disabled={moving || (selectedFolder === currentFolderId) || (selectedFolder === null && currentFolderId === null)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
            >
              {moving ? 'Moving...' : 'Move Items'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
