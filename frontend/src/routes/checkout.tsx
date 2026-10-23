import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  CheckCircle2,
  Clock,
  MapPin,
  Truck,
  ArrowLeft,
  ShoppingBag,
  Shield,
  Sparkles,
  Phone,
  MessageSquare,
  Lock,
  Store,
  User,
  Mail,
  Building,
  Navigation,
  Check,
  Flame,
  Tag,
  CreditCard,
  Banknote,
  Printer,
  AlertCircle,
  Camera,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";
import heroImg from "@/assets/hero-biryani.jpg";

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
import { jakloudStore, normalizeDateKey, useKitchenSettings } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DumDateTimePicker } from "@/components/dum-date-time-picker";
import {
  formatUsPhone,
  isValidUsPhone,
  sanitizeName,
  isValidName,
  sanitizeZipCode,
} from "@/lib/validation";
import { openRazorpayCheckout } from "@/lib/razorpay";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Booking & Checkout Details — JAKloud J Paradize Dum Biryani" },
      {
        name: "description",
        content:
          "Complete your handcrafted Dum Biryani Handi booking. Springfield counter pickup or doorstep delivery with live address verification and time slot scheduling.",
      },
      { property: "og:title", content: "Checkout Details — JAKloud Dum Biryani" },
      {
        property: "og:description",
        content: "Reserve your royal slow-cooked Dum Biryani Handi with Springfield pickup or delivery.",
      },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: CheckoutPage,
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
  JPARADIZE: { discountPercent: 10, discountFixed: 0, label: "10% Royal Welcome Discount" },
  SPICEKING: { discountPercent: 10, discountFixed: 0, label: "10% Royal Welcome Discount" },
  ROYAL10: { discountPercent: 10, discountFixed: 0, label: "10% Off Royal Dum Feasts" },
  HALALFEAST: { discountPercent: 0, discountFixed: 15, label: "$15 Off Halal Family Order" },
  SPRINGFIELD5: { discountPercent: 5, discountFixed: 0, label: "5% Local Springfield Neighbor Discount" },
};


function CheckoutPage() {
  const { lines, subtotal, clear, count, setQty, removeLine } = useCart();
  const { settings } = useKitchenSettings();
  const navigate = useNavigate();

  const configuredDeliveryFee = settings?.deliveryFee !== undefined ? Number(settings.deliveryFee) : DELIVERY_FEE;
  const freeThreshold = settings?.freeDeliveryTrayThreshold !== undefined ? Number(settings.freeDeliveryTrayThreshold) : 5;

  // Date Calculation & Picker
  const defaultDateObj = nextAvailableDate();
  const defaultDateStr = formatDate(defaultDateObj);

  // Generate 4 consecutive available dates for quick selection
  const availableDates = useMemo(() => {
    const list: { dateStr: string; label: string; dateObj: Date }[] = [];
    let current = new Date(defaultDateObj);

    for (let i = 0; i < 4; i++) {
      const label = i === 0 ? "Tomorrow (Next Batch)" : (formatDate(current).split(",")[0] || "");
      list.push({
        dateStr: formatDate(current),
        label,
        dateObj: new Date(current),
      });
      current.setDate(current.getDate() + 1);
    }
    return list;
  }, [defaultDateObj]);

  const [selectedDate, setSelectedDate] = useState(defaultDateStr);

  // Fulfilment Choice
  const [fulfilmentType, setFulfilmentType] = useState<"pickup" | "delivery">("pickup");
  const [fulfilmentTime, setFulfilmentTime] = useState(PICKUP_TIMES[0] || "12:00 PM");

  // Customer Details Form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Delivery Address Form
  const [address, setAddress] = useState("");
  const [suite, setSuite] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Springfield");
  const [zipCode, setZipCode] = useState("65809");

  // Special Instructions
  const [instructions, setInstructions] = useState("");

  // Payment Method (Razorpay Online)
  const [paymentMethod] = useState<"card">("card");

  // Promo Code State
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountPercent: number;
    discountFixed: number;
    label: string;
  } | null>(null);

  // Order Placement & Confirmation State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderResponse | null>(null);

  // Address & ZIP Validation Logic
  const zipValidation = useMemo(() => {
    const cleanZip = zipCode.trim();
    if (!cleanZip) return { valid: false, message: "Please enter your ZIP code" };

    const validSpringfieldZips = ["65809", "65804", "65807", "65810", "65802", "65803", "65806", "65897", "65714", "65721"];
    const isSpringfield = validSpringfieldZips.some((z) => cleanZip.includes(z)) || cleanZip.startsWith("658") || cleanZip.startsWith("657");

    if (isSpringfield) {
      return {
        valid: true,
        message: "✓ Verified: Within 10-mile Springfield Delivery Zone",
      };
    }
    return {
      valid: false,
      message: "⚠️ Outside standard 10-mile radius. Counter pickup recommended at 3625 S Bedford Ave.",
    };
  }, [zipCode]);

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
    const tax = 0;
    const deliveryCost = fulfilmentType === "delivery" ? (count >= freeThreshold ? 0 : configuredDeliveryFee) : 0;
    const grandTotal = discountedSubtotal + deliveryCost;

    return {
      subtotal,
      discountAmount,
      discountedSubtotal,
      tax,
      deliveryCost,
      grandTotal,
    };
  }, [subtotal, appliedPromo, fulfilmentType, count, freeThreshold, configuredDeliveryFee]);

  // Promo Code Handlers
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



  // Direct WhatsApp Message URL
  const whatsappBookingUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    `👑 *JAKloud J PARADIZE DUM BIRYANI BOOKING*\n\n` +
      `*Customer:* ${name || "VIP Patron"}\n` +
      `*Phone:* ${phone || "417-897-9754"}\n` +
      `*Fulfilment:* ${fulfilmentType.toUpperCase()} on ${selectedDate} at ${fulfilmentTime}\n` +
      (fulfilmentType === "delivery" ? `*Delivery Address:* ${address}, ${suite ? `${suite}, ` : ""}${landmark ? `(Landmark: ${landmark}), ` : ""}${city} ${zipCode}\n` : `*Pickup Hub:* 3625 S Bedford Ave, Springfield\n`) +
      `\n*Handi Trays (${count}):*\n` +
      lines.map((l) => `• ${l.qty}x ${l.name} (${l.aloo ? "+Spiced Aloo" : "No Aloo"}, ${l.extraSpicy ? "Extra Spicy" : "Regular"}) - $${(l.unitPrice * l.qty).toFixed(2)}`).join("\n") +
      `\n\n*Grand Total:* $${calculations.grandTotal.toFixed(2)}` +
      (appliedPromo ? ` (Promo: ${appliedPromo.code})` : "") +
      (instructions ? `\n*Kitchen Notes:* ${instructions}` : ""),
  )}`;

  // Handle Form Submission
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lines.length === 0) {
      toast.error("Your cart is empty. Please add items before checking out.");
      return;
    }

    if (!isValidName(name)) {
      toast.error("Please enter a valid full name (letters only, min 2 characters).");
      return;
    }

    if (!isValidUsPhone(phone)) {
      toast.error("Please enter a valid 10-digit US mobile number, e.g. (417) 897-9754.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address for your order confirmation.");
      return;
    }

    if (fulfilmentType === "delivery") {
      if (!address.trim()) {
        toast.error("Please provide your delivery street address.");
        return;
      }
      if (!zipValidation.valid) {
        toast.error("Please provide a valid Springfield ZIP code within our 10-mile radius.");
        return;
      }
    }

    // Verify date capacity against admin limit
    const cap = jakloudStore.getCapacityForDate(selectedDate);
    if (cap.isSoldOut || cap.remainingSlots <= 0) {
      toast.error(`The kitchen is completely sold out for ${selectedDate}. Please select another date.`);
      return;
    }
    // Validate kitchen open & cutoff
    const settings = jakloudStore.getSettings();
    if (!settings.isKitchenOpen) {
      toast.error("Kitchen ordering is currently closed by the Master Chef.");
      return;
    }

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const cutoffHour = settings.orderCutoffHour || 15;
    let cutoffMinute = 0;
    if (settings.orderCutoffTime && settings.orderCutoffTime.includes(":")) {
      const parts = settings.orderCutoffTime.split(":");
      cutoffMinute = parseInt(parts[1] || "0", 10);
    }
    const cutoffMins = cutoffHour * 60 + cutoffMinute;
    const isPastCutoff = currentMins >= cutoffMins;

    const cutoffHour12 = cutoffHour > 12 ? cutoffHour - 12 : cutoffHour === 0 ? 12 : cutoffHour;
    const cutoffAmPm = cutoffHour >= 12 ? "PM" : "AM";
    const cutoffLabel = `${cutoffHour12}:${String(cutoffMinute).padStart(2, "0")} ${cutoffAmPm}`;

    if (isPastCutoff) {
      const fDate = (selectedDate || "").toLowerCase();
      const isToday = fDate.includes("today") || normalizeDateKey(selectedDate) === normalizeDateKey(now);
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      const isTomorrow = fDate.includes("tomorrow") || normalizeDateKey(selectedDate) === normalizeDateKey(tmrw);

      if (isToday || isTomorrow) {
        toast.error(`⚠️ Today's order cutoff time (${cutoffLabel}) has passed! Orders for this batch are closed.`);
        return;
      }
    }

    if (count > cap.remainingSlots) {
      toast.error(
        `Only ${cap.remainingSlots} slot${cap.remainingSlots > 1 ? "s" : ""} left for ${selectedDate}, but you have ${count} trays in your cart. Please select another date or reduce tray count.`
      );
      return;
    }

    try {
      setIsSubmitting(true);

      let razorpayPaymentId: string | null = null;
      if (paymentMethod === "card") {
        try {
          const paymentResult = await openRazorpayCheckout({
            amount: calculations.grandTotal,
            customerName: name.trim(),
            customerPhone: phone.trim(),
            customerEmail: email.trim(),
            description: `Handcrafted Dum Biryani (${count} tray${count > 1 ? "s" : ""})`,
            notes: {
              fulfilmentType,
              date: selectedDate,
              time: fulfilmentTime,
            },
          });
          razorpayPaymentId = paymentResult.razorpay_payment_id;
          toast.success(`Payment verified! ID: ${paymentResult.razorpay_payment_id}`);
        } catch (payErr: any) {
          setIsSubmitting(false);
          if (payErr?.message?.includes("cancelled") || payErr?.message?.includes("dismissed")) {
            return;
          }
          toast.error(payErr?.message || "Razorpay payment failed. Please try again.");
          return;
        }
      }

      const response = await api.createOrder({
        items: lines.map((l) => ({
          proteinId: l.proteinId,
          aloo: l.aloo,
          extraSpicy: l.extraSpicy,
          notes: l.notes,
          qty: l.qty,
        })),
        fulfilmentType,
        fulfilmentDate: selectedDate,
        fulfilmentTime,
        customer: {
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          ...(fulfilmentType === "delivery" && {
            address: `${address.trim()}${suite ? `, ${suite.trim()}` : ""}`,
            city: city.trim(),
            zipCode: zipCode.trim(),
            deliveryInstructions: landmark.trim() || undefined,
          }),
        },
        paymentMethod: razorpayPaymentId ? `Razorpay Online (${razorpayPaymentId})` : "Razorpay Online",
        paymentStatus: razorpayPaymentId ? "paid" : "pending",
        paymentId: razorpayPaymentId || undefined,
        specialInstructions: instructions.trim() || undefined,
      });

      setConfirmedOrder(response.order);
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }
      clear();
      toast.success("Dum Biryani Handi booking confirmed successfully!");
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to place order";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------------------
  // SUCCESS SCREEN (CONFIRMED BOOKING RECEIPT)
  // -------------------------------------------------------------------------
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#fbf9f5] font-sans text-zinc-900 selection:bg-amber-500/20 selection:text-amber-800 py-12 px-4 sm:px-8 relative overflow-hidden">
        <div className="mx-auto max-w-3xl space-y-8 relative z-10">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-12 text-center shadow-xl space-y-6">
            {/* Animated Royal Checkmark */}
            <div className="mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 to-amber-500 border-2 border-emerald-400 text-white shadow-lg animate-bounce">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-800 shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>Handi Dum Booking Confirmed</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-zinc-900">
                Thank You, {confirmedOrder.customer.name}!
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto pt-1 leading-relaxed">
                Your royal Dum Biryani handi reservation has been scheduled with Master Chef Kartheek. Each tray is
                slow-cooked to order on morning wood coals.
              </p>
            </div>

            {/* Booking Ref Badge */}
            <div className="flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-3 rounded-2xl bg-zinc-50 border-2 border-amber-300 px-6 py-3 font-mono text-sm sm:text-base font-bold text-zinc-900 shadow-sm">
                <span className="text-zinc-700">Booking Reference:</span>
                <span className="text-amber-900 tracking-widest bg-amber-100/80 px-3 py-1 rounded-xl border border-amber-300">
                  {confirmedOrder.orderNumber}
                </span>
              </div>
              {confirmedOrder.orderNumber.match(/-(\d+)$/) && (
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-4 py-1 text-xs font-bold text-amber-800">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>Today's Handi Order #{parseInt(confirmedOrder.orderNumber.match(/-(\d+)$/)![1], 10)}</span>
                </div>
              )}
            </div>

            {/* PROMINENT TAKE SCREENSHOT CALLOUT CARD */}
            <div className="max-w-xl mx-auto rounded-3xl bg-amber-50 border-2 border-amber-400 p-5 sm:p-6 text-center space-y-3 shadow-md">
              <div className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 text-zinc-950 px-4 py-1.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow">
                <Camera className="h-4 w-4 stroke-[2.5]" />
                <span>PLEASE TAKE A SCREENSHOT OF THIS SCREEN</span>
              </div>
              <div className="space-y-1">
                <p className="text-base sm:text-lg font-bold text-amber-950">
                  📸 Important: Save Your Order Receipt
                </p>
                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed max-w-md mx-auto">
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
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-800 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <Printer className="h-4 w-4 text-amber-600" />
                  <span>Save / Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator?.clipboard) {
                      navigator.clipboard.writeText(confirmedOrder.orderNumber);
                      toast.success("Order ID copied to clipboard!");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-800 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  <Copy className="h-4 w-4 text-amber-600" />
                  <span>Copy Order ID</span>
                </button>
              </div>
            </div>

            {/* Fulfilment & Summary Breakdown Grid */}
            <div className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 text-left text-xs sm:grid-cols-2 text-zinc-700">
              <div className="space-y-2">
                <p className="text-[0.68rem] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Fulfilment Schedule</span>
                </p>
                <p className="font-bold text-zinc-900 capitalize text-sm">
                  {confirmedOrder.fulfilmentType === "pickup" ? "Counter Pickup (Free)" : "Springfield Doorstep Delivery"}
                </p>
                <p className="text-amber-800 font-semibold">
                  {confirmedOrder.fulfilmentDate} at {confirmedOrder.fulfilmentTime}
                </p>

                {confirmedOrder.fulfilmentType === "pickup" ? (
                  <div className="pt-2 text-[0.72rem] text-zinc-600">
                    <p className="font-bold text-zinc-900">Pickup Location:</p>
                    <p>{BUSINESS.address}</p>
                    <a
                      href="https://maps.google.com/?q=3625+S+Bedford+Ave+Springfield+MO+65809"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-amber-800 hover:underline pt-1 font-bold"
                    >
                      <Navigation className="h-3 w-3" /> Get Google Maps Directions ↗
                    </a>
                  </div>
                ) : (
                  <div className="pt-2 text-[0.72rem] text-zinc-600">
                    <p className="font-bold text-zinc-900">Delivery Destination:</p>
                    <p>
                      {confirmedOrder.customer.address}, {confirmedOrder.customer.city} {confirmedOrder.customer.zipCode}
                    </p>
                    {confirmedOrder.customer.deliveryInstructions && (
                      <p className="text-amber-800 italic pt-0.5">Landmark: {confirmedOrder.customer.deliveryInstructions}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-zinc-200 sm:pl-4 pt-4 sm:pt-0">
                <p className="text-[0.68rem] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5 text-amber-600" />
                  <span>Order Items & Payment</span>
                </p>
                <div className="space-y-1">
                  {confirmedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[0.72rem]">
                      <span className="text-zinc-800">
                        {item.qty}× {item.name} {item.aloo ? "(+Aloo)" : ""}
                      </span>
                      <span className="text-amber-800 font-mono font-semibold">{formatMoney(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-200 space-y-1 text-[0.72rem]">
                  {confirmedOrder.deliveryFee > 0 && (
                    <div className="flex justify-between text-zinc-600">
                      <span>Delivery Fee:</span>
                      <span>{formatMoney(confirmedOrder.deliveryFee)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-display text-base font-bold text-zinc-900 pt-1">
                    <span>Total Amount:</span>
                    <span className="text-amber-800">{formatMoney(confirmedOrder.total)}</span>
                  </div>
                </div>

                <p className="text-[0.68rem] text-zinc-500 pt-1">
                  Confirmation receipt dispatched to <strong className="text-zinc-900">{confirmedOrder.customer.email}</strong> &{" "}
                  <strong className="text-zinc-900">{confirmedOrder.customer.phone}</strong>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button
                asChild
                className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs px-6 py-5 shadow-md hover:brightness-105 transition-all"
              >
                <Link to="/">Return to Home</Link>
              </Button>

              <a
                href={whatsappBookingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 px-5 py-3 text-xs font-bold text-emerald-800 transition-all shadow-sm"
              >
                <MessageSquare className="h-4 w-4 text-emerald-600" />
                <span>Track on WhatsApp</span>
              </a>

              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
                className="rounded-2xl border-zinc-300 text-zinc-700 hover:bg-zinc-50 text-xs font-bold px-5 py-5 gap-1.5"
              >
                <Printer className="h-4 w-4" />
                <span>Print Receipt</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // MAIN CHECKOUT FORM SCREEN
  // -------------------------------------------------------------------------
  return (
    <div className="min-h-screen w-full max-w-full bg-[#fbf9f5] font-sans text-zinc-900 selection:bg-amber-500/20 selection:text-amber-900 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 relative overflow-x-hidden pb-28">
      <div className="mx-auto max-w-7xl w-full min-w-0 space-y-6 relative z-10">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 pb-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl text-xs font-medium w-fit -ml-2"
          >
            <Link to="/cart">
              <ArrowLeft className="h-4 w-4" /> Back to Shopping Cart
            </Link>
          </Button>

          {/* Checkout Progress Pills (Responsive wrap) */}
          <div className="flex flex-wrap items-center gap-1.5 text-[0.65rem] sm:text-[0.68rem] font-medium uppercase tracking-wider text-zinc-500">
            <span className="text-emerald-700 font-semibold">1. Menu</span>
            <span className="text-zinc-300">›</span>
            <span className="text-emerald-700 font-semibold">2. Customizer</span>
            <span className="text-zinc-300">›</span>
            <span className="text-emerald-700 font-semibold">3. Cart</span>
            <span className="text-zinc-300">›</span>
            <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-amber-900 font-bold shadow-xs">
              4. Checkout & Details
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-amber-800 font-medium">
            <Lock className="h-3.5 w-3.5" />
            <span>256-Bit SSL Secure Checkout</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* ========================================================= */}
          {/* LEFT: CHECKOUT DETAILS FORM (7-8 COLS)                    */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-[0.65rem] font-medium text-amber-800">
                <Sparkles className="h-3 w-3 text-amber-600" />
                <span>Made To Order Handi Reservation</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900">
                Booking & <span className="text-amber-700">Fulfilment Details</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
                Provide your contact details, choose Springfield counter pickup or doorstep delivery, and schedule your slow-cooked dum biryani batch.
              </p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-6">
              {/* ===================================================== */}
              {/* SECTION 1: FULFILMENT & SCHEDULE                      */}
              {/* ===================================================== */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 sm:p-6 shadow-sm space-y-4 min-w-0 w-full overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-sm sm:text-lg font-semibold text-zinc-900 flex items-center gap-2 min-w-0 truncate">
                    <Store className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                    <span className="truncate">1. Fulfilment & Schedule</span>
                  </h2>
                  <span className="text-[10px] sm:text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0">
                    Springfield, MO
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Counter Pickup Option Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setFulfilmentType("pickup");
                      setFulfilmentTime(PICKUP_TIMES[0] || "12:00 PM");
                    }}
                    className={`rounded-xl border p-4 text-left transition-all flex flex-col justify-between cursor-pointer ${
                      fulfilmentType === "pickup"
                        ? "border-amber-500 bg-amber-50/70 shadow-sm ring-1 ring-amber-400"
                        : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                            fulfilmentType === "pickup" ? "bg-amber-500 text-zinc-950 font-bold" : "bg-zinc-200 text-zinc-700"
                          }`}
                        >
                          <Store className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-zinc-900">Counter Pickup</p>
                          <p className="text-[11px] text-emerald-700 font-medium">FREE ($0.00)</p>
                        </div>
                      </div>
                      {fulfilmentType === "pickup" && (
                        <div className="h-5 w-5 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-zinc-100 text-[11px] text-zinc-600 space-y-0.5">
                      <p className="font-medium text-zinc-900">{BUSINESS.address}</p>
                      <p className="text-zinc-500">Pickup window: 11:00 AM – 1:00 PM (Lunch)</p>
                    </div>
                  </button>

                  {/* Doorstep Delivery Option Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setFulfilmentType("delivery");
                      setFulfilmentTime(DELIVERY_TIMES[0] || "2:00 PM");
                    }}
                    className={`rounded-xl border p-4 text-left transition-all flex flex-col justify-between cursor-pointer ${
                      fulfilmentType === "delivery"
                        ? "border-amber-500 bg-amber-50/70 shadow-sm ring-1 ring-amber-400"
                        : "bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                            fulfilmentType === "delivery" ? "bg-amber-500 text-zinc-950 font-bold" : "bg-zinc-200 text-zinc-700"
                          }`}
                        >
                          <Truck className="h-4.5 w-4.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-zinc-900">Doorstep Delivery</p>
                          <p className="text-[11px] text-amber-800 font-medium">
                            {count >= freeThreshold
                              ? `FREE (${freeThreshold}+ Trays)`
                              : `$${configuredDeliveryFee.toFixed(2)} Flat Rate`}
                          </p>
                        </div>
                      </div>
                      {fulfilmentType === "delivery" && (
                        <div className="h-5 w-5 rounded-full bg-amber-500 text-zinc-950 flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-zinc-100 text-[11px] text-zinc-600 space-y-0.5">
                      <p className="font-medium text-zinc-900">Springfield 10-Mile Radius</p>
                      <p className="text-zinc-500">Delivered piping hot: 2:00 PM – 6:00 PM</p>
                    </div>
                  </button>
                </div>

                {/* Date & Time Picker */}
                <div className="pt-2 border-t border-zinc-100">
                  <DumDateTimePicker
                    selectedDate={selectedDate}
                    onDateChange={(newDate) => setSelectedDate(newDate)}
                    selectedTime={fulfilmentTime}
                    onTimeChange={(newTime) => setFulfilmentTime(newTime)}
                    fulfilmentMode={fulfilmentType}
                  />
                </div>
              </div>

              {/* ===================================================== */}
              {/* SECTION 2: CUSTOMER CONTACT DETAILS                   */}
              {/* ===================================================== */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 sm:p-6 shadow-sm space-y-4 min-w-0 w-full overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-sm sm:text-lg font-semibold text-zinc-900 flex items-center gap-2 min-w-0 truncate">
                    <User className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                    <span className="truncate">2. Contact Details</span>
                  </h2>
                  <span className="text-[10px] sm:text-[11px] text-zinc-500 shrink-0">Order Confirmation</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Full Name */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-medium text-zinc-700">
                      Full Name *
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                      <Input
                        id="fullName"
                        required
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(sanitizeName(e.target.value))}
                        className="h-11 bg-zinc-50 border-zinc-200 text-zinc-900 text-base sm:text-sm rounded-xl pl-10 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* US Mobile Phone */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="mobilePhone" className="text-xs font-medium text-zinc-700">
                        US Phone Number *
                      </Label>
                      {isValidUsPhone(phone) && (
                        <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                          <Check className="h-3 w-3" /> Valid US Number
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <div className="absolute left-3.5 top-3 flex items-center gap-1 text-xs text-zinc-500 font-mono">
                        <span>🇺🇸</span>
                        <span>+1</span>
                      </div>
                      <Input
                        id="mobilePhone"
                        type="tel"
                        inputMode="numeric"
                        required
                        placeholder="(417) 897-9754"
                        maxLength={14}
                        value={phone}
                        onChange={(e) => setPhone(formatUsPhone(e.target.value))}
                        className="h-11 bg-zinc-50 border-zinc-200 text-zinc-900 text-base sm:text-sm rounded-xl pl-16 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="emailAddress" className="text-xs font-medium text-zinc-700">
                      Email Address *
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                      <Input
                        id="emailAddress"
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 bg-zinc-50 border-zinc-200 text-zinc-900 text-base sm:text-sm rounded-xl pl-10 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* ===================================================== */}
              {/* SECTION 3: DELIVERY ADDRESS (IF DELIVERY SELECTED)    */}
              {/* ===================================================== */}
              {fulfilmentType === "delivery" && (
                <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 sm:p-6 shadow-sm space-y-4 animate-in fade-in duration-200 min-w-0 w-full overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-sm sm:text-lg font-semibold text-zinc-900 flex items-center gap-2 min-w-0 truncate">
                      <MapPin className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                      <span className="truncate">3. Delivery Address</span>
                    </h2>
                    <span className="text-[10px] sm:text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                      10-Mile Radius
                    </span>
                  </div>

                  <div className="grid gap-3.5 sm:grid-cols-2">
                    {/* Street Address */}
                    <div className="sm:col-span-2 space-y-1.5">
                      <Label htmlFor="streetAddress" className="text-xs font-medium text-zinc-700">
                        Street Address *
                      </Label>
                      <div className="relative">
                        <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                        <Input
                          id="streetAddress"
                          required
                          placeholder="e.g. 1234 S National Ave"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="h-11 bg-zinc-50 border-zinc-200 text-zinc-900 text-base sm:text-sm rounded-xl pl-10 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Suite / Apartment */}
                    <div className="space-y-1.5">
                      <Label htmlFor="aptSuite" className="text-xs font-medium text-zinc-700">
                        Apt / Suite / Unit (Optional)
                      </Label>
                      <div className="relative">
                        <Building className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                        <Input
                          id="aptSuite"
                          placeholder="Apt 4B"
                          value={suite}
                          onChange={(e) => setSuite(e.target.value)}
                          className="h-11 bg-zinc-50 border-zinc-200 text-zinc-900 text-base sm:text-sm rounded-xl pl-10 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* Landmark / Gate Code */}
                    <div className="space-y-1.5">
                      <Label htmlFor="landmarkInstructions" className="text-xs font-medium text-zinc-700">
                        Gate Code / Landmark (Optional)
                      </Label>
                      <div className="relative">
                        <Navigation className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
                        <Input
                          id="landmarkInstructions"
                          placeholder="e.g. Gate code #1234 / Leave on porch"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          className="h-11 bg-zinc-50 border-zinc-200 text-zinc-900 text-base sm:text-sm rounded-xl pl-10 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <Label htmlFor="cityName" className="text-xs font-medium text-zinc-700">
                        City
                      </Label>
                      <Input
                        id="cityName"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="h-11 bg-zinc-50 border-zinc-200 text-zinc-900 text-sm rounded-xl px-3.5 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Springfield ZIP Code */}
                    <div className="space-y-1.5">
                      <Label htmlFor="zipCodeInput" className="text-xs font-medium text-zinc-700">
                        ZIP Code (5 Digits) *
                      </Label>
                      <Input
                        id="zipCodeInput"
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder="65804"
                        maxLength={5}
                        value={zipCode}
                        onChange={(e) => setZipCode(sanitizeZipCode(e.target.value))}
                        className="h-11 bg-zinc-50 border-zinc-200 text-zinc-900 text-sm rounded-xl px-3.5 font-mono focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Springfield Radius Status Badge */}
                  <div
                    className={`rounded-xl px-3.5 py-2.5 text-xs flex items-center justify-between border ${
                      zipValidation.valid
                        ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                        : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {zipValidation.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      )}
                      <span className="font-medium">{zipValidation.message}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* SECTION 4: KITCHEN PREPARATION & SPECIAL NOTES        */}
              {/* ===================================================== */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 sm:p-6 shadow-sm space-y-3 min-w-0 w-full overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-sm sm:text-lg font-semibold text-zinc-900 flex items-center gap-2 min-w-0 truncate">
                    <Flame className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                    <span className="truncate">4. Kitchen Notes (Optional)</span>
                  </h2>
                  <span className="text-[10px] sm:text-[11px] text-zinc-500 shrink-0">Dietary & Prefs</span>
                </div>

                <Textarea
                  id="specialInstructions"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Allergies, extra gravy request, heating notes, or delivery drop-off spot..."
                  rows={2}
                  className="bg-zinc-50 border-zinc-200 text-zinc-900 text-sm rounded-xl p-3 focus:border-amber-500 focus:bg-white focus:ring-1 focus:ring-amber-500"
                />
              </div>

              {/* ===================================================== */}
              {/* SECTION 5: PAYMENT PREFERENCE                         */}
              {/* ===================================================== */}
              <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 sm:p-6 shadow-sm space-y-4 min-w-0 w-full overflow-hidden">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-display text-sm sm:text-lg font-semibold text-zinc-900 flex items-center gap-2 min-w-0 truncate">
                    <CreditCard className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                    <span className="truncate">5. Payment Method</span>
                  </h2>
                  <span className="text-[10px] sm:text-[11px] text-emerald-700 font-medium shrink-0">Zero Surcharges</span>
                </div>

                {/* Only Razorpay Online Payment */}
                <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 via-amber-50/40 to-transparent p-3.5 sm:p-4 ring-1 ring-amber-300/40 shadow-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-xs sm:text-sm text-zinc-900 truncate">
                            Razorpay Online Payment
                          </p>
                          <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-800 uppercase tracking-wider shrink-0">
                            Instant
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 mt-0.5 truncate">
                          Cards, UPI & Netbanking (Instant Kitchen Order Dispatch)
                        </p>
                      </div>
                    </div>
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-zinc-950 font-bold text-xs shrink-0">
                      ✓
                    </div>
                  </div>
                </div>
              </div>

              {/* Confirm Order Action Button */}
              <Button
                type="submit"
                disabled={isSubmitting || lines.length === 0}
                size="lg"
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-zinc-950 font-bold text-sm sm:text-base py-5 sm:py-6 shadow-md hover:brightness-105 transition-all flex items-center justify-center gap-2 cursor-pointer px-3"
              >
                {isSubmitting ? (
                  "Opening Razorpay Payment..."
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5 shrink-0" />
                    <span className="font-bold text-center">
                      Pay with Razorpay · {formatMoney(calculations.grandTotal)}
                    </span>
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: STICKY ORDER SUMMARY (4-5 COLS)                    */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-5 min-w-0 w-full">
            <div className="rounded-2xl border border-zinc-200 bg-white p-3.5 sm:p-6 shadow-sm space-y-4 sm:space-y-5 min-w-0 w-full overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                <div className="min-w-0">
                  <span className="text-[9.5px] sm:text-[10px] font-semibold uppercase tracking-wider text-amber-700 block">Order Review</span>
                  <h2 className="flex items-center gap-1.5 font-display text-base sm:text-lg font-semibold text-zinc-900 truncate">
                    <ShoppingBag className="h-4.5 w-4.5 text-amber-600 shrink-0" />
                    <span className="truncate">Summary ({count} {count === 1 ? "Tray" : "Trays"})</span>
                  </h2>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-amber-800 hover:bg-zinc-100 rounded-xl font-medium shrink-0 px-2 sm:px-3">
                  <Link to="/cart">Edit Cart</Link>
                </Button>
              </div>

              {count === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-xs text-zinc-500">Your cart is currently empty.</p>
                  <Button asChild className="rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs px-4 hover:bg-amber-400">
                    <Link to="/menu">Explore Handi Menu</Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Cart Item Cards */}
                  <div className="max-h-72 space-y-3 overflow-y-auto divide-y divide-zinc-100 pr-1">
                    {lines.map((line) => {
                      const dishImage = DISH_IMAGES[line.proteinId] || heroImg;
                      const isHalal = line.proteinId !== "pork";

                      return (
                        <div key={line.key} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                          <div className="relative h-13 w-13 rounded-xl overflow-hidden border border-zinc-200 shrink-0">
                            <img src={dishImage} alt={line.name} className="h-full w-full object-cover" />
                            {isHalal && (
                              <span className="absolute bottom-0.5 right-0.5 bg-emerald-900/90 text-emerald-200 text-[9px] font-bold px-1 rounded">
                                Halal
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex justify-between font-medium text-zinc-900">
                              <span className="truncate pr-1">
                                {line.qty}× {line.name}
                              </span>
                              <span className="text-amber-800 font-mono font-semibold shrink-0">
                                {formatMoney(line.unitPrice * line.qty)}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500">
                              {line.aloo ? "• Royal Dum Aloo (Free)" : "• No Aloo"} ·{" "}
                              {line.extraSpicy ? "🌶️ Spicy" : "🌿 Mild"}
                            </p>
                            {line.notes && <p className="text-[10px] text-amber-800 italic truncate">{line.notes}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Promo Code Input Field */}
                  <div className="pt-2 border-t border-zinc-100 space-y-2">
                    {appliedPromo ? (
                      <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800">
                        <div className="flex items-center gap-2">
                          <Tag className="h-3.5 w-3.5 text-emerald-600" />
                          <div>
                            <span className="font-bold uppercase font-mono">{appliedPromo.code}</span>
                            <span className="text-[10px] block text-emerald-700">{appliedPromo.label}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePromo}
                          className="text-[10px] text-zinc-500 hover:text-zinc-900 px-2 py-0.5 rounded bg-zinc-200/80 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyPromo} className="flex gap-1.5">
                        <Input
                          placeholder="Promo code (e.g. JPARADIZE)"
                          value={promoInput}
                          onChange={(e) => setPromoInput(e.target.value)}
                          className="bg-zinc-50 border-zinc-200 text-zinc-900 text-xs rounded-xl uppercase font-mono focus:bg-white"
                        />
                        <Button
                          type="submit"
                          disabled={!promoInput.trim()}
                          className="rounded-xl bg-amber-500 text-zinc-950 hover:bg-amber-400 text-xs font-bold px-3 shrink-0 cursor-pointer"
                        >
                          Apply
                        </Button>
                      </form>
                    )}
                  </div>

                  {/* Itemized Calculation Summary */}
                  <div className="space-y-2 border-t border-zinc-100 pt-3 text-xs">
                    <div className="flex justify-between text-zinc-700">
                      <span>Subtotal ({count} {count === 1 ? "Tray" : "Trays"}):</span>
                      <span className="font-mono">{formatMoney(calculations.subtotal)}</span>
                    </div>

                    {calculations.discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Promo Discount ({appliedPromo?.code}):</span>
                        <span className="font-mono">−{formatMoney(calculations.discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-zinc-500">
                      <span>Fulfilment ({fulfilmentType === "pickup" ? "Pickup" : "Delivery"}):</span>
                      <span className="font-mono">{calculations.deliveryCost === 0 ? "Free ($0.00)" : formatMoney(calculations.deliveryCost)}</span>
                    </div>

                    <div className="flex justify-between border-t border-zinc-200 pt-3 font-display text-lg font-bold text-zinc-900">
                      <span>Grand Total:</span>
                      <span className="text-amber-700 font-mono text-xl">{formatMoney(calculations.grandTotal)}</span>
                    </div>
                  </div>

                  {/* Fulfilment Schedule Indicator */}
                  <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3 text-xs text-zinc-700 space-y-1">
                    <p className="flex items-center gap-1.5 text-amber-800 font-semibold text-[11px]">
                      <Clock className="h-3.5 w-3.5" /> Scheduled For:
                    </p>
                    <p className="text-xs pl-5 text-zinc-800">
                      <strong>{selectedDate}</strong> at{" "}
                      <strong className="text-amber-800">{fulfilmentTime}</strong>
                    </p>
                  </div>

                  {/* Secondary Action: Direct WhatsApp Fast Booking */}
                  <div className="space-y-2 pt-1">
                    <a
                      href={whatsappBookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 p-2.5 text-xs font-semibold text-emerald-800 transition-all shadow-xs"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>WhatsApp Direct Booking</span>
                    </a>

                    <a
                      href={`tel:${BUSINESS.phone}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 p-2 text-xs font-medium text-zinc-800 transition-all"
                    >
                      <Phone className="h-3.5 w-3.5 text-amber-700" />
                      <span>Kitchen Hotline: {BUSINESS.phone}</span>
                    </a>
                  </div>

                  {/* Halal & Fresh Dum Assurance Seal */}
                  <div className="flex items-center gap-2 rounded-xl bg-amber-50/60 border border-amber-200/60 p-2.5 text-[11px] text-zinc-600">
                    <Shield className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span>100% Zabiha Halal • Slow-cooked wood & coal Dum</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
