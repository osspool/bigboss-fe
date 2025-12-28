"use client";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { sizeGuideCreateSchema, sizeGuideUpdateSchema } from "@/schemas/size-guide.schema";
import { FormGenerator } from "@/components/form/form-system";
import { FormErrorSummary } from "@/components/form/form-utils/FormErrorSummary";
import { createSizeGuideFormSchema } from "./size-guide-form-schema";
import { useSizeGuideActions } from "@/hooks/query/useSizeGuides";
import { useNotifySubmitState } from "@/hooks/use-form-submit-state";

export function SizeGuideForm({
  token,
  sizeGuide = null,
  onSuccess,
  onCancel,
  onSubmitStateChange,
  formId = "size-guide-sheet-form",
}) {
  const isEdit = !!sizeGuide;

  const defaultValues = useMemo(
    () => ({
      name: sizeGuide?.name || "",
      description: sizeGuide?.description || "",
      measurementUnit: sizeGuide?.measurementUnit || "inches",
      measurementLabels: sizeGuide?.measurementLabels || [],
      sizes: sizeGuide?.sizes || [],
      note: sizeGuide?.note || "",
      displayOrder: sizeGuide?.displayOrder ?? 0,
      isActive: sizeGuide?.isActive ?? true,
    }),
    [sizeGuide]
  );

  const form = useForm({
    resolver: zodResolver(isEdit ? sizeGuideUpdateSchema : sizeGuideCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });

  const { create: createSizeGuide, update: updateSizeGuide, isCreating, isUpdating } =
    useSizeGuideActions();
  const isSubmitting = isCreating || isUpdating;
  const formErrors = form.formState.errors;

  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  // Create form schema
  const formSchema = useMemo(
    () => createSizeGuideFormSchema({
      isEdit,
      sizeGuide,
    }),
    [isEdit, sizeGuide]
  );

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        // Clean up empty strings and undefined values
        const cleanData = {
          name: data.name,
          isActive: data.isActive,
          measurementUnit: data.measurementUnit,
          ...(data.description && { description: data.description }),
          ...(data.displayOrder !== undefined && { displayOrder: Number(data.displayOrder) || 0 }),
          ...(data.note && { note: data.note }),
        };

        // Handle measurementLabels (array of strings)
        if (data.measurementLabels && data.measurementLabels.length > 0) {
          cleanData.measurementLabels = data.measurementLabels;
        } else {
          cleanData.measurementLabels = [];
        }

        // Handle sizes array
        if (data.sizes && data.sizes.length > 0) {
          // Clean up sizes - filter out empty entries and ensure measurements exist
          cleanData.sizes = data.sizes
            .filter((size) => size.name && size.name.trim())
            .map((size) => ({
              name: size.name.trim(),
              measurements: size.measurements || {},
            }));
        } else {
          cleanData.sizes = [];
        }

        if (isEdit) {
          await updateSizeGuide({ token, id: sizeGuide._id, data: cleanData });
        } else {
          await createSizeGuide({ token, data: cleanData });
        }
        onSuccess?.();
      } catch (error) {
        console.error(error);
        // Toast is handled by the mutation factory
      }
    },
    [isEdit, updateSizeGuide, createSizeGuide, token, sizeGuide?._id, onSuccess]
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
