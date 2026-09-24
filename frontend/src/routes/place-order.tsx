import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  ShoppingBag,
  Store,
  Truck,
  MapPin,
  Clock,
  Calendar,
  User,
  Phone,
  Mail,
  Shield,
  Sparkles,
  CreditCard,
  Banknote,
  QrCode,
  MessageSquare,
  Lock,
  CheckCircle2,
  Check,
  Flame,
  ArrowLeft,
  ArrowRight,
  Printer,
  Copy,
  ExternalLink,
  ChevronRight,
  Info,
  Tag,
  AlertCircle,
  HelpCircle,
  RefreshCw,
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

import { useCart } from "@/lib/cart";
import {
  BUSINESS,
  DELIVERY_FEE,
  DELIVERY_TIMES,
  PICKUP_TIMES,
  formatDate,
  formatMoney,
  nextAvailableDate,
  ALOO_CHARGE,
  type ProteinId,
} from "@/lib/menu";
import { api, type OrderResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/place-order")({
  head: () => ({
    meta: [
      { title: "Place Order & Payment — JAKLOUD Spice King Dum Biryani" },
      {
        name: "description",
        content:
          "Finalize your handcrafted Dum Biryani Handi booking. Choose Cash on Delivery, Cash on Pickup, UPI QR payment, Razorpay card checkout, or WhatsApp direct order.",
      },
      { property: "og:title", content: "Place Order — JAKLOUD Dum Biryani" },
      {
        property: "og:description",
        content: "Secure payment and order placement for Springfield's finest slow-cooked Dum Biryani Handi trays.",
      },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: PlaceOrderPage,
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

export function PlaceOrderPage() {
  const { lines, subtotal, clear, count, setQty, removeLine } = useCart();
  const navigate = useNavigate();

  const defaultDateStr = formatDate(nextAvailableDate());

  // Fulfilment & Schedule Defaults
  const [fulfilmentType, setFulfilmentType] = useState<"pickup" | "delivery">("pickup");
  const [fulfilmentDate, setFulfilmentDate] = useState(defaultDateStr);
  const [fulfilmentTime, setFulfilmentTime] = useState(PICKUP_TIMES[0] || "12:00 PM");

  // Customer Details
  const [customerName, setCustomerName] = useState("Dr. Bradley Hayes");
  const [customerPhone, setCustomerPhone] = useState("417-897-9754");
  const [customerEmail, setCustomerEmail] = useState("patron@jakloud.com");
  const [deliveryAddress, setDeliveryAddress] = useState("1420 E Primrose St., Suite 200");
  const [deliveryCity, setDeliveryCity] = useState("Springfield");
  const [deliveryZip, setDeliveryZip] = useState("65804");
  const [deliveryLandmark, setDeliveryLandmark] = useState("Near Mercy Medical Mile / Building B");
  const [specialNotes, setSpecialNotes] = useState("Please pack extra salan gravy and keep warm in thermal bag.");

  // Payment Method Selection
  const [paymentMethod, setPaymentMethod] = useState<
    "cash_pickup" | "cash_delivery" | "upi" | "razorpay" | "whatsapp"
  >("cash_pickup");

  // UPI Form Details
  const [upiId, setUpiId] = useState("jakloud@oksbi");
  const [showQrModal, setShowQrModal] = useState(false);

  // Razorpay / Card Form Details
  const [cardNumber, setCardNumber] = useState("4532 •••• •••• 8912");
  const [cardHolder, setCardHolder] = useState("Bradley Hayes");
  const [cardExpiry, setCardExpiry] = useState("10/28");
  const [cardCvv, setCardCvv] = useState("894");

  // Promo Code State
  const [promoInput, setPromoInput] = useState("SPICEKING");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    discountFixed: number;
    label: string;
  } | null>(VALID_PROMOS["SPICEKING"] ? { code: "SPICEKING", ...VALID_PROMOS["SPICEKING"] } : null);

  // Submission & Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderResponse | null>(null);
  const [orderStage, setOrderStage] = useState(1);

  // Keep payment method in sync with fulfilment type
  useEffect(() => {
    if (fulfilmentType === "pickup" && paymentMethod === "cash_delivery") {
      setPaymentMethod("cash_pickup");
    } else if (fulfilmentType === "delivery" && paymentMethod === "cash_pickup") {
      setPaymentMethod("cash_delivery");
    }
  }, [fulfilmentType, paymentMethod]);

  // Financial Calculations
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

  // Handle Promo Code
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (VALID_PROMOS[code]) {
      setAppliedPromo({ code, ...VALID_PROMOS[code] });
      toast.success(`Promo code "${code}" applied: ${VALID_PROMOS[code].label}!`);
      setPromoInput("");
    } else {
      toast.error(`Promo code "${code}" is invalid.`);
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.info("Promo code removed.");
  };

  // Pre-formatted WhatsApp Direct Order Link
  const whatsappOrderUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    `👑 *NEW JAKLOUD HANDI ORDER (PLACE ORDER)*\n\n` +
      `*Customer:* ${customerName}\n` +
      `*Phone:* ${customerPhone}\n` +
      `*Email:* ${customerEmail}\n` +
      `*Fulfilment:* ${fulfilmentType.toUpperCase()} on ${fulfilmentDate} at ${fulfilmentTime}\n` +
      (fulfilmentType === "delivery"
        ? `*Delivery Address:* ${deliveryAddress}, ${deliveryLandmark ? `(Landmark: ${deliveryLandmark}), ` : ""}${deliveryCity} ${deliveryZip}\n`
        : `*Pickup Location:* 3625 S Bedford Ave, Springfield\n`) +
      `*Payment Preference:* ${paymentMethod.replace("_", " ").toUpperCase()}\n` +
      `\n*Ordered Handi Trays (${count}):*\n` +
      lines
        .map(
          (l) =>
            `• ${l.qty}x ${l.name} (${l.aloo ? "+Aloo" : "No Aloo"}, ${l.extraSpicy ? "Extra Spicy" : "Regular"}) - $${(l.unitPrice * l.qty).toFixed(2)}`,
        )
        .join("\n") +
      `\n\n*Subtotal:* $${calculations.subtotal.toFixed(2)}` +
      (appliedPromo ? `\n*Promo Discount (${appliedPromo.code}):* -$${calculations.discountAmount.toFixed(2)}` : "") +
      `\n*Tax (8.6%):* $${calculations.tax.toFixed(2)}` +
      `\n*Delivery Charge:* $${calculations.deliveryCost.toFixed(2)}` +
      `\n*GRAND TOTAL:* $${calculations.grandTotal.toFixed(2)}` +
      (specialNotes ? `\n\n*Special Notes:* ${specialNotes}` : ""),
  )}`;

  // Handle Order Placement
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lines.length === 0) {
      toast.error("Your cart is empty. Please add delicious Dum Biryani trays before ordering.");
      return;
    }

    if (!customerName.trim() || !customerPhone.trim() || !customerEmail.trim()) {
      toast.error("Please fill in your contact information.");
      return;
    }

    if (fulfilmentType === "delivery" && !deliveryAddress.trim()) {
      toast.error("Please provide a delivery street address in Springfield.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await api.createOrder({
        items: lines.map((l) => ({
          proteinId: l.proteinId,
          aloo: l.aloo,
          extraSpicy: l.extraSpicy,
          notes: l.notes,
          qty: l.qty,
        })),
        fulfilmentType,
        fulfilmentDate,
        fulfilmentTime,
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim(),
          phone: customerPhone.trim(),
          ...(fulfilmentType === "delivery" && {
            address: deliveryAddress.trim(),
            city: deliveryCity.trim(),
            zipCode: deliveryZip.trim(),
            deliveryInstructions: deliveryLandmark.trim() || undefined,
          }),
        },
        specialInstructions: specialNotes.trim() || undefined,
      });

      setConfirmedOrder(response.order);
      clear();
      toast.success("Order Placed Successfully! Your royal handi batch is reserved.");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to place order";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // ORDER CONFIRMATION SUCCESS SCREEN
  // -------------------------------------------------------------------------
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold py-12 px-4 sm:px-8 relative overflow-hidden">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gold/15 blur-[140px] pointer-events-none" />

        <div className="mx-auto max-w-3xl space-y-8 relative z-10">
          <div className="rounded-3xl border-2 border-gold/50 bg-gradient-to-b from-[#1c120a] via-[#140c07] to-[#0a0705] p-6 sm:p-12 text-center shadow-[0_0_60px_rgba(212,175,55,0.3)] backdrop-blur-2xl space-y-6 animate-in fade-in zoom-in-95 duration-500">
            {/* Animated Celebration Icon */}
            <div className="mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-tr from-chili to-gold border-2 border-gold text-white shadow-[0_0_40px_rgba(212,160,23,0.7)] animate-bounce">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-gold shadow-md">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span>Handi Dum Reservation Confirmed</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream">
                Royal Order Placed, {confirmedOrder.customer.name}!
              </h1>
              <p className="text-xs sm:text-sm text-cream/80 max-w-md mx-auto pt-1 leading-relaxed">
                Your Made To Order Dum Biryani booking has been scheduled directly with Master Chef Kartheek. Each tray
                will be slow-cooked to perfection over morning hardwood coals.
              </p>
            </div>

            {/* Order Reference Number */}
            <div className="inline-flex items-center gap-3 rounded-2xl bg-black/80 border-2 border-gold/40 px-6 py-3.5 font-mono text-sm sm:text-base font-bold text-gold shadow-xl">
              <span>Order Reference ID:</span>
              <span className="text-white tracking-widest bg-gold/20 px-3 py-1 rounded-xl border border-gold/30">
                {confirmedOrder.orderNumber}
              </span>
            </div>

            {/* 4-Stage Dum Prep Progress Tracker */}
            <div className="rounded-2xl border border-gold/25 bg-black/50 p-5 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-chili" />
                  <span>Live Dum Cooking Timeline</span>
                </span>
                <span className="rounded-full bg-gold/15 border border-gold/30 px-2.5 py-0.5 text-[0.62rem] font-bold text-gold">
                  Stage 1: Scheduled
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                <div className="rounded-xl bg-gold/20 border border-gold p-2 text-xs">
                  <span className="text-[0.62rem] font-bold text-gold block">1. Booked</span>
                  <span className="text-[0.58rem] text-cream/70">Confirmed</span>
                </div>
                <div className="rounded-xl bg-black/40 border border-gold/15 p-2 text-xs">
                  <span className="text-[0.62rem] font-bold text-cream/80 block">2. Marinating</span>
                  <span className="text-[0.58rem] text-cream/50">18-Hour Prep</span>
                </div>
                <div className="rounded-xl bg-black/40 border border-gold/15 p-2 text-xs">
                  <span className="text-[0.62rem] font-bold text-cream/80 block">3. Coal Dum</span>
                  <span className="text-[0.58rem] text-cream/50">Morning Flame</span>
                </div>
                <div className="rounded-xl bg-black/40 border border-gold/15 p-2 text-xs">
                  <span className="text-[0.62rem] font-bold text-cream/80 block">4. Ready</span>
                  <span className="text-[0.58rem] text-cream/50">Hot Dispatch</span>
                </div>
              </div>
            </div>

            {/* Breakdown Details Grid */}
            <div className="grid gap-4 rounded-2xl border border-gold/25 bg-black/50 p-6 text-left text-xs sm:grid-cols-2 text-cream/85">
              <div className="space-y-2">
                <p className="text-[0.68rem] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Fulfilment Details</span>
                </p>
                <p className="font-bold text-cream capitalize text-sm">
                  {confirmedOrder.fulfilmentType === "pickup" ? "Counter Pickup (Free)" : "Doorstep Delivery"}
                </p>
                <p className="text-gold font-semibold">
                  {confirmedOrder.fulfilmentDate} at {confirmedOrder.fulfilmentTime}
                </p>
                {confirmedOrder.fulfilmentType === "pickup" ? (
                  <p className="text-[0.72rem] text-cream/75 pt-1">
                    Pickup: <strong className="text-cream">{BUSINESS.address}</strong>
                  </p>
                ) : (
                  <p className="text-[0.72rem] text-cream/75 pt-1">
                    Delivery to: {confirmedOrder.customer.address}, {confirmedOrder.customer.city} {confirmedOrder.customer.zipCode}
                  </p>
                )}
              </div>

              <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-gold/15 sm:pl-4 pt-4 sm:pt-0">
                <p className="text-[0.68rem] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Order Summary</span>
                </p>
                <div className="space-y-1">
                  {confirmedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[0.72rem]">
                      <span className="text-cream">
                        {item.qty}× {item.name}
                      </span>
                      <span className="text-gold font-mono">{formatMoney(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-gold/15 flex justify-between font-display text-base font-bold text-cream">
                  <span>Grand Total:</span>
                  <span className="text-gold">{formatMoney(confirmedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button
                asChild
                className="rounded-2xl bg-gradient-to-r from-chili to-gold text-white font-bold text-xs px-6 py-5 shadow-lg hover:scale-105 transition-all"
              >
                <Link to="/">Return to Home</Link>
              </Button>

              <a
                href={whatsappOrderUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/80 px-5 py-3 text-xs font-bold text-emerald-400 transition-all shadow-md"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Track on WhatsApp</span>
              </a>

              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
                className="rounded-2xl border-gold/40 text-gold hover:bg-gold/15 text-xs font-bold px-5 py-5 gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Invoice</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // MAIN PLACE ORDER PAGE
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold py-10 px-4 sm:px-8 relative overflow-hidden pb-28">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[150px] pointer-events-none" />

      <div className="mx-auto max-w-7xl space-y-8 relative z-10">
        {/* Header & Breadcrumb Trail */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/15 pb-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 text-gold hover:bg-gold/15 rounded-xl text-xs font-bold w-fit"
          >
            <Link to="/checkout">
              <ArrowLeft className="h-4 w-4" /> Back to Booking Form
            </Link>
          </Button>

          {/* Checkout Progress Pills */}
          <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-wider text-cream/60">
            <span className="text-emerald-400">1. Menu</span>
            <span className="text-gold/40">›</span>
            <span className="text-emerald-400">2. Cart</span>
            <span className="text-gold/40">›</span>
            <span className="text-emerald-400">3. Details</span>
            <span className="text-gold/40">›</span>
            <span className="rounded-full bg-gold px-2.5 py-0.5 text-black font-extrabold shadow-sm">
              4. Place Order & Pay
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gold">
            <Lock className="h-3.5 w-3.5" />
            <span>256-Bit SSL Secure Gateway</span>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* ========================================================= */}
          {/* LEFT: PAYMENT OPTIONS & CUSTOMER REVIEW (7-8 COLS)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/60 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold shadow-md">
                <Sparkles className="h-3 w-3 text-gold" />
                <span>Final Authorization Step</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream">
                Authorize & <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">Place Your Order</span>
              </h1>
              <p className="text-xs sm:text-sm text-cream/75 leading-relaxed">
                Review your customer delivery profile and select your preferred payment channel for Master Chef Kartheek's
                handcrafted dum batch.
              </p>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-8">
              {/* ===================================================== */}
              {/* SECTION 1: CUSTOMER & FULFILMENT REVIEW CARD          */}
              {/* ===================================================== */}
              <div className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                  <h2 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                    <User className="h-5 w-5 text-gold" />
                    <span>1. Customer & Fulfilment Profile</span>
                  </h2>
                  <Button asChild variant="ghost" size="sm" className="text-xs text-gold hover:bg-gold/15 rounded-xl font-bold">
                    <Link to="/checkout">Edit Details</Link>
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs text-cream/85">
                  <div className="space-y-1 rounded-2xl bg-black/40 border border-gold/15 p-4">
                    <p className="text-[0.65rem] text-gold font-bold uppercase tracking-wider">Patron Information</p>
                    <p className="font-bold text-cream text-sm">{customerName}</p>
                    <p className="text-cream/70 flex items-center gap-1.5 pt-0.5">
                      <Phone className="h-3 w-3 text-gold" /> {customerPhone}
                    </p>
                    <p className="text-cream/70 flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-gold" /> {customerEmail}
                    </p>
                  </div>

                  <div className="space-y-1 rounded-2xl bg-black/40 border border-gold/15 p-4">
                    <p className="text-[0.65rem] text-gold font-bold uppercase tracking-wider">Fulfilment Destination</p>
                    <p className="font-bold text-cream text-sm capitalize">{fulfilmentType} Order</p>
                    <p className="text-gold font-semibold">
                      {fulfilmentDate} at {fulfilmentTime}
                    </p>
                    {fulfilmentType === "pickup" ? (
                      <p className="text-[0.68rem] text-cream/70 pt-0.5">3625 S Bedford Ave, Springfield</p>
                    ) : (
                      <p className="text-[0.68rem] text-cream/70 pt-0.5 truncate">
                        {deliveryAddress}, {deliveryCity} {deliveryZip}
                      </p>
                    )}
                  </div>
                </div>

                {specialNotes && (
                  <div className="rounded-2xl bg-black/30 border border-gold/15 p-3 text-xs text-cream/80 italic">
                    <span className="text-gold font-bold not-italic">Chef Note: </span>"{specialNotes}"
                  </div>
                )}
              </div>

              {/* ===================================================== */}
              {/* SECTION 2: PAYMENT OPTIONS SELECTION                  */}
              {/* ===================================================== */}
              <div className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                  <h2 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gold" />
                    <span>2. Select Payment Method</span>
                  </h2>
                  <span className="text-[0.68rem] text-emerald-400 font-semibold flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" /> 100% Secure Checkout
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Option 1: Cash on Fulfilment */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod(fulfilmentType === "pickup" ? "cash_pickup" : "cash_delivery")}
                    className={`rounded-2xl p-4 text-left border transition-all flex items-start justify-between ${
                      paymentMethod === "cash_pickup" || paymentMethod === "cash_delivery"
                        ? "bg-gold/15 border-gold shadow-md text-cream ring-1 ring-gold/40"
                        : "bg-black/40 border-gold/20 text-cream/70 hover:bg-black/60"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gold">
                        <Banknote className="h-5 w-5" />
                        <span className="font-bold text-xs text-cream">
                          {fulfilmentType === "pickup" ? "Cash on Pickup (COP)" : "Cash on Delivery (COD)"}
                        </span>
                      </div>
                      <p className="text-[0.68rem] text-cream/60">
                        Pay with cash or card swipe upon handi collection
                      </p>
                    </div>
                    {(paymentMethod === "cash_pickup" || paymentMethod === "cash_delivery") && (
                      <div className="h-5 w-5 rounded-full bg-gold text-black flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </button>

                  {/* Option 2: Instant UPI / QR Code */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("upi")}
                    className={`rounded-2xl p-4 text-left border transition-all flex items-start justify-between ${
                      paymentMethod === "upi"
                        ? "bg-gold/15 border-gold shadow-md text-cream ring-1 ring-gold/40"
                        : "bg-black/40 border-gold/20 text-cream/70 hover:bg-black/60"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gold">
                        <QrCode className="h-5 w-5" />
                        <span className="font-bold text-xs text-cream">Instant UPI / QR Pay</span>
                      </div>
                      <p className="text-[0.68rem] text-cream/60">
                        Google Pay, PhonePe, Paytm, BHIM instant transfer
                      </p>
                    </div>
                    {paymentMethod === "upi" && (
                      <div className="h-5 w-5 rounded-full bg-gold text-black flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </button>

                  {/* Option 3: Razorpay / Stripe Card Gateway */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("razorpay")}
                    className={`rounded-2xl p-4 text-left border transition-all flex items-start justify-between ${
                      paymentMethod === "razorpay"
                        ? "bg-gold/15 border-gold shadow-md text-cream ring-1 ring-gold/40"
                        : "bg-black/40 border-gold/20 text-cream/70 hover:bg-black/60"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-gold">
                        <CreditCard className="h-5 w-5" />
                        <span className="font-bold text-xs text-cream">Razorpay / Card Gateway</span>
                      </div>
                      <p className="text-[0.68rem] text-cream/60">
                        Credit, Debit Card, NetBanking, Apple Pay
                      </p>
                    </div>
                    {paymentMethod === "razorpay" && (
                      <div className="h-5 w-5 rounded-full bg-gold text-black flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </button>

                  {/* Option 4: Direct WhatsApp Order */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("whatsapp")}
                    className={`rounded-2xl p-4 text-left border transition-all flex items-start justify-between ${
                      paymentMethod === "whatsapp"
                        ? "bg-emerald-950/50 border-emerald-500 shadow-md text-cream ring-1 ring-emerald-500/50"
                        : "bg-black/40 border-gold/20 text-cream/70 hover:bg-black/60"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <MessageSquare className="h-5 w-5" />
                        <span className="font-bold text-xs text-cream">WhatsApp VIP Booking</span>
                      </div>
                      <p className="text-[0.68rem] text-cream/60">
                        Direct 1-on-1 chef confirmation & custom billing
                      </p>
                    </div>
                    {paymentMethod === "whatsapp" && (
                      <div className="h-5 w-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Sub-form: UPI Payment View */}
                {paymentMethod === "upi" && (
                  <div className="rounded-2xl bg-black/60 border border-gold/20 p-5 space-y-4 animate-in fade-in">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1 text-center sm:text-left">
                        <p className="font-bold text-xs text-gold uppercase tracking-wider">Instant UPI Payment</p>
                        <p className="text-xs text-cream/80">Scan QR Code using any UPI App or enter VPA ID</p>
                        <p className="font-mono text-sm font-bold text-cream bg-black/40 px-3 py-1 rounded-lg border border-gold/20 inline-block mt-1">
                          jakloud@upi
                        </p>
                      </div>

                      {/* Mock QR Code Visual */}
                      <div className="h-28 w-28 rounded-2xl bg-white p-2 flex flex-col items-center justify-center shadow-lg shrink-0">
                        <QrCode className="h-20 w-20 text-black" />
                        <span className="text-[0.5rem] font-bold text-black uppercase tracking-widest">JAKLOUD UPI</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form: Razorpay Card View */}
                {paymentMethod === "razorpay" && (
                  <div className="rounded-2xl bg-black/60 border border-gold/20 p-5 space-y-3 animate-in fade-in">
                    <p className="font-bold text-xs text-gold uppercase tracking-wider">Razorpay Secure Card Gateway</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-3">
                        <Label className="text-[0.65rem] text-cream/70">Card Number</Label>
                        <Input
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="mt-1 bg-black/50 border-gold/25 text-cream text-xs rounded-xl font-mono"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-[0.65rem] text-cream/70">Expiry Date</Label>
                        <Input
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="mt-1 bg-black/50 border-gold/25 text-cream text-xs rounded-xl font-mono"
                        />
                      </div>
                      <div>
                        <Label className="text-[0.65rem] text-cream/70">CVV</Label>
                        <Input
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="mt-1 bg-black/50 border-gold/25 text-cream text-xs rounded-xl font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-form: WhatsApp Direct Link Banner */}
                {paymentMethod === "whatsapp" && (
                  <div className="rounded-2xl bg-emerald-950/40 border border-emerald-500/40 p-4 space-y-2 animate-in fade-in">
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4" /> Fast WhatsApp Confirmation
                    </p>
                    <p className="text-xs text-cream/80 leading-relaxed">
                      Clicking "Place Order" will send your structured order details directly to Master Chef Kartheek's
                      private WhatsApp line for immediate confirmation.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={isSubmitting || lines.length === 0}
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-base sm:text-lg py-7 shadow-[0_0_30px_rgba(185,28,28,0.5)] hover:scale-[1.01] transition-all gap-2"
                >
                  {isSubmitting ? (
                    "Processing Royal Order..."
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 animate-spin" />
                      <span>Place Royal Order — {formatMoney(calculations.grandTotal)}</span>
                    </>
                  )}
                </Button>

                <a
                  href={whatsappOrderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/80 p-3.5 text-xs font-bold text-emerald-400 transition-all shadow-md"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Place Order via WhatsApp Direct (1-Tap)</span>
                </a>
              </div>
            </form>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: STICKY ORDER SUMMARY & FINANCIALS (4-5 COLS)       */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-5">
            <div className="rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-[#1c120a] via-[#140c07] to-[#0a0705] p-6 shadow-2xl backdrop-blur-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gold">Final Review</span>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-cream">
                    <ShoppingBag className="h-5 w-5 text-gold" />
                    <span>Summary ({count} Trays)</span>
                  </h2>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-gold hover:bg-gold/15 rounded-xl font-bold">
                  <Link to="/cart">Edit Cart</Link>
                </Button>
              </div>

              {/* Items List */}
              <div className="max-h-64 space-y-3 overflow-y-auto divide-y divide-gold/15 pr-1">
                {lines.map((line) => {
                  const dishImage = DISH_IMAGES[line.proteinId] || heroImg;
                  const isHalal = line.proteinId !== "pork";

                  return (
                    <div key={line.key} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-gold/30 shrink-0">
                        <img src={dishImage} alt={line.name} className="h-full w-full object-cover" />
                        {isHalal && (
                          <span className="absolute bottom-0.5 right-0.5 bg-emerald-950/90 text-emerald-400 text-[0.5rem] font-bold px-1 rounded">
                            Halal
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex justify-between font-bold text-cream">
                          <span className="truncate pr-1">
                            {line.qty}× {line.name}
                          </span>
                          <span className="text-gold font-display shrink-0">
                            {formatMoney(line.unitPrice * line.qty)}
                          </span>
                        </div>
                        <p className="text-[0.68rem] text-cream/70">
                          {line.aloo ? "✓ Added Spiced Baby Aloo (+$7)" : "No Potatoes"} ·{" "}
                          {line.extraSpicy ? "Extra Spicy" : "Regular"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code Strip */}
              <div className="pt-2 border-t border-gold/15 space-y-2">
                {appliedPromo ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-950/60 border border-emerald-500/50 p-2.5 text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <Tag className="h-3.5 w-3.5 text-emerald-400" />
                      <div>
                        <span className="font-bold uppercase font-mono">{appliedPromo.code}</span>
                        <span className="text-[0.65rem] block text-emerald-300/80">{appliedPromo.label}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[0.65rem] text-emerald-400 hover:text-white px-2 py-0.5 rounded bg-black/40"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-1.5">
                    <Input
                      placeholder="Promo code (e.g. SPICEKING)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="bg-black/60 border-gold/25 text-cream text-xs rounded-xl uppercase font-mono"
                    />
                    <Button
                      type="submit"
                      disabled={!promoInput.trim()}
                      className="rounded-xl bg-gold text-black hover:bg-gold/90 text-xs font-bold px-3 shrink-0"
                    >
                      Apply
                    </Button>
                  </form>
                )}
              </div>

              {/* Financial Calculation Summary */}
              <div className="space-y-2 border-t border-gold/20 pt-3 text-xs">
                <div className="flex justify-between text-cream/80">
                  <span>Subtotal ({count} Trays):</span>
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
                  <span>{calculations.deliveryCost === 0 ? "Free ($0.00)" : formatMoney(calculations.deliveryCost)}</span>
                </div>

                <div className="flex justify-between border-t border-gold/25 pt-3 font-display text-xl font-bold text-cream">
                  <span>Grand Total:</span>
                  <span className="text-gold drop-shadow-md">{formatMoney(calculations.grandTotal)}</span>
                </div>
              </div>

              {/* Security & Halal Badges */}
              <div className="rounded-2xl bg-black/50 border border-gold/20 p-3 text-[0.68rem] text-gold space-y-1.5">
                <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Shield className="h-3.5 w-3.5" /> 100% Zabiha Halal Certified Poultry & Meat
                </p>
                <p className="flex items-center gap-1.5 text-cream/70">
                  <Lock className="h-3.5 w-3.5 text-gold" /> 256-Bit SSL Encrypted Payment Protection
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
