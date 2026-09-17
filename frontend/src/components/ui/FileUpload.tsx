import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  preview?: string | null;
  label?: string;
  error?: string;
}

export default function FileUpload({
  onFileSelect,
  accept,
  preview,
  label,
  error,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        onFileSelect(e.dataTransfer.files[0]);
        e.dataTransfer.clearData();
      }
    },
    [onFileSelect]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        onFileSelect(e.target.files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div className="w-full">
      {label && (
        <label className="block mb-1.5 text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors cursor-pointer overflow-hidden',
          isDragging
            ? 'border-herb-green-500 bg-herb-green-50 ring-2 ring-herb-green-500'
            : 'border-gray-300 hover:border-herb-green-500 hover:bg-herb-green-50/50',
          error && !isDragging && 'border-red-300 hover:border-red-400 bg-red-50/50'
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {preview ? (
          <div className="relative w-full h-40">
            <img
              src={preview}
              alt="Preview"
              className="object-contain w-full h-full rounded"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <UploadCloud className={cn("w-10 h-10 mb-3", error ? "text-red-400" : "text-gray-400")} />
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-semibold text-herb-green-600">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              {accept ? `Supported files: ${accept}` : 'Any file type supported'}
            </p>
          </div>
        )}
      </div>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
