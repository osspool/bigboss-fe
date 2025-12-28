import { PRODUCT_STYLES } from "@/data/constants";
import { TAG_OPTIONS } from "@/lib/constants";
import { Info, Package, DollarSign, Tags, ImageIcon, Settings, BarChart3, Layers, Barcode, Box, Grid3X3, Ruler } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { field, section } from "@/components/form/form-system";
import { format } from "date-fns";
import { ImageManager } from "./ImageManager";
import { LiteEditorField } from "@/components/form/lite-editor/lite-editor-field";
import { VariationField } from "./VariationField";
import { BarcodeManager } from "./BarcodeManager";

const normalizeStyleTag = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const formatStyleTag = (value = "") =>
  value
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (match) => match.toUpperCase());

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
 * @param {Array} options.parentCategoryOptions - Parent category options for select
 * @param {Array} options.categoryOptions - All category options (flattened tree)
 * @param {Array} options.sizeGuideOptions - Size guide options for select
 * @returns {Object} Form schema with tabs structure
 */
export const createProductFormSchema = ({
  isEdit = false,
  product = null,
  parentCategoryOptions = [],
  categoryOptions = [],
  sizeGuideOptions = [],
}) => {
  return {
    // Define tabs for the form (compact labels for sheet context)
    tabs: [
      {
        id: "basic",
        label: "Basic",
        icon: <Package className="h-4 w-4" />,
      },
      {
        id: "media",
        label: "Media",
        icon: <ImageIcon className="h-4 w-4" />,
      },
      {
        id: "pricing",
        label: "Price",
        icon: <DollarSign className="h-4 w-4" />,
      },
      {
        id: "variations",
        label: "Variants",
        icon: <Layers className="h-4 w-4" />,
      },
      {
        id: "barcode",
        label: "Barcode",
        icon: <Barcode className="h-4 w-4" />,
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

        // Product Name & SKU
        section(
          "name-section",
          null,
          [
            field.text("name", "Product Name", {
              placeholder: "Premium Wireless Headphones",
              required: true,
            }),
            field.text("sku", "SKU", {
              placeholder: "Auto-generated if empty",
              description: "Stock Keeping Unit (optional)",
            }),
          ],
          { cols: 2 }
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

        // Categories (dynamic from API)
        section(
          "category-section",
          "Categories",
          [
            field.select("parentCategory", "Parent Category", [
              { value: "", label: "None" },
              ...parentCategoryOptions,
            ], {
              placeholder: "Select parent category",
            }),
            field.combobox("category", "Category", categoryOptions, {
              placeholder: "Select category",
              required: true,
              searchPlaceholder: "Search categories...",
            }),
          ],
          { cols: 2, icon: <Tags className="h-4 w-4" /> }
        ),

        // Tags (predefined collection tags)
        section(
          "tags-section",
          null,
          [
            field.tagChoice("tags", "Collections", TAG_OPTIONS, {
              placeholder: "Select collections",
              description: "Assign this product to one or more collections",
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
            field.tags("style", "Product Style", {
              placeholder: "Add styles (press Enter or comma)",
              description: "Add one or more styles to describe this product",
              suggestions: PRODUCT_STYLES.map((style) => style.value),
              transformTag: normalizeStyleTag,
              formatTag: formatStyleTag,
              fullWidth: true,
            }),
          ],
          { cols: 1 }
        ),

        // Size Guide
        section(
          "size-guide-section",
          "Size Guide",
          [
            field.select("sizeGuide", "Size Guide", [
              { value: "", label: "None" },
              ...sizeGuideOptions,
            ], {
              placeholder: "Select a size guide",
              description: "Optional size guide to display on product page",
            }),
          ],
          { cols: 1, icon: <Ruler className="h-4 w-4" /> }
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
            field.number("costPrice", "Cost Price (৳)", {
              placeholder: "150.00",
              min: 0,
              step: 0.01,
              description: "For profit margin calculation (admin only)",
            }),
            field.number("quantity", "Stock Quantity", {
              placeholder: "0",
              min: 0,
              disabled: true,
              description: "Managed by inventory service",
            }),
            field.switch("isActive", "Active", {
              description: "Product is visible and available for purchase",
            }),
          ],
          { cols: 2, icon: <DollarSign className="h-4 w-4" /> }
        ),

        // VAT Configuration
        section(
          "vat-section",
          "VAT Configuration",
          [
            field.number("vatRate", "VAT Rate (%)", {
              placeholder: "15",
              min: 0,
              max: 100,
              step: 0.5,
              description: "Leave empty to inherit from category/platform default",
            }),
          ],
          {
            cols: 1,
            collapsible: true,
            defaultOpen: !!(product?.vatRate !== undefined && product?.vatRate !== null),
            icon: <Settings className="h-4 w-4" />,
            description: "Product-specific VAT rate override",
          }
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
        // Product Type Info (shows current type with variant stats)
        {
          id: "product-type-info",
          render: () => {
            const hasVariants = product?.productType === 'variant' ||
              (product?.variationAttributes?.length > 0 && product?.variants?.length > 0);
            const productType = hasVariants ? 'variant' : 'simple';

            // Calculate variant statistics
            const totalVariants = product?.variants?.length || 0;
            const activeVariants = product?.variants?.filter(v => v.isActive !== false)?.length || 0;
            const inactiveVariants = totalVariants - activeVariants;

            // Stock projection stats
            const stockProjection = product?.stockProjection?.variants || [];
            const variantsWithStock = stockProjection.filter(v => v.quantity > 0).length;
            const variantsOutOfStock = stockProjection.filter(v => v.quantity === 0).length;
            const totalStockQty = stockProjection.reduce((sum, v) => sum + (v.quantity || 0), 0);

            return (
              <div className="space-y-4">
                {/* Product Type Badge */}
                <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    {productType === 'variant' ? (
                      <Grid3X3 className="h-5 w-5 text-primary" />
                    ) : (
                      <Box className="h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="text-sm font-medium">Product Type</div>
                      <div className="text-xs text-muted-foreground">
                        {productType === 'variant'
                          ? 'This product has multiple variations'
                          : 'This is a simple product without variations'}
                      </div>
                    </div>
                  </div>
                  <Badge variant={productType === 'variant' ? 'default' : 'secondary'}>
                    {productType === 'variant' ? 'Variant Product' : 'Simple Product'}
                  </Badge>
                </div>

                {/* Variant Statistics (only show for variant products in edit mode) */}
                {isEdit && productType === 'variant' && totalVariants > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Total Variants</div>
                      <div className="text-lg font-bold">{totalVariants}</div>
                    </div>
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Active</div>
                      <div className="text-lg font-bold text-green-600">{activeVariants}</div>
                      {inactiveVariants > 0 && (
                        <div className="text-xs text-muted-foreground">{inactiveVariants} inactive</div>
                      )}
                    </div>
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <div className="text-xs font-medium text-muted-foreground mb-1">With Stock</div>
                      <div className="text-lg font-bold">{variantsWithStock}/{stockProjection.length || totalVariants}</div>
                      {variantsOutOfStock > 0 && (
                        <div className="text-xs text-red-600">{variantsOutOfStock} out of stock</div>
                      )}
                    </div>
                    <div className="p-3 border rounded-lg bg-muted/30">
                      <div className="text-xs font-medium text-muted-foreground mb-1">Total Stock</div>
                      <div className="text-lg font-bold">{totalStockQty}</div>
                      <div className="text-xs text-muted-foreground">units</div>
                    </div>
                  </div>
                )}
              </div>
            );
          },
        },
        // Variation Field Component
        {
          id: "variations-section",
          render: ({ control, disabled }) => (
            <VariationField control={control} disabled={disabled} isEdit={isEdit} product={product} />
          ),
        },
      ],

      // === BARCODE TAB ===
      barcode: [
        {
          id: "barcode-section",
          render: ({ control, disabled }) => (
            <BarcodeManager control={control} disabled={disabled} isEdit={isEdit} product={product} />
          ),
        },
      ],

      // === STATS TAB (Edit mode only) ===
      stats: isEdit && product ? [
        {
          id: "system-info",
          render: () => (
            <div className="space-y-6">
              {/* IDs & Product Type */}
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

              {/* Product Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Product Type</label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm items-center gap-2">
                    {product.productType === 'variant' ? (
                      <>
                        <Grid3X3 className="h-4 w-4 text-primary" />
                        <span>Variant Product</span>
                        <span className="text-muted-foreground ml-auto">
                          ({product.variants?.length || 0} variants)
                        </span>
                      </>
                    ) : (
                      <>
                        <Box className="h-4 w-4" />
                        <span>Simple Product</span>
                      </>
                    )}
                  </div>
                </div>
                {product.sku && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">SKU</label>
                    <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono truncate">
                      {product.sku}
                    </div>
                  </div>
                )}
              </div>

              {/* Financial Metrics (Admin Only) */}
              {(product.costPrice !== undefined || product.profitMargin !== undefined) && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Financial Metrics
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {product.costPrice !== undefined && (
                      <StatCard
                        label="Cost Price (COGS)"
                        value={`৳${product.costPrice?.toFixed(2) || '0.00'}`}
                      />
                    )}
                    {product.profitMargin !== undefined && product.profitMargin !== null && (
                      <StatCard
                        label="Profit Margin"
                        value={`৳${product.profitMargin?.toFixed(2) || '0.00'}`}
                        subtext={product.profitMarginPercent !== undefined ? `${product.profitMarginPercent?.toFixed(1)}%` : undefined}
                      />
                    )}
                    <StatCard
                      label="Current Price"
                      value={`৳${(product.currentPrice || product.basePrice)?.toFixed(2)}`}
                    />
                    <StatCard
                      label="Base Price"
                      value={`৳${product.basePrice?.toFixed(2)}`}
                    />
                  </div>
                </div>
              )}

              {/* Statistics Cards */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Product Statistics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    label="Total Sales"
                    value={`৳${(product.stats?.totalSales || product.totalSales || 0)?.toLocaleString()}`}
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

              {/* Stock Projection (Variant Stock Breakdown) */}
              {product.productType === 'variant' && product.stockProjection?.variants?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    Variant Stock Projection
                    <span className="text-xs text-muted-foreground font-normal ml-auto">
                      Last synced: {product.stockProjection.syncedAt
                        ? format(new Date(product.stockProjection.syncedAt), 'PPp')
                        : 'Never'}
                    </span>
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase">
                      <div className="col-span-6">Variant SKU</div>
                      <div className="col-span-3 text-right">Stock</div>
                      <div className="col-span-3 text-right">Status</div>
                    </div>
                    <div className="divide-y max-h-[200px] overflow-y-auto">
                      {product.stockProjection.variants.map((variant) => {
                        const isOut = variant.quantity === 0;
                        const isLow = variant.quantity > 0 && variant.quantity <= 10;
                        return (
                          <div key={variant.sku} className="grid grid-cols-12 gap-2 p-3 text-sm">
                            <div className="col-span-6 font-mono text-xs truncate">{variant.sku}</div>
                            <div className={`col-span-3 text-right font-medium ${isOut ? 'text-red-600' : isLow ? 'text-yellow-600' : ''}`}>
                              {variant.quantity}
                            </div>
                            <div className="col-span-3 text-right">
                              {isOut ? (
                                <Badge variant="destructive" className="text-xs">Out</Badge>
                              ) : isLow ? (
                                <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300">Low</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">In Stock</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Stock quantities are synced from all branches. Use the inventory system for branch-level details.
                  </p>
                </div>
              )}

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
