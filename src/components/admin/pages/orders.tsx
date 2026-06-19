"use client";

import { useState, useMemo } from "react";
import {
  Search, MoreHorizontal, Eye, Truck, X, Package, Clock, CheckCircle2, XCircle,
  ChevronLeft, ChevronRight, MapPin, Phone, User, StickyNote, CreditCard, AlertCircle, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { ORDERS } from "@/lib/mock-data";
import { formatBdt, formatDateTime, timeAgo } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { ORDER_STATUS_BADGES, PAYMENT_STATUS_BADGES, ORDER_TRANSITIONS } from "../badges";
import type { Order, OrderStatus } from "@/lib/types";

const PAGE_SIZE = 8;

export function AdminOrders() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [page, setPage] = useState(1);

  const [orders, setOrders] = useState<Order[]>(ORDERS);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [statusUpdateOrder, setStatusUpdateOrder] = useState<Order | null>(null);

  // Filter
  const filtered = useMemo(() => {
    let result = orders;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q),
      );
    }
    if (statusFilter !== "ALL") {
      result = result.filter((o) => o.status === statusFilter);
    }
    return [...result].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleStatusUpdate(order: Order, newStatus: OrderStatus, tracking?: string, courier?: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              status: newStatus,
              trackingNumber: tracking ?? o.trackingNumber,
              courierName: courier ?? o.courierName,
              shippedAt: newStatus === "SHIPPED" ? new Date().toISOString() : o.shippedAt,
              deliveredAt: newStatus === "COMPLETED" ? new Date().toISOString() : o.deliveredAt,
              cancelledAt: newStatus === "CANCELLED" ? new Date().toISOString() : o.cancelledAt,
              paymentStatus: newStatus === "COMPLETED" ? "PAID" : newStatus === "CANCELLED" ? "UNPAID" : o.paymentStatus,
              updatedAt: new Date().toISOString(),
            }
          : o,
      ),
    );
    setStatusUpdateOrder(null);
    toast({
      title: "Order status updated",
      description: `${order.orderNumber} → ${newStatus}`,
    });
  }

  return (
    <div className="space-y-4">
      {/* ====================================================== TOOLBAR */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search order #, name, phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PROCESSING">Processing</SelectItem>
                <SelectItem value="SHIPPED">Shipped</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="secondary">
            {filtered.length} of {orders.length}
          </Badge>
        </CardContent>
      </Card>

      {/* ====================================================== TABLE */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Order #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="w-12 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-12 text-center">
                      <Package className="mx-auto h-10 w-10 text-muted-foreground" />
                      <p className="mt-2 text-sm font-medium">No orders found</p>
                      <p className="text-xs text-muted-foreground">Try adjusting your filters</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((order) => {
                    const statusBadge = ORDER_STATUS_BADGES[order.status];
                    const paymentBadge = PAYMENT_STATUS_BADGES[order.paymentStatus];
                    return (
                      <TableRow key={order.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="font-mono text-sm font-semibold text-foreground">{order.orderNumber}</div>
                          <div className="text-[10px] text-muted-foreground">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-foreground">{order.customerName}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{order.customerPhone}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex -space-x-2">
                            {order.items.slice(0, 3).map((item, i) => (
                              <img
                                key={item.id}
                                src={item.productImage || ""}
                                alt={item.productName}
                                className="h-8 w-8 rounded-full border-2 border-card object-cover"
                                style={{ zIndex: 3 - i }}
                              />
                            ))}
                            {order.items.length > 3 && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm font-bold text-primary">{formatBdt(order.totalBdt)}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={paymentBadge.className}>{paymentBadge.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={statusBadge.className}>{statusBadge.label}</Badge>
                        </TableCell>
                        <TableCell className="hidden text-xs text-muted-foreground lg:table-cell">
                          {timeAgo(order.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setViewingOrder(order)}>
                                <Eye className="mr-2 h-4 w-4" /> View details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Update status</DropdownMenuLabel>
                              {ORDER_TRANSITIONS[order.status].length === 0 ? (
                                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                                  No transitions available (terminal state)
                                </div>
                              ) : (
                                ORDER_TRANSITIONS[order.status].map((nextStatus) => (
                                  <DropdownMenuItem
                                    key={nextStatus}
                                    onClick={() => setStatusUpdateOrder({ ...order, status: nextStatus })}
                                  >
                                    <StatusIcon status={nextStatus} />
                                    Move to {ORDER_STATUS_BADGES[nextStatus].label}
                                  </DropdownMenuItem>
                                ))
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t px-4 py-3">
            <div className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2 text-xs">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====================================================== VIEW MODAL */}
      <Dialog open={!!viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span>Order Details</span>
              {viewingOrder && (
                <Badge variant="outline" className={ORDER_STATUS_BADGES[viewingOrder.status].className}>
                  {ORDER_STATUS_BADGES[viewingOrder.status].label}
                </Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {viewingOrder && (
                <span className="font-mono text-xs">{viewingOrder.orderNumber} · Placed {formatDateTime(viewingOrder.createdAt)}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          {viewingOrder && (
            <div className="space-y-4">
              {/* Customer info */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border bg-muted/20 p-3">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /> {viewingOrder.customerName}</div>
                    <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> <span className="font-mono">{viewingOrder.customerPhone}</span></div>
                    {viewingOrder.customerEmail && (
                      <div className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5 text-muted-foreground" /> {viewingOrder.customerEmail}</div>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/20 p-3">
                  <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Delivery</div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" /> <span>{viewingOrder.shippingAddress}</span></div>
                    {viewingOrder.note && (
                      <div className="flex items-start gap-2"><StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" /> <span className="italic">&ldquo;{viewingOrder.note}&rdquo;</span></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tracking (if shipped) */}
              {(viewingOrder.trackingNumber || viewingOrder.courierName) && (
                <div className="rounded-lg border bg-purple-50 p-3">
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-purple-700">Tracking</div>
                  <div className="text-sm">
                    {viewingOrder.courierName && <span>Courier: <span className="font-medium">{viewingOrder.courierName}</span></span>}
                    {viewingOrder.trackingNumber && <span className="ml-3">Tracking #: <span className="font-mono font-medium">{viewingOrder.trackingNumber}</span></span>}
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="rounded-lg border">
                <div className="border-b bg-muted/30 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Items ({viewingOrder.items.length})
                </div>
                <div className="divide-y">
                  {viewingOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3">
                      <img src={item.productImage || ""} alt={item.productName} className="h-12 w-12 shrink-0 rounded-md border object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">{item.productName}</div>
                        <div className="text-xs text-muted-foreground">{formatBdt(item.unitPriceBdt)} × {item.quantity}</div>
                      </div>
                      <div className="font-mono text-sm font-semibold">{formatBdt(item.lineTotalBdt)}</div>
                    </div>
                  ))}
                </div>
                <div className="border-t bg-muted/20 p-3">
                  <div className="ml-auto max-w-[200px] space-y-1 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span><span className="font-mono">{formatBdt(viewingOrder.subtotalBdt)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span><span className="font-mono">{formatBdt(viewingOrder.shippingCostBdt)}</span>
                    </div>
                    {viewingOrder.discountBdt > 0 && (
                      <div className="flex justify-between text-emerald-600">
                        <span>Discount</span><span className="font-mono">−{formatBdt(viewingOrder.discountBdt)}</span>
                      </div>
                    )}
                    <Separator className="my-1" />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span><span className="font-mono text-primary">{formatBdt(viewingOrder.totalBdt)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payment</div>
                  <div className="text-sm font-medium capitalize">{viewingOrder.paymentMethod.replace(/_/g, " ").toLowerCase()}</div>
                </div>
                <Badge variant="outline" className={PAYMENT_STATUS_BADGES[viewingOrder.paymentStatus].className}>
                  {PAYMENT_STATUS_BADGES[viewingOrder.paymentStatus].label}
                </Badge>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingOrder(null)}>Close</Button>
            {viewingOrder && ORDER_TRANSITIONS[viewingOrder.status].length > 0 && (
              <Button onClick={() => { setStatusUpdateOrder({ ...viewingOrder, status: ORDER_TRANSITIONS[viewingOrder.status][0] }); setViewingOrder(null); }}>
                Update Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ====================================================== STATUS UPDATE MODAL */}
      {statusUpdateOrder && (
        <StatusUpdateDialog
          key={`status-${statusUpdateOrder.id}-${statusUpdateOrder.status}`}
          order={statusUpdateOrder}
          onOpenChange={(open) => !open && setStatusUpdateOrder(null)}
          onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Status Icon helper
// -----------------------------------------------------------------------------

function StatusIcon({ status }: { status: OrderStatus }) {
  const map = {
    PENDING: Clock,
    PROCESSING: Package,
    SHIPPED: Truck,
    COMPLETED: CheckCircle2,
    CANCELLED: XCircle,
  } as const;
  const Icon = map[status];
  return <Icon className="mr-2 h-4 w-4" />;
}

// -----------------------------------------------------------------------------
// Status Update Dialog
// -----------------------------------------------------------------------------

interface StatusUpdateDialogProps {
  order: Order | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (order: Order, newStatus: OrderStatus, tracking?: string, courier?: string) => void;
}

function StatusUpdateDialog({ order, onOpenChange, onUpdate }: StatusUpdateDialogProps) {
  const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber ?? "");
  const [courierName, setCourierName] = useState(order?.courierName ?? "Steadfast");
  const [note, setNote] = useState("");

  if (!order) return null;

  // The new status is on `order.status` (we set it in the parent before opening)
  // But we need to find the *previous* status — for display we just show the target.
  const targetStatus = order.status;
  const requiresTracking = targetStatus === "SHIPPED";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (requiresTracking && !trackingNumber.trim()) {
      return;
    }
    // Find the original order to revert status — for simplicity, we pass the order with targetStatus set
    onUpdate(order!, targetStatus, trackingNumber.trim() || undefined, courierName.trim() || undefined);
  }

  return (
    <Dialog open={!!order} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-primary" />
            Update Order Status
          </DialogTitle>
          <DialogDescription>
            Order <span className="font-mono font-semibold text-foreground">{order.orderNumber}</span>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border bg-muted/20 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">New status</div>
            <div className="mt-1 flex items-center gap-2">
              <StatusIcon status={targetStatus} />
              <Badge variant="outline" className={ORDER_STATUS_BADGES[targetStatus].className}>
                {ORDER_STATUS_BADGES[targetStatus].label}
              </Badge>
            </div>
          </div>

          {requiresTracking && (
            <>
              <div className="grid gap-1.5">
                <Label htmlFor="tracking">Tracking Number <span className="text-destructive">*</span></Label>
                <Input
                  id="tracking"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. SF123456789"
                  required
                  className="font-mono"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="courier">Courier</Label>
                <Select value={courierName} onValueChange={setCourierName}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Steadfast">Steadfast</SelectItem>
                    <SelectItem value="Pathao">Pathao Courier</SelectItem>
                    <SelectItem value="RedX">RedX</SelectItem>
                    <SelectItem value="Sundarban">Sundarban Courier</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {targetStatus === "CANCELLED" && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
              Cancelling will return all {order.items.length} item{order.items.length !== 1 ? "s" : ""} to inventory.
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal note about this status change..."
              className="min-h-[60px]"
              maxLength={500}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" /> Confirm Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
