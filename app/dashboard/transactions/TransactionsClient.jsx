"use client";
import { useMemo, useState, useCallback } from "react";
import { TransactionSheet } from "./sheet/transaction-sheet";
import { DataTable } from "@/components/custom/ui/data-table";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionSearch } from "./TransactionSearch";
import { transactionsColumns } from "./transactions-columns";
import { Plus, Wallet } from "lucide-react";
import HeaderSection from "@/components/custom/dashboard/header-section";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { useTransactionActions, useTransactions } from "@/hooks/query/useTransactions";


export function TransactionsClient({ token, userRoles = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Check if user can delete (admin or superadmin)
  const canDelete = useMemo(() => {
    return userRoles.includes('admin') || userRoles.includes('superadmin');
  }, [userRoles]);

  // Reset selected when sheet closes
  const handleOpenChange = useCallback((isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelected(null);
    }
  }, []);

  const currentPage = Number(searchParams.get("page")) || 1;

  const apiParams = useMemo(() => {
    const params = Object.fromEntries(searchParams.entries());
    return {
      page: currentPage,
      limit: 15,
      ...params,
    };
  }, [searchParams, currentPage]);

  const {
    items: transactions = [],
    pagination,
    isLoading,
  } = useTransactions(token, apiParams, { public: false });
  const { remove: deleteTransaction, isDeleting } = useTransactionActions();

  const handleEdit = useCallback((item) => {
    setSelected(item);
    setOpen(true);
  }, []);
  const handleDelete = useCallback(
    async (item) => {
      if (confirm("Delete transaction?"))
        await deleteTransaction({ token, id: item._id });
    },
    [deleteTransaction, token]
  );
  const handlePageChange = useCallback(
    (page) => {
      const params = new URLSearchParams(searchParams);
      params.set("page", String(page));
      router.push(`/dashboard/finance/transactions?${params.toString()}`, {
        scroll: false,
      });
    },
    [router, searchParams]
  );

  const columns = useMemo(
    () => transactionsColumns(handleEdit, canDelete ? handleDelete : null),
    [handleEdit, handleDelete, canDelete]
  );

  return (
    <div className="flex flex-col gap-2">
      <HeaderSection
        icon={Wallet}
        title="Transactions"
        variant="compact"
        description="Manage your transactions"
        actions={[
          {
            icon: Plus,
            text: "Add Transaction",
            size: "sm",
            onClick: () => setOpen(true),
          },
        ]}
      />
      <div className="py-4">
        <TransactionSearch />
      </div>

      <ErrorBoundaryWrapper>
        <DataTable
          columns={columns}
          data={transactions}
          isLoading={isLoading}
          pagination={{
            total: pagination?.total || 0,
            limit: pagination?.limit || 15,
            page: pagination?.page || currentPage,
            pages: pagination?.pages || 1,
            hasNext: pagination?.hasNext || false,
            hasPrev: pagination?.hasPrev || false,
            onPageChange: handlePageChange,
          }}
          className="h-[74dvh] rounded-lg"
        />
      </ErrorBoundaryWrapper>
      
      <TransactionSheet
        token={token}
        open={open}
        onOpenChange={handleOpenChange}
        transaction={selected}
      />
    </div>
  );
}
