"use client";

import { useState, useCallback } from "react";
import { Images, Upload, Link2, Check } from "lucide-react";
import { DialogWrapper } from "@classytic/clarity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MediaLibraryPicker } from "./MediaLibraryPicker";
import { MediaUploader } from "./MediaUploader";
import { useMediaUpload, type Media, type MediaFolder } from "@classytic/commerce-sdk/content";

export interface MediaPickerValue {
  url: string;
  variants?: {
    thumbnail?: string;
    medium?: string;
  };
  alt?: string;
  mediaId?: string;
}

interface MediaPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: MediaPickerValue | MediaPickerValue[]) => void;
  token: string;
  multiple?: boolean;
  folder?: MediaFolder;
  title?: string;
}

export function MediaPickerDialog({
  open,
  onOpenChange,
  onSelect,
  token,
  multiple = false,
  folder = "products",
  title = "Select Media",
}: MediaPickerDialogProps) {
  const [activeTab, setActiveTab] = useState<"library" | "upload">("library");
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [urlInput, setUrlInput] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  // Upload mutation (SDK hook requires token)
  const uploadMutation = useMediaUpload(token);

  // Handle file upload
  const handleUpload = useCallback(
    async (files: File[], targetFolder: string) => {
      await uploadMutation.uploadAsync({
        files,
        folder: (targetFolder === "all" ? "general" : targetFolder) as MediaFolder,
      });
    },
    [uploadMutation]
  );

  // Convert Media to MediaPickerValue
  const mediaToValue = useCallback((media: Media): MediaPickerValue => {
    const thumbnailVariant = media.variants?.find((v) => v.name === "thumbnail");
    const mediumVariant = media.variants?.find((v) => v.name === "medium");

    return {
      url: media.url,
      variants: {
        thumbnail: thumbnailVariant?.url || "",
        medium: mediumVariant?.url || "",
      },
      alt: media.alt || media.filename,
      mediaId: media._id,
    };
  }, []);

  // Handle selection change from library (called on each click)
  const handleSelectionChange = useCallback((items: Media[]) => {
    setSelectedMedia(items);
  }, []);

  // Handle confirm selection
  const handleConfirm = useCallback(() => {
    if (selectedMedia.length === 0) return;

    const values = selectedMedia.map(mediaToValue);
    onSelect(multiple ? values : values[0]);
    onOpenChange(false);
    setSelectedMedia([]);
  }, [selectedMedia, multiple, mediaToValue, onSelect, onOpenChange]);

  // Handle URL submission
  const handleUrlSubmit = useCallback(() => {
    if (!urlInput.trim()) return;

    const value: MediaPickerValue = {
      url: urlInput.trim(),
      variants: {
        thumbnail: "",
        medium: "",
      },
      alt: "",
    };

    onSelect(multiple ? [value] : value);
    onOpenChange(false);
    setUrlInput("");
  }, [urlInput, multiple, onSelect, onOpenChange]);

  // Handle upload complete - refresh library and switch to it
  const handleUploadComplete = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setActiveTab("library");
  }, []);

  // Reset state when dialog closes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setSelectedMedia([]);
        setUrlInput("");
        setActiveTab("library");
      }
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  // Footer for library tab
  const libraryFooter = (
    <div className="flex items-center justify-between w-full">
      <span className="text-sm text-muted-foreground">
        {selectedMedia.length === 0
          ? "Select media to continue"
          : `${selectedMedia.length} item${selectedMedia.length > 1 ? "s" : ""} selected`}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} disabled={selectedMedia.length === 0}>
          <Check className="h-4 w-4 mr-2" />
          Select
        </Button>
      </div>
    </div>
  );

  return (
    <DialogWrapper
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description=""
      footer={null}
      trigger={null}
      size="xl"
      className=""
      headerClassName="px-6 pt-6 pb-0"
      contentClassName="h-[80vh] flex flex-col p-0"
      footerClassName=""
    >
      <Tabs
        value={activeTab}
        onValueChange={(v: string) => setActiveTab(v as "library" | "upload")}
        className="flex-1 flex flex-col min-h-0"
      >
        <div className="px-6 pb-0 border-b">
          <TabsList className="h-10 p-0 bg-transparent">
            <TabsTrigger
              value="library"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
            >
              <Images className="h-4 w-4 mr-2" />
              Media Library
            </TabsTrigger>
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload / URL
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Media Library Tab */}
        <TabsContent value="library" className="flex-1 min-h-0 m-0 p-0">
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 overflow-hidden">
              <MediaLibraryPicker
                key={refreshKey}
                token={token}
                onSelectionChange={handleSelectionChange}
                multiSelect={multiple}
                initialFolder={folder}
              />
            </div>

            {/* Selection Footer */}
            <div className="border-t px-6 py-3 bg-muted/30">
              {libraryFooter}
            </div>
          </div>
        </TabsContent>

        {/* Upload / URL Tab */}
        <TabsContent value="upload" className="flex-1 min-h-0 m-0 p-6 overflow-auto">
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Upload Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload New Media
              </h3>
              <MediaUploader
                folder={folder}
                onUpload={handleUpload}
                onUploadComplete={handleUploadComplete}
              />
              <p className="text-xs text-muted-foreground">
                After upload, your media will appear in the library tab.
              </p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            {/* URL Input Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Enter Image URL
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleUrlSubmit();
                    }
                  }}
                />
                <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()}>
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a direct link to an image. Variants won't be auto-generated for external URLs.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </DialogWrapper>
  );
}
