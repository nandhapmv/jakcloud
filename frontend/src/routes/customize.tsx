import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Sparkles,
  Shield,
  UtensilsCrossed,
  Flame,
  Star,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Store,
  Truck,
  Heart,
  Users,
  Scale,
  Award,
  ArrowRight,
  Phone,
  MessageSquare,
  ShoppingBag,
  Clock,
  MapPin,
  CheckCircle2,
  FileText,
  Egg,
} from "lucide-react";
import { toast } from "sonner";

import heroImg from "@/assets/hero-biryani.jpg";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useCart, unitPriceFor } from "@/lib/cart";
import {
  BUSINESS,
  formatDate,
  nextAvailableDate,
  formatMoney,
  ALOO_CHARGE,
  DELIVERY_FEE,
  PICKUP_TIMES,
  DELIVERY_TIMES,
  MENU,
  type ProteinId,
} from "@/lib/menu";

export const Route = createFileRoute("/customize")({
  head: () => ({
    meta: [
      { title: "Customize Your Order — JAKLOUD Spice King Dum Biryani" },
      {
        name: "description",
        content:
          "Customize your handcrafted Dum Biryani Handi tray. Select proteins, baby aloo, spice levels, gourmet add-ons, and delivery notes.",
      },
      { property: "og:title", content: "Customize Handi Order — JAKLOUD Dum Biryani" },
      {
        property: "og:description",
        content: "Build your perfect royal Dum Biryani feast made to order in Springfield, MO.",
      },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: CustomizeOrderPage,
});

interface AddonOption {
  id: string;
  name: string;
  price: number;
  description: string;
  category: "garnish" | "sides" | "dessert";
}

const ADDON_OPTIONS: AddonOption[] = [
  {
    id: "cashews",
    name: "Pure Desi Ghee Roasted Whole Cashews Pack",
    price: 5.99,
    description: "Extra toasted golden cashews for rich crunch",
    category: "garnish",
  },
  {
    id: "salan",
    name: "Extra 16 oz Royal Mirchi Ka Salan Curry",
    price: 4.99,
    description: "Peanut-sesame-chili traditional gravy",
    category: "sides",
  },
  {
    id: "raita",
    name: "Extra 16 oz Fresh Mint & Cucumber Raita",
    price: 3.99,
    description: "Cooling spiced yogurt with roasted cumin",
    category: "sides",
  },
  {
    id: "eggs",
    name: "Extra Boiled Farm Eggs (2 Pack)",
    price: 2.99,
    description: "Ghee-tossed hard boiled eggs",
    category: "garnish",
  },
  {
    id: "dessert",
    name: "Chef's Royal Gulab Jamun Dessert Box (6 pcs)",
    price: 6.99,
    description: "Soft saffron milk dumplings in rose syrup",
    category: "dessert",
  },
  {
    id: "rice",
    name: "Extra Saffron Aged Basmati Rice Portion (500g)",
    price: 8.99,
    description: "Steamed with pure ghee and whole spices",
    category: "sides",
  },
];

const PROTEIN_OPTIONS: { id: ProteinId; name: string; price: number; halal: boolean; image: string; tag: string }[] = [
  { id: "chicken", name: "Royal Chicken Dum", price: 101.99, halal: true, image: chickenImg, tag: "Chef's Classic" },
  { id: "mutton", name: "Hyderabadi Shahi Mutton", price: 157.99, halal: true, image: muttonImg, tag: "Royal Feast" },
  { id: "beef", name: "Slow-Braised Spiced Beef", price: 122.99, halal: true, image: rawBeefImg, tag: "Hearty & Bold" },
  { id: "pork", name: "Springfield Signature Pork", price: 108.99, halal: false, image: rawPorkImg, tag: "Ozarks Special" },
  { id: "paneer", name: "Royal Shahi Paneer (Veg)", price: 98.99, halal: true, image: paneerImg, tag: "Vegetarian" },
  { id: "prawn", name: "Jumbo King Tiger Prawns", price: 139.99, halal: true, image: prawnImg, tag: "Seafood Prime" },
];

export function CustomizeOrderPage() {
  const { addLine, count } = useCart();
  const navigate = useNavigate();
  const nextDate = formatDate(nextAvailableDate());

  // 1. Protein Choice
  const [selectedProteinId, setSelectedProteinId] = useState<ProteinId>("chicken");
  const selectedProtein = useMemo(
    () => PROTEIN_OPTIONS.find((p) => p.id === selectedProteinId) || PROTEIN_OPTIONS[0],
    [selectedProteinId],
  );

  // 2. Customizers
  const [trayCount, setTrayCount] = useState(1);
  const [addPotato, setAddPotato] = useState(false);
  const [spiceProfile, setSpiceProfile] = useState<"mild" | "medium" | "extra">("medium");
  const [cookingInstructions, setCookingInstructions] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  // 3. Add-on Selection
  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({
    cashews: false,
    salan: false,
    raita: false,
    eggs: false,
    dessert: false,
    rice: false,
  });

  // 4. Fulfilment Selection
  const [fulfilmentType, setFulfilmentType] = useState<"pickup" | "delivery">("pickup");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(PICKUP_TIMES[0] || "12:00 PM");

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Calculations
  const calculations = useMemo(() => {
    const baseUnitPrice = selectedProtein.price;
    const alooCost = addPotato ? ALOO_CHARGE : 0;
    const singleTraySubtotal = baseUnitPrice + alooCost;
    const trayTotal = singleTraySubtotal * trayCount;

    let addonsSum = 0;
    ADDON_OPTIONS.forEach((addon) => {
      if (selectedAddons[addon.id]) {
        addonsSum += addon.price;
      }
    });

    const subtotal = trayTotal + addonsSum;
    const tax = subtotal * 0.086; // 8.6% Springfield tax
    const deliveryCost = fulfilmentType === "delivery" ? (trayCount >= 5 ? 0 : DELIVERY_FEE) : 0;
    const grandTotal = subtotal + tax + deliveryCost;

    return {
      baseUnitPrice,
      alooCost,
      singleTraySubtotal,
      trayTotal,
      addonsSum,
      subtotal,
      tax,
      deliveryCost,
      grandTotal,
    };
  }, [selectedProtein, addPotato, trayCount, selectedAddons, fulfilmentType]);

  const handleAddToCartAndCheckout = (destination: "cart" | "checkout") => {
    const activeAddonNames = ADDON_OPTIONS.filter((a) => selectedAddons[a.id]).map((a) => a.name);

    const noteSegments = [
      `Spice: ${spiceProfile.toUpperCase()}`,
      activeAddonNames.length > 0 ? `Addons: ${activeAddonNames.join(", ")}` : "",
      cookingInstructions ? `Kitchen: ${cookingInstructions}` : "",
      deliveryNotes ? `Delivery: ${deliveryNotes}` : "",
      `Slot: ${selectedTimeSlot} (${fulfilmentType.toUpperCase()})`,
    ].filter(Boolean);

    addLine({
      proteinId: selectedProtein.id,
      name: `${selectedProtein.name} (Custom Handi)`,
      aloo: addPotato,
      extraSpicy: spiceProfile === "extra",
      notes: noteSegments.join(" | "),
      qty: trayCount,
      unitPrice: calculations.subtotal / trayCount,
    });

    toast.success(`${trayCount} × ${selectedProtein.name} custom order created!`);

    if (destination === "checkout") {
      navigate({ to: "/checkout" });
    }
  };

  const whatsappUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    `Hello Master Chef Kartheek! I customized a Handi order for ${trayCount}x ${selectedProtein.name} (${spiceProfile.toUpperCase()}${addPotato ? " +Aloo" : ""}) for Springfield ${fulfilmentType.toUpperCase()} on ${nextDate}. Total: $${calculations.grandTotal.toFixed(2)}.`,
  )}`;

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold relative overflow-hidden pb-24">
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER HERO BANNER                                         */}
      {/* ------------------------------------------------------------- */}
      <section className="relative border-b border-gold/20 bg-gradient-to-r from-[#170f0a] via-[#24150d] to-[#170f0a] py-12 px-4 sm:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-black/80 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/60 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-gold shadow-[0_0_20px_rgba(212,160,23,0.3)]">
            <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
            <span>Tailor Every Layer of Your Dum Feast</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-wide text-cream">
            Customize Your <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">Handi Order</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-cream/80 leading-relaxed">
            Specify your desired proteins, baby potatoes, spice levels, culinary instructions, and extra accompaniments.
            Every tray is freshly sealed with dough and slow-cooked for your batch booking.
          </p>

          <div className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-black/60 px-3.5 py-1.5 text-xs text-cream/90 shadow-md">
            <Calendar className="h-3.5 w-3.5 text-gold" />
            <span>Next Available Batch: <strong className="text-gold">{nextDate}</strong> (Order by 2:00 PM)</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN 2-COLUMN LAYOUT: CUSTOMIZER (LEFT) + STICKY (RIGHT)  */}
      {/* ------------------------------------------------------------- */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* ========================================================= */}
          {/* LEFT: CUSTOMIZATION FORM CONTROLS (8 COLS)                */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* STEP 1: CHOOSE BASE PROTEIN */}
            <section className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
              <div className="border-b border-gold/15 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[0.68rem] uppercase tracking-widest text-gold font-bold">Step 1</span>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-cream flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-gold" />
                    <span>Select Signature Biryani Protein</span>
                  </h2>
                </div>
                <span className="text-xs text-gold font-semibold">1.6 – 1.8 kg Meat Included</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PROTEIN_OPTIONS.map((protein) => {
                  const isSelected = selectedProteinId === protein.id;
                  return (
                    <div
                      key={protein.id}
                      onClick={() => setSelectedProteinId(protein.id)}
                      className={`relative rounded-2xl p-3 cursor-pointer border transition-all duration-300 flex flex-col justify-between ${
                        isSelected
                          ? "bg-gradient-to-b from-[#22140b] to-[#140c07] border-2 border-gold shadow-[0_0_25px_rgba(212,175,55,0.4)] scale-[1.02]"
                          : "bg-black/40 border-gold/20 hover:border-gold/50 hover:bg-black/60"
                      }`}
                    >
                      <div className="relative h-28 w-full rounded-xl overflow-hidden border border-gold/20 mb-2.5">
                        <img
                          src={protein.image}
                          alt={protein.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-1.5 left-1.5">
                          {protein.halal ? (
                            <span className="rounded bg-emerald-950/90 border border-emerald-500/50 px-1.5 py-0.5 text-[0.6rem] font-bold text-emerald-400">
                              Halal
                            </span>
                          ) : (
                            <span className="rounded bg-amber-950/90 border border-amber-500/50 px-1.5 py-0.5 text-[0.6rem] font-bold text-amber-300">
                              Specialty
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className={`font-display text-sm font-bold ${isSelected ? "text-gold" : "text-cream"}`}>
                          {protein.name}
                        </h4>
                        <p className="text-[0.65rem] text-cream/60">{protein.tag}</p>
                      </div>

                      <div className="pt-2 mt-2 border-t border-gold/15 flex items-center justify-between">
                        <span className="font-display text-sm font-bold text-gold">
                          {formatMoney(protein.price)}
                        </span>
                        {isSelected && (
                          <div className="h-4 w-4 rounded-full bg-gold text-black flex items-center justify-center">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* STEP 2: POTATO (ALOO) & SPICE LEVEL */}
            <section className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="border-b border-gold/15 pb-3">
                <span className="text-[0.68rem] uppercase tracking-widest text-gold font-bold">Step 2</span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-cream flex items-center gap-2">
                  <Flame className="h-5 w-5 text-chili" />
                  <span>Spice Level & Optional Baby Aloo</span>
                </h2>
              </div>

              {/* Optional Potato (Aloo) Switch */}
              <div className="rounded-2xl border border-gold/30 bg-black/40 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="aloo-switch" className="font-display text-base font-bold text-cream cursor-pointer">
                      Add Slow-Steamed Spiced Baby Aloo (Potatoes)
                    </Label>
                    <span className="rounded-md bg-gold/20 border border-gold/40 px-2 py-0.5 text-[0.68rem] font-bold text-gold">
                      +${ALOO_CHARGE}.00 / Tray
                    </span>
                  </div>
                  <p className="text-xs text-cream/70 leading-relaxed max-w-lg">
                    Tender whole baby potatoes marinated with saffron, ghee, and roasted whole spices, steamed along with the rice on gentle dum.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <span className="text-xs font-semibold text-gold">{addPotato ? "Included" : "No Potatoes"}</span>
                  <Switch id="aloo-switch" checked={addPotato} onCheckedChange={setAddPotato} />
                </div>
              </div>

              {/* Spice Level Selector */}
              <div className="space-y-3">
                <Label className="text-xs font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-chili" /> Select Dum Spice Intensity:
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    {
                      id: "mild",
                      flames: "🌶️",
                      label: "Royal Mild",
                      desc: "Subtle Kashmiri saffron & green cardamom aromatics. Kid friendly.",
                    },
                    {
                      id: "medium",
                      flames: "🌶️🌶️",
                      label: "Traditional Nizam Medium",
                      desc: "Chef Kartheek's authentic Hyderabadi balance of crushed whole spices.",
                    },
                    {
                      id: "extra",
                      flames: "🌶️🌶️🌶️",
                      label: "Fire-Roasted Extra Spicy 🔥",
                      desc: "Infused with roasted green chilies & fiery red pepper flakes.",
                    },
                  ].map((s) => {
                    const isSelected = spiceProfile === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSpiceProfile(s.id as any)}
                        className={`rounded-2xl p-4 cursor-pointer border transition-all text-left space-y-1.5 ${
                          isSelected
                            ? "bg-gradient-to-b from-chili/30 to-chili/10 border-chili shadow-[0_0_20px_rgba(185,28,28,0.4)] text-cream"
                            : "bg-black/40 border-gold/20 hover:bg-black/60 text-cream/75"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-300">{s.flames}</span>
                          {isSelected && (
                            <span className="h-2 w-2 rounded-full bg-chili animate-ping" />
                          )}
                        </div>
                        <h4 className="font-display text-sm font-bold text-cream">{s.label}</h4>
                        <p className="text-[0.68rem] text-cream/65 leading-relaxed">{s.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* STEP 3: GOURMET ADD-ON OPTIONS */}
            <section className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-5">
              <div className="border-b border-gold/15 pb-3 flex items-center justify-between">
                <div>
                  <span className="text-[0.68rem] uppercase tracking-widest text-gold font-bold">Step 3</span>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-cream flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-gold" />
                    <span>Select Gourmet Add-Ons & Extras</span>
                  </h2>
                </div>
                <span className="text-xs text-cream/60">Optional additions</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {ADDON_OPTIONS.map((addon) => {
                  const isChecked = selectedAddons[addon.id];
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`rounded-2xl p-4 cursor-pointer border transition-all flex items-start justify-between gap-3 ${
                        isChecked
                          ? "bg-gold/15 border-gold shadow-[0_0_15px_rgba(212,175,55,0.25)] text-cream"
                          : "bg-black/40 border-gold/15 hover:bg-black/60 text-cream/80"
                      }`}
                    >
                      <div className="space-y-1">
                        <h4 className="font-display text-sm font-bold text-cream">{addon.name}</h4>
                        <p className="text-[0.68rem] text-cream/65">{addon.description}</p>
                        <p className="text-xs font-bold text-gold pt-0.5">+{formatMoney(addon.price)}</p>
                      </div>

                      <div
                        className={`h-5 w-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isChecked ? "bg-gold border-gold text-black" : "border-gold/30 bg-black/50"
                        }`}
                      >
                        {isChecked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* STEP 4: SPECIAL COOKING INSTRUCTIONS & DELIVERY NOTES */}
            <section className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="border-b border-gold/15 pb-3">
                <span className="text-[0.68rem] uppercase tracking-widest text-gold font-bold">Step 4</span>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-cream flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gold" />
                  <span>Kitchen Cooking & Delivery Instructions</span>
                </h2>
              </div>

              <div className="space-y-5">
                {/* Special Cooking Instructions */}
                <div className="space-y-2">
                  <Label htmlFor="cooking-notes" className="text-xs font-bold uppercase tracking-wider text-gold">
                    Special Cooking & Flavor Instructions:
                  </Label>
                  <Textarea
                    id="cooking-notes"
                    value={cookingInstructions}
                    onChange={(e) => setCookingInstructions(e.target.value)}
                    placeholder="e.g. Less oil on top, pack mint raita separately, extra crispy fried onions on the side, nut allergy notification..."
                    rows={3}
                    className="bg-black/60 border-gold/25 text-cream placeholder:text-cream/40 text-xs rounded-2xl focus:border-gold"
                  />
                  <p className="text-[0.68rem] text-cream/60 pl-1">
                    Master Chef Kartheek personally reviews all kitchen notes before firing each sealed handi pot.
                  </p>
                </div>

                {/* Fulfilment Switcher */}
                <div className="space-y-3 pt-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-gold">
                    Fulfilment Method & Time Slot:
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFulfilmentType("pickup");
                        setSelectedTimeSlot(PICKUP_TIMES[0] || "12:00 PM");
                      }}
                      className={`rounded-2xl p-3.5 text-left border transition-all ${
                        fulfilmentType === "pickup"
                          ? "bg-gold/20 border-gold text-gold shadow-md font-bold"
                          : "bg-black/40 border-gold/20 text-cream/70"
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
                      onClick={() => {
                        setFulfilmentType("delivery");
                        setSelectedTimeSlot(DELIVERY_TIMES[0] || "2:00 PM");
                      }}
                      className={`rounded-2xl p-3.5 text-left border transition-all ${
                        fulfilmentType === "delivery"
                          ? "bg-chili/30 border-chili text-amber-200 shadow-md font-bold"
                          : "bg-black/40 border-gold/20 text-cream/70"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        <span className="text-xs font-bold">Doorstep Delivery (${DELIVERY_FEE})</span>
                      </div>
                      <p className="text-[0.65rem] text-cream/60 mt-1">Within 10 miles of 65809 (2–6 PM)</p>
                    </button>
                  </div>

                  {/* Time Slot Select */}
                  <div className="pt-1 flex items-center gap-3">
                    <Label className="text-xs text-cream/80 shrink-0">Selected Time Window:</Label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="rounded-xl bg-black/60 border border-gold/30 text-gold px-3 py-1.5 text-xs focus:border-gold outline-none cursor-pointer flex-1"
                    >
                      {(fulfilmentType === "pickup" ? PICKUP_TIMES : DELIVERY_TIMES).map((t) => (
                        <option key={t} value={t} className="bg-[#120c08] text-cream">
                          {t} ({nextDate})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Delivery Notes Field */}
                <div className="space-y-2 pt-2">
                  <Label htmlFor="delivery-notes" className="text-xs font-bold uppercase tracking-wider text-gold">
                    Delivery Notes / Gate Code / Drop-off Instructions:
                  </Label>
                  <Textarea
                    id="delivery-notes"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Leave with building concierge, ring doorbell #2B, call on arrival..."
                    rows={2}
                    className="bg-black/60 border-gold/25 text-cream placeholder:text-cream/40 text-xs rounded-2xl focus:border-gold"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: STICKY LIVE PRICE SUMMARY & ACTIONS (4–5 COLS)     */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-5">
            <div className="rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-[#18100a] via-[#120c08] to-[#0a0705] p-6 shadow-2xl backdrop-blur-2xl space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gold">Live Price Summary</span>
                  <h3 className="font-display text-xl font-bold text-cream">Your Handi Configuration</h3>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>

              {/* Selected Protein Header Card */}
              <div className="rounded-2xl bg-black/50 border border-gold/20 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-base font-bold text-cream">{selectedProtein.name}</h4>
                  <span className="font-display text-base font-bold text-gold">
                    {formatMoney(selectedProtein.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[0.7rem] text-cream/75">
                  <span>Feeds {trayCount * 4}–{trayCount * 5} adults</span>
                  <span>•</span>
                  <span>{(1.7 * trayCount).toFixed(1)} kg Protein</span>
                </div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between rounded-2xl bg-black/40 border border-gold/20 p-3">
                <span className="text-xs font-bold text-cream">Tray Quantity:</span>
                <div className="flex items-center rounded-xl border border-gold/30 bg-black/60 text-cream">
                  <button
                    type="button"
                    onClick={() => setTrayCount((q) => Math.max(1, q - 1))}
                    className="px-3 py-1.5 text-base text-gold hover:bg-gold/20 rounded-l-xl transition-colors"
                  >
                    −
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-cream">{trayCount}</span>
                  <button
                    type="button"
                    onClick={() => setTrayCount((q) => q + 1)}
                    className="px-3 py-1.5 text-base text-gold hover:bg-gold/20 rounded-r-xl transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Itemized Calculations */}
              <div className="space-y-2 pt-2 border-t border-gold/15 text-xs">
                <div className="flex justify-between text-cream/80">
                  <span>{trayCount} × {selectedProtein.name}:</span>
                  <span>{formatMoney(selectedProtein.price * trayCount)}</span>
                </div>

                {addPotato && (
                  <div className="flex justify-between text-gold">
                    <span>Spiced Baby Aloo ({trayCount} Trays):</span>
                    <span>+{formatMoney(ALOO_CHARGE * trayCount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-cream/70">
                  <span>Spice Level:</span>
                  <span className="capitalize text-cream font-medium">{spiceProfile}</span>
                </div>

                {calculations.addonsSum > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>Gourmet Add-ons:</span>
                    <span>+{formatMoney(calculations.addonsSum)}</span>
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
                  <span className="font-display text-base font-bold text-cream">Estimated Total:</span>
                  <span className="font-display text-2xl font-bold text-gold drop-shadow-md">
                    {formatMoney(calculations.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={() => handleAddToCartAndCheckout("checkout")}
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-sm sm:text-base py-6 shadow-[0_0_25px_rgba(185,28,28,0.5)] hover:scale-[1.02] transition-all gap-2"
                >
                  <UtensilsCrossed className="h-5 w-5" />
                  <span>Proceed to Checkout ({formatMoney(calculations.grandTotal)}) →</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleAddToCartAndCheckout("cart")}
                  className="w-full rounded-2xl border-gold/40 text-gold hover:bg-gold/15 text-xs font-bold py-3"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Customized Tray to Cart
                </Button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/80 p-3 text-xs font-bold text-emerald-400 transition-all shadow-md"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Order Customized Tray on WhatsApp</span>
                </a>
              </div>

              {/* Batch Guarantee Note */}
              <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-gold/20 p-2.5 text-[0.68rem] text-gold">
                <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>100% Zabiha Halal Guarantee • Sealed Dum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
