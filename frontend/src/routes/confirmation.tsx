import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  Store,
  Phone,
  MessageSquare,
  Share2,
  Navigation,
  Printer,
  Copy,
  Star,
  Shield,
  Sparkles,
  Flame,
  ArrowRight,
  Heart,
  ExternalLink,
  ChevronRight,
  ShoppingBag,
  Calendar,
  Info,
  Check,
  Award,
} from "lucide-react";
import { toast } from "sonner";

import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";
import heroImg from "@/assets/hero-biryani.jpg";
import logoImg from "@/assets/logo.png";
import dumHandiImg from "@/assets/dum-handi.jpg";

import { Button } from "@/components/ui/button";
import {
  BUSINESS,
  DELIVERY_FEE,
  formatDate,
  formatMoney,
  nextAvailableDate,
} from "@/lib/menu";

export const Route = createFileRoute("/confirmation")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — JAKLOUD Spice King Dum Biryani" },
      {
        name: "description",
        content:
          "Thank you for your royal Dum Biryani Handi booking! View your order timeline, delivery schedule, Google Maps directions, and chef contacts in Springfield, MO.",
      },
      { property: "og:title", content: "Order Confirmed — JAKLOUD Dum Biryani" },
      {
        property: "og:description",
        content: "Royal Handi Dum booking confirmed with Master Chef Kartheek in Springfield, MO.",
      },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: OrderConfirmationPage,
});

const DISH_IMAGES: Record<string, string> = {
  chicken: chickenImg,
  mutton: muttonImg,
  beef: rawBeefImg,
  pork: rawPorkImg,
  paneer: paneerImg,
  prawn: prawnImg,
};

const ORDER_TIMELINE_STAGES = [
  {
    step: 1,
    title: "Order Received & Verified",
    time: "Today, 1:15 PM",
    status: "completed",
    description: "Your handi reservation is confirmed in our Springfield kitchen queue.",
    icon: CheckCircle2,
  },
  {
    step: 2,
    title: "18-Hour Royal Marination",
    time: "Today, 4:00 PM",
    status: "current",
    description: "Meat infused with whole roasted spices, Kashmiri chilies, and farm curd.",
    icon: Flame,
  },
  {
    step: 3,
    title: "Morning Charcoal Coal Dum",
    time: "Tomorrow, 6:00 – 10:30 AM",
    status: "upcoming",
    description: "Slow-steamed in sealed dough clay handis over glowing hardwood embers.",
    icon: Sparkles,
  },
  {
    step: 4,
    title: "Thermal Sealing & Inspection",
    time: "Tomorrow, 11:30 AM",
    status: "upcoming",
    description: "Packed in golden 90-minute heat retention insulated carriers.",
    icon: Award,
  },
  {
    step: 5,
    title: "Counter Handover / Doorstep Delivery",
    time: "Tomorrow, 12:00 – 2:00 PM",
    status: "upcoming",
    description: "Piping hot delivery or counter collection at 3625 S Bedford Ave.",
    icon: Truck,
  },
];

export function OrderConfirmationPage() {
  const nextDate = formatDate(nextAvailableDate());

  // Mock Active Confirmed Order Details
  const orderData = useMemo(() => {
    return {
      orderId: "JK-94821",
      customer: {
        name: "Dr. Bradley Hayes",
        phone: "417-897-9754",
        email: "patron@jakloud.com",
        address: "1420 E Primrose St., Suite 200",
        city: "Springfield",
        zipCode: "65804",
        landmark: "Near Mercy Medical Mile / Building B",
      },
      fulfilmentType: "delivery" as "pickup" | "delivery",
      fulfilmentDate: nextDate,
      fulfilmentTime: "1:00 PM",
      items: [
        {
          id: "chicken",
          name: "Royal Chicken Dum Biryani",
          qty: 2,
          unitPrice: 101.99,
          aloo: true,
          extraSpicy: true,
          notes: "Extra spicy flame, keep extra warm in thermal bag.",
          serves: "Serves 8–10 adults",
        },
        {
          id: "mutton",
          name: "Hyderabadi Shahi Mutton Dum",
          qty: 1,
          unitPrice: 157.99,
          aloo: false,
          extraSpicy: false,
          notes: "Nizami goat cuts slow-braised in desi ghee.",
          serves: "Serves 4–5 adults",
        },
      ],
      pricing: {
        subtotal: 368.97,
        promoCode: "SPICEKING",
        promoDiscount: 36.90,
        tax: 28.56,
        deliveryFee: 10.0,
        grandTotal: 370.63,
      },
    };
  }, [nextDate]);

  // Customer Star Rating Widget State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewText, setReviewText] = useState("");

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderData.orderId);
    toast.success(`Copied Order ID "${orderData.orderId}" to clipboard!`);
  };

  const handleShareOrder = async () => {
    const shareText = `👑 My JAKLOUD Dum Biryani Handi Order (${orderData.orderId}) is confirmed for ${orderData.fulfilmentDate} at ${orderData.fulfilmentTime}! Slow-cooked royal biryani in Springfield, MO.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "JAKLOUD Dum Biryani Order",
          text: shareText,
          url: window.location.href,
        });
        toast.success("Order shared successfully!");
      } catch {
        /* User cancelled */
      }
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Order summary copied to clipboard!");
    }
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitted(true);
    toast.success("Thank you for your royal feedback! Your review has been saved.");
  };

  const whatsappChatUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    `Hello Master Chef Kartheek! I am inquiring about my confirmed order #${orderData.orderId} for ${orderData.fulfilmentDate}.`,
  )}`;

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold relative overflow-hidden pb-28">
      {/* Golden Confetti & Ambient Aura */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-gold/15 blur-[160px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[450px] h-[450px] rounded-full bg-chili/10 blur-[150px] pointer-events-none" />

      {/* ------------------------------------------------------------- */}
      {/* 1. HERO CELEBRATION & THANK-YOU ILLUSTRATION BANNER           */}
      {/* ------------------------------------------------------------- */}
      <section className="relative border-b border-gold/20 bg-gradient-to-r from-[#1a0f09] via-[#29170e] to-[#1a0f09] py-14 px-4 sm:px-8 text-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl space-y-5">
          {/* Animated Royal Handi Crest */}
          <div className="relative mx-auto flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center">
            <div className="absolute -inset-2 rounded-full bg-gold/30 blur-md animate-pulse" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-chili via-amber-600 to-gold border-2 border-gold text-white shadow-[0_0_50px_rgba(212,160,23,0.8)]">
              <CheckCircle2 className="h-14 w-14 sm:h-16 sm:w-16 stroke-[2.5] animate-bounce" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-gold shadow-lg">
              <Sparkles className="h-3.5 w-3.5 text-gold animate-spin" />
              <span>Royal Dum Reservation Confirmed</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-wide text-cream">
              Thank You, <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">{orderData.customer.name}!</span>
            </h1>

            <p className="mx-auto max-w-2xl text-xs sm:text-sm text-cream/80 leading-relaxed">
              Your handcrafted Dum Biryani Handi booking has been scheduled with Master Chef Kartheek. Each tray is
              slow-cooked from scratch over morning hardwood coal embers for deep aromatic richness.
            </p>
          </div>

          {/* Order ID & Quick Copy Bar */}
          <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-black/80 border-2 border-gold/40 px-6 py-3.5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <span className="text-xs text-cream/70 uppercase tracking-wider font-bold">Booking Ref:</span>
              <span className="font-mono text-base sm:text-lg font-bold text-gold tracking-widest bg-gold/15 px-3 py-0.5 rounded-lg border border-gold/30">
                {orderData.orderId}
              </span>
            </div>

            <button
              onClick={handleCopyOrderId}
              className="flex items-center gap-1 text-xs text-gold hover:text-white font-semibold bg-black/50 hover:bg-gold/20 px-3 py-1.5 rounded-xl border border-gold/30 transition-colors"
              title="Copy Booking ID"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy ID</span>
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN 2-COLUMN ORDER HUB & TIMELINE                         */}
      {/* ------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-12 space-y-12">
        {/* Quick Action Hub Buttons Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <a
            href={whatsappChatUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/80 p-3.5 text-xs font-bold text-emerald-400 transition-all shadow-md hover:scale-105"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp Chef</span>
          </a>

          <a
            href={`tel:${BUSINESS.phone}`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-black/60 hover:bg-gold/15 p-3.5 text-xs font-bold text-gold transition-all hover:scale-105"
          >
            <Phone className="h-4 w-4" />
            <span>Call Hotline</span>
          </a>

          <a
            href="https://maps.google.com/?q=3625+S+Bedford+Ave+Springfield+MO+65809"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-black/60 hover:bg-gold/15 p-3.5 text-xs font-bold text-gold transition-all hover:scale-105"
          >
            <Navigation className="h-4 w-4" />
            <span>View Kitchen Map ↗</span>
          </a>

          <button
            onClick={handleShareOrder}
            className="flex items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-black/60 hover:bg-gold/15 p-3.5 text-xs font-bold text-cream transition-all hover:scale-105"
          >
            <Share2 className="h-4 w-4 text-gold" />
            <span>Share Order</span>
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* ========================================================= */}
          {/* LEFT: TIMELINE, CUSTOMER & DISH SUMMARY (7-8 COLS)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* 1. Interactive 5-Stage Dum Prep Status Timeline */}
            <div className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gold" />
                  <h2 className="font-display text-xl font-bold text-cream">
                    Live Dum Preparation Timeline
                  </h2>
                </div>
                <span className="rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-[0.68rem] font-bold text-gold">
                  Status: Marination Queue
                </span>
              </div>

              {/* Stepper Timeline Visual */}
              <div className="space-y-6 relative pl-4 sm:pl-6 before:absolute before:left-7 sm:before:left-9 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-gold before:to-neutral-800">
                {ORDER_TIMELINE_STAGES.map((stage) => {
                  const IconComp = stage.icon;
                  const isCompleted = stage.status === "completed";
                  const isCurrent = stage.status === "current";

                  return (
                    <div key={stage.step} className="relative flex items-start gap-4 sm:gap-6 group">
                      {/* Status Icon Orb */}
                      <div
                        className={`relative z-10 flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                            : isCurrent
                              ? "bg-gradient-to-tr from-chili to-gold border-gold text-white shadow-[0_0_20px_rgba(212,160,23,0.8)] animate-pulse"
                              : "bg-black border-gold/30 text-cream/40"
                        }`}
                      >
                        <IconComp className="h-4 w-4" />
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h3
                            className={`font-display text-sm sm:text-base font-bold ${
                              isCompleted || isCurrent ? "text-cream" : "text-cream/50"
                            }`}
                          >
                            {stage.step}. {stage.title}
                          </h3>
                          <span
                            className={`font-mono text-[0.68rem] font-semibold ${
                              isCurrent ? "text-gold" : isCompleted ? "text-emerald-400" : "text-cream/40"
                            }`}
                          >
                            {stage.time}
                          </span>
                        </div>
                        <p className="text-xs text-cream/70 leading-relaxed">{stage.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Customer & Fulfilment Details Card */}
            <div className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                <h2 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gold" />
                  <span>Customer & Fulfilment Destination</span>
                </h2>
                <span className="text-xs text-gold font-bold uppercase tracking-wider">
                  {orderData.fulfilmentType}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs text-cream/85">
                <div className="space-y-1.5 rounded-2xl bg-black/40 border border-gold/15 p-4">
                  <p className="text-[0.65rem] text-gold font-bold uppercase tracking-wider">Patron Contact</p>
                  <p className="font-bold text-cream text-sm">{orderData.customer.name}</p>
                  <p className="text-cream/70 flex items-center gap-1.5 pt-0.5">
                    <Phone className="h-3.5 w-3.5 text-gold" /> {orderData.customer.phone}
                  </p>
                  <p className="text-cream/70 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-gold" /> {orderData.customer.email}
                  </p>
                  <p className="text-[0.68rem] text-emerald-400 font-semibold pt-1">
                    ✓ SMS & WhatsApp Tracking Active
                  </p>
                </div>

                <div className="space-y-1.5 rounded-2xl bg-black/40 border border-gold/15 p-4">
                  <p className="text-[0.65rem] text-gold font-bold uppercase tracking-wider">Scheduled Window</p>
                  <p className="font-bold text-cream text-sm capitalize">{orderData.fulfilmentType} Order</p>
                  <p className="text-gold font-semibold">
                    {orderData.fulfilmentDate} at {orderData.fulfilmentTime}
                  </p>
                  {orderData.fulfilmentType === "pickup" ? (
                    <p className="text-[0.68rem] text-cream/70 pt-0.5">{BUSINESS.address}</p>
                  ) : (
                    <div className="text-[0.68rem] text-cream/70 pt-0.5 space-y-0.5">
                      <p>{orderData.customer.address}, {orderData.customer.city} {orderData.customer.zipCode}</p>
                      {orderData.customer.landmark && (
                        <p className="text-gold/90 italic">Landmark: {orderData.customer.landmark}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Customer Rating & Experience Review CTA */}
            <div className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gold">Patron Feedback</span>
                  <h3 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                    <Star className="h-5 w-5 text-gold fill-gold" />
                    <span>Rate Your Dum Pukht Experience</span>
                  </h3>
                </div>
                <span className="text-xs text-gold/80 font-mono">Google & Yelp Reviews</span>
              </div>

              {reviewSubmitted ? (
                <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/50 p-5 text-center text-xs text-emerald-300 space-y-2 animate-in fade-in">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
                  <p className="font-bold text-sm text-white">Thank You for Your Royal Rating!</p>
                  <p className="text-cream/80 max-w-md mx-auto">
                    Your compliments have been forwarded directly to Master Chef Kartheek and the kitchen team.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cream/80 font-bold">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-gold transition-transform hover:scale-125"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              (hoverRating || rating) >= star ? "fill-gold text-gold" : "text-neutral-700"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gold ml-2">{rating} / 5 Stars</span>
                  </div>

                  <textarea
                    rows={2}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell Master Chef Kartheek what you loved about the biryani aroma, saffron flavors, or tender meat..."
                    className="w-full bg-black/60 border border-gold/25 rounded-2xl p-3 text-xs text-cream focus:border-gold focus:ring-1 focus:ring-gold"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[0.65rem] text-cream/60">Help other Springfield foodies discover authentic Dum Biryani</p>
                    <Button
                      type="submit"
                      className="rounded-xl bg-gold text-black hover:bg-gold/90 text-xs font-bold px-5"
                    >
                      Submit Review
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: ORDERED DISHES & FINANCIAL RECEIPT (4-5 COLS)      */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-6">
            <div className="rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-[#1c120a] via-[#140c07] to-[#0a0705] p-6 shadow-2xl backdrop-blur-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gold">Official Receipt</span>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-cream">
                    <ShoppingBag className="h-5 w-5 text-gold" />
                    <span>Order Receipt</span>
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs text-gold hover:bg-gold/15 rounded-xl font-bold gap-1"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>

              {/* Ordered Dishes List */}
              <div className="space-y-3 divide-y divide-gold/15">
                {orderData.items.map((item, idx) => {
                  const dishImage = DISH_IMAGES[item.id] || heroImg;
                  return (
                    <div key={idx} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-gold/30 shrink-0">
                        <img src={dishImage} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex justify-between font-bold text-cream">
                          <span className="truncate pr-1">
                            {item.qty}× {item.name}
                          </span>
                          <span className="text-gold font-display shrink-0">
                            {formatMoney(item.unitPrice * item.qty)}
                          </span>
                        </div>
                        <p className="text-[0.68rem] text-cream/70">
                          {item.aloo ? "✓ Added Spiced Baby Aloo" : "No Aloo"} ·{" "}
                          {item.extraSpicy ? "Extra Spicy" : "Regular Spice"}
                        </p>
                        <p className="text-[0.62rem] text-cream/50">{item.serves}</p>
                        {item.notes && <p className="text-[0.62rem] text-gold/80 italic">{item.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial Calculation Summary */}
              <div className="space-y-2 border-t border-gold/20 pt-3 text-xs">
                <div className="flex justify-between text-cream/80">
                  <span>Subtotal:</span>
                  <span>{formatMoney(orderData.pricing.subtotal)}</span>
                </div>

                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Promo Discount ({orderData.pricing.promoCode}):</span>
                  <span>−{formatMoney(orderData.pricing.promoDiscount)}</span>
                </div>

                <div className="flex justify-between text-cream/70">
                  <span>Springfield Food Tax (8.6%):</span>
                  <span>{formatMoney(orderData.pricing.tax)}</span>
                </div>

                <div className="flex justify-between text-cream/70">
                  <span>Delivery Charge:</span>
                  <span>{formatMoney(orderData.pricing.deliveryFee)}</span>
                </div>

                <div className="flex justify-between border-t border-gold/25 pt-3 font-display text-xl font-bold text-cream">
                  <span>Grand Total Paid:</span>
                  <span className="text-gold drop-shadow-md">{formatMoney(orderData.pricing.grandTotal)}</span>
                </div>
              </div>

              {/* Quality & Halal Badges */}
              <div className="rounded-2xl bg-black/50 border border-gold/20 p-3.5 space-y-2 text-[0.68rem] text-cream/80">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>100% Zabiha Halal Certified • Fresh Clay Coal Dum</span>
                </div>
                <div className="flex items-center gap-2 text-gold">
                  <Flame className="h-4 w-4 shrink-0" />
                  <span>90-Minute Thermal Bag Heat Retention Guarantee</span>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild className="w-full rounded-2xl bg-gradient-to-r from-chili to-gold text-white font-bold text-xs py-5 shadow-lg">
                  <Link to="/">Order Another Handi Tray →</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
