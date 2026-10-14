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
  Camera,
  Copy,
  Printer,
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
        traySize: d.traySize || (d as any).serves || "Serves 4–5",
        serves: (d as any).serves || d.traySize || "Serves 4–5",
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
  const taxRate = 0;
  const calculatedTax = 0;
  const grandTotal = subtotal + currentDeliveryFee;

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
    const cap = jakloudStore.getCapacityForDate(selectedDate);
    const cartTrayCount = lines.reduce((sum, l) => sum + l.qty, 0);
    if (cap.isSoldOut || cap.remainingSlots <= 0) {
      toast.error(`The kitchen is completely sold out for ${selectedDate}. Please select another date.`);
      return;
    }
    if (cartTrayCount > cap.remainingSlots) {
      toast.error(
        `Only ${cap.remainingSlots} slot${cap.remainingSlots > 1 ? "s" : ""} left for ${selectedDate}, but you have ${cartTrayCount} trays in your cart. Please select another date.`
      );
      return;
    }
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
      const firstLine = existingLines[0];
      if (firstLine) {
        setQty(firstLine.key, firstLine.qty + delta);
      } else {
        handleAddProteinToCart(dish);
      }
    } else if (delta < 0) {
      const targetLine = existingLines[existingLines.length - 1];
      if (targetLine) {
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

    // Validate date capacity before initiating payment or submitting order
    const cap = jakloudStore.getCapacityForDate(selectedDate);
    const cartTrayCount = lines.reduce((sum, l) => sum + (Number(l.qty) || 1), 0);
    if (cap.isSoldOut || cap.remainingSlots <= 0) {
      toast.error(`The kitchen is completely sold out for ${selectedDate}. Please select another date.`);
      return;
    }
    if (cartTrayCount > cap.remainingSlots) {
      toast.error(
        `Only ${cap.remainingSlots} slot${cap.remainingSlots > 1 ? "s" : ""} left for ${selectedDate}, but you have ${cartTrayCount} trays in your cart. Please select another date.`
      );
      return;
    }

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
      // 1. Sync to backend Express API & database (which also safely syncs into local store once)
      const res = await api.createOrder({
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
        paymentMethod: razorpayId ? `Razorpay Online (${razorpayId})` : paymentMethod,
        paymentStatus: paymentMethod === "Razorpay Online" ? "paid" : "pending",
        paymentId: razorpayId || undefined,
        specialInstructions:
          fulfilmentMode === "delivery"
            ? `Delivery to ${fullAddress}`
            : "Made to order fresh handi dum biryani.",
      });

      const confirmed = (res?.order as unknown as DynamicOrder) || null;
      if (confirmed) {
        setCreatedOrder(confirmed);
        setCheckoutStep("success");
        clearCart();
        toast.success(`Order #${confirmed.orderNumber} placed successfully!`);
      } else {
        toast.success("Order placed successfully!");
        setCheckoutStep("success");
        clearCart();
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to place order. Please try again.");
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-[#09090b] text-zinc-100 font-sans selection:bg-amber-500/20 selection:text-amber-300 pb-36 sm:pb-44 overflow-x-hidden">
      {/* ========================================================================= */}
      {/* TAB CONTENT: HOME TAB                                                     */}
      {/* ========================================================================= */}
      {activeTab === "home" && (
        <main className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 pt-2 space-y-3 animate-in fade-in duration-200 overflow-x-hidden">
          {/* Section Title with Limited Badge */}
          <div className="pt-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-semibold text-white font-display">
                Select Biryani Handi Tray
              </h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-300 shrink-0">
                <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                <span>Limited</span>
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Slow-cooked royal Dum Pukht in sealed handis
            </p>
          </div>

          {/* 4. Direct Biryani Trays List */}
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3.5">
            {displayMenu.map((dish) => {
              const flyerPreset = PROTEIN_FLYER_DATA[dish.id] || {
                emoji: "🥘",
                flyerName: dish.name,
                meatDesc: dish.description,
                halal: (dish as any).halal ?? true,
                badge: "Handi Dum",
              };
              const flyer = {
                emoji: flyerPreset.emoji,
                flyerName: flyerPreset.flyerName,
                meatDesc: (dish as any).meatWeight || dish.description || flyerPreset.meatDesc,
                halal: (dish as any).halal !== undefined ? (dish as any).halal : flyerPreset.halal,
                badge: (dish as any).badge || flyerPreset.badge,
              };

              const totalCartCount = getProteinCartCount(dish.id);
              const dishImg = (dish as any).image || DISH_IMAGES[dish.id] || chickenImg;
              const isAvailable = (dish as any).available !== false;

              return (
                <div
                  key={dish.id}
                  className={`rounded-2xl bg-[#121216] border p-3.5 shadow-sm transition-all space-y-3 ${
                    !isAvailable
                      ? "opacity-60 border-white/[0.05]"
                      : "border-white/[0.08] hover:border-amber-500/35"
                  }`}
                >
                  {/* Top: Image + Info */}
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div
                      onClick={() => isAvailable && handleOpenCustomizer(dish)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black border border-white/[0.08] ${
                        isAvailable ? "cursor-pointer group" : "cursor-not-allowed"
                      }`}
                    >
                      <img
                        src={dishImg}
                        alt={dish.name}
                        className={`h-full w-full object-cover transition-transform duration-300 ${
                          isAvailable ? "group-hover:scale-105" : "grayscale"
                        }`}
                        loading="lazy"
                      />
                      {flyer.halal ? (
                        <span className="absolute bottom-1 left-1 rounded bg-black/70 backdrop-blur-sm border border-emerald-500/40 text-emerald-300 text-[8.5px] font-semibold px-1 py-0.2">
                          Halal
                        </span>
                      ) : (
                        <span className="absolute bottom-1 left-1 rounded bg-black/70 backdrop-blur-sm border border-amber-500/40 text-amber-300 text-[8.5px] font-semibold px-1 py-0.2">
                          {flyer.badge}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                            {flyer.flyerName}
                          </span>
                          <span className="text-xs font-mono font-bold text-amber-300">
                            {formatMoney(dish.price)}
                          </span>
                        </div>

                        <h3
                          onClick={() => isAvailable && handleOpenCustomizer(dish)}
                          className={`text-xs sm:text-sm font-semibold text-zinc-100 truncate mt-0.5 ${
                            isAvailable ? "hover:text-amber-300 cursor-pointer" : "cursor-not-allowed"
                          }`}
                        >
                          {dish.name}
                        </h3>

                        <p className="text-[10.5px] text-zinc-400 line-clamp-1 mt-0.5 font-normal">
                          {(dish as any).meatWeight || dish.description || flyer.meatDesc}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-1 mt-1.5 pt-1 border-t border-white/[0.04]">
                        <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                          <span>🥔 Free Dum Aloo</span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-normal">
                          {(dish as any).serves || (dish as any).traySize || "Serves 4–5"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Actions */}
                  <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2.5">
                    {/* Customize Trigger */}
                    {isAvailable ? (
                      <button
                        type="button"
                        onClick={() => handleOpenCustomizer(dish)}
                        className="text-[11px] font-medium text-amber-400/90 hover:text-amber-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>Customize</span>
                        <span className="text-zinc-500 text-[9px]">(Aloo & Spice)</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-semibold text-rose-400">Sold Out Today</span>
                    )}

                    {/* Quantity Stepper or Add Button */}
                    {!isAvailable ? (
                      <div className="rounded-lg bg-zinc-800/80 border border-white/5 text-zinc-500 px-3 py-1.5 text-xs font-medium ml-auto">
                        Sold Out
                      </div>
                    ) : totalCartCount === 0 ? (
                      <button
                        type="button"
                        onClick={() => handleAddProteinToCart(dish)}
                        className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold px-3.5 py-1.5 text-xs shadow-md hover:brightness-105 active:scale-95 transition-all ml-auto cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Tray</span>
                      </button>
                    ) : (
                      <div className="flex items-center rounded-xl border border-amber-500/40 bg-zinc-900 p-0.5 ml-auto shadow-sm">
                        <button
                          type="button"
                          onClick={() => handleUpdateProteinQty(dish, -1)}
                          className="h-7 w-7 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors active:scale-95 cursor-pointer"
                          title="Decrease quantity"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-amber-300 font-mono">
                          {totalCartCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateProteinQty(dish, 1)}
                          className="h-7 w-7 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors active:scale-95 cursor-pointer"
                          title="Add another tray"
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

          {/* 5. Sticky Bottom Cart Bar for Quick Order Placement */}
          {count > 0 && (
            <div className="pt-3 pb-24 sm:pb-28">
              <button
                onClick={() => {
                  setActiveTab("cart");
                  setCheckoutStep("cart");
                }}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold py-3 px-4 text-xs shadow-xl flex items-center justify-between hover:brightness-105 active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  <span>Review Order ({count} {count === 1 ? "Tray" : "Trays"})</span>
                </div>
                <div className="flex items-center gap-1 font-mono text-xs font-bold">
                  <span>{formatMoney(subtotal)}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                </div>
              </button>
            </div>
          )}
        </main>
      )}

      {/* ========================================================================= */}
      {/* TAB CONTENT: FULL MENU TAB                                                */}
      {/* ========================================================================= */}
      {activeTab === "menu" && (
        <main className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 pt-3.5 space-y-3.5 pb-24 sm:pb-28">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-zinc-100">Full Handi Menu</h2>
              <p className="text-[11px] text-zinc-400 font-normal">Fresh slow-braised dum biryani trays</p>
            </div>
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-mono font-medium text-amber-300">
              {displayMenu.length} Specialties
            </span>
          </div>

          <div className="space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-3.5">
            {displayMenu.map((dish) => {
              const dishObj = dish as any;
              const dishImg = dishObj.image || DISH_IMAGES[dish.id] || chickenImg;
              const isAvailable = dishObj.available !== false;

              return (
                <div
                  key={dish.id}
                  className={`rounded-2xl bg-[#121216] border p-3 space-y-2.5 shadow-sm transition-all ${
                    !isAvailable ? "opacity-60 border-white/[0.05]" : "border-white/[0.08]"
                  }`}
                >
                  <div className="flex gap-3">
                    <img
                      src={dishImg}
                      alt={dish.name}
                      className={`h-16 w-16 rounded-xl object-cover shrink-0 border border-white/[0.05] ${
                        !isAvailable ? "grayscale" : ""
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
                          {(dish as any).serves || (dish as any).traySize || "Serves 4–5"} · {dish.kcal} kcal
                        </p>
                        {!isAvailable && (
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
                    {!isAvailable ? (
                      <span className="text-xs text-zinc-500 font-medium px-2.5 py-1">Unavailable</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenCustomizer(dishObj)}
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
        <main className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 pt-3.5 space-y-3.5 pb-24 sm:pb-28">
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
                    }}
                    className="rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-medium text-xs px-4 py-2 hover:bg-amber-500/30 transition-all cursor-pointer"
                  >
                    Select Protein Trays →
                  </button>
                </div>
              ) : (
                <>
                  {/* Cart Items List */}
                  {/* Cart Items List */}
                  <div className="space-y-2.5">
                    {lines.map((line) => {
                      const dishImg = DISH_IMAGES[line.proteinId] || chickenImg;

                      return (
                        <div
                          key={line.key}
                          className="rounded-2xl bg-[#121216] border border-white/[0.08] p-3 shadow-sm hover:border-white/[0.12] transition-all"
                        >
                          <div className="flex items-start gap-3">
                            {/* Dish Thumbnail */}
                            <img
                              src={dishImg}
                              alt={line.name}
                              className="h-16 w-16 rounded-xl object-cover shrink-0 border border-white/[0.08]"
                            />

                            {/* Dish Info & Options */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-start justify-between gap-1">
                                <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 truncate">
                                  {line.name}
                                </h4>
                                <button
                                  type="button"
                                  onClick={() => {
                                    removeLine(line.key);
                                    toast.info(`Removed ${line.name} from cart`);
                                  }}
                                  className="text-zinc-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                                  title="Remove item"
                                  aria-label="Remove item"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Minimal Interactive Option Chips */}
                              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => updateLine(line.key, { aloo: !line.aloo })}
                                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                                    line.aloo
                                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                                      : "bg-zinc-800/80 border border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                                  }`}
                                  title="Tap to toggle Dum Aloo"
                                >
                                  <span>🥔 {line.aloo ? "Dum Aloo (Free)" : "No Aloo"}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => updateLine(line.key, { extraSpicy: !line.extraSpicy })}
                                  className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium transition-colors cursor-pointer ${
                                    line.extraSpicy
                                      ? "bg-rose-500/15 border border-rose-500/30 text-rose-300"
                                      : "bg-zinc-800/80 border border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                                  }`}
                                  title="Tap to toggle spice level"
                                >
                                  <span>{line.extraSpicy ? "🌶️ Extra Spicy" : "🌿 Mild"}</span>
                                </button>
                              </div>

                              {/* Price + Compact Stepper */}
                              <div className="flex items-center justify-between pt-1">
                                <span className="text-xs font-mono font-bold text-amber-300">
                                  {formatMoney(line.unitPrice * line.qty)}
                                </span>

                                <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900/90 p-0.5">
                                  <button
                                    type="button"
                                    onClick={() => setQty(line.key, line.qty - 1)}
                                    className="h-5 w-5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                                  >
                                    <Minus className="h-2.5 w-2.5" />
                                  </button>
                                  <span className="w-5 text-center text-xs font-medium text-zinc-100 font-mono">
                                    {line.qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setQty(line.key, line.qty + 1)}
                                    className="h-5 w-5 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-zinc-800 rounded transition-colors cursor-pointer"
                                  >
                                    <Plus className="h-2.5 w-2.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Modern Fulfilment Segmented Pill */}
                  <div className="flex rounded-xl bg-zinc-900/90 p-1 border border-white/[0.08]">
                    <button
                      type="button"
                      onClick={() => {
                        setFulfilmentMode("pickup");
                        if (validationErrors.address) {
                          setValidationErrors((prev) => ({ ...prev, address: false }));
                        }
                      }}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        fulfilmentMode === "pickup"
                          ? "bg-amber-500 text-zinc-950 font-semibold shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Store className="h-3.5 w-3.5" />
                      <span>Pickup (Free)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFulfilmentMode("delivery")}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        fulfilmentMode === "delivery"
                          ? "bg-amber-500 text-zinc-950 font-semibold shadow-sm"
                          : "text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Delivery (+${DELIVERY_FEE})</span>
                    </button>
                  </div>

                  {/* Contact & Scheduling Details */}
                  <div className="rounded-2xl bg-[#121216] border border-white/[0.08] p-3.5 space-y-3 shadow-sm">
                    {/* Location banner */}
                    {fulfilmentMode === "pickup" ? (
                      <div className="flex items-center gap-2 text-xs text-zinc-300 pb-1 border-b border-white/[0.05]">
                        <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">Pickup: <strong className="text-zinc-100 font-medium">3625 S Bedford Ave</strong>, Springfield</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-xs text-zinc-300 pb-1 border-b border-white/[0.05]">
                        <span className="flex items-center gap-1.5">
                          <Truck className="h-3.5 w-3.5 text-amber-400" />
                          <span>Delivery to Springfield Metro</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleUseCurrentLocation}
                          disabled={isLocating}
                          className="text-[10px] text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          {isLocating ? <RotateCw className="h-2.5 w-2.5 animate-spin" /> : <Navigation className="h-2.5 w-2.5" />}
                          <span>Use GPS</span>
                        </button>
                      </div>
                    )}

                    {/* Customer Info Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[10.5px] font-medium text-zinc-400 mb-1">
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => {
                              const sanitized = sanitizeName(e.target.value);
                              setCustomerName(sanitized);
                              if (validationErrors.name) setValidationErrors((prev) => ({ ...prev, name: false }));
                            }}
                            placeholder="Your Name"
                            className={`w-full rounded-xl bg-zinc-900/80 border ${
                              validationErrors.name ? "border-rose-500/80" : "border-white/10 focus:border-amber-400"
                            } pl-8 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none`}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10.5px] font-medium text-zinc-400 mb-1">
                          Phone Number (US) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-[11px] font-mono pointer-events-none">
                            +1
                          </span>
                          <input
                            type="tel"
                            inputMode="numeric"
                            value={customerPhone}
                            onChange={(e) => {
                              const formatted = formatUsPhone(e.target.value);
                              setCustomerPhone(formatted);
                              if (validationErrors.phone) setValidationErrors((prev) => ({ ...prev, phone: false }));
                            }}
                            placeholder="(417) 897-9754"
                            maxLength={14}
                            className={`w-full rounded-xl bg-zinc-900/80 border ${
                              validationErrors.phone ? "border-rose-500/80" : "border-white/10 focus:border-amber-400"
                            } pl-8 pr-3 py-2 text-xs text-zinc-100 font-mono placeholder:text-zinc-500 focus:outline-none`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delivery Address (When Delivery selected) */}
                    {fulfilmentMode === "delivery" && (
                      <div className="space-y-2 pt-1 border-t border-white/[0.05]">
                        <div>
                          <label className="block text-[10.5px] font-medium text-zinc-400 mb-1">
                            Street Address *
                          </label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
                            <input
                              type="text"
                              value={deliveryAddress}
                              onChange={(e) => {
                                setDeliveryAddress(e.target.value);
                                if (validationErrors.address) setValidationErrors((prev) => ({ ...prev, address: false }));
                              }}
                              placeholder="House/Street, Springfield, MO"
                              className={`w-full rounded-xl bg-zinc-900/80 border ${
                                validationErrors.address ? "border-rose-500/80" : "border-white/10 focus:border-amber-400"
                              } pl-8 pr-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none`}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={deliveryApt}
                            onChange={(e) => setDeliveryApt(e.target.value)}
                            placeholder="Apt / Suite #"
                            className="w-full rounded-xl bg-zinc-900/60 border border-white/10 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                          />
                          <input
                            type="text"
                            value={deliveryLandmark}
                            onChange={(e) => setDeliveryLandmark(e.target.value)}
                            placeholder="Delivery notes"
                            className="w-full rounded-xl bg-zinc-900/60 border border-white/10 px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    )}

                    {/* Date & Time Selection */}
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

                    <div className="border-t border-white/[0.08] pt-2.5 flex justify-between items-center text-sm font-medium text-zinc-100">
                      <span>Total Amount</span>
                      <span className="text-base font-mono font-semibold text-amber-400">{formatMoney(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Proceed to Payment Button */}
                  <div className="pt-2 pb-24 sm:pb-28">
                    <button
                      onClick={handleProceedToPayment}
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold py-3.5 text-xs sm:text-sm shadow-md hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Proceed to Payment Options ({formatMoney(grandTotal)})</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
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

              <div className="pt-2 pb-16 sm:pb-20">
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
                <h2 className="text-xl font-bold text-white mt-0.5 tracking-wide">
                  Order #{createdOrder.orderNumber}
                </h2>
                {createdOrder.orderNumber.match(/-(\d+)$/) && (
                  <div className="inline-flex items-center gap-1.5 mt-1 rounded-full bg-amber-500/20 border border-amber-400/40 px-3 py-0.5 text-[11px] font-bold text-amber-300">
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>Today's Handi Order #{parseInt(createdOrder.orderNumber.match(/-(\d+)$/)![1], 10)}</span>
                  </div>
                )}
                <p className="text-xs text-zinc-300 mt-1.5 font-normal">
                  Thank you, <strong className="text-white font-semibold">{createdOrder.customer.name}</strong>! Your handcrafted dum biryani order is confirmed.
                </p>
              </div>

              {/* PROMINENT TAKE SCREENSHOT CALLOUT CARD */}
              <div className="rounded-2xl bg-gradient-to-b from-amber-500/25 via-amber-600/15 to-amber-950/40 border-2 border-amber-400/80 p-4 text-center space-y-2.5 shadow-[0_0_30px_rgba(245,158,11,0.25)]">
                <div className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-400 text-black px-3.5 py-1 text-xs font-black uppercase tracking-wider shadow">
                  <Camera className="h-4 w-4 stroke-[2.5]" />
                  <span>PLEASE TAKE A SCREENSHOT</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-200">
                    📸 దయచేసి ఈ స్క్రీన్‌షాట్ తీసుకోండి!
                  </p>
                  <p className="text-xs text-zinc-200 leading-relaxed font-medium">
                    Take a screenshot of this receipt now to show at kitchen pickup or to your delivery driver.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        window.print();
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 px-3 py-2 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Printer className="h-3.5 w-3.5 text-amber-400" />
                    <span>Save / Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator?.clipboard) {
                        navigator.clipboard.writeText(createdOrder.orderNumber);
                        toast.success("Order ID copied to clipboard!");
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 px-3 py-2 text-xs font-semibold text-white transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <Copy className="h-3.5 w-3.5 text-amber-400" />
                    <span>Copy Order ID</span>
                  </button>
                </div>
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
                {createdOrder.paymentStatus === "Paid Online" && (
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
        <main className="w-full max-w-md sm:max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4 sm:px-6 pt-3.5 space-y-3.5 pb-24 sm:pb-28">
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
      {checkoutStep !== "payment" && checkoutStep !== "success" && (
        <nav className="fixed bottom-3 inset-x-0 z-50 px-4 flex justify-center pointer-events-none">
          <div className="w-full max-w-md sm:max-w-lg pointer-events-auto rounded-full bg-[#121216]/95 border border-amber-500/25 px-3 py-1.5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.7)] flex items-center justify-between">
            {/* 1. Home / Biryani */}
            <button
              onClick={() => {
                setActiveTab("home");
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
      )}

      {/* ========================================================================= */}
      {/* 3. DISH CUSTOMIZATION MODAL                                               */}
      {/* ========================================================================= */}
      <Dialog
        open={Boolean(selectedDishModal)}
        onOpenChange={(open) => !open && setSelectedDishModal(null)}
      >
        <DialogContent className="max-w-sm sm:max-w-md md:max-w-lg rounded-2xl bg-[#121216] border border-white/10 text-zinc-100 p-4 sm:p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
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
                      Handi Party Tray · {(selectedDishModal as any).serves || (selectedDishModal as any).traySize || "Serves 4–5"}
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
        <DialogContent className="max-w-sm sm:max-w-md rounded-2xl bg-[#121216] border border-white/10 text-zinc-100 p-4 sm:p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
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
