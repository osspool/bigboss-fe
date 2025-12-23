"use client";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { transactionCreateSchema, transactionUpdateSchema } from "@/schemas/transaction.schema";
import { FormGenerator } from "@/components/form/form-system";
import { FormErrorSummary } from "@/components/form/form-utils/FormErrorSummary";
import { createTransactionFormSchema } from "./transaction-form-schema";
import {
  LIBRARY_CATEGORY_VALUES,
  TRANSACTION_STATUS,
} from "@/constants/enums/monetization.enum";
import { useTransactionActions } from "@/hooks/query/useTransactions";
import { useNotifySubmitState } from "@/hooks/use-form-submit-state";

export function TransactionForm({
  token,
  transaction = null,
  onSuccess,
  onCancel,
  onSubmitStateChange,
  formId = "transaction-sheet-form",
}) {
  const isEdit = !!transaction;

  // Prefer transaction currency, fall back to platform default (BDT)
  const currency = useMemo(
    () => transaction?.currency || transaction?.metadata?.currency || "BDT",
    [transaction]
  );

  // Determine if transaction is library-managed
  const isLibraryManaged = useMemo(
    () => transaction && LIBRARY_CATEGORY_VALUES.includes(transaction.category),
    [transaction]
  );

  // Determine if transaction is verified
  const isVerified = useMemo(
    () => transaction && (
      transaction.status === TRANSACTION_STATUS.VERIFIED ||
      transaction.status === TRANSACTION_STATUS.COMPLETED ||
      !!transaction.verifiedAt
    ),
    [transaction]
  );

  // Calculate which fields are editable based on API guide rules
  const editableFields = useMemo(() => {
    return {
      type: false,
      category: false,
      amount: false,
      method: false,
      reference: false,
      paymentDetails: false,
      notes: true,
      transactionDate: false,
      description: false,
      advanced: false,
      status: false,
    };
  }, [isEdit, isLibraryManaged, isVerified, transaction?.status]);

  const defaultValues = useMemo(
    () => ({
      referenceId: transaction?.referenceId || "",
      referenceModel: transaction?.referenceModel || undefined,
      customerId: transaction?.customerId || "",
      appointmentId: transaction?.appointmentId || "",
      type: transaction?.type || undefined,
      category: transaction?.category || undefined,
      status: transaction?.status || undefined,
      amount: transaction?.amount ?? 0,
      method: transaction?.method || "cash",
      currency,
      paymentDetails: {
        walletNumber: transaction?.paymentDetails?.walletNumber || "",
        walletType: transaction?.paymentDetails?.walletType || "",
        bankName: transaction?.paymentDetails?.bankName || "",
        accountNumber: transaction?.paymentDetails?.accountNumber || "",
        accountName: transaction?.paymentDetails?.accountName || "",
        proofUrl: transaction?.paymentDetails?.proofUrl || "",
      },
      reference: transaction?.reference || "",
      notes: transaction?.notes || "",
      description: transaction?.description || "",
      transactionDate: transaction?.date || transaction?.transactionDate || undefined,
    }),
    [transaction]
  );

  const form = useForm({
    resolver: zodResolver(isEdit ? transactionUpdateSchema : transactionCreateSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues,
  });

  // Keep form values in sync when switching between transactions
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const { update: updateTransaction, isUpdating } = useTransactionActions();
  const isSubmitting = isUpdating;
  const formErrors = form.formState.errors;

  useNotifySubmitState(isSubmitting, onSubmitStateChange);

  // Create form schema with current state
  const formSchema = useMemo(
    () => createTransactionFormSchema({
      isEdit,
      transaction,
      editableFields,
      isLibraryManaged,
      isVerified,
      currency,
    }),
    [isEdit, transaction, editableFields, isLibraryManaged, isVerified, currency]
  );

  const handleSubmitForm = useCallback(
    async (data) => {
      try {
        if (isEdit) {
          // Update: only send editable fields
          const updateData = {
            ...(editableFields.notes && data.notes !== undefined && { notes: data.notes }),
          };

          await updateTransaction({ token, id: transaction._id, data: updateData });
          toast.success("Transaction updated successfully");
        } else {
          toast.error("Transactions are system-managed and cannot be created manually.");
        }
        onSuccess?.();
      } catch (error) {
        console.error(error);
        toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} transaction`);
      }
    },
    [isEdit, updateTransaction, token, transaction?._id, onSuccess, editableFields]
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
