import { useState, useEffect } from "react";
import { Plus, Minus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useCart } from "@/lib/cart";

export interface TraySelectorModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSelectQty?: (qty: number) => void;
}

export function TraySelectorModal({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSelectQty,
}: TraySelectorModalProps) {
  const {
    selectedTrayQty,
    setSelectedTrayQty,
    traySelectorOpen,
    setTraySelectorOpen,
  } = useCart();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : traySelectorOpen;
  const handleOpenChange = (nextOpen: boolean) => {
    if (controlledOnOpenChange) {
      controlledOnOpenChange(nextOpen);
    } else {
      setTraySelectorOpen(nextOpen);
    }
  };

  const [tempTrayQty, setTempTrayQty] = useState(selectedTrayQty || 1);

  useEffect(() => {
    setTempTrayQty(selectedTrayQty || 1);
  }, [selectedTrayQty, isOpen]);

  const handleConfirm = (qty: number) => {
    setSelectedTrayQty(qty);
    setTempTrayQty(qty);
    handleOpenChange(false);
    if (onSelectQty) onSelectQty(qty);
    toast.success(`Selected ${qty} ${qty > 1 ? "Trays" : "Tray"}! Choose your biryani below.`);

    // Smooth scroll to biryani selection section if present
    setTimeout(() => {
      const menuEl = document.getElementById("menu");
      if (menuEl) {
        menuEl.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="max-w-md w-[92vw] sm:w-full rounded-3xl bg-white border border-amber-200/90 text-zinc-900 p-0 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col [&>button:last-child]:hidden"
      >
        {/* Header (No Close Button) */}
        <div className="relative bg-gradient-to-br from-amber-500/15 via-amber-50 to-orange-50/50 p-5 border-b border-amber-200/80">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-zinc-950 flex items-center justify-center text-xl shadow-md shrink-0">
              🥘
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base sm:text-lg font-bold text-zinc-900 font-display">
                How Many Trays Do You Need?
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-500 mt-0.5">
                Select your tray count to proceed to biryani selection
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Tray Preset Options - Clicking directly proceeds */}
        <div className="p-4 sm:p-5 space-y-2.5 overflow-y-auto flex-1">
          {[
            { qty: 1, name: "1 Tray", desc: "Serves 4–5 Adults · 1.8 kg Meat" },
            { qty: 2, name: "2 Trays", desc: "Serves 8–10 Adults · Twin Feast" },
            { qty: 3, name: "3 Trays", desc: "Serves 12–15 Adults · Celebration" },
            { qty: 4, name: "4 Trays", desc: "Serves 16–20 Adults · Family Feast" },
            { qty: 5, name: "5+ Trays", desc: "Serves 22–25 Adults · Party Feast" },
          ].map((tier) => (
            <button
              type="button"
              key={tier.qty}
              onClick={() => handleConfirm(tier.qty)}
              className="w-full text-left p-3.5 rounded-2xl border border-zinc-200/90 hover:border-amber-500 hover:bg-amber-50/80 shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3 active:scale-[0.99] group"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-amber-500 text-zinc-950 group-hover:brightness-105 flex items-center justify-center font-bold text-base shadow-xs shrink-0 transition-all">
                  {tier.qty}
                </div>
                <div className="min-w-0">
                  <span className="text-sm sm:text-base font-bold text-zinc-900 group-hover:text-amber-900 font-display transition-colors block">
                    {tier.name}
                  </span>
                  <span className="text-[11px] text-zinc-500 block truncate">
                    {tier.desc}
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100/80 group-hover:bg-amber-500 group-hover:text-zinc-950 rounded-xl px-3 py-1.5 transition-all shadow-xs">
                <span>Select</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </button>
          ))}

          {/* Custom Quantity Stepper */}
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-3.5 flex items-center justify-between mt-3">
            <div>
              <span className="text-xs sm:text-sm font-bold text-zinc-900 block">Custom Count</span>
              <span className="text-[10px] text-zinc-500">Need specific trays?</span>
            </div>
            <div className="flex items-center rounded-xl border border-amber-300 bg-white p-0.5 shadow-xs">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTempTrayQty(Math.max(1, tempTrayQty - 1));
                }}
                disabled={tempTrayQty <= 1}
                className="h-8 w-8 flex items-center justify-center text-zinc-700 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-8 text-center text-xs sm:text-sm font-mono font-extrabold text-amber-900">
                {tempTrayQty}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setTempTrayQty(tempTrayQty + 1);
                }}
                className="h-8 w-8 flex items-center justify-center text-amber-800 hover:text-amber-950 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Confirm Custom Quantity CTA */}
        <div className="p-4 sm:p-5 border-t border-zinc-100 bg-zinc-50/80">
          <button
            type="button"
            onClick={() => handleConfirm(tempTrayQty)}
            className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:brightness-105 active:scale-[0.98] text-zinc-950 font-bold py-3.5 px-4 text-xs sm:text-sm shadow-md shadow-amber-900/10 flex items-center justify-center gap-2 cursor-pointer transition-all border border-amber-400/50"
          >
            <span>Continue with {tempTrayQty} {tempTrayQty === 1 ? "Tray" : "Trays"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
