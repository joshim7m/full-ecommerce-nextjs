"use client";

import { Baby, Truck, ShieldCheck, RefreshCw, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CATEGORIES } from "@/lib/mock-data";

export function StorefrontFooter() {
  return (
    <footer>
      {/* Trust badges */}
      <div className="border-b bg-[#FFF5E9]">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Truck, label: "Fast Delivery", desc: "Inside Dhaka in 1-2 days" },
              { icon: ShieldCheck, label: "100% Authentic", desc: "Trusted global brands" },
              { icon: RefreshCw, label: "Easy Returns", desc: "7-day hassle-free return" },
              { icon: CreditCard, label: "Secure Payment", desc: "Cash on Delivery & Online" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-3 rounded-lg border border-primary/10 bg-white p-3 sm:p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-[#1e1b4b]">{label}</div>
                  <div className="text-xs text-[#2F2B4A]/70">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-[#1e1b4b]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                  <Baby className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold leading-tight text-white">Baby Planet</div>
                  <div className="text-[10px] font-medium uppercase tracking-wider text-white/50">Bangladesh</div>
                </div>
              </Link>
              <p className="text-xs leading-relaxed text-white/60">
                Your one-stop online shop in Bangladesh for premium baby care products. We curate the best global brands
                so you can focus on what matters most — your little one.
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 border-white/20 text-xs text-white/80 hover:bg-white/10 hover:text-white">
                  Facebook
                </Button>
                <Button variant="outline" size="sm" className="h-8 border-white/20 text-xs text-white/80 hover:bg-white/10 hover:text-white">
                  Instagram
                </Button>
                <Button variant="outline" size="sm" className="h-8 border-white/20 text-xs text-white/80 hover:bg-white/10 hover:text-white">
                  YouTube
                </Button>
              </div>
            </div>

            {/* Shop by Category */}
            <div>
              <h4 className="mb-4 text-sm font-bold text-white">Shop by Category</h4>
              <ul className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/category/${cat.slug}`}
                      className="flex items-center gap-1 text-xs text-white/60 transition-colors hover:text-primary"
                    >
                      <ChevronRight className="h-3 w-3" />
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="mb-4 text-sm font-bold text-white">Help & Info</h4>
              <ul className="space-y-2 text-xs text-white/60">
                <li><Link href="#" className="transition-colors hover:text-primary">About Us</Link></li>
                <li><Link href="#" className="transition-colors hover:text-primary">Contact Us</Link></li>
                <li><Link href="#" className="transition-colors hover:text-primary">FAQ</Link></li>
                <li><Link href="#" className="transition-colors hover:text-primary">Shipping & Delivery</Link></li>
                <li><Link href="#" className="transition-colors hover:text-primary">Return & Refund Policy</Link></li>
                <li><Link href="#" className="transition-colors hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="#" className="transition-colors hover:text-primary">Terms of Service</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mb-4 text-sm font-bold text-white">Contact Us</h4>
              <ul className="space-y-2 text-xs text-white/60">
                <li>Dhaka, Bangladesh</li>
                <li>+880 1700-000000</li>
                <li>hello@babyplanet.bd</li>
              </ul>
              <h4 className="mb-3 mt-6 text-sm font-bold text-white">Newsletter</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Your email"
                  className="h-9 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 text-xs text-white placeholder-white/40 outline-none focus:border-primary"
                />
                <Button size="sm" className="h-9 shrink-0">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-[#16133a] py-4">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-white/50 sm:flex-row sm:px-6 lg:px-8">
          <p>&copy; {new Date().getFullYear()} Baby Planet Bangladesh. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="transition-colors hover:text-primary">Admin</Link>
            <Link href="#" className="transition-colors hover:text-primary">Terms</Link>
            <Link href="#" className="transition-colors hover:text-primary">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
