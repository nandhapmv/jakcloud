import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Shield,
  Clock,
  MapPin,
  Truck,
  Store,
  Tag,
  Check,
  CheckCircle2,
  X,
  Flame,
  Phone,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";
import heroImg from "@/assets/hero-biryani.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/lib/cart";
import {
  BUSINESS,
  DELIVERY_FEE,
  formatDate,
  formatMoney,
  nextAvailableDate,
  ALOO_CHARGE,
  type ProteinId,
} from "@/lib/menu";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Handi Cart — JAKLOUD Spice King Dum Biryani" },
      {
        name: "description",
        content:
          "Review your handcrafted Dum Biryani Handi order. Customize tray quantities, add promo codes, and proceed to Springfield pickup or delivery checkout.",
      },
      { property: "og:title", content: "Handi Cart — JAKLOUD Dum Biryani" },
      { property: "og:description", content: "Review your royal Dum Biryani order before checkout." },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: CartPage,
});

const DISH_IMAGES: Record<string, string> = {
  chicken: chickenImg,
  mutton: muttonImg,
  beef: rawBeefImg,
  pork: rawPorkImg,
  paneer: paneerImg,
  prawn: prawnImg,
};

const VALID_PROMOS: Record<string, { discountPercent: number; discountFixed: number; label: string }> = {
  SPICEKING: { discountPercent: 10, discountFixed: 0, label: "10% Royal Welcome Discount" },
  ROYAL10: { discountPercent: 10, discountFixed: 0, label: "10% Off Royal Dum Feasts" },
  HALALFEAST: { discountPercent: 0, discountFixed: 15, label: "$15 Off Halal Family Order" },
  SPRINGFIELD5: { discountPercent: 5, discountFixed: 0, label: "5% Local Springfield Neighbor Discount" },
};

export function CartPage() {
  const { lines, setQty, removeLine, clear, subtotal, count, addLine } = useCart();
  const navigate = useNavigate();
  const nextDate = formatDate(nextAvailableDate());

  // Fulfilment Choice
  const [fulfilmentType, setFulfilmentType] = useState<"pickup" | "delivery">("pickup");

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    discountFixed: number;
    label: string;
  } | null>(null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (VALID_PROMOS[code]) {
      setAppliedPromo({ code, ...VALID_PROMOS[code] });
      toast.success(`Promo code "${code}" applied: ${VALID_PROMOS[code].label}!`);
      setPromoInput("");
    } else {
      toast.error(`Promo code "${code}" is invalid or expired.`);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.info("Promo code removed.");
  };

  // Calculations
  const calculations = useMemo(() => {
    let discountAmount = 0;
    if (appliedPromo) {
      if (appliedPromo.discountPercent > 0) {
        discountAmount = (subtotal * appliedPromo.discountPercent) / 100;
      } else if (appliedPromo.discountFixed > 0) {
        discountAmount = Math.min(appliedPromo.discountFixed, subtotal);
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const tax = discountedSubtotal * 0.086; // 8.6% Springfield tax
    const deliveryCost = fulfilmentType === "delivery" ? (count >= 5 ? 0 : DELIVERY_FEE) : 0;
    const grandTotal = discountedSubtotal + tax + deliveryCost;

    return {
      subtotal,
      discountAmount,
      discountedSubtotal,
      tax,
      deliveryCost,
      grandTotal,
    };
  }, [subtotal, appliedPromo, fulfilmentType, count]);

  const whatsappCheckoutUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    `Hello Master Chef Kartheek! I would like to place my JAKLOUD order:\n\n` +
      lines.map((l) => `• ${l.qty}x ${l.name} (${l.aloo ? "+Aloo" : "Plain"}${l.extraSpicy ? ", Extra Spicy" : ""}) - $${(l.unitPrice * l.qty).toFixed(2)}`).join("\n") +
      `\n\nFulfilment: ${fulfilmentType.toUpperCase()}\nDate: ${nextDate}\nTotal: $${calculations.grandTotal.toFixed(2)}` +
      (appliedPromo ? `\nPromo: ${appliedPromo.code}` : ""),
  )}`;

  const quickRecommendations = [
    {
      id: "chicken" as const,
      name: "Royal Chicken Dum Biryani",
      price: 101.99,
      image: chickenImg,
      serves: "Serves 4–5",
    },
    {
      id: "mutton" as const,
      name: "Hyderabadi Shahi Mutton Dum",
      price: 157.99,
      image: muttonImg,
      serves: "Serves 4–5",
    },
    {
      id: "paneer" as const,
      name: "Royal Shahi Paneer Dum (Veg)",
      price: 98.99,
      image: paneerImg,
      serves: "Serves 4–5",
    },
  ];

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold relative overflow-hidden pb-24">
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO HEADER                                                */}
      {/* ------------------------------------------------------------- */}
      <section className="relative border-b border-gold/20 bg-gradient-to-r from-[#170f0a] via-[#24150d] to-[#170f0a] py-10 px-4 sm:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-black/80 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/60 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-gold shadow-[0_0_20px_rgba(212,160,23,0.3)]">
            <ShoppingBag className="h-3.5 w-3.5 text-gold animate-pulse" />
            <span>Made To Order Handi Reservation</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-wide text-cream">
            Your Handi <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">Shopping Bag</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-cream/80 leading-relaxed">
            Every handi tray is cooked fresh to order by Master Chef Kartheek. Confirm your quantities, apply promo codes, and complete your Springfield booking.
          </p>

          <div className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-black/60 px-3.5 py-1.5 text-xs text-cream/90 shadow-md">
            <Calendar className="h-3.5 w-3.5 text-gold" />
            <span>Next Available Fulfillment: <strong className="text-gold">{nextDate}</strong></span>
            <span className="text-gold/40">•</span>
            <span className="text-saffron font-semibold">2:00 PM Cutoff</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN 2-COLUMN CART LAYOUT                                  */}
      {/* ------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
        {count === 0 ? (
          /* EMPTY CART SCREEN WITH RECOMMENDATIONS */
          <div className="max-w-3xl mx-auto space-y-10 text-center py-8">
            <div className="rounded-3xl border border-gold/30 bg-gradient-to-b from-[#18100a] via-[#120c08] to-[#0a0705] p-8 sm:p-12 shadow-2xl backdrop-blur-2xl space-y-6">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold/15 border-2 border-gold/40 text-gold shadow-[0_0_30px_rgba(212,160,23,0.3)]">
                <ShoppingBag className="h-10 w-10 opacity-70" />
              </div>

              <div className="space-y-1">
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream">
                  Your Handi Cart is Empty
                </h2>
                <p className="text-xs sm:text-sm text-cream/70 max-w-md mx-auto pt-1">
                  You haven't reserved any slow-cooked Dum Biryani Handi trays yet. Explore our royal menu or custom protein cuts.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button asChild size="lg" className="rounded-2xl bg-gradient-to-r from-chili to-gold text-white font-bold text-xs px-6 py-5 shadow-lg hover:scale-105 transition-all">
                  <Link to="/menu">
                    <UtensilsCrossed className="h-4 w-4 mr-1.5" /> Explore Handi Menu →
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="rounded-2xl border-gold/40 text-gold hover:bg-gold/15 text-xs font-bold px-6 py-5">
                  <Link to="/trays">
                    <Sparkles className="h-4 w-4 mr-1.5" /> Multi-Tray Packages
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Add Recommendations */}
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between border-b border-gold/15 pb-2">
                <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                  <Flame className="h-4 w-4 text-chili" />
                  <span>Popular Signature Trays</span>
                </h3>
                <span className="text-xs text-gold">Feeds 4–5 Adults Each</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {quickRecommendations.map((dish) => (
                  <div
                    key={dish.id}
                    className="rounded-2xl border border-gold/25 bg-[#140e09] p-3.5 shadow-xl flex flex-col justify-between space-y-3 group hover:border-gold/60 transition-all"
                  >
                    <div className="relative h-32 w-full rounded-xl overflow-hidden border border-gold/20">
                      <img src={dish.image} alt={dish.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-display text-xs font-bold text-cream truncate">{dish.name}</h4>
                      <p className="text-[0.65rem] text-cream/60">{dish.servings} • 1.6–1.8 kg Meat</p>
                      <p className="font-display text-sm font-bold text-gold">{formatMoney(dish.price)}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        addLine({
                          proteinId: dish.id,
                          name: dish.name,
                          aloo: false,
                          extraSpicy: false,
                          notes: "Quick add from cart",
                          qty: 1,
                          unitPrice: dish.price,
                        });
                        toast.success(`${dish.name} added to your cart!`);
                      }}
                      className="w-full rounded-xl bg-gradient-to-r from-chili to-gold text-white text-[0.7rem] font-bold py-1.5"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Tray
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* ACTIVE CART WITH ITEMS */
          <div className="grid gap-10 lg:grid-cols-12 items-start">
            {/* ========================================================= */}
            {/* LEFT: ORDERED ITEMS LIST (7-8 COLS)                       */}
            {/* ========================================================= */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-cream">
                    Reserved Handi Trays ({count})
                  </h2>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to empty your cart?")) {
                      clear();
                      toast.info("Cart cleared");
                    }
                  }}
                  className="text-xs text-chili hover:underline font-semibold flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              {/* Items Card List */}
              <div className="space-y-4">
                {lines.map((line) => {
                  const dishImage = DISH_IMAGES[line.proteinId] || heroImg;
                  const isHalal = line.proteinId !== "pork";

                  return (
                    <div
                      key={line.key}
                      className="group relative rounded-3xl border border-gold/30 bg-[#120c08]/95 p-5 sm:p-6 backdrop-blur-xl shadow-2xl transition-all hover:border-gold/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden border border-gold/30 shrink-0">
                          <img
                            src={dishImage}
                            alt={line.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-1 left-1">
                            {isHalal ? (
                              <span className="rounded bg-emerald-950/90 border border-emerald-500/50 px-1.5 py-0.2 text-[0.58rem] font-bold text-emerald-400">
                                Halal
                              </span>
                            ) : (
                              <span className="rounded bg-amber-950/90 border border-amber-500/50 px-1.5 py-0.2 text-[0.58rem] font-bold text-amber-300">
                                Specialty
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-display text-base sm:text-lg font-bold text-cream group-hover:text-gold transition-colors">
                              {line.name}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[0.7rem]">
                            <span className="rounded-md bg-gold/15 border border-gold/30 px-2 py-0.5 text-gold font-semibold">
                              {line.aloo ? "✓ Added Spiced Baby Aloo (+ $7)" : "No Potatoes"}
                            </span>

                            <span className="rounded-md bg-black/60 border border-gold/20 px-2 py-0.5 text-cream/80 flex items-center gap-1">
                              <Flame className="h-3 w-3 text-chili" />
                              <span>{line.extraSpicy ? "Extra Spicy Flame" : "Regular Spice"}</span>
                            </span>

                            <span className="text-cream/50">•</span>
                            <span className="text-cream/60">Feeds 4–5 Adults</span>
                          </div>

                          {line.notes && (
                            <p className="text-[0.68rem] text-gold/90 bg-black/40 rounded-xl p-2 border border-gold/15 italic">
                              Note: {line.notes}
                            </p>
                          )}

                          <div className="pt-1 flex items-baseline gap-2">
                            <span className="text-[0.7rem] text-cream/60">Unit Price:</span>
                            <span className="font-display text-sm font-bold text-gold">
                              {formatMoney(line.unitPrice)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity Stepper & Line Total */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gold/15 shrink-0">
                        <div className="text-right">
                          <span className="text-[0.65rem] text-cream/50 uppercase tracking-wider block">Line Total</span>
                          <span className="font-display text-xl sm:text-2xl font-bold text-gold">
                            {formatMoney(line.unitPrice * line.qty)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Quantity Controller */}
                          <div className="flex items-center rounded-2xl border border-gold/30 bg-black/60 text-cream p-1">
                            <button
                              type="button"
                              onClick={() => setQty(line.key, line.qty - 1)}
                              className="h-8 w-8 flex items-center justify-center text-sm text-gold hover:bg-gold/20 rounded-xl transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-cream">{line.qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty(line.key, line.qty + 1)}
                              className="h-8 w-8 flex items-center justify-center text-sm text-gold hover:bg-gold/20 rounded-xl transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              removeLine(line.key);
                              toast.info(`Removed ${line.name} from cart`);
                            }}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-black/40 border border-gold/20 text-cream/60 hover:text-chili hover:border-chili/40 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code Card */}
              <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gold" />
                    <h3 className="font-display text-base font-bold text-cream">Have a Royal Promo Code?</h3>
                  </div>
                  <span className="text-[0.68rem] text-gold/80 font-mono">Try: SPICEKING</span>
                </div>

                {appliedPromo ? (
                  <div className="flex items-center justify-between rounded-2xl bg-emerald-950/60 border border-emerald-500/50 p-3.5 text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="font-bold text-white uppercase font-mono">{appliedPromo.code}</p>
                        <p className="text-[0.7rem] text-emerald-300/90">{appliedPromo.label}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="flex items-center gap-1 rounded-lg bg-black/40 border border-emerald-500/30 px-2 py-1 text-[0.65rem] text-emerald-400 hover:text-white transition-colors"
                    >
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter promo code (e.g. SPICEKING)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="bg-black/60 border-gold/25 text-cream placeholder:text-cream/40 text-xs rounded-xl uppercase font-mono tracking-wider focus:border-gold"
                    />
                    <Button
                      type="submit"
                      disabled={!promoInput.trim()}
                      className="rounded-xl bg-gold text-black hover:bg-gold/90 font-bold text-xs px-5 shrink-0"
                    >
                      Apply
                    </Button>
                  </form>
                )}
              </div>

              {/* Fulfilment Method Switcher */}
              <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-5 sm:p-6 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-base font-bold text-cream flex items-center gap-2">
                    <Store className="h-4 w-4 text-gold" />
                    <span>Select Fulfilment Method</span>
                  </h3>
                  <span className="text-[0.68rem] text-cream/60">Springfield, Missouri</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfilmentType("pickup")}
                    className={`rounded-2xl p-4 text-left border transition-all ${
                      fulfilmentType === "pickup"
                        ? "bg-gold/20 border-gold text-gold shadow-md font-bold"
                        : "bg-black/40 border-gold/20 text-cream/70 hover:bg-black/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4" />
                      <span className="text-xs font-bold">Counter Pickup (Free)</span>
                    </div>
                    <p className="text-[0.65rem] text-cream/60 mt-1">3625 S Bedford Ave, Springfield</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfilmentType("delivery")}
                    className={`rounded-2xl p-4 text-left border transition-all ${
                      fulfilmentType === "delivery"
                        ? "bg-chili/30 border-chili text-amber-200 shadow-md font-bold"
                        : "bg-black/40 border-gold/20 text-cream/70 hover:bg-black/60"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span className="text-xs font-bold">
                        Doorstep Delivery ({count >= 5 ? "FREE" : `$${DELIVERY_FEE}`})
                      </span>
                    </div>
                    <p className="text-[0.65rem] text-cream/60 mt-1">Within 10 miles of 65809 (2–6 PM)</p>
                  </button>
                </div>
              </div>

              {/* Add More Items Bar */}
              <div className="flex items-center justify-between pt-2">
                <Button asChild variant="ghost" className="text-xs text-gold hover:bg-gold/15 rounded-xl font-bold">
                  <Link to="/menu">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Add More Dishes from Menu
                  </Link>
                </Button>

                <Button asChild variant="ghost" className="text-xs text-gold hover:bg-gold/15 rounded-xl font-bold">
                  <Link to="/trays">
                    <Sparkles className="h-4 w-4 mr-1" /> Multi-Tray Catering
                  </Link>
                </Button>
              </div>
            </div>

            {/* ========================================================= */}
            {/* RIGHT: STICKY ORDER SUMMARY (4-5 COLS)                    */}
            {/* ========================================================= */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-5">
              <div className="rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-[#18100a] via-[#120c08] to-[#0a0705] p-6 shadow-2xl backdrop-blur-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gold">Order Review</span>
                    <h3 className="font-display text-xl font-bold text-cream">Checkout Summary</h3>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                </div>

                {/* Serving & Portion Guarantee */}
                <div className="rounded-2xl bg-black/50 border border-gold/20 p-4 space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-cream">
                    <span>Total Trays in Order:</span>
                    <span className="text-gold font-display text-sm">{count} Handi Trays</span>
                  </div>
                  <div className="space-y-1 text-[0.7rem] text-cream/75">
                    <p className="flex items-center gap-1.5 text-gold font-medium">
                      <Users className="h-3.5 w-3.5" />
                      <span>Comfortably feeds {count * 4}–{count * 5} adults</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5 text-gold" />
                      <span>{(1.7 * count).toFixed(1)} kg Meat • {(1.0 * count).toFixed(1)} kg Basmati</span>
                    </p>
                  </div>
                </div>

                {/* Itemized Calculation */}
                <div className="space-y-2.5 pt-1 text-xs">
                  <div className="flex justify-between text-cream/80">
                    <span>Subtotal:</span>
                    <span>{formatMoney(calculations.subtotal)}</span>
                  </div>

                  {calculations.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Promo Discount ({appliedPromo?.code}):</span>
                      <span>−{formatMoney(calculations.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-cream/70">
                    <span>Springfield Food Tax (8.6%):</span>
                    <span>{formatMoney(calculations.tax)}</span>
                  </div>

                  <div className="flex justify-between text-cream/70">
                    <span>Fulfilment ({fulfilmentType === "pickup" ? "Pickup" : "Delivery"}):</span>
                    <span>{calculations.deliveryCost === 0 ? "Free" : formatMoney(calculations.deliveryCost)}</span>
                  </div>

                  <div className="pt-3 border-t border-gold/25 flex justify-between items-baseline">
                    <span className="font-display text-base font-bold text-cream">Grand Total:</span>
                    <span className="font-display text-2xl font-bold text-gold drop-shadow-md">
                      {formatMoney(calculations.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2.5 pt-2">
                  <Button
                    onClick={() => navigate({ to: "/checkout" })}
                    size="lg"
                    className="w-full rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-sm sm:text-base py-6 shadow-[0_0_25px_rgba(185,28,28,0.5)] hover:scale-[1.02] transition-all gap-2"
                  >
                    <span>Continue to Checkout ({formatMoney(calculations.grandTotal)}) →</span>
                  </Button>

                  <a
                    href={whatsappCheckoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/80 p-3.5 text-xs font-bold text-emerald-400 hover:border-emerald-400 transition-all shadow-md"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>WhatsApp Instant Checkout</span>
                  </a>

                  <a
                    href={`tel:${BUSINESS.phone}`}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-black/60 hover:bg-gold/15 p-2.5 text-[0.72rem] font-semibold text-gold transition-all"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    <span>Call Hotline: {BUSINESS.phone}</span>
                  </a>
                </div>

                {/* Batch Guarantee Stamp */}
                <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-gold/20 p-2.5 text-[0.68rem] text-gold">
                  <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>100% Zabiha Halal • Handcrafted in Springfield, MO</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
