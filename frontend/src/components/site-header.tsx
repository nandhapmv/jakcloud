import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, Phone, MessageSquare, Sparkles, Shield, Lock } from "lucide-react";
import { useState } from "react";

import logoImg from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CartSheet } from "@/components/cart-sheet";
import { useCart } from "@/lib/cart";
import { BUSINESS } from "@/lib/menu";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/proteins", label: "Proteins & Halal" },
  { to: "/trays", label: "Tray Sizing" },
  { to: "/menu", label: "Handi Menu" },
  { to: "/validation", label: "Availability" },
  { to: "/delivery", label: "Pickup & Delivery" },
  { to: "/about", label: "Royal Story" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const [navOpen, setNavOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const whatsappUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    "Hello Master Chef Kartheek! I would like to order a fresh handcrafted Dum Biryani Handi tray from JAKLOUD.",
  )}`;

  return (
    <>
      {/* Top Royal Announcement Bar */}
      <Link
        to="/validation"
        className="bg-gradient-to-r from-[#170f0a] via-[#21140c] to-[#170f0a] border-b border-gold/20 py-1.5 px-4 text-center text-xs text-cream/90 flex items-center justify-center gap-2 sm:gap-4 overflow-hidden hover:bg-[#25160d] transition-colors group cursor-pointer"
      >
        <span className="flex items-center gap-1.5 text-gold font-semibold tracking-wider uppercase text-[0.65rem] sm:text-xs">
          <Sparkles className="h-3 w-3 text-gold animate-pulse" /> Limited to 25 Handi Trays Daily
        </span>
        <span className="hidden md:inline text-gold/40">•</span>
        <span className="hidden md:inline text-[0.7rem] text-cream/80 group-hover:text-gold transition-colors">
          Order by 2:00 PM for Next-Day Springfield Pickup & Delivery (Check Live Capacity →)
        </span>
        <span className="hidden sm:inline text-gold/40">•</span>
        <span className="hidden sm:inline text-[0.7rem] text-emerald-400 font-semibold flex items-center gap-1">
          <Shield className="h-3 w-3" /> 100% Zabiha Halal
        </span>
      </Link>

      {/* Main Luxury Header */}
      <header className="sticky top-0 z-50 border-b border-gold/25 bg-[#100b07]/95 text-cream backdrop-blur-2xl shadow-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          {/* Brand Logo & Name */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gold/30 blur-sm group-hover:bg-gold/50 transition-all" />
              <img
                src={logoImg}
                alt="JAKLOUD Spice King Dum Biryani"
                className="relative h-11 w-11 rounded-full border border-gold/60 bg-cream p-0.5 object-cover shadow-[0_0_15px_rgba(212,160,23,0.35)] group-hover:scale-105 transition-transform"
                width={48}
                height={48}
              />
            </div>
            <div className="min-w-0 leading-tight">
              <span className="block font-display text-lg tracking-wider text-cream font-bold group-hover:text-gold transition-colors">
                JAKLOUD
              </span>
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gold">
                Spice King · Dum Biryani
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{ className: "text-gold font-bold bg-gold/10 border-gold/30" }}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide text-cream/80 transition-all hover:bg-gold/15 hover:text-gold border border-transparent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* WhatsApp Quick Order Button */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/60 transition-all shadow-sm"
              title="Order on WhatsApp"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
              <span className="hidden xl:inline">WhatsApp Order</span>
            </a>

            {/* Call Hotline */}
            <a
              href={`tel:${BUSINESS.phone}`}
              className="hidden md:flex items-center gap-1.5 rounded-xl border border-gold/30 bg-black/40 px-3 py-1.5 text-xs font-semibold text-gold hover:bg-gold/15 hover:border-gold/60 transition-all shadow-sm"
            >
              <Phone className="h-3.5 w-3.5 text-gold" />
              <span>{BUSINESS.phone}</span>
            </a>

            {/* Cart Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCartOpen(true)}
              className="relative rounded-xl border-gold/40 bg-gradient-to-r from-chili/80 via-saffron to-gold/80 text-white font-bold text-xs shadow-md shadow-chili/30 hover:scale-105 transition-all gap-1.5 px-3.5"
              aria-label={`Open cart, ${count} tray${count === 1 ? "" : "s"}`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Handi Tray</span>
              {count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black text-gold text-xs font-bold px-1 border border-gold/60">
                  {count}
                </span>
              )}
            </Button>

            {/* Mobile Nav Hamburger */}
            <Sheet open={navOpen} onOpenChange={setNavOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl border border-gold/30 text-gold hover:bg-gold/15 lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(22rem,88vw)] border-gold/30 bg-[#120c08] text-cream p-6">
                <div className="flex items-center gap-3 border-b border-gold/20 pb-4">
                  <img
                    src={logoImg}
                    alt="JAKLOUD"
                    className="h-10 w-10 rounded-full border border-gold/60 bg-cream p-0.5 object-cover"
                  />
                  <div>
                    <span className="font-display text-base font-bold text-cream">JAKLOUD</span>
                    <span className="block text-[0.62rem] uppercase tracking-widest text-gold">
                      Spice King Dum Biryani
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-2">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setNavOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-semibold transition-colors hover:bg-gold/15 hover:text-gold border border-gold/10"
                    >
                      {item.label}
                    </Link>
                  ))}

                  <div className="pt-4 mt-2 border-t border-gold/15 space-y-3">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 p-3 text-xs font-semibold text-emerald-400"
                    >
                      <MessageSquare className="h-4 w-4" /> Order via WhatsApp Direct
                    </a>

                    <a
                      href={`tel:${BUSINESS.phone}`}
                      className="flex items-center gap-2 rounded-xl bg-black/50 border border-gold/25 p-3 text-xs font-semibold text-gold"
                    >
                      <Phone className="h-4 w-4" /> Call: {BUSINESS.phone}
                    </a>

                    <Link
                      to="/admin/login"
                      onClick={() => setNavOpen(false)}
                      className="flex items-center justify-between rounded-xl bg-black/40 border border-gold/20 p-3 text-xs text-cream/70 hover:text-gold"
                    >
                      <span className="flex items-center gap-2">
                        <Lock className="h-3.5 w-3.5 text-gold" /> Kitchen Admin Portal
                      </span>
                      <span className="text-gold">→</span>
                    </Link>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Cart Drawer */}
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  );
}
