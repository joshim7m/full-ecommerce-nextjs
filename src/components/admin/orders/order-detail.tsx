"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, MapPin, Phone, User, StickyNote, CreditCard, Truck, Clock, CheckCircle2, XCircle, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { ORDERS } from "@/lib/mock-data";
import { formatBdt, formatDateTime } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { ORDER_STATUS_BADGES, PAYMENT_STATUS_BADGES, ORDER_TRANSITIONS } from "../badges";
import type { Order, OrderStatus } from "@/lib/types";

function StatusIcon({ status }: { status: OrderStatus }) {
  const map = { PENDING: Clock, PROCESSING: Package, SHIPPED: Truck, COMPLETED: CheckCircle2, CANCELLED: XCircle } as const;
  const Icon = map[status];
  return <Icon className="mr-2 h-4 w-4" />;
}

export function OrderDetail({ id }: { id: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [orders, setOrders] = useState(ORDERS);
  const order = orders.find((o) => o.id === id);
  const [statusUpdateOrder, setStatusUpdateOrder] = useState<Order | null>(null);

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
    toast({ title: "Order status updated", description: `${order.orderNumber} → ${newStatus}` });
  }

  if (!order) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-2">
        <Package className="h-12 w-12 text-muted-foreground" />
        <p className="text-lg font-medium">Order not found</p>
        <Button variant="outline" onClick={() => router.push("/admin/orders")}>Back to Orders</Button>
      </div>
    );
  }

  const statusBadge = ORDER_STATUS_BADGES[order.status];
  const paymentBadge = PAYMENT_STATUS_BADGES[order.paymentStatus];
  const transitions = ORDER_TRANSITIONS[order.status];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/admin/orders")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{order.orderNumber}</h1>
              <Badge variant="outline" className={statusBadge.className}>{statusBadge.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">Placed {formatDateTime(order.createdAt)}</p>
          </div>
        </div>
        {transitions.length > 0 && (
          <div className="flex gap-2">
            {transitions.map((nextStatus) => (
              <Button key={nextStatus} size="sm" variant="outline" onClick={() => setStatusUpdateOrder({ ...order, status: nextStatus })}>
                <StatusIcon status={nextStatus} />
                {ORDER_STATUS_BADGES[nextStatus].label}
              </Button>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Customer</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-2"><User className="h-3.5 w-3.5 text-muted-foreground" /> {order.customerName}</div>
              <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> <span className="font-mono">{order.customerPhone}</span></div>
              {order.customerEmail && <div className="flex items-center gap-2"><CreditCard className="h-3.5 w-3.5 text-muted-foreground" /> {order.customerEmail}</div>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Delivery</h3>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" /> <span>{order.shippingAddress}</span></div>
              {order.note && <div className="flex items-start gap-2"><StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" /> <span className="italic">&ldquo;{order.note}&rdquo;</span></div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {(order.trackingNumber || order.courierName) && (
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-purple-700">Tracking</h3>
            <div className="text-sm">
              {order.courierName && <span>Courier: <span className="font-medium">{order.courierName}</span></span>}
              {order.trackingNumber && <span className="ml-3">Tracking #: <span className="font-mono font-medium">{order.trackingNumber}</span></span>}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="border-b bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Items ({order.items.length})
          </div>
          <div className="divide-y">
            {order.items.map((item) => (
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
          <div className="border-t bg-muted/20 p-4">
            <div className="ml-auto max-w-[200px] space-y-1 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span className="font-mono">{formatBdt(order.subtotalBdt)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span><span className="font-mono">{formatBdt(order.shippingCostBdt)}</span>
              </div>
              {order.discountBdt > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount</span><span className="font-mono">−{formatBdt(order.discountBdt)}</span>
                </div>
              )}
              <Separator className="my-1" />
              <div className="flex justify-between font-semibold">
                <span>Total</span><span className="font-mono text-primary">{formatBdt(order.totalBdt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Payment</div>
              <div className="text-sm font-medium capitalize">{order.paymentMethod.replace(/_/g, " ").toLowerCase()}</div>
            </div>
            <Badge variant="outline" className={paymentBadge.className}>{paymentBadge.label}</Badge>
          </div>
        </CardContent>
      </Card>

      <StatusUpdateDialog
        order={statusUpdateOrder}
        onOpenChange={(open) => !open && setStatusUpdateOrder(null)}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}

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

  const targetStatus = order.status;
  const requiresTracking = targetStatus === "SHIPPED";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (requiresTracking && !trackingNumber.trim()) return;
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
                <Input id="tracking" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="e.g. SF123456789" required className="font-mono" />
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
            <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note about this status change..." className="min-h-[60px]" maxLength={500} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" className="gap-2"><Save className="h-4 w-4" /> Confirm Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
