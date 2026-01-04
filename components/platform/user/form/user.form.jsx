"use client";
import { useCallback, useEffect, useMemo } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { userUpdateSchema } from "@/schemas/user.schema";
import { FormGenerator } from "@/components/form/form-system";
import { FormErrorSummary } from "@classytic/clarity";
import { createUserFormSchema } from "./user-form-schema";
import { useUserActions } from "@/hooks/query";
import { BranchAssignmentManager } from "./BranchAssignmentManager";
import { useNotifySubmitState } from "@/hooks/use-form-submit-state";

export function UserForm({
  token,
  user = null,
  onSuccess,
  onCancel,
  onSubmitStateChange,
  formId = "user-sheet-form",
}) {
  const defaultValues = useMemo(
    () => ({
      name: user?.name || "",
      email: user?.email || "",
      roles: user?.roles || [],
      isActive: user?.isActive ?? true,
      branches: user?.branches?.map((b) => ({
        branchId: b.branchId || "",
        branchCode: b.branchCode || "",
        branchName: b.branchName || "",
        branchRole: b.branchRole || "",
        roles: b.roles || [],
        isPrimary: b.isPrimary || false,
      })) || [],
    }),
    [user]
  );

  const form = useForm({
    resolver: zodResolver(userUpdateSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });

  const { update: updateUser, isUpdating } = useUserActions();
  const isSubmitting = isUpdating;
  const formErrors = form.formState.errors;

  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  // Create form schema (without branchAssignments custom section content)
  const formSchema = useMemo(
    () => createUserFormSchema({ user }),
    [user]
  );

  // Filter out the custom branchAssignments section for FormGenerator
  const filteredSchema = useMemo(() => ({
    ...formSchema,
    sections: formSchema.sections.filter(s => !s.customRender),
  }), [formSchema]);

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        // Clean up the data
        const cleanData = {
          name: data.name,
          email: data.email,
          roles: data.roles,
          isActive: data.isActive,
        };

        // Clean up branches - only include valid assignments
        if (data.branches && Array.isArray(data.branches)) {
          const cleanedBranches = data.branches
            .filter((b) => b.branchId) // Only include if branch is selected
            .map((b) => ({
              branchId: b.branchId,
              roles: b.roles || [],
              isPrimary: b.isPrimary || false,
            }));

          if (cleanedBranches.length > 0) {
            cleanData.branches = cleanedBranches;
          }
        }

        await updateUser({ token, id: user._id, data: cleanData });
        onSuccess?.();
      } catch (error) {
        console.error(error);
        // Toast is handled by the mutation factory
      }
    },
    [updateUser, token, user?._id, onSuccess]
  );

  const handleFormError = useCallback(() => {
    toast.error("Please fix the validation errors before submitting");
  }, []);

  return (
    <FormProvider {...form}>
      <form id={formId} onSubmit={form.handleSubmit(handleSubmitForm, handleFormError)} className="space-y-6">
        <FormGenerator schema={filteredSchema} control={form.control} disabled={isSubmitting} />

        {/* Custom Branch Assignments Section */}
        <div className="space-y-4 pt-2">
          <BranchAssignmentManager token={token} disabled={isSubmitting} />
        </div>

        <FormErrorSummary errors={formErrors} />
      </form>
    </FormProvider>
  );
}
