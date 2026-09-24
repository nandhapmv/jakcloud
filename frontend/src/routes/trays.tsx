import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Sparkles,
  Shield,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  MapPin,
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
} from "lucide-react";
import { toast } from "sonner";

import heroImg from "@/assets/hero-biryani.jpg";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { BUSINESS, formatDate, nextAvailableDate, formatMoney, ALOO_CHARGE, type ProteinId } from "@/lib/menu";

export const Route = createFileRoute("/trays")({
  head: () => ({
    meta: [
      { title: "Tray Selection & Catering — JAKLOUD Spice King Dum Biryani" },
      {
        name: "description",
        content:
          "Select handcrafted Dum Biryani Handi Trays made to order in Springfield, MO. 1 Tray, 2 Trays, 3 Trays, Family Feast, and Mega Party Trays with generous portions.",
      },
      { property: "og:title", content: "Royal Tray Selection — JAKLOUD Dum Biryani" },
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
    subtitle: "Classic Royal Feast",
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
    subtitle: "Grand Royal Banquet",
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
    subtitle: "Executive Gathering Set",
    serves: "22 – 25 Adults",
    meatWeight: "8.5 – 9.0 kg Meat",
    riceWeight: "5.0 kg Aged Basmati",
    basePrice: 469.99,
    savings: "$40.00 Off + Free Delivery",
    image: paneerImg,
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
  const navigate = useNavigate();
  const nextDate = formatDate(nextAvailableDate());

  // Selected Tier
  const [selectedTierId, setSelectedTierId] = useState<string>("3-trays");
  const selectedTier = useMemo(
    () => TRAY_TIERS.find((t) => t.id === selectedTierId) || TRAY_TIERS[0],
    [selectedTierId],
  );

  // Selected Protein
  const [selectedProtein, setSelectedProtein] = useState<ProteinId>("chicken");
  const currentProtein = useMemo(
    () => PROTEIN_OPTIONS.find((p) => p.id === selectedProtein) || PROTEIN_OPTIONS[0],
    [selectedProtein],
  );

  // Customization Options
  const [addAloo, setAddAloo] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState<"mild" | "medium" | "extra">("medium");
  const [extraCashews, setExtraCashews] = useState(false);
  const [extraSalan, setExtraSalan] = useState(false);
  const [extraRaita, setExtraRaita] = useState(false);
  const [extraDessert, setExtraDessert] = useState(false);
  const [specialNotes, setSpecialNotes] = useState("");
  const [orderType, setOrderType] = useState<"pickup" | "delivery">("pickup");

  // Price Calculations
  const calculatedPricing = useMemo(() => {
    const base = selectedTier.basePrice;
    const proteinUpgrade = currentProtein.extraPrice * selectedTier.qty;
    const alooCost = addAloo ? ALOO_CHARGE * selectedTier.qty : 0;
    const addonCashews = extraCashews ? 5.99 * selectedTier.qty : 0;
    const addonSalan = extraSalan ? 4.99 : 0;
    const addonRaita = extraRaita ? 3.99 : 0;
    const addonDessert = extraDessert ? 6.99 * selectedTier.qty : 0;
    const deliveryCost = orderType === "delivery" ? (selectedTier.qty >= 5 ? 0 : 10) : 0;

    const subtotal =
      base + proteinUpgrade + alooCost + addonCashews + addonSalan + addonRaita + addonDessert;
    const tax = subtotal * 0.086; // 8.6% Springfield Food Tax
    const total = subtotal + tax + deliveryCost;

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
    // Add lines for each tray or as bundled line
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
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold relative overflow-hidden pb-20">
      {/* Top Banner Ambience */}
      <div className="relative border-b border-gold/20 bg-gradient-to-r from-[#170f0a] via-[#24150d] to-[#170f0a] py-10 px-4 sm:px-8 text-center">
        <div className="mx-auto max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/60 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-gold shadow-[0_0_20px_rgba(212,160,23,0.3)]">
            <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
            <span>Handcrafted Dum Pukht Catering Sizing</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-wide text-cream">
            Made To Order <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">Tray Selection</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-cream/80 leading-relaxed">
            Choose your custom Dum Biryani Handi Tray package. Every single tray serves 4–5 adults, contains 1.6–1.8 kg
            marinated meat, 1 kg aged basmati, boiled eggs, fried onions, cashews, raita, salan, and dessert.
          </p>

          <div className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-black/50 px-3.5 py-1.5 text-xs text-cream/90 mt-2">
            <Calendar className="h-3.5 w-3.5 text-gold" />
            <span>Next Available Batch: <strong className="text-gold">{nextDate}</strong> (Order by 2:00 PM)</span>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout: Cards on Left, Sticky Summary on Right */}
      <div className="mx-auto max-w-7xl px-4 sm:px-8 py-10">
        <div className="grid gap-10 lg:grid-cols-12 items-start">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: TRAY QUANTITY CARDS & CUSTOMIZATION (8 COLS)                */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-10">
            {/* 1. TRAY QUANTITY CARDS LIST */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gold/15 pb-3">
                <h2 className="font-display text-xl sm:text-2xl font-bold text-cream flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-gold" />
                  <span>Step 1: Choose Your Tray Quantity</span>
                </h2>
                <span className="text-xs text-gold font-semibold uppercase tracking-wider">
                  5 Tier Packages
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {TRAY_TIERS.map((tier) => {
                  const isSelected = selectedTierId === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTierId(tier.id)}
                      className={`relative rounded-3xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                        isSelected
                          ? "bg-gradient-to-b from-[#1f140d] to-[#140c07] border-2 border-gold shadow-[0_0_35px_rgba(212,175,55,0.45)] scale-[1.02]"
                          : "bg-[#120c08]/90 border border-gold/25 hover:border-gold/60 hover:bg-[#18100a] hover:-translate-y-1 shadow-xl"
                      }`}
                    >
                      {/* Top Ribbon Badge */}
                      {tier.badge && (
                        <div className="absolute top-3 right-3">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider shadow-md ${
                              tier.popular
                                ? "bg-gradient-to-r from-chili to-gold text-white"
                                : "bg-gold/20 border border-gold/40 text-gold"
                            }`}
                          >
                            {tier.badge}
                          </span>
                        </div>
                      )}

                      <div className="space-y-3">
                        {/* Image Preview */}
                        <div className="relative h-36 w-full rounded-2xl overflow-hidden border border-gold/20">
                          <img
                            src={tier.image}
                            alt={tier.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-2 left-2 flex items-center gap-1.5 rounded-lg bg-black/70 px-2 py-0.5 text-[0.68rem] font-bold text-gold backdrop-blur-md">
                            <Users className="h-3 w-3" />
                            <span>{tier.serves}</span>
                          </div>
                        </div>

                        {/* Title & Subtitle */}
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className={`font-display text-lg font-bold ${isSelected ? "text-gold" : "text-cream"}`}>
                              {tier.title}
                            </h3>
                            {isSelected && (
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-black shadow-sm">
                                <Check className="h-3.5 w-3.5 stroke-[3]" />
                              </div>
                            )}
                          </div>
                          <p className="text-[0.68rem] uppercase tracking-wider text-saffron font-semibold">
                            {tier.subtitle}
                          </p>
                        </div>

                        <p className="text-xs text-cream/70 leading-relaxed line-clamp-2">{tier.description}</p>

                        {/* Specs Strip */}
                        <div className="space-y-1 text-[0.7rem] text-cream/80 pt-1 border-t border-gold/15">
                          <p className="flex items-center gap-1.5">
                            <Scale className="h-3 w-3 text-gold shrink-0" />
                            <span>{tier.meatWeight} • {tier.riceWeight}</span>
                          </p>
                          <p className="flex items-center gap-1.5 text-emerald-400">
                            <Award className="h-3 w-3 shrink-0" />
                            <span>Includes {tier.eggs} Eggs & {tier.desserts} Royal Desserts</span>
                          </p>
                        </div>
                      </div>

                      {/* Price Strip */}
                      <div className="pt-4 mt-3 border-t border-gold/15 flex items-end justify-between">
                        <div>
                          <span className="text-[0.65rem] text-cream/50 uppercase tracking-wider">Starting At</span>
                          <p className="font-display text-xl font-bold text-gold">{formatMoney(tier.basePrice)}</p>
                        </div>
                        {tier.savings && (
                          <span className="text-[0.65rem] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
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
            <div className="space-y-4 rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="border-b border-gold/15 pb-3">
                <h2 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                  <Flame className="h-5 w-5 text-chili" />
                  <span>Step 2: Select Protein Cut ({selectedTier.qty} {selectedTier.qty === 1 ? "Tray" : "Trays"})</span>
                </h2>
                <p className="text-xs text-cream/70 mt-1">
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
                      className={`rounded-2xl p-3.5 cursor-pointer border transition-all flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-gold/15 border-gold shadow-[0_0_20px_rgba(212,175,55,0.3)] text-cream"
                          : "bg-black/40 border-gold/20 hover:bg-black/60 text-cream/80"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={protein.img}
                          alt={protein.name}
                          className="h-12 w-12 rounded-xl object-cover shrink-0 border border-gold/30"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-display text-sm font-bold text-cream">{protein.name}</h4>
                            {protein.halal && (
                              <span className="rounded bg-emerald-950/80 border border-emerald-500/40 px-1 py-0.2 text-[0.6rem] font-bold text-emerald-400">
                                Halal
                              </span>
                            )}
                          </div>
                          <p className="text-[0.7rem] text-gold font-medium">
                            {protein.extraPrice === 0
                              ? "Included in Base Price"
                              : `+$${protein.extraPrice * selectedTier.qty} total upgrade (+$${protein.extraPrice}/tray)`}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? "border-gold bg-gold text-black" : "border-gold/40 bg-black/50"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. GOURMET CUSTOMIZATIONS & SPICE PROFILE */}
            <div className="space-y-5 rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
              <div className="border-b border-gold/15 pb-3">
                <h2 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-gold" />
                  <span>Step 3: Spice Level & Gourmet Upgrades</span>
                </h2>
              </div>

              {/* Spice Level Selector */}
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gold">
                  Select Spice Intensity:
                </Label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { id: "mild", label: "Royal Mild", desc: "Aromatic, saffron-forward" },
                    { id: "medium", label: "Traditional Nizam", desc: "Chef's signature balance" },
                    { id: "extra", label: "Extra Spicy 🔥", desc: "Roasted green chilies" },
                  ].map((s) => {
                    const isSelected = spiceLevel === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSpiceLevel(s.id as any)}
                        className={`rounded-2xl p-3 text-center border transition-all ${
                          isSelected
                            ? "bg-gradient-to-b from-chili/30 to-chili/10 border-chili shadow-[0_0_15px_rgba(185,28,28,0.4)] text-cream"
                            : "bg-black/40 border-gold/20 hover:bg-black/60 text-cream/70"
                        }`}
                      >
                        <p className={`text-xs font-bold ${isSelected ? "text-amber-200" : "text-cream"}`}>
                          {s.label}
                        </p>
                        <p className="text-[0.62rem] text-cream/60 mt-0.5">{s.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Addons Checklist */}
              <div className="space-y-3 pt-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gold">
                  Handi Tray Add-ons & Extra Accompaniments:
                </Label>

                {/* Aloo Switch */}
                <div className="flex items-center justify-between rounded-2xl bg-black/40 border border-gold/20 p-3.5">
                  <div>
                    <Label htmlFor="tray-aloo" className="text-xs font-semibold text-cream cursor-pointer">
                      Add Slow-Steamed Spiced Baby Aloo (Potatoes)
                    </Label>
                    <p className="text-[0.68rem] text-gold mt-0.5">
                      +${ALOO_CHARGE * selectedTier.qty} total (+${ALOO_CHARGE}/tray)
                    </p>
                  </div>
                  <Switch id="tray-aloo" checked={addAloo} onCheckedChange={setAddAloo} />
                </div>

                {/* Extra Roasted Cashews */}
                <div className="flex items-center justify-between rounded-2xl bg-black/40 border border-gold/20 p-3.5">
                  <div>
                    <Label htmlFor="tray-cashews" className="text-xs font-semibold text-cream cursor-pointer">
                      Extra Pure Desi Ghee Toasted Whole Cashews Pack
                    </Label>
                    <p className="text-[0.68rem] text-gold mt-0.5">
                      +${(5.99 * selectedTier.qty).toFixed(2)} total (+$5.99/pack)
                    </p>
                  </div>
                  <Switch id="tray-cashews" checked={extraCashews} onCheckedChange={setExtraCashews} />
                </div>

                {/* Extra Salan */}
                <div className="flex items-center justify-between rounded-2xl bg-black/40 border border-gold/20 p-3.5">
                  <div>
                    <Label htmlFor="tray-salan" className="text-xs font-semibold text-cream cursor-pointer">
                      Extra 16 oz Royal Mirchi Ka Salan Curry
                    </Label>
                    <p className="text-[0.68rem] text-gold mt-0.5">+$4.99 per container</p>
                  </div>
                  <Switch id="tray-salan" checked={extraSalan} onCheckedChange={setExtraSalan} />
                </div>

                {/* Extra Raita */}
                <div className="flex items-center justify-between rounded-2xl bg-black/40 border border-gold/20 p-3.5">
                  <div>
                    <Label htmlFor="tray-raita" className="text-xs font-semibold text-cream cursor-pointer">
                      Extra 16 oz Fresh Mint & Cucumber Raita
                    </Label>
                    <p className="text-[0.68rem] text-gold mt-0.5">+$3.99 per container</p>
                  </div>
                  <Switch id="tray-raita" checked={extraRaita} onCheckedChange={setExtraRaita} />
                </div>

                {/* Extra Dessert Pack */}
                <div className="flex items-center justify-between rounded-2xl bg-black/40 border border-gold/20 p-3.5">
                  <div>
                    <Label htmlFor="tray-dessert" className="text-xs font-semibold text-cream cursor-pointer">
                      Additional Chef's Royal Gulab Jamun Dessert Box (6 pcs)
                    </Label>
                    <p className="text-[0.68rem] text-gold mt-0.5">
                      +${(6.99 * selectedTier.qty).toFixed(2)} total (+$6.99/box)
                    </p>
                  </div>
                  <Switch id="tray-dessert" checked={extraDessert} onCheckedChange={setExtraDessert} />
                </div>
              </div>

              {/* Special Instructions Note */}
              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-gold">
                  Special Kitchen Instructions:
                </Label>
                <Textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Please pack raita separately, less spicy for kids, deliver by 4:30 PM"
                  rows={2}
                  className="bg-black/60 border-gold/25 text-cream placeholder:text-cream/40 text-xs rounded-xl focus:border-gold"
                />
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: STICKY ORDER SUMMARY PANEL (4–5 COLS)                       */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24 space-y-5">
            <div className="rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-[#18100a] via-[#120c08] to-[#0a0705] p-6 shadow-2xl backdrop-blur-2xl space-y-5">
              {/* Summary Header */}
              <div className="flex items-center justify-between border-b border-gold/20 pb-4">
                <div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gold">
                    Custom Order Summary
                  </span>
                  <h3 className="font-display text-xl font-bold text-cream">Your Handi Selection</h3>
                </div>
                <div className="h-10 w-10 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold">
                  <ShoppingBag className="h-5 w-5" />
                </div>
              </div>

              {/* Selected Tier & Portion Specs */}
              <div className="rounded-2xl bg-black/50 border border-gold/20 p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-base font-bold text-cream">{selectedTier.title}</h4>
                  <span className="font-bold text-gold text-sm">{formatMoney(selectedTier.basePrice)}</span>
                </div>

                <div className="space-y-1 text-[0.72rem] text-cream/75">
                  <p className="flex items-center gap-1.5 text-gold font-medium">
                    <Users className="h-3.5 w-3.5" />
                    <span>Feeds {selectedTier.serves}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-gold" />
                    <span>{selectedTier.meatWeight} • {selectedTier.riceWeight}</span>
                  </p>
                  <p className="flex items-center gap-1.5 text-saffron">
                    <Flame className="h-3.5 w-3.5" />
                    <span>Protein: {currentProtein.name}</span>
                  </p>
                </div>
              </div>

              {/* Included Accompaniments Checklist */}
              <div className="space-y-1.5 text-[0.7rem] text-cream/70 rounded-2xl bg-black/30 p-3.5 border border-gold/15">
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-gold">Included With Your Handi:</p>
                <div className="grid grid-cols-2 gap-1 pt-1">
                  <span>✓ {selectedTier.eggs} Boiled Farm Eggs</span>
                  <span>✓ {selectedTier.desserts} Royal Desserts</span>
                  <span>✓ Roasted Cashews</span>
                  <span>✓ Mirchi Ka Salan</span>
                  <span>✓ Mint Raita</span>
                  <span>✓ Birista Onions</span>
                </div>
              </div>

              {/* Pickup vs Delivery Toggle */}
              <div className="space-y-2 pt-1">
                <Label className="text-xs font-bold uppercase tracking-wider text-gold">Fulfilment Method:</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderType("pickup")}
                    className={`rounded-xl p-2 text-center text-xs font-bold border transition-all ${
                      orderType === "pickup"
                        ? "bg-gold/20 border-gold text-gold shadow-sm"
                        : "bg-black/40 border-gold/20 text-cream/60"
                    }`}
                  >
                    Counter Pickup (Free)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("delivery")}
                    className={`rounded-xl p-2 text-center text-xs font-bold border transition-all ${
                      orderType === "delivery"
                        ? "bg-chili/30 border-chili text-amber-200 shadow-sm"
                        : "bg-black/40 border-gold/20 text-cream/60"
                    }`}
                  >
                    Springfield Delivery ({selectedTier.qty >= 5 ? "FREE" : "$10"})
                  </button>
                </div>
              </div>

              {/* Itemized Calculation */}
              <div className="space-y-2 pt-3 border-t border-gold/20 text-xs">
                <div className="flex justify-between text-cream/80">
                  <span>Base Package ({selectedTier.qty} Handi Trays):</span>
                  <span>{formatMoney(calculatedPricing.base)}</span>
                </div>

                {calculatedPricing.proteinUpgrade > 0 && (
                  <div className="flex justify-between text-gold">
                    <span>Protein Upgrade ({currentProtein.name}):</span>
                    <span>+{formatMoney(calculatedPricing.proteinUpgrade)}</span>
                  </div>
                )}

                {calculatedPricing.alooCost > 0 && (
                  <div className="flex justify-between text-cream/80">
                    <span>Spiced Baby Aloo:</span>
                    <span>+{formatMoney(calculatedPricing.alooCost)}</span>
                  </div>
                )}

                {calculatedPricing.addonCashews > 0 && (
                  <div className="flex justify-between text-cream/80">
                    <span>Extra Toasted Cashews:</span>
                    <span>+{formatMoney(calculatedPricing.addonCashews)}</span>
                  </div>
                )}

                {calculatedPricing.addonSalan > 0 && (
                  <div className="flex justify-between text-cream/80">
                    <span>Extra Salan Gravy:</span>
                    <span>+{formatMoney(calculatedPricing.addonSalan)}</span>
                  </div>
                )}

                {calculatedPricing.addonRaita > 0 && (
                  <div className="flex justify-between text-cream/80">
                    <span>Extra Mint Raita:</span>
                    <span>+{formatMoney(calculatedPricing.addonRaita)}</span>
                  </div>
                )}

                {calculatedPricing.addonDessert > 0 && (
                  <div className="flex justify-between text-cream/80">
                    <span>Extra Dessert Boxes:</span>
                    <span>+{formatMoney(calculatedPricing.addonDessert)}</span>
                  </div>
                )}

                <div className="flex justify-between text-cream/70">
                  <span>Springfield Food Tax (8.6%):</span>
                  <span>{formatMoney(calculatedPricing.tax)}</span>
                </div>

                <div className="flex justify-between text-cream/70">
                  <span>Fulfilment ({orderType === "pickup" ? "Pickup" : "10-Mile Radius"}):</span>
                  <span>{calculatedPricing.deliveryCost === 0 ? "Free" : formatMoney(calculatedPricing.deliveryCost)}</span>
                </div>

                <div className="pt-2 border-t border-gold/25 flex justify-between items-baseline">
                  <span className="font-display text-base font-bold text-cream">Estimated Total:</span>
                  <span className="font-display text-2xl font-bold text-gold drop-shadow-md">
                    {formatMoney(calculatedPricing.total)}
                  </span>
                </div>
              </div>

              {/* Order & WhatsApp CTA Buttons */}
              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={handleAddToCartAndCheckout}
                  size="lg"
                  className="w-full rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-sm sm:text-base py-6 shadow-[0_0_25px_rgba(185,28,28,0.5)] hover:scale-[1.02] transition-all gap-2"
                >
                  <UtensilsCrossed className="h-5 w-5" />
                  <span>Add Handi Bundle & Checkout →</span>
                </Button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/80 p-3.5 text-xs font-bold text-emerald-400 hover:border-emerald-400 transition-all shadow-md"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Order Bundle on WhatsApp Direct</span>
                </a>

                <a
                  href={`tel:${BUSINESS.phone}`}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-gold/30 bg-black/60 hover:bg-gold/15 p-2.5 text-[0.72rem] font-semibold text-gold transition-all"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>Call Kitchen: {BUSINESS.phone}</span>
                </a>
              </div>

              {/* Guarantee Note */}
              <div className="flex items-center gap-2 rounded-xl bg-black/40 border border-gold/20 p-2.5 text-[0.68rem] text-gold">
                <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>100% Zabiha Halal Certified • Fresh Daily Dum</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
