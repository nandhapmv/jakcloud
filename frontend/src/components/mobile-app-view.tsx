import React, { useState, useMemo } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  MapPin,
  Plus,
  Minus,
  Home,
  Menu as MenuIcon,
  ShoppingBag,
  User,
  Sparkles,
  Shield,
  Phone,
  MessageSquare,
  ChevronRight,
  Flame,
  Check,
  RotateCw,
  Clock,
  Calendar,
  Truck,
  Store,
  CreditCard,
  Banknote,
  QrCode,
  Lock,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Share2,
  CheckCircle2,
  Info,
  Navigation,
  AlertCircle,
  Building,
  Mail,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { formatUsPhone, isValidUsPhone, sanitizeName, isValidName } from "@/lib/validation";
import { openRazorpayCheckout } from "@/lib/razorpay";

// Springfield Quick Location Presets
const SPRINGFIELD_PRESETS = [
  { name: "MSU Campus", address: "901 S National Ave, Springfield, MO 65897", landmark: "Plaster Student Union" },
  { name: "Mercy Hospital", address: "1235 E Cherokee St, Springfield, MO 65804", landmark: "Main Hospital Entrance" },
  { name: "Battlefield Mall", address: "2825 S Glenstone Ave, Springfield, MO 65804", landmark: "Near Main Entrance" },
  { name: "Downtown Square", address: "134 Park Central Square, Springfield, MO 65806", landmark: "Historic Park Central" },
];

import logoImg from "@/assets/logo.png";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";
import heroImg from "@/assets/hero-biryani.jpg";

import { useCart } from "@/lib/cart";
import {
  MENU,
  BUSINESS,
  formatMoney,
  formatDate,
  nextAvailableDate,
  type ProteinId,
  type MenuItem,
  ALOO_CHARGE,
  DELIVERY_FEE,
  PICKUP_TIMES,
  DELIVERY_TIMES,
} from "@/lib/menu";
import { useKitchenSettings, useDynamicMenu, jakloudStore, type DynamicOrder } from "@/lib/store";
import { api } from "@/lib/api";
import { DumDateTimePicker } from "@/components/dum-date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// Protein images mapping
const DISH_IMAGES: Record<string, string> = {
  chicken: chickenImg,
  mutton: muttonImg,
  beef: rawBeefImg,
  pork: rawPorkImg,
  paneer: paneerImg,
  prawn: prawnImg,
  seafood: prawnImg,
};

// Protein metadata matching the official flyer
const PROTEIN_FLYER_DATA: Record<
  string,
  {
    emoji: string;
    flyerName: string;
    meatDesc: string;
    halal: boolean;
    badge: string;
  }
> = {
  chicken: {
    emoji: "🍗",
    flyerName: "Chicken",
    meatDesc: "1.6 – 1.8 kg marinated chicken thighs on dum",
    halal: true,
    badge: "Popular",
  },
  beef: {
    emoji: "🥩",
    flyerName: "Beef",
    meatDesc: "1.7 kg prime slow-braised beef cuts",
    halal: true,
    badge: "Hearty",
  },
  pork: {
    emoji: "🍖",
    flyerName: "Pork",
    meatDesc: "1.6 kg Springfield signature pork shoulder",
    halal: false,
    badge: "House Special",
  },
  mutton: {
    emoji: "🐐",
    flyerName: "Mutton",
    meatDesc: "1.8 kg tender baby goat in pure desi ghee",
    halal: true,
    badge: "Royal Feast",
  },
  prawn: {
    emoji: "🦐",
    flyerName: "Seafood",
    meatDesc: "1.5 kg wild jumbo king tiger prawns",
    halal: true,
    badge: "Coastal Dum",
  },
  paneer: {
    emoji: "🧀",
    flyerName: "Paneer (Veg)",
    meatDesc: "1.2 kg fresh malai paneer in saffron gravy",
    halal: false,
    badge: "100% Veg",
  },
};

export interface MobileAppViewProps {
  initialTab?: "home" | "menu" | "cart" | "profile";
}

export function MobileAppView({ initialTab = "home" }: MobileAppViewProps) {
  const { lines, addLine, setQty, updateLine, removeLine, count, subtotal, clearCart } = useCart();
  const { settings } = useKitchenSettings();
  const { items: dynamicMenuItems } = useDynamicMenu();
  const navigate = useNavigate();

  // Real-time dynamic menu synced from Admin & Backend
  const displayMenu = useMemo(() => {
    if (!dynamicMenuItems || dynamicMenuItems.length === 0) {
      return MENU;
    }
    return dynamicMenuItems.map((d) => {
      const pId = (d.proteinId || d.id || "chicken").replace(/^dish-/, "") as ProteinId;
      return {
        id: pId,
        dishId: d.id,
        proteinId: pId,
        name: d.name,
        category: d.category,
        price: d.price,
        priceWithAloo: d.priceWithAloo || d.price + (settings?.alooCharge ?? 0),
        note: d.badge || "Handi Dum",
        description: d.description,
        meatWeight: d.meatWeight,
        riceWeight: d.riceWeight,
        kcal: d.kcal,
        kcalAloo: d.kcalAloo || (d.kcal ? d.kcal + 157 : 1850),
        available: d.available !== false,
        image: d.image || DISH_IMAGES[pId] || chickenImg,
        badge: d.badge,
        halal: d.isHalalCertified !== false,
      };
    });
  }, [dynamicMenuItems, settings?.alooCharge]);

  const lowestPrice = useMemo(() => {
    if (displayMenu.length === 0) return 98.99;
    return Math.min(...displayMenu.map((d) => d.price));
  }, [displayMenu]);

  // Navigation State
  const [activeTab, setActiveTab] = useState<"home" | "menu" | "cart" | "profile">(initialTab);
  
  // Step in Home Tab: "biryani_card" (first Biryani category) -> "protein_menu" (click to open proteins)
  const [homeStep, setHomeStep] = useState<"biryani_card" | "protein_menu">("biryani_card");
  
  const [fulfilmentMode, setFulfilmentMode] = useState<"pickup" | "delivery">("pickup");

  // Interactive Customizer Modal
  const [selectedDishModal, setSelectedDishModal] = useState<any | null>(null);
  const [modalAloo, setModalAloo] = useState(false);
  const [modalExtraSpicy, setModalExtraSpicy] = useState(false);
  const [modalNotes, setModalNotes] = useState("");

  // Location Selector Modal
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Checkout Form State
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "details" | "payment" | "success">("cart");
  const [selectedDate, setSelectedDate] = useState<string>(formatDate(nextAvailableDate()));
  const [selectedTime, setSelectedTime] = useState<string>("12:00 PM");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryApt, setDeliveryApt] = useState("");
  const [deliveryLandmark, setDeliveryLandmark] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    name?: boolean;
    phone?: boolean;
    address?: boolean;
  }>({});
  const [paymentMethod, setPaymentMethod] = useState<"Razorpay Online" | "Cash on Pickup / Delivery">("Razorpay Online");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [razorpayPaymentId, setRazorpayPaymentId] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<DynamicOrder | null>(null);

  // Calculate live financial totals
  const currentAlooFee = settings?.alooCharge ?? ALOO_CHARGE;
  const currentDeliveryFee = fulfilmentMode === "delivery" ? (settings?.deliveryFee ?? DELIVERY_FEE) : 0;
  const taxRate = 0.086; // 8.6%
  const calculatedTax = subtotal * taxRate;
  const grandTotal = subtotal + currentDeliveryFee + calculatedTax;

  // 1-Tap Geolocation Location Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsLocating(true);
    toast.info("Accessing your GPS location...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data && data.display_name) {
            setDeliveryAddress(data.display_name);
            setValidationErrors((prev) => ({ ...prev, address: false }));
            toast.success("📍 Current location detected!");
          } else {
            setDeliveryAddress(`Springfield Area (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
            setValidationErrors((prev) => ({ ...prev, address: false }));
            toast.success("📍 GPS Coordinates detected!");
          }
        } catch {
          setDeliveryAddress(`Springfield Area (GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          setValidationErrors((prev) => ({ ...prev, address: false }));
          toast.success("📍 GPS location recorded!");
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission denied. Please type your delivery address.");
        } else {
          toast.error("Could not fetch location. Please enter your street address.");
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Form Validation
  const validateCustomerDetails = (): boolean => {
    const errors: { name?: boolean; phone?: boolean; address?: boolean } = {};
    let isValid = true;

    if (!isValidName(customerName)) {
      errors.name = true;
      isValid = false;
    }

    if (!isValidUsPhone(customerPhone)) {
      errors.phone = true;
      isValid = false;
    }

    if (fulfilmentMode === "delivery" && !deliveryAddress.trim()) {
      errors.address = true;
      isValid = false;
    }

    setValidationErrors(errors);

    if (!isValid) {
      if (errors.name) {
        toast.error("Please enter a valid Full Name (letters only, min 2 characters).");
      } else if (errors.phone) {
        toast.error("Please enter a valid 10-digit US phone number, e.g. (417) 897-9754.");
      } else if (errors.address) {
        toast.error("Please enter your Delivery Address or click '📍 Use Current Location'.");
      }
    }

    return isValid;
  };

  const handleProceedToPayment = () => {
    if (!validateCustomerDetails()) return;
    setCheckoutStep("payment");
  };

  // Helper to count quantity in cart for a specific protein
  const getProteinCartCount = (proteinId: string) => {
    return lines
      .filter((l) => l.proteinId === proteinId)
      .reduce((sum, l) => sum + l.qty, 0);
  };

  // Quick 1-tap add to cart from protein card
  const handleAddProteinToCart = (dish: any) => {
    addLine({
      proteinId: dish.id,
      name: dish.name,
      aloo: false,
      extraSpicy: false,
      notes: "",
      qty: 1,
      unitPrice: dish.price,
    });

    toast.success(`Added 1× ${dish.name} Handi Tray to Cart`);
  };

  // Quick quantity increment/decrement from protein card
  const handleUpdateProteinQty = (dish: any, delta: number) => {
    const existingLines = lines.filter((l) => l.proteinId === dish.id);
    if (delta > 0) {
      if (existingLines.length > 0) {
        setQty(existingLines[0].key, existingLines[0].qty + delta);
      } else {
        handleAddProteinToCart(dish);
      }
    } else if (delta < 0) {
      if (existingLines.length > 0) {
        const targetLine = existingLines[existingLines.length - 1];
        setQty(targetLine.key, targetLine.qty - 1);
      }
    }
  };

  // Open full customizer dialog
  const handleOpenCustomizer = (dish: any) => {
    setSelectedDishModal(dish);
    setModalAloo(true); // Default to adding the free royal aloo
    setModalExtraSpicy(true); // Default to authentic spicy
    setModalNotes("");
  };

  // Confirm customization modal
  const handleAddFromModal = () => {
    if (!selectedDishModal) return;
    const unitPrice = modalAloo && currentAlooFee > 0
      ? (selectedDishModal.priceWithAloo || selectedDishModal.price + currentAlooFee)
      : selectedDishModal.price;

    addLine({
      proteinId: selectedDishModal.id,
      name: selectedDishModal.name,
      aloo: modalAloo,
      extraSpicy: modalExtraSpicy,
      notes: modalNotes.trim(),
      qty: 1,
      unitPrice,
    });

    toast.success(
      `Added ${selectedDishModal.name} (${modalAloo ? "With Free Aloo" : "No Aloo"}, ${modalExtraSpicy ? "Spicy" : "No Spicy"}) to Cart`,
    );
    setSelectedDishModal(null);
  };

  // Generate WhatsApp formatted message
  const buildWhatsAppMessage = (order: DynamicOrder | null) => {
    if (!order) {
      return `https://wa.me/14178979754?text=${encodeURIComponent(
        "Hello Master Chef Kartheek! I would like to order handcrafted Dum Biryani Handi trays for Springfield pickup/delivery.",
      )}`;
    }

    const itemsSummary = order.items
      .map(
        (it) =>
          `• ${it.qty}x ${it.name} (${it.aloo ? "With Royal Aloo (Free)" : "No Aloo"}, ${it.extraSpicy ? "🌶️ Spicy" : "🌿 No Spicy (Mild)"}) - ${formatMoney(it.lineTotal)}`,
      )
      .join("\n");

    const message = [
      `👑 JAKLOUD SPICE KING DUM BIRYANI 👑`,
      `Artisanal Handi Tray Booking`,
      `────────────────────────`,
      `Order #: ${order.orderNumber}`,
      `Customer: ${order.customer.name}`,
      `Phone: ${order.customer.phone}`,
      order.customer.email ? `Email: ${order.customer.email}` : null,
      `Fulfilment: ${order.fulfilmentType.toUpperCase()}`,
      `Date: ${order.fulfilmentDate} at ${order.fulfilmentTime}`,
      order.fulfilmentType === "delivery"
        ? `📍 Delivery Location: ${order.customer.address}`
        : `📍 Kitchen Pickup: ${BUSINESS.address}`,
      `────────────────────────`,
      `ITEMS ORDERED:`,
      itemsSummary,
      `────────────────────────`,
      `Subtotal: ${formatMoney(order.subtotal)}`,
      order.deliveryFee > 0 ? `Delivery Fee: ${formatMoney(order.deliveryFee)}` : `Delivery: FREE Pickup`,
      `Tax (8.6%): ${formatMoney(order.tax)}`,
      `TOTAL AMOUNT: ${formatMoney(order.total)}`,
      `Payment: ${order.paymentMethod}`,
      `────────────────────────`,
      `Thank you Master Chef Kartheek! Please confirm my handcrafted dum order.`,
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/14178979754?text=${encodeURIComponent(message)}`;
  };

  // Submit and create order
  const handlePlaceOrder = async () => {
    if (!validateCustomerDetails()) return;

    const fullAddress =
      fulfilmentMode === "delivery"
        ? `${deliveryAddress.trim()}${deliveryApt.trim() ? `, Apt/Suite ${deliveryApt.trim()}` : ""}${
            deliveryLandmark.trim() ? ` (Landmark: ${deliveryLandmark.trim()})` : ""
          }`
        : BUSINESS.address;

    const orderItems = lines.map((l) => ({
      proteinId: l.proteinId,
      name: l.name,
      aloo: l.aloo,
      extraSpicy: l.extraSpicy,
      notes: l.notes || "",
      qty: l.qty,
      unitPrice: l.unitPrice,
      lineTotal: l.unitPrice * l.qty,
    }));

    // If Razorpay Online is selected, launch real Razorpay Checkout modal
    let razorpayId: string | null = null;
    if (paymentMethod === "Razorpay Online") {
      try {
        setIsProcessingPayment(true);
        const paymentResult = await openRazorpayCheckout({
          amount: grandTotal,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || "customer@jakloud.com",
          description: `Handcrafted Dum Biryani (${count} tray${count > 1 ? "s" : ""})`,
          notes: {
            fulfilmentType: fulfilmentMode,
            date: selectedDate,
            time: selectedTime,
          },
        });
        razorpayId = paymentResult.razorpay_payment_id;
        setRazorpayPaymentId(paymentResult.razorpay_payment_id);
        toast.success(`Payment verified! ID: ${paymentResult.razorpay_payment_id}`);
      } catch (err: any) {
        setIsProcessingPayment(false);
        if (err?.message?.includes("cancelled") || err?.message?.includes("dismissed")) {
          // User closed checkout modal - don't proceed with order creation
          return;
        }
        toast.error(err?.message || "Razorpay payment failed. Please try again or pay on pickup.");
        return;
      } finally {
        setIsProcessingPayment(false);
      }
    }

    try {
      // 1. Sync to backend Express API & database
      await api.createOrder({
        items: lines.map((l) => ({
          proteinId: l.proteinId,
          aloo: l.aloo,
          extraSpicy: l.extraSpicy,
          notes: l.notes,
          qty: l.qty,
        })),
        fulfilmentType: fulfilmentMode,
        fulfilmentDate: selectedDate,
        fulfilmentTime: selectedTime,
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim() || "customer@jakloud.com",
          phone: customerPhone.trim(),
          ...(fulfilmentMode === "delivery" && {
            address: fullAddress,
            city: "Springfield",
            zipCode: "65809",
            deliveryInstructions: deliveryLandmark.trim() || undefined,
          }),
        },
        paymentMethod,
        paymentStatus: paymentMethod === "Razorpay Online" ? "paid" : "pending",
        specialInstructions:
          fulfilmentMode === "delivery"
            ? `Delivery to ${fullAddress}`
            : "Made to order fresh handi dum biryani.",
      });
    } catch (err: any) {
      console.warn("Backend API sync completed with fallback:", err?.message);
    }

    // 2. Also register in local client store for instant UX & receipt
    const newOrder = jakloudStore.createOrder({
      fulfilmentType: fulfilmentMode,
      fulfilmentDate: selectedDate,
      fulfilmentTime: selectedTime,
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        email: customerEmail.trim() || "customer@jakloud.com",
        address: fullAddress,
        city: "Springfield",
        zipCode: "65809",
      },
      items: orderItems,
      subtotal,
      tax: calculatedTax,
      deliveryFee: currentDeliveryFee,
      total: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === "Razorpay Online" ? "PAID" : "Cash on Pickup",
      specialInstructions:
        fulfilmentMode === "delivery"
          ? `Delivery to ${fullAddress}`
          : "Made to order fresh handi dum biryani.",
    });

    setCreatedOrder(newOrder);
    setCheckoutStep("success");
    clearCart();
    toast.success(`Order #${newOrder.orderNumber} placed successfully!`);
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-[#09090b] text-zinc-100 font-sans selection:bg-amber-500/20 selection:text-amber-300 pb-32">
      {/* ========================================================================= */}
      {/* TAB CONTENT: HOME TAB                                                     */}
      {/* ========================================================================= */}
      {activeTab === "home" && (
        <main className="w-full max-w-md mx-auto px-4 pt-3.5 space-y-3.5 animate-in fade-in duration-200 overflow-x-hidden">
          {/* STEP 1: INITIAL CATEGORY VIEW (BIRYANI SHOWCASE CARD) */}
          {homeStep === "biryani_card" && (
            <div className="space-y-3.5 w-full">
              {/* Refined Banner */}
              <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#161412] via-[#100f12] to-[#0c0c0e] p-4 shadow-md">
                <div className="relative z-10 space-y-1 text-center">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-medium text-amber-300 mb-0.5">
                    <Sparkles className="h-3 w-3 text-amber-400" /> Limited to 25 Handi Trays Daily
                  </span>
                  <h1 className="text-xl font-semibold text-zinc-100 font-display">
                    Made to Order <span className="text-amber-400 italic">Dum Biryani</span>
                  </h1>
                  <p className="text-xs text-zinc-400 font-normal">
                    Springfield slow-cooked royal dum pukht feast · Serves 4–5 adults
                  </p>
                </div>
              </div>

              {/* Outlet Location & Mode Selector */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLocationModalOpen(true)}
                  className="flex-1 min-w-0 rounded-xl bg-[#121216] border border-white/[0.08] p-2.5 flex items-center justify-between text-left hover:border-amber-500/30 transition-all shadow-sm cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-zinc-200 truncate">JAKLOUD Kitchen</p>
                      <p className="text-[10px] text-zinc-400 truncate">3625 S Bedford Ave, MO</p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] text-amber-400 font-medium">
                    Change →
                  </span>
                </button>

                {/* Pickup vs Delivery Pill Switch */}
                <div className="rounded-xl bg-[#121216] border border-white/[0.08] p-1 flex items-center shrink-0">
                  <button
                    type="button"
                    onClick={() => setFulfilmentMode("pickup")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      fulfilmentMode === "pickup"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setFulfilmentMode("delivery")}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                      fulfilmentMode === "delivery"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    Delivery
                  </button>
                </div>
              </div>

              {/* MAIN BIRYANI HERO CARD (CLICK TO OPEN PROTEIN MENU) */}
              <div
                onClick={() => setHomeStep("protein_menu")}
                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121216] p-3.5 shadow-md hover:border-amber-500/40 active:scale-[0.99] transition-all space-y-3"
              >
                {/* Visual Image Banner */}
                <div className="relative h-44 w-full overflow-hidden rounded-xl bg-black border border-white/[0.05]">
                  <img
                    src={chickenImg}
                    alt="Royal Spice King Dum Biryani"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                    <span className="rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-amber-300 text-[10px] font-medium px-2.5 py-0.5">
                      Slow Dum Pukht
                    </span>
                    <span className="rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-zinc-300 text-[10px] font-medium px-2.5 py-0.5">
                      Serves 4–5
                    </span>
                  </div>

                  {/* Bottom Text */}
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
                    <div className="min-w-0 pr-2">
                      <h2 className="text-base font-semibold text-white leading-tight truncate">
                        Royal Dum Biryani Handi Trays
                      </h2>
                      <p className="text-[11px] text-zinc-300 font-normal">
                        {displayMenu.length} fresh protein choices · Saffron aged basmati
                      </p>
                    </div>
                    <span className="shrink-0 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-medium px-2.5 py-1 font-mono">
                      From {formatMoney(lowestPrice)}
                    </span>
                  </div>
                </div>

                {/* Features Highlights */}
                <div className="space-y-2.5 pt-0.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-zinc-900/60 border border-white/[0.05] p-2 text-center">
                      <span className="block text-[10px] font-medium text-amber-400">
                        {displayMenu.length} Protein Options
                      </span>
                      <span className="block text-[10px] text-zinc-400 font-normal mt-0.5">
                        Chicken, Mutton, Beef, Pork, Seafood, Veg
                      </span>
                    </div>

                    <div className="rounded-xl bg-zinc-900/60 border border-white/[0.05] p-2 text-center">
                      <span className="block text-[10px] font-medium text-amber-400">
                        🥔 Royal Dum Aloo
                      </span>
                      <span className="block text-[10px] text-emerald-400 font-semibold mt-0.5">
                        100% Free Option Included
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                    Sealed in traditional dough handis with Kashmiri saffron, whole spices, and desi ghee.
                  </p>

                  {/* Clean CTA Button */}
                  <button
                    type="button"
                    onClick={() => setHomeStep("protein_menu")}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold py-3 text-xs shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                    <span>Choose Biryani Protein →</span>
                  </button>
                </div>
              </div>

              {/* Contact strip */}
              <div className="rounded-xl border border-white/[0.06] bg-[#121216] p-3 text-center space-y-1">
                <p className="text-[10px] font-medium text-zinc-400">
                  Direct Kitchen Hotline & WhatsApp Support
                </p>
                <div className="flex items-center justify-center gap-3 text-xs text-zinc-300">
                  <a href={`tel:${BUSINESS.phone}`} className="text-amber-400 hover:underline font-medium">
                    {BUSINESS.phone}
                  </a>
                  <span className="text-zinc-600">•</span>
                  <a href={`mailto:${BUSINESS.email}`} className="hover:text-zinc-100 font-normal">
                    {BUSINESS.email}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROTEIN OPTIONS MENU */}
          {homeStep === "protein_menu" && (
            <div className="space-y-3 animate-in fade-in duration-200 w-full">
              {/* Back Bar */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setHomeStep("biryani_card")}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Overview</span>
                </button>
                <span className="text-xs text-zinc-400 font-normal">
                  {displayMenu.length} Protein Trays Available
                </span>
              </div>

              {/* Header Box */}
              <div className="rounded-xl bg-[#121216] border border-white/[0.08] p-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-xs sm:text-sm font-semibold text-zinc-100">
                    Select Your Protein Tray
                  </h2>
                  <p className="text-[11px] text-zinc-400 font-normal">
                    Each Handi Tray serves 4–5 adults
                  </p>
                </div>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[10px] font-medium text-amber-300">
                  {displayMenu.length} Options
                </span>
              </div>

              {/* The Protein Option Cards */}
              <div className="space-y-2.5">
                {displayMenu.map((dish) => {
                  const flyerPreset = PROTEIN_FLYER_DATA[dish.id] || {
                    emoji: "🥘",
                    flyerName: dish.name,
                    meatDesc: dish.description,
                    halal: dish.halal ?? true,
                    badge: "Handi Dum",
                  };
                  const flyer = {
                    emoji: flyerPreset.emoji,
                    flyerName: flyerPreset.flyerName,
                    meatDesc: dish.meatWeight || dish.description || flyerPreset.meatDesc,
                    halal: dish.halal !== undefined ? dish.halal : flyerPreset.halal,
                    badge: dish.badge || flyerPreset.badge,
                  };

                  const totalCartCount = getProteinCartCount(dish.id);
                  const dishImg = dish.image || DISH_IMAGES[dish.id] || chickenImg;

                  return (
                    <div
                      key={dish.id}
                      className={`rounded-2xl bg-[#121216] border p-3 shadow-sm transition-all space-y-2.5 ${
                        !dish.available
                          ? "opacity-60 border-white/[0.05]"
                          : "border-white/[0.08] hover:border-amber-500/30"
                      }`}
                    >
                      {/* Top: Image + Info */}
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div
                          onClick={() => dish.available && handleOpenCustomizer(dish)}
                          className={`relative h-18 w-18 shrink-0 overflow-hidden rounded-xl bg-black border border-white/[0.05] ${
                            dish.available ? "cursor-pointer group" : "cursor-not-allowed"
                          }`}
                        >
                          <img
                            src={dishImg}
                            alt={dish.name}
                            className={`h-full w-full object-cover transition-transform duration-300 ${
                              dish.available ? "group-hover:scale-105" : "grayscale"
                            }`}
                            loading="lazy"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[11px] font-semibold text-amber-400">
                              {flyer.flyerName}
                            </span>
                            {flyer.halal ? (
                              <span className="rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-medium px-1.5 py-0.5">
                                100% Halal
                              </span>
                            ) : (
                              <span className="rounded bg-zinc-800 border border-white/10 text-zinc-300 text-[9px] font-medium px-1.5 py-0.5">
                                {flyer.badge}
                              </span>
                            )}
                          </div>

                          <h3
                            onClick={() => dish.available && handleOpenCustomizer(dish)}
                            className={`text-xs sm:text-sm font-medium text-zinc-100 truncate transition-colors mt-0.5 ${
                              dish.available ? "hover:text-amber-300 cursor-pointer" : "cursor-not-allowed"
                            }`}
                          >
                            {dish.name}
                          </h3>

                          <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5 font-normal">
                            {flyer.meatDesc}
                          </p>

                          {/* Price */}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs sm:text-sm font-semibold text-amber-400 font-mono">
                              {formatMoney(dish.price)}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-normal">
                              • Serves 4–5
                            </span>
                            {!dish.available && (
                              <span className="text-[9px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded px-1.5 py-0.5">
                                Sold Out
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Row: Quantity Controls */}
                      <div className="flex items-center justify-between gap-2 border-t border-white/[0.05] pt-2">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-zinc-400 text-[11px] font-normal">In Cart:</span>
                          <span className="font-mono font-medium text-amber-400 text-xs">
                            {totalCartCount > 0 ? `${totalCartCount} Tray${totalCartCount > 1 ? "s" : ""}` : "0"}
                          </span>
                        </div>

                        {/* Quantity Stepper / Open Customizer */}
                        {!dish.available ? (
                          <div className="rounded-lg bg-zinc-800/80 border border-white/5 text-zinc-500 px-3 py-1.5 text-xs font-medium ml-auto">
                            Sold Out
                          </div>
                        ) : totalCartCount === 0 ? (
                          <button
                            type="button"
                            onClick={() => handleOpenCustomizer(dish)}
                            className="flex items-center gap-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 px-3 py-1.5 text-xs font-medium hover:bg-amber-500/30 active:scale-95 transition-all ml-auto cursor-pointer"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            <span>Add Tray</span>
                          </button>
                        ) : (
                          <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900/80 p-0.5 ml-auto">
                            <button
                              type="button"
                              onClick={() => handleUpdateProteinQty(dish, -1)}
                              className="h-6 w-6 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors active:scale-95 cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-medium text-zinc-100 font-mono">
                              {totalCartCount}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenCustomizer(dish)}
                              className="h-6 w-6 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-zinc-800 rounded transition-colors active:scale-95 cursor-pointer"
                              title="Add customized tray (Choose Aloo & Spice)"
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

              {/* Static Review Order / View Cart Button at the end of the list */}
              {count > 0 && (
                <div className="pt-2 pb-6">
                  <button
                    onClick={() => {
                      setActiveTab("cart");
                      setCheckoutStep("cart");
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold py-3 px-4 text-xs shadow-lg flex items-center justify-between hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4" />
                      <span>Review Cart ({count} {count === 1 ? "Tray" : "Trays"})</span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs font-semibold">
                      <span>{formatMoney(subtotal)}</span>
                      <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: FULL MENU TAB                                                */}
      {/* ========================================================================= */}
      {activeTab === "menu" && (
        <main className="px-4 pt-3.5 space-y-3.5 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-zinc-100">Full Handi Menu</h2>
              <p className="text-[11px] text-zinc-400 font-normal">Fresh slow-braised dum biryani trays</p>
            </div>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-mono font-medium text-amber-300">
              {displayMenu.length} Specialties
            </span>
          </div>

          <div className="space-y-2.5">
            {displayMenu.map((dish) => {
              const dishImg = dish.image || DISH_IMAGES[dish.id] || chickenImg;

              return (
                <div
                  key={dish.id}
                  className={`rounded-2xl bg-[#121216] border p-3 space-y-2.5 shadow-sm transition-all ${
                    !dish.available ? "opacity-60 border-white/[0.05]" : "border-white/[0.08]"
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={dishImg}
                      alt={dish.name}
                      className={`h-16 w-16 rounded-xl object-cover shrink-0 border border-white/[0.05] ${
                        !dish.available ? "grayscale" : ""
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-zinc-100 truncate">{dish.name}</h4>
                        <span className="text-xs font-mono font-semibold text-amber-400">
                          {formatMoney(dish.price)}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 font-normal">{dish.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-zinc-500 font-normal">
                          Serves 4–5 · {dish.kcal} kcal
                        </p>
                        {!dish.available && (
                          <span className="text-[9px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded px-1 py-0.2">
                            Sold Out
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
                    <span className="text-[10px] text-zinc-300 font-normal flex items-center gap-1">
                      <span>🥔 Royal Dum Aloo:</span>
                      <span className="text-emerald-400 font-semibold">100% Free ($0)</span>
                    </span>
                    {!dish.available ? (
                      <span className="text-xs text-zinc-500 font-medium px-2.5 py-1">Unavailable</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenCustomizer(dish as any)}
                        className="rounded-lg bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
                      >
                        Customize & Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: CART & CHECKOUT (REVAMPED TO REAL-TIME PRODUCTION LOOK)      */}
      {/* ========================================================================= */}
      {activeTab === "cart" && (
        <main className="px-4 pt-3.5 space-y-3.5 max-w-md mx-auto">
          {/* STEP 1: CART ITEMS & SUMMARY */}
          {checkoutStep === "cart" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-amber-400" />
                  <span>Your Handi Tray Cart</span>
                  {count > 0 && (
                    <span className="rounded-full bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 font-medium">
                      {count}
                    </span>
                  )}
                </h2>
                {count > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clearCart();
                      toast.info("Cleared all items from cart");
                    }}
                    className="text-xs text-zinc-400 hover:text-rose-400 font-normal transition-colors cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {count === 0 ? (
                <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-8 text-center space-y-3 shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <ShoppingBag className="h-6 w-6 opacity-75" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-100">Your Tray Cart is Empty</h3>
                  <p className="text-xs text-zinc-400 font-normal">
                    Explore our authentic biryani options (Chicken, Mutton, Beef, Pork, Seafood, Paneer).
                  </p>
                  <button
                    onClick={() => {
                      setActiveTab("home");
                      setHomeStep("protein_menu");
                    }}
                    className="rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-medium text-xs px-4 py-2 hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    Select Protein Trays →
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-3">
                    {lines.map((line) => {
                      const dishImg = DISH_IMAGES[line.proteinId] || chickenImg;
                      const dish = displayMenu.find((m) => m.id === line.proteinId || m.dishId === line.proteinId) || MENU.find((m) => m.id === line.proteinId);
                      const basePrice = dish?.price ?? (line.aloo ? line.unitPrice - currentAlooFee : line.unitPrice);

                      return (
                        <div
                          key={line.key}
                          className="rounded-2xl bg-[#121216] border border-white/[0.08] p-3.5 shadow-sm space-y-3"
                        >
                          {/* Item Row */}
                          <div className="flex gap-3">
                            <img
                              src={dishImg}
                              alt={line.name}
                              className="h-16 w-16 rounded-xl object-cover shrink-0 border border-white/[0.05]"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                                {line.name}
                              </h4>
                              <p className="text-xs text-zinc-400 font-normal mt-0.5">
                                Base: {formatMoney(basePrice)} {line.aloo ? "• Royal Dum Aloo (Free)" : "• No Aloo"} • {line.extraSpicy ? "🌶️ Spicy" : "🌿 No Spicy"}
                              </p>
                              <p className="text-xs font-mono font-semibold text-amber-400 mt-1">
                                {formatMoney(line.unitPrice * line.qty)}
                              </p>
                            </div>

                            {/* Quantity Controls */}
                            <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900/80 p-0.5 self-start shrink-0">
                              <button
                                type="button"
                                onClick={() => setQty(line.key, line.qty - 1)}
                                className="h-6 w-6 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-medium text-zinc-100 font-mono">
                                {line.qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQty(line.key, line.qty + 1)}
                                className="h-6 w-6 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          {/* REFINED MODERN ALOO SELECTOR PILL (FREE) */}
                          <div className="rounded-xl bg-zinc-900/50 border border-white/[0.05] p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-[11px] font-medium text-zinc-300 flex items-center gap-1.5">
                                <span>🥔 Royal Spiced Dum Aloo</span>
                              </span>
                              <span className="text-[10px] text-emerald-400 font-semibold">
                                Free Included
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => updateLine(line.key, { aloo: false })}
                                className={`py-1.5 px-3 rounded-lg border text-center transition-all cursor-pointer text-xs ${
                                  !line.aloo
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-medium"
                                    : "bg-zinc-900/40 border-white/[0.05] text-zinc-500 hover:text-zinc-300 font-normal"
                                }`}
                              >
                                <span>No Aloo</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => updateLine(line.key, { aloo: true })}
                                className={`py-1.5 px-3 rounded-lg border text-center transition-all cursor-pointer text-xs ${
                                  line.aloo
                                    ? "bg-amber-500/20 text-amber-300 border-amber-500/50 font-medium shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                                    : "bg-zinc-900/40 border-white/[0.05] text-zinc-500 hover:text-zinc-300 font-normal"
                                } flex items-center justify-center gap-1`}
                              >
                                <span>🥔 Add Aloo (Free)</span>
                              </button>
                            </div>
                          </div>

                          {/* Spicy vs No Spicy & delete bar */}
                          <div className="flex items-center justify-between border-t border-white/[0.05] pt-2 text-[11px]">
                            <button
                              type="button"
                              onClick={() => updateLine(line.key, { extraSpicy: !line.extraSpicy })}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                line.extraSpicy
                                  ? "border-rose-500/40 bg-rose-500/15 text-rose-300 font-medium"
                                  : "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 font-medium"
                              }`}
                            >
                              {line.extraSpicy ? (
                                <>
                                  <Flame className="h-3 w-3 text-rose-400" />
                                  <span>🌶️ Spicy</span>
                                </>
                              ) : (
                                <>
                                  <Sparkles className="h-3 w-3 text-emerald-400" />
                                  <span>🌿 No Spicy (Mild)</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                removeLine(line.key);
                                toast.info(`Removed ${line.name} from cart`);
                              }}
                              className="text-xs text-zinc-400 hover:text-rose-400 transition-colors flex items-center gap-1 ml-auto px-2 py-1 rounded-lg hover:bg-rose-500/10 cursor-pointer font-normal"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Fulfilment Selector (Pickup vs Delivery) */}
                  <div className="rounded-2xl bg-[#121216] border border-white/[0.08] p-3.5 space-y-2.5">
                    <span className="block text-xs font-semibold text-zinc-200">
                      Fulfilment Method
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFulfilmentMode("pickup");
                          if (validationErrors.address) {
                            setValidationErrors((prev) => ({ ...prev, address: false }));
                          }
                        }}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          fulfilmentMode === "pickup"
                            ? "bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                            : "bg-zinc-900/40 border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Store className="h-4 w-4 text-amber-400 shrink-0" />
                          <span className="text-xs font-medium text-zinc-100">Pickup (Free)</span>
                        </div>
                        <span className="block text-[10px] text-zinc-400 mt-1 truncate font-normal">
                          3625 S Bedford Ave
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFulfilmentMode("delivery")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          fulfilmentMode === "delivery"
                            ? "bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
                            : "bg-zinc-900/40 border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Truck className="h-4 w-4 text-amber-400 shrink-0" />
                          <span className="text-xs font-medium text-zinc-100">Delivery (+${DELIVERY_FEE})</span>
                        </div>
                        <span className="block text-[10px] text-zinc-400 mt-1 truncate font-normal">
                          Springfield Metro
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* CUSTOMER & DELIVERY DETAILS FORM */}
                  <div className="rounded-2xl bg-[#121216] border border-white/[0.08] p-4 space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                      <div className="flex items-center gap-2">
                        {fulfilmentMode === "delivery" ? (
                          <Truck className="h-4 w-4 text-amber-400" />
                        ) : (
                          <Store className="h-4 w-4 text-amber-400" />
                        )}
                        <h3 className="text-xs sm:text-sm font-semibold text-zinc-100">
                          {fulfilmentMode === "delivery"
                            ? "Springfield Doorstep Delivery Info"
                            : "Kitchen Counter Pickup Details"}
                        </h3>
                      </div>
                      <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-medium">
                        {fulfilmentMode === "delivery" ? "Doorstep Drop" : "Free Pickup"}
                      </span>
                    </div>

                    {/* Pickup Address Banner */}
                    {fulfilmentMode === "pickup" && (
                      <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-start gap-2.5">
                        <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 text-xs">
                          <p className="font-semibold text-amber-300">JAKLOUD Kitchen Counter</p>
                          <p className="text-zinc-300 text-[11px] mt-0.5">{BUSINESS.address}</p>
                          <p className="text-[10px] text-zinc-400 mt-1 font-normal">
                            Prepared fresh on dum for your selected pickup slot.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Customer Full Name */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-medium text-zinc-300">
                          Full Name *
                        </label>
                        {validationErrors.name && (
                          <span className="text-[10px] text-rose-400 flex items-center gap-1 font-normal">
                            <AlertCircle className="h-2.5 w-2.5" /> Letters only (min 2 chars)
                          </span>
                        )}
                        {!validationErrors.name && isValidName(customerName) && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-normal">
                            <Check className="h-2.5 w-2.5" /> Valid Name
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => {
                            // Text only: strip numbers and non-name symbols immediately
                            const sanitized = sanitizeName(e.target.value);
                            setCustomerName(sanitized);
                            if (validationErrors.name) {
                              setValidationErrors((prev) => ({ ...prev, name: false }));
                            }
                          }}
                          placeholder="e.g. Kartheek Reddy (Letters only)"
                          className={`w-full rounded-xl bg-zinc-900/80 border ${
                            validationErrors.name
                              ? "border-rose-500/80 ring-1 ring-rose-500/40"
                              : isValidName(customerName)
                              ? "border-emerald-500/50 focus:border-emerald-400"
                              : "border-white/10 focus:border-amber-400"
                          } pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none`}
                        />
                      </div>
                    </div>

                    {/* Contact Phone Number (US ONLY) */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="block text-[11px] font-medium text-zinc-300">
                          Contact Phone Number (US Only) *
                        </label>
                        {validationErrors.phone && (
                          <span className="text-[10px] text-rose-400 flex items-center gap-1 font-normal">
                            <AlertCircle className="h-2.5 w-2.5" /> Valid 10-digit US number required
                          </span>
                        )}
                        {!validationErrors.phone && isValidUsPhone(customerPhone) && (
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-normal">
                            <Check className="h-2.5 w-2.5" /> Valid US Number
                          </span>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <div className="absolute left-3 flex items-center gap-1 text-zinc-400 pointer-events-none text-xs font-medium select-none z-10">
                          <span>🇺🇸</span>
                          <span className="text-zinc-500 text-[11px] font-mono">+1</span>
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={customerPhone}
                          onChange={(e) => {
                            // Numbers only: strictly format as (XXX) XXX-XXXX and block all letters/symbols
                            const formatted = formatUsPhone(e.target.value);
                            setCustomerPhone(formatted);
                            if (validationErrors.phone) {
                              setValidationErrors((prev) => ({ ...prev, phone: false }));
                            }
                          }}
                          placeholder="(417) 897-9754"
                          maxLength={14}
                          className={`w-full rounded-xl bg-zinc-900/80 border ${
                            validationErrors.phone
                              ? "border-rose-500/80 ring-1 ring-rose-500/40"
                              : isValidUsPhone(customerPhone)
                              ? "border-emerald-500/50 focus:border-emerald-400"
                              : "border-white/10 focus:border-amber-400"
                          } pl-14 pr-8 py-2.5 text-xs text-zinc-100 font-mono placeholder:text-zinc-600 focus:outline-none`}
                        />
                        {isValidUsPhone(customerPhone) && (
                          <CheckCircle2 className="absolute right-2.5 h-4 w-4 text-emerald-400" />
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 block font-normal">
                        Only 10-digit US mobile numbers accepted for kitchen SMS & WhatsApp dispatch.
                      </span>
                    </div>

                    {/* DELIVERY ONLY: Current Location / Address & 1-Tap GPS */}
                    {fulfilmentMode === "delivery" && (
                      <div className="space-y-2 pt-1 border-t border-white/[0.05]">
                        <div className="flex items-center justify-between">
                          <label className="block text-[11px] font-medium text-zinc-300">
                            Current Location / Delivery Address *
                          </label>
                          <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={isLocating}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[10px] font-medium hover:bg-amber-500/25 active:scale-95 transition-all cursor-pointer shadow-sm"
                          >
                            {isLocating ? (
                              <>
                                <RotateCw className="h-3 w-3 animate-spin text-amber-400" />
                                <span>Locating...</span>
                              </>
                            ) : (
                              <>
                                <Navigation className="h-3 w-3 text-amber-400" />
                                <span>📍 Use Current Location</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-amber-400" />
                          <input
                            type="text"
                            value={deliveryAddress}
                            onChange={(e) => {
                              setDeliveryAddress(e.target.value);
                              if (validationErrors.address) {
                                setValidationErrors((prev) => ({ ...prev, address: false }));
                              }
                            }}
                            placeholder="House/Building #, Street Address, Springfield, MO"
                            className={`w-full rounded-xl bg-zinc-900/80 border ${
                              validationErrors.address
                                ? "border-rose-500/80 ring-1 ring-rose-500/40"
                                : "border-white/10 focus:border-amber-400"
                            } pl-9 pr-3 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none`}
                          />
                        </div>

                        {validationErrors.address && (
                          <span className="text-[10px] text-rose-400 flex items-center gap-1 font-normal">
                            <AlertCircle className="h-2.5 w-2.5" /> Please enter delivery address or tap Use Current Location
                          </span>
                        )}

                        {/* Optional Apt / Suite & Landmark */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <input
                            type="text"
                            value={deliveryApt}
                            onChange={(e) => setDeliveryApt(e.target.value)}
                            placeholder="Apt / Suite / Gate #"
                            className="w-full rounded-xl bg-zinc-900/60 border border-white/10 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 font-normal"
                          />
                          <input
                            type="text"
                            value={deliveryLandmark}
                            onChange={(e) => setDeliveryLandmark(e.target.value)}
                            placeholder="Landmark / Instructions"
                            className="w-full rounded-xl bg-zinc-900/60 border border-white/10 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 font-normal"
                          />
                        </div>

                        {/* Quick Springfield Presets */}
                        <div className="pt-1">
                          <span className="block text-[10px] text-zinc-400 font-normal mb-1.5">
                            Quick Springfield Hotspots:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {SPRINGFIELD_PRESETS.map((preset) => (
                              <button
                                key={preset.name}
                                type="button"
                                onClick={() => {
                                  setDeliveryAddress(preset.address);
                                  setDeliveryLandmark(preset.landmark);
                                  if (validationErrors.address) {
                                    setValidationErrors((prev) => ({ ...prev, address: false }));
                                  }
                                  toast.success(`Selected ${preset.name}`);
                                }}
                                className="px-2 py-1 rounded-lg bg-zinc-900/70 border border-white/10 text-zinc-300 text-[10px] font-normal hover:border-amber-500/40 hover:text-amber-300 transition-all cursor-pointer"
                              >
                                📍 {preset.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Booking Date & Time Selection via Interactive Calendar & Clock */}
                    <div className="pt-2 border-t border-white/[0.05]">
                      <DumDateTimePicker
                        selectedDate={selectedDate}
                        onDateChange={(newDateStr) => setSelectedDate(newDateStr)}
                        selectedTime={selectedTime}
                        onTimeChange={(newTime) => setSelectedTime(newTime)}
                        fulfilmentMode={fulfilmentMode}
                      />
                    </div>
                  </div>

                  {/* Order Financial Breakdown */}
                  <div className="rounded-2xl bg-[#121216] border border-white/[0.08] p-3.5 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400 font-normal">
                      <span>Trays Subtotal ({count} item{count > 1 ? "s" : ""})</span>
                      <span className="font-mono text-zinc-200 font-medium">{formatMoney(subtotal)}</span>
                    </div>

                    <div className="flex justify-between text-zinc-400 font-normal">
                      <span>Fulfilment ({fulfilmentMode === "pickup" ? "Kitchen Pickup" : "Doorstep Delivery"})</span>
                      <span className="font-mono text-zinc-200 font-medium">
                        {fulfilmentMode === "pickup" ? "FREE" : formatMoney(currentDeliveryFee)}
                      </span>
                    </div>

                    <div className="flex justify-between text-zinc-400 font-normal">
                      <span>Sales Tax (8.6%)</span>
                      <span className="font-mono text-zinc-200 font-medium">{formatMoney(calculatedTax)}</span>
                    </div>

                    <div className="border-t border-white/[0.08] pt-2.5 flex justify-between items-center text-sm font-medium text-zinc-100">
                      <span>Total Amount</span>
                      <span className="text-base font-mono font-semibold text-amber-400">{formatMoney(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Proceed to Payment Button */}
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold py-3.5 text-xs sm:text-sm shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Proceed to Payment Options ({formatMoney(grandTotal)})</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          )}

          {/* STEP 2: PAYMENT SELECTION */}
          {checkoutStep === "payment" && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCheckoutStep("cart")}
                  className="text-xs text-amber-400 font-medium hover:underline cursor-pointer"
                >
                  ← Back to Cart & Details
                </button>
                <span className="text-xs text-zinc-400 font-normal">Step 2 of 2</span>
              </div>

              {/* Customer & Fulfilment Recap Badge */}
              <div className="rounded-xl bg-zinc-900/60 border border-white/[0.06] p-3 text-xs space-y-1 font-normal">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Customer:</span>
                  <span className="text-zinc-200 font-semibold">{customerName} ({customerPhone})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Fulfilment:</span>
                  <span className="text-amber-300 font-medium">
                    {fulfilmentMode === "delivery" ? "Doorstep Delivery" : "Kitchen Counter Pickup"}
                  </span>
                </div>
                <div className="flex items-start justify-between">
                  <span className="text-zinc-400 font-medium">Location:</span>
                  <span className="text-zinc-300 text-right max-w-[200px] truncate">
                    {fulfilmentMode === "delivery"
                      ? `${deliveryAddress}${deliveryApt ? `, Apt ${deliveryApt}` : ""}`
                      : BUSINESS.address}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Schedule:</span>
                  <span className="text-zinc-300">{selectedDate} at {selectedTime}</span>
                </div>
              </div>

              <div className="rounded-2xl bg-[#121216] border border-white/[0.08] p-4 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-100">Select Payment Option</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-medium">
                    Test Mode Active
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Razorpay Secure Online Payment */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Razorpay Online")}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === "Razorpay Online"
                        ? "bg-amber-500/10 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30"
                        : "bg-zinc-900/40 border-white/[0.06] text-zinc-300 hover:text-zinc-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 mt-0.5 shrink-0">
                          <CreditCard className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-semibold text-zinc-100">
                              Razorpay Secure Checkout
                            </span>
                            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-medium">
                              Instant
                            </span>
                          </div>
                          <span className="block text-[11px] text-zinc-400 font-normal">
                            Cards (Visa / Mastercard / Amex), UPI, Netbanking & Wallets
                          </span>
                          <div className="flex items-center gap-1 text-[9px] text-zinc-500 pt-0.5 font-mono">
                            <Lock className="h-2.5 w-2.5 text-emerald-400" />
                            <span>rzp_test_SwedUUn1KgRMs0 • 100% Sandbox Safe</span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                          paymentMethod === "Razorpay Online"
                            ? "border-amber-400 bg-amber-400 text-black"
                            : "border-zinc-600"
                        }`}
                      >
                        {paymentMethod === "Razorpay Online" && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                      </div>
                    </div>
                  </button>

                  {/* Cash on Pickup / Delivery */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("Cash on Pickup / Delivery")}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === "Cash on Pickup / Delivery"
                        ? "bg-amber-500/10 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30"
                        : "bg-zinc-900/40 border-white/[0.06] text-zinc-300 hover:text-zinc-100"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-lg bg-zinc-800 border border-white/10 text-zinc-400 mt-0.5 shrink-0">
                          <Banknote className="h-4 w-4" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="block text-xs font-semibold text-zinc-100">
                            Pay on {fulfilmentMode === "pickup" ? "Pickup" : "Delivery"}
                          </span>
                          <span className="block text-[11px] text-zinc-400 font-normal">
                            Pay at Springfield kitchen counter or door (Cash / In-person Card)
                          </span>
                        </div>
                      </div>
                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                          paymentMethod === "Cash on Pickup / Delivery"
                            ? "border-amber-400 bg-amber-400 text-black"
                            : "border-zinc-600"
                        }`}
                      >
                        {paymentMethod === "Cash on Pickup / Delivery" && <div className="h-1.5 w-1.5 rounded-full bg-black" />}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Final Total Summary */}
                <div className="rounded-xl bg-zinc-900/60 border border-white/[0.06] p-3 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-normal">Total to Pay:</span>
                  <span className="text-base font-mono font-semibold text-amber-400">
                    {formatMoney(grandTotal)}
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessingPayment}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold py-3.5 text-xs sm:text-sm shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isProcessingPayment ? (
                  <>
                    <RotateCw className="h-4 w-4 animate-spin" />
                    <span>Opening Razorpay Secure Checkout...</span>
                  </>
                ) : paymentMethod === "Razorpay Online" ? (
                  <>
                    <Lock className="h-4 w-4" />
                    <span>Pay {formatMoney(grandTotal)} via Razorpay</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirm & Place Order ({formatMoney(grandTotal)})</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 4: ORDER SUCCESS */}
          {checkoutStep === "success" && createdOrder && (
            <div className="rounded-2xl bg-[#121216] border border-emerald-500/30 p-5 space-y-3.5 text-center shadow-md animate-in fade-in duration-300">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <CheckCircle2 className="h-6 w-6" />
              </div>

              <div>
                <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">
                  Booking Confirmed
                </span>
                <h2 className="text-lg font-semibold text-white mt-0.5">
                  Order #{createdOrder.orderNumber}
                </h2>
                <p className="text-xs text-zinc-400 mt-1 font-normal">
                  Thank you, <strong className="text-zinc-200">{createdOrder.customer.name}</strong>! Your handcrafted dum biryani order is placed.
                </p>
              </div>

              {/* Order Quick Details */}
              <div className="rounded-xl bg-zinc-900/60 border border-white/[0.06] p-3 text-left text-xs space-y-1.5 font-normal">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Fulfilment:</span>
                  <span className="font-medium text-zinc-200 uppercase">{createdOrder.fulfilmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Date & Time:</span>
                  <span className="font-medium text-amber-300">
                    {createdOrder.fulfilmentDate} at {createdOrder.fulfilmentTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Amount:</span>
                  <span className="font-mono font-medium text-emerald-400">
                    {formatMoney(createdOrder.total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Payment Mode:</span>
                  <span className="font-medium text-zinc-300">{createdOrder.paymentMethod}</span>
                </div>
                {createdOrder.paymentStatus === "PAID" && (
                  <div className="flex justify-between items-center pt-1 border-t border-white/[0.05]">
                    <span className="text-zinc-400">Payment Status:</span>
                    <span className="font-medium text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      ✓ PAID
                    </span>
                  </div>
                )}
                {razorpayPaymentId && (
                  <div className="flex justify-between items-center text-[10px] pt-0.5">
                    <span className="text-zinc-400">Razorpay Ref:</span>
                    <span className="font-mono text-amber-300 font-medium">{razorpayPaymentId}</span>
                  </div>
                )}
              </div>

              {/* WHATSAPP RECEIPT BUTTON */}
              <div className="space-y-2 pt-1">
                <a
                  href={buildWhatsAppMessage(createdOrder)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 text-xs shadow-md transition-all active:scale-95"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Send Order to Chef on WhatsApp</span>
                </a>

                <p className="text-[10px] text-zinc-400 font-normal">
                  Send your order booking receipt directly to Master Chef Kartheek (+1 417-897-9754).
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    setActiveTab("home");
                    setHomeStep("biryani_card");
                    setCheckoutStep("cart");
                  }}
                  className="text-xs text-amber-400 hover:underline font-medium cursor-pointer"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: PROFILE / ADMIN                                              */}
      {/* ========================================================================= */}
      {activeTab === "profile" && (
        <main className="px-4 pt-3.5 space-y-3.5 max-w-md mx-auto">
          <div className="rounded-2xl bg-[#121216] border border-white/[0.08] p-5 text-center space-y-2.5 shadow-sm">
            <div className="mx-auto h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/30 p-1 flex items-center justify-center text-amber-400">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">JAKLOUD Guest Account</h3>
              <p className="text-xs text-zinc-400 font-normal">Springfield Dum Biryani Club</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="rounded-2xl bg-[#121216] border border-white/[0.08] overflow-hidden divide-y divide-white/[0.05] shadow-sm">
            <Link
              to="/admin/login"
              className="flex items-center justify-between p-3.5 text-xs font-medium text-amber-400 hover:bg-amber-500/10 transition-colors"
            >
              <span className="flex items-center gap-2.5">
                <Lock className="h-4 w-4" /> Kitchen Admin Portal (Manage Orders)
              </span>
              <ChevronRight className="h-4 w-4" />
            </Link>

            <Link
              to="/validation"
              className="flex items-center justify-between p-3 text-xs font-normal text-zinc-300 hover:text-white"
            >
              <span className="flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-amber-400" /> Daily Capacity & Cutoff Rules
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </Link>

            <Link
              to="/delivery"
              className="flex items-center justify-between p-3 text-xs font-normal text-zinc-300 hover:text-white"
            >
              <span className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-amber-400" /> Springfield Delivery Zones
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </Link>

            <a
              href={`tel:${BUSINESS.phone}`}
              className="flex items-center justify-between p-3 text-xs font-normal text-zinc-300 hover:text-white"
            >
              <span className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-amber-400" /> Kitchen Hotline ({BUSINESS.phone})
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </a>

            <a
              href={`mailto:${BUSINESS.email}`}
              className="flex items-center justify-between p-3 text-xs font-normal text-zinc-300 hover:text-white"
            >
              <span className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-amber-400" /> Email Support ({BUSINESS.email})
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-500" />
            </a>
          </div>
        </main>
      )}

      {/* ========================================================================= */}
      {/* 2. REFINED FLOATING BOTTOM NAVIGATION BAR                                 */}
      {/* ========================================================================= */}
      <nav className="fixed bottom-3 inset-x-0 z-50 px-4 flex justify-center pointer-events-none">
        <div className="w-full max-w-md pointer-events-auto rounded-full bg-[#121216]/90 border border-white/10 px-3 py-1.5 backdrop-blur-xl shadow-xl flex items-center justify-between">
          {/* 1. Home / Biryani */}
          <button
            onClick={() => {
              setActiveTab("home");
              setHomeStep("biryani_card");
              setCheckoutStep("cart");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-all cursor-pointer ${
              activeTab === "home" ? "text-amber-400" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Home className="h-4 w-4 mb-0.5" />
            <span>Biryani</span>
          </button>

          {/* 2. Menu */}
          <button
            onClick={() => {
              setActiveTab("menu");
              setCheckoutStep("cart");
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-all cursor-pointer ${
              activeTab === "menu" ? "text-amber-400" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <MenuIcon className="h-4 w-4 mb-0.5" />
            <span>Menu</span>
          </button>

          {/* 3. Cart / Checkout */}
          <button
            onClick={() => {
              setActiveTab("cart");
              setCheckoutStep("cart");
            }}
            className={`relative flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-all cursor-pointer ${
              activeTab === "cart" ? "text-amber-400" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4 mb-0.5" />
              {count > 0 && (
                <span className="absolute -top-1.5 -right-2 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-400 text-zinc-950 text-[9px] font-semibold px-1">
                  {count}
                </span>
              )}
            </div>
            <span>Cart</span>
          </button>

          {/* 4. WhatsApp Direct Order */}
          <a
            href="https://wa.me/14178979754?text=Hello%20Master%20Chef%20Kartheek!%20I%20would%20like%20to%20order%20a%20fresh%20handcrafted%20Dum%20Biryani%20Handi%20tray%20from%20JAKLOUD."
            target="_blank"
            rel="noreferrer"
            className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-all cursor-pointer text-emerald-400 hover:text-emerald-300"
            title="Chat on WhatsApp"
          >
            <svg
              className="h-4 w-4 mb-0.5 fill-current text-emerald-400"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span className="text-emerald-400 font-medium">WhatsApp</span>
          </a>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* 3. DISH CUSTOMIZATION MODAL                                               */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(selectedDishModal)}
        onOpenChange={(open) => !open && setSelectedDishModal(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl bg-[#121216] border border-white/10 text-zinc-100 p-5 shadow-2xl">
          {selectedDishModal && (
            <div className="space-y-3.5">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <img
                    src={DISH_IMAGES[selectedDishModal.id] || chickenImg}
                    alt={selectedDishModal.name}
                    className="h-14 w-14 rounded-xl object-cover bg-black border border-white/10 shrink-0"
                  />
                  <div>
                    <DialogTitle className="text-sm font-semibold text-zinc-100">
                      {selectedDishModal.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400 mt-0.5 font-normal">
                      Handi Party Tray · Serves 4–5 adults
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Options */}
              <div className="space-y-3 pt-1">
                {/* 1. CHOOSE DUM ALOO (100% FREE) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold">1</span>
                      <span>Choose Royal Dum Aloo</span>
                    </label>
                    <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      100% Free ($0.00)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setModalAloo(true)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        modalAloo
                          ? "bg-amber-500/15 border-amber-400 text-amber-200 ring-1 ring-amber-400/50"
                          : "bg-zinc-900/40 border-white/[0.08] text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-zinc-100">🥔 Add Dum Aloo</span>
                        {modalAloo && <Check className="h-3.5 w-3.5 text-amber-400 stroke-[3]" />}
                      </div>
                      <span className="text-[10px] text-emerald-400 font-medium mt-1">
                        Free ($0.00) Included
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setModalAloo(false)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        !modalAloo
                          ? "bg-amber-500/15 border-amber-400 text-amber-200 ring-1 ring-amber-400/50"
                          : "bg-zinc-900/40 border-white/[0.08] text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-zinc-100">🍚 No Aloo</span>
                        {!modalAloo && <Check className="h-3.5 w-3.5 text-amber-400 stroke-[3]" />}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 font-normal">
                        Protein & basmati only
                      </span>
                    </button>
                  </div>
                </div>

                {/* 2. CHOOSE SPICE LEVEL (SPICY OR NO SPICY) */}
                <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold">2</span>
                      <span>Spice Preference</span>
                    </label>
                    <span className="text-[10px] text-amber-400/90 font-mono">Choose 1</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Option 1: Spicy */}
                    <button
                      type="button"
                      onClick={() => setModalExtraSpicy(true)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        modalExtraSpicy
                          ? "bg-rose-500/15 border-rose-500 text-rose-200 ring-1 ring-rose-500/50"
                          : "bg-zinc-900/40 border-white/[0.08] text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <Flame className="h-3.5 w-3.5 text-rose-400" />
                          <span className="text-xs font-semibold text-zinc-100">🌶️ Spicy</span>
                        </div>
                        {modalExtraSpicy && <Check className="h-3.5 w-3.5 text-rose-400 stroke-[3]" />}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 font-normal">
                        Authentic Hyderabadi heat
                      </span>
                    </button>

                    {/* Option 2: No Spicy (Mild) */}
                    <button
                      type="button"
                      onClick={() => setModalExtraSpicy(false)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        !modalExtraSpicy
                          ? "bg-emerald-500/15 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50"
                          : "bg-zinc-900/40 border-white/[0.08] text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-xs font-semibold text-zinc-100">🌿 No Spicy (Mild)</span>
                        </div>
                        {!modalExtraSpicy && <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />}
                      </div>
                      <span className="text-[10px] text-zinc-400 mt-1 font-normal">
                        Gentle saffron aromatics
                      </span>
                    </button>
                  </div>
                </div>

                {/* Chef Notes Input */}
                <div className="pt-1 border-t border-white/[0.05]">
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Special Instructions / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="e.g. Extra raita, less oil..."
                    className="w-full rounded-lg bg-zinc-900/60 border border-white/10 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleAddFromModal}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold py-3 text-xs sm:text-sm shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer"
              >
                Add to Handi Tray · {formatMoney(selectedDishModal.price)}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 4. LOCATION MODAL                                                         */}
      {/* ========================================================================= */}
      <Dialog open={locationModalOpen} onOpenChange={setLocationModalOpen}>
        <DialogContent className="max-w-sm rounded-2xl bg-[#121216] border border-white/10 text-zinc-100 p-5 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-zinc-100">
              JAKLOUD Kitchen Outlet
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 font-normal">
              Springfield, MO Artisanal Kitchen
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-1">
            <div className="rounded-xl bg-zinc-900/60 border border-amber-500/30 p-3.5 flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400">
                <MapPin className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-zinc-100">Springfield Kitchen</h4>
                <p className="text-[11px] text-zinc-300 mt-0.5 font-normal">
                  3625 S Bedford Ave., Springfield, MO 65809
                </p>
                <span className="inline-block mt-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-medium px-2 py-0.5">
                  Active Outlet
                </span>
              </div>
            </div>

            <div className="rounded-xl bg-zinc-900/40 border border-white/[0.06] p-3 text-xs text-zinc-400 space-y-1 font-normal">
              <p className="font-medium text-zinc-200">Daily 2:00 PM Cutoff</p>
              <p className="text-[11px]">
                Orders placed before 2:00 PM are prepared fresh on dum for next-day pickup or delivery.
              </p>
            </div>

            <button
              onClick={() => {
                setLocationModalOpen(false);
                toast.success("Outlet confirmed: Springfield, MO");
              }}
              className="w-full rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-medium py-2.5 text-xs hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              Confirm Outlet
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
