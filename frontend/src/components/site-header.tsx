import { Link, useRouterState } from "@tanstack/react-router";
import {
  ShoppingBag,
  Phone,
  MessageSquare,
  Shield,
  Menu as MenuIcon,
  X,
  ChevronRight,
  Home,
  UtensilsCrossed,
  Truck,
  Info,
  MapPin,
} from "lucide-react";
import { useState, useEffect } from "react";

import logoImg from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/cart-sheet";
import { useCart } from "@/lib/cart";
import { BUSINESS } from "@/lib/menu";

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
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const whatsappUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    "Hello Master Chef Kartheek! I would like to order a fresh handcrafted Dum Biryani Handi tray from JAKloud.",
  )}`;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-amber-500/20 bg-white/95 text-zinc-900 backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all">
        {/* Main Navbar Container */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 lg:px-8">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400/30 to-amber-500/30 blur-sm opacity-70 group-hover:opacity-100 transition-opacity" />
              <img
                src={logoImg}
                alt="JAKloud J Paradize Dum Biryani"
                className="relative h-10 w-10 rounded-full border border-amber-500/40 bg-white p-0.5 object-cover group-hover:scale-105 transition-all shadow-sm"
                width={40}
                height={40}
              />
            </div>

            {/* Desktop Brand text */}
            <div className="hidden lg:block min-w-0 leading-tight">
              <span className="block font-display text-lg tracking-wider text-zinc-900 font-extrabold group-hover:text-amber-700 transition-all">
                JAKloud
              </span>
              <span className="block text-[10px] font-bold text-amber-700 tracking-[0.22em] uppercase font-sans">
                J PARADIZE · DUM BIRYANI
              </span>
            </div>

            {/* Mobile Brand text */}
            <div className="block lg:hidden min-w-0 leading-tight">
              <span className="block text-xs sm:text-base font-bold tracking-tight text-zinc-900 group-hover:text-amber-700 transition-colors truncate">
                JAKloud J Paradize
              </span>
              <span className="block text-[8.5px] sm:text-[9px] font-semibold text-zinc-500 tracking-wider uppercase truncate">
                ARTISANAL DUM BIRYANI
              </span>
            </div>
          </Link>

          {/* Desktop Luxury Floating Pill Navigation Dock */}
          <nav className="hidden items-center p-1 rounded-full bg-zinc-100/90 border border-zinc-200/90 backdrop-blur-xl shadow-sm lg:flex gap-1">
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
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-sm font-bold"
                      : "text-zinc-600 hover:text-zinc-900 hover:bg-white border border-transparent"
                  }`}
                >
                  {isItemActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-zinc-950 animate-pulse" />
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
              className="flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-all shadow-sm group cursor-pointer"
              title="Order on WhatsApp"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span>WhatsApp Order</span>
            </a>

            {/* Call Hotline */}
            <a
              href={`tel:${BUSINESS.phone}`}
              className="flex items-center gap-1.5 text-xs font-mono font-medium text-zinc-700 hover:text-amber-800 transition-colors px-2.5 py-1.5 rounded-full hover:bg-zinc-100 border border-transparent hover:border-amber-500/20"
              title="Call Kitchen Hotline"
            >
              <Phone className="h-3.5 w-3.5 text-amber-600" />
              <span>{BUSINESS.phone}</span>
            </a>

            {/* Handi Tray Cart Button */}
            <Button
              size="sm"
              onClick={() => setCartOpen(true)}
              className="relative rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-xs shadow-md hover:scale-105 transition-all gap-2 px-4 py-2 cursor-pointer h-9 border border-amber-300"
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
            {/* Quick Mobile Cart Trigger */}
            <Button
              size="sm"
              onClick={() => setCartOpen(true)}
              className="relative rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold p-1.5 h-8 w-8 flex items-center justify-center border border-amber-400 shadow-sm hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              aria-label={`Open Handi Tray cart, ${count} tray${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="h-4 w-4 text-zinc-950 stroke-[2.5]" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-zinc-950 text-amber-300 text-[9px] font-black px-1 border border-amber-400">
                  {count}
                </span>
              )}
            </Button>

            {/* Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all active:scale-95 cursor-pointer ${
                mobileMenuOpen
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-800"
                  : "bg-zinc-100 border-zinc-200 text-zinc-700 hover:bg-zinc-200"
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
          <div className="lg:hidden border-t border-zinc-200 bg-white/98 backdrop-blur-2xl px-4 py-4 space-y-3.5 animate-in slide-in-from-top-2 duration-200 shadow-xl max-h-[calc(100vh-60px)] overflow-y-auto">
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
                        ? "bg-amber-50 text-amber-900 border border-amber-200 font-semibold"
                        : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? "text-amber-600" : "text-zinc-500"}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-400" />
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Direct Hotline & WhatsApp CTA */}
            <div className="pt-2 border-t border-zinc-200 space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-emerald-50 border border-emerald-400/50 text-emerald-800 font-medium py-2.5 text-xs hover:bg-emerald-100 transition-all shadow-sm"
              >
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp Master Chef Kartheek</span>
              </a>

              <a
                href={`tel:${BUSINESS.phone}`}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 font-medium py-2 text-xs hover:text-amber-800 transition-colors"
              >
                <Phone className="h-3.5 w-3.5 text-amber-600" />
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
