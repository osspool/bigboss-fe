"use client";

import { useRef, useEffect, useState } from "react";
import { Controller, useFieldArray, type Control, useWatch } from "react-hook-form";
import JsBarcode from "jsbarcode";
import { Printer, Barcode as BarcodeIcon, Download, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types/product.types";
import { toast } from "sonner";
import { generateProductBarcode, validateEAN13 } from "@/lib/utils/barcode-utils";

type BarcodeFormat = "EAN13" | "UPCA" | "CODE128";

type ProductFormValues = {
  sku?: string;
  barcode?: string;
  barcodeFormat?: BarcodeFormat;
  variants?: Array<{
    sku?: string;
    barcode?: string;
    attributes?: Record<string, string>;
    priceModifier?: number;
    isActive?: boolean;
  }>;
};

interface BarcodeManagerProps {
  control: Control<ProductFormValues>;
  disabled?: boolean;
  isEdit?: boolean;
  product?: Product | null;
}

export function BarcodeManager({
  control,
  disabled = false,
  isEdit = false,
  product = null,
}: BarcodeManagerProps) {
  const isVariantProduct = product?.productType === "variant" || (product?.variants && product.variants.length > 0);

  return (
    <div className="space-y-6">
      <Alert>
        <BarcodeIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>✓ Scannable Barcodes:</strong> All generated barcodes use industry-standard formats (EAN-13, UPC-A, CODE128) compatible with POS scanners.
          {isVariantProduct && " Each variant gets a unique barcode."}
        </AlertDescription>
      </Alert>

      {/* Simple Product SKU & Barcode */}
      {!isVariantProduct && (
        <SimpleProductBarcode
          control={control}
          disabled={disabled}
          isEdit={isEdit}
          product={product}
        />
      )}

      {/* Variant Product Barcodes */}
      {isVariantProduct && (
        <VariantProductBarcodes
          control={control}
          disabled={disabled}
          product={product}
        />
      )}
    </div>
  );
}

function SimpleProductBarcode({
  control,
  disabled,
  isEdit,
  product,
}: {
  control: Control<ProductFormValues>;
  disabled: boolean;
  isEdit: boolean;
  product?: Product | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeFormat, setBarcodeFormat] = useState<BarcodeFormat>("EAN13");
  const watchedBarcode = useWatch({ control, name: "barcode" });
  const barcodeValue = watchedBarcode || product?.barcode || "";

  // Detect format from barcode length
  useEffect(() => {
    if (barcodeValue) {
      if (barcodeValue.length === 13) setBarcodeFormat("EAN13");
      else if (barcodeValue.length === 12) setBarcodeFormat("UPCA");
      else setBarcodeFormat("CODE128");
    }
  }, [barcodeValue]);

  // Update barcode preview when value changes
  useEffect(() => {
    if (canvasRef.current && barcodeValue && barcodeValue.length >= 8) {
      try {
        // Determine format based on length and content
        let format = "CODE128";
        if (barcodeValue.length === 13 && /^\d+$/.test(barcodeValue)) {
          format = "EAN13";
        } else if (barcodeValue.length === 12 && /^\d+$/.test(barcodeValue)) {
          format = "UPCA";
        }

        JsBarcode(canvasRef.current, barcodeValue, {
          format,
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 14,
          margin: 10,
        });
      } catch (error) {
        console.error("Invalid barcode:", error);
      }
    }
  }, [barcodeValue]);

  const handlePrint = () => {
    if (!barcodeValue) {
      toast.error("No barcode to print");
      return;
    }

    printBarcode({
      barcode: barcodeValue,
      productName: product?.name || "",
      sku: product?.sku || "",
      price: product?.basePrice,
    });
  };

  const handleDownload = () => {
    if (!canvasRef.current || !barcodeValue) {
      toast.error("No barcode to download");
      return;
    }

    const link = document.createElement("a");
    link.download = `barcode-${product?.sku || barcodeValue}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
    toast.success("Barcode downloaded");
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <FieldLabel className="text-base font-medium">Product SKU & Barcode</FieldLabel>
          <FieldDescription>
            SKU is auto-generated. Add an optional barcode for POS scanning.
          </FieldDescription>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* SKU - Read Only */}
          <div className="space-y-2">
            <FieldLabel>Product SKU</FieldLabel>
            <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm font-mono">
              {product?.sku || "(auto-generated on save)"}
            </div>
            <FieldDescription className="text-xs">
              Auto-generated from product name
            </FieldDescription>
          </div>

          {/* Barcode Format Selector */}
          <div className="space-y-2">
            <FieldLabel>Barcode Format</FieldLabel>
            <Select
              value={barcodeFormat}
              onValueChange={(value: BarcodeFormat) => setBarcodeFormat(value)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EAN13">EAN-13 (13 digits)</SelectItem>
                <SelectItem value="UPCA">UPC-A (12 digits)</SelectItem>
                <SelectItem value="CODE128">CODE128 (flexible)</SelectItem>
              </SelectContent>
            </Select>
            <FieldDescription className="text-xs">
              Standard format for POS scanners
            </FieldDescription>
          </div>

          {/* Barcode - Editable */}
          <Controller
            control={control}
            name="barcode"
            render={({ field, fieldState }) => {
              const handleGenerate = () => {
                if (!product?.sku) {
                  toast.error("SKU not available. Save product first to generate barcode.");
                  return;
                }

                const generatedBarcode = generateProductBarcode(product.sku, undefined, barcodeFormat);
                field.onChange(generatedBarcode);
                toast.success(`${barcodeFormat} barcode generated!`);
              };

              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Barcode (Optional)</FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      {...field}
                      type="text"
                      placeholder={barcodeFormat === "EAN13" ? "1234567890123" : barcodeFormat === "UPCA" ? "123456789012" : "ABC123XYZ"}
                      disabled={disabled}
                    />
                    <InputGroupAddon align="inline-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={disabled || !product?.sku}
                        className="h-7 px-2"
                        title={`Generate ${barcodeFormat} barcode`}
                      >
                        <Sparkles className="h-4 w-4" />
                      </Button>
                    </InputGroupAddon>
                  </InputGroup>
                  <FieldError errors={[fieldState.error]} />
                  <FieldDescription className="text-xs">
                    Click sparkle to auto-generate scannable barcode
                  </FieldDescription>
                </Field>
              );
            }}
          />
        </div>

        {/* Barcode Preview */}
        {barcodeValue && barcodeValue.length >= 8 && (
          <div className="space-y-3">
            <FieldLabel>Barcode Preview</FieldLabel>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-white dark:bg-muted/30">
              <canvas ref={canvasRef} />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!barcodeValue}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  disabled={!barcodeValue}
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print Label
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

function VariantProductBarcodes({
  control,
  disabled,
  product,
}: {
  control: Control<ProductFormValues>;
  disabled: boolean;
  product?: Product | null;
}) {
  const { fields, update } = useFieldArray({
    control,
    name: "variants",
  });

  const handleGenerateAllBarcodes = () => {
    if (!product?.sku || !product?.variants) {
      toast.error("SKU or variants not available. Save product first.");
      return;
    }

    let generatedCount = 0;

    product.variants.forEach((variant, index) => {
      if (variant.attributes) {
        const generatedBarcode = generateProductBarcode(product.sku!, variant.attributes);
        update(index, {
          ...fields[index],
          barcode: generatedBarcode,
        });
        generatedCount++;
      }
    });

    toast.success(`Generated ${generatedCount} barcodes for all variants!`);
  };

  const handlePrintVariant = (variant: any, index: number) => {
    if (!variant.barcode) {
      toast.error("No barcode for this variant");
      return;
    }

    const attributesStr = Object.entries(variant.attributes || {})
      .map(([key, val]) => `${key}: ${val}`)
      .join(", ");

    const finalPrice = (product?.basePrice || 0) + (variant.priceModifier || 0);

    printBarcode({
      barcode: variant.barcode,
      productName: `${product?.name || ""} - ${attributesStr}`,
      sku: variant.sku || "",
      price: finalPrice,
    });
  };

  const handlePrintAll = () => {
    const variantsWithBarcodes = fields.filter((_, index) => {
      const variant = product?.variants?.[index];
      return variant?.barcode;
    });

    if (variantsWithBarcodes.length === 0) {
      toast.error("No variants have barcodes");
      return;
    }

    // Print all variants sequentially
    variantsWithBarcodes.forEach((_, index) => {
      const variant = product?.variants?.[index];
      if (variant?.barcode) {
        setTimeout(() => {
          handlePrintVariant(variant, index);
        }, index * 500); // Stagger prints by 500ms
      }
    });

    toast.success(`Printing ${variantsWithBarcodes.length} barcode labels`);
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <FieldLabel className="text-base font-medium">Variant Barcodes</FieldLabel>
            <FieldDescription>
              Each variant can have its own barcode for POS scanning
            </FieldDescription>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleGenerateAllBarcodes}
              disabled={disabled || !product?.sku}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintAll}
            >
              <Printer className="h-4 w-4 mr-2" />
              Print All
            </Button>
          </div>
        </div>

        {/* Product SKU */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="text-sm">
            <span className="font-medium">Product SKU: </span>
            <span className="font-mono">{product?.sku || "(auto-generated on save)"}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground uppercase tracking-wide pb-2 border-b">
            <div className="col-span-2">Variant SKU</div>
            <div className="col-span-2">Attributes</div>
            <div className="col-span-4">
              <div className="flex items-center gap-1">
                <BarcodeIcon className="h-3 w-3" />
                <span>Barcode</span>
              </div>
            </div>
            <div className="col-span-3">Preview</div>
            <div className="col-span-1 text-center">Print</div>
          </div>

          {fields.map((field, index) => (
            <VariantBarcodeRow
              key={field.id}
              control={control}
              index={index}
              product={product}
              disabled={disabled}
              onPrint={(variant) => handlePrintVariant(variant, index)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

function VariantBarcodeRow({
  control,
  index,
  product,
  disabled,
  onPrint,
}: {
  control: Control<ProductFormValues>;
  index: number;
  product?: Product | null;
  disabled: boolean;
  onPrint: (variant: any) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const variant = product?.variants?.[index];

  // Watch the barcode value from form state
  const watchedBarcode = useWatch({
    control,
    name: `variants.${index}.barcode`,
  });

  const barcodeValue = watchedBarcode || variant?.barcode || "";

  useEffect(() => {
    if (canvasRef.current && barcodeValue && barcodeValue.length >= 8) {
      try {
        // Auto-detect format
        let format = "CODE128";
        if (barcodeValue.length === 13 && /^\d+$/.test(barcodeValue)) {
          format = "EAN13";
        } else if (barcodeValue.length === 12 && /^\d+$/.test(barcodeValue)) {
          format = "UPCA";
        }

        JsBarcode(canvasRef.current, barcodeValue, {
          format,
          width: 1.5,
          height: 50,
          displayValue: false,
          margin: 4,
        });
      } catch (error) {
        console.error("Invalid barcode:", error);
      }
    }
  }, [barcodeValue]);

  if (!variant) return null;

  const attributesStr = Object.entries(variant.attributes || {})
    .map(([key, val]) => `${key}: ${val}`)
    .join(", ");

  return (
    <div className="grid grid-cols-12 gap-4 items-center py-3 border-b last:border-b-0 hover:bg-muted/30 transition-colors">
      {/* SKU */}
      <div className="col-span-2">
        <div className="text-xs font-mono bg-muted/50 px-2 py-1.5 rounded truncate" title={variant.sku}>
          {variant.sku || "(auto-gen)"}
        </div>
      </div>

      {/* Attributes */}
      <div className="col-span-2">
        <div className="text-xs px-2 py-1.5 truncate" title={attributesStr}>
          {attributesStr || "(none)"}
        </div>
      </div>

      {/* Barcode Input */}
      <Controller
        control={control}
        name={`variants.${index}.barcode`}
        render={({ field, fieldState }) => {
          const handleGenerateVariant = () => {
            if (!product?.sku || !variant.attributes) {
              toast.error("Cannot generate barcode. SKU or variant attributes missing.");
              return;
            }

            const generatedBarcode = generateProductBarcode(product.sku, variant.attributes);
            field.onChange(generatedBarcode);
            toast.success("Variant barcode generated!");
          };

          return (
            <Field className="col-span-4" data-invalid={fieldState.invalid}>
              <InputGroup>
                <InputGroupInput
                  {...field}
                  type="text"
                  placeholder="1234567890123"
                  disabled={disabled}
                  className="h-10 text-sm font-mono"
                />
                <InputGroupAddon align="inline-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateVariant}
                    disabled={disabled || !product?.sku}
                    className="h-8 px-2"
                    title="Generate barcode for this variant"
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                </InputGroupAddon>
              </InputGroup>
              <FieldError errors={[fieldState.error]} />
            </Field>
          );
        }}
      />

      {/* Preview */}
      <div className="col-span-3 flex items-center justify-center bg-white dark:bg-muted/20 border rounded p-2">
        {barcodeValue && barcodeValue.length >= 8 ? (
          <canvas ref={canvasRef} className="max-w-full" />
        ) : (
          <span className="text-xs text-muted-foreground">No barcode</span>
        )}
      </div>

      {/* Actions */}
      <div className="col-span-1 flex items-center justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => onPrint(variant)}
          disabled={!barcodeValue}
          title="Print barcode label"
        >
          <Printer className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Utility function to print barcode labels
function printBarcode({
  barcode,
  productName,
  sku,
  price,
}: {
  barcode: string;
  productName: string;
  sku: string;
  price?: number;
}) {
  // Create a temporary canvas for high-quality barcode
  const canvas = document.createElement("canvas");

  try {
    // Auto-detect format for printing
    let format = "CODE128";
    if (barcode.length === 13 && /^\d+$/.test(barcode)) {
      format = "EAN13";
    } else if (barcode.length === 12 && /^\d+$/.test(barcode)) {
      format = "UPCA";
    }

    JsBarcode(canvas, barcode, {
      format,
      width: 3,
      height: 100,
      displayValue: true,
      fontSize: 16,
      margin: 10,
      background: "#ffffff",
    });

    const barcodeImage = canvas.toDataURL("image/png");

    // Create print window
    const printWindow = window.open("", "_blank", "width=400,height=300");

    if (!printWindow) {
      toast.error("Please allow popups to print barcodes");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Barcode - ${sku}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            @media print {
              @page {
                size: 4in 2in;
                margin: 0;
              }

              html, body {
                width: 4in;
                height: 2in;
                margin: 0;
                padding: 0;
              }

              .label {
                page-break-inside: avoid;
                page-break-after: avoid;
                page-break-before: avoid;
              }
            }

            body {
              font-family: Arial, sans-serif;
              text-align: center;
              background: white;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 4in;
              height: 2in;
            }

            .label {
              width: 100%;
              padding: 0.15in;
              background: white;
            }

            .product-name {
              font-size: 12px;
              font-weight: bold;
              margin-bottom: 4px;
              line-height: 1.2;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .sku {
              font-size: 9px;
              color: #666;
              margin-bottom: 4px;
              font-family: monospace;
            }

            .barcode-img {
              display: block;
              margin: 4px auto;
              max-width: 95%;
              height: auto;
            }

            .price {
              font-size: 14px;
              font-weight: bold;
              margin-top: 4px;
              color: #000;
            }
          </style>
        </head>
        <body>
          <div class="label">
            <div class="product-name">${productName}</div>
            <div class="sku">SKU: ${sku}</div>
            <img src="${barcodeImage}" alt="Barcode" class="barcode-img" />
            ${price !== undefined ? `<div class="price">৳${price.toFixed(2)}</div>` : ""}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() {
                  window.close();
                }, 100);
              }, 250);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
    toast.success("Printing barcode label...");
  } catch (error) {
    console.error("Barcode generation error:", error);
    toast.error("Failed to generate barcode. Please check the barcode format.");
  }
}
