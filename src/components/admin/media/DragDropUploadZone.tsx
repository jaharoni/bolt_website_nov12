import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadFile {
  file: File;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

interface DragDropUploadZoneProps {
  onUpload: (files: File[]) => Promise<void>;
  accept?: string;
  maxSize?: number;
  className?: string;
}

export default function DragDropUploadZone({
  onUpload,
  accept = 'image/*,video/*',
  maxSize = 50 * 1024 * 1024, // 50MB default
  className = '',
}: DragDropUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFiles = (files: File[]): File[] => {
    return files.filter(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds max size of ${maxSize} bytes`);
        return false;
      }
      return true;
    });
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const droppedFiles = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(droppedFiles);

    if (validFiles.length > 0) {
      await processUpload(validFiles);
    }
  }, [maxSize]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const validFiles = validateFiles(selectedFiles);

    if (validFiles.length > 0) {
      await processUpload(validFiles);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [maxSize]);

  const processUpload = async (files: File[]) => {
    setIsUploading(true);

    // Add files to queue
    const newQueue: UploadFile[] = files.map(file => ({
      file,
      status: 'pending',
      progress: 0,
    }));
    setUploadQueue(newQueue);

    try {
      // Simulate progress (in real implementation, track actual upload progress)
      for (let i = 0; i < newQueue.length; i++) {
        setUploadQueue(prev => prev.map((item, idx) =>
          idx === i ? { ...item, status: 'uploading', progress: 50 } : item
        ));
      }

      // Upload files
      await onUpload(files);

      // Mark all as success
      setUploadQueue(prev => prev.map(item => ({
        ...item,
        status: 'success',
        progress: 100,
      })));

      // Clear queue after 2 seconds
      setTimeout(() => {
        setUploadQueue([]);
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadQueue(prev => prev.map(item => ({
        ...item,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
      })));
    } finally {
      setIsUploading(false);
    }
  };

  const removeFromQueue = (index: number) => {
    setUploadQueue(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 transition-all ${
          isDragging
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-white/20 hover:border-white/40 bg-white/5'
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center">
          <div className={`mb-4 ${isDragging ? 'scale-110' : ''} transition-transform`}>
            <Upload className={`w-12 h-12 ${isDragging ? 'text-blue-400' : 'text-white/40'}`} />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {isDragging ? 'Drop files here' : 'Drag & drop files'}
          </h3>
          <p className="text-sm text-white/60 mb-4">
            or click to browse your computer
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg text-white font-medium transition-colors"
          >
            Choose Files
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
          />
          <p className="text-xs text-white/40 mt-4">
            Max file size: {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="bg-black/20 border border-white/10 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">
              Uploading {uploadQueue.length} file{uploadQueue.length !== 1 ? 's' : ''}
            </h4>
          </div>

          <div className="space-y-2 max-h-64 overflow-auto">
            {uploadQueue.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 bg-white/5 rounded border border-white/10"
              >
                {/* Status Icon */}
                <div className="flex-shrink-0">
                  {item.status === 'pending' && (
                    <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                  )}
                  {item.status === 'uploading' && (
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  )}
                  {item.status === 'success' && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                  {item.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-400" />
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{item.file.name}</div>
                  <div className="text-xs text-white/50">
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                  {item.status === 'error' && item.error && (
                    <div className="text-xs text-red-400 mt-1">{item.error}</div>
                  )}
                </div>

                {/* Progress or Actions */}
                <div className="flex-shrink-0">
                  {item.status === 'uploading' && (
                    <div className="text-xs text-white/60">{item.progress}%</div>
                  )}
                  {(item.status === 'error' || item.status === 'success') && (
                    <button
                      onClick={() => removeFromQueue(index)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <X className="w-4 h-4 text-white/60" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
