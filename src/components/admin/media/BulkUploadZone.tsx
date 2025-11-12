import React, { useCallback } from 'react';
import { Upload, X, FileImage } from 'lucide-react';

interface BulkUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  queuedFiles: File[];
  onRemoveFile: (index: number) => void;
  uploading: boolean;
}

const BulkUploadZone: React.FC<BulkUploadZoneProps> = ({
  onFilesSelected,
  queuedFiles,
  onRemoveFile,
  uploading
}) => {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    if (files.length > 0) {
      onFilesSelected(files);
    }
  }, [onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      onFilesSelected(files);
    }
    e.target.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-yellow-400/50 transition-colors"
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={uploading}
        />
        <label htmlFor="file-upload" className="cursor-pointer block">
          <Upload className="w-12 h-12 text-white/40 mx-auto mb-4" />
          <p className="text-white text-lg mb-2">
            Drag and drop images here, or click to browse
          </p>
          <p className="text-white/60 text-sm">
            Supports multiple files and entire folders
          </p>
        </label>
      </div>

      {/* Queued Files */}
      {queuedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-semibold">
              Upload Queue ({queuedFiles.length} files)
            </h4>
            <p className="text-white/60 text-sm">
              Total: {formatFileSize(queuedFiles.reduce((sum, f) => sum + f.size, 0))}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-2">
            {queuedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="relative group bg-white/5 rounded-lg overflow-hidden"
              >
                <div className="aspect-square bg-white/10 flex items-center justify-center">
                  <FileImage className="w-8 h-8 text-white/40" />
                </div>
                <div className="p-2">
                  <p className="text-white text-xs truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-white/50 text-xs">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                {!uploading && (
                  <button
                    onClick={() => onRemoveFile(index)}
                    className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkUploadZone;
