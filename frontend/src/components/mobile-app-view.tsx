import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  MapPin,
  ArrowUpDown,
  Plus,
  Minus,
  Home,
  Menu as MenuIcon,
  QrCode,
  ShoppingBag,
  User,
  Share2,
  Sparkles,
  Shield,
  Phone,
  MessageSquare,
  ChevronRight,
  Flame,
  Check,
  RotateCw,
  Coins,
  ArrowLeftRight,
  Info,
  Clock,
  ExternalLink,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";

import { useCart } from "@/lib/cart";
import { MENU, BUSINESS, formatMoney, type ProteinId, type MenuItem, ALOO_CHARGE } from "@/lib/menu";
import { QrCodeSvg } from "@/components/qr-code-svg";
import { CartSheet } from "@/components/cart-sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Map image assets by protein ID
const DISH_IMAGES: Record<ProteinId, string> = {
  chicken: chickenImg,
  mutton: muttonImg,
  beef: rawBeefImg,
  pork: rawPorkImg,
  paneer: paneerImg,
  prawn: prawnImg,
};

export interface MobileAppViewProps {
  initialTab?: "home" | "menu" | "qr" | "cart" | "profile";
}

export function MobileAppView({ initialTab = "home" }: MobileAppViewProps) {
  const { lines, addLine, setQty, count, subtotal } = useCart();
  const navigate = useNavigate();

  // Navigation State
  const [activeTab, setActiveTab] = useState<"home" | "menu" | "qr" | "cart" | "profile">(initialTab);
  const [fulfilmentMode, setFulfilmentMode] = useState<"pickup" | "delivery" | "catering">("pickup");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Interactive Modals
  const [cartOpen, setCartOpen] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [selectedDishModal, setSelectedDishModal] = useState<MenuItem | null>(null);
  const [dishWithAloo, setDishWithAloo] = useState(false);
  const [dishExtraSpicy, setDishExtraSpicy] = useState(false);
  const [dishNotes, setDishNotes] = useState("");

  // Loyalty & Wallet Mock State
  const [walletBalance, setWalletBalance] = useState(334);
  const [bonusPoints, setBonusPoints] = useState(889);
  const [qrCodePin] = useState("223 556");

  const whatsappUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    "Hello Master Chef Kartheek! I am ordering from the JAKLOUD Mobile App for Springfield pickup/delivery.",
  )}`;

  // Helper to find total qty in cart for a protein
  const getProteinCartQty = (proteinId: ProteinId) => {
    return lines
      .filter((l) => l.proteinId === proteinId)
      .reduce((sum, l) => sum + l.qty, 0);
  };

  // Quick 1-tap add to cart
  const handleQuickAdd = (dish: MenuItem) => {
    addLine({
      proteinId: dish.id,
      name: dish.name,
      aloo: false,
      extraSpicy: false,
      notes: "",
      qty: 1,
      unitPrice: dish.price,
    });
    toast.success(`Added 1x ${dish.name} Handi Tray to cart!`);
  };

  // Increment existing or open customizer
  const handleCardClick = (dish: MenuItem) => {
    setSelectedDishModal(dish);
    setDishWithAloo(false);
    setDishExtraSpicy(false);
    setDishNotes("");
  };

  const handleAddCustomizedDish = () => {
    if (!selectedDishModal) return;
    const unitPrice = dishWithAloo ? selectedDishModal.priceWithAloo : selectedDishModal.price;
    addLine({
      proteinId: selectedDishModal.id,
      name: selectedDishModal.name,
      aloo: dishWithAloo,
      extraSpicy: dishExtraSpicy,
      notes: dishNotes.trim(),
      qty: 1,
      unitPrice,
    });
    toast.success(`Added ${selectedDishModal.name} ${dishWithAloo ? "(+Aloo)" : ""} to Tray!`);
    setSelectedDishModal(null);
  };

  const handleShareQr = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "JAKLOUD Dum Biryani Handi Order QR",
          text: `My JAKLOUD verification code: ${qrCodePin} (Springfield, MO)`,
          url: window.location.href,
        });
      } catch {
        /* ignore */
      }
    } else {
      navigator.clipboard.writeText(`JAKLOUD Code: ${qrCodePin} - https://jakloud.com`);
      toast.success("QR Code PIN copied to clipboard!");
    }
  };

  const handleSwapPoints = () => {
    if (bonusPoints >= 100) {
      setBonusPoints((prev) => prev - 100);
      setWalletBalance((prev) => prev + 10);
      toast.success("Converted 100 Bonus Pts into $10.00 Wallet Credit!");
    } else {
      toast.info("Need at least 100 Bonus Points to convert to wallet cash.");
    }
  };

  // Filtered dishes
  const filteredDishes = MENU.filter((dish) => {
    if (selectedCategory === "All") return true;
    if (selectedCategory === "Signature") return dish.category.includes("Signature");
    if (selectedCategory === "Royal") return dish.category.includes("Premium") || dish.category.includes("Occasion");
    if (selectedCategory === "Vegetarian") return dish.category.includes("Vegetarian");
    if (selectedCategory === "Seafood") return dish.category.includes("Seafood");
    return true;
  });

  return (
    <div className="min-h-screen bg-[#111114] text-white font-sans selection:bg-amber-400 selection:text-black pb-28">
      {/* ========================================================================= */}
      {/* 1. TOP SLEEK APP HEADER (Matches Left Screen Mockup)                       */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#111114]/95 backdrop-blur-xl border-b border-[#1f1f26] px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Brand Logo & Name */}
          <button
            onClick={() => setActiveTab("home")}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-md shadow-amber-500/20">
              <img
                src={logoImg}
                alt="JAKLOUD"
                className="h-full w-full rounded-full object-cover bg-black"
              />
            </div>
            <div>
              <span className="block text-sm font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                JAKLOUD Spice King
              </span>
              <span className="block text-[10px] font-medium text-zinc-400 tracking-wider uppercase">
                Artisanal Dum Biryani
              </span>
            </div>
          </button>

          {/* Right Action: Bonuses / Coin Button */}
          <button
            onClick={() => setActiveTab("qr")}
            className="flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-[#1a1a22] px-3 py-1.5 text-xs font-semibold text-amber-400 shadow-sm hover:border-amber-400 hover:bg-amber-500/10 transition-all"
            title="View Loyalty Bonuses & QR"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-black">
              <Coins className="h-3 w-3" />
            </div>
            <span className="font-mono font-bold text-amber-300">{bonusPoints}</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TAB CONTENT: SCREEN 1 (HOME / ORDERING FEED)                               */}
      {/* ========================================================================= */}
      {activeTab === "home" && (
        <main className="px-4 pt-4 space-y-4 max-w-md mx-auto">
          {/* A. Location / Outlet Card */}
          <div
            onClick={() => setLocationModalOpen(true)}
            className="group relative cursor-pointer rounded-2xl bg-[#1c1c24] border border-[#282834] p-3.5 flex items-center justify-between shadow-lg hover:border-amber-500/40 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20 group-hover:scale-105 transition-transform">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white truncate">
                    JAKLOUD Springfield
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400">
                    Open
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 truncate">
                  3625 S Bedford Ave, Springfield, MO
                </p>
              </div>
            </div>

            <div className="shrink-0 pl-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#282836] text-zinc-300 group-hover:text-amber-400 transition-colors">
                <ArrowUpDown className="h-3.5 w-3.5" />
              </div>
            </div>
          </div>

          {/* B. Segmented Control / Fulfilment Mode Pills */}
          <div className="rounded-xl bg-[#16161c] p-1 border border-[#22222a] flex items-center gap-1">
            <button
              onClick={() => setFulfilmentMode("pickup")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                fulfilmentMode === "pickup"
                  ? "bg-[#282836] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Pickup
            </button>
            <button
              onClick={() => setFulfilmentMode("delivery")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                fulfilmentMode === "delivery"
                  ? "bg-[#282836] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Delivery
            </button>
            <button
              onClick={() => setFulfilmentMode("catering")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all text-center ${
                fulfilmentMode === "catering"
                  ? "bg-[#282836] text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Party Trays
            </button>
          </div>

          {/* C. Quick Category Filters */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {["All", "Signature", "Royal", "Vegetarian", "Seafood"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-amber-400 text-black shadow-md shadow-amber-400/20 font-bold"
                    : "bg-[#1c1c24] border border-[#282836] text-zinc-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* D. Menu Items List (Matching Mobile Card List in Reference Image) */}
          <div className="space-y-3 pt-1">
            {filteredDishes.map((dish) => {
              const inCartQty = getProteinCartQty(dish.id);
              const dishImg = DISH_IMAGES[dish.id] || chickenImg;

              return (
                <div
                  key={dish.id}
                  className="group relative rounded-2xl bg-[#1c1c24] border border-[#282834] p-3 flex items-center gap-3 shadow-md hover:border-[#3a3a4c] transition-all"
                >
                  {/* Dish Thumbnail */}
                  <div
                    onClick={() => handleCardClick(dish)}
                    className="relative h-18 w-18 sm:h-20 sm:w-20 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-black"
                  >
                    <img
                      src={dishImg}
                      alt={dish.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {dish.id === "chicken" && (
                      <span className="absolute bottom-1 left-1 rounded bg-amber-400 text-[8px] font-bold text-black px-1 py-0.5">
                        TOP
                      </span>
                    )}
                  </div>

                  {/* Dish Info */}
                  <div
                    onClick={() => handleCardClick(dish)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <h4 className="text-sm font-bold text-white leading-snug truncate group-hover:text-amber-300 transition-colors">
                      {dish.name}
                    </h4>
                    <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                      {dish.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-sm font-extrabold text-white font-mono">
                        {formatMoney(dish.price)}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        • Serves 4–5
                      </span>
                    </div>
                  </div>

                  {/* Right: + Button or Active Counter */}
                  <div className="shrink-0 flex items-center">
                    {inCartQty === 0 ? (
                      <button
                        onClick={() => handleQuickAdd(dish)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#282836] text-white hover:bg-amber-400 hover:text-black font-bold shadow-sm transition-all active:scale-95"
                        aria-label={`Add ${dish.name} to cart`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-xl bg-[#282836] border border-amber-400/40 p-1">
                        <button
                          onClick={() => {
                            const line = lines.find((l) => l.proteinId === dish.id);
                            if (line) setQty(line.key, line.qty - 1);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 text-amber-400 hover:bg-amber-400 hover:text-black transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-4 text-center font-mono text-xs font-bold text-amber-300">
                          {inCartQty}
                        </span>
                        <button
                          onClick={() => handleQuickAdd(dish)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400 text-black hover:bg-amber-300 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Announcement / Live Capacity Note */}
          <div className="mt-4 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-[#1c1c24] to-[#1c1c24] p-3.5 flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/20 text-amber-400">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white">
                Handcrafted Dum Cooking Guarantee
              </p>
              <p className="text-[10px] text-zinc-400">
                Sealed clay pots & separate dedicated cookware for halal meats & vegetarian trays.
              </p>
            </div>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: SCREEN 2 (BONUSES & ORDER QR VIEW)                           */}
      {/* (Matches Right Screen in Provided Mockup)                                 */}
      {/* ========================================================================= */}
      {activeTab === "qr" && (
        <main className="px-4 pt-4 space-y-5 max-w-md mx-auto animate-in fade-in duration-300">
          {/* Header row for Screen 2 */}
          <div className="flex items-center justify-between pb-2">
            <button
              onClick={() => setActiveTab("home")}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1c1c24] border border-[#282834] text-amber-400"
            >
              <Coins className="h-4 w-4" />
            </button>
            <h2 className="text-base font-bold text-white tracking-wide">
              Bonuses & Order QR
            </h2>
            <button
              onClick={handleShareQr}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1c1c24] border border-[#282834] text-zinc-300 hover:text-white"
              title="Share QR code"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Centered Large White QR Code Card (Exact match to Mockup) */}
          <div className="mx-auto max-w-[290px] rounded-3xl bg-white p-6 shadow-2xl flex flex-col items-center justify-center text-center">
            <QrCodeSvg size={210} className="w-full h-auto" />
          </div>

          {/* Subtitle & Huge Gold Code */}
          <div className="text-center space-y-1">
            <p className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">
              Scan the QR code
            </p>
            <h3 className="text-3xl sm:text-4xl font-extrabold tracking-widest text-amber-400 font-mono">
              {qrCodePin}
            </h3>
          </div>

          {/* Dual Wallet & Bonuses Stats Card (Exact match to Mockup) */}
          <div className="rounded-3xl bg-[#1c1c24] border border-[#282834] p-4 flex items-center justify-between shadow-xl">
            {/* Wallet Left */}
            <div className="flex-1 text-center">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Wallet ($)
              </span>
              <span className="block text-2xl font-black text-white font-mono mt-0.5">
                {walletBalance}
              </span>
            </div>

            {/* Center Swap Button */}
            <div className="shrink-0 px-2">
              <button
                onClick={handleSwapPoints}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/30 hover:scale-110 active:scale-95 transition-transform"
                title="Convert 100 points to $10 wallet"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </button>
            </div>

            {/* Bonuses Right */}
            <div className="flex-1 text-center">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                Bonuses
              </span>
              <span className="block text-2xl font-black text-white font-mono mt-0.5">
                {bonusPoints}
              </span>
            </div>
          </div>

          {/* Quick Redeem & Counter Actions */}
          <div className="space-y-2">
            <button
              onClick={() => {
                toast.success("Ready for Counter Scan! Master Chef Kartheek verified.");
              }}
              className="w-full rounded-2xl bg-amber-400 text-black font-bold py-3.5 text-sm shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all active:scale-[0.98]"
            >
              Show at Springfield Kitchen Counter
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#1c1c24] border border-[#282834] text-zinc-300 hover:text-white py-3 text-xs font-semibold transition-colors"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              Order Assistance with Master Chef via WhatsApp
            </a>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: FULL MENU CATEGORIES TAB                                      */}
      {/* ========================================================================= */}
      {activeTab === "menu" && (
        <main className="px-4 pt-4 space-y-4 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Full Artisanal Menu</h2>
            <span className="text-xs text-amber-400 font-mono">6 Handi Trays</span>
          </div>

          <div className="space-y-3">
            {MENU.map((dish) => {
              const inCartQty = getProteinCartQty(dish.id);
              const dishImg = DISH_IMAGES[dish.id] || chickenImg;

              return (
                <div
                  key={dish.id}
                  className="rounded-2xl bg-[#1c1c24] border border-[#282834] p-3 flex items-center gap-3"
                >
                  <img
                    src={dishImg}
                    alt={dish.name}
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">{dish.name}</h4>
                    <p className="text-[10px] text-zinc-400 line-clamp-1">{dish.note}</p>
                    <p className="text-xs font-bold text-amber-400 font-mono mt-1">
                      {formatMoney(dish.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCardClick(dish)}
                    className="rounded-xl bg-[#282836] px-3 py-1.5 text-xs font-bold text-white hover:bg-amber-400 hover:text-black transition-all"
                  >
                    Customize
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: PROFILE / REWARDS / KITCHEN TAB                              */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <main className="px-4 pt-4 space-y-4 max-w-md mx-auto">
          <div className="rounded-3xl bg-[#1c1c24] border border-[#282834] p-5 text-center space-y-3">
            <div className="mx-auto h-16 w-16 rounded-full bg-amber-400/20 border-2 border-amber-400 p-1 flex items-center justify-center text-amber-400">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Spice King Member</h3>
              <p className="text-xs text-zinc-400">Springfield Dum Biryani Club</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#282834]">
              <div className="rounded-xl bg-[#16161c] p-2">
                <span className="text-[10px] text-zinc-400 uppercase">Balance</span>
                <span className="block text-lg font-bold text-white">${walletBalance}</span>
              </div>
              <div className="rounded-xl bg-[#16161c] p-2">
                <span className="text-[10px] text-zinc-400 uppercase">Bonus Pts</span>
                <span className="block text-lg font-bold text-amber-400">{bonusPoints}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl bg-[#1c1c24] border border-[#282834] overflow-hidden divide-y divide-[#282834]">
            <Link
              to="/validation"
              className="flex items-center justify-between p-3.5 text-xs font-semibold text-zinc-200 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-400" /> Daily 25 Trays Capacity & Cutoff
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </Link>

            <Link
              to="/delivery"
              className="flex items-center justify-between p-3.5 text-xs font-semibold text-zinc-200 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-400" /> Springfield Pickup & Delivery Zones
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </Link>

            <a
              href={`tel:${BUSINESS.phone}`}
              className="flex items-center justify-between p-3.5 text-xs font-semibold text-zinc-200 hover:text-white"
            >
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-400" /> Call Hotline ({BUSINESS.phone})
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </a>

            <Link
              to="/admin/login"
              className="flex items-center justify-between p-3.5 text-xs font-semibold text-amber-400/90 hover:text-amber-300"
            >
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4" /> Master Chef Kitchen Portal
              </span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. PERSISTENT FLOATING BOTTOM NAV BAR (Matching Reference Dock)           */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-3 left-3 right-3 z-50 max-w-md mx-auto">
        <div className="rounded-3xl bg-[#141418]/95 border border-[#262632] px-3 py-2 backdrop-blur-2xl shadow-2xl flex items-center justify-between">
          {/* 1. Home */}
          <button
            onClick={() => setActiveTab("home")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-all ${
              activeTab === "home" ? "text-amber-400 font-bold" : "text-zinc-400 hover:text-white"
            }`}
          >
            <Home className="h-5 w-5 mb-0.5" />
            <span>Home</span>
          </button>

          {/* 2. Menu */}
          <button
            onClick={() => setActiveTab("menu")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-all ${
              activeTab === "menu" ? "text-amber-400 font-bold" : "text-zinc-400 hover:text-white"
            }`}
          >
            <MenuIcon className="h-5 w-5 mb-0.5" />
            <span>Menu</span>
          </button>

          {/* 3. CENTER HIGHLIGHTED GOLD QR BUTTON */}
          <button
            onClick={() => setActiveTab("qr")}
            className="group relative -top-3 mx-1 flex h-13 w-13 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black shadow-lg shadow-amber-500/30 hover:scale-110 active:scale-95 transition-all"
            aria-label="Open Bonuses and Order QR"
          >
            <QrCode className="h-6 w-6" />
          </button>

          {/* 4. Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold text-zinc-400 hover:text-white transition-all"
          >
            <div className="relative">
              <ShoppingBag className="h-5 w-5 mb-0.5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 text-black text-[9px] font-extrabold px-1">
                  {count}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>

          {/* 5. Profile / Bonuses */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-semibold transition-all ${
              activeTab === "profile" ? "text-amber-400 font-bold" : "text-zinc-400 hover:text-white"
            }`}
          >
            <User className="h-5 w-5 mb-0.5" />
            <span>Profile</span>
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. DISH CUSTOMIZATION MODAL (Aloo Add-on, Spice Level, Chef Notes)         */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(selectedDishModal)}
        onOpenChange={(open) => !open && setSelectedDishModal(null)}
      >
        <DialogContent className="max-w-sm rounded-3xl bg-[#181820] border border-[#2a2a38] text-white p-5">
          {selectedDishModal && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <img
                    src={DISH_IMAGES[selectedDishModal.id] || chickenImg}
                    alt={selectedDishModal.name}
                    className="h-14 w-14 rounded-xl object-cover bg-black"
                  />
                  <div>
                    <DialogTitle className="text-sm font-bold text-white">
                      {selectedDishModal.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400 mt-0.5">
                      Handi Party Tray • Serves 4–5
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Options */}
              <div className="space-y-3 pt-2">
                {/* Royal Aloo Add-on Toggle */}
                <button
                  type="button"
                  onClick={() => setDishWithAloo(!dishWithAloo)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                    dishWithAloo
                      ? "bg-amber-400/10 border-amber-400 text-amber-300 font-semibold"
                      : "bg-[#1f1f2a] border-[#2c2c3c] text-zinc-300"
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <span className="block text-xs font-bold text-white">
                      Royal Spiced Dum Aloo (+${ALOO_CHARGE})
                    </span>
                    <span className="block text-[10px] text-zinc-400">
                      Baby potatoes slow-infused in saffron gravy
                    </span>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-md flex items-center justify-center border ${
                      dishWithAloo
                        ? "bg-amber-400 border-amber-400 text-black"
                        : "border-zinc-500"
                    }`}
                  >
                    {dishWithAloo && <Check className="h-3.5 w-3.5 font-bold" />}
                  </div>
                </button>

                {/* Extra Spicy Option */}
                <button
                  type="button"
                  onClick={() => setDishExtraSpicy(!dishExtraSpicy)}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                    dishExtraSpicy
                      ? "bg-rose-500/10 border-rose-500 text-rose-300 font-semibold"
                      : "bg-[#1f1f2a] border-[#2c2c3c] text-zinc-300"
                  }`}
                >
                  <div className="min-w-0 pr-2 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-rose-400" />
                    <div>
                      <span className="block text-xs font-bold text-white">
                        Extra Spicy Mirchi Blend
                      </span>
                      <span className="block text-[10px] text-zinc-400">
                        Traditional Hyderabadi spice kick
                      </span>
                    </div>
                  </div>
                  <div
                    className={`h-5 w-5 rounded-md flex items-center justify-center border ${
                      dishExtraSpicy
                        ? "bg-rose-500 border-rose-500 text-white"
                        : "border-zinc-500"
                    }`}
                  >
                    {dishExtraSpicy && <Check className="h-3.5 w-3.5 font-bold" />}
                  </div>
                </button>

                {/* Chef Notes Input */}
                <div>
                  <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
                    Special Instructions / Notes
                  </label>
                  <input
                    type="text"
                    value={dishNotes}
                    onChange={(e) => setDishNotes(e.target.value)}
                    placeholder="e.g. Extra raita, less oil..."
                    className="w-full rounded-xl bg-[#14141c] border border-[#2c2c3c] px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAddCustomizedDish}
                className="w-full rounded-2xl bg-amber-400 text-black font-extrabold py-3 text-sm shadow-lg shadow-amber-400/20 hover:bg-amber-300 transition-all"
              >
                Add to Handi Tray •{" "}
                {formatMoney(
                  dishWithAloo ? selectedDishModal.priceWithAloo : selectedDishModal.price,
                )}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 4. LOCATION / FULFILMENT SWITCHER MODAL                                   */}
      {/* ========================================================================= */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="max-w-sm rounded-3xl bg-[#181820] border border-[#2a2a38] text-white p-5">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-white">
              Select Location & Fulfilment
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400">
              Springfield, MO Artisanal Kitchen
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="rounded-2xl bg-[#1f1f2a] border border-amber-400/40 p-3.5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-black">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white">JAKLOUD Spice King Kitchen</h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  3625 S Bedford Ave., Springfield, MO 65809
                </p>
                <span className="inline-block mt-2 rounded bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5">
                  Active Outlet
                </span>
              </div>
            </div>

            <div className="rounded-2xl bg-[#14141c] border border-[#262632] p-3 text-xs text-zinc-400 space-y-1">
              <p className="font-semibold text-white">🕒 Daily 2:00 PM Cutoff</p>
              <p className="text-[11px]">
                Orders placed before 2:00 PM are prepared fresh on dum for next-day pickup or delivery.
              </p>
            </div>

            <button
              onClick={() => {
                setLocationModalOpen(false);
                toast.success("Outlet confirmed: Springfield, MO (3625 S Bedford Ave)");
              }}
              className="w-full rounded-2xl bg-amber-400 text-black font-bold py-2.5 text-xs shadow-md hover:bg-amber-300 transition-all"
            >
              Confirm Location
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cart Sheet Drawer */}
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  );
}
