import { useState } from "react";
import {
  ShieldCheck,
  Check,
  Scale,
  UtensilsCrossed,
  X,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  NUTRITION_BY_PROTEIN,
  CALORIE_SOURCES_BREAKDOWN,
  MASTER_38_INGREDIENTS,
  type MasterIngredient,
} from "@/lib/ingredients-data";

interface DishIngredientsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dishName: string;
  proteinId?: string;
  dishImage?: string;
}

export function DishIngredientsModal({
  open,
  onOpenChange,
  dishName,
  proteinId = "chicken",
  dishImage,
}: DishIngredientsModalProps) {
  const [activeTab, setActiveTab] = useState<"ingredients" | "nutrition">("ingredients");
  const [nutritionView, setNutritionView] = useState<"serving" | "tray">("serving");
  const [withAloo, setWithAloo] = useState(false);

  const normalizedProtein = (proteinId || "chicken").replace(/^dish-/, "").toLowerCase();
  const profile = NUTRITION_BY_PROTEIN[normalizedProtein] || NUTRITION_BY_PROTEIN.chicken;

  const calories = nutritionView === "serving"
    ? (withAloo ? profile.caloriesPerServingWithAloo : profile.caloriesPerServingNoAloo)
    : (withAloo ? profile.caloriesWithAloo : profile.caloriesNoAloo);

  const carbs = withAloo ? profile.carbPerServingWithAloo : profile.carbPerServingNoAloo;
  const totalCarbs = nutritionView === "serving" ? carbs : carbs * profile.servingsPerTray;
  const totalProtein = nutritionView === "serving" ? profile.proteinPerServing : profile.proteinPerServing * profile.servingsPerTray;
  const totalFat = nutritionView === "serving" ? profile.fatPerServing : profile.fatPerServing * profile.servingsPerTray;

  // Group 38 ingredients into 4 simple, intuitive sections
  const groupedIngredients = [
    {
      title: "🌾 Rice, Meat & Protein",
      items: MASTER_38_INGREDIENTS.filter(
        (i) => i.category === "Grains & Proteins" || i.id === 29
      ),
    },
    {
      title: "🧈 Pure Oils & Dairy (Peanut-Free)",
      items: MASTER_38_INGREDIENTS.filter((i) => i.category === "Dairy & Oils"),
    },
    {
      title: "🌿 Royal Spices & Fresh Herbs",
      items: MASTER_38_INGREDIENTS.filter(
        (i) => i.category === "Whole Spices & Seasonings" || i.category === "Fresh Produce & Herbs"
      ),
    },
    {
      title: "📦 Box Inclusions & Sweets",
      items: MASTER_38_INGREDIENTS.filter(
        (i) => i.category === "Tray Inclusions & Sides" && i.id !== 29
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] sm:max-w-md w-[92vw] rounded-2xl bg-[#140e09] border border-amber-500/25 text-cream p-4 sm:p-5 shadow-2xl max-h-[82vh] flex flex-col my-auto overflow-hidden">
        {/* Simple & Clean Header */}
        <div className="flex items-center justify-between pb-2.5 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            {dishImage && (
              <img
                src={dishImage}
                alt={dishName}
                className="h-9 w-9 rounded-xl object-cover border border-amber-500/50 shrink-0"
              />
            )}
            <div className="min-w-0">
              <DialogTitle className="text-sm font-bold text-cream font-serif truncate">
                {dishName}
              </DialogTitle>
              <p className="text-[10.5px] text-amber-400 font-medium truncate">
                Handi Tray · Serves 4–5 Adults
              </p>
            </div>
          </div>
        </div>

        {/* 2 Clean Segmented Pills */}
        <div className="grid grid-cols-2 gap-1 bg-black/60 p-1 rounded-xl border border-white/10 my-2.5 shrink-0 text-center">
          <button
            type="button"
            onClick={() => setActiveTab("ingredients")}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "ingredients"
                ? "bg-amber-500 text-zinc-950 shadow-xs"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            <span>38 Ingredients</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("nutrition")}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "nutrition"
                ? "bg-amber-500 text-zinc-950 shadow-xs"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            <Scale className="h-3.5 w-3.5" />
            <span>Nutrition & Macros</span>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs overscroll-contain">
          {activeTab === "ingredients" ? (
            <div className="space-y-3">
              {/* 3 Quick Safety Badges */}
              <div className="grid grid-cols-3 gap-1.5 text-center">
                <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-1.5">
                  <span className="text-[10px] font-bold text-emerald-400 block">🥜 Peanut-Free</span>
                  <span className="text-[8.5px] text-cream/60">Avocado & Ghee</span>
                </div>
                <div className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 p-1.5">
                  <span className="text-[10px] font-bold text-emerald-400 block">🌾 Gluten-Free</span>
                  <span className="text-[8.5px] text-cream/60">100% Rice & Lentil</span>
                </div>
                <div className="rounded-lg bg-amber-500/15 border border-amber-500/30 p-1.5">
                  <span className="text-[10px] font-bold text-amber-300 block">
                    {normalizedProtein === "pork" ? "🥩 Segregated" : "🥩 100% Halal"}
                  </span>
                  <span className="text-[8.5px] text-cream/60">
                    {normalizedProtein === "pork" ? "Separate pots" : "Zabiha Certified"}
                  </span>
                </div>
              </div>

              {/* Grouped Ingredients */}
              <div className="space-y-2.5">
                {groupedIngredients.map((grp, idx) => (
                  <div key={idx} className="rounded-xl bg-black/40 border border-white/5 p-2.5 space-y-1.5">
                    <span className="text-[11px] font-bold text-amber-300 block tracking-wide">
                      {grp.title}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {grp.items.map((item) => (
                        <div
                          key={item.id}
                          className="inline-flex items-center gap-1 rounded-md bg-white/5 hover:bg-white/10 px-2 py-0.5 text-[10.5px] text-cream/90 border border-white/5"
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="text-[9px] font-mono text-amber-400/80">({item.qtyPerTray})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Box summary */}
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 p-2 text-[10px] text-cream/80 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>Includes 5 boiled eggs, 5 gluten-free laddoos, roasted cashews, raita & salan.</span>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Serving Toggle & Aloo Toggle */}
              <div className="flex items-center justify-between gap-2 bg-black/40 p-1.5 rounded-xl border border-white/10 text-[10.5px]">
                <div className="inline-flex rounded-lg bg-zinc-900 border border-white/10 p-0.5">
                  <button
                    type="button"
                    onClick={() => setNutritionView("serving")}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      nutritionView === "serving"
                        ? "bg-amber-500 text-zinc-950"
                        : "text-cream/70 hover:text-cream"
                    }`}
                  >
                    Per Plate (~20 oz)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNutritionView("tray")}
                    className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                      nutritionView === "tray"
                        ? "bg-amber-500 text-zinc-950"
                        : "text-cream/70 hover:text-cream"
                    }`}
                  >
                    Full Tray (Serves 5)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setWithAloo(!withAloo)}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                    withAloo
                      ? "bg-amber-500/20 border-amber-400 text-amber-300"
                      : "bg-black/40 border-white/10 text-cream/60"
                  }`}
                >
                  {withAloo ? "🥔 With Aloo" : "🥔 No Aloo"}
                </button>
              </div>

              {/* 4 Clean Metric Blocks */}
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2">
                  <p className="text-[9px] font-bold text-amber-400 uppercase">Calories</p>
                  <p className="text-base font-bold text-cream font-mono mt-0.5">
                    {calories.toLocaleString()}
                  </p>
                  <p className="text-[8px] text-cream/50">kcal</p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2">
                  <p className="text-[9px] font-bold text-emerald-400 uppercase">Protein</p>
                  <p className="text-base font-bold text-cream font-mono mt-0.5">
                    {totalProtein}g
                  </p>
                  <p className="text-[8px] text-cream/50">lean cuts</p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2">
                  <p className="text-[9px] font-bold text-rose-400 uppercase">Fats</p>
                  <p className="text-base font-bold text-cream font-mono mt-0.5">
                    {totalFat}g
                  </p>
                  <p className="text-[8px] text-cream/50">desi ghee</p>
                </div>

                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2">
                  <p className="text-[9px] font-bold text-blue-400 uppercase">Carbs</p>
                  <p className="text-base font-bold text-cream font-mono mt-0.5">
                    {totalCarbs}g
                  </p>
                  <p className="text-[8px] text-cream/50">basmati</p>
                </div>
              </div>

              {/* Calorie Sources Breakdown */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 space-y-1.5">
                <p className="text-[10px] font-bold text-cream flex items-center justify-between">
                  <span>Calorie Contributors (USDA Specification)</span>
                </p>
                <div className="space-y-1.5 text-[9.5px]">
                  {CALORIE_SOURCES_BREAKDOWN.slice(0, 5).map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between text-cream/80">
                        <span className="truncate pr-2">{item.component}</span>
                        <span className="font-mono text-amber-300 font-bold shrink-0">{item.share}</span>
                      </div>
                      <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: item.share }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer: Single Clean Close Button */}
        <div className="pt-2.5 border-t border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full py-2 rounded-xl bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer text-center"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
