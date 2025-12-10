"use client";
import { useState, useCallback } from 'react';
import type { UploadingFile } from '../types';
import { filterImageFiles } from '../utils';

interface UseMediaUploadOptions {
  folder: string;
  onUpload: (files: File[], folder: string) => Promise<void>;
  onComplete?: () => void;
}

export function useMediaUpload({ folder, onUpload, onComplete }: UseMediaUploadOptions) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Use folder directly (no subfolders in simplified API)
  const targetFolder = folder === 'all' ? 'general' : folder;

  const handleFiles = useCallback(async (files: FileList | File[]) => {
    const imageFiles = filterImageFiles(files);
    if (imageFiles.length === 0) return;

    const newUploads: UploadingFile[] = imageFiles.map(file => ({
      id: `${Date.now()}-${file.name}`,
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadingFiles(prev => [...prev, ...newUploads]);

    for (const upload of newUploads) {
      const progressInterval = setInterval(() => {
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === upload.id && f.status === 'uploading'
              ? { ...f, progress: Math.min(f.progress + 15, 90) }
              : f
          )
        );
      }, 100);

      try {
        await onUpload([upload.file], targetFolder);
        clearInterval(progressInterval);
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === upload.id ? { ...f, progress: 100, status: 'success' } : f
          )
        );
      } catch (error) {
        clearInterval(progressInterval);
        setUploadingFiles(prev =>
          prev.map(f =>
            f.id === upload.id ? { ...f, status: 'error', error: 'Upload failed' } : f
          )
        );
      }
    }

    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(f => f.status === 'uploading'));
      onComplete?.();
    }, 2000);
  }, [targetFolder, onUpload, onComplete]);

  const removeUpload = useCallback((id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
  }, [handleFiles]);

  return {
    uploadingFiles,
    targetFolder,
    isDragging,
    handleFiles,
    removeUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleInputChange,
  };
}
