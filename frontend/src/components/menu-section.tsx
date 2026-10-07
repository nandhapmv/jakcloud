import { useState, useMemo } from "react";
import { Plus, Minus, Check, Flame, Sparkles, Shield, X } from "lucide-react";
import { toast } from "sonner";

import heroImg from "@/assets/hero-biryani.jpg";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCart } from "@/lib/cart";
import { formatMoney, MENU, type ProteinId } from "@/lib/menu";
import { useDynamicMenu, useKitchenSettings } from "@/lib/store";

const DISH_IMAGES: Record<string, string> = {
  chicken: chickenImg,
  mutton: muttonImg,
  beef: rawBeefImg,
  pork: rawPorkImg,
  paneer: paneerImg,
  prawn: prawnImg,
  seafood: prawnImg,
};

const PROTEIN_FLYER_DATA: Record<
  string,
  {
    flyerName: string;
    meatDesc: string;
    halal: boolean;
    badge: string;
  }
> = {
  chicken: {
    flyerName: "Chicken",
    meatDesc: "1.6 – 1.8 kg Halal Marinated Chicken",
    halal: true,
    badge: "Popular",
  },
  mutton: {
    flyerName: "Mutton",
    meatDesc: "1.8 kg Halal Baby Goat Cuts",
    halal: true,
    badge: "Royal Feast",
  },
  beef: {
    flyerName: "Beef",
    meatDesc: "1.7 kg Halal Prime Beef Cuts",
    halal: true,
    badge: "Hearty",
  },
  pork: {
    flyerName: "Pork",
    meatDesc: "1.6 kg Springfield Signature Pork Shoulder",
    halal: false,
    badge: "House Special",
  },
  paneer: {
    flyerName: "Paneer (Veg)",
    meatDesc: "1.2 kg Fresh Malai Paneer Cubes",
    halal: false,
    badge: "Vegetarian Royal",
  },
  prawn: {
    flyerName: "Seafood",
    meatDesc: "1.5 kg Wild Jumbo King Tiger Prawns",
    halal: true,
    badge: "Coastal Dum",
  },
};

export function MenuSection() {
  const { lines, addLine, setQty } = useCart();
  const { items: dynamicItems } = useDynamicMenu();
  const { settings } = useKitchenSettings();

  // Customizer modal state
  const [activeDish, setActiveDish] = useState<{
    id: ProteinId;
    name: string;
    price: number;
    description: string;
    image: string;
    meatDesc: string;
    halal: boolean;
  } | null>(null);

  const [modalAloo, setModalAloo] = useState(true);
  const [modalExtraSpicy, setModalExtraSpicy] = useState(false);
  const [modalNotes, setModalNotes] = useState("");
  const [modalQty, setModalQty] = useState(1);

  // Standardize menu items
  const menuList = useMemo(() => {
    const source = dynamicItems && dynamicItems.length > 0 ? dynamicItems : MENU;
    return source.map((item) => {
      const pId = ((item as any).proteinId || item.id || "chicken").replace(/^dish-/, "") as ProteinId;
      const flyer = PROTEIN_FLYER_DATA[pId] || {
        flyerName: item.name,
        meatDesc: (item as any).meatWeight || item.description,
        halal: (item as any).isHalalCertified !== false && pId !== "pork",
        badge: "Handi Dum",
      };

      return {
        id: pId,
        dishId: item.id,
        name: item.name,
        price: item.price,
        description: item.description,
        available: (item as any).available !== false,
        image: (item as any).image || DISH_IMAGES[pId] || chickenImg,
        flyerName: flyer.flyerName,
        meatDesc: (item as any).meatWeight || flyer.meatDesc,
        halal: flyer.halal,
        badge: (item as any).badge || flyer.badge,
      };
    });
  }, [dynamicItems]);

  const getProteinCartCount = (proteinId: string) => {
    return lines
      .filter((l) => l.proteinId === proteinId || l.proteinId === `dish-${proteinId}`)
      .reduce((sum, l) => sum + l.qty, 0);
  };

  const handleOpenCustomizer = (dish: (typeof menuList)[0]) => {
    setActiveDish(dish);
    setModalAloo(true);
    setModalExtraSpicy(false);
    setModalNotes("");
    setModalQty(1);
  };

  const handleUpdateProteinQty = (dish: (typeof menuList)[0], delta: number) => {
    const existing = lines.find(
      (l) => l.proteinId === dish.id || l.proteinId === `dish-${dish.id}`,
    );
    if (!existing) {
      if (delta > 0) handleOpenCustomizer(dish);
      return;
    }
    const newQty = existing.qty + delta;
    if (newQty <= 0) {
      setQty(existing.key, 0);
    } else {
      setQty(existing.key, newQty);
    }
  };

  const handleConfirmAddToCart = () => {
    if (!activeDish) return;
    addLine({
      proteinId: activeDish.id,
      name: activeDish.name,
      aloo: modalAloo,
      extraSpicy: modalExtraSpicy,
      notes: modalNotes.trim(),
      qty: modalQty,
      unitPrice: activeDish.price,
    });

    toast.success(`${modalQty} × ${activeDish.name} added to your Handi Order!`);
    setActiveDish(null);
  };

  return (
    <section id="menu" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-6">
      {/* Left-Aligned Section Header */}
      <div className="text-left space-y-1 max-w-2xl">
        <span className="text-xs uppercase tracking-wider text-amber-400 font-medium">
          Made To Order · Springfield, MO
        </span>
        <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-100">
          Select Your Handi Tray
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 font-normal">
          Each Handi Tray serves 4–5 adults comfortably with 1.6–1.8 kg protein and aged basmati.
        </p>
      </div>

      {/* Clean 6-Dish Responsive Card Grid (Matching Mobile App View exactly) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {menuList.map((dish) => {
          const totalCartCount = getProteinCartCount(dish.id);

          return (
            <div
              key={dish.id}
              className={`rounded-2xl bg-[#121216] border p-3.5 sm:p-4 shadow-sm transition-all flex flex-col justify-between group ${
                !dish.available
                  ? "opacity-60 border-white/[0.05]"
                  : "border-white/[0.08] hover:border-amber-500/30"
              }`}
            >
              {/* Top Row: Thumbnail + Info */}
              <div className="flex gap-3.5">
                {/* Food Image */}
                <div
                  onClick={() => dish.available && handleOpenCustomizer(dish)}
                  className={`relative h-20 w-20 sm:h-22 sm:w-22 shrink-0 overflow-hidden rounded-xl bg-black border border-white/[0.06] ${
                    dish.available ? "cursor-pointer group" : "cursor-not-allowed"
                  }`}
                >
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className={`h-full w-full object-cover transition-transform duration-300 ${
                      dish.available ? "group-hover:scale-105" : "grayscale"
                    }`}
                    loading="lazy"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-semibold text-amber-400">
                      {dish.flyerName}
                    </span>
                    {dish.halal ? (
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-medium px-2 py-0.5">
                        100% Halal
                      </span>
                    ) : (
                      <span className="rounded bg-zinc-800 border border-white/10 text-zinc-300 text-[9px] font-medium px-2 py-0.5">
                        {dish.badge}
                      </span>
                    )}
                  </div>

                  <h3
                    onClick={() => dish.available && handleOpenCustomizer(dish)}
                    className={`text-xs sm:text-sm font-semibold text-zinc-100 truncate mt-0.5 transition-colors ${
                      dish.available ? "hover:text-amber-300 cursor-pointer" : "cursor-not-allowed"
                    }`}
                  >
                    {dish.name}
                  </h3>

                  <p className="text-[10px] sm:text-[11px] text-zinc-400 line-clamp-1 mt-0.5 font-normal">
                    {dish.meatDesc}
                  </p>

                  {/* Price */}
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs sm:text-sm font-semibold text-amber-400 font-mono">
                      {formatMoney(dish.price)}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-normal">
                      • Serves 4–5
                    </span>
                    {!dish.available && (
                      <span className="text-[9px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded px-1.5 py-0.5 ml-1">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Row: In Cart Count + Add Tray Button */}
              <div className="flex items-center justify-between gap-2 border-t border-white/[0.05] pt-2.5 mt-2.5">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-zinc-400 text-[11px] font-normal">In Cart:</span>
                  <span className="font-mono font-medium text-amber-400 text-xs">
                    {totalCartCount > 0 ? `${totalCartCount} Tray${totalCartCount > 1 ? "s" : ""}` : "0"}
                  </span>
                </div>

                {!dish.available ? (
                  <div className="rounded-lg bg-zinc-800/80 border border-white/5 text-zinc-500 px-3 py-1.5 text-xs font-medium ml-auto">
                    Sold Out
                  </div>
                ) : totalCartCount === 0 ? (
                  <button
                    type="button"
                    onClick={() => handleOpenCustomizer(dish)}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 px-3 py-1.5 text-xs font-semibold hover:bg-amber-500/25 active:scale-95 transition-all ml-auto cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Tray</span>
                  </button>
                ) : (
                  <div className="flex items-center rounded-lg border border-white/10 bg-zinc-900/80 p-0.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => handleUpdateProteinQty(dish, -1)}
                      className="h-6 w-6 flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors active:scale-95 cursor-pointer"
                      title="Decrease quantity"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-medium text-zinc-100 font-mono">
                      {totalCartCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenCustomizer(dish)}
                      className="h-6 w-6 flex items-center justify-center text-amber-400 hover:text-amber-300 hover:bg-zinc-800 rounded transition-colors active:scale-95 cursor-pointer"
                      title="Add customized tray"
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

      {/* Handcrafted Batch Guarantee Banner */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 text-xs text-zinc-300 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-zinc-100 font-semibold text-sm">
          <Shield className="h-4 w-4 text-emerald-400" />
          <span>Handcrafted Batch Guarantee</span>
        </div>
        <p className="text-zinc-400 font-normal leading-relaxed">
          Every Handi Tray includes slow-simmered Dum Biryani layered with aged saffron basmati, pure desi ghee, boiled eggs,
          roasted cashews, crispy fried onions (birista), fresh mint, house Mirchi Ka Salan gravy, and raita.
        </p>
        <div className="grid gap-3 sm:grid-cols-3 pt-2 text-[11px] text-zinc-400 border-t border-white/[0.06] font-normal">
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>100% Zabiha Halal Certified Meats</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>Serves 4–5 Adults (1.6–1.8kg Meat)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-zinc-300 shrink-0" />
            <span>Flat $10 Delivery in Springfield Metro</span>
          </div>
        </div>
      </div>

      {/* Sleek Customization Dialog Modal (Exact same as Mobile view) */}
      <Dialog open={!!activeDish} onOpenChange={(open) => !open && setActiveDish(null)}>
        <DialogContent className="border-white/10 bg-[#121216] text-zinc-100 sm:max-w-md p-5 rounded-2xl">
          {activeDish && (
            <div className="space-y-4">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <img
                    src={activeDish.image}
                    alt={activeDish.name}
                    className="h-14 w-14 rounded-xl object-cover border border-white/10"
                  />
                  <div>
                    <DialogTitle className="text-base font-semibold text-zinc-100">
                      {activeDish.name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-zinc-400 font-normal">
                      Handi Party Tray · Serves 4–5 adults
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              {/* Options */}
              <div className="space-y-3 pt-1">
                {/* 1. Choose Dum Aloo */}
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

                {/* 2. Choose Spice Preference */}
                <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-zinc-950 text-[10px] font-bold">2</span>
                      <span>Spice Preference</span>
                    </label>
                    <span className="text-[10px] text-amber-400/90 font-mono">Choose 1</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
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

                {/* 3. Chef Notes */}
                <div className="pt-1 border-t border-white/[0.05]">
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Special Instructions / Notes (Optional)
                  </label>
                  <textarea
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="e.g. Less oil, extra lemons, separate garnishes"
                    rows={2}
                    className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 text-xs text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-amber-400 font-normal"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10">
                <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900/80 p-0.5">
                  <button
                    type="button"
                    onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                    className="h-8 w-8 flex items-center justify-center text-zinc-400 hover:text-zinc-100 rounded transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-xs font-semibold text-zinc-100 font-mono">
                    {modalQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => setModalQty((q) => q + 1)}
                    className="h-8 w-8 flex items-center justify-center text-amber-400 hover:text-amber-300 rounded transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                <Button
                  onClick={handleConfirmAddToCart}
                  className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs py-2.5 h-10 shadow-md hover:brightness-105 transition-all"
                >
                  Add to Order · {formatMoney(activeDish.price * modalQty)}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
