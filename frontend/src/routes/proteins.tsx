import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Sparkles,
  Shield,
  UtensilsCrossed,
  Plus,
  Check,
  Calendar,
  Scale,
  MessageSquare,
  Clock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import rawChickenImg from "@/assets/raw-chicken.jpg";
import rawMuttonImg from "@/assets/raw-mutton.jpg";
import heroImg from "@/assets/hero-biryani.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart, unitPriceFor } from "@/lib/cart";
import {
  formatDate,
  nextAvailableDate,
  formatMoney,
  ALOO_CHARGE,
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
    tagline: "Classic Signature Cut",
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
    tagline: "Nizami Celebration Feast",
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
    tagline: "Bold & Hearty Cut",
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
    tagline: "Specialty Fusion Craft",
    cutDetails: "Slow-simmered pork shoulder cuts",
    marinationTime: "12-Hour Coriander-Ginger Marinade",
    halal: false,
    halalCert: "Non-Halal · Dedicated Separate Vessel",
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

  const [selectedProteinId, setSelectedProteinId] = useState<ProteinId>("chicken");
  const currentProtein = useMemo(
    () => PROTEINS_DATA.find((p) => p.id === selectedProteinId) || PROTEINS_DATA[0],
    [selectedProteinId],
  );

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
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-200 selection:bg-amber-500/20 selection:text-amber-300 relative overflow-hidden pb-24">
      {/* 1. HERO BANNER */}
      <section className="relative border-b border-white/[0.08] bg-[#121216] py-12 px-4 sm:px-8 text-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Cut & Marinade Selection</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100">
            Choose Your Signature <span className="text-amber-400">Protein Cut</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
            Every Handi Tray includes 1.6 to 1.8 kg of marinated protein slow-cooked on traditional Dum Pukht with aged saffron basmati. 100% Zabiha Halal chicken, mutton, and beef cuts.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#18181f] px-3.5 py-1.5 text-xs text-zinc-300">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>Next Handi Batch: <strong className="text-amber-300 font-medium">{nextDate}</strong></span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400/90 font-medium">2:00 PM Cutoff</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-medium text-emerald-400">
              <Shield className="h-3.5 w-3.5" />
              <span>100% Zabiha Halal Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY FILTER TABS */}
      <div className="border-b border-white/[0.08] bg-[#121216]/80 backdrop-blur-xl py-3 px-4 sm:px-8">
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
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-all border ${
                  activeTab === tab.id
                    ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold"
                    : "bg-[#18181f] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="hidden md:inline text-xs text-zinc-400 font-normal">
            Click any card to configure & order
          </span>
        </div>
      </div>

      {/* 3. MAIN PROTEIN CARDS GRID */}
      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-10 space-y-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filteredProteins.map((protein) => {
            const isSelected = selectedProteinId === protein.id;
            return (
              <div
                key={protein.id}
                onClick={() => setSelectedProteinId(protein.id)}
                className={`group relative rounded-2xl p-4 sm:p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden ${
                  isSelected
                    ? "bg-[#18181f] border-2 border-amber-500/70 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                    : "bg-[#121216] border border-white/[0.08] hover:border-white/20 hover:bg-[#15151a]"
                }`}
              >
                <div className="space-y-3">
                  <div className="relative h-44 w-full rounded-xl overflow-hidden border border-white/[0.08]">
                    <img
                      src={protein.dishImage}
                      alt={protein.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    <div className="absolute top-2 inset-x-2 flex items-center justify-between">
                      {protein.halal ? (
                        <span className="rounded-full bg-emerald-950/90 border border-emerald-500/50 px-2 py-0.5 text-[0.62rem] font-medium text-emerald-400 backdrop-blur-md flex items-center gap-1">
                          <Shield className="h-3 w-3" /> Halal
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-950/90 border border-amber-500/50 px-2 py-0.5 text-[0.62rem] font-medium text-amber-300 backdrop-blur-md flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Specialty
                        </span>
                      )}

                      <span className="rounded-full bg-black/70 border border-white/10 px-2 py-0.5 text-[0.62rem] font-medium text-zinc-300 backdrop-blur-md">
                        {protein.serves}
                      </span>
                    </div>

                    {isSelected && (
                      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[0.65rem] font-semibold text-zinc-950 shadow-md">
                        <Check className="h-3 w-3 stroke-[3]" />
                        <span>Selected</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-[0.65rem] font-medium text-amber-400 uppercase tracking-wider block">
                      {protein.tagline}
                    </span>
                    <h3 className={`font-display text-base font-semibold mt-0.5 ${isSelected ? "text-amber-300" : "text-zinc-100 group-hover:text-amber-400"} transition-colors`}>
                      {protein.name}
                    </h3>
                  </div>

                  <div className="space-y-1 text-[0.7rem] text-zinc-400 bg-[#18181f] rounded-xl p-2.5 border border-white/[0.06] font-normal">
                    <p className="flex items-center gap-1.5 text-zinc-300 font-medium">
                      <Scale className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>{protein.meatWeight}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-zinc-400">
                      <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                      <span>{protein.marinationTime}</span>
                    </p>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 font-normal">
                    {protein.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {protein.flavorProfile.map((tag, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-white/[0.04] border border-white/[0.06] px-1.5 py-0.5 text-[0.62rem] text-zinc-400 font-normal"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-[0.68rem] text-zinc-400 font-normal">
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          protein.stockStatus === "limited" ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                      />
                      <span>{protein.availability}</span>
                    </span>
                    <span>Feeds 4–5</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[0.62rem] text-zinc-500 uppercase tracking-wider block">Price / Handi Tray</span>
                      <p className="font-display text-lg font-semibold text-amber-400">
                        {formatMoney(protein.basePrice)}
                      </p>
                    </div>

                    <button
                      type="button"
                      className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-amber-500 text-zinc-950 font-semibold"
                          : "bg-[#18181f] border border-white/10 text-zinc-300 hover:bg-[#22222a]"
                      }`}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 4. ACTIVE PROTEIN ORDER CONFIGURATOR */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <UtensilsCrossed className="h-3.5 w-3.5" />
                <span>Customizing Cut</span>
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-semibold text-zinc-100">
                {currentProtein.name} Handi Tray
              </h2>
              <p className="text-xs text-zinc-400 font-normal">
                {currentProtein.meatWeight} • 1.0 kg Aged Basmati • 2 Boiled Eggs • Cashews • Raita • Salan • Dessert
              </p>
            </div>

            <div className="flex items-center gap-2.5 bg-[#18181f] border border-white/[0.06] rounded-xl p-2.5 shrink-0">
              <div className="rounded-lg bg-emerald-950/60 p-1.5 text-emerald-400 border border-emerald-500/30">
                <Shield className="h-4 w-4" />
              </div>
              <div className="text-left text-xs font-normal">
                <p className="font-medium text-zinc-200">{currentProtein.halal ? "100% Zabiha Halal Certified" : "Dedicated Separate Pot"}</p>
                <p className="text-[0.68rem] text-zinc-400">{currentProtein.halalCert}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Column 1: Flavor & Spice */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-zinc-300">
                1. Select Spice Intensity:
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "mild", label: "Mild", desc: "Aromatic" },
                  { id: "medium", label: "Medium", desc: "Balanced" },
                  { id: "extra", label: "Extra 🔥", desc: "Chili kick" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSpiceLevel(s.id as any)}
                    className={`rounded-xl p-2.5 text-center border transition-all ${
                      spiceLevel === s.id
                        ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold"
                        : "bg-[#18181f] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <p className="text-xs">{s.label}</p>
                    <p className="text-[0.62rem] text-zinc-500 mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between rounded-xl bg-[#18181f] border border-white/[0.06] p-3 mt-2">
                <div>
                  <Label htmlFor="protein-aloo" className="text-xs font-medium text-zinc-200 cursor-pointer">
                    🥔 Add Royal Dum Aloo
                  </Label>
                  <p className="text-[0.68rem] text-emerald-400 mt-0.5 font-medium">
                    100% Free ($0.00) Included
                  </p>
                </div>
                <Switch id="protein-aloo" checked={addAloo} onCheckedChange={setAddAloo} />
              </div>
            </div>

            {/* Column 2: Quantity & Notes */}
            <div className="space-y-3">
              <Label className="text-xs font-medium text-zinc-300">
                2. Number of Handi Trays:
              </Label>

              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-xl border border-white/[0.08] bg-[#18181f] text-zinc-200 p-1">
                  <button
                    type="button"
                    onClick={() => setTrayQty((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 flex items-center justify-center text-sm text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] rounded-lg transition-colors"
                  >
                    −
                  </button>
                  <span className="w-10 text-center text-sm font-medium text-zinc-100">{trayQty}</span>
                  <button
                    type="button"
                    onClick={() => setTrayQty((q) => q + 1)}
                    className="h-8 w-8 flex items-center justify-center text-sm text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.06] rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs text-zinc-400 font-normal">
                  Feeds approx. <strong className="text-zinc-200 font-medium">{trayQty * 4}–{trayQty * 5} Adults</strong>
                </span>
              </div>

              <div className="space-y-1.5 pt-1">
                <Label className="text-xs font-medium text-zinc-400">
                  Kitchen Notes (Optional):
                </Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Extra salan, well-done meat, deliver at 5:00 PM"
                  rows={2}
                  className="bg-[#18181f] border-white/[0.08] text-zinc-200 placeholder:text-zinc-500 text-xs rounded-xl focus:border-amber-500/50"
                />
              </div>
            </div>

            {/* Column 3: Summary & CTA */}
            <div className="space-y-3 rounded-xl bg-[#18181f] border border-white/[0.06] p-4 flex flex-col justify-between">
              <div className="space-y-2 text-xs font-normal">
                <div className="flex justify-between text-zinc-400">
                  <span>Selected Cut:</span>
                  <span className="text-zinc-200 font-medium">{currentProtein.name}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Portion ({trayQty} Trays):</span>
                  <span className="text-amber-400 font-medium">{(1.7 * trayQty).toFixed(1)} kg Protein</span>
                </div>
                {addAloo && (
                  <div className="flex justify-between text-zinc-400">
                    <span>Royal Dum Aloo:</span>
                    <span className="text-emerald-400 font-medium">Free ($0.00)</span>
                  </div>
                )}
                <div className="pt-2 border-t border-white/[0.08] flex items-baseline justify-between">
                  <span className="font-medium text-zinc-200">Order Total:</span>
                  <span className="font-display text-xl font-semibold text-amber-400">
                    {formatMoney(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button
                  onClick={handleAddToCart}
                  className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs py-4 shadow-md transition-colors gap-1.5"
                >
                  <Plus className="h-4 w-4" /> Add to Order · {formatMoney(totalPrice)}
                </Button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 p-2 text-xs font-medium text-emerald-400 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Order on WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 5. SIDE-BY-SIDE PROTEIN COMPARISON */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 shadow-xl space-y-4">
          <div className="border-b border-white/[0.08] pb-3">
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Culinary Specs</span>
            <h3 className="font-display text-lg font-semibold text-zinc-100 mt-0.5">
              Protein Comparison & Dietary Standards
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-normal">
              <thead>
                <tr className="border-b border-white/[0.08] text-zinc-400 uppercase tracking-wider text-[0.65rem]">
                  <th className="pb-2.5 font-medium">Protein Cut</th>
                  <th className="pb-2.5 font-medium">Halal Standard</th>
                  <th className="pb-2.5 font-medium">Meat Weight</th>
                  <th className="pb-2.5 font-medium">Marination Duration</th>
                  <th className="pb-2.5 font-medium">Dum Style</th>
                  <th className="pb-2.5 font-medium">Price / Tray</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-zinc-300">
                {PROTEINS_DATA.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelectedProteinId(p.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedProteinId === p.id ? "bg-white/[0.04]" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="py-3 font-medium text-zinc-100 flex items-center gap-2">
                      <img src={p.dishImage} alt={p.name} className="h-7 w-7 rounded-lg object-cover" />
                      <span>{p.name}</span>
                    </td>
                    <td className="py-3">
                      {p.halal ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium text-[0.68rem]">
                          <Shield className="h-3 w-3" /> 100% Zabiha Halal
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-300 font-medium text-[0.68rem]">
                          Dedicated Pot
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-amber-400">{p.meatWeight}</td>
                    <td className="py-3 text-zinc-400">{p.marinationTime}</td>
                    <td className="py-3 text-zinc-400">4-Hour Sealed Dough Dum</td>
                    <td className="py-3 font-semibold text-amber-400">
                      {formatMoney(p.basePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* 6. FLOATING CHECKOUT PILL */}
      {count > 0 && (
        <div className="fixed bottom-6 inset-x-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom-5 duration-300">
          <Button
            asChild
            className="w-full rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs py-3.5 shadow-xl flex items-center justify-between px-4 transition-transform"
          >
            <Link to="/checkout">
              <span className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-zinc-950 text-amber-400 text-xs font-semibold">
                  {count}
                </span>
                <span>{count === 1 ? "1 Handi Tray in Cart" : `${count} Handi Trays in Cart`}</span>
              </span>
              <span className="flex items-center gap-1 font-semibold text-xs uppercase tracking-wider">
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
