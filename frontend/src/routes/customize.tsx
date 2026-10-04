import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Sparkles,
  Shield,
  UtensilsCrossed,
  Flame,
  Plus,
  Check,
  Calendar,
  Store,
  Truck,
  MessageSquare,
  ShoppingBag,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import {
  formatDate,
  nextAvailableDate,
  formatMoney,
  ALOO_CHARGE,
  DELIVERY_FEE,
  PICKUP_TIMES,
  DELIVERY_TIMES,
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
  { id: "chicken", name: "Royal Chicken Dum", price: 101.99, halal: true, image: chickenImg, tag: "Classic Signature" },
  { id: "mutton", name: "Hyderabadi Shahi Mutton", price: 157.99, halal: true, image: muttonImg, tag: "Royal Feast" },
  { id: "beef", name: "Slow-Braised Spiced Beef", price: 122.99, halal: true, image: rawBeefImg, tag: "Hearty & Bold" },
  { id: "pork", name: "Springfield Signature Pork", price: 108.99, halal: false, image: rawPorkImg, tag: "Specialty" },
  { id: "paneer", name: "Royal Shahi Paneer (Veg)", price: 98.99, halal: true, image: paneerImg, tag: "Vegetarian" },
  { id: "prawn", name: "Jumbo King Tiger Prawns", price: 139.99, halal: true, image: prawnImg, tag: "Seafood Prime" },
];

export function CustomizeOrderPage() {
  const { addLine } = useCart();
  const navigate = useNavigate();
  const nextDate = formatDate(nextAvailableDate());

  const [selectedProteinId, setSelectedProteinId] = useState<ProteinId>("chicken");
  const selectedProtein = useMemo(
    () => PROTEIN_OPTIONS.find((p) => p.id === selectedProteinId) || PROTEIN_OPTIONS[0],
    [selectedProteinId],
  );

  const [trayCount, setTrayCount] = useState(1);
  const [addPotato, setAddPotato] = useState(false);
  const [spiceProfile, setSpiceProfile] = useState<"mild" | "medium" | "extra">("medium");
  const [cookingInstructions, setCookingInstructions] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");

  const [selectedAddons, setSelectedAddons] = useState<Record<string, boolean>>({
    cashews: false,
    salan: false,
    raita: false,
    eggs: false,
    dessert: false,
    rice: false,
  });

  const [fulfilmentType, setFulfilmentType] = useState<"pickup" | "delivery">("pickup");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(PICKUP_TIMES[0] || "12:00 PM");

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
    const tax = subtotal * 0.086;
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
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-200 selection:bg-amber-500/20 selection:text-amber-300 relative overflow-hidden pb-24">
      {/* 1. HEADER HERO BANNER */}
      <section className="relative border-b border-white/[0.08] bg-[#121216] py-12 px-4 sm:px-8 text-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Layer-by-Layer Handi Customizer</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100">
            Customize Your <span className="text-amber-400">Handi Order</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
            Specify your desired proteins, baby potatoes, spice levels, culinary instructions, and extra accompaniments.
            Every tray is freshly sealed with dough and slow-cooked for your batch booking.
          </p>

          <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#18181f] px-3.5 py-1.5 text-xs text-zinc-300">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>Next Available Batch: <strong className="text-amber-300 font-medium">{nextDate}</strong> (Order by 2:00 PM)</span>
          </div>
        </div>
      </section>

      {/* 2. MAIN 2-COLUMN LAYOUT */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* LEFT: CUSTOMIZATION FORM CONTROLS */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* STEP 1: CHOOSE BASE PROTEIN */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-white/[0.08] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Step 1</span>
                  <h2 className="font-display text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <UtensilsCrossed className="h-4 w-4 text-amber-400" />
                    <span>Select Signature Biryani Protein</span>
                  </h2>
                </div>
                <span className="text-xs text-zinc-400 font-normal">1.6 – 1.8 kg Meat</span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {PROTEIN_OPTIONS.map((protein) => {
                  const isSelected = selectedProteinId === protein.id;
                  return (
                    <div
                      key={protein.id}
                      onClick={() => setSelectedProteinId(protein.id)}
                      className={`relative rounded-xl p-3 cursor-pointer border transition-all duration-200 flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#18181f] border-2 border-amber-500/70 shadow-md ring-1 ring-amber-500/30"
                          : "bg-[#18181f] border-white/[0.06] hover:border-white/20 hover:bg-[#202028]"
                      }`}
                    >
                      <div className="relative h-24 w-full rounded-lg overflow-hidden border border-white/10 mb-2">
                        <img
                          src={protein.image}
                          alt={protein.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-1.5 left-1.5">
                          {protein.halal ? (
                            <span className="rounded bg-emerald-950/90 border border-emerald-500/50 px-1.5 py-0.2 text-[0.6rem] font-medium text-emerald-400">
                              Halal
                            </span>
                          ) : (
                            <span className="rounded bg-amber-950/90 border border-amber-500/50 px-1.5 py-0.2 text-[0.6rem] font-medium text-amber-300">
                              Specialty
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className={`text-xs font-semibold ${isSelected ? "text-amber-300" : "text-zinc-100"}`}>
                          {protein.name}
                        </h4>
                        <p className="text-[0.65rem] text-zinc-500">{protein.tag}</p>
                      </div>

                      <div className="pt-2 mt-2 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-xs font-semibold text-amber-400">
                          {formatMoney(protein.price)}
                        </span>
                        {isSelected && (
                          <div className="h-4 w-4 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* STEP 2: POTATO & SPICE LEVEL */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-white/[0.08] pb-3">
                <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Step 2</span>
                <h2 className="font-display text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-400" />
                  <span>Spice Level & Optional Baby Aloo</span>
                </h2>
              </div>

              <div className="rounded-xl border border-white/[0.06] bg-[#18181f] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="aloo-switch" className="text-xs font-medium text-zinc-200 cursor-pointer">
                      🥔 Add Royal Dum Aloo (Slow-Steamed Baby Potatoes)
                    </Label>
                    <span className="rounded bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.5 text-[0.65rem] font-medium text-emerald-400">
                      100% Free ($0.00)
                    </span>
                  </div>
                  <p className="text-[0.7rem] text-zinc-400 leading-relaxed font-normal">
                    Tender whole baby potatoes marinated with saffron, ghee, and roasted whole spices, steamed along with the rice on gentle dum.
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2.5">
                  <span className="text-xs text-zinc-400">{addPotato ? "Included" : "No Aloo"}</span>
                  <Switch id="aloo-switch" checked={addPotato} onCheckedChange={setAddPotato} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-300">
                  Select Dum Spice Intensity:
                </Label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    {
                      id: "mild",
                      flames: "🌶️",
                      label: "Royal Mild",
                      desc: "Subtle Kashmiri saffron & cardamom aromatics.",
                    },
                    {
                      id: "medium",
                      flames: "🌶️🌶️",
                      label: "Traditional Medium",
                      desc: "Chef's signature balanced Hyderabadi spice blend.",
                    },
                    {
                      id: "extra",
                      flames: "🌶️🌶️🌶️",
                      label: "Extra Spicy 🔥",
                      desc: "Infused with roasted green chilies & pepper.",
                    },
                  ].map((s) => {
                    const isSelected = spiceProfile === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => setSpiceProfile(s.id as any)}
                        className={`rounded-xl p-3 cursor-pointer border transition-all text-left space-y-1 ${
                          isSelected
                            ? "bg-amber-500/15 border-amber-500/50 text-amber-300"
                            : "bg-[#18181f] border-white/[0.06] hover:bg-[#202028] text-zinc-400"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{s.flames}</span>
                          {isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                          )}
                        </div>
                        <h4 className={`text-xs font-semibold ${isSelected ? "text-amber-300" : "text-zinc-200"}`}>{s.label}</h4>
                        <p className="text-[0.65rem] text-zinc-500 leading-relaxed font-normal">{s.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* STEP 3: GOURMET ADD-ON OPTIONS */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-white/[0.08] pb-3 flex items-center justify-between">
                <div>
                  <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Step 3</span>
                  <h2 className="font-display text-lg font-semibold text-zinc-100 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span>Select Gourmet Add-Ons & Extras</span>
                  </h2>
                </div>
                <span className="text-xs text-zinc-500 font-normal">Optional</span>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {ADDON_OPTIONS.map((addon) => {
                  const isChecked = selectedAddons[addon.id];
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`rounded-xl p-3 cursor-pointer border transition-all flex items-start justify-between gap-2.5 ${
                        isChecked
                          ? "bg-amber-500/10 border-amber-500/50 text-zinc-100"
                          : "bg-[#18181f] border-white/[0.06] hover:bg-[#202028] text-zinc-300"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-medium text-zinc-200">{addon.name}</h4>
                        <p className="text-[0.65rem] text-zinc-500 font-normal">{addon.description}</p>
                        <p className="text-xs font-medium text-amber-400 pt-0.5">+{formatMoney(addon.price)}</p>
                      </div>

                      <div
                        className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                          isChecked ? "bg-amber-400 border-amber-400 text-zinc-950" : "border-zinc-600 bg-zinc-800"
                        }`}
                      >
                        {isChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* STEP 4: SPECIAL COOKING INSTRUCTIONS */}
            <section className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="border-b border-white/[0.08] pb-3">
                <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Step 4</span>
                <h2 className="font-display text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <span>Kitchen Cooking & Fulfilment Instructions</span>
                </h2>
              </div>

              <div className="space-y-4 text-xs font-normal">
                <div className="space-y-1.5">
                  <Label htmlFor="cooking-notes" className="text-xs font-medium text-zinc-300">
                    Special Cooking & Flavor Instructions:
                  </Label>
                  <Textarea
                    id="cooking-notes"
                    value={cookingInstructions}
                    onChange={(e) => setCookingInstructions(e.target.value)}
                    placeholder="e.g. Less oil on top, pack mint raita separately, extra crispy fried onions on the side, nut allergy notification..."
                    rows={2}
                    className="bg-[#18181f] border-white/[0.08] text-zinc-200 placeholder:text-zinc-500 text-xs rounded-xl focus:border-amber-500/50"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <Label className="text-xs font-medium text-zinc-300">
                    Fulfilment Method & Time Slot:
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFulfilmentType("pickup");
                        setSelectedTimeSlot(PICKUP_TIMES[0] || "12:00 PM");
                      }}
                      className={`rounded-xl p-2.5 text-left border transition-all ${
                        fulfilmentType === "pickup"
                          ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold"
                          : "bg-[#18181f] border-white/[0.06] text-zinc-400"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Store className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Pickup (Free)</span>
                      </div>
                      <p className="text-[0.62rem] text-zinc-500 mt-0.5">3625 S Bedford Ave</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFulfilmentType("delivery");
                        setSelectedTimeSlot(DELIVERY_TIMES[0] || "2:00 PM");
                      }}
                      className={`rounded-xl p-2.5 text-left border transition-all ${
                        fulfilmentType === "delivery"
                          ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold"
                          : "bg-[#18181f] border-white/[0.06] text-zinc-400"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Truck className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Delivery (${DELIVERY_FEE})</span>
                      </div>
                      <p className="text-[0.62rem] text-zinc-500 mt-0.5">10 miles of 65809</p>
                    </button>
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    <Label className="text-xs text-zinc-400 shrink-0">Time Window:</Label>
                    <select
                      value={selectedTimeSlot}
                      onChange={(e) => setSelectedTimeSlot(e.target.value)}
                      className="rounded-xl bg-[#18181f] border border-white/[0.08] text-amber-300 px-2.5 py-1 text-xs focus:border-amber-500/50 outline-none cursor-pointer flex-1"
                    >
                      {(fulfilmentType === "pickup" ? PICKUP_TIMES : DELIVERY_TIMES).map((t) => (
                        <option key={t} value={t} className="bg-[#121216] text-zinc-200">
                          {t} ({nextDate})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="delivery-notes" className="text-xs font-medium text-zinc-300">
                    Delivery Notes / Gate Code / Drop-off Instructions:
                  </Label>
                  <Textarea
                    id="delivery-notes"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="e.g. Leave with building concierge, ring doorbell #2B, call on arrival..."
                    rows={2}
                    className="bg-[#18181f] border-white/[0.08] text-zinc-200 placeholder:text-zinc-500 text-xs rounded-xl focus:border-amber-500/50"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: STICKY LIVE PRICE SUMMARY */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 space-y-4">
            <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <span className="text-[0.62rem] font-medium text-amber-400 uppercase tracking-wider">Live Summary</span>
                  <h3 className="font-display text-lg font-semibold text-zinc-100">Configuration</h3>
                </div>
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>

              <div className="rounded-xl bg-[#18181f] border border-white/[0.06] p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-zinc-100">{selectedProtein.name}</h4>
                  <span className="font-semibold text-amber-400">
                    {formatMoney(selectedProtein.price)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[0.68rem] text-zinc-500">
                  <span>Feeds {trayCount * 4}–{trayCount * 5} adults</span>
                  <span>•</span>
                  <span>{(1.7 * trayCount).toFixed(1)} kg Protein</span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#18181f] border border-white/[0.06] p-2.5 text-xs">
                <span className="text-zinc-300 font-medium">Tray Quantity:</span>
                <div className="flex items-center rounded-lg border border-white/[0.08] bg-[#121216] text-zinc-200">
                  <button
                    type="button"
                    onClick={() => setTrayCount((q) => Math.max(1, q - 1))}
                    className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-100 rounded-l-lg transition-colors"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-xs font-medium text-zinc-100">{trayCount}</span>
                  <button
                    type="button"
                    onClick={() => setTrayCount((q) => q + 1)}
                    className="px-2.5 py-1 text-xs text-zinc-400 hover:text-zinc-100 rounded-r-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Itemized Calculations */}
              <div className="space-y-1.5 pt-2 border-t border-white/[0.08] text-xs font-normal">
                <div className="flex justify-between text-zinc-400">
                  <span>{trayCount} × {selectedProtein.name}:</span>
                  <span className="text-zinc-200">{formatMoney(selectedProtein.price * trayCount)}</span>
                </div>

                {addPotato && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Royal Dum Aloo ({trayCount} Trays):</span>
                    <span>Free ($0.00)</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-400">
                  <span>Spice Level:</span>
                  <span className="capitalize text-zinc-200">{spiceProfile}</span>
                </div>

                {calculations.addonsSum > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>Gourmet Add-ons:</span>
                    <span>+{formatMoney(calculations.addonsSum)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-500">
                  <span>Food Tax (8.6%):</span>
                  <span>{formatMoney(calculations.tax)}</span>
                </div>

                <div className="flex justify-between text-zinc-500">
                  <span>Fulfilment ({fulfilmentType === "pickup" ? "Pickup" : "Delivery"}):</span>
                  <span>{calculations.deliveryCost === 0 ? "Free" : formatMoney(calculations.deliveryCost)}</span>
                </div>

                <div className="pt-2 border-t border-white/[0.08] flex justify-between items-baseline">
                  <span className="font-medium text-zinc-100">Estimated Total:</span>
                  <span className="font-display text-xl font-semibold text-amber-400">
                    {formatMoney(calculations.grandTotal)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <Button
                  onClick={() => handleAddToCartAndCheckout("checkout")}
                  size="lg"
                  className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs py-4 shadow-md transition-colors gap-1.5"
                >
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                  <span>Proceed to Checkout ({formatMoney(calculations.grandTotal)}) →</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => handleAddToCartAndCheckout("cart")}
                  className="w-full rounded-xl border-white/10 text-zinc-300 hover:bg-white/[0.06] text-xs font-normal py-2.5"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add Customized Tray to Cart
                </Button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 p-2.5 text-xs font-medium text-emerald-400 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Order on WhatsApp Direct</span>
                </a>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-[#18181f] border border-white/[0.04] p-2 text-[0.65rem] text-zinc-400 font-normal">
                <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>100% Zabiha Halal Guarantee • Fresh Daily Dum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
