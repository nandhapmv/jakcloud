import { Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

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
      <SheetContent side="right" className="flex w-[min(26rem,92vw)] flex-col border-zinc-200 bg-white text-zinc-900 p-6 shadow-2xl">
        <SheetHeader className="border-b border-zinc-200 pb-4">
          <SheetTitle className="font-semibold text-lg text-zinc-900 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-amber-600" />
            <span>Your Handi Cart ({count})</span>
          </SheetTitle>
        </SheetHeader>

        {count === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 border border-amber-200 text-amber-700">
              <ShoppingBag className="h-6 w-6 opacity-75" />
            </div>
            <p className="text-xs text-zinc-500 font-normal">Your cart is currently empty.</p>
            <Button
              asChild
              onClick={() => onOpenChange(false)}
              className="rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400"
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
                  <div key={line.key} className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 shadow-sm space-y-2.5">
                    <div className="flex gap-3">
                      <img src={dishImg} alt={line.name} className="h-14 w-14 rounded-lg object-cover shrink-0 border border-zinc-200" />
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <p className="truncate text-xs font-semibold text-zinc-900">{line.name}</p>
                        <p className="text-[11px] text-zinc-500 font-normal">
                          {line.aloo ? "• Added Royal Aloo" : "• Plain"} · {line.extraSpicy ? "Extra Spicy" : "Normal"}
                        </p>
                        {line.notes && <p className="text-[10px] text-zinc-500 italic truncate">"{line.notes}"</p>}
                        <p className="text-xs font-semibold text-amber-800 font-mono pt-0.5">{formatMoney(line.unitPrice * line.qty)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-200/80 pt-2">
                      <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5">
                        <button
                          type="button"
                          onClick={() => setQty(line.key, line.qty - 1)}
                          className="h-6 w-6 flex items-center justify-center text-xs text-zinc-600 hover:text-zinc-900 rounded transition-colors cursor-pointer"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-medium text-zinc-900 font-mono">{line.qty}</span>
                        <button
                          type="button"
                          onClick={() => setQty(line.key, line.qty + 1)}
                          className="h-6 w-6 flex items-center justify-center text-xs text-amber-800 hover:text-amber-950 rounded transition-colors cursor-pointer"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="text-xs text-zinc-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer font-normal"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="space-y-3 border-t border-zinc-200 pt-4 text-xs">
              <div className="flex justify-between text-xs font-normal">
                <span className="text-zinc-600">Subtotal:</span>
                <span className="font-semibold text-amber-800 text-sm font-mono">{formatMoney(subtotal)}</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-normal">
                Earliest fulfillment: <strong className="text-zinc-900">{formatDate(nextAvailableDate())}</strong>
              </p>

              <div className="space-y-2 pt-1">
                <Button
                  asChild
                  className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs py-3 shadow-md hover:brightness-105"
                  onClick={() => onOpenChange(false)}
                >
                  <Link to="/checkout">Proceed to Checkout →</Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="w-full rounded-xl border-zinc-200 bg-white text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 text-xs font-medium py-2"
                  onClick={() => onOpenChange(false)}
                >
                  <Link to="/cart">View Full Cart Page</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
