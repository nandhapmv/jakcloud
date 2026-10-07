import { useState } from "react";
import { Flame, Plus, Shield, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

import heroImg from "@/assets/hero-biryani.jpg";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { formatMoney, type ProteinId } from "@/lib/menu";
import { useDynamicMenu, useKitchenSettings, type DynamicMenuItem } from "@/lib/store";

const DISH_IMAGES: Record<string, string> = {
  chicken: chickenImg,
  mutton: muttonImg,
  beef: rawBeefImg,
  pork: rawPorkImg,
};

export function MenuSection() {
  const { items: dynamicItems, categories } = useDynamicMenu();
  const { settings } = useKitchenSettings();

  // Distinct categories present in items
  const activeCategories = Array.from(new Set(dynamicItems.map((i) => i.category)));
  const displayCategories = activeCategories.length > 0 ? activeCategories : categories;

  return (
    <section id="menu" className="mx-auto max-w-7xl px-4 py-8">
      {displayCategories.map((category) => {
        const categoryItems = dynamicItems.filter((item) => item.category === category);
        if (categoryItems.length === 0) return null;

        return (
          <div key={category} className="mb-12 last:mb-0">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <h2 className="font-display text-2xl font-semibold text-zinc-100">{category}</h2>
              </div>
              <div className="gold-rule w-full" />
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {categoryItems.map((item) => (
                <MenuCard key={item.id} item={item} alooCharge={settings.alooCharge || 7} />
              ))}
            </div>
          </div>
        );
      })}

      <div className="mt-12 rounded-2xl border border-white/[0.08] bg-[#121216] p-6 text-xs text-zinc-300 shadow-sm space-y-3">
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
    </section>
  );
}

function MenuCard({ item, alooCharge }: { item: DynamicMenuItem; alooCharge: number }) {
  const { addLine } = useCart();
  const [aloo, setAloo] = useState(false);
  const [extraSpicy, setExtraSpicy] = useState(false);
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);

  const isAvailable = item.available !== false;
  const price = aloo ? (item.priceWithAloo || item.price + alooCharge) : item.price;
  const dishImage = item.image || DISH_IMAGES[item.proteinId || item.id] || heroImg;
  const isHalal = item.isHalalCertified !== false && item.proteinId !== "pork" && item.id !== "pork";

  return (
    <article className={`overflow-hidden rounded-2xl border bg-[#121216] text-zinc-100 shadow-sm transition-all flex flex-col justify-between group ${
      isAvailable ? "border-white/[0.08] hover:border-amber-500/30" : "border-rose-900/30 opacity-75"
    }`}>
      <div>
        <div className="relative overflow-hidden">
          <img
            src={dishImage}
            alt={item.name}
            className={`h-52 w-full object-cover transition-transform duration-500 ${isAvailable ? "group-hover:scale-105" : "grayscale"}`}
            loading="lazy"
            width={1600}
            height={1008}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#121216] via-[#121216]/40 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
            {isAvailable ? (
              isHalal ? (
                <span className="rounded-full bg-black/70 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-medium text-emerald-400 backdrop-blur-md flex items-center gap-1">
                  <Shield className="h-3 w-3" /> 100% Halal
                </span>
              ) : (
                <span className="rounded-full bg-black/70 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-medium text-amber-300 backdrop-blur-md flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> House Special
                </span>
              )
            ) : (
              <span className="rounded-full bg-rose-950/90 border border-rose-500/50 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 backdrop-blur-md">
                Sold Out Today
              </span>
            )}

            <span className="rounded-full bg-black/70 border border-white/10 px-2.5 py-0.5 text-[10px] font-medium text-zinc-300 backdrop-blur-md">
              {item.traySize || "Serves 4–5"}
            </span>
          </div>

          {/* Bottom Title & Price Bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <div className="min-w-0">
              <h3 className="truncate font-semibold text-lg text-zinc-100 group-hover:text-amber-300 transition-colors">
                {item.name}
              </h3>
              <p className="text-[11px] font-normal text-zinc-400">{item.badge || item.spiciness}</p>
            </div>
            <p className="shrink-0 font-semibold text-xl text-amber-400 font-mono">
              {formatMoney(price)}
            </p>
          </div>
        </div>

        <div className="space-y-3.5 p-5 text-xs">
          <p className="text-zinc-400 leading-relaxed font-normal">{item.description}</p>
          
          <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-normal">
            <span className="rounded-md bg-zinc-900 border border-white/[0.06] px-2 py-0.5">
              {item.meatWeight || "1.6 – 1.8 kg Marinated Meat"}
            </span>
            <span>•</span>
            <span className="rounded-md bg-zinc-900 border border-white/[0.06] px-2 py-0.5">
              {item.riceWeight || "1.0 kg Aged Basmati"}
            </span>
          </div>

          {/* Customization Options */}
          {isAvailable && (
            <div className="space-y-2.5 rounded-xl bg-zinc-900/50 border border-white/[0.05] p-3">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={`aloo-${item.id}`} className="text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer font-normal">
                  <span>Add Royal Dum Aloo</span>
                  <span className="text-amber-400 font-medium">(+{formatMoney(alooCharge)})</span>
                </Label>
                <Switch id={`aloo-${item.id}`} checked={aloo} onCheckedChange={setAloo} />
              </div>

              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={`spice-${item.id}`} className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer font-normal">
                  <Flame className="h-3.5 w-3.5 text-rose-400" />
                  <span>Extra Spicy Masala</span>
                  <span className="text-emerald-400 font-medium">(Free)</span>
                </Label>
                <Switch id={`spice-${item.id}`} checked={extraSpicy} onCheckedChange={setExtraSpicy} />
              </div>

              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Special instructions (e.g. less oil, extra raita)"
                rows={2}
                className="bg-zinc-900/80 border-white/10 text-zinc-100 placeholder:text-zinc-600 text-xs rounded-lg focus:border-amber-400 font-normal"
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 pt-0 flex items-center gap-3">
        {isAvailable ? (
          <>
            {/* Quantity Stepper */}
            <div className="flex items-center rounded-xl border border-white/10 bg-zinc-900/80 text-zinc-100">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                aria-label="Decrease trays"
              >
                −
              </button>
              <span className="w-6 text-center text-xs font-medium text-zinc-100 font-mono">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="px-3 py-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                aria-label="Increase trays"
              >
                +
              </button>
            </div>

            {/* Add to Cart CTA */}
            <Button
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold text-xs py-3 shadow-sm hover:brightness-105 transition-all gap-1.5 cursor-pointer"
              onClick={() => {
                addLine({
                  proteinId: (item.proteinId || item.id) as ProteinId,
                  name: item.name,
                  aloo,
                  extraSpicy,
                  notes,
                  qty,
                  unitPrice: price,
                });
                toast.success(`${qty} × ${item.name} added to your Handi order!`);
                setQty(1);
              }}
            >
              <Plus className="h-4 w-4" /> Add to Order · {formatMoney(price * qty)}
            </Button>
          </>
        ) : (
          <Button
            disabled
            className="w-full rounded-xl bg-zinc-800 text-zinc-500 font-medium text-xs py-3 cursor-not-allowed"
          >
            Sold Out Today
          </Button>
        )}
      </div>
    </article>
  );
}
