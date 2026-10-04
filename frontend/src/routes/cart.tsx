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
  Users,
  Scale,
  UtensilsCrossed,
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
      servings: "Serves 4–5",
    },
    {
      id: "mutton" as const,
      name: "Hyderabadi Shahi Mutton Dum",
      price: 157.99,
      image: muttonImg,
      servings: "Serves 4–5",
    },
    {
      id: "paneer" as const,
      name: "Royal Shahi Paneer Dum (Veg)",
      price: 98.99,
      image: paneerImg,
      servings: "Serves 4–5",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-100 selection:bg-amber-500/20 selection:text-amber-300 relative overflow-hidden pb-24">
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO HEADER                                                */}
      {/* ------------------------------------------------------------- */}
      <section className="relative border-b border-white/[0.08] bg-[#0c0c0e] py-10 px-6 sm:px-8 text-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/60 px-4 py-1 text-xs font-medium text-amber-300 shadow-sm">
            <ShoppingBag className="h-3.5 w-3.5 text-amber-400" />
            <span>Handcrafted Dum Biryani Reservation</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-100">
            Your Handi <span className="text-amber-400 italic font-normal">Shopping Bag</span>
          </h1>

          <p className="mx-auto max-w-xl text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
            Every handi tray is cooked fresh to order by Master Chef Kartheek. Confirm your quantities and proceed to Springfield booking.
          </p>

          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-3.5 py-1.5 text-xs text-zinc-300 shadow-sm font-normal">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>Next Available Fulfillment: <strong className="text-zinc-100 font-medium">{nextDate}</strong></span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400">2:00 PM Cutoff</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN 2-COLUMN CART LAYOUT                                  */}
      {/* ------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl px-6 sm:px-8 py-10">
        {count === 0 ? (
          /* EMPTY CART SCREEN WITH RECOMMENDATIONS */
          <div className="max-w-3xl mx-auto space-y-8 text-center py-6">
            <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-8 sm:p-10 shadow-sm space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <ShoppingBag className="h-8 w-8 opacity-75" />
              </div>

              <div className="space-y-1">
                <h2 className="font-display text-xl sm:text-2xl font-semibold text-zinc-100">
                  Your Handi Cart is Empty
                </h2>
                <p className="text-xs sm:text-sm text-zinc-400 font-normal max-w-md mx-auto pt-1">
                  You haven't reserved any slow-cooked Dum Biryani Handi trays yet. Explore our royal menu to begin.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <Button asChild size="lg" className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold text-xs px-6 py-4 shadow-md hover:brightness-105 transition-all">
                  <Link to="/menu">
                    <UtensilsCrossed className="h-4 w-4 mr-1.5" /> Explore Handi Menu →
                  </Link>
                </Button>

                <Button asChild variant="outline" size="lg" className="rounded-xl border-white/10 text-zinc-300 hover:bg-zinc-800 text-xs font-medium px-6 py-4">
                  <Link to="/trays">
                    <Sparkles className="h-4 w-4 mr-1.5" /> Multi-Tray Packages
                  </Link>
                </Button>
              </div>
            </div>

            {/* Quick Add Recommendations */}
            <div className="space-y-3.5 text-left">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                <h3 className="font-semibold text-sm text-zinc-100 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span>Popular Signature Trays</span>
                </h3>
                <span className="text-xs text-zinc-400 font-normal">Feeds 4–5 Adults Each</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {quickRecommendations.map((dish) => (
                  <div
                    key={dish.id}
                    className="rounded-xl border border-white/[0.08] bg-[#121216] p-3.5 shadow-sm flex flex-col justify-between space-y-2.5 hover:border-amber-500/30 transition-all"
                  >
                    <div className="relative h-32 w-full rounded-lg overflow-hidden border border-white/5">
                      <img src={dish.image} alt={dish.name} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-semibold text-zinc-100 truncate">{dish.name}</h4>
                      <p className="text-[11px] text-zinc-400 font-normal">{dish.servings} • 1.6–1.8 kg Meat</p>
                      <p className="text-xs font-semibold text-amber-400 font-mono pt-1">{formatMoney(dish.price)}</p>
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
                      className="w-full rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-medium py-1.5 cursor-pointer"
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
          <div className="grid gap-8 lg:grid-cols-12 items-start">
            {/* LEFT: ORDERED ITEMS LIST */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-semibold text-zinc-100">
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
                  className="text-xs text-zinc-400 hover:text-rose-400 font-normal flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              {/* Items Card List */}
              <div className="space-y-3">
                {lines.map((line) => {
                  const dishImage = DISH_IMAGES[line.proteinId] || heroImg;
                  const isHalal = line.proteinId !== "pork";

                  return (
                    <div
                      key={line.key}
                      className="rounded-2xl border border-white/[0.08] bg-[#121216] p-4 shadow-sm transition-all hover:border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Left: Thumbnail & Details */}
                      <div className="flex items-start gap-3.5 min-w-0 flex-1">
                        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-xl overflow-hidden border border-white/5 shrink-0">
                          <img
                            src={dishImage}
                            alt={line.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <div className="absolute top-1 left-1">
                            {isHalal ? (
                              <span className="rounded bg-black/70 border border-emerald-500/40 px-1.5 py-0.2 text-[9px] font-medium text-emerald-400">
                                Halal
                              </span>
                            ) : (
                              <span className="rounded bg-black/70 border border-amber-500/40 px-1.5 py-0.2 text-[9px] font-medium text-amber-300">
                                Specialty
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-amber-300 transition-colors">
                              {line.name}
                            </h3>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs font-normal">
                            <span className="rounded-md bg-zinc-900 border border-white/[0.06] px-2 py-0.5 text-zinc-300">
                              {line.aloo ? "• Royal Dum Aloo (Free)" : "• Plain / No Aloo"}
                            </span>

                            <span className="rounded-md bg-zinc-900 border border-white/[0.06] px-2 py-0.5 text-zinc-400 flex items-center gap-1">
                              {line.extraSpicy ? (
                                <>
                                  <Flame className="h-3 w-3 text-rose-400" />
                                  <span className="text-rose-300 font-medium">Spicy</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3 text-emerald-400" />
                                  <span className="text-emerald-300 font-medium">No Spicy (Mild)</span>
                                </>
                              )}
                            </span>

                            <span className="text-zinc-600">•</span>
                            <span className="text-zinc-400">Serves 4–5</span>
                          </div>

                          {line.notes && (
                            <p className="text-[11px] text-zinc-400 bg-zinc-900/60 rounded-lg p-2 border border-white/[0.05] italic font-normal">
                              Note: {line.notes}
                            </p>
                          )}

                          <div className="pt-0.5 flex items-baseline gap-2">
                            <span className="text-xs text-zinc-400 font-normal">Unit Price:</span>
                            <span className="text-xs font-semibold text-amber-400 font-mono">
                              {formatMoney(line.unitPrice)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quantity Stepper & Line Total */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-white/[0.06] shrink-0">
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-normal">Line Total</span>
                          <span className="text-base sm:text-lg font-semibold text-amber-400 font-mono">
                            {formatMoney(line.unitPrice * line.qty)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Quantity Controller */}
                          <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900/80 p-0.5">
                            <button
                              type="button"
                              onClick={() => setQty(line.key, line.qty - 1)}
                              className="h-7 w-7 flex items-center justify-center text-xs text-zinc-400 hover:text-zinc-100 rounded transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-medium text-zinc-100 font-mono">{line.qty}</span>
                            <button
                              type="button"
                              onClick={() => setQty(line.key, line.qty + 1)}
                              className="h-7 w-7 flex items-center justify-center text-xs text-amber-400 hover:text-amber-300 rounded transition-colors cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => {
                              removeLine(line.key);
                              toast.info(`Removed ${line.name} from cart`);
                            }}
                            className="h-8 w-8 flex items-center justify-center rounded-lg bg-zinc-900/60 border border-white/10 text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code Card */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-4 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-amber-400" />
                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-100">Have a Promo Code?</h3>
                  </div>
                  <span className="text-xs text-zinc-400 font-mono">Try: SPICEKING</span>
                </div>

                {appliedPromo ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-3 text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-semibold">{appliedPromo.code}</span> ({appliedPromo.label})
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-xs text-zinc-400 hover:text-rose-400 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <Input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Enter promo code"
                      className="bg-zinc-900/80 border-white/10 text-zinc-100 text-xs rounded-lg uppercase font-mono"
                    />
                    <Button
                      type="submit"
                      className="rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-medium px-4 cursor-pointer"
                    >
                      Apply
                    </Button>
                  </form>
                )}
              </div>

              {/* Fulfilment Method Switcher */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center gap-2">
                    <Store className="h-4 w-4 text-amber-400" />
                    <span>Select Fulfilment Method</span>
                  </h3>
                  <span className="text-xs text-zinc-400 font-normal">Springfield, Missouri</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfilmentType("pickup")}
                    className={`rounded-xl p-3 text-left border transition-all cursor-pointer ${
                      fulfilmentType === "pickup"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-medium"
                        : "bg-zinc-900/40 border-white/[0.06] text-zinc-400 hover:text-zinc-200 font-normal"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Store className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-medium text-zinc-100">Counter Pickup (Free)</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 font-normal">3625 S Bedford Ave, Springfield</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfilmentType("delivery")}
                    className={`rounded-xl p-3 text-left border transition-all cursor-pointer ${
                      fulfilmentType === "delivery"
                        ? "bg-amber-500/10 border-amber-500/40 text-amber-300 font-medium"
                        : "bg-zinc-900/40 border-white/[0.06] text-zinc-400 hover:text-zinc-200 font-normal"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-amber-400" />
                      <span className="text-xs font-medium text-zinc-100">
                        Doorstep Delivery ({count >= 5 ? "FREE" : `$${DELIVERY_FEE}`})
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 mt-1 font-normal">Within 10 miles of 65809</p>
                  </button>
                </div>
              </div>

              {/* Add More Items Bar */}
              <div className="flex items-center justify-between pt-1">
                <Button asChild variant="ghost" className="text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg font-medium cursor-pointer">
                  <Link to="/menu">
                    <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Add More Dishes from Menu
                  </Link>
                </Button>

                <Button asChild variant="ghost" className="text-xs text-amber-400 hover:bg-amber-500/10 rounded-lg font-medium cursor-pointer">
                  <Link to="/trays">
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> Multi-Tray Packages
                  </Link>
                </Button>
              </div>
            </div>

            {/* RIGHT: STICKY ORDER SUMMARY */}
            <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-4">
              <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-100">Checkout Summary</h3>
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <ShoppingBag className="h-4 w-4" />
                  </div>
                </div>

                {/* Serving & Portion Guarantee */}
                <div className="rounded-xl bg-zinc-900/50 border border-white/[0.05] p-3 space-y-1.5 text-xs font-normal">
                  <div className="flex justify-between font-medium text-zinc-200">
                    <span>Total Trays:</span>
                    <span className="text-amber-400 font-mono">{count} Handi Trays</span>
                  </div>
                  <div className="space-y-0.5 text-[11px] text-zinc-400">
                    <p className="flex items-center gap-1.5 text-zinc-300">
                      <Users className="h-3.5 w-3.5 text-amber-400" />
                      <span>Comfortably feeds {count * 4}–{count * 5} adults</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5 text-amber-400" />
                      <span>{(1.7 * count).toFixed(1)} kg Meat • {(1.0 * count).toFixed(1)} kg Basmati</span>
                    </p>
                  </div>
                </div>

                {/* Itemized Calculation */}
                <div className="space-y-2 text-xs text-zinc-400 font-normal pt-1">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono text-zinc-200">{formatMoney(calculations.subtotal)}</span>
                  </div>

                  {calculations.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Promo Discount ({appliedPromo?.code}):</span>
                      <span className="font-mono">−{formatMoney(calculations.discountAmount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Springfield Food Tax (8.6%):</span>
                    <span className="font-mono text-zinc-200">{formatMoney(calculations.tax)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Fulfilment ({fulfilmentType === "pickup" ? "Pickup" : "Delivery"}):</span>
                    <span className="font-mono text-zinc-200">{calculations.deliveryCost === 0 ? "Free" : formatMoney(calculations.deliveryCost)}</span>
                  </div>

                  <div className="pt-2.5 border-t border-white/[0.08] flex justify-between items-baseline">
                    <span className="text-sm font-semibold text-zinc-100">Grand Total:</span>
                    <span className="text-lg font-semibold text-amber-400 font-mono">
                      {formatMoney(calculations.grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-1">
                  <Button
                    onClick={() => navigate({ to: "/checkout" })}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold text-xs sm:text-sm py-3.5 shadow-md hover:brightness-105 transition-all gap-1.5 cursor-pointer"
                  >
                    <span>Continue to Checkout ({formatMoney(calculations.grandTotal)}) →</span>
                  </Button>

                  <a
                    href={whatsappCheckoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 p-2.5 text-xs font-medium text-emerald-400 transition-all cursor-pointer"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>WhatsApp Instant Checkout</span>
                  </a>

                  <a
                    href={`tel:${BUSINESS.phone}`}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 p-2 text-xs font-normal text-zinc-300 hover:text-amber-400 transition-all"
                  >
                    <Phone className="h-3 w-3 text-amber-400" />
                    <span>Call Hotline: {BUSINESS.phone}</span>
                  </a>
                </div>

                {/* Batch Guarantee Stamp */}
                <div className="flex items-center gap-2 rounded-lg bg-zinc-900/40 border border-white/[0.06] p-2 text-[10px] text-zinc-400 font-normal">
                  <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
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
