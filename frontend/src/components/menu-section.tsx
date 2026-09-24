import { useState } from "react";
import { Flame, Plus, Shield, Sparkles, Check, Info } from "lucide-react";
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
import { useCart, unitPriceFor } from "@/lib/cart";
import { ALOO_CHARGE, CATEGORIES, MENU, formatMoney, type MenuItem } from "@/lib/menu";

const DISH_IMAGES: Record<string, string> = {
  chicken: chickenImg,
  mutton: muttonImg,
  beef: rawBeefImg,
  pork: rawPorkImg,
};

export function MenuSection() {
  return (
    <section id="menu" className="mx-auto max-w-7xl px-4 py-8">
      {CATEGORIES.map((category) => (
        <div key={category} className="mb-14 last:mb-0">
          <div className="mb-6 flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Sparkles className="h-4 w-4 text-gold" />
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream tracking-wide">{category}</h2>
            </div>
            <div className="gold-rule w-full" />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {MENU.filter((item) => item.category === category).map((item) => (
              <MenuCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      ))}

      <div className="mt-12 rounded-3xl border border-gold/30 bg-gradient-to-br from-[#170f0a] via-[#120c08] to-[#0a0705] p-6 sm:p-8 text-xs text-cream/85 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5 text-gold font-display text-base sm:text-lg font-bold">
          <Shield className="h-5 w-5 text-emerald-400" />
          <span>Allergens & Handcrafted Batch Guarantee</span>
        </div>
        <p className="text-cream/75 leading-relaxed">
          Every Handi Tray includes slow-simmered Dum Biryani layered with aged saffron basmati, pure desi ghee, boiled eggs,
          ghee-roasted whole cashews, crispy fried onions (birista), fresh mint, house Mirchi Ka Salan gravy, and cooling raita.
        </p>
        <div className="grid gap-3 sm:grid-cols-3 pt-2 text-[0.72rem] text-cream/70 border-t border-gold/15">
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>100% Zabiha Halal Certified Poultry & Meats</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-gold shrink-0" />
            <span>Generously Serves 4–5 Adults (1.6–1.8kg Meat)</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-saffron shrink-0" />
            <span>Flat $10 Delivery in Springfield (10 mi)</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function MenuCard({ item }: { item: MenuItem }) {
  const { addLine } = useCart();
  const [aloo, setAloo] = useState(false);
  const [extraSpicy, setExtraSpicy] = useState(false);
  const [notes, setNotes] = useState("");
  const [qty, setQty] = useState(1);

  const price = unitPriceFor(item.id, aloo);
  const dishImage = DISH_IMAGES[item.id] || heroImg;
  const isHalal = item.id !== "pork";

  return (
    <article className="overflow-hidden rounded-3xl border border-gold/25 bg-[#140e09]/95 text-cream shadow-2xl backdrop-blur-xl hover:border-gold/60 transition-all flex flex-col justify-between group">
      <div>
        <div className="relative overflow-hidden">
          <img
            src={dishImage}
            alt={item.name}
            className="h-52 sm:h-56 w-full object-cover group-hover:scale-105 transition-transform duration-700"
            loading="lazy"
            width={1600}
            height={1008}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#140e09] via-[#140e09]/40 to-transparent" />

          {/* Badges Overlay */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
            {isHalal ? (
              <span className="rounded-full bg-emerald-950/80 border border-emerald-500/50 px-3 py-1 text-[0.65rem] font-bold text-emerald-400 backdrop-blur-md flex items-center gap-1 shadow-lg">
                <Shield className="h-3 w-3" /> 100% Zabiha Halal
              </span>
            ) : (
              <span className="rounded-full bg-amber-950/80 border border-amber-500/50 px-3 py-1 text-[0.65rem] font-bold text-amber-300 backdrop-blur-md flex items-center gap-1 shadow-lg">
                <Sparkles className="h-3 w-3" /> Chef Specialty
              </span>
            )}

            <span className="rounded-full bg-black/70 border border-gold/40 px-2.5 py-1 text-[0.65rem] font-bold text-gold backdrop-blur-md">
              Serves 4–5
            </span>
          </div>

          {/* Bottom Title & Price Bar */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <div className="min-w-0">
              <h3 className="truncate font-display text-xl sm:text-2xl font-bold text-cream group-hover:text-gold transition-colors">
                {item.name}
              </h3>
              <p className="text-[0.68rem] font-semibold uppercase tracking-widest text-gold/90">{item.note}</p>
            </div>
            <p className="shrink-0 font-display text-2xl sm:text-3xl font-bold text-gold drop-shadow-md">
              {formatMoney(price)}
            </p>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6 text-xs">
          <p className="text-cream/80 leading-relaxed text-xs sm:text-sm">{item.description}</p>
          
          <div className="flex items-center gap-3 text-[0.7rem] text-gold/90 font-medium">
            <span className="rounded-md bg-gold/10 border border-gold/20 px-2 py-0.5">
              1.6 – 1.8 kg Marinated Meat
            </span>
            <span>•</span>
            <span className="rounded-md bg-gold/10 border border-gold/20 px-2 py-0.5">
              1.0 kg Aged Basmati
            </span>
          </div>

          {/* Customization Options */}
          <div className="space-y-3 rounded-2xl bg-black/40 border border-gold/15 p-3.5">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={`aloo-${item.id}`} className="text-xs text-cream/90 flex items-center gap-1.5 cursor-pointer">
                <span>Add Slow-Steamed Baby Aloo</span>
                <span className="text-gold font-semibold">(+{formatMoney(ALOO_CHARGE)})</span>
              </Label>
              <Switch id={`aloo-${item.id}`} checked={aloo} onCheckedChange={setAloo} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={`spice-${item.id}`} className="flex items-center gap-1.5 text-xs text-cream/90 cursor-pointer">
                <Flame className="h-3.5 w-3.5 text-chili" />
                <span>Extra Spicy Royal Masala</span>
                <span className="text-emerald-400 font-semibold">(Free)</span>
              </Label>
              <Switch id={`spice-${item.id}`} checked={extraSpicy} onCheckedChange={setExtraSpicy} />
            </div>

            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions (e.g. less oil, extra raita)"
              rows={2}
              className="bg-black/60 border-gold/20 text-cream placeholder:text-cream/40 text-xs rounded-xl focus:border-gold"
            />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-5 sm:p-6 pt-0 flex items-center gap-3">
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

        {/* Add to Cart CTA */}
        <Button
          className="flex-1 rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs sm:text-sm py-5 shadow-lg shadow-chili/30 hover:scale-[1.02] transition-all gap-1.5"
          onClick={() => {
            addLine({
              proteinId: item.id,
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
      </div>
    </article>
  );
}
