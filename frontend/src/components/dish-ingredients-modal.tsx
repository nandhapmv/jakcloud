import { useState } from "react";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Scale,
  UtensilsCrossed,
  Layers,
  Search,
  Check,
  Package,
  Heart,
  Info,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const [activeTab, setActiveTab] = useState<"nutrition" | "ingredients" | "allergens" | "inclusions">("nutrition");
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
      <DialogContent className="max-w-3xl border-amber-500/30 bg-[#0d0805] text-cream p-0 rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className="relative p-6 border-b border-amber-500/20 bg-gradient-to-r from-[#1c1109] via-[#24170d] to-[#160d07] shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {dishImage && (
                <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-amber-500/40 shrink-0 shadow-md">
                  <img src={dishImage} alt={dishName} className="h-full w-full object-cover" />
                </div>
              )}
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  <Sparkles className="h-3 w-3 text-amber-400" />
                  <span>Verified USDA & Master Chef Recipe Data</span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-display font-bold text-cream mt-1 tracking-tight">
                  {dishName}
                </DialogTitle>
                <DialogDescription className="text-xs text-cream/70 font-normal mt-0.5">
                  Complete 38-Ingredient Master Specification, Macronutrients & USDA Calorie Breakdown
                </DialogDescription>
              </div>
            </div>

            {/* Quick Badge */}
            <div className="flex sm:flex-col items-end gap-1.5 shrink-0">
              <span className="rounded-xl bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5" /> 100% Peanut-Free
              </span>
              <span className="text-[10px] text-amber-400/80 font-mono">
                5 Large Servings · 6.5–7.0 lb Cooked
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: "nutrition", label: "Nutrition & Macros", icon: Scale },
              { id: "ingredients", label: `38 Master Ingredients (${MASTER_38_INGREDIENTS.length})`, icon: UtensilsCrossed },
              { id: "allergens", label: "Allergen & Clean Quality", icon: ShieldCheck },
              { id: "inclusions", label: "What's in Every Tray Box", icon: Package },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                      : "bg-black/40 text-cream/75 hover:bg-white/10 hover:text-cream border border-white/5"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs text-cream/90">
          {/* TAB 1: NUTRITION & CALORIES */}
          {activeTab === "nutrition" && (
            <div className="space-y-6 animate-in fade-in-50 duration-300">
              {/* Serving Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-500/20 bg-black/40 p-3.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-cream/70 font-medium">Viewing Basis:</span>
                  <div className="inline-flex rounded-xl bg-zinc-900 border border-amber-500/20 p-0.5">
                    <button
                      onClick={() => setNutritionView("serving")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        nutritionView === "serving"
                          ? "bg-amber-500 text-zinc-950 shadow-sm"
                          : "text-cream/70 hover:text-cream"
                      }`}
                    >
                      Per Serving (~20 oz plate)
                    </button>
                    <button
                      onClick={() => setNutritionView("tray")}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        nutritionView === "tray"
                          ? "bg-amber-500 text-zinc-950 shadow-sm"
                          : "text-cream/70 hover:text-cream"
                      }`}
                    >
                      Full Handi Tray (5 Servings)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-cream/70 font-medium">Golden Aloo:</span>
                  <button
                    onClick={() => setWithAloo(!withAloo)}
                    className={`px-3 py-1 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      withAloo
                        ? "bg-amber-500/20 border-amber-400 text-amber-300"
                        : "bg-black/40 border-white/10 text-cream/60 hover:text-cream"
                    }`}
                  >
                    <span>{withAloo ? "🥔 With Saffron Aloo" : "🍚 No Aloo"}</span>
                  </button>
                </div>
              </div>

              {/* 4 Macro Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Total Calories</p>
                  <p className="font-display text-3xl font-extrabold text-cream mt-1 font-mono">
                    {calories.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-cream/60 mt-0.5">
                    {nutritionView === "serving" ? "kcal / 20 oz plate" : "kcal / full 7 lb tray"}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 to-transparent p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Lean Protein</p>
                  <p className="font-display text-3xl font-extrabold text-cream mt-1 font-mono">
                    {totalProtein}g
                  </p>
                  <p className="text-[10px] text-cream/60 mt-0.5">
                    {nutritionView === "serving" ? "per serving" : "total tray protein"}
                  </p>
                </div>

                <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-500/10 to-transparent p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-rose-400">Healthy Fats</p>
                  <p className="font-display text-3xl font-extrabold text-cream mt-1 font-mono">
                    {totalFat}g
                  </p>
                  <p className="text-[10px] text-cream/60 mt-0.5">
                    Desi Ghee & Avocado Oil
                  </p>
                </div>

                <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-500/10 to-transparent p-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Carbohydrates</p>
                  <p className="font-display text-3xl font-extrabold text-cream mt-1 font-mono">
                    {totalCarbs}g
                  </p>
                  <p className="text-[10px] text-cream/60 mt-0.5">
                    Aged Saffron Basmati
                  </p>
                </div>
              </div>

              {/* Serving Note Banner */}
              <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4 space-y-1.5 text-xs text-cream/80">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Scale className="h-4 w-4 shrink-0" />
                  <span>USDA Portion & Presentation Standard</span>
                </div>
                <p>
                  Each Handi tray is portioned into <strong>5 generous meal plates</strong> (approximately 20–22 oz / 570–625 g each). Total cooked net weight of the tray is <strong>6.5–7.0 lb (2.9–3.2 kg)</strong>.
                </p>
                <p className="text-cream/60 text-[11px]">
                  * Calorie and macro figures are computed from USDA standard nutritional databases for exact weighed batch quantities.
                </p>
              </div>

              {/* Where Calories Come From Breakdown */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-sm font-bold text-cream flex items-center gap-2">
                    <Layers className="h-4 w-4 text-amber-400" />
                    <span>Where the Calories Come From (% Share of Tray)</span>
                  </h4>
                  <span className="text-[11px] text-amber-400/80 font-mono">Total ~8,950+ kcal</span>
                </div>

                <div className="space-y-3">
                  {CALORIE_SOURCES_BREAKDOWN.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-cream">{item.component} ({item.qty})</span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-amber-400 font-bold">{item.share}</span>
                          <span className="text-cream/50 text-[11px] font-normal">({item.kcal} kcal)</span>
                        </div>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                          style={{ width: item.share }}
                        />
                      </div>
                      <p className="text-[10px] text-cream/50">{item.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MASTER 38 INGREDIENTS LIST */}
          {activeTab === "ingredients" && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cream/40" />
                  <input
                    type="text"
                    placeholder="Search 38 ingredients (e.g. Saffron, Ghee, Cashews, Rice)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 rounded-xl border border-white/10 bg-black/50 pl-9 pr-3 text-xs text-cream placeholder:text-cream/40 outline-none focus:border-amber-400 font-normal"
                  />
                </div>

                <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setIngredientFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                        ingredientFilter === cat
                          ? "bg-amber-500 text-zinc-950"
                          : "bg-black/40 text-cream/60 hover:text-cream border border-white/5"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients Table / Cards */}
              <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-900/80 border-b border-white/10 text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    <tr>
                      <th className="px-4 py-3 w-10">#</th>
                      <th className="px-4 py-3">Ingredient & Cut</th>
                      <th className="px-4 py-3">Qty / Tray</th>
                      <th className="px-4 py-3">Master Culinary Specification</th>
                      <th className="px-4 py-3 text-right">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredIngredients.map((ing) => (
                      <tr key={ing.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-2.5 font-mono text-[11px] text-cream/50">{ing.id}</td>
                        <td className="px-4 py-2.5 font-semibold text-cream">
                          <div className="flex items-center gap-2">
                            <span>{ing.name}</span>
                            {ing.highlight && (
                              <span className="rounded bg-amber-500/20 text-amber-300 text-[9px] px-1.5 py-0.5 font-bold border border-amber-500/30">
                                {ing.highlight}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5 font-mono text-[11px] text-amber-300">{ing.qtyPerTray}</td>
                        <td className="px-4 py-2.5 text-cream/75 text-[11px]">
                          {ing.status}
                          {ing.allergens && ing.allergens.length > 0 && (
                            <div className="flex items-center gap-1 mt-0.5">
                              {ing.allergens.map((alg) => (
                                <span
                                  key={alg}
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                                    alg === "PEANUT-FREE" || alg === "GLUTEN-FREE"
                                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                                  }`}
                                >
                                  {alg}
                                </span>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-right text-[10px] text-cream/50 font-medium">
                          {ing.category}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ALLERGENS & CLEAN QUALITY */}
          {activeTab === "allergens" && (
            <div className="space-y-5 animate-in fade-in-50 duration-300">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* 100% Peanut-Free Card */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>100% Peanut-Free Certified</span>
                  </div>
                  <p className="text-xs text-cream/80 leading-relaxed">
                    <strong>Peanut oil has been completely eliminated</strong> from our recipe and replaced with pure, high-heat cold-pressed <strong>Avocado Oil</strong> and <strong>Pure Desi Ghee</strong>. Safe for diners with peanut allergies.
                  </p>
                </div>

                {/* Gluten-Free Card */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Gluten-Free Recipe</span>
                  </div>
                  <p className="text-xs text-cream/80 leading-relaxed">
                    Couscous has been <strong>DROPPED</strong> from our spice matrix. We retain traditional <strong>Gasagasalu (poppy seeds)</strong> for authentic velvety texture while keeping the entire recipe 100% gluten-free.
                  </p>
                </div>

                {/* 100% Halal Meats */}
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <ShieldCheck className="h-5 w-5" />
                    <span>100% Zabiha Halal Certified Meat</span>
                  </div>
                  <p className="text-xs text-cream/80 leading-relaxed">
                    Our Chicken, Mutton (Baby Goat), and Prime Beef cuts are strictly 100% Zabiha Halal Certified from accredited organic suppliers. Pork is cooked in <strong>dedicated isolated vessels</strong> in segregated prep areas.
                  </p>
                </div>

                {/* Clear Allergen Disclosures */}
                <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
                    <AlertCircle className="h-5 w-5" />
                    <span>Allergen Transparency Notice</span>
                  </div>
                  <ul className="space-y-1 text-xs text-cream/80">
                    <li>• <strong>Dairy / Milk:</strong> Contains Pure Desi Ghee, Sour Cream, Dahi (Yogurt), Saffron Milk, Laddoo pack.</li>
                    <li>• <strong>Tree Nuts:</strong> Ghee-roasted whole cashews in pour-over garnish pack.</li>
                    <li>• <strong>Eggs:</strong> 5 whole hard-boiled farm eggs in separate container.</li>
                  </ul>
                </div>
              </div>

              {/* Purity Guarantee */}
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4 flex items-center gap-3 text-xs text-cream/80">
                <Heart className="h-5 w-5 text-amber-400 shrink-0" />
                <span>
                  <strong>No artificial food colors or synthetic essence.</strong> Saffron-infused golden basmati is naturally bloomed with Kashmiri Kesar and whole cow milk.
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: WHAT'S IN THE BOX */}
          {activeTab === "inclusions" && (
            <div className="space-y-4 animate-in fade-in-50 duration-300">
              <p className="text-xs text-cream/70 font-normal">
                Every JAKloud J Paradize Handi Party Tray is packaged in commercial catering containers ensuring hot steam retention:
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "1 Heavy-Duty Oven-Safe Aluminum Handi Tray",
                    desc: "6.5–7.0 lb total cooked weight containing 1.6–1.8 kg marinated protein and aged saffron basmati. Feeds 4–5 adults generously.",
                    icon: UtensilsCrossed,
                  },
                  {
                    title: "5 Hard-Boiled Farm Eggs",
                    desc: "Peeled and packaged in a separate thermal container for customer convenience.",
                    icon: Check,
                  },
                  {
                    title: "5 pc Artisanal Laddoo Pack (STANDARD)",
                    desc: "Traditional gluten-free celebratory dessert box included with every single tray order at no extra charge.",
                    icon: Sparkles,
                  },
                  {
                    title: "Warm Ghee, Cashew & Birista Pour-over Pack",
                    desc: "Golden roasted whole cashews and caramelized house fried onions in pure desi ghee.",
                    icon: Flame,
                  },
                  {
                    title: "Cooling Vegetable Raita",
                    desc: "13 oz whole milk cultured dahi blended with red onions, seeded cucumber, cilantro, and roasted cumin.",
                    icon: Layers,
                  },
                  {
                    title: "Fresh Lime Wedges & Green Chillies",
                    desc: "Fresh sliced lime wedges and slit chillies for customized table seasoning.",
                    icon: Package,
                  },
                ].map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-amber-500/20 bg-black/40 p-4 space-y-1.5 flex gap-3 items-start"
                    >
                      <div className="h-8 w-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400 mt-0.5">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-xs text-cream">{item.title}</h5>
                        <p className="text-[11px] text-cream/70 mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-white/10 bg-black/60 flex items-center justify-between text-xs shrink-0">
          <span className="text-cream/50 text-[11px]">
            JAKloud J Paradize Dum Biryani · Springfield, MO
          </span>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-xl bg-amber-500 text-zinc-950 font-bold px-4 py-2 text-xs hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Close Nutrition Window
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
