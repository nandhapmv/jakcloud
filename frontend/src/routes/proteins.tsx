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
  CheckCircle2,
  Clock,
  Zap,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

import heroImg from "@/assets/hero-biryani.jpg";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import rawChickenImg from "@/assets/raw-chicken.jpg";
import rawMuttonImg from "@/assets/raw-mutton.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart, unitPriceFor } from "@/lib/cart";
import {
  BUSINESS,
  formatDate,
  nextAvailableDate,
  formatMoney,
  ALOO_CHARGE,
  MENU,
  type ProteinId,
} from "@/lib/menu";

export const Route = createFileRoute("/proteins")({
  head: () => ({
    meta: [
      { title: "Protein Selection — JAKLOUD Spice King Dum Biryani" },
      {
        name: "description",
        content:
          "Select your signature protein cut for Made To Order Dum Biryani. 100% Zabiha Halal Chicken, Mutton, and Beef, plus Springfield Signature Pork.",
      },
      { property: "og:title", content: "Premium Protein Selection — JAKLOUD Dum Biryani" },
      {
        property: "og:description",
        content: "Handcrafted biryani handi trays with 1.6–1.8 kg marinated protein. Zabiha Halal certified.",
      },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: ProteinSelectionPage,
});

interface ProteinCardData {
  id: ProteinId;
  name: string;
  tagline: string;
  cutDetails: string;
  marinationTime: string;
  halal: boolean;
  halalCert: string;
  availability: string;
  stockStatus: "in-stock" | "limited" | "ready";
  stockCount: number;
  basePrice: number;
  priceWithAloo: number;
  meatWeight: string;
  serves: string;
  kcal: number;
  description: string;
  dishImage: string;
  prepImage: string;
  flavorProfile: string[];
  spiceRating: number;
}

const PROTEINS_DATA: ProteinCardData[] = [
  {
    id: "chicken",
    name: "Royal Chicken Dum",
    tagline: "Chef's Classic Signature Cut",
    cutDetails: "Bone-in tender chicken thighs & drumsticks",
    marinationTime: "12-Hour Overnight Saffron Marinade",
    halal: true,
    halalCert: "100% Hand-Slaughtered Zabiha Halal",
    availability: "In Stock · Accepting Batches",
    stockStatus: "in-stock",
    stockCount: 14,
    basePrice: 101.99,
    priceWithAloo: 108.99,
    meatWeight: "1.6 – 1.8 kg Marinated Chicken",
    serves: "4 – 5 Adults",
    kcal: 1714,
    description:
      "Succulent bone-in chicken thighs marinated in hand-beaten yogurt, Kashmiri saffron threads, toasted whole cardamom, cinnamon, and fresh mint leaves. Slow-steamed on dum to lock in natural poultry juices.",
    dishImage: chickenImg,
    prepImage: rawChickenImg,
    flavorProfile: ["Aromatic Saffron", "Juicy Thigh Cuts", "Crispy Birista Shallots"],
    spiceRating: 2,
  },
  {
    id: "mutton",
    name: "Hyderabadi Shahi Mutton Dum",
    tagline: "Royal Nizami Celebration Feast",
    cutDetails: "Tender baby goat bone-in shoulder & ribs",
    marinationTime: "16-Hour Desi Ghee & Spiced Marinade",
    halal: true,
    halalCert: "100% Hand-Slaughtered Zabiha Halal",
    availability: "Limited Pre-Order (Only 4 Left)",
    stockStatus: "limited",
    stockCount: 4,
    basePrice: 157.99,
    priceWithAloo: 164.99,
    meatWeight: "1.6 – 1.8 kg Tender Baby Goat",
    serves: "4 – 5 Adults",
    kcal: 2054,
    description:
      "The gold standard of Hyderabadi royal banquets. Selected young goat cuts slow-braised for 4 hours with crushed green cardamom, cloves, ginger root, and roasted cashew paste. Fall-apart tender texture.",
    dishImage: muttonImg,
    prepImage: rawMuttonImg,
    flavorProfile: ["Melt-In-Mouth Tender", "Rich Desi Ghee Infusion", "Royal Nizami Spices"],
    spiceRating: 2,
  },
  {
    id: "beef",
    name: "Slow-Braised Spiced Beef Dum",
    tagline: "Bold, Hearty & Caramelized Meat",
    cutDetails: "Prime beef chuck & brisket cuts",
    marinationTime: "14-Hour Roasted Garam Masala Marinade",
    halal: true,
    halalCert: "100% Hand-Slaughtered Zabiha Halal",
    availability: "In Stock · Accepting Batches",
    stockStatus: "in-stock",
    stockCount: 8,
    basePrice: 122.99,
    priceWithAloo: 129.99,
    meatWeight: "1.6 – 1.8 kg Prime Beef",
    serves: "4 – 5 Adults",
    kcal: 1952,
    description:
      "Selected prime beef cuts cooked low and slow so the rich caramelized spiced jus infuses deep into every single grain of aged basmati. A deeply robust and hearty dum biryani feast.",
    dishImage: rawBeefImg,
    prepImage: heroImg,
    flavorProfile: ["Deep Savory Umami", "Caramelized Jus", "Bold Peppery Notes"],
    spiceRating: 3,
  },
  {
    id: "pork",
    name: "Springfield Signature Pork Dum",
    tagline: "Ozarks Specialty Fusion Craft",
    cutDetails: "Slow-simmered pork shoulder cuts",
    marinationTime: "12-Hour Coriander-Ginger Marinade",
    halal: false,
    halalCert: "Non-Halal · Dedicated Separate Cooking Pot",
    availability: "In Stock · Dedicated Vessel",
    stockStatus: "in-stock",
    stockCount: 6,
    basePrice: 108.99,
    priceWithAloo: 115.99,
    meatWeight: "1.6 – 1.8 kg Succulent Pork",
    serves: "4 – 5 Adults",
    kcal: 1952,
    description:
      "A Springfield culinary innovation. Tender pork shoulder slow-simmered with crushed roasted coriander, cumin, ginger, and desi ghee in a dedicated, strictly isolated cooking pot, finished with fresh mint and fried shallots.",
    dishImage: rawPorkImg,
    prepImage: dumHandiImg,
    flavorProfile: ["Rich Roasted Coriander", "Golden Desi Ghee", "Crispy Onions"],
    spiceRating: 2,
  },
];

export function ProteinSelectionPage() {
  const { addLine, count } = useCart();
  const navigate = useNavigate();
  const nextDate = formatDate(nextAvailableDate());

  // Selected Protein State
  const [selectedProteinId, setSelectedProteinId] = useState<ProteinId>("chicken");
  const currentProtein = useMemo(
    () => PROTEINS_DATA.find((p) => p.id === selectedProteinId) || PROTEINS_DATA[0],
    [selectedProteinId],
  );

  // Modifiers
  const [addAloo, setAddAloo] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState<"mild" | "medium" | "extra">("medium");
  const [trayQty, setTrayQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "halal" | "specialty">("all");

  const unitPrice = unitPriceFor(currentProtein.id, addAloo);
  const totalPrice = unitPrice * trayQty;

  const filteredProteins = useMemo(() => {
    if (activeTab === "halal") return PROTEINS_DATA.filter((p) => p.halal);
    if (activeTab === "specialty") return PROTEINS_DATA.filter((p) => !p.halal);
    return PROTEINS_DATA;
  }, [activeTab]);

  const handleAddToCart = () => {
    const fullNotes = [
      `Protein: ${currentProtein.name}`,
      `Spice: ${spiceLevel.toUpperCase()}`,
      notes ? `Note: ${notes}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    addLine({
      proteinId: currentProtein.id,
      name: currentProtein.name,
      aloo: addAloo,
      extraSpicy: spiceLevel === "extra",
      notes: fullNotes,
      qty: trayQty,
      unitPrice,
    });

    toast.success(`${trayQty} × ${currentProtein.name} added to your Handi Order!`);
  };

  const whatsappUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    `Hello Master Chef Kartheek! I would like to order ${trayQty} Tray(s) of ${currentProtein.name} (${spiceLevel.toUpperCase()}${addAloo ? " +Aloo" : ""}) from JAKLOUD. Total: $${totalPrice.toFixed(2)}.`,
  )}`;

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold relative overflow-hidden pb-24">
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO BANNER                                                */}
      {/* ------------------------------------------------------------- */}
      <section className="relative border-b border-gold/20 bg-gradient-to-r from-[#170f0a] via-[#24150d] to-[#170f0a] py-14 px-4 sm:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-black/80 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/60 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-gold shadow-[0_0_20px_rgba(212,160,23,0.3)]">
            <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
            <span>Master Chef Cut & Marinade Selection</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide text-cream">
            Choose Your Signature <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">Protein</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-cream/80 leading-relaxed">
            Every Handi Tray includes 1.6 to 1.8 kg of marinated protein slow-cooked on traditional Dum Pukht with aged saffron basmati. 100% Zabiha Halal chicken, mutton, and beef cuts.
          </p>

          {/* Quick Pillars Strip */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-black/60 px-4 py-1.5 text-xs text-cream/90 shadow-md">
              <Calendar className="h-3.5 w-3.5 text-gold" />
              <span>Next Handi Batch: <strong className="text-gold">{nextDate}</strong></span>
              <span className="text-gold/40">•</span>
              <span className="text-saffron font-semibold">2:00 PM Cutoff</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-semibold text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              <span>100% Zabiha Halal Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. CATEGORY FILTER TABS                                       */}
      {/* ------------------------------------------------------------- */}
      <div className="border-b border-gold/20 bg-[#0d0906]/95 backdrop-blur-xl py-3 px-4 sm:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: "All 4 Proteins" },
              { id: "halal", label: "100% Zabiha Halal (3)" },
              { id: "specialty", label: "Chef Specialty Cut (1)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-xl px-4 py-1.5 text-xs font-semibold transition-all border ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-chili/80 to-gold/80 text-white border-gold shadow-md font-bold"
                    : "bg-black/50 border-gold/15 text-cream/70 hover:bg-gold/15 hover:text-gold"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="hidden md:inline text-xs text-gold font-medium">
            Click any card to customize & order
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. MAIN 4-PROTEIN LUXURY CARDS GRID                           */}
      {/* ------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-10 space-y-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filteredProteins.map((protein) => {
            const isSelected = selectedProteinId === protein.id;
            return (
              <div
                key={protein.id}
                onClick={() => setSelectedProteinId(protein.id)}
                className={`group relative rounded-3xl p-5 sm:p-6 cursor-pointer transition-all duration-500 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? "bg-gradient-to-b from-[#22140b] via-[#1a0f07] to-[#120a05] border-2 border-gold shadow-[0_0_40px_rgba(212,175,55,0.45)] scale-[1.02] ring-1 ring-gold/50"
                    : "bg-[#140e09]/95 border border-gold/25 hover:border-gold/60 hover:bg-[#1a110b] hover:-translate-y-1.5 shadow-2xl"
                }`}
              >
                {/* Glowing Crimson / Gold Corner Flare */}
                <div
                  className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-opacity ${
                    isSelected ? "bg-gradient-to-bl from-chili/30 via-gold/20 to-transparent opacity-100" : "opacity-0"
                  }`}
                />

                <div className="space-y-4 relative z-10">
                  {/* Protein Food Image with Dual Badge */}
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-gold/20">
                    <img
                      src={protein.dishImage}
                      alt={protein.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                      {protein.halal ? (
                        <span className="rounded-full bg-emerald-950/90 border border-emerald-500/60 px-2.5 py-0.5 text-[0.62rem] font-bold text-emerald-400 backdrop-blur-md shadow-lg flex items-center gap-1">
                          <Shield className="h-3 w-3" /> HALAL
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-950/90 border border-amber-500/60 px-2.5 py-0.5 text-[0.62rem] font-bold text-amber-300 backdrop-blur-md shadow-lg flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> SPECIALTY
                        </span>
                      )}

                      <span className="rounded-full bg-black/80 border border-gold/40 px-2 py-0.5 text-[0.62rem] font-bold text-gold backdrop-blur-md">
                        {protein.serves}
                      </span>
                    </div>

                    {/* Active Selected Checkmark */}
                    {isSelected && (
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-full bg-gold px-2.5 py-0.5 text-[0.65rem] font-bold text-black shadow-lg animate-in zoom-in-50 duration-200">
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>

                  {/* Header Title & Tagline */}
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gold/90 block">
                      {protein.tagline}
                    </span>
                    <h3 className={`font-display text-xl font-bold mt-0.5 ${isSelected ? "text-gold" : "text-cream group-hover:text-gold"} transition-colors`}>
                      {protein.name}
                    </h3>
                  </div>

                  {/* Cut & Marination Specs */}
                  <div className="space-y-1.5 text-[0.7rem] text-cream/75 bg-black/40 rounded-xl p-3 border border-gold/15">
                    <p className="flex items-center gap-1.5 text-cream/90 font-medium">
                      <Scale className="h-3.5 w-3.5 text-gold shrink-0" />
                      <span>{protein.meatWeight}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-gold">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      <span>{protein.marinationTime}</span>
                    </p>
                    <p className="text-[0.65rem] text-cream/60 line-clamp-1">
                      Cut: {protein.cutDetails}
                    </p>
                  </div>

                  <p className="text-xs text-cream/70 leading-relaxed line-clamp-3">
                    {protein.description}
                  </p>

                  {/* Flavor Tag Pills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {protein.flavorProfile.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-gold/10 border border-gold/20 px-2 py-0.5 text-[0.62rem] text-gold font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Bottom: Stock Availability & Price */}
                <div className="pt-4 mt-4 border-t border-gold/15 relative z-10 space-y-2">
                  <div className="flex items-center justify-between text-[0.68rem]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span
                        className={`h-2 w-2 rounded-full animate-pulse ${
                          protein.stockStatus === "limited" ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                      />
                      <span className={protein.stockStatus === "limited" ? "text-amber-300" : "text-emerald-400"}>
                        {protein.availability}
                      </span>
                    </span>
                    <span className="text-cream/50">Feeds 4–5</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[0.62rem] text-cream/50 uppercase tracking-wider block">Price / Handi Tray</span>
                      <p className="font-display text-2xl font-bold text-gold">
                        {formatMoney(protein.basePrice)}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-gold text-black shadow-md"
                          : "bg-gold/20 border border-gold/40 text-gold group-hover:bg-gold group-hover:text-black"
                      }`}
                    >
                      {isSelected ? "Configuring ↓" : "Select"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. ACTIVE PROTEIN ORDER CONFIGURATOR PANEL                    */}
        {/* ------------------------------------------------------------- */}
        <section className="rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-[#18100a] via-[#120c08] to-[#0a0705] p-6 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/20 pb-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4 text-gold" />
                <span>Customizing Selected Protein</span>
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream">
                {currentProtein.name} Handi Tray
              </h2>
              <p className="text-xs text-cream/70">
                {currentProtein.meatWeight} • 1.0 kg Aged Basmati • 2 Boiled Eggs • Cashews • Raita • Salan • Dessert Pack
              </p>
            </div>

            {/* Halal Certified Stamp */}
            <div className="flex items-center gap-3 bg-black/50 border border-gold/30 rounded-2xl p-3 shrink-0">
              <div className="rounded-xl bg-emerald-950/80 p-2 text-emerald-400 border border-emerald-500/40">
                <Shield className="h-6 w-6" />
              </div>
              <div className="text-left text-xs">
                <p className="font-bold text-cream">{currentProtein.halal ? "100% Zabiha Halal Certified" : "Chef Specialty Vessel"}</p>
                <p className="text-[0.7rem] text-gold">{currentProtein.halalCert}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Column 1: Flavor & Spice Customization */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-gold">
                1. Select Spice Intensity:
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "mild", label: "Royal Mild", desc: "Saffron aromatic" },
                  { id: "medium", label: "Nizam Medium", desc: "Balanced spice" },
                  { id: "extra", label: "Extra Spicy 🔥", desc: "Green chili kick" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSpiceLevel(s.id as any)}
                    className={`rounded-2xl p-3 text-center border transition-all ${
                      spiceLevel === s.id
                        ? "bg-gradient-to-b from-chili/30 to-chili/10 border-chili shadow-md text-amber-200 font-bold"
                        : "bg-black/40 border-gold/20 text-cream/70 hover:bg-black/60"
                    }`}
                  >
                    <p className="text-xs">{s.label}</p>
                    <p className="text-[0.62rem] text-cream/60 mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>

              {/* Aloo Switch */}
              <div className="flex items-center justify-between rounded-2xl bg-black/40 border border-gold/20 p-3.5 mt-2">
                <div>
                  <Label htmlFor="protein-aloo" className="text-xs font-semibold text-cream cursor-pointer">
                    Add Slow-Steamed Spiced Baby Aloo
                  </Label>
                  <p className="text-[0.68rem] text-gold mt-0.5">
                    +{formatMoney(ALOO_CHARGE * trayQty)} total (+{formatMoney(ALOO_CHARGE)}/tray)
                  </p>
                </div>
                <Switch id="protein-aloo" checked={addAloo} onCheckedChange={setAddAloo} />
              </div>
            </div>

            {/* Column 2: Quantity & Kitchen Instructions */}
            <div className="space-y-4">
              <Label className="text-xs font-bold uppercase tracking-wider text-gold">
                2. Number of Handi Trays:
              </Label>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-2xl border border-gold/30 bg-black/60 text-cream p-1">
                  <button
                    type="button"
                    onClick={() => setTrayQty((q) => Math.max(1, q - 1))}
                    className="h-10 w-10 flex items-center justify-center text-lg text-gold hover:bg-gold/20 rounded-xl transition-colors"
                  >
                    −
                  </button>
                  <span className="w-12 text-center text-base font-bold text-cream">{trayQty}</span>
                  <button
                    type="button"
                    onClick={() => setTrayQty((q) => q + 1)}
                    className="h-10 w-10 flex items-center justify-center text-lg text-gold hover:bg-gold/20 rounded-xl transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-cream/75">
                  Feeds approx. <strong className="text-gold">{trayQty * 4}–{trayQty * 5} Adults</strong>
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-[0.68rem] text-cream/70 uppercase tracking-wider font-semibold">
                  Kitchen Notes (Optional):
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Extra salan, well-done meat, deliver at 5:00 PM"
                  rows={2}
                  className="bg-black/60 border-gold/25 text-cream text-xs rounded-xl focus:border-gold"
                />
              </div>
            </div>

            {/* Column 3: Live Order Summary & CTA */}
            <div className="space-y-4 rounded-2xl bg-black/50 border border-gold/25 p-5 flex flex-col justify-between">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-cream/70">
                  <span>Selected Cut:</span>
                  <span className="font-bold text-cream">{currentProtein.name}</span>
                </div>
                <div className="flex justify-between text-cream/70">
                  <span>Portion ({trayQty} Trays):</span>
                  <span className="text-gold font-medium">{(1.7 * trayQty).toFixed(1)} kg Protein</span>
                </div>
                {addAloo && (
                  <div className="flex justify-between text-cream/70">
                    <span>Aloo Addon:</span>
                    <span className="text-gold">+{formatMoney(ALOO_CHARGE * trayQty)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gold/20 flex items-baseline justify-between">
                  <span className="font-display text-base font-bold text-cream">Order Total:</span>
                  <span className="font-display text-2xl font-bold text-gold drop-shadow-md">
                    {formatMoney(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleAddToCart}
                  className="w-full rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-sm py-5 shadow-[0_0_20px_rgba(185,28,28,0.4)] hover:scale-[1.02] transition-all gap-2"
                >
                  <Plus className="h-4 w-4" /> Add to Order · {formatMoney(totalPrice)}
                </Button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/80 p-2.5 text-xs font-bold text-emerald-400 transition-all shadow-md"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 5. SIDE-BY-SIDE PROTEIN COMPARISON MATRIX                     */}
        {/* ------------------------------------------------------------- */}
        <section className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="border-b border-gold/15 pb-4">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">Culinary Specs</span>
            <h3 className="font-display text-2xl font-bold text-cream mt-0.5">
              Protein Comparison & Dietary Standards
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gold/20 text-gold uppercase tracking-wider text-[0.68rem]">
                  <th className="pb-3 font-bold">Protein Cut</th>
                  <th className="pb-3 font-bold">Halal Standard</th>
                  <th className="pb-3 font-bold">Meat Weight</th>
                  <th className="pb-3 font-bold">Marination Duration</th>
                  <th className="pb-3 font-bold">Dum Cooking Style</th>
                  <th className="pb-3 font-bold">Price / Tray</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10 text-cream/80">
                {PROTEINS_DATA.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProteinId(p.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedProteinId === p.id ? "bg-gold/10 font-medium" : "hover:bg-black/40"
                    }`}
                  >
                    <td className="py-3.5 font-display text-sm font-bold text-cream flex items-center gap-2">
                      <img src={p.dishImage} alt={p.name} className="h-8 w-8 rounded-lg object-cover" />
                      <span>{p.name}</span>
                    </td>
                    <td className="py-3.5">
                      {p.halal ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[0.7rem]">
                          <Shield className="h-3.5 w-3.5" /> 100% Zabiha Halal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-300 font-semibold text-[0.7rem]">
                          Dedicated Pot
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 text-gold font-mono">{p.meatWeight}</td>
                    <td className="py-3.5">{p.marinationTime}</td>
                    <td className="py-3.5">4-Hour Sealed Dough Dum</td>
                    <td className="py-3.5 font-display text-base font-bold text-gold">
                      {formatMoney(p.basePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 6. FLOATING CHECKOUT PILL                                     */}
      {/* ------------------------------------------------------------- */}
      {count > 0 && (
        <div className="fixed bottom-6 inset-x-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom-5 duration-300">
          <Button
            asChild
            className="w-full rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-sm py-4 shadow-[0_0_30px_rgba(212,160,23,0.6)] flex items-center justify-between px-5 hover:scale-105 transition-all"
          >
            <Link to="/checkout">
              <span className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-gold text-xs font-bold">
                  {count}
                </span>
                <span>{count === 1 ? "1 Handi Tray in Cart" : `${count} Handi Trays in Cart`}</span>
              </span>
              <span className="flex items-center gap-1 font-bold text-xs uppercase tracking-wider">
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
