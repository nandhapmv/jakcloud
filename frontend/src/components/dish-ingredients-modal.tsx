import { useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Scale,
  UtensilsCrossed,
  Search,
  Check,
  Package,
  Layers,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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
  // Default to ingredients tab for instant clarity
  const [activeTab, setActiveTab] = useState<"ingredients" | "nutrition" | "allergens">("ingredients");
  const [nutritionView, setNutritionView] = useState<"serving" | "tray">("serving");
  const [withAloo, setWithAloo] = useState(false);
  const [ingredientFilter, setIngredientFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const normalizedProtein = (proteinId || "chicken").replace(/^dish-/, "").toLowerCase();
  const profile = NUTRITION_BY_PROTEIN[normalizedProtein] || NUTRITION_BY_PROTEIN.chicken;

  const categories = [
    "All",
    "Grains & Proteins",
    "Dairy & Oils",
    "Whole Spices & Seasonings",
    "Fresh Produce & Herbs",
    "Tray Inclusions & Sides",
  ];

  const filteredIngredients = MASTER_38_INGREDIENTS.filter((item: MasterIngredient) => {
    if (ingredientFilter !== "All" && item.category !== ingredientFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.status.toLowerCase().includes(q) ||
        (item.highlight && item.highlight.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const calories = nutritionView === "serving"
    ? (withAloo ? profile.caloriesPerServingWithAloo : profile.caloriesPerServingNoAloo)
    : (withAloo ? profile.caloriesWithAloo : profile.caloriesNoAloo);

  const carbs = withAloo ? profile.carbPerServingWithAloo : profile.carbPerServingNoAloo;
  const totalCarbs = nutritionView === "serving" ? carbs : carbs * profile.servingsPerTray;
  const totalProtein = nutritionView === "serving" ? profile.proteinPerServing : profile.proteinPerServing * profile.servingsPerTray;
  const totalFat = nutritionView === "serving" ? profile.fatPerServing : profile.fatPerServing * profile.servingsPerTray;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[94vw] sm:w-full rounded-2xl bg-[#140e09] border border-amber-500/30 text-cream p-4 sm:p-5 shadow-2xl overflow-hidden max-h-[86vh] flex flex-col my-auto">
        {/* Compact Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0 pr-6">
            {dishImage && (
              <img
                src={dishImage}
                alt={dishName}
                className="h-10 w-10 rounded-xl object-cover border border-amber-400/60 shrink-0"
              />
            )}
            <div className="min-w-0">
              <DialogTitle className="text-sm sm:text-base font-bold text-cream font-serif truncate">
                {dishName}
              </DialogTitle>
              <p className="text-[10px] text-amber-400/90 font-medium truncate">
                5 Servings · 6.5–7.0 lb Cooked · 100% Peanut-Free
              </p>
            </div>
          </div>
        </div>

        {/* 3 Clean Segmented Pills */}
        <div className="grid grid-cols-3 gap-1 bg-black/50 p-1 rounded-xl border border-white/5 my-3 shrink-0 text-center">
          <button
            type="button"
            onClick={() => setActiveTab("ingredients")}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "ingredients"
                ? "bg-amber-500 text-zinc-950 shadow-xs"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            <UtensilsCrossed className="h-3 w-3" />
            <span>38 Ingredients</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("nutrition")}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "nutrition"
                ? "bg-amber-500 text-zinc-950 shadow-xs"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            <Scale className="h-3 w-3" />
            <span>Calories & Macros</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("allergens")}
            className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === "allergens"
                ? "bg-amber-500 text-zinc-950 shadow-xs"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            <ShieldCheck className="h-3 w-3" />
            <span>Allergen & Box</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 space-y-3.5 pr-1 text-xs">
          {/* TAB 1: 38 INGREDIENTS LIST */}
          {activeTab === "ingredients" && (
            <div className="space-y-2.5 animate-in fade-in-50 duration-200">
              {/* Quick Search & Category Bar */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cream/40" />
                <input
                  type="text"
                  placeholder="Filter 38 ingredients (e.g. Saffron, Ghee, Eggs)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-8 rounded-lg border border-white/10 bg-black/60 pl-8 pr-3 text-[11px] text-cream placeholder:text-cream/40 outline-none focus:border-amber-400 font-normal"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setIngredientFilter(cat)}
                    className={`px-2 py-0.5 rounded-md text-[10px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      ingredientFilter === cat
                        ? "bg-amber-500/25 border border-amber-400 text-amber-300"
                        : "bg-black/30 text-cream/60 hover:text-cream border border-white/5"
                    }`}
                  >
                    {cat === "Whole Spices & Seasonings"
                      ? "Spices"
                      : cat === "Tray Inclusions & Sides"
                      ? "Sides & Sweets"
                      : cat === "Fresh Produce & Herbs"
                      ? "Fresh Herbs"
                      : cat}
                  </button>
                ))}
              </div>

              {/* Compact Ingredients List */}
              <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-black/30 overflow-hidden">
                {filteredIngredients.map((ing) => (
                  <div key={ing.id} className="p-2 sm:p-2.5 flex items-start justify-between gap-2 hover:bg-white/[0.02]">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-cream text-[11.5px]">{ing.name}</span>
                        {ing.highlight && (
                          <span className="text-[9px] font-bold text-amber-300 bg-amber-500/20 px-1 py-0.2 rounded border border-amber-500/30">
                            {ing.highlight}
                          </span>
                        )}
                        {ing.allergens?.includes("PEANUT-FREE") && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1 py-0.2 rounded border border-emerald-500/30">
                            100% Peanut-Free
                          </span>
                        )}
                        {ing.allergens?.includes("GLUTEN-FREE") && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/20 px-1 py-0.2 rounded border border-emerald-500/30">
                            Gluten-Free
                          </span>
                        )}
                        {ing.allergens?.includes("MILK") && (
                          <span className="text-[9px] font-semibold text-rose-300 bg-rose-500/15 px-1 py-0.2 rounded">
                            Milk
                          </span>
                        )}
                        {ing.allergens?.includes("TREE NUT") && (
                          <span className="text-[9px] font-semibold text-rose-300 bg-rose-500/15 px-1 py-0.2 rounded">
                            Cashew
                          </span>
                        )}
                        {ing.allergens?.includes("EGG") && (
                          <span className="text-[9px] font-semibold text-rose-300 bg-rose-500/15 px-1 py-0.2 rounded">
                            Egg
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-cream/60 leading-snug mt-0.5">{ing.status}</p>
                    </div>

                    <span className="font-mono text-[10.5px] font-bold text-amber-300 shrink-0 bg-black/50 px-1.5 py-0.5 rounded border border-white/5">
                      {ing.qtyPerTray}
                    </span>
                  </div>
                ))}
              </div>

              {/* Standard Included In Every Tray Note */}
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-2.5 text-[10.5px] text-cream/80 space-y-1">
                <span className="font-bold text-amber-300 block">✨ In Every Tray Box:</span>
                <p>• 1 Handi Tray (serves 5) • 5 Hard-Boiled Eggs • 5pc Laddoo Pack (Gluten-Free) • Ghee & Cashew Pack • Raita & Lime</p>
              </div>
            </div>
          )}

          {/* TAB 2: NUTRITION & CALORIES */}
          {activeTab === "nutrition" && (
            <div className="space-y-3 animate-in fade-in-50 duration-200">
              {/* Basis Toggle */}
              <div className="flex items-center justify-between gap-2 bg-black/40 p-2 rounded-xl border border-white/10 text-[10.5px]">
                <div className="inline-flex rounded-lg bg-zinc-900 border border-white/10 p-0.5">
                  <button
                    type="button"
                    onClick={() => setNutritionView("serving")}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                      nutritionView === "serving"
                        ? "bg-amber-500 text-zinc-950"
                        : "text-cream/70 hover:text-cream"
                    }`}
                  >
                    Per Plate (20 oz)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNutritionView("tray")}
                    className={`px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer ${
                      nutritionView === "tray"
                        ? "bg-amber-500 text-zinc-950"
                        : "text-cream/70 hover:text-cream"
                    }`}
                  >
                    Full Tray (5 Pk)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setWithAloo(!withAloo)}
                  className={`px-2 py-1 rounded-lg border text-[10.5px] font-bold transition-all cursor-pointer ${
                    withAloo
                      ? "bg-amber-500/25 border-amber-400 text-amber-300"
                      : "bg-black/50 border-white/10 text-cream/60"
                  }`}
                >
                  {withAloo ? "🥔 With Aloo" : "🍚 No Aloo"}
                </button>
              </div>

              {/* 4 Clean Metric Blocks */}
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2">
                  <p className="text-[9px] font-bold text-amber-400 uppercase">Calories</p>
                  <p className="font-display text-base sm:text-lg font-bold text-cream font-mono mt-0.5">
                    {calories.toLocaleString()}
                  </p>
                  <p className="text-[8.5px] text-cream/50">kcal</p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2">
                  <p className="text-[9px] font-bold text-emerald-400 uppercase">Protein</p>
                  <p className="font-display text-base sm:text-lg font-bold text-cream font-mono mt-0.5">
                    {totalProtein}g
                  </p>
                  <p className="text-[8.5px] text-cream/50">lean cuts</p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2">
                  <p className="text-[9px] font-bold text-rose-400 uppercase">Fats</p>
                  <p className="font-display text-base sm:text-lg font-bold text-cream font-mono mt-0.5">
                    {totalFat}g
                  </p>
                  <p className="text-[8.5px] text-cream/50">desi ghee</p>
                </div>

                <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2">
                  <p className="text-[9px] font-bold text-blue-400 uppercase">Carbs</p>
                  <p className="font-display text-base sm:text-lg font-bold text-cream font-mono mt-0.5">
                    {totalCarbs}g
                  </p>
                  <p className="text-[8.5px] text-cream/50">basmati</p>
                </div>
              </div>

              {/* Where Calories Come From Progress */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-3 space-y-2">
                <p className="text-[10.5px] font-bold text-cream flex items-center justify-between">
                  <span>Where Calories Come From (% Share)</span>
                  <span className="text-amber-400 font-mono">USDA Tested</span>
                </p>

                <div className="space-y-1.5 text-[10px]">
                  {CALORIE_SOURCES_BREAKDOWN.slice(0, 6).map((item, idx) => (
                    <div key={idx} className="space-y-0.5">
                      <div className="flex items-center justify-between text-cream/80">
                        <span className="truncate pr-2">{item.component}</span>
                        <span className="font-mono text-amber-300 font-bold shrink-0">{item.share} ({item.kcal} kcal)</span>
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

          {/* TAB 3: ALLERGENS & BOX INCLUSIONS */}
          {activeTab === "allergens" && (
            <div className="space-y-2.5 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 space-y-1">
                  <p className="font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> 100% Peanut-Free
                  </p>
                  <p className="text-cream/70 text-[10px] leading-snug">
                    Peanut oil replaced with pure Avocado Oil & Desi Ghee.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 space-y-1">
                  <p className="font-bold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" /> Gluten-Free
                  </p>
                  <p className="text-cream/70 text-[10px] leading-snug">
                    Couscous dropped. Authentic poppy seeds retained.
                  </p>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 space-y-1">
                  <p className="font-bold text-amber-400 flex items-center gap-1">
                    <Check className="h-3.5 w-3.5" /> 100% Zabiha Halal
                  </p>
                  <p className="text-cream/70 text-[10px] leading-snug">
                    Chicken, Goat, Beef 100% Halal. Pork cooked in separate vessels.
                  </p>
                </div>

                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 space-y-1">
                  <p className="font-bold text-rose-400 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" /> Allergens
                  </p>
                  <p className="text-cream/70 text-[10px] leading-snug">
                    Contains Dairy (Ghee, Dahi), Cashews, and Eggs.
                  </p>
                </div>
              </div>

              {/* Box items list */}
              <div className="rounded-xl border border-white/10 bg-black/40 p-2.5 space-y-1 text-[10px] text-cream/75">
                <span className="font-bold text-amber-300 block text-[10.5px]">📦 What Every Box Includes:</span>
                <p>1. 6.5–7.0 lb Heavy-Gauge Oven-Safe Aluminum Handi Tray (serves 5 adults)</p>
                <p>2. 5 Hard-Boiled Eggs (separate thermal packaging)</p>
                <p>3. 5 pc Artisanal Laddoo Pack (complimentary gluten-free dessert)</p>
                <p>4. Warm Desi Ghee, Cashews & Fried Onions pour-over pack</p>
                <p>5. Cooling Vegetable Raita (13 oz) + fresh lime wedges & green chillies</p>
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer */}
        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between shrink-0 text-[10px]">
          <span className="text-cream/50">
            JAKloud J Paradize Dum Biryani
          </span>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg bg-amber-500 text-zinc-950 font-bold px-3 py-1 text-xs hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
