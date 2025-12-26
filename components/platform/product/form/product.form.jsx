"use client";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { productCreateSchema, productUpdateSchema } from "@/schemas/product.schema";
import { FormGenerator } from "@/components/form/form-system";
import { FormErrorSummary } from "@/components/form/form-utils/FormErrorSummary";
import { createProductFormSchema } from "./product-form-schema";
import { useProductActions } from "@/hooks/query/useProducts";
import { DynamicTabs } from "@/components/custom/ui/tabs-wrapper";
import { revalidateProduct } from "@/lib/revalidation";
import { useCategoryTree, getParentCategoryOptions, getAllCategoryOptions } from "@/hooks/query/useCategories";
import { useNotifySubmitState } from "@/hooks/use-form-submit-state";

const normalizeStyleValue = (value = "") =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export function ProductForm({
  token,
  product = null,
  onSuccess,
  onCancel,
  onSubmitStateChange,
  formId = "product-sheet-form",
}) {
  const isEdit = !!product;
  const [activeTab, setActiveTab] = useState("basic");

  // Fetch category tree for dynamic category options
  const { data: treeResponse } = useCategoryTree(token);
  const categoryTree = treeResponse?.data || [];

  // Build category options from tree
  const parentCategoryOptions = useMemo(() => getParentCategoryOptions(categoryTree), [categoryTree]);
  const categoryOptions = useMemo(() => getAllCategoryOptions(categoryTree), [categoryTree]);

  const defaultValues = useMemo(
    () => ({
      name: product?.name || "",
      shortDescription: product?.shortDescription || "",
      description: product?.description || "",
      basePrice: product?.basePrice ?? "",
      quantity: product?.quantity ?? 0, // Read-only, managed by inventory service
      category: product?.category || "",
      parentCategory: product?.parentCategory || "",
      barcode: product?.barcode || "",
      images: product?.images?.map(img => ({
        ...img,
        variants: {
          thumbnail: img.variants?.thumbnail || "",
          medium: img.variants?.medium || "",
        },
      })) || [],
      variationAttributes: product?.variationAttributes?.map(attr => ({
        name: attr.name || "",
        values: attr.values || [],
      })) || [],
      variants: product?.variants?.map(variant => ({
        sku: variant.sku || "",
        attributes: variant.attributes || {},
        priceModifier: variant.priceModifier ?? 0,
        barcode: variant.barcode || "",
        isActive: variant.isActive ?? true,
      })) || [],
      tags: product?.tags || [],
      style: product?.style || [],
      discount: {
        type: product?.discount?.type || "",
        value: product?.discount?.value ?? "",
        startDate: product?.discount?.startDate || "",
        endDate: product?.discount?.endDate || "",
        description: product?.discount?.description || "",
      },
      isActive: product?.isActive ?? true,
    }),
    [product]
  );

  const form = useForm({
    resolver: zodResolver(isEdit ? productUpdateSchema : productCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });

  const { create: createProduct, update: updateProduct, isCreating, isUpdating } =
    useProductActions();
  const isSubmitting = isCreating || isUpdating;
  const formErrors = form.formState.errors;

  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  // Create form schema with tabs
  const formSchema = useMemo(
    () => createProductFormSchema({
      isEdit,
      product,
      parentCategoryOptions,
      categoryOptions,
    }),
    [isEdit, product, parentCategoryOptions, categoryOptions]
  );

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        // Clean up empty strings and undefined values
        const cleanData = {
          name: data.name,
          basePrice: Number(data.basePrice),
          category: data.category,
          isActive: data.isActive,
          ...(data.shortDescription && { shortDescription: data.shortDescription }),
          ...(data.description && { description: data.description }),
          ...(data.parentCategory && { parentCategory: data.parentCategory }),
          ...(data.barcode && { barcode: data.barcode }),
        };

        // Clean up images array - only include complete images
        if (data.images && Array.isArray(data.images)) {
          const cleanedImages = data.images
            .filter((img) => img.url)
            .map((img, index) => {
              const imageData = {
                ...(img._id && { _id: img._id }),
                url: img.url,
                order: img.order ?? index,
                isFeatured: img.isFeatured || false,
                ...(img.alt && { alt: img.alt }),
              };

              // Include variants if they exist
              if (img.variants) {
                const variants = {};
                if (img.variants.thumbnail) variants.thumbnail = img.variants.thumbnail;
                if (img.variants.medium) variants.medium = img.variants.medium;

                if (Object.keys(variants).length > 0) {
                  imageData.variants = variants;
                }
              }

              return imageData;
            });

          if (cleanedImages.length > 0) {
            cleanData.images = cleanedImages;
          }
        }

        // Clean up tags array
        if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
          cleanData.tags = data.tags.filter((tag) => tag && tag.trim());
        }

        // Clean up style array
        if (data.style && Array.isArray(data.style) && data.style.length > 0) {
          cleanData.style = data.style
            .map((style) => normalizeStyleValue(style))
            .filter((style) => style && style.trim());
        }

        // Clean up variationAttributes array
        if (data.variationAttributes && Array.isArray(data.variationAttributes) && data.variationAttributes.length > 0) {
          const cleanedAttributes = data.variationAttributes
            .filter((attr) => attr.name && attr.name.trim() && attr.values?.length > 0)
            .map((attr) => ({
              name: attr.name.trim(),
              values: attr.values.filter((v) => v && v.trim()).map((v) => v.trim()),
            }))
            .filter((attr) => attr.values.length > 0);

          if (cleanedAttributes.length > 0) {
            cleanData.variationAttributes = cleanedAttributes;
          }
        }

        // Clean up variants array (optional overrides for initial priceModifiers or updates)
        if (data.variants && Array.isArray(data.variants) && data.variants.length > 0) {
          const cleanedVariants = data.variants
            .filter((variant) => {
              // For updates, must have SKU. For create, must have attributes
              return (isEdit && variant.sku) || (!isEdit && variant.attributes && Object.keys(variant.attributes).length > 0);
            })
            .map((variant) => ({
              ...(variant.sku && { sku: variant.sku }),
              ...(variant.attributes && { attributes: variant.attributes }),
              ...(variant.priceModifier !== undefined && { priceModifier: Number(variant.priceModifier) || 0 }),
              ...(variant.barcode && { barcode: variant.barcode }),
              ...(variant.isActive !== undefined && { isActive: variant.isActive }),
            }));

          if (cleanedVariants.length > 0) {
            cleanData.variants = cleanedVariants;
          }
        }

        // Clean up discount object - only include if type is set
        if (data.discount?.type) {
          const normalizeDate = (value) => {
            if (!value) return undefined;
            if (typeof value === "string") return value;
            // Convert Date objects to ISO strings for API consumption
            if (value instanceof Date && !isNaN(value)) return value.toISOString();
            return undefined;
          };

          cleanData.discount = {
            type: data.discount.type,
            ...(data.discount.value && { value: Number(data.discount.value) }),
            ...(normalizeDate(data.discount.startDate) && { startDate: normalizeDate(data.discount.startDate) }),
            ...(normalizeDate(data.discount.endDate) && { endDate: normalizeDate(data.discount.endDate) }),
            ...(data.discount.description && { description: data.discount.description }),
          };
        }

        let result;
        if (isEdit) {
          result = await updateProduct({ token, id: product._id, data: cleanData });
        } else {
          result = await createProduct({ token, data: cleanData });
        }

        // Revalidate product cache
        const slug = result?.data?.slug || product?.slug;
        if (slug) {
          await revalidateProduct(slug);
        }

        onSuccess?.();
      } catch (error) {
        console.error(error);
        // Toast is handled by the mutation factory
      }
    },
    [isEdit, updateProduct, createProduct, token, product?._id, product?.slug, onSuccess]
  );

  const handleFormError = useCallback(() => {
    toast.error("Please fix the validation errors before submitting");

    // Find which tab has errors and switch to it
    const errorFields = Object.keys(formErrors);
    if (errorFields.length > 0) {
      // Map error fields to tabs
      const basicFields = ["name", "shortDescription", "description", "category", "parentCategory", "tags", "style"];
      const mediaFields = ["images"];
      const pricingFields = ["basePrice", "isActive", "discount"];
      const variationFields = ["variationAttributes", "variants"];
      const barcodeFields = ["barcode", "sku"];

      for (const field of errorFields) {
        if (basicFields.some(f => field.startsWith(f))) {
          setActiveTab("basic");
          break;
        }
        if (mediaFields.some(f => field.startsWith(f))) {
          setActiveTab("media");
          break;
        }
        if (pricingFields.some(f => field.startsWith(f))) {
          setActiveTab("pricing");
          break;
        }
        if (variationFields.some(f => field.startsWith(f))) {
          setActiveTab("variations");
          break;
        }
        if (barcodeFields.some(f => field.startsWith(f))) {
          setActiveTab("barcode");
          break;
        }
      }
    }
  }, [formErrors]);

  // Build tabs content from schema
  const tabsContent = useMemo(() => {
    if (!formSchema.tabs || !formSchema.sections) return [];

    return formSchema.tabs.map((tab) => ({
      value: tab.id,
      label: tab.label,
      icon: tab.icon,
      content: (
        <div className="space-y-6">
          {formSchema.sections[tab.id]?.map((section, index) => {
            // If section has a render function, use it
            if (section.render) {
              return (
                <div key={section.id || index}>
                  {section.render({ control: form.control, disabled: isSubmitting })}
                </div>
              );
            }
            // Otherwise use FormGenerator for the section
            return (
              <FormGenerator
                key={section.id || index}
                schema={{ sections: [section] }}
                control={form.control}
                disabled={isSubmitting}
              />
            );
          })}
        </div>
      ),
    }));
  }, [formSchema, form.control, isSubmitting]);

  return (
    <form
      id={formId}
      onSubmit={form.handleSubmit(handleSubmitForm, handleFormError)}
      className="flex flex-col h-full min-h-0"
    >
      <DynamicTabs
        tabs={tabsContent}
        value={activeTab}
        onValueChange={setActiveTab}
        variant="default"
        layout="flex"
        scrollable
        className="flex-1 min-h-0"
      />
      
      <FormErrorSummary errors={formErrors} className="mt-4" />
    </form>
  );
}
