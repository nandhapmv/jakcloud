import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { formatDate, formatMoney, nextAvailableDate } from "@/lib/menu";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";
import heroImg from "@/assets/hero-biryani.jpg";

const DISH_IMAGES: Record<string, string> = {
  chicken: chickenImg,
  mutton: muttonImg,
  beef: rawBeefImg,
  pork: rawPorkImg,
  paneer: paneerImg,
  prawn: prawnImg,
};

export function CartSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { lines, setQty, removeLine, subtotal, count } = useCart();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-[min(26rem,92vw)] flex-col border-gold/30 bg-[#120c08] text-cream p-6">
        <SheetHeader className="border-b border-gold/20 pb-4">
          <SheetTitle className="font-display text-xl font-bold text-cream flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" />
            <span>Your Handi Cart ({count})</span>
          </SheetTitle>
        </SheetHeader>

        {count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/30 text-gold">
              <ShoppingBag className="h-8 w-8 opacity-60" />
            </div>
            <p className="text-xs text-cream/70">Your cart is currently empty.</p>
            <Button
              asChild
              onClick={() => onOpenChange(false)}
              className="rounded-2xl bg-gradient-to-r from-chili to-gold text-white font-bold text-xs"
            >
              <Link to="/menu">Browse Signature Trays</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {lines.map((line) => {
                const dishImg = DISH_IMAGES[line.proteinId] || heroImg;
                return (
                  <div key={line.key} className="rounded-2xl border border-gold/20 bg-black/50 p-3.5 shadow-lg space-y-2.5">
                    <div className="flex gap-3">
                      <img src={dishImg} alt={line.name} className="h-14 w-14 rounded-xl object-cover shrink-0 border border-gold/20" />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="truncate font-display text-xs font-bold text-cream">{line.name}</p>
                        <p className="text-[0.65rem] text-gold">
                          {line.aloo ? "✓ Added Baby Aloo" : "Plain"} · {line.extraSpicy ? "Extra Spicy" : "Medium"}
                        </p>
                        {line.notes && <p className="text-[0.6rem] text-cream/60 italic truncate">"{line.notes}"</p>}
                        <p className="font-display text-xs font-bold text-gold pt-1">{formatMoney(line.unitPrice * line.qty)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-gold/10 pt-2">
                      <div className="flex items-center rounded-xl border border-gold/30 bg-black/60 p-0.5">
                        <button
                          type="button"
                          onClick={() => setQty(line.key, line.qty - 1)}
                          className="h-6 w-6 flex items-center justify-center text-xs text-gold hover:bg-gold/20 rounded-lg transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-cream">{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(line.key, line.qty + 1)}
                          className="h-6 w-6 flex items-center justify-center text-xs text-gold hover:bg-gold/20 rounded-lg transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="text-[0.68rem] text-cream/50 hover:text-chili transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 border-t border-gold/20 pt-4 text-xs">
              <div className="flex justify-between text-xs">
                <span className="text-cream/70">Subtotal (8.6% Tax included):</span>
                <span className="font-display font-bold text-gold text-base">{formatMoney(subtotal)}</span>
              </div>
              <p className="text-[0.68rem] text-cream/60">
                Earliest fulfillment: <strong className="text-cream">{formatDate(nextAvailableDate())}</strong>.
              </p>

              <div className="space-y-2 pt-1">
                <Button
                  asChild
                  className="w-full rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs py-5 shadow-lg"
                  onClick={() => onOpenChange(false)}
                >
                  <Link to="/checkout">Proceed to Checkout →</Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-2xl border-gold/40 text-gold hover:bg-gold/15 text-xs font-bold py-2.5"
                  onClick={() => onOpenChange(false)}
                >
                  <Link to="/cart">View Full Cart & Promo Codes</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
