import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Sparkles,
  Shield,
  UtensilsCrossed,
  Calendar,
  Users,
  Scale,
  Award,
  Phone,
  MessageSquare,
  ShoppingBag,
  Check,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

import heroImg from "@/assets/hero-biryani.jpg";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { useKitchenSettings } from "@/lib/store";
import { BUSINESS, formatDate, nextAvailableDate, formatMoney, ALOO_CHARGE, type ProteinId } from "@/lib/menu";

export const Route = createFileRoute("/trays")({
  head: () => ({
    meta: [
      { title: "Tray Selection & Catering — JAKloud J Paradize Dum Biryani" },
      {
        name: "description",
        content:
          "Select handcrafted Dum Biryani Handi Trays made to order in Springfield, MO. 1 Tray, 2 Trays, 3 Trays, Family Feast, and Mega Party Trays with generous portions.",
      },
      { property: "og:title", content: "Royal Tray Selection — JAKloud Dum Biryani" },
      { property: "og:description", content: "Choose your Dum Biryani handi tray size for Springfield pickup or delivery." },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: TraySelectionPage,
});

interface TrayTier {
  id: string;
  qty: number;
  badge?: string;
  title: string;
  subtitle: string;
  serves: string;
  meatWeight: string;
  riceWeight: string;
  basePrice: number;
  savings?: string;
  image: string;
  eggs: number;
  desserts: number;
  popular?: boolean;
  description: string;
}

const TRAY_TIERS: TrayTier[] = [
  {
    id: "1-tray",
    qty: 1,
    title: "1 Handi Tray",
    subtitle: "Classic Feast",
    serves: "4 – 5 Adults",
    meatWeight: "1.6 – 1.8 kg Meat",
    riceWeight: "1.0 kg Aged Basmati",
    basePrice: 101.99,
    image: chickenImg,
    eggs: 2,
    desserts: 1,
    description: "Our signature handi tray. Sealed with whole-wheat dough and slow-cooked for 4 hours.",
  },
  {
    id: "2-trays",
    qty: 2,
    badge: "Save $5",
    title: "2 Handi Trays",
    subtitle: "Twin Feast Package",
    serves: "8 – 10 Adults",
    meatWeight: "3.4 – 3.6 kg Meat",
    riceWeight: "2.0 kg Aged Basmati",
    basePrice: 198.99,
    savings: "$5.00 Off",
    image: muttonImg,
    eggs: 4,
    desserts: 2,
    description: "Ideal for family gatherings and weekend feasts. Double portions with complimentary twin dessert packs.",
  },
  {
    id: "3-trays",
    qty: 3,
    badge: "Most Popular",
    title: "3 Handi Trays",
    subtitle: "Celebration Trio",
    serves: "12 – 15 Adults",
    meatWeight: "5.0 – 5.4 kg Meat",
    riceWeight: "3.0 kg Aged Basmati",
    basePrice: 289.99,
    savings: "$16.00 Off",
    popular: true,
    image: dumHandiImg,
    eggs: 6,
    desserts: 3,
    description: "Our top choice for birthdays, team celebrations, and dinner parties across Springfield.",
  },
  {
    id: "family-tray",
    qty: 4,
    badge: "Best Value",
    title: "Family Feast (4 Trays)",
    subtitle: "Grand Banquet",
    serves: "16 – 20 Adults",
    meatWeight: "6.8 – 7.2 kg Meat",
    riceWeight: "4.0 kg Aged Basmati",
    basePrice: 379.99,
    savings: "$28.00 Off",
    image: heroImg,
    eggs: 8,
    desserts: 4,
    description: "Generous grand feast for large family reunions, holiday catering, and hospital team lunches.",
  },
  {
    id: "party-tray",
    qty: 5,
    badge: "VIP Catering",
    title: "Mega Party Feast (5 Trays)",
    subtitle: "Executive Set",
    serves: "22 – 25 Adults",
    meatWeight: "8.5 – 9.0 kg Meat",
    riceWeight: "5.0 kg Aged Basmati",
    basePrice: 469.99,
    savings: "$40.00 Off + Free Delivery",
    image: heroImg,
    eggs: 10,
    desserts: 5,
    description: "Ultimate catering bundle for large corporate events and wedding celebrations.",
  },
];

const PROTEIN_OPTIONS: { id: ProteinId; name: string; extraPrice: number; halal: boolean; img: string }[] = [
  { id: "chicken", name: "Royal Chicken Dum", extraPrice: 0, halal: true, img: chickenImg },
  { id: "mutton", name: "Hyderabadi Shahi Mutton", extraPrice: 56, halal: true, img: muttonImg },
  { id: "beef", name: "Slow-Braised Spiced Beef", extraPrice: 21, halal: true, img: rawBeefImg },
  { id: "pork", name: "Springfield Signature Pork", extraPrice: 7, halal: false, img: rawPorkImg },
];

export function TraySelectionPage() {
  const { addLine } = useCart();
  const { settings } = useKitchenSettings();
  const navigate = useNavigate();
  const nextDate = formatDate(nextAvailableDate());

  const configuredDeliveryFee = settings?.deliveryFee !== undefined ? Number(settings.deliveryFee) : 10;
  const freeThreshold = settings?.freeDeliveryTrayThreshold !== undefined ? Number(settings.freeDeliveryTrayThreshold) : 5;

  const [selectedTierId, setSelectedTierId] = useState<string>("3-trays");
  const selectedTier = useMemo(
    () => TRAY_TIERS.find((t) => t.id === selectedTierId) || TRAY_TIERS[0],
    [selectedTierId],
  );

  const [selectedProtein, setSelectedProtein] = useState<ProteinId>("chicken");
  const currentProtein = useMemo(
    () => PROTEIN_OPTIONS.find((p) => p.id === selectedProtein) || PROTEIN_OPTIONS[0],
    [selectedProtein],
  );

  const [addAloo, setAddAloo] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState<"mild" | "medium" | "extra">("medium");
  const [extraCashews, setExtraCashews] = useState(false);
  const [extraSalan, setExtraSalan] = useState(false);
  const [extraRaita, setExtraRaita] = useState(false);
  const [extraDessert, setExtraDessert] = useState(false);
  const [specialNotes, setSpecialNotes] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");

  const calculatedPricing = useMemo(() => {
    const base = selectedTier.basePrice;
    const proteinUpgrade = currentProtein.extraPrice * selectedTier.qty;
    const alooCost = addAloo ? ALOO_CHARGE * selectedTier.qty : 0;
    const addonCashews = extraCashews ? 5.99 * selectedTier.qty : 0;
    const addonSalan = extraSalan ? 4.99 : 0;
    const addonRaita = extraRaita ? 3.99 : 0;
    const addonDessert = extraDessert ? 6.99 * selectedTier.qty : 0;
    const deliveryCost = orderType === "delivery" ? (selectedTier.qty >= freeThreshold ? 0 : configuredDeliveryFee) : 0;

    const subtotal =
      base + proteinUpgrade + alooCost + addonCashews + addonSalan + addonRaita + addonDessert;
    const tax = 0;
    const total = subtotal + deliveryCost;

    return {
      base,
      proteinUpgrade,
      alooCost,
      addonCashews,
      addonSalan,
      addonRaita,
      addonDessert,
      deliveryCost,
      subtotal,
      tax,
      total,
    };
  }, [
    selectedTier,
    currentProtein,
    addAloo,
    extraCashews,
    extraSalan,
    extraRaita,
    extraDessert,
    orderType,
  ]);

  const whatsappUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    `Hello Master Chef Kartheek! I would like to order the ${selectedTier.title} (${currentProtein.name}) for Springfield ${orderType.toUpperCase()}. Total: $${calculatedPricing.total.toFixed(2)}.`,
  )}`;

  const handleAddToCartAndCheckout = () => {
    const noteContent = [
      `Tray Bundle: ${selectedTier.title}`,
      `Spice: ${spiceLevel.toUpperCase()}`,
      extraCashews ? "+Extra Cashews" : "",
      extraSalan ? "+Extra Salan" : "",
      extraRaita ? "+Extra Raita" : "",
      extraDessert ? "+Extra Dessert Box" : "",
      specialNotes ? `Note: ${specialNotes}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    addLine({
      proteinId: currentProtein.id,
      name: `${selectedTier.title} – ${currentProtein.name}`,
      aloo: addAloo,
      extraSpicy: spiceLevel === "extra",
      notes: noteContent,
      qty: selectedTier.qty,
      unitPrice: calculatedPricing.subtotal / selectedTier.qty,
    });

    toast.success(`${selectedTier.title} added to your cart!`);
    navigate({ to: "/checkout" });
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] font-sans text-zinc-900 selection:bg-amber-500/20 selection:text-amber-900 relative overflow-hidden pb-32 sm:pb-36">
      {/* Top Banner Ambience */}
      <div className="relative border-b border-zinc-200 bg-white py-10 px-4 sm:px-8 text-center">
        <div className="mx-auto max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-medium text-amber-800">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>Dum Pukht Catering Sizing</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-900">
            Handcrafted <span className="text-amber-700">Tray Packages</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
            Choose your custom Dum Biryani Handi Tray package. Every tray serves 4–5 adults, contains 1.6–1.8 kg
            marinated meat, 1 kg aged basmati, boiled eggs, fried onions, cashews, raita, salan, and dessert.
          </p>

          <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-1.5 text-xs text-zinc-700 mt-2">
            <Calendar className="h-3.5 w-3.5 text-amber-600" />
            <span>Next Available Batch: <strong className="text-amber-800 font-semibold">{nextDate}</strong> (Order by 2:00 PM)</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* LEFT COLUMN: TRAY QUANTITY CARDS & CUSTOMIZATION */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* 1. TRAY QUANTITY CARDS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <h2 className="font-display text-lg sm:text-xl font-semibold text-zinc-900 flex items-center gap-2">
                  <UtensilsCrossed className="h-4 w-4 text-amber-600" />
                  <span>Step 1: Choose Your Tray Quantity</span>
                </h2>
                <span className="text-xs text-amber-800 font-medium">5 Packages</span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {TRAY_TIERS.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`relative rounded-2xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden group ${
                        isSelected
                          ? "bg-amber-50/60 border-2 border-amber-500 shadow-sm ring-1 ring-amber-400"
                          : "bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50 shadow-xs"
                      }`}
                    >
                      {tier.badge && (
                        <div className="absolute top-3 right-3 z-10">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[0.62rem] font-semibold tracking-wide ${
                              tier.popular
                                ? "bg-amber-500 text-zinc-950"
                                : "bg-zinc-100 text-zinc-700 border border-zinc-200"
                            }`}
                          >
                            {tier.badge}
                          </span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <div className="relative h-32 w-full rounded-xl overflow-hidden border border-zinc-200">
                          <img
                            src={tier.image}
                            alt={tier.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-black/70 px-2 py-0.5 text-[0.68rem] font-medium text-amber-300 backdrop-blur-md">
                            <Users className="h-3 w-3" />
                            <span>{tier.serves}</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className={`font-display text-base font-semibold ${isSelected ? "text-amber-900" : "text-zinc-900"}`}>
                              {tier.title}
                            </h3>
                            {isSelected && (
                              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-zinc-950">
                                <Check className="h-3 w-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <p className="text-[0.68rem] text-zinc-500 font-normal">
                            {tier.subtitle}
                          </p>
                        </div>

                        <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2 font-normal">{tier.description}</p>

                        <div className="space-y-1 text-[0.7rem] text-zinc-600 pt-2 border-t border-zinc-100 font-normal">
                          <p className="flex items-center gap-1.5">
                            <Scale className="h-3 w-3 text-amber-600 shrink-0" />
                            <span>{tier.meatWeight} • {tier.riceWeight}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-emerald-700">
                            <Award className="h-3 w-3 shrink-0" />
                            <span>Includes {tier.eggs} Eggs & {tier.desserts} Royal Desserts</span>
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-zinc-100 flex items-end justify-between">
                        <div>
                          <span className="text-[0.62rem] text-zinc-500 uppercase tracking-wider block">Starting At</span>
                          <p className="font-display text-lg font-semibold text-amber-700">{formatMoney(tier.basePrice)}</p>
                        </div>
                        {tier.savings && (
                          <span className="text-[0.62rem] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            {tier.savings}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. PROTEIN SELECTION */}
            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="border-b border-zinc-100 pb-3">
                <h2 className="font-display text-base sm:text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-amber-600" />
                  <span>Step 2: Select Protein Cut ({selectedTier.qty} {selectedTier.qty === 1 ? "Tray" : "Trays"})</span>
                </h2>
                <p className="text-xs text-zinc-500 mt-1 font-normal">
                  100% Zabiha Halal chicken, mutton, and beef cuts marinated in roasted spices and pure desi ghee.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {PROTEIN_OPTIONS.map((protein) => {
                  const isSelected = selectedProtein === protein.id;
                  return (
                    <div
                      key={protein.id}
                      onClick={() => setSelectedProtein(protein.id)}
                      className={`rounded-xl p-3 cursor-pointer border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-amber-50 border-amber-400 text-zinc-900 ring-1 ring-amber-300"
                          : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={protein.img}
                          alt={protein.name}
                          className="h-11 w-11 rounded-lg object-cover shrink-0 border border-zinc-200"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-semibold text-zinc-900">{protein.name}</h4>
                            {protein.halal && (
                              <span className="rounded bg-emerald-50 border border-emerald-200 px-1 py-0.2 text-[0.6rem] font-semibold text-emerald-800">
                                Halal
                              </span>
                            )}
                          </div>
                          <p className="text-[0.68rem] text-amber-700 font-medium">
                            {protein.extraPrice === 0
                              ? "Included in Base Price"
                              : `+$${protein.extraPrice * selectedTier.qty} total (+$${protein.extraPrice}/tray)`}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-amber-500 bg-amber-500 text-zinc-950" : "border-zinc-300 bg-white"
                        }`}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. GOURMET CUSTOMIZATIONS & SPICE PROFILE */}
            <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm">
              <div className="border-b border-zinc-100 pb-3">
                <h2 className="font-display text-base sm:text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span>Step 3: Spice Level & Gourmet Upgrades</span>
                </h2>
              </div>

              {/* Spice Level Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-zinc-700">
                  Select Spice Intensity:
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "mild", label: "Mild", desc: "Aromatic & smooth" },
                    { id: "medium", label: "Medium", desc: "Balanced signature" },
                    { id: "extra", label: "Extra Spicy 🔥", desc: "Roasted chilies" },
                  ].map((s) => {
                    const isSelected = spiceLevel === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSpiceLevel(s.id as any)}
                        className={`rounded-xl p-2.5 text-center border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-100 border-amber-400 text-amber-900 font-semibold"
                            : "bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-600"
                        }`}
                      >
                        <p className={`text-xs font-semibold ${isSelected ? "text-amber-900" : "text-zinc-800"}`}>
                          {s.label}
                        </p>
                        <p className="text-[0.62rem] text-zinc-500 mt-0.5">{s.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Addons Checklist */}
              <div className="space-y-2.5 pt-2">
                <Label className="text-xs font-medium text-zinc-700">
                  Optional Add-ons & Accompaniments:
                </Label>

                <div className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                  <div>
                    <Label htmlFor="tray-aloo" className="text-xs font-semibold text-zinc-900 cursor-pointer">
                      🥔 Add Royal Dum Aloo (Potatoes)
                    </Label>
                    <p className="text-[0.68rem] text-emerald-700 mt-0.5 font-medium">
                      100% Free ($0.00) Included
                    </p>
                  </div>
                  <Switch id="tray-aloo" checked={addAloo} onCheckedChange={setAddAloo} />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                  <div>
                    <Label htmlFor="tray-cashews" className="text-xs font-semibold text-zinc-900 cursor-pointer">
                      Extra Toasted Whole Cashews Pack
                    </Label>
                    <p className="text-[0.68rem] text-amber-800 mt-0.5 font-normal">
                      +${(5.99 * selectedTier.qty).toFixed(2)} total (+$5.99/pack)
                    </p>
                  </div>
                  <Switch id="tray-cashews" checked={extraCashews} onCheckedChange={setExtraCashews} />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                  <div>
                    <Label htmlFor="tray-salan" className="text-xs font-semibold text-zinc-900 cursor-pointer">
                      Extra 16 oz Mirchi Ka Salan Gravy
                    </Label>
                    <p className="text-[0.68rem] text-amber-800 mt-0.5 font-normal">+$4.99 per container</p>
                  </div>
                  <Switch id="tray-salan" checked={extraSalan} onCheckedChange={setExtraSalan} />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                  <div>
                    <Label htmlFor="tray-raita" className="text-xs font-semibold text-zinc-900 cursor-pointer">
                      Extra 16 oz Mint & Cucumber Raita
                    </Label>
                    <p className="text-[0.68rem] text-amber-800 mt-0.5 font-normal">+$3.99 per container</p>
                  </div>
                  <Switch id="tray-raita" checked={extraRaita} onCheckedChange={setExtraRaita} />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                  <div>
                    <Label htmlFor="tray-dessert" className="text-xs font-semibold text-zinc-900 cursor-pointer">
                      Additional Gulab Jamun Dessert Box (6 pcs)
                    </Label>
                    <p className="text-[0.68rem] text-amber-800 mt-0.5 font-normal">
                      +${(6.99 * selectedTier.qty).toFixed(2)} total (+$6.99/box)
                    </p>
                  </div>
                  <Switch id="tray-dessert" checked={extraDessert} onCheckedChange={setExtraDessert} />
                </div>
              </div>

              {/* Special Instructions */}
              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-medium text-zinc-700">
                  Special Kitchen Instructions:
                </Label>
                <Textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Please pack raita separately, less spicy for kids, deliver by 4:30 PM"
                  rows={2}
                  className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 text-xs rounded-xl focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STICKY ORDER SUMMARY PANEL */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-20 space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div>
                  <span className="text-[0.65rem] font-semibold text-amber-800 uppercase tracking-wider">
                    Order Summary
                  </span>
                  <h3 className="font-display text-lg font-semibold text-zinc-900">Your Selection</h3>
                </div>
                <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
                  <ShoppingBag className="h-4 w-4" />
                </div>
              </div>

              <div className="rounded-xl bg-zinc-50 border border-zinc-200 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-zinc-900">{selectedTier.title}</h4>
                  <span className="font-semibold text-amber-700 text-sm">{formatMoney(selectedTier.basePrice)}</span>
                </div>

                <div className="space-y-1 text-[0.72rem] text-zinc-600 font-normal">
                  <p className="flex items-center gap-1.5 text-zinc-800 font-medium">
                    <Users className="h-3.5 w-3.5 text-amber-600" />
                    <span>Feeds {selectedTier.serves}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-amber-600" />
                    <span>{selectedTier.meatWeight} • {selectedTier.riceWeight}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-amber-800 font-semibold">
                    <Flame className="h-3.5 w-3.5" />
                    <span>Protein: {currentProtein.name}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-[0.7rem] text-zinc-600 rounded-xl bg-zinc-50/70 p-3 border border-zinc-200/60">
                <p className="text-[0.65rem] font-semibold text-zinc-800 uppercase tracking-wider">Included With Handi:</p>
                <div className="grid grid-cols-2 gap-1 pt-1 font-normal">
                  <span>✓ {selectedTier.eggs} Boiled Eggs</span>
                  <span>✓ {selectedTier.desserts} Royal Desserts</span>
                  <span>✓ Roasted Cashews</span>
                  <span>✓ Mirchi Ka Salan</span>
                  <span>✓ Mint Raita</span>
                  <span>✓ Birista Onions</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-medium text-zinc-700">Fulfilment Method:</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType("pickup")}
                    className={`rounded-xl p-2 text-center text-xs font-medium border transition-all cursor-pointer ${
                      orderType === "pickup"
                        ? "bg-amber-100 border-amber-400 text-amber-900 font-semibold"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    Pickup (Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("delivery")}
                    className={`rounded-xl p-2 text-center text-xs font-medium border transition-all cursor-pointer ${
                      orderType === "delivery"
                        ? "bg-amber-100 border-amber-400 text-amber-900 font-semibold"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    }`}
                  >
                    Delivery ({selectedTier.qty >= 5 ? "FREE" : "$10"})
                  </button>
                </div>
              </div>

              {/* Calculation List */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-100 text-xs font-normal">
                <div className="flex justify-between text-zinc-600">
                  <span>Base Package ({selectedTier.qty} Handi Trays):</span>
                  <span className="text-zinc-900 font-medium">{formatMoney(calculatedPricing.base)}</span>
                </div>

                {calculatedPricing.proteinUpgrade > 0 && (
                  <div className="flex justify-between text-amber-800 font-semibold">
                    <span>Protein Upgrade ({currentProtein.name}):</span>
                    <span>+{formatMoney(calculatedPricing.proteinUpgrade)}</span>
                  </div>
                )}

                {calculatedPricing.alooCost > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Spiced Baby Aloo:</span>
                    <span className="text-zinc-900">+{formatMoney(calculatedPricing.alooCost)}</span>
                  </div>
                )}

                {calculatedPricing.addonCashews > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Extra Toasted Cashews:</span>
                    <span className="text-zinc-900">+{formatMoney(calculatedPricing.addonCashews)}</span>
                  </div>
                )}

                {calculatedPricing.addonSalan > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Extra Salan Gravy:</span>
                    <span className="text-zinc-900">+{formatMoney(calculatedPricing.addonSalan)}</span>
                  </div>
                )}

                {calculatedPricing.addonRaita > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Extra Mint Raita:</span>
                    <span className="text-zinc-900">+{formatMoney(calculatedPricing.addonRaita)}</span>
                  </div>
                )}

                {calculatedPricing.addonDessert > 0 && (
                  <div className="flex justify-between text-zinc-600">
                    <span>Extra Dessert Boxes:</span>
                    <span className="text-zinc-900">+{formatMoney(calculatedPricing.addonDessert)}</span>
                  </div>
                )}

                <div className="flex justify-between text-zinc-500">
                  <span>Fulfilment ({orderType === "pickup" ? "Pickup" : "Delivery"}):</span>
                  <span>{calculatedPricing.deliveryCost === 0 ? "Free" : formatMoney(calculatedPricing.deliveryCost)}</span>
                </div>

                <div className="pt-2 border-t border-zinc-200 flex justify-between items-baseline">
                  <span className="font-semibold text-zinc-900">Estimated Total:</span>
                  <span className="font-display text-xl font-bold text-amber-700">
                    {formatMoney(calculatedPricing.total)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleAddToCartAndCheckout}
                  size="lg"
                  className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm py-5 shadow-sm transition-colors gap-2 cursor-pointer"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  <span>Add Handi Bundle & Checkout →</span>
                </Button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 p-2.5 text-xs font-semibold text-emerald-800 transition-colors shadow-xs"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Order Bundle on WhatsApp</span>
                </a>

                <a
                  href={`tel:${BUSINESS.phone}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 p-2 text-xs font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
                >
                  <Phone className="h-3 w-3 text-amber-600" />
                  <span>Call Kitchen: {BUSINESS.phone}</span>
                </a>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-amber-50/60 border border-amber-200/60 p-2 text-[0.68rem] text-zinc-600 font-normal">
                <Shield className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span>100% Zabiha Halal Certified • Fresh Daily Dum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
