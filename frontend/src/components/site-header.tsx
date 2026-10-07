import { Link, useRouterState } from "@tanstack/react-router";
import {
  ShoppingBag,
  Phone,
  MessageSquare,
  Sparkles,
  Shield,
  Menu as MenuIcon,
  X,
  ChevronRight,
  Home,
  UtensilsCrossed,
  Truck,
  Info,
  MapPin,
  Clock,
} from "lucide-react";
import { useState, useEffect } from "react";

import logoImg from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/cart-sheet";
import { useCart } from "@/lib/cart";
import { BUSINESS } from "@/lib/menu";
import { useKitchenSettings } from "@/lib/store";

// Desktop Navigation matching Live Site (Image 2): About, Food, Contact
const DESKTOP_NAV = [
  { to: "/about", label: "About", icon: Info },
  { to: "/menu", label: "Food", icon: UtensilsCrossed },
  { to: "/contact", label: "Contact", icon: MapPin },
] as const;

// Full Mobile Drawer Navigation
const MOBILE_NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Handi Menu", icon: UtensilsCrossed },
  { to: "/about", label: "About Our Kitchen", icon: Info },
  { to: "/contact", label: "Contact & Location", icon: MapPin },
  { to: "/delivery", label: "Springfield Delivery Zones", icon: Truck },
  { to: "/proteins", label: "Zabiha Halal Matrix", icon: Shield },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const { settings } = useKitchenSettings();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const whatsappUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    "Hello Master Chef Kartheek! I would like to order a fresh handcrafted Dum Biryani Handi tray from JAKLOUD.",
  )}`;

  const cutoffLabel =
    settings?.orderCutoffHour === 12
      ? "12:00 PM"
      : (settings?.orderCutoffHour ?? 15) > 12
      ? `${(settings?.orderCutoffHour ?? 15) - 12}:00 PM`
      : `${settings?.orderCutoffHour ?? 15}:00 AM`;

  const dailyLimit = settings?.dailyTrayLimit ?? 10;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-amber-500/20 bg-[#09090b]/98 text-zinc-100 backdrop-blur-2xl shadow-xl">
        {/* Top Announcement Bar (Desktop only - Image 2) */}
        <Link
          to="/validation"
          className="hidden lg:flex bg-[#0f0e0c]/98 border-b border-white/[0.06] py-1.5 px-4 text-center text-xs text-zinc-300 items-center justify-center gap-3 sm:gap-4 overflow-hidden hover:bg-[#181614] transition-colors group cursor-pointer"
        >
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="h-3 w-3 text-amber-400" /> LIMITED TO {dailyLimit} HANDI TRAYS DAILY
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-zinc-300 group-hover:text-amber-200 transition-colors">
            Order by {cutoffLabel} for Next-Day Springfield Pickup & Delivery (Check Live Capacity →)
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30" /> 100% Zabiha Halal
          </span>
        </Link>

        {/* Main Navbar Container */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 lg:px-8">
          {/* Brand Logo & Name (Image 1 on Mobile, Image 2 on Desktop) */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative shrink-0">
              <img
                src={logoImg}
                alt="JAKLOUD Spice King Dum Biryani"
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-amber-500/40 bg-zinc-900 p-0.5 object-cover group-hover:scale-105 transition-transform shadow-md"
                width={40}
                height={40}
              />
            </div>

            {/* Desktop Brand text (Matching Live Image 2: JAKLOUD / SPICE KING · DUM BIRYANI) */}
            <div className="hidden lg:block min-w-0 leading-tight">
              <span className="block font-display text-lg tracking-wide text-zinc-100 font-bold group-hover:text-amber-400 transition-colors">
                JAKLOUD
              </span>
              <span className="block text-[10px] font-semibold text-amber-400/90 tracking-[0.2em] uppercase font-sans">
                SPICE KING · DUM BIRYANI
              </span>
            </div>

            {/* Mobile Brand text */}
            <div className="block lg:hidden min-w-0 leading-tight">
              <span className="block text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
                JAKLOUD Spice King
              </span>
              <span className="block text-[9px] font-semibold text-zinc-400 tracking-wider uppercase whitespace-nowrap">
                ARTISANAL DUM BIRYANI
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Matching Live Image 2: About, Food, Contact) */}
          <nav className="hidden items-center gap-6 lg:flex">
            {DESKTOP_NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-amber-400 font-semibold" }}
                className="text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons (Matching Live Image 2: WhatsApp Order, Phone, Handi Tray) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* WhatsApp Quick Order Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm"
              title="Order on WhatsApp"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              <span>WhatsApp Order</span>
            </a>

            {/* Call Hotline */}
            <a
              href={`tel:${BUSINESS.phone}`}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 hover:text-amber-400 transition-colors px-1"
              title="Call Kitchen Hotline"
            >
              <Phone className="h-3.5 w-3.5 text-amber-400" />
              <span>{BUSINESS.phone}</span>
            </a>

            {/* Handi Tray Cart Button (Image 2) */}
            <Button
              size="sm"
              onClick={() => setCartOpen(true)}
              className="relative rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-xs shadow-md hover:scale-[1.02] transition-all gap-1.5 px-4 py-1.5 cursor-pointer h-9 border border-amber-400/50"
              aria-label={`Open Handi Tray cart, ${count} tray${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="h-3.5 w-3.5 text-zinc-950" />
              <span>Handi Tray</span>
              {count > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-950 text-amber-400 text-[10px] font-extrabold px-1 ml-0.5">
                  {count}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Right Action Bar (Mobile Screens Only) */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer ${
                mobileMenuOpen
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                  : "bg-zinc-900 border-white/10 text-zinc-200 hover:bg-zinc-800"
              }`}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer / Dropdown Panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-white/[0.08] bg-[#0c0c0e]/98 backdrop-blur-2xl px-4 py-4 space-y-3.5 animate-in slide-in-from-top-2 duration-200 shadow-2xl max-h-[calc(100vh-60px)] overflow-y-auto">
            {/* Quick Kitchen Status Banner */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                Limited to {dailyLimit} Handi Trays Daily
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                100% Halal
              </span>
            </div>

            {/* Navigation Links Grid */}
            <nav className="grid grid-cols-1 gap-1">
              {MOBILE_NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold"
                        : "text-zinc-300 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-zinc-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Direct Hotline & WhatsApp CTA */}
            <div className="pt-2 border-t border-white/[0.08] space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 font-medium py-2.5 text-xs hover:bg-emerald-600/30 transition-all shadow-sm"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp Master Chef Kartheek</span>
              </a>

              <a
                href={`tel:${BUSINESS.phone}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-zinc-900 border border-white/10 text-zinc-200 font-medium py-2 text-xs hover:text-amber-400 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-amber-400" />
                <span>Kitchen Hotline: {BUSINESS.phone}</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Cart Slider Drawer */}
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
