import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMediaUpload } from '../hooks/useMediaUpload';

interface MediaUploaderProps {
  folder: string;
  onUpload: (files: File[], folder: string) => Promise<void>;
  onUploadComplete: () => void;
  compact?: boolean;
}

export function MediaUploader({ folder, onUpload, onUploadComplete, compact = false }: MediaUploaderProps) {
  const {
    uploadingFiles,
    targetFolder,
    isDragging,
    removeUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleInputChange,
  } = useMediaUpload({
    folder,
    onUpload,
    onComplete: onUploadComplete,
  });

  if (compact) {
    return (
      <div className="relative">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Button variant="outline" size="sm" className="pointer-events-none">
          <Upload className="h-4 w-4 mr-2" />
          Upload
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-4 transition-all duration-200",
          "flex items-center gap-3",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        )}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0",
          isDragging ? "bg-primary/10" : "bg-muted"
        )}>
          <Upload className={cn(
            "h-5 w-5 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground"
          )} />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">
            {isDragging ? 'Drop files here' : 'Drag & drop images or click to browse'}
          </p>
          <p className="text-xs text-muted-foreground">
            Uploading to: <span className="font-mono capitalize">{targetFolder}</span> • JPG, PNG, WebP, GIF, SVG
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-1.5">
          {uploadingFiles.map(upload => (
            <div
              key={upload.id}
              className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium truncate">
                    {upload.file.name}
                  </span>
                  {upload.status === 'success' && (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  )}
                  {upload.status === 'error' && (
                    <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                  )}
                  {upload.status === 'uploading' && (
                    <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                  )}
                </div>
                <Progress value={upload.progress} className="h-1" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => removeUpload(upload.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
