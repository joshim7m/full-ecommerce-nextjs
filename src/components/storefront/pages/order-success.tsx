"use client";

import { CheckCircle2, Home, Package, Truck, Copy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAppStore } from "@/lib/store/app-store";
import { useToast } from "@/hooks/use-toast";

interface OrderSuccessProps {
  orderNumber: string;
}

export function StorefrontOrderSuccess({ orderNumber }: OrderSuccessProps) {
  const { goHome } = useAppStore();
  const { toast } = useToast();

  function copyOrderNumber() {
    navigator.clipboard?.writeText(orderNumber);
    toast({ title: "Order number copied", description: orderNumber });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="relative inline-flex">
        <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">Order Placed Successfully!</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Thank you for your purchase. We&rsquo;ve received your order and our team will call you shortly to confirm.
      </p>

      <Card className="mt-8 border-2 border-emerald-200 bg-emerald-50/50">
        <CardContent className="p-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your Order Number</div>
          <button
            onClick={copyOrderNumber}
            className="group mt-2 inline-flex items-center gap-2 rounded-lg bg-card px-4 py-2 shadow-sm hover:shadow-md"
          >
            <span className="font-mono text-lg font-bold text-foreground">{orderNumber}</span>
            <Copy className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
          </button>
          <p className="mt-3 text-xs text-muted-foreground">
            Save this number to track your order status. A confirmation SMS is on its way.
          </p>
        </CardContent>
      </Card>

      {/* Delivery timeline */}
      <div className="mt-8 grid grid-cols-3 gap-3 text-center">
        {[
          { icon: CheckCircle2, label: "Order Placed", active: true, color: "text-emerald-600 bg-emerald-100" },
          { icon: Package, label: "Processing", active: false, color: "text-muted-foreground bg-muted" },
          { icon: Truck, label: "Out for Delivery", active: false, color: "text-muted-foreground bg-muted" },
        ].map((step, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className={`flex h-12 w-12 items-center justify-center rounded-full ${step.color}`}>
              <step.icon className="h-6 w-6" />
            </div>
            <div className="text-xs font-medium">{step.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={goHome} size="lg" className="gap-2">
          <Home className="h-4 w-4" /> Continue Shopping
        </Button>
        <Button variant="outline" size="lg" className="gap-2">
          Track Order <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-6">
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
          Estimated delivery: 1–2 business days (inside Dhaka)
        </Badge>
      </div>
    </div>
  );
}
