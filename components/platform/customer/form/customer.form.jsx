"use client";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { customerCreateSchema, customerUpdateSchema } from "@/schemas/customer.schema";
import { FormGenerator } from "@/components/form/form-system";
import { FormErrorSummary } from "@/components/form/form-utils/FormErrorSummary";
import { createCustomerFormSchema } from "./customer-form-schema";
import { useCustomerActions } from "@/hooks/query/useCustomers";

export function CustomerForm({
  token,
  customer = null,
  onSuccess,
  onCancel,
  formId = "customer-sheet-form",
}) {
  const isEdit = !!customer;

  const defaultValues = useMemo(
    () => ({
      name: customer?.name || "",
      phone: customer?.phone || "",
      email: customer?.email || "",
      dateOfBirth: customer?.dateOfBirth || undefined,
      gender: customer?.gender || "",
      addresses: customer?.addresses || [],
    }),
    [customer]
  );

  const form = useForm({
    resolver: zodResolver(isEdit ? customerUpdateSchema : customerCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });

  const { create: createCustomer, update: updateCustomer, isCreating, isUpdating } =
    useCustomerActions();
  const isSubmitting = isCreating || isUpdating;
  const formErrors = form.formState.errors;

  // Create form schema
  const formSchema = useMemo(
    () => createCustomerFormSchema({
      isEdit,
      customer,
    }),
    [isEdit, customer]
  );

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        // Clean up empty strings and undefined values
        const cleanData = {
          name: data.name,
          phone: data.phone,
          ...(data.email && { email: data.email }),
          ...(data.dateOfBirth && { dateOfBirth: data.dateOfBirth }),
          ...(data.gender && { gender: data.gender }),
        };

        // Clean up addresses array - only include complete addresses
        if (data.addresses && Array.isArray(data.addresses)) {
          const cleanedAddresses = data.addresses
            .filter((addr) => {
              // Only include addresses with required fields
              return addr.label && addr.addressLine1 && addr.city && addr.postalCode && addr.phone;
            })
            .map((addr) => ({
              ...(addr._id && { _id: addr._id }), // Include _id if editing existing address
              label: addr.label,
              addressLine1: addr.addressLine1,
              ...(addr.addressLine2 && { addressLine2: addr.addressLine2 }),
              city: addr.city,
              ...(addr.state && { state: addr.state }),
              postalCode: addr.postalCode,
              country: addr.country || "Bangladesh",
              phone: addr.phone,
              isDefault: addr.isDefault || false,
            }));

          if (cleanedAddresses.length > 0) {
            cleanData.addresses = cleanedAddresses;
          }
        }

        if (isEdit) {
          await updateCustomer({ token, id: customer._id, data: cleanData });
        } else {
          await createCustomer({ token, data: cleanData });
        }
        onSuccess?.();
      } catch (error) {
        console.error(error);
        // Toast is handled by the mutation factory
      }
    },
    [isEdit, updateCustomer, createCustomer, token, customer?._id, onSuccess]
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
