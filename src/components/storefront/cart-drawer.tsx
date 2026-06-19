"use client";

import { Minus, Plus, Trash2, ShoppingBag, X, ArrowRight, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { useCartStore } from "@/lib/store/cart-store";
import { useAppStore } from "@/lib/store/app-store";
import { formatBdt } from "@/lib/format";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    getSubtotalBdt,
    getShippingBdt,
    getTotalBdt,
    clearCart,
  } = useCartStore();
  const { goCheckout, goProduct } = useAppStore();

  const subtotal = getSubtotalBdt();
  const shipping = getShippingBdt();
  const total = getTotalBdt();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  function handleCheckout() {
    closeCart();
    goCheckout();
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-md">
        <SheetHeader className="border-b bg-gradient-to-r from-accent/60 to-accent/20 px-5 py-4">
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Your Cart
              {totalItems > 0 && (
                <Badge variant="secondary" className="font-mono text-xs">
                  {totalItems} item{totalItems !== 1 ? "s" : ""}
                </Badge>
              )}
            </span>
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">Your cart is empty</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Browse our categories and add items to get started.
              </p>
            </div>
            <Button onClick={closeCart} variant="outline">
              Continue shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-3 py-2">
              {items.map((item) => {
                const product = item.product;
                const lineTotal = product.priceBdt * item.quantity;
                return (
                  <div
                    key={item.productId}
                    className="flex gap-3 rounded-lg p-2 transition-colors hover:bg-accent/40"
                  >
                    <button
                      onClick={() => {
                        closeCart();
                        goProduct(product.slug);
                      }}
                      className="shrink-0"
                    >
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-20 w-20 rounded-lg border object-cover"
                        loading="lazy"
                      />
                    </button>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <button
                        onClick={() => {
                          closeCart();
                          goProduct(product.slug);
                        }}
                        className="text-left text-sm font-medium leading-snug text-foreground line-clamp-2 hover:text-primary"
                      >
                        {product.name}
                      </button>
                      <div className="text-xs text-muted-foreground">{product.categoryName}</div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-primary">
                          {formatBdt(product.priceBdt)}
                        </span>
                        {product.compareAtBdt && (
                          <span className="font-mono text-xs text-muted-foreground line-through">
                            {formatBdt(product.compareAtBdt)}
                          </span>
                        )}
                      </div>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        {/* Quantity stepper */}
                        <div className="flex items-center rounded-md border">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-8 text-center font-mono text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                            className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold">
                            {formatBdt(lineTotal)}
                          </span>
                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-muted-foreground hover:text-destructive"
                            aria-label={`Remove ${product.name} from cart`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Clear cart */}
              <button
                onClick={clearCart}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed py-2 text-xs font-medium text-muted-foreground hover:border-destructive hover:text-destructive"
              >
                <X className="h-3 w-3" />
                Clear cart
              </button>
            </div>

            {/* Footer with totals + checkout */}
            <SheetFooter className="border-t bg-muted/30 px-5 py-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-mono font-medium">{formatBdt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" />
                    Shipping
                  </span>
                  <span className="font-mono font-medium">{formatBdt(shipping)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-mono text-lg font-bold text-primary">{formatBdt(total)}</span>
                </div>
                <div className="rounded-md bg-accent/60 px-3 py-1.5 text-center text-xs text-muted-foreground">
                  Cash on Delivery available · Inside Dhaka ৳60, outside ৳120
                </div>
              </div>
              <Button
                onClick={handleCheckout}
                size="lg"
                className="mt-3 w-full gap-2 text-base"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
