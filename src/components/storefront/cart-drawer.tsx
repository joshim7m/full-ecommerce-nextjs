"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, X, Plus, Minus, Trash2, BaggageClaim } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/lib/store/cart-store";
import { formatBdt } from "@/lib/format";

export function CartDrawer() {
  const router = useRouter();
  const { items, isOpen, openCart, closeCart, updateQuantity, removeItem, clearCart } = useCartStore();

  const subtotal = items.reduce((sum, i) => sum + i.product.priceBdt * i.quantity, 0);
  const shipping = subtotal >= 1500 ? 0 : 60;

  function handleCheckout() {
    closeCart();
    router.push("/checkout");
  }

  function handleProductClick(slug: string) {
    closeCart();
    router.push(`/product/${slug}`);
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => (open ? openCart() : closeCart())}>
      <SheetContent className="flex w-full flex-col sm:max-w-lg">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Cart ({items.length})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-12">
            <BaggageClaim className="h-16 w-16 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">Your cart is empty</p>
            <Button variant="outline" size="sm" onClick={closeCart}>
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <button
                      onClick={() => handleProductClick(item.product.slug)}
                      className="h-20 w-20 shrink-0 overflow-hidden rounded-lg border"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <button
                          onClick={() => handleProductClick(item.product.slug)}
                          className="line-clamp-1 text-sm font-medium text-foreground hover:text-primary"
                        >
                          {item.product.name}
                        </button>
                        <p className="text-xs text-muted-foreground">{item.product.categoryName}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-primary">
                            {formatBdt(item.product.priceBdt * item.quantity)}
                          </span>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Remove ${item.product.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t pt-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono font-medium">{formatBdt(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-mono font-medium">
                    {shipping === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      formatBdt(shipping)
                    )}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold">
                  <span>Total</span>
                  <span className="font-mono">{formatBdt(subtotal + shipping)}</span>
                </div>
                {subtotal < 1500 && subtotal > 0 && (
                  <p className="text-[10px] text-muted-foreground">
                    Add {formatBdt(1500 - subtotal)} more for free shipping
                  </p>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  className="gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Clear
                </Button>
                <Button size="sm" className="flex-1 gap-2" onClick={handleCheckout}>
                  <BaggageClaim className="h-4 w-4" /> Checkout
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
