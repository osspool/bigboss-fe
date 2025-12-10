import { CATEGORIES, PRODUCT_STYLES } from "@/data/constants";
import { Info, Package, DollarSign, Tags, ImageIcon, Settings, FileText, BarChart3, Layers } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { field, section } from "@/components/form/form-system";
import { format } from "date-fns";
import { ImageManager } from "./ImageManager";
import { LiteEditorField } from "@/components/form/lite-editor/lite-editor-field";
import { VariationField } from "./VariationField";

// Build category options from constants
const PARENT_CATEGORY_OPTIONS = Object.entries(CATEGORIES).map(([key, cat]) => ({
  value: cat.slug,
  label: cat.label,
}));

// Build subcategory options (flattened from all parent categories)
const ALL_CATEGORY_OPTIONS = Object.values(CATEGORIES).flatMap((cat) =>
  cat.subcategories.map((sub) => ({
    value: sub.slug,
    label: `${cat.label} → ${sub.label}`,
  }))
);

const DISCOUNT_TYPE_OPTIONS = [
  // Allow clearing discount selection
  { value: "", label: "No Discount" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount (৳)" },
];

/**
 * Create product form schema organized by tabs
 * @param {Object} options - Schema options
 * @param {boolean} options.isEdit - Whether this is an edit form
 * @param {Object} options.product - Existing product (for edit mode)
 * @returns {Object} Form schema with tabs structure
 */
export const createProductFormSchema = ({
  isEdit = false,
  product = null,
}) => {
  return {
    // Define tabs for the form
    tabs: [
      {
        id: "basic",
        label: "Basic Info",
        icon: <Package className="h-4 w-4" />,
      },
      {
        id: "media",
        label: "Media",
        icon: <ImageIcon className="h-4 w-4" />,
      },
      {
        id: "pricing",
        label: "Pricing",
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        id: "variations",
        label: "Variations",
        icon: <Layers className="h-4 w-4" />,
      },
      ...(isEdit && product ? [{
        id: "stats",
        label: "Stats",
        icon: <BarChart3 className="h-4 w-4" />,
      }] : []),
    ],

    // Sections organized by tab
    sections: {
      // === BASIC INFO TAB ===
      basic: [
        // Alert for edit mode
        ...(isEdit ? [
          {
            id: "alert",
            render: () => (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  System-managed fields (Slug, Stats, Ratings) are read-only.
                </AlertDescription>
              </Alert>
            ),
          },
        ] : []),

        // Product Name
        section(
          "name-section",
          null,
          [
            field.text("name", "Product Name", {
              placeholder: "Premium Wireless Headphones",
              required: true,
              fullWidth: true,
            }),
          ],
          { cols: 1 }
        ),

        // Short Description
        section(
          "short-description-section",
          null,
          [
            field.textarea("shortDescription", "Short Description", {
              placeholder: "A brief summary of the product (max 200 characters)...",
              description: "A concise description shown in product listings and previews",
              fullWidth: true,
              rows: 2,
              maxLength: 200,
            }),
          ],
          { cols: 1 }
        ),

        // Description with Rich Text Editor
        {
          id: "description-section",
          render: ({ control, disabled }) => (
            <LiteEditorField
              name="description"
              control={control}
              label="Description"
              description="Use markdown for formatting. Supports headings, lists, links, and more."
              placeholder="Write a compelling product description..."
              minHeight={180}
              disabled={disabled}
            />
          ),
        },

        // Categories
        section(
          "category-section",
          "Categories",
          [
            field.select("parentCategory", "Parent Category", PARENT_CATEGORY_OPTIONS, {
              placeholder: "Select parent category",
            }),
            field.combobox("category", "Category", ALL_CATEGORY_OPTIONS, {
              placeholder: "Select category",
              required: true,
              searchPlaceholder: "Search categories...",
            }),
          ],
          { cols: 2, icon: <Tags className="h-4 w-4" /> }
        ),

        // Tags
        section(
          "tags-section",
          null,
          [
            field.tags("tags", "Product Tags", {
              placeholder: "Add tags (press Enter)...",
              description: "Add keywords to help customers find this product",
              fullWidth: true,
            }),
          ],
          { cols: 1 }
        ),

        // Style
        section(
          "style-section",
          null,
          [
            field.tagChoice("style", "Product Style", PRODUCT_STYLES, {
              placeholder: "Select style(s)",
              description: "Select one or more styles that best describe this product",
              fullWidth: true,
            }),
          ],
          { cols: 1 }
        ),
      ],

      // === MEDIA TAB ===
      media: [
        {
          id: "images-section",
          render: ({ control, disabled }) => (
            <ImageManager control={control} disabled={disabled} />
          ),
        },
      ],

      // === PRICING TAB ===
      pricing: [
        // Pricing & Inventory
        section(
          "pricing-section",
          "Pricing & Inventory",
          [
            field.number("basePrice", "Base Price (৳)", {
              placeholder: "299.99",
              required: true,
              min: 0,
              step: 0.01,
            }),
            field.number("quantity", "Stock Quantity", {
              placeholder: "50",
              required: true,
              min: 0,
            }),
            field.switch("isActive", "Active", {
              description: "Product is visible and available for purchase",
            }),
          ],
          { cols: 3, icon: <DollarSign className="h-4 w-4" /> }
        ),

        // Discount Section
        section(
          "discount-section",
          "Discount Settings",
          [
            field.select("discount.type", "Discount Type", DISCOUNT_TYPE_OPTIONS, {
              placeholder: "Select discount type",
            }),
            field.number("discount.value", "Discount Value", {
              placeholder: "15",
              min: 0,
              description: "Percentage or fixed amount",
            }),
            field.date("discount.startDate", "Start Date", {
              placeholder: "Select start date",
            }),
            field.date("discount.endDate", "End Date", {
              placeholder: "Select end date",
            }),
            field.text("discount.description", "Discount Label", {
              placeholder: "Holiday Sale",
              fullWidth: true,
            }),
          ],
          {
            cols: 2,
            collapsible: true,
            defaultOpen: !!(product?.discount?.type),
            icon: <Settings className="h-4 w-4" />,
            description: "Optional promotional pricing",
          }
        ),
      ],

      // === VARIATIONS TAB ===
      variations: [
        {
          id: "variations-section",
          render: ({ control, disabled }) => (
            <VariationField control={control} disabled={disabled} />
          ),
        },
      ],

      // === STATS TAB (Edit mode only) ===
      stats: isEdit && product ? [
        {
          id: "system-info",
          render: () => (
            <div className="space-y-6">
              {/* IDs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product._id && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Product ID</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {product._id}
                    </div>
                  </div>
                )}
                {product.slug && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Slug (URL)</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {product.slug}
                    </div>
                  </div>
                )}
              </div>

              {/* Statistics Cards */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Product Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Sales"
                    value={product.stats?.totalSales || product.totalSales || 0}
                  />
                  <StatCard
                    label="Quantity Sold"
                    value={product.stats?.totalQuantitySold || 0}
                  />
                  <StatCard
                    label="Average Rating"
                    value={`${product.averageRating?.toFixed(1) || "N/A"} ⭐`}
                    subtext={`${product.numReviews || 0} reviews`}
                  />
                  <StatCard
                    label="View Count"
                    value={product.stats?.viewCount || 0}
                  />
                </div>
              </div>

              {/* Active Discount Display */}
              {product.currentPrice !== undefined && product.currentPrice !== product.basePrice && (
                <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Active Discount</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-green-600">
                      ৳{product.currentPrice?.toFixed(2)}
                    </span>
                    <span className="text-lg line-through text-muted-foreground">
                      ৳{product.basePrice?.toFixed(2)}
                    </span>
                    {product.discount?.description && (
                      <span className="text-sm bg-green-100 dark:bg-green-800 px-2 py-0.5 rounded">
                        {product.discount.description}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {product.createdAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Created At</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {format(new Date(product.createdAt), 'PPp')}
                    </div>
                  </div>
                )}
                {product.updatedAt && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm">
                      {format(new Date(product.updatedAt), 'PPp')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ),
        },
      ] : [],
    },
  };
};

// Stat card component for the stats tab
function StatCard({ label, value, subtext }) {
  return (
    <div className="p-4 border rounded-lg bg-muted/30">
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className="text-xl font-bold">{value}</div>
      {subtext && <div className="text-xs text-muted-foreground">{subtext}</div>}
    </div>
  );
}
