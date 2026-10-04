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
  const { count } = useCart();
  const { items: dynamicMenuItems } = useDynamicMenu();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [spiceFilter, setSpiceFilter] = useState<string>("all");
  const [activeDishModal, setActiveDishModal] = useState<BiryaniCardData | null>(null);

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
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-200 selection:bg-amber-500/20 selection:text-amber-300 relative overflow-hidden pb-24">
      {/* 1. HERO HEADER BANNER */}
      <section className="relative border-b border-white/[0.08] bg-[#121216] py-12 px-4 sm:px-8 text-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-300">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Nizam Dum Pukht Recipes</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100">
            Handcrafted <span className="text-amber-400">Dum Biryani</span> Menu
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
            Slow-cooked in dough-sealed handi vessels over gentle flame. Every single tray generously serves 4–5 adults with 1.6–1.8 kg protein, 1 kg aged basmati, boiled eggs, roasted cashews, raita, salan, and dessert.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#18181f] px-3.5 py-1.5 text-xs text-zinc-300">
              <Calendar className="h-3.5 w-3.5 text-amber-400" />
              <span>Next Handi Batch: <strong className="text-amber-300 font-medium">{nextDate}</strong></span>
              <span className="text-zinc-600">•</span>
              <span className="text-amber-400/90 font-medium">2:00 PM Cutoff</span>
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
        <div className="mx-auto max-w-7xl px-4 sm:px-8 flex flex-col md:flex-row md:items-center justify-between gap-3">
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
      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-10 space-y-10">
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
                onOpenDetails={() => setActiveDishModal(dish)}
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

      {/* 5. QUICK-VIEW DETAILS DIALOG */}
      <Dialog open={!!activeDishModal} onOpenChange={(open) => !open && setActiveDishModal(null)}>
        <DialogContent className="border-white/10 bg-[#121216] text-zinc-200 sm:max-w-lg p-0 overflow-hidden rounded-2xl">
          {activeDishModal && (
            <div>
              <div className="relative h-56 w-full">
                <img
                  src={activeDishModal.image}
                  alt={activeDishModal.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-transparent to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-medium uppercase tracking-wider border backdrop-blur-md ${activeDishModal.badgeColor}`}>
                    {activeDishModal.dietaryBadge}
                  </span>
                </div>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <div>
                  <span className="text-[0.65rem] uppercase tracking-wider text-amber-400 font-medium">
                    {activeDishModal.note}
                  </span>
                  <DialogTitle className="font-display text-xl font-semibold text-zinc-100 mt-0.5">
                    {activeDishModal.name}
                  </DialogTitle>
                </div>

                <DialogDescription className="text-zinc-400 text-xs leading-relaxed font-normal">
                  {activeDishModal.description}
                </DialogDescription>

                <div className="rounded-xl bg-[#18181f] border border-white/[0.06] p-3 space-y-1.5">
                  <p className="font-medium text-zinc-300 text-[0.72rem]">Tray Specifications:</p>
                  <div className="grid grid-cols-2 gap-1.5 text-[0.7rem] text-zinc-400 font-normal">
                    <span>• Feeds: {activeDishModal.serves}</span>
                    <span>• Meat: {activeDishModal.meatWeight}</span>
                    <span>• Rice: {activeDishModal.riceWeight}</span>
                    <span>• Energy: ~{activeDishModal.kcal.toLocaleString()} kcal/serving</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-white/[0.08]">
                  <div>
                    <span className="text-[0.62rem] text-zinc-500 uppercase tracking-wider block">Price / Handi Tray</span>
                    <p className="font-display text-xl font-semibold text-amber-400">
                      {formatMoney(activeDishModal.price)}
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveDishModal(null)}
                    className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium text-xs rounded-xl"
                  >
                    Close Preview
                  </Button>
                </div>
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
  const { addLine } = useCart();
  const [aloo, setAloo] = useState(false);
  const [spiceIntensity, setSpiceIntensity] = useState<"mild" | "medium" | "extra">(dish.spiceDefault);
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const price = dish.price; // Royal Dum Aloo is 100% Free ($0.00)
  const isAvailable = dish.available !== false;

  const renderSpiceFlames = (rating: number) => {
    return Array.from({ length: 3 }).map((_, i) => (
      <Flame
        key={i}
        className={`h-3 w-3 ${
          i < rating ? "text-amber-400 fill-amber-400" : "text-zinc-600"
        }`}
      />
    ));
  };

  return (
    <article className={`overflow-hidden rounded-2xl border bg-[#121216] text-zinc-200 shadow-xl transition-all duration-200 flex flex-col justify-between group ${
      isAvailable ? "border-white/[0.08] hover:border-white/20 hover:bg-[#15151a]" : "border-red-900/30 opacity-75"
    }`}>
      <div>
        <div className="relative overflow-hidden h-52 w-full cursor-pointer" onClick={onOpenDetails}>
          <img
            src={dish.image}
            alt={dish.name}
            className={`h-full w-full object-cover transition-transform duration-300 ${isAvailable ? "group-hover:scale-105" : "filter grayscale-[50%]"}`}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/30 to-transparent" />

          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none">
            <span
              className={`rounded-full px-2.5 py-0.5 text-[0.62rem] font-medium uppercase tracking-wider border backdrop-blur-md shadow-md ${dish.badgeColor}`}
            >
              {dish.dietaryBadge}
            </span>

            {isAvailable ? (
              <span className="rounded-full bg-black/70 border border-white/10 px-2 py-0.5 text-[0.62rem] font-medium text-zinc-300 backdrop-blur-md">
                {dish.serves}
              </span>
            ) : (
              <span className="rounded-full bg-red-950/90 border border-red-500 px-2 py-0.5 text-[0.62rem] font-medium text-red-300 backdrop-blur-md">
                Sold Out Today
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails();
            }}
            className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 border border-white/10 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Inspect Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[0.62rem] font-medium text-amber-400 uppercase tracking-wider">{dish.note}</span>
              <h3 className="font-display text-base sm:text-lg font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors truncate">
                {dish.name}
              </h3>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3 text-xs">
          <p className="text-zinc-400 leading-relaxed line-clamp-2 text-xs font-normal">{dish.description}</p>

          <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[0.7rem] font-normal">
            <div className="flex items-center gap-1 text-zinc-300 font-medium">
              <Scale className="h-3 w-3 text-amber-400" />
              <span>{dish.meatWeight}</span>
            </div>

            <div className="flex items-center gap-1" title={`Spice Level: ${dish.spiceDefault}`}>
              <span className="text-[0.62rem] text-zinc-400 uppercase tracking-wider">Spice:</span>
              <div className="flex items-center">{renderSpiceFlames(dish.spiceRating)}</div>
            </div>
          </div>

          <div className="rounded-xl bg-[#18181f] border border-white/[0.06] p-2.5 space-y-1 text-[0.68rem] text-zinc-400 font-normal">
            {dish.highlightNotes.map((note, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <Check className="h-3 w-3 text-amber-400 shrink-0" />
                <span>{note}</span>
              </div>
            ))}
          </div>

          {isAvailable && (
            <div className="space-y-2 rounded-xl bg-[#18181f] border border-white/[0.06] p-3">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor={`biryani-aloo-${dish.id}`} className="text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer font-normal">
                  <span>🥔 Add Royal Dum Aloo</span>
                  <span className="text-emerald-400 font-semibold text-[0.65rem] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">100% Free</span>
                </Label>
                <Switch id={`biryani-aloo-${dish.id}`} checked={aloo} onCheckedChange={setAloo} />
              </div>

              <div className="pt-2 border-t border-white/[0.06] space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[0.62rem] uppercase tracking-wider text-zinc-400 font-medium">
                    Spice Preference:
                  </Label>
                  <span className="text-[0.62rem] text-amber-400/90 font-mono">Select 1</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSpiceIntensity("extra")}
                    className={`rounded-lg py-1.5 px-2 text-[0.7rem] font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      spiceIntensity === "extra"
                        ? "bg-rose-500/15 border-rose-500 text-rose-200 ring-1 ring-rose-500/50 font-semibold"
                        : "bg-[#121216] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Flame className="h-3.5 w-3.5 text-rose-400" />
                    <span>🌶️ Spicy</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSpiceIntensity("mild")}
                    className={`rounded-lg py-1.5 px-2 text-[0.7rem] font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      spiceIntensity === "mild"
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50 font-semibold"
                        : "bg-[#121216] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span>🌿 No Spicy (Mild)</span>
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="pt-2 border-t border-white/[0.06] space-y-1">
                  <Label className="text-[0.62rem] text-zinc-400">Special Instructions:</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. less oil, extra mint leaves"
                    rows={2}
                    className="bg-[#121216] border-white/[0.08] text-zinc-200 text-xs rounded-xl focus:border-amber-500/50"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[0.62rem] text-zinc-400 hover:text-amber-300 font-normal block text-right"
              >
                {isExpanded ? "− Hide Special Instructions" : "+ Add Special Instructions"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 sm:p-5 pt-0 space-y-2.5">
        <div className="flex items-baseline justify-between">
          <span className="text-[0.62rem] text-zinc-500 uppercase tracking-wider">Price / Tray</span>
          <p className="font-display text-lg font-semibold text-amber-400">
            {formatMoney(price * qty)}
          </p>
        </div>

        {isAvailable ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-xl border border-white/[0.08] bg-[#18181f] text-zinc-200">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 rounded-l-xl transition-colors"
                aria-label="Decrease trays"
              >
                −
              </button>
              <span className="w-6 text-center text-xs font-medium text-zinc-100">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-zinc-100 rounded-r-xl transition-colors"
                aria-label="Increase trays"
              >
                +
              </button>
            </div>

            <Button
              className="flex-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs py-4 shadow-md transition-colors gap-1.5"
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
              <Plus className="h-3.5 w-3.5" /> Add · {formatMoney(price * qty)}
            </Button>
          </div>
        ) : (
          <Button
            disabled
            className="w-full rounded-xl bg-[#18181f] border border-white/[0.06] text-zinc-500 font-medium text-xs py-4 cursor-not-allowed"
          >
            Sold Out for Today
          </Button>
        )}
      </div>
    </article>
  );
}
