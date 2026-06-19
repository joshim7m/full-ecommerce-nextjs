"use client";

import { Baby, Mail, Phone, MapPin, Facebook, Instagram, Youtube, Send, ShieldCheck, Truck, RefreshCw, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/lib/store/app-store";
import { CATEGORIES } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";

export function StorefrontFooter() {
  const { goHome, goCategory, setMode } = useAppStore();
  const { toast } = useToast();

  function handleNewsletter(e: React.FormEvent) {
    e.preventDefault();
    toast({
      title: "Subscribed!",
      description: "You'll receive exclusive offers and baby care tips.",
    });
    (e.target as HTMLFormElement).reset();
  }

  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      {/* Trust badges */}
      <div className="border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            { icon: Truck, title: "Fast Delivery", desc: "Inside Dhaka 1-2 days" },
            { icon: ShieldCheck, title: "100% Authentic", desc: "Genuine products only" },
            { icon: RefreshCw, title: "Easy Returns", desc: "7-day return policy" },
            { icon: CreditCard, title: "Secure Payment", desc: "bKash, Nagad, COD" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <button
              onClick={() => goHome()}
              className="flex items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Baby className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-foreground">Baby Planet BD</div>
                <div className="-mt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Bangladesh</div>
              </div>
            </button>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Bangladesh&rsquo;s trusted destination for premium baby products, mom care essentials, and kids&rsquo;
              dining — handpicked for safety, comfort, and joy.
            </p>

            {/* Newsletter */}
            <form onSubmit={handleNewsletter} className="mt-5 flex max-w-sm gap-2">
              <Input
                type="email"
                placeholder="Your email for offers"
                required
                className="h-10"
              />
              <Button type="submit" size="sm" className="gap-1">
                <Send className="h-3.5 w-3.5" />
                Subscribe
              </Button>
            </form>
          </div>

          {/* Shop */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Shop</h4>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => goCategory(cat.slug)}
                    className="text-left text-muted-foreground hover:text-primary"
                  >
                    {cat.name.split(" ")[0]}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Help</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="hover:text-primary cursor-pointer">Track Order</li>
              <li className="hover:text-primary cursor-pointer">Shipping Policy</li>
              <li className="hover:text-primary cursor-pointer">Returns &amp; Refunds</li>
              <li className="hover:text-primary cursor-pointer">FAQ</li>
              <li className="hover:text-primary cursor-pointer">Contact Us</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-sm font-semibold text-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Level 4, Plot 37, Gulshan Avenue, Dhaka 1212</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <span>+880 1711 000000</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0" />
                <span>hello@babyplanet.bd</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="icon" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" aria-label="YouTube">
                <Youtube className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Baby Planet BD. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-primary cursor-pointer">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer">Terms of Service</span>
            <button
              onClick={() => setMode("admin")}
              className="font-medium text-primary hover:underline"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
