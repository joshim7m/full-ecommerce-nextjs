"use client";

import {
  TrendingUp, ShoppingCart, Package, Users, Tag, CircleDollarSign,
  ArrowUpRight, ArrowDownRight, Clock, Truck, CheckCircle2, XCircle, AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { getOrderStats, ORDERS, PRODUCTS } from "@/lib/mock-data";
import { formatBdt, formatBdtCompact, timeAgo } from "@/lib/format";
import { ORDER_STATUS_BADGES } from "../badges";

const ORDER_STATUS_ICONS = {
  PENDING: { icon: Clock, color: "text-amber-600 bg-amber-100" },
  PROCESSING: { icon: Package, color: "text-blue-600 bg-blue-100" },
  SHIPPED: { icon: Truck, color: "text-purple-600 bg-purple-100" },
  COMPLETED: { icon: CheckCircle2, color: "text-emerald-600 bg-emerald-100" },
  CANCELLED: { icon: XCircle, color: "text-rose-600 bg-rose-100" },
} as const;

export function AdminDashboard() {
  const router = useRouter();
  const stats = getOrderStats();
  const recentOrders = [...ORDERS].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  const lowStockProducts = PRODUCTS.filter((p) => p.stock <= p.lowStockThreshold).slice(0, 5);
  const topProducts = [...PRODUCTS].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* ====================================================== STAT CARDS */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={CircleDollarSign}
          label="Total Revenue"
          value={formatBdt(stats.totalRevenueBdt)}
          delta="+12.5%"
          deltaUp
          accent="emerald"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={String(stats.total)}
          delta="+8.2%"
          deltaUp
          accent="blue"
          onClick={() => router.push("/admin/orders")}
        />
        <StatCard
          icon={Package}
          label="Total Products"
          value={String(stats.totalProducts)}
          delta="+3"
          deltaUp
          accent="amber"
          onClick={() => router.push("/admin/products")}
        />
        <StatCard
          icon={Users}
          label="Total Users"
          value={String(stats.totalUsers)}
          delta="+2.1%"
          deltaUp
          accent="rose"
        />
      </div>

      {/* ====================================================== ORDER STATUS BREAKDOWN */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Orders by Status</CardTitle>
          <CardDescription>Current fulfillment pipeline</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {(["PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELLED"] as const).map((status) => {
              const count = (stats as unknown as Record<string, number>)[status.toLowerCase()];
              const config = ORDER_STATUS_ICONS[status];
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <button
                  key={status}
                  onClick={() => router.push("/admin/orders")}
                  className="flex flex-col gap-2 rounded-lg border bg-card p-3 text-left transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-md ${config.color}`}>
                      <config.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xl font-bold">{count}</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{status}</div>
                    <Progress value={pct} className="mt-1.5 h-1.5" />
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ====================================================== TWO-COLUMN: Recent Orders + Top Products */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Recent Orders</CardTitle>
                <CardDescription>Latest customer purchases</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/admin/orders")}>
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {recentOrders.map((order) => {
              const badge = ORDER_STATUS_BADGES[order.status];
              return (
                <div
                  key={order.id}
                  className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-shadow hover:shadow-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">{order.orderNumber}</span>
                      <Badge variant="outline" className={badge.className}>
                        {order.status}
                      </Badge>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {order.customerName} · {order.customerPhone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-primary">{formatBdt(order.totalBdt)}</div>
                    <div className="text-[10px] text-muted-foreground">{timeAgo(order.createdAt)}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Top Selling Products</CardTitle>
                <CardDescription>By sales count</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => router.push("/admin/products")}>
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {topProducts.map((product, idx) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-lg border bg-card p-3"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-foreground">
                  #{idx + 1}
                </div>
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-10 w-10 shrink-0 rounded-md border object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-foreground">{product.name}</div>
                  <div className="text-xs text-muted-foreground">{product.salesCount} sold</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-sm font-semibold text-primary">{formatBdt(product.priceBdt)}</div>
                  <div className="text-[10px] text-muted-foreground">{product.stock} in stock</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* ====================================================== LOW STOCK ALERT */}
      {lowStockProducts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <CardTitle className="text-base text-amber-900">Low Stock Alert</CardTitle>
              <Badge variant="secondary" className="bg-amber-200 text-amber-900 hover:bg-amber-200">
                {lowStockProducts.length} product{lowStockProducts.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <CardDescription className="text-amber-700">
              These products are running low and may need restocking soon.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-amber-200 bg-card p-3">
                  <img src={p.images[0]} alt={p.name} className="h-10 w-10 shrink-0 rounded-md border object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-xs font-medium text-foreground">{p.name}</div>
                    <div className="font-mono text-xs text-amber-700">Stock: {p.stock} (min: {p.lowStockThreshold})</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ====================================================== SUMMARY STRIP */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat icon={Tag} label="Categories" value={String(stats.totalCategories)} />
        <MiniStat icon={Clock} label="Orders Today" value={String(stats.totalOrdersToday)} />
        <MiniStat icon={CircleDollarSign} label="Avg Order Value" value={formatBdtCompact(stats.averageOrderValueBdt)} />
        <MiniStat icon={AlertTriangle} label="Low Stock Items" value={String(stats.lowStockProducts)} />
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaUp,
  accent,
  onClick,
}: {
  icon: typeof Package;
  label: string;
  value: string;
  delta?: string;
  deltaUp?: boolean;
  accent: "emerald" | "blue" | "amber" | "rose";
  onClick?: () => void;
}) {
  const accentMap = {
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };
  return (
    <Card
      className={`border-border/60 ${onClick ? "cursor-pointer transition-shadow hover:shadow-md" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${accentMap[accent]}`}>
            <Icon className="h-5 w-5" />
          </div>
          {delta && (
            <div className={`flex items-center gap-0.5 text-xs font-semibold ${deltaUp ? "text-emerald-600" : "text-rose-600"}`}>
              {deltaUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {delta}
            </div>
          )}
        </div>
        <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) {
  return (
    <Card className="border-border/60">
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <div className="text-lg font-bold leading-tight text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}
