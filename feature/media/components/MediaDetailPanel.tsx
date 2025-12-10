"use client";
import { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { copyToClipboard } from '@/lib/utils';
import { formatFileSize, formatMediaDate } from '../utils';
import type { MediaItem, MediaUpdateData } from '../types';

interface MediaDetailPanelProps {
  item: MediaItem | null;
  onClose: () => void;
  onUpdate: (id: string, data: MediaUpdateData) => Promise<void>;
  onDelete: (ids: string[]) => void;
}

export function MediaDetailPanel({ item, onClose, onUpdate, onDelete }: MediaDetailPanelProps) {
  const [formData, setFormData] = useState<MediaUpdateData>({});
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedVariant, setCopiedVariant] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || '',
        alt: item.alt || '',
      });
      setHasChanges(false);
    }
  }, [item]);

  const handleChange = (field: keyof MediaUpdateData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!item || !hasChanges) return;
    
    setSaving(true);
    try {
      await onUpdate(item._id, formData);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to update media:', error);
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = async (url?: string, variantName?: string) => {
    if (!item) return;
    const urlToCopy = url || item.url;
    const success = await copyToClipboard(urlToCopy, { showToast: false });
    if (success) {
      if (variantName) {
        setCopiedVariant(variantName);
        setTimeout(() => setCopiedVariant(null), 2000);
      } else {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!item) return null;

  return (
    <div className="w-80 border-l border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between py-2 px-3 border-b border-border">
        <h3 className="font-semibold text-sm">Media Details</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Preview */}
        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
          <img
            src={item.url}
            alt={item.alt || item.filename}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Original URL */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Original Image</Label>
          <div className="flex gap-2">
            <Input
              value={item.url}
              readOnly
              className="text-xs font-mono"
            />
            <Button variant="outline" size="icon" onClick={() => copyUrl(item.url)}>
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>

        {/* Variants */}
        {item.variants && item.variants.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Variants ({item.variants.length})
            </Label>
            <div className="space-y-1.5">
              {item.variants.map((variant, idx) => (
                <div key={`${variant.name}-${idx}`} className="flex items-center gap-2">
                  <div className="flex-1 min-w-0 bg-muted/50 rounded px-2 py-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium capitalize">
                        {variant.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {variant.width} × {variant.height}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate font-mono">
                      {variant.url.split('/').pop()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => copyUrl(variant.url, variant.name)}
                  >
                    {copiedVariant === variant.name ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    asChild
                  >
                    <a href={variant.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground text-xs">Filename</span>
            <p className="font-medium truncate">{item.filename}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Size</span>
            <p className="font-medium">{formatFileSize(item.size)}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Dimensions</span>
            <p className="font-medium">
              {item.dimensions?.width} × {item.dimensions?.height}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Folder</span>
            <p className="font-medium capitalize">{item.folder}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Uploaded</span>
            <p className="font-medium">{formatMediaDate(item.createdAt)}</p>
          </div>
          <div>
            <span className="text-muted-foreground text-xs">Modified</span>
            <p className="font-medium">{formatMediaDate(item.updatedAt)}</p>
          </div>
        </div>

        {/* Editable Fields */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={e => handleChange('title', e.target.value)}
              placeholder="Enter a title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="alt">Alt Text</Label>
            <Textarea
              id="alt"
              value={formData.alt || ''}
              onChange={e => handleChange('alt', e.target.value)}
              placeholder="Describe the image for accessibility..."
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-2">
        <Button
          className="w-full"
          disabled={!hasChanges || saving}
          onClick={handleSave}
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full text-destructive hover:text-destructive"
          onClick={() => onDelete([item._id])}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Media
        </Button>
      </div>
    </div>
  );
}
