"use client";
import { useMemo, useState, useCallback } from "react";
import { TransactionSheet } from "./sheet/transaction-sheet";
import { DataTable } from "@/components/custom/ui/data-table";
import { useRouter, useSearchParams } from "next/navigation";
import { TransactionSearch } from "./TransactionSearch";
import { transactionsColumns } from "./transactions-columns";
import { Wallet } from "lucide-react";
import HeaderSection from "@/components/custom/dashboard/header-section";
import ErrorBoundaryWrapper from "@/components/custom/error/error-boundary-wrapper";
import { useTransactions, useTransactionActions } from "@/hooks/query/useTransactions";
import { UserRole } from "@/api/user-data";


export function TransactionsClient({ token, userRoles = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // Check if user has superadmin role
  const isSuperAdmin = userRoles?.includes(UserRole.SUPER_ADMIN);

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

  const { remove: deleteTransaction } = useTransactionActions();

  const handleDelete = useCallback(
    async (item) => {
      const confirmed = window.confirm(
        `Delete transaction ${item?._id?.slice(-8) ?? ""}? This action cannot be undone.`
      );
      if (!confirmed) return;

      try {
        await deleteTransaction({ token, id: item._id });
      } catch (error) {
        console.error(error);
      }
    },
    [deleteTransaction, token]
  );

  const handleEdit = useCallback((item) => {
    setSelected(item);
    setOpen(true);
  }, []);
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
    () => transactionsColumns(handleEdit, isSuperAdmin ? handleDelete : null),
    [handleEdit, handleDelete, isSuperAdmin]
  );

  return (
    <div className="flex flex-col gap-2">
      <HeaderSection
        icon={Wallet}
        title="Transactions"
        variant="compact"
        description="Review transaction history (system-managed)"
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
