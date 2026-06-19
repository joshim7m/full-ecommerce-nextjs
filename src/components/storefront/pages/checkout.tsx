"use client";

import { useState } from "react";
import {
  Home, ChevronRight, ShoppingBag, User, Phone, MapPin, StickyNote,
  Truck, ShieldCheck, ArrowLeft, Check, CreditCard, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCartStore } from "@/lib/store/cart-store";
import { useAppStore } from "@/lib/store/app-store";
import { useToast } from "@/hooks/use-toast";
import { formatBdt, generateOrderNumber } from "@/lib/format";
import type { PaymentMethod } from "@/lib/types";

const PAYMENT_METHODS: Array<{ value: PaymentMethod; label: string; description: string; icon: typeof CreditCard }> = [
  { value: "CASH_ON_DELIVERY", label: "Cash on Delivery", description: "Pay when you receive", icon: Wallet },
  { value: "BKASH", label: "bKash", description: "Mobile financial service", icon: CreditCard },
  { value: "NAGAD", label: "Nagad", description: "Mobile financial service", icon: CreditCard },
  { value: "ROCKET", label: "Rocket", description: "Mobile financial service", icon: CreditCard },
];

export function StorefrontCheckout() {
  const { items, getSubtotalBdt, getShippingBdt, getTotalBdt, clearCart } = useCartStore();
  const { goHome, goOrderSuccess } = useAppStore();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const subtotal = getSubtotalBdt();
  const shipping = getShippingBdt(address);
  const total = getTotalBdt(address);

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      next.fullName = "Please enter your full name (min 2 characters)";
    }
    // Bangladeshi mobile: 01XXXXXXXXX or +8801XXXXXXXXX
    const phone = mobile.replace(/[\s-]/g, "");
    if (!/^(\+?880|0)?1[3-9][0-9]{8}$/.test(phone)) {
      next.mobile = "Enter a valid Bangladeshi mobile (e.g. 017XXXXXXXX)";
    }
    if (!address.trim() || address.trim().length < 10) {
      next.address = "Please enter full delivery address (min 10 characters)";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add products before checking out.",
        variant: "destructive",
      });
      return;
    }
    if (!validate()) {
      toast({
        title: "Please fix the errors",
        description: "Some required fields need attention.",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    // Simulate order creation
    setTimeout(() => {
      const orderNumber = generateOrderNumber();
      clearCart();
      setSubmitting(false);
      goOrderSuccess(orderNumber);
    }, 900);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-full bg-accent">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add some products to your cart before proceeding to checkout.
        </p>
        <Button onClick={goHome} className="mt-4 gap-2">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
        <button onClick={goHome} className="flex items-center gap-1 hover:text-primary">
          <Home className="h-3.5 w-3.5" /> Home
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-medium text-foreground">Checkout</span>
      </nav>

      <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* ============================================== LEFT: Form */}
        <div className="space-y-6">
          {/* Delivery details card — 4 fields only */}
          <div className="rounded-xl border bg-card p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Truck className="h-4 w-4" />
              </div>
              <h2 className="text-base font-semibold">Delivery Details</h2>
              <Badge variant="secondary" className="ml-auto text-xs">4 fields only</Badge>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Designed for fast, frictionless local checkout. No account required.
            </p>

            <div className="grid gap-4">
              {/* 1. Full Name */}
              <div className="grid gap-1.5">
                <Label htmlFor="fullName" className="flex items-center gap-1.5 text-sm font-medium">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahima Akter"
                  className={errors.fullName ? "border-destructive" : ""}
                  autoComplete="name"
                />
                {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
              </div>

              {/* 2. Mobile Number */}
              <div className="grid gap-1.5">
                <Label htmlFor="mobile" className="flex items-center gap-1.5 text-sm font-medium">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Mobile Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="e.g. 01711-234567"
                  className={errors.mobile ? "border-destructive" : ""}
                  autoComplete="tel"
                />
                {errors.mobile && <p className="text-xs text-destructive">{errors.mobile}</p>}
                <p className="text-xs text-muted-foreground">
                  We&rsquo;ll send order updates via SMS to this number.
                </p>
              </div>

              {/* 3. Delivery Address */}
              <div className="grid gap-1.5">
                <Label htmlFor="address" className="flex items-center gap-1.5 text-sm font-medium">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Delivery Address <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House #, Road #, Area, Thana, District (e.g. House 12, Road 5, Dhanmondi, Dhaka 1209)"
                  className={`min-h-[88px] resize-none ${errors.address ? "border-destructive" : ""}`}
                />
                {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                {address.toLowerCase().includes("dhaka") ? (
                  <p className="flex items-center gap-1 text-xs text-emerald-700">
                    <Check className="h-3 w-3" /> Inside Dhaka — ৳60 shipping
                  </p>
                ) : address.length > 5 ? (
                  <p className="flex items-center gap-1 text-xs text-amber-700">
                    <Truck className="h-3 w-3" /> Outside Dhaka — ৳120 shipping
                  </p>
                ) : null}
              </div>

              {/* 4. Note / Special Instructions */}
              <div className="grid gap-1.5">
                <Label htmlFor="note" className="flex items-center gap-1.5 text-sm font-medium">
                  <StickyNote className="h-3.5 w-3.5 text-muted-foreground" />
                  Note / Special Instructions <span className="text-muted-foreground font-normal">(optional)</span>
                </Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Please call before delivery, deliver after 5 PM, gate code, landmark..."
                  className="min-h-[60px] resize-none"
                  maxLength={500}
                />
                <p className="text-right text-xs text-muted-foreground">{note.length}/500</p>
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-xl border bg-card p-5 sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <CreditCard className="h-4 w-4" />
              </div>
              <h2 className="text-base font-semibold">Payment Method</h2>
            </div>
            <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} className="grid gap-2 sm:grid-cols-2">
              {PAYMENT_METHODS.map((m) => (
                <Label
                  key={m.value}
                  htmlFor={`pm-${m.value}`}
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent ${
                    paymentMethod === m.value ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <RadioGroupItem value={m.value} id={`pm-${m.value}`} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <m.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">{m.label}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{m.description}</p>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* ============================================== RIGHT: Summary */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="rounded-xl border bg-card p-5 sm:p-6">
            <h2 className="mb-4 text-base font-semibold">Order Summary</h2>

            {/* Items */}
            <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="h-14 w-14 shrink-0 rounded-md border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-foreground">{item.product.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Qty: {item.quantity}</span>
                      <span className="font-mono text-sm font-semibold">
                        {formatBdt(item.product.priceBdt * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span className="font-mono font-medium">{formatBdt(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-mono font-medium">{formatBdt(shipping)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span className="font-mono font-medium text-emerald-600">—</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-mono text-xl font-bold text-primary">{formatBdt(total)}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-5 w-full gap-2 text-base"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Placing Order...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  Place Order · {formatBdt(total)}
                </>
              )}
            </Button>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Secure checkout · Your data is encrypted
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
