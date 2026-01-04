"use client";

import { useAnalyticsDashboard } from "@/hooks/query";
import {
  Users,
  TrendingUp,
  DollarSign,
  CreditCard,
  AlertCircle,
  ShoppingCart,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function DashboardUi({ token }) {
  const { data, isLoading, error } = useAnalyticsDashboard(token, { period: '30d' });

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load analytics data. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  // Hook's select already unwraps response.data
  const analytics = data || {};
  const { summary, today, revenue, period, orders } = analytics;

  // Helper to format currency (convert pence to pounds)
  const formatCurrency = (pence) => {
    if (!pence && pence !== 0) return '৳0.00';
    return `৳${(pence / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={summary?.totalCustomers || 0}
            icon={Users}
            description="All registered customers"
          />
          <StatCard
            title="Total Orders"
            value={summary?.totalOrders || 0}
            icon={ShoppingCart}
            description="All time orders"
          />
          <StatCard
            title="Total Revenue"
            value={formatCurrency(summary?.totalRevenue)}
            icon={DollarSign}
            description="Lifetime revenue"
            variant="success"
          />
          <StatCard
            title="Average Order Value"
            value={summary?.averageOrderValue}
            icon={TrendingUp}
            description="Per order average"
            variant="success"
          />
        </div>
      </div>

      {/* Today's Stats */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Today</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="New Customers"
            value={today?.newCustomers || 0}
            icon={Users}
            description="Registered today"
          />
          <StatCard
            title="New Orders"
            value={today?.newOrders || 0}
            icon={ShoppingCart}
            description="Orders placed today"
          />
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(today?.revenue)}
            icon={DollarSign}
            description="Revenue earned today"
            variant="success"
          />
        </div>
      </div>

      {/* Period Stats (30 days) */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Last {period?.days || 30} Days</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Period Orders"
            value={period?.orders || 0}
            icon={Package}
            description={`Orders in last ${period?.days || 30} days`}
          />
          <StatCard
            title="Period Revenue"
            value={formatCurrency(period?.revenue)}
            icon={CreditCard}
            description={`Revenue in last ${period?.days || 30} days`}
            variant="success"
          />
        </div>
      </div>

      {/* Order Status */}
      {orders?.byStatus && Object.keys(orders.byStatus).length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Order Status</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard
              title="Pending"
              value={orders.byStatus.pending || 0}
              icon={Clock}
              description="Awaiting processing"
              variant="warning"
            />
            <StatCard
              title="Processing"
              value={orders.byStatus.processing || 0}
              icon={Package}
              description="Being prepared"
            />
            <StatCard
              title="Confirmed"
              value={orders.byStatus.confirmed || 0}
              icon={CheckCircle}
              description="Order confirmed"
            />
            <StatCard
              title="Shipped"
              value={orders.byStatus.shipped || 0}
              icon={Truck}
              description="In transit"
            />
            <StatCard
              title="Delivered"
              value={orders.byStatus.delivered || 0}
              icon={CheckCircle}
              description="Successfully delivered"
              variant="success"
            />
            <StatCard
              title="Cancelled"
              value={orders.byStatus.cancelled || 0}
              icon={XCircle}
              description="Cancelled orders"
              variant="warning"
            />
          </div>
        </div>
      )}

      {/* Revenue Breakdown */}
      {revenue?.byCategory && revenue.byCategory.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Revenue by Category</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {revenue.byCategory.map((category) => (
              <StatCard
                key={category._id}
                title={category._id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                value={formatCurrency(category.total)}
                icon={TrendingUp}
                description={`${category.count} transactions`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, description, variant = "default" }) {
  const variantStyles = {
    default: "bg-card border-border",
    success: "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900",
    warning: "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-900",
  };

  const iconStyles = {
    default: "text-primary",
    success: "text-green-600 dark:text-green-400",
    warning: "text-yellow-600 dark:text-yellow-400",
  };

  return (
    <div className={`rounded-xl border p-6 ${variantStyles[variant]}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <Icon className={`h-5 w-5 ${iconStyles[variant]}`} />
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold">{value}</p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-5 rounded" />
              </div>
              <Skeleton className="h-8 w-20 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


