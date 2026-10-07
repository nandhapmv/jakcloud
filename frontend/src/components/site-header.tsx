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

// Desktop Navigation with Home, Food, About, Contact
const DESKTOP_NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Food", icon: UtensilsCrossed },
  { to: "/about", label: "About", icon: Info },
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
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-amber-500/25 bg-[#080503]/95 text-zinc-100 backdrop-blur-2xl shadow-[0_10px_35px_rgba(0,0,0,0.7)] transition-all">
        {/* Top Announcement Bar (Ultra-Premium Luxury Banner) */}
        <Link
          to="/validation"
          className="hidden lg:flex bg-gradient-to-r from-[#0a0704] via-[#161009] to-[#0a0704] border-b border-amber-500/20 py-2 px-4 text-center text-xs text-zinc-300 items-center justify-center gap-3 sm:gap-4 overflow-hidden hover:bg-[#18110a] transition-all group cursor-pointer relative"
        >
          {/* Subtle gold sheen overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/[0.04] to-transparent pointer-events-none" />

          <span className="flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/35 px-3 py-0.5 text-amber-300 font-bold text-[11px] uppercase tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
            <span>LIMITED TO {dailyLimit} HANDI TRAYS DAILY</span>
          </span>

          <span className="text-amber-500/40 text-[10px]">◆</span>

          <span className="text-xs text-zinc-200 group-hover:text-amber-200 transition-colors font-medium flex items-center gap-1.5">
            <span>Order by <strong className="text-amber-300 font-semibold">{cutoffLabel}</strong> for Next-Day Springfield Pickup & Delivery</span>
            <span className="text-amber-400 font-mono text-[11px] group-hover:translate-x-0.5 transition-transform font-semibold">(Check Live Capacity →)</span>
          </span>

          <span className="text-amber-500/40 text-[10px]">◆</span>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/40 animate-pulse" />
            <span>100% Zabiha Halal</span>
          </span>
        </Link>

        {/* Main Navbar Container */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 lg:px-8">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500/30 to-amber-600/30 blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
              <img
                src={logoImg}
                alt="JAKLOUD Spice King Dum Biryani"
                className="relative h-10 w-10 rounded-full border border-amber-400/60 bg-zinc-950 p-0.5 object-cover group-hover:scale-105 transition-all shadow-[0_0_15px_rgba(212,160,23,0.25)]"
                width={40}
                height={40}
              />
            </div>

            {/* Desktop Brand text */}
            <div className="hidden lg:block min-w-0 leading-tight">
              <span className="block font-display text-lg tracking-wider bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100 bg-clip-text text-transparent font-extrabold group-hover:from-amber-100 group-hover:to-amber-300 transition-all">
                JAKLOUD
              </span>
              <span className="block text-[10px] font-bold text-amber-400/90 tracking-[0.22em] uppercase font-sans">
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

          {/* Desktop Luxury Floating Pill Navigation Dock */}
          <nav className="hidden items-center p-1 rounded-full bg-black/60 border border-amber-500/25 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_4px_20px_rgba(0,0,0,0.5)] lg:flex gap-1">
            {DESKTOP_NAV.map((item) => {
              const isItemActive =
                item.to === "/"
                  ? pathname === "/"
                  : pathname === item.to || pathname.startsWith(item.to + "/");

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className={`relative px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isItemActive
                      ? "bg-gradient-to-r from-amber-500/25 via-amber-400/30 to-amber-500/25 text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-bold"
                      : "text-zinc-300 hover:text-white hover:bg-white/[0.08] border border-transparent"
                  }`}
                >
                  {isItemActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b] animate-pulse" />
                  )}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Action Buttons (WhatsApp Order, Hotline, Handi Tray) */}
          <div className="hidden lg:flex items-center gap-3">
            {/* WhatsApp Quick Order Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full border border-emerald-500/45 bg-gradient-to-r from-emerald-950/80 via-emerald-900/40 to-emerald-950/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 hover:text-emerald-100 hover:border-emerald-400 hover:bg-emerald-500/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] group cursor-pointer"
              title="Order on WhatsApp"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>WhatsApp Order</span>
            </a>

            {/* Call Hotline */}
            <a
              href={`tel:${BUSINESS.phone}`}
              className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-300 hover:text-amber-300 transition-colors px-2.5 py-1.5 rounded-full hover:bg-white/[0.05] border border-transparent hover:border-amber-500/20"
              title="Call Kitchen Hotline"
            >
              <Phone className="h-3.5 w-3.5 text-amber-400" />
              <span>{BUSINESS.phone}</span>
            </a>

            {/* Handi Tray Cart Button */}
            <Button
              size="sm"
              onClick={() => setCartOpen(true)}
              className="relative rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 transition-all gap-2 px-4 py-2 cursor-pointer h-9 border border-amber-200/50"
              aria-label={`Open Handi Tray cart, ${count} tray${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="h-3.5 w-3.5 text-zinc-950 stroke-[2.5]" />
              <span className="tracking-wide">Handi Tray</span>
              {count > 0 ? (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-950 text-amber-300 text-[10px] font-black px-1.5 ring-1 ring-amber-400/60">
                  {count}
                </span>
              ) : null}
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
