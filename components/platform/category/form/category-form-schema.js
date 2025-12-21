import { Info, FolderTree, Image as ImageIcon, Search, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { field, section } from "@/components/form/form-system";
import { format } from "date-fns";

/**
 * Create category form schema
 * @param {Object} options - Schema options
 * @param {boolean} options.isEdit - Whether this is an edit form
 * @param {Object} options.category - Existing category (for edit mode)
 * @param {Array} options.parentOptions - Parent category options for select
 * @returns {Object} Form schema
 */
export const createCategoryFormSchema = ({
  isEdit = false,
  category = null,
  parentOptions = [],
}) => {
  return {
    sections: [
      // Alert for edit mode
      ...(isEdit ? [
        {
          id: "alert",
          render: () => (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Slug is auto-generated from name and cannot be changed after creation.
                Product count is maintained automatically. Select "None (Root Category)" to make this a root category.
              </AlertDescription>
            </Alert>
          ),
        },
      ] : []),

      // Basic Information Section
      section(
        "basic",
        "Basic Information",
        [
          field.text("name", "Category Name", {
            placeholder: "T-Shirts",
            required: true,
            description: "Display name for the category",
          }),
          field.select("parent", "Parent Category", [
            { value: "", label: "None (Root Category)" },
            ...parentOptions,
          ], {
            placeholder: "Select parent category",
            description: "Leave empty for root category",
          }),
        ],
        { cols: 2, icon: <FolderTree className="h-4 w-4" /> }
      ),

      // Description Section
      section(
        "description",
        null,
        [
          field.textarea("description", "Description", {
            placeholder: "A brief description of this category...",
            description: "Short description for category listing",
            rows: 3,
            fullWidth: true,
          }),
        ],
        { cols: 1 }
      ),

      // Image Section
      section(
        "image",
        "Category Image",
        [
          field.text("image.url", "Image URL", {
            placeholder: "https://cdn.example.com/categories/image.jpg",
            description: "URL for category display image",
          }),
          field.text("image.alt", "Alt Text", {
            placeholder: "Category image description",
            description: "Accessibility text for the image",
          }),
        ],
        { cols: 2, icon: <ImageIcon className="h-4 w-4" /> }
      ),

      // Settings Section
      section(
        "settings",
        "Settings",
        [
          field.number("displayOrder", "Display Order", {
            placeholder: "0",
            min: 0,
            description: "Lower numbers appear first",
          }),
          field.number("vatRate", "VAT Rate (%)", {
            placeholder: "Leave empty for default",
            min: 0,
            max: 100,
            step: 0.01,
            description: "Override platform VAT rate",
          }),
          field.switch("isActive", "Active", {
            description: "Category is visible to customers",
          }),
        ],
        { cols: 3 }
      ),

      // SEO Section
      section(
        "seo",
        "SEO Settings",
        [
          field.text("seo.title", "SEO Title", {
            placeholder: "Page title for search engines",
            description: "Recommended: 50-60 characters",
          }),
          field.textarea("seo.description", "SEO Description", {
            placeholder: "Meta description for search engines",
            description: "Recommended: 150-160 characters",
            rows: 2,
            fullWidth: true,
          }),
        ],
        {
          cols: 1,
          icon: <Search className="h-4 w-4" />,
          collapsible: true,
          defaultOpen: !!(category?.seo?.title || category?.seo?.description),
        }
      ),

      // Read-only System Information (only when editing)
      ...(isEdit && category ? [
        {
          id: "systemInfo",
          title: "System Information",
          render: () => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category ID */}
                {category._id && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Category ID</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {category._id}
                    </div>
                  </div>
                )}

                {/* Slug */}
                {category.slug && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Slug (URL)</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {category.slug}
                    </div>
                  </div>
                )}

                {/* Product Count */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Product Count</label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {category.productCount || 0} products
                  </div>
                </div>
              </div>

              {/* Full Path (if available) */}
              {category.fullPath && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Full Path</label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {category.fullPath}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {category.createdAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created At
                    </label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {format(new Date(category.createdAt), 'PPp')}
                    </div>
                  </div>
                )}
                {category.updatedAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated At
                    </label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {format(new Date(category.updatedAt), 'PPp')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ),
        },
      ] : []),
    ],
  };
};
