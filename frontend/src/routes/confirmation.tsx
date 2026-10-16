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
  Camera,
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
        tax: 0,
        deliveryFee: 10.0,
        grandTotal: 342.07,
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
    <div className="min-h-screen bg-[#fbf9f5] font-sans text-zinc-900 selection:bg-amber-500/20 selection:text-amber-900 relative overflow-hidden pb-28">
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO CELEBRATION & THANK-YOU ILLUSTRATION BANNER           */}
      {/* ------------------------------------------------------------- */}
      <section className="relative border-b border-zinc-200 bg-white py-14 px-4 sm:px-8 text-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl space-y-5">
          {/* Animated Royal Handi Crest */}
          <div className="relative mx-auto flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center">
            <div className="absolute -inset-2 rounded-full bg-amber-400/20 blur-md animate-pulse" />
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-amber-600 border-2 border-amber-400 text-zinc-950 shadow-md">
              <CheckCircle2 className="h-14 w-14 sm:h-16 sm:w-16 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-amber-600 animate-spin" />
              <span>Royal Dum Reservation Confirmed</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900">
              Thank You, <span className="text-amber-700">{orderData.customer.name}!</span>
            </h1>

            <p className="mx-auto max-w-2xl text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
              Your handcrafted Dum Biryani Handi booking has been scheduled with Master Chef Kartheek. Each tray is
              slow-cooked from scratch over morning hardwood coal embers for deep aromatic richness.
            </p>
          </div>

          {/* Order ID & Quick Copy Bar */}
          <div className="flex flex-col items-center gap-2">
            <div className="inline-flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-zinc-50 border border-zinc-200 px-6 py-3.5 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Booking Ref:</span>
                <span className="font-mono text-base sm:text-lg font-bold text-amber-800 tracking-widest bg-amber-100/70 px-3 py-0.5 rounded-lg border border-amber-300">
                  {orderData.orderId}
                </span>
              </div>

              <button
                onClick={handleCopyOrderId}
                className="flex items-center gap-1 text-xs text-zinc-700 hover:text-zinc-900 font-semibold bg-white hover:bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200 transition-colors cursor-pointer shadow-xs"
                title="Copy Booking ID"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy ID</span>
              </button>
            </div>
            {orderData.orderId.match(/-(\d+)$/) && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 border border-amber-300 px-4 py-1 text-xs font-semibold text-amber-900">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Today's Handi Order #{parseInt(orderData.orderId.match(/-(\d+)$/)![1], 10)}</span>
              </div>
            )}
          </div>

          {/* PROMINENT TAKE SCREENSHOT CALLOUT CARD */}
          <div className="max-w-xl mx-auto rounded-3xl bg-amber-50/80 border-2 border-amber-400 p-5 sm:p-6 text-center space-y-3 shadow-sm">
            <div className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 text-zinc-950 px-4 py-1.5 text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xs">
              <Camera className="h-4 w-4 stroke-[2.5]" />
              <span>PLEASE TAKE A SCREENSHOT OF THIS SCREEN</span>
            </div>
            <div className="space-y-1">
              <p className="text-base sm:text-lg font-bold text-amber-900">
                📸 Important: Save Your Order Receipt
              </p>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-md mx-auto font-normal">
                Take a screenshot of this receipt now to show at kitchen pickup or to your delivery driver.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.print();
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-800 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Printer className="h-4 w-4 text-amber-600" />
                <span>Save / Print Receipt</span>
              </button>
              <button
                type="button"
                onClick={handleCopyOrderId}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-800 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Copy className="h-4 w-4 text-amber-600" />
                <span>Copy Order ID</span>
              </button>
            </div>
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
            className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 p-3.5 text-xs font-semibold text-emerald-800 transition-all shadow-xs"
          >
            <MessageSquare className="h-4 w-4" />
            <span>WhatsApp Chef</span>
          </a>

          <a
            href={`tel:${BUSINESS.phone}`}
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 p-3.5 text-xs font-semibold text-zinc-800 transition-all shadow-xs"
          >
            <Phone className="h-4 w-4 text-amber-600" />
            <span>Call Hotline</span>
          </a>

          <a
            href="https://maps.google.com/?q=3625+S+Bedford+Ave+Springfield+MO+65809"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 p-3.5 text-xs font-semibold text-zinc-800 transition-all shadow-xs"
          >
            <Navigation className="h-4 w-4 text-amber-600" />
            <span>View Kitchen Map ↗</span>
          </a>

          <button
            onClick={handleShareOrder}
            className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white hover:bg-zinc-50 p-3.5 text-xs font-semibold text-zinc-800 transition-all shadow-xs cursor-pointer"
          >
            <Share2 className="h-4 w-4 text-amber-600" />
            <span>Share Order</span>
          </button>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* ========================================================= */}
          {/* LEFT: TIMELINE, CUSTOMER & DISH SUMMARY (7-8 COLS)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* 1. Interactive 5-Stage Dum Prep Status Timeline */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  <h2 className="font-display text-xl font-bold text-zinc-900">
                    Live Dum Preparation Timeline
                  </h2>
                </div>
                <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[0.68rem] font-semibold text-amber-800">
                  Status: Marination Queue
                </span>
              </div>

              {/* Stepper Timeline Visual */}
              <div className="space-y-6 relative pl-4 sm:pl-6 before:absolute before:left-7 sm:before:left-9 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-amber-400 before:to-zinc-200">
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
                            ? "bg-emerald-500 border-emerald-400 text-white shadow-xs"
                            : isCurrent
                              ? "bg-amber-500 border-amber-400 text-zinc-950 shadow-sm animate-pulse"
                              : "bg-white border-zinc-300 text-zinc-400"
                        }`}
                      >
                        <IconComp className="h-4 w-4" />
                      </div>

                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                          <h3
                            className={`font-display text-sm sm:text-base font-bold ${
                              isCompleted || isCurrent ? "text-zinc-900" : "text-zinc-400"
                            }`}
                          >
                            {stage.step}. {stage.title}
                          </h3>
                          <span
                            className={`font-mono text-[0.68rem] font-semibold ${
                              isCurrent ? "text-amber-800" : isCompleted ? "text-emerald-700" : "text-zinc-400"
                            }`}
                          >
                            {stage.time}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-600 leading-relaxed font-normal">{stage.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Customer & Fulfilment Details Card */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <h2 className="font-display text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-600" />
                  <span>Customer & Fulfilment Destination</span>
                </h2>
                <span className="text-xs text-amber-800 font-semibold uppercase tracking-wider">
                  {orderData.fulfilmentType}
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs text-zinc-700">
                <div className="space-y-1.5 rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-[0.65rem] text-amber-800 font-semibold uppercase tracking-wider">Patron Contact</p>
                  <p className="font-bold text-zinc-900 text-sm">{orderData.customer.name}</p>
                  <p className="text-zinc-600 flex items-center gap-1.5 pt-0.5">
                    <Phone className="h-3.5 w-3.5 text-amber-600" /> {orderData.customer.phone}
                  </p>
                  <p className="text-zinc-600 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-amber-600" /> {orderData.customer.email}
                  </p>
                  <p className="text-[0.68rem] text-emerald-700 font-semibold pt-1">
                    ✓ SMS & WhatsApp Tracking Active
                  </p>
                </div>

                <div className="space-y-1.5 rounded-2xl bg-zinc-50 border border-zinc-200 p-4">
                  <p className="text-[0.65rem] text-amber-800 font-semibold uppercase tracking-wider">Scheduled Window</p>
                  <p className="font-bold text-zinc-900 text-sm capitalize">{orderData.fulfilmentType} Order</p>
                  <p className="text-amber-800 font-semibold">
                    {orderData.fulfilmentDate} at {orderData.fulfilmentTime}
                  </p>
                  {orderData.fulfilmentType === "pickup" ? (
                    <p className="text-[0.68rem] text-zinc-600 pt-0.5">{BUSINESS.address}</p>
                  ) : (
                    <div className="text-[0.68rem] text-zinc-600 pt-0.5 space-y-0.5">
                      <p>{orderData.customer.address}, {orderData.customer.city} {orderData.customer.zipCode}</p>
                      {orderData.customer.landmark && (
                        <p className="text-amber-800 italic">Landmark: {orderData.customer.landmark}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 3. Customer Rating & Experience Review CTA */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-amber-800">Patron Feedback</span>
                  <h3 className="font-display text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <span>Rate Your Dum Pukht Experience</span>
                  </h3>
                </div>
                <span className="text-xs text-zinc-500 font-mono">Google & Yelp Reviews</span>
              </div>

              {reviewSubmitted ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-5 text-center text-xs text-emerald-800 space-y-2 animate-in fade-in">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm text-zinc-900">Thank You for Your Royal Rating!</p>
                  <p className="text-zinc-600 max-w-md mx-auto font-normal">
                    Your compliments have been forwarded directly to Master Chef Kartheek and the kitchen team.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-700 font-semibold">Your Rating:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 text-amber-500 transition-transform hover:scale-125 cursor-pointer"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              (hoverRating || rating) >= star ? "fill-amber-500 text-amber-500" : "text-zinc-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-800 ml-2">{rating} / 5 Stars</span>
                  </div>

                  <textarea
                    rows={2}
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell Master Chef Kartheek what you loved about the biryani aroma, saffron flavors, or tender meat..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3 text-xs text-zinc-900 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
                  />

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[0.65rem] text-zinc-500 font-normal">Help other Springfield foodies discover authentic Dum Biryani</p>
                    <Button
                      type="submit"
                      className="rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold px-5 cursor-pointer"
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
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-amber-800">Official Receipt</span>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-zinc-900">
                    <ShoppingBag className="h-5 w-5 text-amber-600" />
                    <span>Order Receipt</span>
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => window.print()}
                  className="text-xs text-amber-800 hover:bg-zinc-100 rounded-xl font-bold gap-1 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>
              </div>

              {/* Ordered Dishes List */}
              <div className="space-y-3 divide-y divide-zinc-100">
                {orderData.items.map((item, idx) => {
                  const dishImage = DISH_IMAGES[item.id] || heroImg;
                  return (
                    <div key={idx} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                        <img src={dishImage} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex justify-between font-bold text-zinc-900">
                          <span className="truncate pr-1">
                            {item.qty}× {item.name}
                          </span>
                          <span className="text-amber-800 font-display shrink-0">
                            {formatMoney(item.unitPrice * item.qty)}
                          </span>
                        </div>
                        <p className="text-[0.68rem] text-zinc-600 font-normal">
                          {item.aloo ? "✓ Added Spiced Baby Aloo" : "No Aloo"} ·{" "}
                          {item.extraSpicy ? "Extra Spicy" : "Regular Spice"}
                        </p>
                        <p className="text-[0.62rem] text-zinc-400 font-normal">{item.serves}</p>
                        {item.notes && <p className="text-[0.62rem] text-amber-800 italic">{item.notes}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Financial Calculation Summary */}
              <div className="space-y-2 border-t border-zinc-100 pt-3 text-xs font-normal">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal:</span>
                  <span className="text-zinc-900">{formatMoney(orderData.pricing.subtotal)}</span>
                </div>

                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promo Discount ({orderData.pricing.promoCode}):</span>
                  <span>−{formatMoney(orderData.pricing.promoDiscount)}</span>
                </div>

                {orderData.pricing.tax > 0 && (
                  <div className="flex justify-between text-zinc-500">
                    <span>Springfield Food Tax (8.6%):</span>
                    <span>{formatMoney(orderData.pricing.tax)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-500">
                  <span>Delivery Charge:</span>
                  <span>{formatMoney(orderData.pricing.deliveryFee)}</span>
                </div>

                <div className="flex justify-between border-t border-zinc-200 pt-3 font-display text-xl font-bold text-zinc-900">
                  <span>Grand Total Paid:</span>
                  <span className="text-amber-700">{formatMoney(orderData.pricing.grandTotal)}</span>
                </div>
              </div>

              {/* Quality & Halal Badges */}
              <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3.5 space-y-2 text-[0.68rem] text-zinc-600">
                <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                  <Shield className="h-4 w-4 shrink-0" />
                  <span>100% Zabiha Halal Certified • Fresh Clay Coal Dum</span>
                </div>
                <div className="flex items-center gap-2 text-amber-800 font-medium">
                  <Flame className="h-4 w-4 shrink-0" />
                  <span>90-Minute Thermal Bag Heat Retention Guarantee</span>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs py-5 shadow-sm hover:brightness-105 cursor-pointer">
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
