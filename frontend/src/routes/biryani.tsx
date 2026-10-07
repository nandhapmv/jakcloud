import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Sparkles,
  Shield,
  UtensilsCrossed,
  Calendar,
  Users,
  Scale,
  Plus,
  Minus,
  Check,
  ChevronRight,
  Flame,
  Search,
  Eye,
  ArrowRight,
  Store,
  Truck,
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
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useCart, unitPriceFor } from "@/lib/cart";
import { useDynamicMenu } from "@/lib/store";
import {
  formatDate,
  nextAvailableDate,
  formatMoney,
  ALOO_CHARGE,
  type ProteinId,
} from "@/lib/menu";

export const Route = createFileRoute("/biryani")({
  head: () => ({
    meta: [
      { title: "Dum Biryani Handi Selection — JAKLOUD Spice King" },
      {
        name: "description",
        content:
          "Explore handcrafted Dum Biryani Handi Trays in Springfield, MO. 100% Zabiha Halal Chicken, Hyderabadi Mutton, Prime Beef, Paneer, Prawn, and Signature Pork.",
      },
      { property: "og:title", content: "Dum Biryani Handi Selection — JAKLOUD" },
      {
        property: "og:description",
        content: "Authentic Dum Pukht biryani cooked fresh daily with 1.6–1.8 kg protein and aged basmati.",
      },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: BiryaniSelectionPage,
});

export interface BiryaniCardData {
  id: ProteinId;
  name: string;
  category: "Signature Trays" | "Royal & Occasion" | "Shahi Vegetarian" | "Seafood Specialties" | string;
  price: number;
  priceWithAloo: number;
  note: string;
  description: string;
  kcal: number;
  kcalAloo: number;
  image: string;
  spiceDefault: "mild" | "medium" | "extra";
  spiceRating: number;
  isHalal: boolean;
  dietaryBadge: string;
  badgeColor: string;
  meatWeight: string;
  riceWeight: string;
  serves: string;
  highlightNotes: string[];
}

export const BIRYANI_CARDS: BiryaniCardData[] = [
  {
    id: "chicken",
    name: "Royal Chicken Dum Biryani",
    category: "Signature Trays",
    price: 101.99,
    priceWithAloo: 101.99,
    note: "Chef's Signature Recipe",
    description:
      "Tender bone-in chicken thighs marinated overnight in Kashmiri saffron, crushed green cardamom, and hand-beaten yogurt, layered in aged basmati rice and slow-steamed under a dough seal.",
    kcal: 1714,
    kcalAloo: 1871,
    image: chickenImg,
    spiceDefault: "medium",
    spiceRating: 2,
    isHalal: true,
    dietaryBadge: "100% Zabiha Halal",
    badgeColor: "bg-emerald-950/80 border-emerald-500/50 text-emerald-400",
    meatWeight: "1.6 – 1.8 kg Marinated Chicken",
    riceWeight: "1.0 kg Aged Basmati",
    serves: "4 – 5 Adults",
    highlightNotes: [
      "Bone-in thigh & leg cuts",
      "Overnight yogurt & saffron marinade",
      "Includes 2 eggs, raita, salan & dessert",
    ],
  },
  {
    id: "mutton",
    name: "Hyderabadi Shahi Mutton Dum",
    category: "Royal & Occasion",
    price: 157.99,
    priceWithAloo: 157.99,
    note: "Nizami Celebration Banquet",
    description:
      "Select cuts of baby goat slow-braised in pure desi ghee, crushed black pepper, toasted cloves, and caramelized shallots. Fall-apart tenderness infused deeply into aromatic saffron basmati.",
    kcal: 2054,
    kcalAloo: 2211,
    image: muttonImg,
    spiceDefault: "medium",
    spiceRating: 2,
    isHalal: true,
    dietaryBadge: "100% Zabiha Halal",
    badgeColor: "bg-emerald-950/80 border-emerald-500/50 text-emerald-400",
    meatWeight: "1.6 – 1.8 kg Tender Baby Goat",
    riceWeight: "1.0 kg Aged Basmati",
    serves: "4 – 5 Adults",
    highlightNotes: [
      "Select baby goat shoulder & ribs",
      "Pure desi ghee & roasted spices",
      "Includes 2 eggs, raita, salan & dessert",
    ],
  },
  {
    id: "beef",
    name: "Slow-Braised Spiced Beef Dum",
    category: "Royal & Occasion",
    price: 122.99,
    priceWithAloo: 122.99,
    note: "Rich Caramelized Meat Jus",
    description:
      "Prime beef chuck and brisket cuts marinated in roasted whole spices, fried onions, and ginger-garlic paste, slow-cooked low and slow so the rich braising juices seep into every grain.",
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
      "Prime marbled beef cuts",
      "Bold peppery caramelized masala",
      "Includes 2 eggs, raita, salan & dessert",
    ],
  },
  {
    id: "pork",
    name: "Springfield Signature Pork Dum",
    category: "Signature Trays",
    price: 108.99,
    priceWithAloo: 108.99,
    note: "Ozarks Specialty Craft",
    description:
      "Succulent pork shoulder simmered with roasted coriander, whole spices, and desi ghee in a strictly separate, dedicated cooking vessel. Finished with fresh mint and crisp fried onions.",
    kcal: 1952,
    kcalAloo: 2109,
    image: rawPorkImg,
    spiceDefault: "medium",
    spiceRating: 2,
    isHalal: false,
    dietaryBadge: "Chef Specialty Vessel",
    badgeColor: "bg-amber-950/80 border-amber-500/50 text-amber-300",
    meatWeight: "1.6 – 1.8 kg Pork Shoulder",
    riceWeight: "1.0 kg Aged Basmati",
    serves: "4 – 5 Adults",
    highlightNotes: [
      "Strictly separate preparation pot",
      "Roasted coriander & garlic profile",
      "Includes 2 eggs, raita, salan & dessert",
    ],
  },
  {
    id: "paneer",
    name: "Royal Shahi Paneer Dum (Veg)",
    category: "Shahi Vegetarian",
    price: 98.99,
    priceWithAloo: 98.99,
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
    category: "Seafood Specialties",
    price: 139.99,
    priceWithAloo: 139.99,
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
  const { count, addLine } = useCart();
  const { items: dynamicMenuItems } = useDynamicMenu();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [spiceFilter, setSpiceFilter] = useState<string>("all");
  const [activeDishModal, setActiveDishModal] = useState<BiryaniCardData | null>(null);

  const [modalAloo, setModalAloo] = useState(true);
  const [modalSpice, setModalSpice] = useState<"extra" | "mild">("mild");
  const [modalNotes, setModalNotes] = useState("");
  const [modalQty, setModalQty] = useState(1);

  const handleOpenDishModal = (dish: BiryaniCardData) => {
    setActiveDishModal(dish);
    setModalAloo(true);
    setModalSpice(dish.spiceDefault === "extra" ? "extra" : "mild");
    setModalNotes("");
    setModalQty(1);
  };

  const handleModalAddToCart = () => {
    if (!activeDishModal) return;
    const fullNotes = [
      `Spice: ${modalSpice === "extra" ? "SPICY" : "MILD"}`,
      modalNotes.trim() ? `Note: ${modalNotes.trim()}` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    addLine({
      proteinId: activeDishModal.id,
      name: activeDishModal.name,
      aloo: modalAloo,
      extraSpicy: modalSpice === "extra",
      notes: fullNotes,
      qty: modalQty,
      unitPrice: activeDishModal.price,
    });
    toast.success(`${modalQty} × ${activeDishModal.name} added to your Handi Order!`);
    setActiveDishModal(null);
  };

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

  const filteredBiryanis = useMemo(() => {
    return allBiryaniCards.filter((item) => {
      if (selectedCategory === "halal" && !item.isHalal) return false;
      if (selectedCategory === "signature" && item.category !== "Signature Trays") return false;
      if (selectedCategory === "premium" && item.category !== "Royal & Occasion" && item.category !== "Premium & Occasion") return false;
      if (selectedCategory === "veg-seafood" && item.category !== "Shahi Vegetarian" && item.category !== "Seafood Specialties" && item.category !== "Vegetarian Royal" && item.category !== "Seafood Specialty")
        return false;

      if (spiceFilter === "mild" && item.spiceRating !== 1) return false;
      if (spiceFilter === "medium" && item.spiceRating !== 2) return false;
      if (spiceFilter === "extra" && item.spiceRating !== 3) return false;

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
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-200 selection:bg-amber-500/20 selection:text-amber-300 relative overflow-hidden pb-20">
      {/* 1. HERO HEADER BANNER */}
      <section className="relative border-b border-white/[0.08] bg-[#121216] py-8 sm:py-10 px-4 sm:px-6 lg:px-8 text-left overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl space-y-2.5">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Nizam Dum Pukht Recipes</span>
          </div>

          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100">
            Handcrafted <span className="text-amber-400">Dum Biryani</span> Menu
          </h1>

          <p className="max-w-2xl text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
            Slow-cooked in dough-sealed handi vessels over gentle flame. Every single tray generously serves 4–5 adults with 1.6–1.8 kg protein, 1 kg aged basmati, boiled eggs, roasted cashews, raita, salan, and dessert.
          </p>

          <div className="flex flex-wrap items-center justify-start gap-3 pt-1">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#18181f] px-3.5 py-1.5 text-xs text-zinc-300">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>Next Handi Batch: <strong className="text-amber-300 font-medium">{nextDate}</strong></span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400/90 font-medium">3:00 PM Cutoff</span>
            </div>

            <Link
              to="/trays"
              className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3.5 py-1.5 text-xs font-medium text-amber-300 transition-colors"
            >
              <span>Need Catering or 2+ Trays? View Tray Sizing</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. FILTER & SEARCH CONTROL BAR */}
      <section className="sticky top-16 z-30 border-b border-white/[0.08] bg-[#121216]/90 backdrop-blur-xl py-3 shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
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
                  className={`rounded-xl px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold"
                      : "bg-[#18181f] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-52">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Search biryani cuts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-[#18181f] border border-white/[0.08] pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-amber-500/50 outline-none"
              />
            </div>

            <select
              value={spiceFilter}
              onChange={(e) => setSpiceFilter(e.target.value)}
              className="rounded-xl bg-[#18181f] border border-white/[0.08] px-2.5 py-1.5 text-xs text-amber-300 focus:border-amber-500/50 outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#121216] text-zinc-200">Spice: All</option>
              <option value="mild" className="bg-[#121216] text-zinc-200">Mild (1 🌶️)</option>
              <option value="medium" className="bg-[#121216] text-zinc-200">Medium (2 🌶️)</option>
              <option value="extra" className="bg-[#121216] text-zinc-200">Extra Spicy (3 🌶️)</option>
            </select>
          </div>
        </div>
      </section>

      {/* 3. BIRYANI CARDS GRID */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {filteredBiryanis.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-10 text-center space-y-3">
            <UtensilsCrossed className="h-8 w-8 text-amber-400 mx-auto opacity-60" />
            <h3 className="font-display text-lg font-semibold text-zinc-100">No Biryani Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto font-normal">
              No biryani matches your search or filter selection. Try resetting filters.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedCategory("all");
                setSpiceFilter("all");
                setSearchQuery("");
              }}
              className="border-white/10 text-zinc-300 hover:bg-white/[0.06] text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBiryanis.map((dish) => (
              <BiryaniSelectionCard
                key={dish.id}
                dish={dish}
                onOpenDetails={() => handleOpenDishModal(dish)}
              />
            ))}
          </div>
        )}

        {/* 4. QUALITY GUARANTEES */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-8 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Kitchen Standards</span>
              <h3 className="font-display text-xl font-semibold text-zinc-100">The Dum Pukht Method</h3>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 text-xs text-emerald-400 font-medium">
              <Shield className="h-3.5 w-3.5" />
              <span>100% Zabiha Halal Certified Facility</span>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 text-xs text-zinc-400 font-normal">
            <div className="space-y-1">
              <p className="font-medium text-zinc-200 flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5 text-amber-400" /> Generous Portion
              </p>
              <p className="text-zinc-400 text-[0.72rem] leading-relaxed">
                Every tray contains 1.6–1.8 kg of meat + 1 kg aged basmati rice, comfortably feeding 4 to 5 adults.
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-zinc-200 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-amber-400" /> 4-Hour Sealed Dough Dum
              </p>
              <p className="text-zinc-400 text-[0.72rem] leading-relaxed">
                Vessels are sealed with traditional dough to infuse natural aromatics and meat juices without opening.
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-zinc-200 flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-emerald-400" /> Dedicated Separate Pots
              </p>
              <p className="text-zinc-400 text-[0.72rem] leading-relaxed">
                Dedicated vessels and preparation zones are strictly maintained for Halal, vegetarian, and specialty dishes.
              </p>
            </div>

            <div className="space-y-1">
              <p className="font-medium text-zinc-200 flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-amber-400" /> Pickup & Delivery
              </p>
              <p className="text-zinc-400 text-[0.72rem] leading-relaxed">
                Hot counter pickup at 3625 S Bedford Ave or flat $10 doorstep delivery within 10 miles of 65809.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* 5. FULL LUXURY CUSTOMIZER & DETAILS DIALOG */}
      <Dialog open={!!activeDishModal} onOpenChange={(open) => !open && setActiveDishModal(null)}>
        <DialogContent className="border border-white/10 bg-[#121217] text-zinc-200 max-w-lg w-[95vw] p-0 overflow-hidden rounded-2xl shadow-2xl max-h-[92vh] flex flex-col">
          {activeDishModal && (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Scrollable Content */}
              <div className="overflow-y-auto flex-1 scrollbar-thin">
                {/* Hero Dish Image */}
                <div className="relative h-56 sm:h-64 w-full shrink-0">
                  <img
                    src={activeDishModal.image}
                    alt={activeDishModal.name}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-[#121217]/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border backdrop-blur-md ${activeDishModal.badgeColor}`}>
                      {activeDishModal.dietaryBadge}
                    </span>
                    <span className="rounded-full bg-black/70 border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-md">
                      {activeDishModal.serves}
                    </span>
                  </div>

                  {/* Note pill */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                      {activeDishModal.note}
                    </span>
                    <DialogTitle className="font-display text-xl sm:text-2xl font-bold text-zinc-100 drop-shadow">
                      {activeDishModal.name}
                    </DialogTitle>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-4 text-xs">
                  {/* Full Description */}
                  <DialogDescription className="text-zinc-300 text-xs sm:text-sm leading-relaxed font-normal">
                    {activeDishModal.description}
                  </DialogDescription>

                  {/* Handi Specs */}
                  <div className="rounded-xl bg-zinc-900/80 border border-white/[0.08] p-3 space-y-2">
                    <p className="font-semibold text-zinc-200 text-xs flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                      <span>Tray Feeds & Includes:</span>
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
                      <span>• Feeds: <strong className="text-zinc-200">{activeDishModal.serves}</strong></span>
                      <span>• Meat: <strong className="text-zinc-200">{activeDishModal.meatWeight}</strong></span>
                      <span>• Rice: <strong className="text-zinc-200">{activeDishModal.riceWeight}</strong></span>
                      <span>• Includes: <strong className="text-zinc-200">2 Eggs, Salan & Raita</strong></span>
                    </div>
                  </div>

                  {/* Customization 1: Dum Aloo */}
                  <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                        <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold">1</span>
                        <span>Royal Dum Aloo Option</span>
                      </label>
                      <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        100% Free
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setModalAloo(true)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          modalAloo
                            ? "bg-amber-500/15 border-amber-400 text-amber-200 ring-1 ring-amber-400/50"
                            : "bg-zinc-900/60 border-white/[0.08] text-zinc-400 hover:text-zinc-200"
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
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          !modalAloo
                            ? "bg-amber-500/15 border-amber-400 text-amber-200 ring-1 ring-amber-400/50"
                            : "bg-zinc-900/60 border-white/[0.08] text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-semibold text-zinc-100">🍚 No Aloo</span>
                          {!modalAloo && <Check className="h-3.5 w-3.5 text-amber-400 stroke-[3]" />}
                        </div>
                        <span className="text-[10px] text-zinc-400 mt-1">
                          Protein & Basmati only
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Customization 2: Spice Preference */}
                  <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                        <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold">2</span>
                        <span>Spice Preference</span>
                      </label>
                      <span className="text-[10px] text-amber-400/90 font-mono">Select 1</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setModalSpice("extra")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          modalSpice === "extra"
                            ? "bg-rose-500/15 border-rose-500 text-rose-200 ring-1 ring-rose-500/50"
                            : "bg-zinc-900/60 border-white/[0.08] text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-semibold text-zinc-100 flex items-center gap-1">
                            <Flame className="h-3.5 w-3.5 text-rose-400" />
                            <span>🌶️ Spicy</span>
                          </span>
                          {modalSpice === "extra" && <Check className="h-3.5 w-3.5 text-rose-400 stroke-[3]" />}
                        </div>
                        <span className="text-[10px] text-rose-300/80 mt-1">Authentic Dum Heat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalSpice("mild")}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          modalSpice === "mild"
                            ? "bg-emerald-500/15 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50"
                            : "bg-zinc-900/60 border-white/[0.08] text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-semibold text-zinc-100 flex items-center gap-1">
                            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                            <span>🌿 Mild (No Spicy)</span>
                          </span>
                          {modalSpice === "mild" && <Check className="h-3.5 w-3.5 text-emerald-400 stroke-[3]" />}
                        </div>
                        <span className="text-[10px] text-emerald-300/80 mt-1">Gentle & aromatic</span>
                      </button>
                    </div>
                  </div>

                  {/* Customization 3: Special Instructions */}
                  <div className="space-y-1.5 pt-1 border-t border-white/[0.06]">
                    <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 text-[10px] font-bold">3</span>
                      <span>Special Kitchen Instructions (Optional)</span>
                    </label>
                    <Textarea
                      value={modalNotes}
                      onChange={(e) => setModalNotes(e.target.value)}
                      placeholder="e.g. less oil, extra crispy fried onions, separate sauce containers..."
                      rows={2}
                      className="bg-zinc-900/80 border-white/[0.08] text-zinc-200 text-xs rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    />
                  </div>
                </div>
              </div>

              {/* Sticky Footer Action Bar */}
              <div className="p-3.5 sm:p-4 border-t border-white/[0.08] bg-[#121217] shrink-0 flex items-center gap-2.5 sm:gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center rounded-xl border border-white/[0.1] bg-zinc-900/90 text-zinc-200 shrink-0 h-11">
                  <button
                    type="button"
                    onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    className="w-8 h-full flex items-center justify-center text-base text-zinc-400 hover:text-zinc-100 rounded-l-xl transition-colors cursor-pointer active:scale-95"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-zinc-100">{modalQty}</span>
                  <button
                    type="button"
                    onClick={() => setModalQty((q) => q + 1)}
                    className="w-8 h-full flex items-center justify-center text-base text-zinc-400 hover:text-zinc-100 rounded-r-xl transition-colors cursor-pointer active:scale-95"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  type="button"
                  onClick={handleModalAddToCart}
                  className="min-w-0 flex-1 h-11 px-3 sm:px-4 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-zinc-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-between gap-1.5"
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    <Plus className="h-4 w-4 stroke-[3] shrink-0" />
                    <span className="hidden sm:inline font-bold">Add to Handi Tray</span>
                    <span className="sm:hidden font-bold">Add to Tray</span>
                  </span>
                  <span className="font-mono text-xs sm:text-sm shrink-0 bg-black/15 px-2 py-0.5 rounded-lg text-zinc-950">
                    {formatMoney(activeDishModal.price * modalQty)}
                  </span>
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 6. FLOATING CART CHECKOUT PILL */}
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
                <span>{count === 1 ? "1 Handi Tray in Order" : `${count} Handi Trays in Order`}</span>
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

function BiryaniSelectionCard({
  dish,
  onOpenDetails,
}: {
  dish: BiryaniCardData & { available?: boolean };
  onOpenDetails: () => void;
}) {
  const isAvailable = dish.available !== false;

  return (
    <article
      onClick={onOpenDetails}
      className={`overflow-hidden rounded-2xl border bg-[#121217] text-zinc-200 shadow-md transition-all duration-300 flex flex-col justify-between group cursor-pointer ${
        isAvailable
          ? "border-white/[0.08] hover:border-amber-400/40 hover:bg-[#16161d] hover:shadow-xl hover:-translate-y-1"
          : "border-red-900/30 opacity-70"
      }`}
    >
      <div>
        {/* Card Image */}
        <div className="relative overflow-hidden h-44 sm:h-48 w-full">
          <img
            src={dish.image}
            alt={dish.name}
            className={`h-full w-full object-cover transition-transform duration-500 ${
              isAvailable ? "group-hover:scale-105" : "grayscale"
            }`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121217] via-[#121217]/20 to-transparent" />

          {/* Top Badges */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider border backdrop-blur-md shadow-md ${dish.badgeColor}`}
            >
              {dish.dietaryBadge}
            </span>

            {isAvailable ? (
              <span className="rounded-full bg-black/75 border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-md">
                {dish.serves}
              </span>
            ) : (
              <span className="rounded-full bg-red-950/90 border border-red-500 px-2.5 py-0.5 text-[10px] font-medium text-red-300 backdrop-blur-md">
                Sold Out Today
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 space-y-2">
          <div>
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
              {dish.note}
            </span>
            <h3 className="font-display text-base sm:text-lg font-bold text-zinc-100 group-hover:text-amber-300 transition-colors line-clamp-1 mt-0.5">
              {dish.name}
            </h3>
          </div>

          <p className="text-zinc-400 text-xs line-clamp-2 leading-relaxed font-normal">
            {dish.description}
          </p>

          <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-400 font-medium">
            <span className="inline-flex items-center gap-1 text-zinc-300 bg-zinc-900/80 px-2 py-0.5 rounded-md border border-white/[0.06]">
              <Scale className="h-3 w-3 text-amber-400" />
              <span>{dish.meatWeight.split(" ")[0]} {dish.meatWeight.split(" ")[1]}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-zinc-300 bg-zinc-900/80 px-2 py-0.5 rounded-md border border-white/[0.06]">
              <Flame className="h-3 w-3 text-amber-400" />
              <span>{dish.spiceDefault === "extra" ? "Spicy" : "Medium"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 pt-0">
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">Price / Tray</span>
            <p className="font-display text-lg font-bold text-amber-300">
              {formatMoney(dish.price)}
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs px-3.5 py-2.5 shadow-md flex items-center gap-1.5 transition-all group-hover:scale-105 cursor-pointer"
          >
            <span>View & Customise</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
