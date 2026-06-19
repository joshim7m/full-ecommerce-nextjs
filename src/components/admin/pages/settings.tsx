"use client";

import { Store, Save, Bell, CreditCard, Truck, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export function AdminSettings() {
  const { toast } = useToast();

  function handleSave(section: string) {
    toast({ title: "Settings saved", description: `${section} settings updated successfully` });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Store Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="h-4 w-4 text-primary" /> Store Profile
          </CardTitle>
          <CardDescription>Basic store information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="store-name">Store Name</Label>
            <Input id="store-name" defaultValue="Baby Planet BD" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="store-tagline">Tagline</Label>
            <Input id="store-tagline" defaultValue="Everything your baby needs, delivered with love." />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="store-desc">Description</Label>
            <Textarea id="store-desc" defaultValue="Bangladesh's trusted destination for premium baby products." className="min-h-[80px]" />
          </div>
          <Button onClick={() => handleSave("Store Profile")} className="gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Shipping */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Truck className="h-4 w-4 text-primary" /> Shipping
          </CardTitle>
          <CardDescription>Delivery rates and zones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="ship-dhaka">Inside Dhaka (৳)</Label>
              <Input id="ship-dhaka" type="number" defaultValue="60" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="ship-outside">Outside Dhaka (৳)</Label>
              <Input id="ship-outside" type="number" defaultValue="120" />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="free-ship">Free shipping threshold (৳)</Label>
            <Input id="free-ship" type="number" defaultValue="1500" />
            <p className="text-xs text-muted-foreground">Orders above this amount get free shipping inside Dhaka.</p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Cash on Delivery</Label>
              <p className="text-xs text-muted-foreground">Allow customers to pay on delivery</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button onClick={() => handleSave("Shipping")} className="gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" /> Payment Methods
          </CardTitle>
          <CardDescription>Accepted payment options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "Cash on Delivery", desc: "Pay when you receive", on: true },
            { name: "bKash", desc: "Mobile financial service", on: true },
            { name: "Nagad", desc: "Mobile financial service", on: true },
            { name: "Rocket", desc: "Mobile financial service", on: false },
            { name: "Card (SSLCommerz)", desc: "Visa/Mastercard/Amex", on: false },
          ].map((m) => (
            <div key={m.name} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.desc}</div>
              </div>
              <Switch defaultChecked={m.on} />
            </div>
          ))}
          <Button onClick={() => handleSave("Payment Methods")} className="gap-2 mt-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" /> Notifications
          </CardTitle>
          <CardDescription>Email and SMS alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { name: "New order alert", desc: "Email when a new order is placed", on: true },
            { name: "Low stock alert", desc: "Email when product stock is low", on: true },
            { name: "Daily summary", desc: "Daily digest of store activity", on: false },
            { name: "Customer SMS", desc: "Send order updates via SMS to customers", on: true },
          ].map((n) => (
            <div key={n.name} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-sm font-medium">{n.name}</div>
                <div className="text-xs text-muted-foreground">{n.desc}</div>
              </div>
              <Switch defaultChecked={n.on} />
            </div>
          ))}
          <Button onClick={() => handleSave("Notifications")} className="gap-2 mt-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" /> SEO &amp; Social
          </CardTitle>
          <CardDescription>Search engine and social sharing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="meta-title">Meta Title</Label>
            <Input id="meta-title" defaultValue="Baby Planet BD — Premium Baby Products in Bangladesh" maxLength={60} />
            <p className="text-xs text-muted-foreground">60 characters max</p>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="meta-desc">Meta Description</Label>
            <Textarea id="meta-desc" defaultValue="Shop premium baby bottles, breast pumps, clothing, and more. Cash on Delivery available across Bangladesh." maxLength={160} className="min-h-[70px]" />
            <p className="text-xs text-muted-foreground">160 characters max</p>
          </div>
          <Button onClick={() => handleSave("SEO")} className="gap-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" /> Security
          </CardTitle>
          <CardDescription>Authentication and access control</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="text-sm font-medium">Two-factor authentication</Label>
              <p className="text-xs text-muted-foreground">Require 2FA for admin accounts</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="text-sm font-medium">Google OAuth login</Label>
              <p className="text-xs text-muted-foreground">Allow customers to sign in with Google</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label className="text-sm font-medium">Rate limiting</Label>
              <p className="text-xs text-muted-foreground">300 requests / 15 min per IP (Redis-backed)</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button onClick={() => handleSave("Security")} className="gap-2 mt-2">
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
