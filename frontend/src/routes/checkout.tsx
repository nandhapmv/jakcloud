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
  Calendar,
  Store,
  User,
  Mail,
  Building,
  Navigation,
  Check,
  Flame,
  Tag,
  X,
  CreditCard,
  Banknote,
  Printer,
  Compass,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Info,
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Booking & Checkout Details — JAKLOUD Spice King Dum Biryani" },
      {
        name: "description",
        content:
          "Complete your handcrafted Dum Biryani Handi booking. Springfield counter pickup or doorstep delivery with live address verification and time slot scheduling.",
      },
      { property: "og:title", content: "Checkout Details — JAKLOUD Dum Biryani" },
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
  SPICEKING: { discountPercent: 10, discountFixed: 0, label: "10% Royal Welcome Discount" },
  ROYAL10: { discountPercent: 10, discountFixed: 0, label: "10% Off Royal Dum Feasts" },
  HALALFEAST: { discountPercent: 0, discountFixed: 15, label: "$15 Off Halal Family Order" },
  SPRINGFIELD5: { discountPercent: 5, discountFixed: 0, label: "5% Local Springfield Neighbor Discount" },
};

const SPRINGFIELD_LANDMARK_PRESETS = [
  {
    name: "Missouri State University (MSU)",
    address: "901 S National Ave",
    landmark: "Campus Student Union / Plaster Center",
    zipCode: "65897",
    distance: "3.4 miles",
    transitMin: "18 mins",
    coords: { x: 42, y: 38 },
  },
  {
    name: "Mercy Hospital / Medical Mile",
    address: "1235 E Cherokee St",
    landmark: "Main Hospital Entrance / Medical Mile",
    zipCode: "65804",
    distance: "2.1 miles",
    transitMin: "12 mins",
    coords: { x: 58, y: 46 },
  },
  {
    name: "Battlefield Mall District",
    address: "2825 S Glenstone Ave",
    landmark: "Near Dillard's / Glenstone Corridor",
    zipCode: "65804",
    distance: "1.8 miles",
    transitMin: "10 mins",
    coords: { x: 62, y: 64 },
  },
  {
    name: "Chesterfield Village",
    address: "3732 W Chesterfield St",
    landmark: "Clock Tower Plaza",
    zipCode: "65807",
    distance: "5.6 miles",
    transitMin: "24 mins",
    coords: { x: 25, y: 72 },
  },
  {
    name: "Galloway Village",
    address: "4211 S Lone Pine Ave",
    landmark: "Lone Pine Trailhead / Sequiota Park",
    zipCode: "65804",
    distance: "1.2 miles",
    transitMin: "8 mins",
    coords: { x: 74, y: 68 },
  },
  {
    name: "Downtown Springfield",
    address: "300 Park Central Square",
    landmark: "Historic Park Central Square",
    zipCode: "65806",
    distance: "4.8 miles",
    transitMin: "22 mins",
    coords: { x: 38, y: 28 },
  },
];

const QUICK_INSTRUCTION_TAGS = [
  "Extra Salan (Dum Gravy)",
  "Extra Mint & Cucumber Raita",
  "Separate Spicy & Mild Pots",
  "Include Eco Plates & Spoons",
  "Leave at Front Door / Bench",
  "Call upon Arrival",
  "Apartment Gate Code Required",
  "Keep Extra Warm in Thermal Bag",
];

function CheckoutPage() {
  const { lines, subtotal, clear, count, setQty, removeLine } = useCart();
  const navigate = useNavigate();

  // Date Calculation & Picker
  const defaultDateObj = nextAvailableDate();
  const defaultDateStr = formatDate(defaultDateObj);

  // Generate 4 consecutive available dates for quick selection
  const availableDates = useMemo(() => {
    const list: { dateStr: string; label: string; dateObj: Date }[] = [];
    let current = new Date(defaultDateObj);

    for (let i = 0; i < 4; i++) {
      while (current.getDay() === 3) {
        // Skip Wednesday
        current.setDate(current.getDate() + 1);
      }
      const label = i === 0 ? "Tomorrow (Next Batch)" : formatDate(current).split(",")[0];
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
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);

  // Delivery Address Form
  const [address, setAddress] = useState("");
  const [suite, setSuite] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Springfield");
  const [zipCode, setZipCode] = useState("65809");
  const [selectedLandmarkName, setSelectedLandmarkName] = useState<string | null>(null);

  // Interactive Map Pin Position (Percentages inside canvas)
  const [pinCoords, setPinCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [estimatedDistance, setEstimatedDistance] = useState("2.4 miles");
  const [estimatedTransit, setEstimatedTransit] = useState("15 mins");

  // Special Instructions
  const [instructions, setInstructions] = useState("");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<"on_fulfillment" | "card" | "whatsapp">("on_fulfillment");

  // Card Simulation Details
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");

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

  // Quick Landmark Selector Handler
  const handleSelectLandmarkPreset = (preset: (typeof SPRINGFIELD_LANDMARK_PRESETS)[0]) => {
    setAddress(preset.address);
    setLandmark(preset.landmark);
    setZipCode(preset.zipCode);
    setCity("Springfield");
    setSelectedLandmarkName(preset.name);
    setPinCoords(preset.coords);
    setEstimatedDistance(preset.distance);
    setEstimatedTransit(preset.transitMin);
    toast.success(`Selected "${preset.name}" — Address & Map updated!`);
  };

  // Interactive Map Canvas Click
  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    setPinCoords({ x, y });
    const dist = (1.2 + (Math.abs(x - 50) + Math.abs(y - 50)) * 0.08).toFixed(1);
    setEstimatedDistance(`${dist} miles`);
    setEstimatedTransit(`${Math.round(Number(dist) * 4 + 8)} mins`);
    setSelectedLandmarkName("Custom Map Location");
  };

  // Quick Instruction Append
  const handleAddInstructionTag = (tag: string) => {
    if (!instructions.includes(tag)) {
      setInstructions((prev) => (prev ? `${prev}, ${tag}` : tag));
      toast.info(`Added note: "${tag}"`);
    }
  };

  // Direct WhatsApp Message URL
  const whatsappBookingUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    `👑 *JAKLOUD SPICE KING DUM BIRYANI BOOKING*\n\n` +
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

    if (!name.trim()) {
      toast.error("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      toast.error("Please enter your mobile phone number for kitchen SMS updates.");
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
        specialInstructions: instructions.trim() || undefined,
      });

      setConfirmedOrder(response.order);
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
      <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold py-12 px-4 sm:px-8 relative overflow-hidden">
        {/* Background glow flares */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gold/15 blur-[120px] pointer-events-none" />

        <div className="mx-auto max-w-3xl space-y-8 relative z-10">
          <div className="rounded-3xl border-2 border-gold/50 bg-gradient-to-b from-[#1c120a] via-[#140c07] to-[#0a0705] p-6 sm:p-12 text-center shadow-[0_0_60px_rgba(212,175,55,0.25)] backdrop-blur-2xl space-y-6">
            {/* Animated Royal Checkmark */}
            <div className="mx-auto flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-tr from-chili to-gold border-2 border-gold text-white shadow-[0_0_40px_rgba(212,160,23,0.6)] animate-bounce">
              <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-black/60 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-gold shadow-md">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                <span>Handi Dum Booking Confirmed</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream">
                Thank You, {confirmedOrder.customer.name}!
              </h1>
              <p className="text-xs sm:text-sm text-cream/80 max-w-md mx-auto pt-1 leading-relaxed">
                Your royal Dum Biryani handi reservation has been scheduled with Master Chef Kartheek. Each tray is
                slow-cooked to order on morning wood coals.
              </p>
            </div>

            {/* Booking Ref Badge */}
            <div className="inline-flex items-center gap-3 rounded-2xl bg-black/80 border-2 border-gold/40 px-6 py-3 font-mono text-sm sm:text-base font-bold text-gold shadow-xl">
              <span>Booking Reference:</span>
              <span className="text-white tracking-widest bg-gold/20 px-3 py-1 rounded-xl border border-gold/30">
                {confirmedOrder.orderNumber}
              </span>
            </div>

            {/* Fulfilment & Summary Breakdown Grid */}
            <div className="grid gap-4 rounded-2xl border border-gold/25 bg-black/50 p-6 text-left text-xs sm:grid-cols-2 text-cream/85">
              <div className="space-y-2">
                <p className="text-[0.68rem] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Fulfilment Schedule</span>
                </p>
                <p className="font-bold text-cream capitalize text-sm">
                  {confirmedOrder.fulfilmentType === "pickup" ? "Counter Pickup (Free)" : "Springfield Doorstep Delivery"}
                </p>
                <p className="text-gold font-semibold">
                  {confirmedOrder.fulfilmentDate} at {confirmedOrder.fulfilmentTime}
                </p>

                {confirmedOrder.fulfilmentType === "pickup" ? (
                  <div className="pt-2 text-[0.72rem] text-cream/75">
                    <p className="font-bold text-cream">Pickup Location:</p>
                    <p>{BUSINESS.address}</p>
                    <a
                      href="https://maps.google.com/?q=3625+S+Bedford+Ave+Springfield+MO+65809"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-gold hover:underline pt-1 font-bold"
                    >
                      <Navigation className="h-3 w-3" /> Get Google Maps Directions ↗
                    </a>
                  </div>
                ) : (
                  <div className="pt-2 text-[0.72rem] text-cream/75">
                    <p className="font-bold text-cream">Delivery Destination:</p>
                    <p>
                      {confirmedOrder.customer.address}, {confirmedOrder.customer.city} {confirmedOrder.customer.zipCode}
                    </p>
                    {confirmedOrder.customer.deliveryInstructions && (
                      <p className="text-gold/90 italic pt-0.5">Landmark: {confirmedOrder.customer.deliveryInstructions}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 border-t sm:border-t-0 sm:border-l border-gold/15 sm:pl-4 pt-4 sm:pt-0">
                <p className="text-[0.68rem] font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Order Items & Payment</span>
                </p>
                <div className="space-y-1">
                  {confirmedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[0.72rem]">
                      <span className="text-cream">
                        {item.qty}× {item.name} {item.aloo ? "(+Aloo)" : ""}
                      </span>
                      <span className="text-gold font-mono">{formatMoney(item.lineTotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-gold/15 space-y-1 text-[0.72rem]">
                  <div className="flex justify-between text-cream/75">
                    <span>Tax (8.6%) & Charges:</span>
                    <span>{formatMoney(confirmedOrder.tax + confirmedOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between font-display text-base font-bold text-cream pt-1">
                    <span>Total Amount:</span>
                    <span className="text-gold">{formatMoney(confirmedOrder.total)}</span>
                  </div>
                </div>

                <p className="text-[0.68rem] text-cream/60 pt-1">
                  Confirmation receipt dispatched to <strong className="text-cream">{confirmedOrder.customer.email}</strong> &{" "}
                  <strong className="text-cream">{confirmedOrder.customer.phone}</strong>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button
                asChild
                className="rounded-2xl bg-gradient-to-r from-chili to-gold text-white font-bold text-xs px-6 py-5 shadow-lg hover:scale-105 transition-all"
              >
                <Link to="/">Return to Home</Link>
              </Button>

              <a
                href={whatsappBookingUrl}
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
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold py-10 px-4 sm:px-8 relative overflow-hidden pb-28">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-gold/10 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-80 h-80 rounded-full bg-chili/10 blur-[140px] pointer-events-none" />

      <div className="mx-auto max-w-7xl space-y-8 relative z-10">
        {/* Top Header & Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/15 pb-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-1.5 text-gold hover:bg-gold/15 rounded-xl text-xs font-bold w-fit"
          >
            <Link to="/cart">
              <ArrowLeft className="h-4 w-4" /> Back to Shopping Cart
            </Link>
          </Button>

          {/* Checkout Progress Pills */}
          <div className="flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-wider text-cream/60">
            <span className="text-emerald-400">1. Menu</span>
            <span className="text-gold/40">›</span>
            <span className="text-emerald-400">2. Customizer</span>
            <span className="text-gold/40">›</span>
            <span className="text-emerald-400">3. Cart</span>
            <span className="text-gold/40">›</span>
            <span className="rounded-full bg-gold px-2.5 py-0.5 text-black font-extrabold shadow-sm">
              4. Checkout & Details
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-gold">
            <Lock className="h-3.5 w-3.5" />
            <span>256-Bit SSL Secure Checkout</span>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* ========================================================= */}
          {/* LEFT: CHECKOUT DETAILS FORM (7-8 COLS)                    */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/60 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold shadow-md">
                <Sparkles className="h-3 w-3 text-gold" />
                <span>Made To Order Handi Reservation</span>
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-cream">
                Booking & <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">Fulfillment Details</span>
              </h1>
              <p className="text-xs sm:text-sm text-cream/75 leading-relaxed">
                Provide your contact details, choose Springfield counter pickup or doorstep delivery, and schedule your slow-cooked dum biryani batch.
              </p>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-8">
              {/* ===================================================== */}
              {/* SECTION 1: FULFILMENT METHOD (PICKUP VS DELIVERY)     */}
              {/* ===================================================== */}
              <div className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                    <Store className="h-5 w-5 text-gold" />
                    <span>1. Fulfilment Method</span>
                  </h2>
                  <span className="text-[0.68rem] text-gold font-bold">Springfield, MO</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Counter Pickup Option Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setFulfilmentType("pickup");
                      setFulfilmentTime(PICKUP_TIMES[0] || "12:00 PM");
                    }}
                    className={`relative rounded-2xl border p-5 text-left transition-all duration-300 flex flex-col justify-between ${
                      fulfilmentType === "pickup"
                        ? "border-gold bg-gradient-to-b from-[#22140b] to-[#140c08] shadow-[0_0_25px_rgba(212,175,55,0.3)] ring-1 ring-gold/40 text-cream"
                        : "bg-black/40 border-gold/20 hover:bg-black/60 text-cream/75 hover:border-gold/40"
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                            fulfilmentType === "pickup" ? "bg-gold text-black" : "bg-gold/15 text-gold"
                          }`}
                        >
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-cream">Counter Pickup</p>
                          <p className="text-[0.68rem] text-emerald-400 font-semibold">FREE ($0.00)</p>
                        </div>
                      </div>
                      {fulfilmentType === "pickup" && (
                        <div className="h-5 w-5 rounded-full bg-gold text-black flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gold/15 text-xs text-cream/70 space-y-1">
                      <p className="font-medium text-cream">{BUSINESS.address}</p>
                      <p className="text-[0.65rem] text-cream/60">Ready in thermal heat-retention carrier (11 AM – 6 PM)</p>
                    </div>
                  </button>

                  {/* Doorstep Delivery Option Card */}
                  <button
                    type="button"
                    onClick={() => {
                      setFulfilmentType("delivery");
                      setFulfilmentTime(DELIVERY_TIMES[0] || "2:00 PM");
                    }}
                    className={`relative rounded-2xl border p-5 text-left transition-all duration-300 flex flex-col justify-between ${
                      fulfilmentType === "delivery"
                        ? "border-chili bg-gradient-to-b from-[#26100c] to-[#140c08] shadow-[0_0_25px_rgba(185,28,28,0.35)] ring-1 ring-chili/40 text-cream"
                        : "bg-black/40 border-gold/20 hover:bg-black/60 text-cream/75 hover:border-chili/40"
                    }`}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                            fulfilmentType === "delivery"
                              ? "bg-gradient-to-tr from-chili to-gold text-white"
                              : "bg-chili/15 text-chili"
                          }`}
                        >
                          <Truck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-cream">Doorstep Delivery</p>
                          <p className="text-[0.68rem] text-gold font-semibold">
                            {count >= 5 ? "FREE (5+ Trays)" : `$${DELIVERY_FEE}.00 Flat Rate`}
                          </p>
                        </div>
                      </div>
                      {fulfilmentType === "delivery" && (
                        <div className="h-5 w-5 rounded-full bg-gradient-to-r from-chili to-gold text-white flex items-center justify-center">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-3 border-t border-gold/15 text-xs text-cream/70 space-y-1">
                      <p className="font-medium text-cream">Springfield 10-Mile Radar</p>
                      <p className="text-[0.65rem] text-cream/60">Delivered hot between 2:00 PM – 6:00 PM</p>
                    </div>
                  </button>
                </div>

                {/* Date & Time Selection Strip */}
                <div className="space-y-4 pt-2 border-t border-gold/15">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Label className="text-xs text-gold font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Select Fulfilment Date:</span>
                    </Label>
                    <span className="text-[0.68rem] text-cream/60">Daily Dum Cutoff: 2:00 PM</span>
                  </div>

                  {/* Quick Date Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {availableDates.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedDate(item.dateStr)}
                        className={`rounded-2xl p-2.5 text-left border transition-all ${
                          selectedDate === item.dateStr
                            ? "bg-gold text-black border-gold shadow-md font-bold"
                            : "bg-black/60 border-gold/20 text-cream/80 hover:bg-gold/15"
                        }`}
                      >
                        <span className="text-[0.65rem] uppercase block opacity-80">{item.label}</span>
                        <span className="text-xs font-bold block truncate">{item.dateStr.split(",")[1] || item.dateStr}</span>
                      </button>
                    ))}
                  </div>

                  {/* Time Window Selector */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs text-gold font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>Select Preferred Time Slot ({selectedDate}):</span>
                    </Label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(fulfilmentType === "pickup" ? PICKUP_TIMES : DELIVERY_TIMES).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFulfilmentTime(t)}
                          className={`rounded-xl py-2 px-3 text-xs font-bold border transition-all flex items-center justify-between ${
                            fulfilmentTime === t
                              ? "bg-gradient-to-r from-chili to-gold text-white border-gold shadow-md"
                              : "bg-black/60 border-gold/20 text-cream/75 hover:bg-gold/15"
                          }`}
                        >
                          <span>{t}</span>
                          {fulfilmentTime === t && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ===================================================== */}
              {/* SECTION 2: CUSTOMER CONTACT DETAILS (FLOATING LABELS) */}
              {/* ===================================================== */}
              <div className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                    <User className="h-5 w-5 text-gold" />
                    <span>2. Customer Information</span>
                  </h2>
                  <span className="text-[0.68rem] text-gold font-mono">Confidential & Encrypted</span>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  {/* Full Name Field with Floating Label */}
                  <div className="sm:col-span-2 relative group">
                    <div className="relative">
                      <Input
                        id="fullName"
                        required
                        placeholder=" "
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="peer h-14 bg-black/60 border-gold/30 text-cream font-medium text-sm rounded-2xl pl-12 pr-4 pt-4 pb-1 focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                      />
                      <User className="absolute left-4 top-4.5 h-5 w-5 text-gold/60 peer-focus:text-gold transition-colors" />
                      <label
                        htmlFor="fullName"
                        className="absolute left-12 top-2 text-[0.65rem] font-bold text-gold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:text-cream/50 peer-focus:top-2 peer-focus:text-[0.65rem] peer-focus:text-gold pointer-events-none"
                      >
                        Full Name *
                      </label>
                    </div>
                  </div>

                  {/* Phone Number Field with Floating Label */}
                  <div className="relative group">
                    <div className="relative">
                      <Input
                        id="mobilePhone"
                        type="tel"
                        required
                        placeholder=" "
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="peer h-14 bg-black/60 border-gold/30 text-cream font-medium text-sm rounded-2xl pl-12 pr-4 pt-4 pb-1 focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                      />
                      <Phone className="absolute left-4 top-4.5 h-5 w-5 text-gold/60 peer-focus:text-gold transition-colors" />
                      <label
                        htmlFor="mobilePhone"
                        className="absolute left-12 top-2 text-[0.65rem] font-bold text-gold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:text-cream/50 peer-focus:top-2 peer-focus:text-[0.65rem] peer-focus:text-gold pointer-events-none"
                      >
                        Mobile Phone *
                      </label>
                    </div>
                    <p className="text-[0.65rem] text-cream/50 mt-1 pl-2">For real-time Dum Prep & Dispatch SMS alerts</p>
                  </div>

                  {/* Email Field with Floating Label */}
                  <div className="relative group">
                    <div className="relative">
                      <Input
                        id="emailAddress"
                        type="email"
                        required
                        placeholder=" "
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="peer h-14 bg-black/60 border-gold/30 text-cream font-medium text-sm rounded-2xl pl-12 pr-4 pt-4 pb-1 focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                      />
                      <Mail className="absolute left-4 top-4.5 h-5 w-5 text-gold/60 peer-focus:text-gold transition-colors" />
                      <label
                        htmlFor="emailAddress"
                        className="absolute left-12 top-2 text-[0.65rem] font-bold text-gold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:text-cream/50 peer-focus:top-2 peer-focus:text-[0.65rem] peer-focus:text-gold pointer-events-none"
                      >
                        Email Address *
                      </label>
                    </div>
                    <p className="text-[0.65rem] text-cream/50 mt-1 pl-2">Instant booking receipt & tax invoice sent here</p>
                  </div>
                </div>

                {/* WhatsApp Notification Opt-in */}
                <div
                  onClick={() => setWhatsappOptIn(!whatsappOptIn)}
                  className="flex items-center justify-between rounded-2xl bg-black/40 border border-gold/20 p-3.5 cursor-pointer hover:border-gold/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-cream">Send live status updates to WhatsApp</p>
                      <p className="text-[0.65rem] text-cream/60">Receive kitchen slow-cook photos and driver ETA</p>
                    </div>
                  </div>
                  <div
                    className={`h-5 w-10 rounded-full transition-colors relative flex items-center p-0.5 ${
                      whatsappOptIn ? "bg-emerald-500" : "bg-neutral-800"
                    }`}
                  >
                    <div
                      className={`h-4 w-4 rounded-full bg-white transition-transform ${
                        whatsappOptIn ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* ===================================================== */}
              {/* SECTION 3: DELIVERY ADDRESS & INTERACTIVE MAP (DELIVERY) */}
              {/* ===================================================== */}
              {fulfilmentType === "delivery" && (
                <div className="rounded-3xl border border-chili/30 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-saffron" />
                      <span>3. Springfield Delivery Address & Map</span>
                    </h2>
                    <span className="text-[0.68rem] text-saffron font-bold">10-Mile Radius</span>
                  </div>

                  {/* Quick Springfield Landmark Selector Presets */}
                  <div className="space-y-2">
                    <p className="text-[0.68rem] font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                      <Compass className="h-3.5 w-3.5" />
                      <span>Quick Select Springfield Landmarks & Districts:</span>
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {SPRINGFIELD_LANDMARK_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectLandmarkPreset(preset)}
                          className={`rounded-xl p-2.5 text-left border transition-all text-xs ${
                            selectedLandmarkName === preset.name
                              ? "bg-gradient-to-r from-chili/40 to-gold/30 border-gold text-gold font-bold shadow-md"
                              : "bg-black/50 border-gold/15 text-cream/80 hover:bg-black/80 hover:border-gold/35"
                          }`}
                        >
                          <span className="font-semibold block truncate text-cream">{preset.name}</span>
                          <span className="text-[0.62rem] text-cream/55 block">
                            {preset.distance} • ~{preset.transitMin}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Address Input Fields with Floating Labels */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Street Address */}
                    <div className="sm:col-span-2 relative group">
                      <div className="relative">
                        <Input
                          id="streetAddress"
                          required
                          placeholder=" "
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="peer h-14 bg-black/60 border-gold/30 text-cream font-medium text-sm rounded-2xl pl-12 pr-4 pt-4 pb-1 focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                        />
                        <MapPin className="absolute left-4 top-4.5 h-5 w-5 text-gold/60 peer-focus:text-gold transition-colors" />
                        <label
                          htmlFor="streetAddress"
                          className="absolute left-12 top-2 text-[0.65rem] font-bold text-gold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:text-cream/50 peer-focus:top-2 peer-focus:text-[0.65rem] peer-focus:text-gold pointer-events-none"
                        >
                          Street Address *
                        </label>
                      </div>
                    </div>

                    {/* Suite / Apartment */}
                    <div className="relative group">
                      <div className="relative">
                        <Input
                          id="aptSuite"
                          placeholder=" "
                          value={suite}
                          onChange={(e) => setSuite(e.target.value)}
                          className="peer h-14 bg-black/60 border-gold/30 text-cream font-medium text-sm rounded-2xl pl-12 pr-4 pt-4 pb-1 focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                        />
                        <Building className="absolute left-4 top-4.5 h-5 w-5 text-gold/60 peer-focus:text-gold transition-colors" />
                        <label
                          htmlFor="aptSuite"
                          className="absolute left-12 top-2 text-[0.65rem] font-bold text-gold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:text-cream/50 peer-focus:top-2 peer-focus:text-[0.65rem] peer-focus:text-gold pointer-events-none"
                        >
                          Apt / Suite / Unit (Optional)
                        </label>
                      </div>
                    </div>

                    {/* Landmark / Gate Code */}
                    <div className="relative group">
                      <div className="relative">
                        <Input
                          id="landmarkInstructions"
                          placeholder=" "
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                          className="peer h-14 bg-black/60 border-gold/30 text-cream font-medium text-sm rounded-2xl pl-12 pr-4 pt-4 pb-1 focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                        />
                        <Navigation className="absolute left-4 top-4.5 h-5 w-5 text-gold/60 peer-focus:text-gold transition-colors" />
                        <label
                          htmlFor="landmarkInstructions"
                          className="absolute left-12 top-2 text-[0.65rem] font-bold text-gold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:text-cream/50 peer-focus:top-2 peer-focus:text-[0.65rem] peer-focus:text-gold pointer-events-none"
                        >
                          Landmark / Gate Code
                        </label>
                      </div>
                    </div>

                    {/* City */}
                    <div className="relative group">
                      <div className="relative">
                        <Input
                          id="cityName"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="h-14 bg-black/60 border-gold/30 text-cream font-medium text-sm rounded-2xl px-4 pt-4 pb-1 focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                        />
                        <span className="absolute left-4 top-1.5 text-[0.65rem] font-bold text-gold uppercase tracking-wider">
                          City
                        </span>
                      </div>
                    </div>

                    {/* Springfield ZIP Code */}
                    <div className="relative group">
                      <div className="relative">
                        <Input
                          id="zipCodeInput"
                          required
                          placeholder=" "
                          value={zipCode}
                          onChange={(e) => setZipCode(e.target.value)}
                          className="peer h-14 bg-black/60 border-gold/30 text-cream font-medium text-sm rounded-2xl px-4 pt-4 pb-1 focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                        />
                        <label
                          htmlFor="zipCodeInput"
                          className="absolute left-4 top-2 text-[0.65rem] font-bold text-gold uppercase tracking-wider transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-xs peer-placeholder-shown:text-cream/50 peer-focus:top-2 peer-focus:text-[0.65rem] peer-focus:text-gold pointer-events-none"
                        >
                          Springfield ZIP Code *
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Live ZIP & Address Radius Status Badge */}
                  <div
                    className={`rounded-2xl p-3.5 text-xs flex items-center justify-between border ${
                      zipValidation.valid
                        ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300"
                        : "bg-amber-950/70 border-amber-500/50 text-amber-200"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {zipValidation.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                      )}
                      <span className="font-semibold">{zipValidation.message}</span>
                    </div>
                    <span className="text-[0.68rem] text-cream/70 font-mono">
                      {estimatedDistance} • ~{estimatedTransit}
                    </span>
                  </div>

                  {/* Interactive Springfield Google Maps Location Picker Mockup */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-cream flex items-center gap-1.5">
                        <Navigation className="h-3.5 w-3.5 text-gold" />
                        <span>Interactive Springfield Location Picker (Click to adjust pin):</span>
                      </p>
                      <span className="text-[0.65rem] text-gold font-mono">
                        Hub: 3625 S Bedford Ave
                      </span>
                    </div>

                    <div
                      onClick={handleMapClick}
                      className="relative h-64 sm:h-72 w-full rounded-3xl bg-[#0e0a07] border-2 border-gold/30 overflow-hidden cursor-crosshair shadow-inner group"
                    >
                      {/* Grid Radar Lines */}
                      <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

                      {/* Concentric 10-Mile Radius Circles */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full border border-gold/20 border-dashed pointer-events-none" />
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-40 w-40 rounded-full border border-gold/35 pointer-events-none" />
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 rounded-full border border-gold/50 bg-gold/5 pointer-events-none" />

                      {/* Map Annotation Labels */}
                      <div className="absolute top-3 left-3 text-[0.65rem] font-bold text-gold/80 uppercase tracking-wider bg-black/70 px-2.5 py-1 rounded-lg border border-gold/20 backdrop-blur-sm pointer-events-none">
                        Springfield Metro 10-Mile Radar
                      </div>

                      {/* Kitchen Hub Beacon */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center pointer-events-none">
                        <div className="h-6 w-6 rounded-full bg-gold/30 flex items-center justify-center animate-ping" />
                        <div className="absolute h-5 w-5 rounded-full bg-gold border border-white text-black flex items-center justify-center shadow-lg">
                          <Store className="h-3 w-3" />
                        </div>
                      </div>

                      {/* Customer Delivery Pin (Interactive Position) */}
                      <div
                        style={{ left: `${pinCoords.x}%`, top: `${pinCoords.y}%` }}
                        className="absolute -translate-x-1/2 -translate-y-full z-20 transition-all duration-300 pointer-events-none"
                      >
                        <div className="flex flex-col items-center">
                          <div className="rounded-xl bg-black/90 border border-gold/60 px-2.5 py-1 shadow-2xl backdrop-blur-md text-center whitespace-nowrap mb-1 animate-in fade-in">
                            <p className="font-display text-[0.65rem] font-bold text-gold">
                              {selectedLandmarkName || "Delivery Drop-off"}
                            </p>
                            <p className="text-[0.58rem] text-cream/75">
                              {estimatedDistance} • ~{estimatedTransit}
                            </p>
                          </div>
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-chili to-gold border-2 border-white text-white flex items-center justify-center shadow-[0_0_20px_rgba(212,160,23,0.9)] animate-bounce">
                            <MapPin className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      <div className="absolute bottom-2 right-2 text-[0.62rem] text-cream/50 bg-black/80 px-2 py-0.5 rounded border border-gold/15">
                        Click anywhere to reposition drop-off pin
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================== */}
              {/* SECTION 4: KITCHEN PREPARATION & SPECIAL NOTES        */}
              {/* ===================================================== */}
              <div className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                    <Flame className="h-5 w-5 text-chili" />
                    <span>4. Kitchen Preparation & Special Instructions</span>
                  </h2>
                  <span className="text-[0.68rem] text-gold font-semibold">Custom Cooking</span>
                </div>

                {/* Quick Instruction Click Tags */}
                <div className="space-y-1.5">
                  <p className="text-[0.68rem] font-bold uppercase tracking-wider text-cream/70">
                    Quick Add Cooking & Delivery Requests:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_INSTRUCTION_TAGS.map((tag, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAddInstructionTag(tag)}
                        className="rounded-xl bg-black/60 border border-gold/20 hover:border-gold/60 hover:bg-gold/15 px-3 py-1 text-[0.68rem] text-cream/80 transition-colors"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative group">
                  <Textarea
                    id="specialInstructions"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="Gate code, drop-off spot, dietary allergies, heating preferences, extra napkins..."
                    rows={3}
                    className="bg-black/60 border-gold/25 text-cream text-xs rounded-2xl p-4 focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                  />
                </div>
              </div>

              {/* ===================================================== */}
              {/* SECTION 5: PAYMENT PREFERENCE                         */}
              {/* ===================================================== */}
              <div className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-gold" />
                    <span>5. Payment Method</span>
                  </h2>
                  <span className="text-[0.68rem] text-emerald-400 font-semibold">Zero Surcharge</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {/* Pay on Fulfillment */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("on_fulfillment")}
                    className={`rounded-2xl p-4 text-left border transition-all ${
                      paymentMethod === "on_fulfillment"
                        ? "border-gold bg-gold/15 shadow-md text-cream font-bold"
                        : "bg-black/40 border-gold/20 text-cream/70 hover:bg-black/60"
                    }`}
                  >
                    <Banknote className="h-5 w-5 text-gold mb-2" />
                    <p className="font-bold text-xs">Pay on Fulfilment</p>
                    <p className="text-[0.65rem] text-cream/60 mt-0.5">Cash / Card upon arrival / Venmo</p>
                  </button>

                  {/* Secure Card */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`rounded-2xl p-4 text-left border transition-all ${
                      paymentMethod === "card"
                        ? "border-gold bg-gold/15 shadow-md text-cream font-bold"
                        : "bg-black/40 border-gold/20 text-cream/70 hover:bg-black/60"
                    }`}
                  >
                    <CreditCard className="h-5 w-5 text-gold mb-2" />
                    <p className="font-bold text-xs">Credit / Debit Card</p>
                    <p className="text-[0.65rem] text-cream/60 mt-0.5">256-Bit SSL Encrypted</p>
                  </button>

                  {/* WhatsApp Direct */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("whatsapp")}
                    className={`rounded-2xl p-4 text-left border transition-all ${
                      paymentMethod === "whatsapp"
                        ? "border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold"
                        : "bg-black/40 border-gold/20 text-cream/70 hover:bg-black/60"
                    }`}
                  >
                    <MessageSquare className="h-5 w-5 text-emerald-400 mb-2" />
                    <p className="font-bold text-xs">WhatsApp VIP Booking</p>
                    <p className="text-[0.65rem] text-cream/60 mt-0.5">Direct Chef Confirmation</p>
                  </button>
                </div>

                {/* Simulated Card Form Fields */}
                {paymentMethod === "card" && (
                  <div className="rounded-2xl bg-black/50 border border-gold/20 p-4 space-y-3 animate-in fade-in">
                    <p className="text-[0.68rem] text-gold font-bold uppercase tracking-wider">
                      Enter Card Details (256-Bit Secure Simulation):
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-3">
                        <Input
                          placeholder="Card Number (4000 1234 5678 9010)"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="bg-black/60 border-gold/25 text-cream text-xs rounded-xl"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          placeholder="MM / YY"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="bg-black/60 border-gold/25 text-cream text-xs rounded-xl"
                        />
                      </div>
                      <div>
                        <Input
                          placeholder="CVC"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="bg-black/60 border-gold/25 text-cream text-xs rounded-xl"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Order Action Button */}
              <Button
                type="submit"
                disabled={isSubmitting || lines.length === 0}
                size="lg"
                className="w-full rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-base sm:text-lg py-7 shadow-[0_0_30px_rgba(185,28,28,0.5)] hover:scale-[1.01] transition-all gap-2"
              >
                {isSubmitting ? (
                  "Reserving Handi Batch..."
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 animate-spin" />
                    <span>Confirm Handi Booking — {formatMoney(calculations.grandTotal)}</span>
                  </>
                )}
              </Button>
            </form>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: STICKY ORDER SUMMARY (4-5 COLS)                    */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-5">
            <div className="rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-[#1c120a] via-[#140c07] to-[#0a0705] p-6 shadow-2xl backdrop-blur-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gold">Order Review</span>
                  <h2 className="flex items-center gap-2 font-display text-xl font-bold text-cream">
                    <ShoppingBag className="h-5 w-5 text-gold" />
                    <span>Summary ({count} Trays)</span>
                  </h2>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs text-gold hover:bg-gold/15 rounded-xl font-bold">
                  <Link to="/cart">Edit Cart</Link>
                </Button>
              </div>

              {count === 0 ? (
                <div className="text-center py-8 space-y-3">
                  <p className="text-xs text-cream/60">Your cart is currently empty.</p>
                  <Button asChild className="rounded-xl bg-gold text-black font-bold text-xs px-4">
                    <Link to="/menu">Explore Handi Menu</Link>
                  </Button>
                </div>
              ) : (
                <>
                  {/* Cart Item Cards */}
                  <div className="max-h-72 space-y-3 overflow-y-auto divide-y divide-gold/15 pr-1">
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
                            {line.notes && <p className="text-[0.62rem] text-gold/80 italic truncate">{line.notes}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Promo Code Input Field */}
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

                  {/* Itemized Calculation Summary */}
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

                  {/* Fulfilment Schedule Indicator */}
                  <div className="rounded-2xl bg-black/50 border border-gold/20 p-3.5 text-xs text-cream/80 space-y-1">
                    <p className="flex items-center gap-1.5 text-gold font-semibold">
                      <Clock className="h-3.5 w-3.5" /> Order Scheduled For:
                    </p>
                    <p className="text-[0.72rem] pl-5">
                      <strong className="text-cream">{selectedDate}</strong> at{" "}
                      <strong className="text-gold">{fulfilmentTime}</strong>
                    </p>
                  </div>

                  {/* Secondary Action: Direct WhatsApp Fast Booking */}
                  <div className="space-y-2 pt-1">
                    <a
                      href={whatsappBookingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/80 p-3 text-xs font-bold text-emerald-400 transition-all shadow-md"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>WhatsApp Direct VIP Booking</span>
                    </a>

                    <a
                      href={`tel:${BUSINESS.phone}`}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-gold/20 bg-black/60 hover:bg-gold/15 p-2 text-[0.7rem] font-semibold text-gold transition-all"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>Kitchen Hotline: {BUSINESS.phone}</span>
                    </a>
                  </div>

                  {/* Halal & Fresh Dum Assurance Seal */}
                  <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-gold/15 p-2.5 text-[0.68rem] text-gold">
                    <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>100% Zabiha Halal Certified • Fresh Clay Coal Cooking</span>
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
