import { Info, Ruler, FileText, Calendar } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { field, section } from "@/components/form/form-system";
import { format } from "date-fns";

/**
 * Create size guide form schema
 * @param {Object} options - Schema options
 * @param {boolean} options.isEdit - Whether this is an edit form
 * @param {Object} options.sizeGuide - Existing size guide (for edit mode)
 * @returns {Object} Form schema
 */
export const createSizeGuideFormSchema = ({
  isEdit = false,
  sizeGuide = null,
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
                Sizes and measurements can be updated anytime.
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
          field.text("name", "Size Guide Name", {
            placeholder: "T-Shirts & Tops",
            required: true,
            description: "Display name for the size guide",
          }),
          field.select("measurementUnit", "Measurement Unit", [
            { value: "inches", label: "Inches" },
            { value: "cm", label: "Centimeters" },
          ], {
            description: "Unit used for measurements",
          }),
        ],
        { cols: 2, icon: <Ruler className="h-4 w-4" /> }
      ),

      // Description Section
      section(
        "description",
        null,
        [
          field.textarea("description", "Description", {
            placeholder: "A brief description of this size guide...",
            description: "Short description for the size guide (max 500 chars)",
            rows: 3,
            fullWidth: true,
          }),
        ],
        { cols: 1 }
      ),

      // Measurement Labels Section
      section(
        "measurements",
        "Measurement Labels",
        [
          field.tags("measurementLabels", "Measurement Labels", {
            placeholder: "Add labels like Chest, Length, Shoulder...",
            description: "Labels will be used as table column headers (max 10)",
            fullWidth: true,
          }),
        ],
        { cols: 1, icon: <Ruler className="h-4 w-4" /> }
      ),

      // Note Section
      section(
        "note",
        "Additional Information",
        [
          field.textarea("note", "Note for Customers", {
            placeholder: "All measurements are in inches. For the best fit, measure a similar garment that fits you well.",
            description: "Additional notes displayed to customers (max 1000 chars)",
            rows: 3,
            fullWidth: true,
          }),
        ],
        { cols: 1, icon: <FileText className="h-4 w-4" /> }
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
          field.switch("isActive", "Active", {
            description: "Size guide is available for products",
          }),
        ],
        { cols: 2 }
      ),

      // Read-only System Information (only when editing)
      ...(isEdit && sizeGuide ? [
        {
          id: "systemInfo",
          title: "System Information",
          render: () => (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Size Guide ID */}
                {sizeGuide._id && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Size Guide ID</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {sizeGuide._id}
                    </div>
                  </div>
                )}

                {/* Slug */}
                {sizeGuide.slug && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Slug (URL)</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {sizeGuide.slug}
                    </div>
                  </div>
                )}

                {/* Size Count */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Number of Sizes</label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                    {sizeGuide.sizes?.length || 0} sizes defined
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {sizeGuide.createdAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created At
                    </label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {format(new Date(sizeGuide.createdAt), 'PPp')}
                    </div>
                  </div>
                )}
                {sizeGuide.updatedAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Updated At
                    </label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {format(new Date(sizeGuide.updatedAt), 'PPp')}
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
