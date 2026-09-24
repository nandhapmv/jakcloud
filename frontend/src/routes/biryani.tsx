import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Sparkles,
  Shield,
  UtensilsCrossed,
  Flame,
  Star,
  Plus,
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
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Eye,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCart, unitPriceFor } from "@/lib/cart";
import { useDynamicMenu } from "@/lib/store";
import {
  BUSINESS,
  formatDate,
  nextAvailableDate,
  formatMoney,
  ALOO_CHARGE,
  MENU,
  type MenuItem,
  type ProteinId,
} from "@/lib/menu";

export const Route = createFileRoute("/biryani")({
  head: () => ({
    meta: [
      { title: "Biryani Selection — JAKLOUD Spice King Dum Biryani" },
      {
        name: "description",
        content:
          "Explore our handcrafted Made To Order Dum Biryani varieties in Springfield, MO. Royal Chicken, Hyderabadi Mutton, Slow-Braised Beef, Pork, Shahi Paneer, and King Prawns.",
      },
      { property: "og:title", content: "Biryani Selection — JAKLOUD Dum Biryani" },
      {
        property: "og:description",
        content: "Authentic slow-cooked Dum Biryani Handi trays serving 4–5 adults with 1.6–1.8 kg protein.",
      },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: BiryaniSelectionPage,
});

interface BiryaniCardData extends MenuItem {
  image: string;
  spiceDefault: "mild" | "medium" | "extra";
  spiceRating: number; // 1 to 3
  isHalal: boolean;
  dietaryBadge: string;
  badgeColor: string;
  meatWeight: string;
  riceWeight: string;
  serves: string;
  highlightNotes: string[];
}

const BIRYANI_CARDS: BiryaniCardData[] = [
  {
    id: "chicken",
    name: "Royal Chicken Dum Biryani",
    category: "Signature Trays",
    price: 101.99,
    priceWithAloo: 108.99,
    note: "Chef's Classic Signature",
    description:
      "Marinated bone-in chicken thighs layered in aged Kashmiri saffron basmati rice, pure desi ghee, caramelized onions (birista), and whole roasted Hyderabadi spices. Sealed on dum with whole wheat dough.",
    kcal: 1714,
    kcalAloo: 1871,
    image: chickenImg,
    spiceDefault: "medium",
    spiceRating: 2,
    isHalal: true,
    dietaryBadge: "100% Zabiha Halal",
    badgeColor: "bg-emerald-950/80 border-emerald-500/50 text-emerald-400",
    meatWeight: "1.6 – 1.8 kg Chicken",
    riceWeight: "1.0 kg Aged Basmati",
    serves: "4 – 5 Adults",
    highlightNotes: [
      "Bone-in succulent thigh cuts",
      "Kashmiri saffron & desi ghee",
      "Includes 2 eggs, raita, salan & dessert",
    ],
  },
  {
    id: "mutton",
    name: "Hyderabadi Shahi Mutton Dum",
    category: "Premium & Occasion",
    price: 157.99,
    priceWithAloo: 164.99,
    note: "Royal Nizami Feast",
    description:
      "The crown jewel of Nizam banquets. Tender baby goat cuts slow-braised for 4 hours with crushed green cardamom, cloves, cinnamon bark, mint leaves, and roasted cashew paste.",
    kcal: 2054,
    kcalAloo: 2211,
    image: muttonImg,
    spiceDefault: "medium",
    spiceRating: 2,
    isHalal: true,
    dietaryBadge: "100% Zabiha Halal",
    badgeColor: "bg-emerald-950/80 border-emerald-500/50 text-emerald-400",
    meatWeight: "1.6 – 1.8 kg Baby Goat",
    riceWeight: "1.0 kg Aged Basmati",
    serves: "4 – 5 Adults",
    highlightNotes: [
      "Fall-apart tender mutton cuts",
      "4-Hour slow coal-style Dum",
      "Includes 2 eggs, raita, salan & dessert",
    ],
  },
  {
    id: "beef",
    name: "Slow-Braised Spiced Beef Dum",
    category: "Signature Trays",
    price: 122.99,
    priceWithAloo: 129.99,
    note: "Bold & Hearty Flavor",
    description:
      "Prime tender beef cuts slow-cooked low and slow so rich caramelized meat juices thoroughly infuse into every single grain of long-grain basmati rice. Robust, hearty, and aromatic.",
    kcal: 1952,
    kcalAloo: 2109,
    image: rawBeefImg,
    spiceDefault: "extra",
    spiceRating: 3,
    isHalal: true,
    dietaryBadge: "100% Zabiha Halal",
    badgeColor: "bg-emerald-950/80 border-emerald-500/50 text-emerald-400",
    meatWeight: "1.6 – 1.8 kg Prime Beef",
    riceWeight: "1.0 kg Aged Basmati",
    serves: "4 – 5 Adults",
    highlightNotes: [
      "Rich caramelized spice glaze",
      "Bold & hearty meat texture",
      "Includes 2 eggs, raita, salan & dessert",
    ],
  },
  {
    id: "pork",
    name: "Springfield Signature Pork Dum",
    category: "Signature Trays",
    price: 108.99,
    priceWithAloo: 115.99,
    note: "Ozarks Fusion Special",
    description:
      "A Springfield culinary innovation. Tender pork shoulder slow-simmered with crushed roasted coriander, cumin, ginger, and desi ghee, topped with crisp golden shallots and fresh mint.",
    kcal: 1952,
    kcalAloo: 2109,
    image: rawPorkImg,
    spiceDefault: "medium",
    spiceRating: 2,
    isHalal: false,
    dietaryBadge: "Chef Specialty Cut",
    badgeColor: "bg-amber-950/80 border-amber-500/50 text-amber-300",
    meatWeight: "1.6 – 1.8 kg Pork Shoulder",
    riceWeight: "1.0 kg Aged Basmati",
    serves: "4 – 5 Adults",
    highlightNotes: [
      "Dedicated separate cooking vessel",
      "Deep savory masala infusion",
      "Includes 2 eggs, raita, salan & dessert",
    ],
  },
  {
    id: "paneer",
    name: "Royal Shahi Paneer Dum (Veg)",
    category: "Vegetarian Royal",
    price: 98.99,
    priceWithAloo: 105.99,
    note: "Vegetarian Delicacy",
    description:
      "Fresh golden artisan paneer cubes slow-simmered in saffron yogurt marinade, baby potatoes, roasted whole cashews, fresh mint, and caramelized onions layered in fragrant basmati.",
    kcal: 1540,
    kcalAloo: 1697,
    image: paneerImg,
    spiceDefault: "mild",
    spiceRating: 1,
    isHalal: true,
    dietaryBadge: "100% Pure Vegetarian",
    badgeColor: "bg-teal-950/80 border-teal-500/50 text-teal-300",
    meatWeight: "1.4 kg Fresh Royal Paneer",
    riceWeight: "1.0 kg Aged Basmati",
    serves: "4 – 5 Adults",
    highlightNotes: [
      "Artisan fresh milk paneer",
      "Aromatic saffron cream infusion",
      "Includes raita, salan & dessert",
    ],
  },
  {
    id: "prawn",
    name: "Jumbo King Tiger Prawn Dum",
    category: "Seafood Specialty",
    price: 139.99,
    priceWithAloo: 146.99,
    note: "Coastal Saffron Special",
    description:
      "Succulent ocean king tiger prawns tossed in coastal roasted spices, lemon juice, turmeric, and garlic, gently steamed over saffron basmati so seafood juices remain juicy and tender.",
    kcal: 1620,
    kcalAloo: 1777,
    image: prawnImg,
    spiceDefault: "medium",
    spiceRating: 2,
    isHalal: true,
    dietaryBadge: "Seafood Prime",
    badgeColor: "bg-sky-950/80 border-sky-500/50 text-sky-300",
    meatWeight: "1.4 – 1.5 kg Jumbo Prawns",
    riceWeight: "1.0 kg Aged Basmati",
    serves: "4 – 5 Adults",
    highlightNotes: [
      "Wild-caught jumbo tiger prawns",
      "Delicate coastal lemon & ghee dum",
      "Includes 2 eggs, raita, salan & dessert",
    ],
  },
];

export function BiryaniSelectionPage() {
  const nextDate = formatDate(nextAvailableDate());
  const { count } = useCart();
  const { items: dynamicMenuItems } = useDynamicMenu();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [spiceFilter, setSpiceFilter] = useState<string>("all");
  const [activeDishModal, setActiveDishModal] = useState<BiryaniCardData | null>(null);

  // Merge static presets with live dynamic catalog from store
  const allBiryaniCards: (BiryaniCardData & { available: boolean })[] = useMemo(() => {
    return dynamicMenuItems.map((dyn) => {
      const preset = BIRYANI_CARDS.find(
        (p) => p.id === dyn.proteinId || p.name.toLowerCase() === dyn.name.toLowerCase(),
      );

      return {
        id: (dyn.proteinId || dyn.id) as ProteinId,
        name: dyn.name,
        category: dyn.category,
        price: dyn.price,
        priceWithAloo: dyn.priceWithAloo,
        note: dyn.badge || preset?.note || "House Specialty",
        description: dyn.description,
        kcal: dyn.kcal,
        kcalAloo: dyn.kcalAloo || dyn.kcal + 157,
        image: dyn.image || preset?.image || chickenImg,
        spiceDefault: (dyn.spiciness === "Extra Spicy" ? "extra" : dyn.spiciness === "Mild" ? "mild" : "medium") as any,
        spiceRating: dyn.spiciness === "Extra Spicy" ? 3 : dyn.spiciness === "Mild" ? 1 : 2,
        isHalal: dyn.isHalalCertified !== false,
        dietaryBadge: dyn.isHalalCertified !== false ? "100% Zabiha Halal" : "Chef Specialty Cut",
        badgeColor:
          dyn.isHalalCertified !== false
            ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-400"
            : "bg-amber-950/80 border-amber-500/50 text-amber-300",
        meatWeight: dyn.meatWeight || preset?.meatWeight || "1.6 – 1.8 kg Protein",
        riceWeight: dyn.riceWeight || preset?.riceWeight || "1.0 kg Aged Basmati",
        serves: dyn.traySize || preset?.serves || "4 – 5 Adults",
        highlightNotes: preset?.highlightNotes || [
          "Sealed on Dum with whole wheat dough",
          "Aged long-grain basmati & desi ghee",
          "Includes 2 eggs, raita, salan & dessert",
        ],
        available: dyn.available !== false,
      };
    });
  }, [dynamicMenuItems]);

  // Filtered Biryani List
  const filteredBiryanis = useMemo(() => {
    return allBiryaniCards.filter((item) => {
      // Category filter
      if (selectedCategory === "halal" && !item.isHalal) return false;
      if (selectedCategory === "signature" && item.category !== "Signature Trays") return false;
      if (selectedCategory === "premium" && item.category !== "Royal & Occasion" && item.category !== "Premium & Occasion") return false;
      if (selectedCategory === "veg-seafood" && item.category !== "Shahi Vegetarian" && item.category !== "Seafood Specialties" && item.category !== "Vegetarian Royal" && item.category !== "Seafood Specialty")
        return false;

      // Spice filter
      if (spiceFilter === "mild" && item.spiceRating !== 1) return false;
      if (spiceFilter === "medium" && item.spiceRating !== 2) return false;
      if (spiceFilter === "extra" && item.spiceRating !== 3) return false;

      // Search Query
      if (
        searchQuery.trim() &&
        !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [allBiryaniCards, selectedCategory, spiceFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold relative overflow-hidden pb-24">
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO HEADER BANNER                                         */}
      {/* ------------------------------------------------------------- */}
      <section className="relative border-b border-gold/20 bg-gradient-to-r from-[#170f0a] via-[#24150d] to-[#170f0a] py-14 px-4 sm:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-black/80 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/60 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-gold shadow-[0_0_20px_rgba(212,160,23,0.3)]">
            <Sparkles className="h-3.5 w-3.5 text-gold animate-pulse" />
            <span>Master Chef Nizam Recipes</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide text-cream">
            Authentic <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">Dum Biryani</span> Selection
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-cream/80 leading-relaxed">
            Slow-cooked in dough-sealed handi vessels over gentle flame. Every single tray generously serves 4–5 adults with 1.6–1.8 kg protein, 1 kg aged basmati, boiled eggs, roasted cashews, raita, salan, and dessert.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-black/60 px-4 py-1.5 text-xs text-cream/90 shadow-md">
              <Calendar className="h-3.5 w-3.5 text-gold" />
              <span>Next Handi Batch: <strong className="text-gold">{nextDate}</strong></span>
              <span className="text-gold/40">•</span>
              <span className="text-saffron font-semibold">2:00 PM Cutoff</span>
            </div>

            <Link
              to="/trays"
              className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-gold/15 hover:bg-gold/25 px-4 py-1.5 text-xs font-bold text-gold transition-all"
            >
              <span>Need Catering or 2+ Trays? View Tray Sizing</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. FILTER & SEARCH CONTROL BAR                                */}
      {/* ------------------------------------------------------------- */}
      <section className="sticky top-16 z-30 border-b border-gold/20 bg-[#0d0906]/95 backdrop-blur-xl py-4 shadow-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: "all", label: "All Biryanis (6)" },
              { id: "halal", label: "100% Zabiha Halal" },
              { id: "signature", label: "Signature Trays" },
              { id: "premium", label: "Royal Occasion" },
              { id: "veg-seafood", label: "Veg & Seafood" },
            ].map((tab) => {
              const isSelected = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-gradient-to-r from-chili/80 to-gold/80 text-white border-gold shadow-md font-bold"
                      : "bg-black/50 border-gold/15 text-cream/70 hover:bg-gold/15 hover:text-gold"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search & Spice Filter */}
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gold/60" />
              <input
                type="text"
                placeholder="Search biryani cuts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-black/60 border border-gold/20 pl-8 pr-3 py-1.5 text-xs text-cream placeholder:text-cream/40 focus:border-gold outline-none"
              />
            </div>

            {/* Spice Selector */}
            <select
              value={spiceFilter}
              onChange={(e) => setSpiceFilter(e.target.value)}
              className="rounded-xl bg-black/60 border border-gold/20 px-3 py-1.5 text-xs text-gold focus:border-gold outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#120c08] text-cream">Spice: All</option>
              <option value="mild" className="bg-[#120c08] text-cream">Mild (1 🌶️)</option>
              <option value="medium" className="bg-[#120c08] text-cream">Medium (2 🌶️)</option>
              <option value="extra" className="bg-[#120c08] text-cream">Extra Spicy (3 🌶️)</option>
            </select>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. LARGE LUXURY BIRYANI CARDS GRID                            */}
      {/* ------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-12 space-y-12">
        {filteredBiryanis.length === 0 ? (
          <div className="rounded-3xl border border-gold/25 bg-[#120c08] p-12 text-center space-y-4">
            <UtensilsCrossed className="h-10 w-10 text-gold mx-auto opacity-60" />
            <h3 className="font-display text-xl font-bold text-cream">No Biryani Found</h3>
            <p className="text-xs text-cream/70 max-w-sm mx-auto">
              No biryani matches your search or filter selection. Try resetting filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("all");
                setSpiceFilter("all");
                setSearchQuery("");
              }}
              className="border-gold/40 text-gold hover:bg-gold/15 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredBiryanis.map((dish) => (
              <BiryaniSelectionCard
                key={dish.id}
                dish={dish}
                onOpenDetails={() => setActiveDishModal(dish)}
              />
            ))}
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 4. PATRON QUALITY GUARANTEES & ALLERGEN STRIP                 */}
        {/* ------------------------------------------------------------- */}
        <section className="rounded-3xl border border-gold/30 bg-gradient-to-br from-[#170f0a] via-[#120c08] to-[#0a0705] p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">Uncompromising Quality</span>
              <h3 className="font-display text-2xl font-bold text-cream">The Royal Dum Pukht Standard</h3>
            </div>
            <div className="inline-flex items-center gap-2 rounded-xl bg-black/60 border border-gold/30 px-3.5 py-1.5 text-xs text-gold">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>100% Zabiha Halal Certified Facility</span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 text-xs text-cream/80">
            <div className="space-y-1.5">
              <p className="font-bold text-gold flex items-center gap-1.5">
                <Users className="h-4 w-4 text-gold" /> Generous Portion Guarantee
              </p>
              <p className="text-cream/70 text-[0.72rem] leading-relaxed">
                Every tray contains 1.6–1.8 kg of meat + 1 kg aged basmati rice, comfortably feeding 4 to 5 adults.
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="font-bold text-gold flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-chili" /> 4-Hour Sealed Dough Dum
              </p>
              <p className="text-cream/70 text-[0.72rem] leading-relaxed">
                Vessels are sealed with traditional dough to infuse natural aromatics and meat juices without opening.
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="font-bold text-gold flex items-center gap-1.5">
                <Store className="h-4 w-4 text-emerald-400" /> Dedicated Separate Pots
              </p>
              <p className="text-cream/70 text-[0.72rem] leading-relaxed">
                Dedicated vessels and preparation zones are strictly maintained for Halal, vegetarian, and specialty dishes.
              </p>
            </div>

            <div className="space-y-1.5">
              <p className="font-bold text-gold flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-saffron" /> Springfield Pickup & Delivery
              </p>
              <p className="text-cream/70 text-[0.72rem] leading-relaxed">
                Hot counter pickup at 3625 S Bedford Ave or flat $10 doorstep delivery within 10 miles of 65809.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 5. QUICK-VIEW DETAILS DIALOG                                  */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={!!activeDishModal} onOpenChange={(open) => !open && setActiveDishModal(null)}>
        <DialogContent className="border-gold/30 bg-[#120c08] text-cream sm:max-w-xl p-0 overflow-hidden">
          {activeDishModal && (
            <div>
              <div className="relative h-64 w-full">
                <img
                  src={activeDishModal.image}
                  alt={activeDishModal.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120c08] via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className={`rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider border backdrop-blur-md ${activeDishModal.badgeColor}`}>
                    {activeDishModal.dietaryBadge}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div>
                  <span className="text-[0.68rem] uppercase tracking-widest text-gold font-bold">
                    {activeDishModal.note}
                  </span>
                  <DialogTitle className="font-display text-2xl font-bold text-cream mt-0.5">
                    {activeDishModal.name}
                  </DialogTitle>
                </div>

                <DialogDescription className="text-cream/80 text-xs leading-relaxed">
                  {activeDishModal.description}
                </DialogDescription>

                <div className="rounded-2xl bg-black/50 border border-gold/20 p-3.5 space-y-2">
                  <p className="font-bold text-gold text-[0.72rem] uppercase tracking-wider">Tray Specifications:</p>
                  <div className="grid grid-cols-2 gap-2 text-[0.7rem] text-cream/80">
                    <span>• Feeds: {activeDishModal.serves}</span>
                    <span>• Meat: {activeDishModal.meatWeight}</span>
                    <span>• Rice: {activeDishModal.riceWeight}</span>
                    <span>• Energy: ~{activeDishModal.kcal.toLocaleString()} kcal/serving</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-gold/15">
                  <div>
                    <span className="text-[0.65rem] text-cream/50 uppercase tracking-wider">Price / Handi Tray</span>
                    <p className="font-display text-2xl font-bold text-gold">
                      {formatMoney(activeDishModal.price)}
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveDishModal(null)}
                    className="bg-gold text-black hover:bg-gold/90 font-bold text-xs"
                  >
                    Close Preview
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 6. FLOATING CART CHECKOUT PILL                                */}
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
                <span>{count === 1 ? "1 Handi Tray in Order" : `${count} Handi Trays in Order`}</span>
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

// =========================================================================
// INDIVIDUAL BIRYANI CARD COMPONENT WITH MODIFIERS
// =========================================================================
function BiryaniSelectionCard({
  dish,
  onOpenDetails,
}: {
  dish: BiryaniCardData & { available?: boolean };
  onOpenDetails: () => void;
}) {
  const { addLine } = useCart();
  const [aloo, setAloo] = useState(false);
  const [spiceIntensity, setSpiceIntensity] = useState<"mild" | "medium" | "extra">(dish.spiceDefault);
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const price = dish.price ? (aloo ? (dish.priceWithAloo || dish.price + 7) : dish.price) : unitPriceFor(dish.id, aloo);
  const isAvailable = dish.available !== false;

  const renderSpiceFlames = (rating: number) => {
    return Array.from({ length: 3 }).map((_, i) => (
      <Flame
        key={i}
        className={`h-3.5 w-3.5 ${
          i < rating ? "text-chili fill-chili" : "text-cream/20"
        }`}
      />
    ));
  };

  return (
    <article className={`overflow-hidden rounded-3xl border bg-[#140e09]/95 text-cream shadow-2xl backdrop-blur-xl transition-all duration-500 flex flex-col justify-between group ${
      isAvailable ? "border-gold/25 hover:border-gold/70 hover:shadow-[0_0_30px_rgba(212,175,55,0.25)]" : "border-red-900/40 opacity-75"
    }`}>
      <div>
        {/* Large Food Photography with Hover Zoom */}
        <div className="relative overflow-hidden h-60 w-full cursor-pointer" onClick={onOpenDetails}>
          <img
            src={dish.image}
            alt={dish.name}
            className={`h-full w-full object-cover transition-transform duration-700 ${isAvailable ? "group-hover:scale-110" : "filter grayscale-[50%]"}`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140e09] via-[#140e09]/30 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
            <span
              className={`rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider border backdrop-blur-md shadow-lg ${dish.badgeColor}`}
            >
              {dish.dietaryBadge}
            </span>

            {isAvailable ? (
              <span className="rounded-full bg-black/75 border border-gold/40 px-2.5 py-1 text-[0.65rem] font-bold text-gold backdrop-blur-md">
                {dish.serves}
              </span>
            ) : (
              <span className="rounded-full bg-red-950/90 border border-red-500 px-2.5 py-1 text-[0.65rem] font-bold text-red-300 backdrop-blur-md animate-pulse">
                Sold Out Today
              </span>
            )}
          </div>

          {/* Quick Inspect Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 border border-gold/30 text-gold opacity-0 group-hover:opacity-100 transition-opacity"
            title="Inspect Details"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Bottom Title Bar Overlay */}
          <div className="absolute bottom-2 left-4 right-4 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gold/90">{dish.note}</span>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-cream group-hover:text-gold transition-colors truncate">
                {dish.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 text-xs">
          <p className="text-cream/75 leading-relaxed line-clamp-3 text-xs">{dish.description}</p>

          {/* Specifications & Spice Indicator */}
          <div className="flex items-center justify-between pt-1 border-t border-gold/15 text-[0.7rem]">
            <div className="flex items-center gap-1 text-gold font-medium">
              <Scale className="h-3.5 w-3.5" />
              <span>{dish.meatWeight}</span>
            </div>

            <div className="flex items-center gap-1.5" title={`Spice Level: ${dish.spiceDefault}`}>
              <span className="text-[0.65rem] uppercase tracking-wider text-cream/60">Spice:</span>
              <div className="flex items-center">{renderSpiceFlames(dish.spiceRating)}</div>
            </div>
          </div>

          {/* Highlight Bullets */}
          <div className="rounded-2xl bg-black/40 border border-gold/15 p-3 space-y-1 text-[0.68rem] text-cream/70">
            {dish.highlightNotes.map((note, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-gold shrink-0" />
                <span>{note}</span>
              </div>
            ))}
          </div>

          {/* Customization Accordion */}
          {isAvailable && (
            <div className="space-y-3 rounded-2xl bg-black/50 border border-gold/20 p-3.5">
              {/* Aloo Switch */}
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={`biryani-aloo-${dish.id}`} className="text-xs text-cream/90 flex items-center gap-1.5 cursor-pointer">
                  <span>Add Slow-Steamed Baby Aloo</span>
                  <span className="text-gold font-semibold">(+{formatMoney(ALOO_CHARGE)})</span>
                </Label>
                <Switch id={`biryani-aloo-${dish.id}`} checked={aloo} onCheckedChange={setAloo} />
              </div>

              {/* Spice Intensity Selector */}
              <div className="pt-2 border-t border-gold/15 space-y-1.5">
                <Label className="text-[0.68rem] uppercase tracking-wider text-gold font-bold">
                  Adjust Spice Profile:
                </Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: "mild", label: "Mild" },
                    { id: "medium", label: "Medium" },
                    { id: "extra", label: "Extra 🔥" },
                  ].map((sp) => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => setSpiceIntensity(sp.id as any)}
                      className={`rounded-lg py-1 text-[0.68rem] font-bold border transition-all ${
                        spiceIntensity === sp.id
                          ? "bg-chili/30 border-chili text-amber-200"
                          : "bg-black/40 border-gold/15 text-cream/60 hover:text-cream"
                      }`}
                    >
                      {sp.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              {isExpanded && (
                <div className="pt-2 border-t border-gold/15 space-y-1">
                  <Label className="text-[0.65rem] text-cream/60">Special Instructions:</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. less oil, extra mint leaves"
                    rows={2}
                    className="bg-black/60 border-gold/20 text-cream text-xs rounded-xl focus:border-gold"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[0.65rem] text-gold/80 hover:underline font-semibold block text-right"
              >
                {isExpanded ? "− Hide Special Instructions" : "+ Add Special Instructions"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 sm:p-6 pt-0 space-y-3">
        {/* Pricing Label */}
        <div className="flex items-baseline justify-between">
          <span className="text-[0.65rem] text-cream/50 uppercase tracking-wider">Starting Price / Tray</span>
          <p className="font-display text-2xl font-bold text-gold drop-shadow-md">
            {formatMoney(price * qty)}
          </p>
        </div>

        {isAvailable ? (
          <div className="flex items-center gap-2.5">
            {/* Quantity Stepper */}
            <div className="flex items-center rounded-2xl border border-gold/30 bg-black/60 text-cream">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2 text-base text-gold hover:bg-gold/20 rounded-l-2xl transition-colors"
                aria-label="Decrease trays"
              >
                −
              </button>
              <span className="w-7 text-center text-xs font-bold text-cream">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-2 text-base text-gold hover:bg-gold/20 rounded-r-2xl transition-colors"
                aria-label="Increase trays"
              >
                +
              </button>
            </div>

            {/* Add to Order Button */}
            <Button
              className="flex-1 rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs sm:text-sm py-5 shadow-lg shadow-chili/30 hover:scale-[1.02] transition-all gap-1.5"
              onClick={() => {
                const fullNotes = [
                  `Spice: ${spiceIntensity.toUpperCase()}`,
                  notes ? `Note: ${notes}` : "",
                ]
                  .filter(Boolean)
                  .join(" | ");

                addLine({
                  proteinId: dish.id,
                  name: dish.name,
                  aloo,
                  extraSpicy: spiceIntensity === "extra",
                  notes: fullNotes,
                  qty,
                  unitPrice: price,
                });
                toast.success(`${qty} × ${dish.name} added to your Handi Order!`);
                setQty(1);
              }}
            >
              <Plus className="h-4 w-4" /> Add to Order · {formatMoney(price * qty)}
            </Button>
          </div>
        ) : (
          <Button
            disabled
            className="w-full rounded-2xl bg-zinc-900 border border-zinc-700 text-cream/40 font-bold text-xs py-5 cursor-not-allowed"
          >
            Sold Out for Today's Handi Batch
          </Button>
        )}
      </div>
    </article>
  );
}
