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

export function ProductForm({
  token,
  product = null,
  onSuccess,
  onCancel,
  formId = "product-sheet-form",
}) {
  const isEdit = !!product;
  const [activeTab, setActiveTab] = useState("basic");

  const defaultValues = useMemo(
    () => ({
      name: product?.name || "",
      shortDescription: product?.shortDescription || "",
      description: product?.description || "",
      basePrice: product?.basePrice ?? "",
      quantity: product?.quantity ?? 0, // Read-only, managed by inventory service
      category: product?.category || "",
      parentCategory: product?.parentCategory || "",
      images: product?.images?.map(img => ({
        ...img,
        variants: {
          thumbnail: img.variants?.thumbnail || "",
          medium: img.variants?.medium || "",
        },
      })) || [],
      variations: product?.variations?.map(variation => ({
        name: variation.name || "",
        options: variation.options?.map(option => ({
          value: option.value || "",
          priceModifier: option.priceModifier ?? 0,
          quantity: option.quantity ?? 0,
          images: option.images || [],
        })) || [{ value: "", priceModifier: 0, quantity: 0 }],
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

  // Create form schema with tabs
  const formSchema = useMemo(
    () => createProductFormSchema({
      isEdit,
      product,
    }),
    [isEdit, product]
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
          cleanData.style = data.style.filter((s) => s && s.trim());
        }

        // Clean up variations array
        if (data.variations && Array.isArray(data.variations) && data.variations.length > 0) {
          const cleanedVariations = data.variations
            .filter((variation) => variation.name && variation.name.trim())
            .map((variation) => ({
              name: variation.name.trim(),
              options: variation.options
                .filter((option) => option.value && option.value.trim())
                .map((option) => ({
                  value: option.value.trim(),
                  priceModifier: Number(option.priceModifier) || 0,
                  quantity: Number(option.quantity) || 0,
                  ...(option.images?.length > 0 && { images: option.images }),
                })),
            }))
            .filter((variation) => variation.options.length > 0);

          if (cleanedVariations.length > 0) {
            cleanData.variations = cleanedVariations;
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
      const variationFields = ["variations"];
      
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
      className="flex flex-col h-full"
    >
      <DynamicTabs
        tabs={tabsContent}
        value={activeTab}
        onValueChange={setActiveTab}
        variant="default"
        layout="flex"
        className="flex-1"
        listWrapperClassName="px-0"
        listClassName="mb-4 gap-0.5"
        contentClassName="px-1"
      />
      
      <FormErrorSummary errors={formErrors} className="mt-4" />
    </form>
  );
}
