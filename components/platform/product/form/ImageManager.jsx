"use client";
import { useState } from "react";
import { useFieldArray, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ImageIcon, X, GripVertical, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { MediaPickerDialog } from "@/feature/media/components/MediaPickerDialog";

/**
 * ImageManager Component
 * Manages an array of images for a product
 */
export function ImageManager({ control, disabled = false, token }) {
  const { fields, append, remove, update, move } = useFieldArray({
    control,
    name: "images",
  });

  const [editingIndex, setEditingIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const defaultImage = {
    url: "",
    variants: {
      thumbnail: "",
      medium: "",
    },
    order: fields.length,
    isFeatured: fields.length === 0, // First image is featured by default
    alt: "",
  };

  // Open media picker instead of adding empty image
  const handleAddImage = () => {
    setMediaPickerOpen(true);
  };

  // Handle media selection from picker
  const handleMediaSelect = (selected) => {
    // Handle both single and array selections
    const mediaItems = Array.isArray(selected) ? selected : [selected];

    mediaItems.forEach((media, index) => {
      const newImage = {
        url: media.url,
        variants: {
          thumbnail: media.variants?.thumbnail || "",
          medium: media.variants?.medium || "",
        },
        order: fields.length + index,
        isFeatured: fields.length === 0 && index === 0, // First image is featured if no images exist
        alt: media.alt || "",
      };
      append(newImage);
    });

    setMediaPickerOpen(false);
  };

  // Add image manually (for URL input in edit mode)
  const handleAddManualImage = () => {
    append(defaultImage);
    setEditingIndex(fields.length);
  };

  const handleRemoveImage = (index) => {
    const wasFeaured = fields[index]?.isFeatured;

    // If removing featured image and there are other images, set next one as featured first
    if (wasFeaured && fields.length > 1) {
      const newFeaturedIndex = index === 0 ? 1 : 0;
      update(newFeaturedIndex, { ...fields[newFeaturedIndex], isFeatured: true });
    }

    remove(index);

    if (editingIndex === index) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > index) {
      // Adjust editing index if it's after the removed item
      setEditingIndex(editingIndex - 1);
    }
  };

  const handleSetFeatured = (index) => {
    // Remove featured flag from all images
    fields.forEach((img, i) => {
      if (i !== index && img?.isFeatured) {
        update(i, { ...img, isFeatured: false });
      }
    });
    // Set the selected image as featured
    if (fields[index]) {
      update(index, { ...fields[index], isFeatured: true });
    }
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      move(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    // Update order values after reordering
    fields.forEach((img, i) => {
      update(i, { ...img, order: i });
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Product Images
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddImage}
          disabled={disabled}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Image
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-8 border-2 border-dashed rounded-lg">
          No images added yet. Click "Add Image" to upload product images.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map((field, index) => (
          <Card
            key={field.id}
            className={cn(
              "relative transition-all",
              editingIndex === index && "border-primary ring-1 ring-primary",
              draggedIndex === index && "opacity-50",
              field.isFeatured && "ring-2 ring-yellow-500"
            )}
            draggable={!disabled && editingIndex !== index}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            {/* Featured Badge */}
            {field.isFeatured && (
              <div className="absolute -top-2 -right-2 z-10">
                <span className="flex items-center gap-1 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full shadow">
                  <Star className="h-3 w-3 fill-current" />
                  Featured
                </span>
              </div>
            )}

            <CardHeader className="pb-2 pt-3 px-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {!disabled && editingIndex !== index && (
                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  )}
                  <CardTitle className="text-xs text-muted-foreground">
                    Image {index + 1}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  {editingIndex === index ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditingIndex(null)}
                      disabled={disabled}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setEditingIndex(index)}
                      disabled={disabled}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRemoveImage(index)}
                    disabled={disabled}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="px-3 pb-3">
              {editingIndex === index ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor={`images.${index}.url`} className="text-xs">
                      Image URL *
                    </Label>
                    <Controller
                      name={`images.${index}.url`}
                      control={control}
                      render={({ field: inputField }) => (
                        <Input
                          {...inputField}
                          id={`images.${index}.url`}
                          placeholder="https://cdn.example.com/image.webp"
                          disabled={disabled}
                          className="text-sm"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`images.${index}.variants.thumbnail`} className="text-xs">
                      Thumbnail URL
                    </Label>
                    <Controller
                      name={`images.${index}.variants.thumbnail`}
                      control={control}
                      render={({ field: inputField }) => (
                        <Input
                          {...inputField}
                          id={`images.${index}.variants.thumbnail`}
                          placeholder="https://cdn.example.com/image-thumb.webp"
                          disabled={disabled}
                          className="text-sm"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`images.${index}.variants.medium`} className="text-xs">
                      Medium URL
                    </Label>
                    <Controller
                      name={`images.${index}.variants.medium`}
                      control={control}
                      render={({ field: inputField }) => (
                        <Input
                          {...inputField}
                          id={`images.${index}.variants.medium`}
                          placeholder="https://cdn.example.com/image-medium.webp"
                          disabled={disabled}
                          className="text-sm"
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`images.${index}.alt`} className="text-xs">
                      Alt Text
                    </Label>
                    <Controller
                      name={`images.${index}.alt`}
                      control={control}
                      render={({ field: inputField }) => (
                        <Input
                          {...inputField}
                          id={`images.${index}.alt`}
                          placeholder="Product front view"
                          disabled={disabled}
                          className="text-sm"
                        />
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Controller
                      name={`images.${index}.isFeatured`}
                      control={control}
                      render={({ field: checkboxField }) => (
                        <Checkbox
                          id={`images.${index}.isFeatured`}
                          checked={checkboxField.value}
                          onCheckedChange={(checked) => {
                            checkboxField.onChange(checked);
                            if (checked) handleSetFeatured(index);
                          }}
                          disabled={disabled}
                        />
                      )}
                    />
                    <Label
                      htmlFor={`images.${index}.isFeatured`}
                      className="text-xs font-normal cursor-pointer"
                    >
                      Set as featured image
                    </Label>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {field.url ? (
                    <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
                      <Image
                        src={field.url}
                        alt={field.alt || `Product image ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-muted rounded-md flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  {field.alt && (
                    <p className="text-xs text-muted-foreground truncate">
                      {field.alt}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {fields.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Drag and drop to reorder images. The featured image will be shown as the main product image.
        </p>
      )}

      {/* Media Picker Dialog */}
      {token && (
        <MediaPickerDialog
          open={mediaPickerOpen}
          onOpenChange={setMediaPickerOpen}
          onSelect={handleMediaSelect}
          token={token}
          multiple={true}
          folder="products"
          title="Add Product Images"
        />
      )}
    </div>
  );
}
