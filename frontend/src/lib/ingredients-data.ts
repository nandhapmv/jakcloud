export interface NutritionProfile {
  servingsPerTray: number;
  trayNetWeight: string;
  servingSize: string;
  caloriesNoAloo: number;
  caloriesWithAloo: number;
  caloriesPerServingNoAloo: number;
  caloriesPerServingWithAloo: number;
  proteinPerServing: number; // in grams
  fatPerServing: number; // in grams
  carbPerServingNoAloo: number;
  carbPerServingWithAloo: number;
}

export interface CalorieSource {
  component: string;
  qty: string;
  kcal: number;
  share: string;
  note: string;
}

export interface MasterIngredient {
  id: number;
  name: string;
  category: "Grains & Proteins" | "Dairy & Oils" | "Whole Spices & Seasonings" | "Fresh Produce & Herbs" | "Tray Inclusions & Sides";
  qtyPerTray: string;
  status: string;
  allergens?: ("MILK" | "TREE NUT" | "EGG" | "PEANUT-FREE" | "GLUTEN-FREE")[];
  highlight?: string;
}

export const NUTRITION_BY_PROTEIN: Record<string, NutritionProfile> = {
  chicken: {
    servingsPerTray: 5,
    trayNetWeight: "6.5 – 7.0 lb (2.9 – 3.2 kg) cooked",
    servingSize: "approx. 20 – 22 oz (570 – 625 g)",
    caloriesNoAloo: 8950,
    caloriesWithAloo: 9735,
    caloriesPerServingNoAloo: 1790,
    caloriesPerServingWithAloo: 1947,
    proteinPerServing: 87,
    fatPerServing: 81,
    carbPerServingNoAloo: 142,
    carbPerServingWithAloo: 181,
  },
  pork: {
    servingsPerTray: 5,
    trayNetWeight: "6.5 – 7.0 lb (2.9 – 3.2 kg) cooked",
    servingSize: "approx. 20 – 22 oz (570 – 625 g)",
    caloriesNoAloo: 10140,
    caloriesWithAloo: 10925,
    caloriesPerServingNoAloo: 2028,
    caloriesPerServingWithAloo: 2185,
    proteinPerServing: 85,
    fatPerServing: 104,
    carbPerServingNoAloo: 142,
    carbPerServingWithAloo: 181,
  },
  beef: {
    servingsPerTray: 5,
    trayNetWeight: "6.5 – 7.0 lb (2.9 – 3.2 kg) cooked",
    servingSize: "approx. 20 – 22 oz (570 – 625 g)",
    caloriesNoAloo: 10140,
    caloriesWithAloo: 10925,
    caloriesPerServingNoAloo: 2028,
    caloriesPerServingWithAloo: 2185,
    proteinPerServing: 89,
    fatPerServing: 102,
    carbPerServingNoAloo: 142,
    carbPerServingWithAloo: 181,
  },
  mutton: {
    servingsPerTray: 5,
    trayNetWeight: "6.5 – 7.0 lb (2.9 – 3.2 kg) cooked",
    servingSize: "approx. 20 – 22 oz (570 – 625 g)",
    caloriesNoAloo: 10650,
    caloriesWithAloo: 11435,
    caloriesPerServingNoAloo: 2130,
    caloriesPerServingWithAloo: 2287,
    proteinPerServing: 87,
    fatPerServing: 113,
    carbPerServingNoAloo: 142,
    carbPerServingWithAloo: 181,
  },
  lamb: {
    servingsPerTray: 5,
    trayNetWeight: "6.5 – 7.0 lb (2.9 – 3.2 kg) cooked",
    servingSize: "approx. 20 – 22 oz (570 – 625 g)",
    caloriesNoAloo: 10650,
    caloriesWithAloo: 11435,
    caloriesPerServingNoAloo: 2130,
    caloriesPerServingWithAloo: 2287,
    proteinPerServing: 87,
    fatPerServing: 113,
    carbPerServingNoAloo: 142,
    carbPerServingWithAloo: 181,
  },
};

export const CALORIE_SOURCES_BREAKDOWN: CalorieSource[] = [
  {
    component: "Aged Basmati Rice (dry weight)",
    qty: "2.2 lb (1 kg)",
    kcal: 3550,
    share: "41%",
    note: "Cooks to roughly 6.6 lb of fragrant saffron-infused rice",
  },
  {
    component: "Marinated Protein / Meat",
    qty: "3.75 lb (1.7 kg)",
    kcal: 2550,
    share: "30%",
    note: "Boneless marinated cuts slow-braised on Dum",
  },
  {
    component: "House Fried Onions (Birista)",
    qty: "3.0 oz",
    kcal: 420,
    share: "5%",
    note: "House-fried weekly, deeply caramelized sweet aromatics",
  },
  {
    component: "Hard-Boiled Farm Eggs",
    qty: "5 eggs",
    kcal: 390,
    share: "4.5%",
    note: "5 whole eggs packaged in separate thermal container",
  },
  {
    component: "Pure Desi Ghee",
    qty: "1.5 oz",
    kcal: 380,
    share: "4%",
    note: "Used in marination and golden top pour-over layer",
  },
  {
    component: "House Laddoo Pack (STANDARD)",
    qty: "5 pcs",
    kcal: 380,
    share: "4%",
    note: "Gluten-free traditional sweet included in every tray",
  },
  {
    component: "Avocado Oil + Coconut Oil",
    qty: "1.5 oz",
    kcal: 370,
    share: "4%",
    note: "High-heat avocado replaces peanut oil (100% peanut-free)",
  },
  {
    component: "Roasted Cashews",
    qty: "1.83 oz",
    kcal: 300,
    share: "3.5%",
    note: "Ghee-roasted golden cashews in pour-over garnish pack",
  },
  {
    component: "Cultured Dairy (Sour cream, yogurt, milk)",
    qty: "13 oz",
    kcal: 290,
    share: "3.5%",
    note: "Velvety marination + rich vegetable raita side",
  },
  {
    component: "Sun-Dried Fruit (Raisins, dates, apricots)",
    qty: "2.6 oz",
    kcal: 210,
    share: "2.5%",
    note: "Slit dried apricots, dates and golden raisins on top layer",
  },
  {
    component: "Fresh Produce, Whole Herbs & Spices",
    qty: "Fresh aromatics",
    kcal: 110,
    share: "1.5%",
    note: "Mint, cilantro, ginger-garlic paste, chillies, lemon, masalas",
  },
];

export const MASTER_38_INGREDIENTS: MasterIngredient[] = [
  { id: 1, name: "Basmati Rice", category: "Grains & Proteins", qtyPerTray: "2.2 lb (1.0 kg)", status: "Locked at 1 kg / tray (cooks to 6.6 lb)", highlight: "Aged long-grain royal basmati" },
  { id: 2, name: "Pure Desi Ghee", category: "Dairy & Oils", qtyPerTray: "1.5 oz", status: "Retained — marination & top pour-over layer", allergens: ["MILK"] },
  { id: 3, name: "Virgin Coconut Oil", category: "Dairy & Oils", qtyPerTray: "0.5 oz", status: "Retained — tray brushing & heat retention" },
  { id: 4, name: "Fresh Yellow Onions", category: "Fresh Produce & Herbs", qtyPerTray: "0.75 lb", status: "Retained — fresh sliced into base masala" },
  { id: 5, name: "Crisp Fried Onions (Birista)", category: "Fresh Produce & Herbs", qtyPerTray: "3.0 oz", status: "House-fried weekly in-house, never packaged" },
  { id: 6, name: "Cultured Sour Cream", category: "Dairy & Oils", qtyPerTray: "5.5 oz", status: "Retained — deep tenderizing meat marination", allergens: ["MILK"] },
  { id: 7, name: "Whole Milk Yogurt (Dahi)", category: "Dairy & Oils", qtyPerTray: "5.5 oz", status: "Retained — cooling cucumber raita side", allergens: ["MILK"] },
  { id: 8, name: "Fresh Cilantro (Kothmir)", category: "Fresh Produce & Herbs", qtyPerTray: "0.35 bunch", status: "Retained — fresh chopped herbs in layers" },
  { id: 9, name: "Fresh Mint Leaves (Pudina)", category: "Fresh Produce & Herbs", qtyPerTray: "0.35 bunch", status: "Retained — aromatic steam dum infusion" },
  { id: 10, name: "Whole Roasted Cashews", category: "Tray Inclusions & Sides", qtyPerTray: "1.83 oz", status: "Retained — crunchy ghee-cashew pour-over pack", allergens: ["TREE NUT"] },
  { id: 11, name: "Golden Sultana Raisins", category: "Tray Inclusions & Sides", qtyPerTray: "1.0 oz", status: "Retained — sweet contrast in biryani rice" },
  { id: 12, name: "Royal Slit Dried Dates", category: "Tray Inclusions & Sides", qtyPerTray: "0.8 oz", status: "Retained — authentic Hyderabadi dry fruit layer" },
  { id: 13, name: "Sun-Dried Tart Apricots (Khubani)", category: "Tray Inclusions & Sides", qtyPerTray: "0.83 oz", status: "Retained — tender dried apricot gems" },
  { id: 14, name: "Whole Tej Patta (Bay Leaves)", category: "Whole Spices & Seasonings", qtyPerTray: "0.03 oz", status: "Retained — slow oil release aromatics" },
  { id: 15, name: "Gasagasalu (Poppy Seeds)", category: "Whole Spices & Seasonings", qtyPerTray: "0.17 oz", status: "Couscous DROPPED (wheat/gluten free); Poppy seed retained", allergens: ["GLUTEN-FREE"] },
  { id: 16, name: "Pure Coconut Milk", category: "Dairy & Oils", qtyPerTray: "1.25 oz", status: "Retained as rich aromatic option" },
  { id: 17, name: "High-Heat Avocado Oil", category: "Dairy & Oils", qtyPerTray: "1.0 oz", status: "REPLACED peanut oil — completely eliminates peanut allergen", allergens: ["PEANUT-FREE"] },
  { id: 18, name: "Ceylon Cinnamon Bark", category: "Whole Spices & Seasonings", qtyPerTray: "0.15 oz", status: "Retained — sweet warm woody notes" },
  { id: 19, name: "Royal Shah Jeera (Caraway)", category: "Whole Spices & Seasonings", qtyPerTray: "0.072 oz", status: "Retained — essential royal dum aroma" },
  { id: 20, name: "Himalayan Pink Salt", category: "Whole Spices & Seasonings", qtyPerTray: "0.5 oz", status: "Retained — mineral-rich seasoned balance" },
  { id: 21, name: "Ground Organic Turmeric (Haldi)", category: "Whole Spices & Seasonings", qtyPerTray: "0.19 oz", status: "Retained — vibrant color & earthy depth" },
  { id: 22, name: "Pure Kashmiri Saffron (Kesar)", category: "Whole Spices & Seasonings", qtyPerTray: "0.002 oz", status: "Retained as STANDARD (never artificial essence)", highlight: "Grade-1 Saffron Threads" },
  { id: 23, name: "Warm Whole Milk", category: "Dairy & Oils", qtyPerTray: "2.0 oz", status: "Retained — warm milk bath to bloom saffron", allergens: ["MILK"] },
  { id: 24, name: "Signature Royal Meat Masala", category: "Whole Spices & Seasonings", qtyPerTray: "0.64 oz", status: "Retained — proprietary Nizami house spice blend" },
  { id: 25, name: "Slow-Roasted Garam Masala", category: "Whole Spices & Seasonings", qtyPerTray: "0.20 oz", status: "Retained — freshly crushed whole cardamoms & mace" },
  { id: 26, name: "Kasuri Methi (Fenugreek Leaves)", category: "Whole Spices & Seasonings", qtyPerTray: "0.04 oz", status: "Retained — crushed herb finish on meat layer" },
  { id: 27, name: "Fresh Ginger Paste", category: "Fresh Produce & Herbs", qtyPerTray: "0.875 oz", status: "Ground fresh weekly in-house from whole root" },
  { id: 28, name: "Fresh Garlic Paste", category: "Fresh Produce & Herbs", qtyPerTray: "0.875 oz", status: "Ground fresh weekly in-house from peeled cloves" },
  { id: 29, name: "Fresh Slit Green Chillies", category: "Fresh Produce & Herbs", qtyPerTray: "1.5 oz", status: "Retained — balanced fresh capsicum heat" },
  { id: 30, name: "Sun-Dried Red Chilli Powder", category: "Whole Spices & Seasonings", qtyPerTray: "0.31 oz", status: "Retained — vibrant color and deep smokiness" },
  { id: 31, name: "Fresh Key Lime Juice", category: "Fresh Produce & Herbs", qtyPerTray: "1.5 limes", status: "Retained — bright citrus acidity to balance rich ghee" },
  { id: 32, name: "Golden Saffron Dum Potato", category: "Grains & Proteins", qtyPerTray: "2.25 lb (4–5 medium)", status: "Optional chef add-on (Yes/No choice)", highlight: "Tender dum-braised potato" },
  { id: 33, name: "Marinated Protein Cut", category: "Grains & Proteins", qtyPerTray: "3.75 lb (1.7 kg)", status: "Chicken / Lamb / Beef / Pork (Zabiha Halal Certified)", highlight: "1.7 kg prime cuts" },
  { id: 34, name: "Hard-Boiled Eggs", category: "Tray Inclusions & Sides", qtyPerTray: "5 whole eggs", status: "STANDARD: 5 hard-boiled eggs in separate pack", allergens: ["EGG"] },
  { id: 35, name: "Oven-Safe Aluminium Tray + Sealed Lid", category: "Tray Inclusions & Sides", qtyPerTray: "1 full tray set", status: "Heavy-gauge oven-safe aluminum catering handi" },
  { id: 36, name: "Organic Dried Rose Petals", category: "Whole Spices & Seasonings", qtyPerTray: "0.045 oz", status: "Retained as standard — floral aroma garnish" },
  { id: 37, name: "Signature Laddoo Pack", category: "Tray Inclusions & Sides", qtyPerTray: "5 pc pack", status: "NOW STANDARD in every tray (Gluten-free traditional sweet)", allergens: ["MILK", "GLUTEN-FREE"] },
  { id: 38, name: "Fresh Raita Salad Vegetables", category: "Fresh Produce & Herbs", qtyPerTray: "0.30 lb", status: "Diced red onion, carrot, seedless cucumber, cilantro" },
];
