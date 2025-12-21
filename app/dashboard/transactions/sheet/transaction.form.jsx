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
    if (!isEdit) {
      // Creating new transaction - all manual fields allowed
      return {
        type: true,
        category: true,
        amount: true,
        method: true,
        reference: true,
        paymentDetails: true,
        notes: true,
        transactionDate: true,
        description: true,
        advanced: true,
      };
    }

    if (isLibraryManaged) {
      // Library-managed transaction (subscription, enrollment, refund, HRM)
      // Per API guide: Only notes allowed (status managed by webhooks)
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
        status: false, // Status managed by webhooks only
      };
    } else {
      // Manual transaction (rent, utilities, equipment, etc.)
      if (transaction.status === TRANSACTION_STATUS.PENDING) {
        // Pending: status, amount, method, reference, paymentDetails, notes, transactionDate
        return {
          type: false, // Type immutable after creation
          category: false, // Category immutable after creation
          amount: true,
          method: true,
          reference: true,
          paymentDetails: true,
          notes: true,
          transactionDate: true,
          description: true,
          advanced: false, // Advanced fields (referenceId, etc.) immutable
          status: true, // Can update status for manual transactions
        };
      } else {
        // Verified/completed: status, notes, reference, paymentDetails
        return {
          type: false,
          category: false,
          amount: false,
          method: false,
          reference: true,
          paymentDetails: true,
          notes: true,
          transactionDate: false,
          description: false,
          advanced: false,
          status: true, // Can update status for manual transactions
        };
      }
    }
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
        provider: transaction?.paymentDetails?.provider || "",
        trxId: transaction?.paymentDetails?.trxId || "",
        bankName: transaction?.paymentDetails?.bankName || "",
        accountNumber: transaction?.paymentDetails?.accountNumber || "",
        accountName: transaction?.paymentDetails?.accountName || "",
        proofUrl: transaction?.paymentDetails?.proofUrl || "",
      },
      reference: transaction?.reference || "",
      notes: transaction?.notes || "",
      description: transaction?.description || "",
      transactionDate: transaction?.transactionDate || undefined,
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

  const { create: createTransaction, update: updateTransaction, isCreating, isUpdating } =
    useTransactionActions();
  const isSubmitting = isCreating || isUpdating;
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
        // Normalize paymentDetails based on method to match backend schema
        let paymentDetails = undefined;
        if (data.method && data.method !== "cash" && data.method !== "card") {
          const src = data.paymentDetails || {};

          if (data.method === "bank") {
            paymentDetails = {
              bankName: src.bankName || undefined,
              accountNumber: src.accountNumber || undefined,
              accountName: src.accountName || undefined,
              proofUrl: src.proofUrl || undefined,
            };
          } else if (data.method === "online") {
            paymentDetails = {
              provider: src.provider || undefined,
              trxId: src.trxId || undefined,
              proofUrl: src.proofUrl || undefined,
            };
          } else if (data.method === "manual") {
            paymentDetails = {
              provider: src.provider || undefined,
              proofUrl: src.proofUrl || undefined,
            };
          }
        }

        if (isEdit) {
          // Update: only send editable fields
          const updateData = {
            ...(editableFields.status && data.status && { status: data.status }),
            ...(editableFields.amount && data.amount !== undefined && { amount: Number(data.amount) }),
            ...(editableFields.method && data.method && { method: data.method }),
            ...(editableFields.reference && data.reference !== undefined && { reference: data.reference }),
            ...(editableFields.paymentDetails && paymentDetails !== undefined && { paymentDetails }),
            ...(editableFields.notes && data.notes !== undefined && { notes: data.notes }),
            ...(editableFields.description && data.description && { description: data.description }),
            ...(editableFields.transactionDate && data.transactionDate && { transactionDate: data.transactionDate }),
          };

          await updateTransaction({ token, id: transaction._id, data: updateData });
          toast.success("Transaction updated successfully");
        } else {
          // Create: send all required fields
          const createData = {
            type: data.type,
            category: data.category,
            amount: Number(data.amount) || 0,
            method: data.method,
            currency,
            status: data.status || undefined,
            reference: data.reference || undefined,
            paymentDetails,
            notes: data.notes || undefined,
            description: data.description || undefined,
            transactionDate: data.transactionDate || undefined,
            customerId: data.customerId || undefined,
            appointmentId: data.appointmentId || undefined,
            referenceId: data.referenceId || undefined,
            referenceModel: data.referenceModel || undefined,
          };

          await createTransaction({ token, data: createData });
          toast.success("Transaction created successfully");
        }
        onSuccess?.();
      } catch (error) {
        console.error(error);
        toast.error(error.message || `Failed to ${isEdit ? "update" : "create"} transaction`);
      }
    },
    [isEdit, updateTransaction, createTransaction, token, transaction?._id, onSuccess, editableFields]
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
