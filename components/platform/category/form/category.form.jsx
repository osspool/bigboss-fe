"use client";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { categoryCreateSchema, categoryUpdateSchema } from "@/schemas/category.schema";
import { FormGenerator } from "@/components/form/form-system";
import { FormErrorSummary } from "@classytic/clarity";
import { createCategoryFormSchema } from "./category-form-schema";
import { useCategoryActions, useCategoryTree, getParentCategoryOptions } from "@/hooks/query";
import { useNotifySubmitState } from "@/hooks/use-form-submit-state";

export function CategoryForm({
  token,
  category = null,
  onSuccess,
  onCancel,
  onSubmitStateChange,
  formId = "category-sheet-form",
}) {
  const isEdit = !!category;

  // Fetch category tree for parent options
  const { data: treeResponse } = useCategoryTree(token);
  const categoryTree = treeResponse?.data || [];

  // Build parent category options (exclude current category and its children for edit)
  const parentOptions = useMemo(() => {
    const options = getParentCategoryOptions(categoryTree);
    if (isEdit && category?.slug) {
      // Filter out current category to prevent circular reference
      return options.filter(opt => opt.value !== category.slug);
    }
    return options;
  }, [categoryTree, isEdit, category?.slug]);

  const defaultValues = useMemo(
    () => ({
      name: category?.name || "",
      parent: category?.parent || "",
      description: category?.description || "",
      image: {
        url: category?.image?.url || "",
        alt: category?.image?.alt || "",
      },
      displayOrder: category?.displayOrder ?? 0,
      vatRate: category?.vatRate ?? "",
      isActive: category?.isActive ?? true,
      seo: {
        title: category?.seo?.title || "",
        description: category?.seo?.description || "",
      },
    }),
    [category]
  );

  const form = useForm({
    resolver: zodResolver(isEdit ? categoryUpdateSchema : categoryCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });

  const { create: createCategory, update: updateCategory, isCreating, isUpdating } =
    useCategoryActions();
  const isSubmitting = isCreating || isUpdating;
  const formErrors = form.formState.errors;

  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  // Create form schema
  const formSchema = useMemo(
    () => createCategoryFormSchema({
      isEdit,
      category,
      parentOptions,
    }),
    [isEdit, category, parentOptions]
  );

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        // Clean up empty strings and undefined values
        const cleanData = {
          name: data.name,
          isActive: data.isActive,
          ...(data.description && { description: data.description }),
          ...(data.displayOrder !== undefined && { displayOrder: Number(data.displayOrder) || 0 }),
        };

        // Handle parent - include for both create and edit
        // Empty string means root category (null parent)
        if (data.parent) {
          cleanData.parent = data.parent;
        } else {
          cleanData.parent = null; // Explicitly set to null for root category
        }

        // Handle vatRate (can be null to use platform default)
        if (data.vatRate !== "" && data.vatRate !== undefined && data.vatRate !== null) {
          cleanData.vatRate = Number(data.vatRate);
        } else if (isEdit) {
          // Explicitly set null to clear override
          cleanData.vatRate = null;
        }

        // Clean up image object
        if (data.image?.url) {
          cleanData.image = {
            url: data.image.url,
            ...(data.image.alt && { alt: data.image.alt }),
          };
        }

        // Clean up SEO object
        if (data.seo?.title || data.seo?.description) {
          cleanData.seo = {};
          if (data.seo.title) cleanData.seo.title = data.seo.title;
          if (data.seo.description) cleanData.seo.description = data.seo.description;
        }

        if (isEdit) {
          await updateCategory({ token, id: category._id, data: cleanData });
        } else {
          await createCategory({ token, data: cleanData });
        }
        onSuccess?.();
      } catch (error) {
        console.error(error);
        // Toast is handled by the mutation factory
      }
    },
    [isEdit, updateCategory, createCategory, token, category?._id, onSuccess]
  );

  const handleFormError = useCallback(() => {
    toast.error("Please fix the validation errors before submitting");
  }, []);

  return (
    <form id={formId} onSubmit={form.handleSubmit(handleSubmitForm, handleFormError)} className="space-y-6">
      <FormGenerator schema={formSchema} control={form.control} disabled={isSubmitting} />
      <FormErrorSummary errors={formErrors} />
    </form>
  );
}
