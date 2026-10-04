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
  Compass,
} from "lucide-react";
import { useState, useEffect } from "react";

import logoImg from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { CartSheet } from "@/components/cart-sheet";
import { useCart } from "@/lib/cart";
import { BUSINESS } from "@/lib/menu";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/menu", label: "Handi Menu", icon: UtensilsCrossed },
  { to: "/customize", label: "Customizer", icon: Sparkles },
  { to: "/proteins", label: "Proteins Guide", icon: Shield },
  { to: "/delivery", label: "Delivery Info", icon: Truck },
  { to: "/about", label: "Our Story", icon: Info },
  { to: "/contact", label: "Contact & Kitchen", icon: MapPin },
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
    "Hello Master Chef Kartheek! I would like to order a fresh handcrafted Dum Biryani Handi tray from JAKLOUD.",
  )}`;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full border-b border-white/[0.08] bg-[#09090b]/95 text-zinc-100 backdrop-blur-2xl shadow-lg">
        {/* Top Announcement Bar (Desktop only) */}
        <Link
          to="/validation"
          className="hidden lg:flex bg-[#121217]/95 border-b border-white/[0.06] py-1.5 px-4 text-center text-xs text-zinc-300 items-center justify-center gap-3 sm:gap-4 overflow-hidden hover:bg-[#181820] transition-colors group cursor-pointer"
        >
          <span className="flex items-center gap-1.5 text-amber-400 font-medium text-xs">
            <Sparkles className="h-3 w-3 text-amber-400" /> Limited to 25 Handi Trays Daily
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-zinc-400 group-hover:text-zinc-200 transition-colors">
            Order by 2:00 PM for Next-Day Springfield Pickup & Delivery
          </span>
          <span className="text-zinc-600">•</span>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <Shield className="h-3 w-3" /> 100% Zabiha Halal
          </span>
        </Link>

        {/* Main Navbar Container */}
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 lg:px-8">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
            <div className="relative shrink-0">
              <img
                src={logoImg}
                alt="JAKLOUD Spice King Dum Biryani"
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full border border-amber-500/30 bg-zinc-900 p-0.5 object-cover group-hover:scale-105 transition-transform shadow-sm"
                width={40}
                height={40}
              />
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block font-display text-sm sm:text-base tracking-normal text-zinc-100 font-semibold group-hover:text-amber-400 transition-colors">
                JAKLOUD <span className="text-amber-400 font-serif italic font-normal text-xs sm:text-sm">Spice King</span>
              </span>
              <span className="block text-[10px] font-normal text-zinc-400 truncate max-w-[160px] sm:max-w-none">
                Dum Biryani · Springfield, MO
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Laptop / Desktop only) */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-amber-400 bg-amber-500/10 border-amber-500/20" }}
                className="rounded-xl px-3 py-1.5 text-xs font-medium text-zinc-300 transition-all hover:bg-white/[0.06] hover:text-white border border-transparent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Action Buttons (Laptop / Desktop only) */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* WhatsApp Quick Order Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-all shadow-sm"
              title="Order on WhatsApp"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium">WhatsApp Order</span>
            </a>

            {/* Call Hotline */}
            <a
              href={`tel:${BUSINESS.phone}`}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-amber-400 hover:border-amber-500/30 transition-all shadow-sm"
              title="Call Kitchen Hotline"
            >
              <Phone className="h-3.5 w-3.5 text-amber-400" />
              <span>{BUSINESS.phone}</span>
            </a>

            {/* Cart Button with Live Counter Badge */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCartOpen(true)}
              className="relative rounded-xl border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-medium text-xs shadow-sm hover:scale-[1.02] transition-all gap-1.5 px-3.5 py-1.5 cursor-pointer h-8"
              aria-label={`Open cart, ${count} tray${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Cart</span>
              {count > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 text-zinc-950 text-[10px] font-semibold px-1">
                  {count}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Right Action Bar (Mobile Screens Only) */}
          <div className="flex items-center gap-1.5 lg:hidden">
            {/* WhatsApp Quick Icon */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-95"
              aria-label="WhatsApp Chef"
            >
              <MessageSquare className="h-4 w-4" />
            </a>

            {/* Mobile Cart Button */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-8 items-center gap-1.5 px-2.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-all active:scale-95 cursor-pointer"
              aria-label="Open Cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 text-black text-[10px] font-bold px-1">
                  {count}
                </span>
              )}
            </button>

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
                Limited to 25 Handi Trays Daily
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                100% Halal
              </span>
            </div>

            {/* Navigation Links Grid */}
            <nav className="grid grid-cols-1 gap-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? "bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold"
                        : "bg-zinc-900/40 border border-white/[0.04] text-zinc-300 hover:bg-zinc-900 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isActive ? "text-amber-400" : "text-zinc-400"}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />
                  </Link>
                );
              })}
            </nav>

            {/* Springfield Kitchen Info & Direct Contact */}
            <div className="pt-2 border-t border-white/[0.06] space-y-2">
              <div className="flex items-start gap-2 text-[11px] text-zinc-400 px-1">
                <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>3625 S Bedford Ave, Springfield, MO 65809</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 px-1">
                <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Pickup Lunch: 11:00 AM – 2:00 PM</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${BUSINESS.phone}`}
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-medium text-zinc-200 hover:text-amber-300 transition-all"
                >
                  <Phone className="h-3.5 w-3.5 text-amber-400" />
                  <span>Call Hotline</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-sm transition-all"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Cart Drawer */}
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
