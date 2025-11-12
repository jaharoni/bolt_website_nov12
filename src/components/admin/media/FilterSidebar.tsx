import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { mediaService } from '../../../lib/mediaService';

interface FilterSidebarProps {
  filters: {
    isVisible?: boolean;
    pricingEnabled?: boolean;
    locations?: string[];
    collectionId?: string;
    batchId?: string;
    searchQuery?: string;
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFiltersChange,
  onClose
}) => {
  const [collections, setCollections] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    visibility: true,
    pricing: true,
    collections: false,
    batches: false,
  });

  useEffect(() => {
    loadCollections();
    loadBatches();
  }, []);

  const loadCollections = async () => {
    try {
      const data = await mediaService.getAllCollections();
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const loadBatches = async () => {
    try {
      const data = await mediaService.getAllBatches();
      setBatches(data);
    } catch (error) {
      console.error('Error loading batches:', error);
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const clearAllFilters = () => {
    onFiltersChange({
      isVisible: undefined,
      pricingEnabled: undefined,
      locations: [],
      collectionId: undefined,
      batchId: undefined,
      searchQuery: '',
    });
  };

  const hasActiveFilters =
    filters.isVisible !== undefined ||
    filters.pricingEnabled !== undefined ||
    (filters.locations && filters.locations.length > 0) ||
    filters.collectionId ||
    filters.batchId;

  return (
    <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-white font-semibold">Filters</h4>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-yellow-400 hover:text-yellow-300"
            >
              Clear All
            </button>
          )}
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Visibility Section */}
        <div className="border-b border-white/10 pb-4">
          <button
            onClick={() => toggleSection('visibility')}
            className="flex items-center justify-between w-full text-white/80 hover:text-white mb-2"
          >
            <span className="font-medium">Visibility</span>
            {expandedSections.visibility ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.visibility && (
            <div className="space-y-2 ml-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={filters.isVisible === undefined}
                  onChange={() => onFiltersChange({ ...filters, isVisible: undefined })}
                  className="w-4 h-4"
                />
                <span className="text-white/70 text-sm">All</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={filters.isVisible === true}
                  onChange={() => onFiltersChange({ ...filters, isVisible: true })}
                  className="w-4 h-4"
                />
                <span className="text-white/70 text-sm">Visible Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  checked={filters.isVisible === false}
                  onChange={() => onFiltersChange({ ...filters, isVisible: false })}
                  className="w-4 h-4"
                />
                <span className="text-white/70 text-sm">Hidden Only</span>
              </label>
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <div className="border-b border-white/10 pb-4">
          <button
            onClick={() => toggleSection('pricing')}
            className="flex items-center justify-between w-full text-white/80 hover:text-white mb-2"
          >
            <span className="font-medium">Pricing</span>
            {expandedSections.pricing ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {expandedSections.pricing && (
            <div className="space-y-2 ml-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pricing"
                  checked={filters.pricingEnabled === undefined}
                  onChange={() => onFiltersChange({ ...filters, pricingEnabled: undefined })}
                  className="w-4 h-4"
                />
                <span className="text-white/70 text-sm">All</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pricing"
                  checked={filters.pricingEnabled === true}
                  onChange={() => onFiltersChange({ ...filters, pricingEnabled: true })}
                  className="w-4 h-4"
                />
                <span className="text-white/70 text-sm">With Pricing</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="pricing"
                  checked={filters.pricingEnabled === false}
                  onChange={() => onFiltersChange({ ...filters, pricingEnabled: false })}
                  className="w-4 h-4"
                />
                <span className="text-white/70 text-sm">Without Pricing</span>
              </label>
            </div>
          )}
        </div>

        {/* Collections Section */}
        {collections.length > 0 && (
          <div className="border-b border-white/10 pb-4">
            <button
              onClick={() => toggleSection('collections')}
              className="flex items-center justify-between w-full text-white/80 hover:text-white mb-2"
            >
              <span className="font-medium">Collections</span>
              {expandedSections.collections ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.collections && (
              <div className="space-y-2 ml-2 max-h-48 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="collection"
                    checked={!filters.collectionId}
                    onChange={() => onFiltersChange({ ...filters, collectionId: undefined })}
                    className="w-4 h-4"
                  />
                  <span className="text-white/70 text-sm">All Collections</span>
                </label>
                {collections.map(collection => (
                  <label key={collection.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="collection"
                      checked={filters.collectionId === collection.id}
                      onChange={() => onFiltersChange({ ...filters, collectionId: collection.id })}
                      className="w-4 h-4"
                    />
                    <span className="text-white/70 text-sm">{collection.title}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Batches Section */}
        {batches.length > 0 && (
          <div>
            <button
              onClick={() => toggleSection('batches')}
              className="flex items-center justify-between w-full text-white/80 hover:text-white mb-2"
            >
              <span className="font-medium">Upload Batches</span>
              {expandedSections.batches ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {expandedSections.batches && (
              <div className="space-y-2 ml-2 max-h-48 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="batch"
                    checked={!filters.batchId}
                    onChange={() => onFiltersChange({ ...filters, batchId: undefined })}
                    className="w-4 h-4"
                  />
                  <span className="text-white/70 text-sm">All Batches</span>
                </label>
                {batches.map(batch => (
                  <label key={batch.id} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="batch"
                      checked={filters.batchId === batch.id}
                      onChange={() => onFiltersChange({ ...filters, batchId: batch.id })}
                      className="w-4 h-4"
                    />
                    <span className="text-white/70 text-sm truncate">
                      {batch.batch_name || `Batch ${batch.upload_count} files`}
                      <span className="text-white/50 text-xs ml-2">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
