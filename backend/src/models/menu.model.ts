export type ProteinId = "chicken" | "pork" | "beef" | "mutton" | "paneer" | "prawn";

export interface MenuItem {
  id: ProteinId;
  name: string;
  category: string;
  price: number;
  priceWithAloo: number;
  note: string;
  description: string;
  kcal: number;
  kcalAloo: number;
  ingredients: string[];
  allergens: string[];
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: "chicken",
    name: "Chicken Dum Biryani",
    category: "Signature Trays",
    price: 101.99,
    priceWithAloo: 101.99,
    note: "Always available",
    description:
      "Our house tray. Marinated chicken layered with saffron basmati, fried onions and cashews, sealed and slow-cooked on dum.",
    kcal: 1714,
    kcalAloo: 1871,
    ingredients: [
      "Basmati rice",
      "Chicken (1.6-1.8kg)",
      "Yogurt & sour cream",
      "Ghee",
      "Cashews",
      "Fried onions",
      "Boiled eggs",
      "Saffron & whole spices",
    ],
    allergens: ["Milk", "Egg", "Tree Nuts (Cashew)"],
  },
  {
    id: "pork",
    name: "Pork Dum Biryani",
    category: "Signature Trays",
    price: 108.99,
    priceWithAloo: 108.99,
    note: "Standard",
    description:
      "Slow-cooked pork with a deeper, richer masala base, finished with ghee, mint and toasted spices.",
    kcal: 1952,
    kcalAloo: 2109,
    ingredients: [
      "Basmati rice",
      "Pork (1.6-1.8kg)",
      "Yogurt & sour cream",
      "Ghee",
      "Cashews",
      "Fried onions",
      "Boiled eggs",
      "Saffron & whole spices",
    ],
    allergens: ["Milk", "Egg", "Tree Nuts (Cashew)"],
  },
  {
    id: "beef",
    name: "Beef Dum Biryani",
    category: "Signature Trays",
    price: 122.99,
    priceWithAloo: 122.99,
    note: "Standard",
    description:
      "Tender beef cooked long and low so the spice settles right through the rice. Bold and hearty.",
    kcal: 1952,
    kcalAloo: 2109,
    ingredients: [
      "Basmati rice",
      "Beef (1.6-1.8kg)",
      "Yogurt & sour cream",
      "Ghee",
      "Cashews",
      "Fried onions",
      "Boiled eggs",
      "Saffron & whole spices",
    ],
    allergens: ["Milk", "Egg", "Tree Nuts (Cashew)"],
  },
  {
    id: "mutton",
    name: "Mutton Dum Biryani",
    category: "Premium & Occasion",
    price: 157.99,
    priceWithAloo: 157.99,
    note: "Pre-order / occasion tray",
    description:
      "The classic Hyderabadi celebration tray. Bone-in mutton, heavier on saffron and ghee, cooked the traditional way.",
    kcal: 2054,
    kcalAloo: 2211,
    ingredients: [
      "Basmati rice",
      "Bone-in Mutton (1.6-1.8kg)",
      "Yogurt & sour cream",
      "Ghee",
      "Cashews",
      "Fried onions",
      "Boiled eggs",
      "Royal saffron & whole spices",
    ],
    allergens: ["Milk", "Egg", "Tree Nuts (Cashew)"],
  },
  {
    id: "paneer",
    name: "Royal Shahi Paneer Dum (Veg)",
    category: "Vegetarian Royal",
    price: 98.99,
    priceWithAloo: 98.99,
    note: "Vegetarian Delicacy",
    description:
      "Fresh golden malai paneer cubes slow-simmered with aromatic saffron gravy, baby potatoes, roasted cashews, and caramelized onions.",
    kcal: 1540,
    kcalAloo: 1697,
    ingredients: [
      "Basmati rice",
      "Fresh Malai Paneer (1.2kg)",
      "Yogurt & sour cream",
      "Pure Desi Ghee",
      "Cashews",
      "Fried onions",
      "Baby Potatoes",
      "Royal saffron & Mughlai spices",
    ],
    allergens: ["Milk", "Tree Nuts (Cashew)"],
  },
  {
    id: "prawn",
    name: "Jumbo King Tiger Prawn Dum",
    category: "Seafood Specialty",
    price: 139.99,
    priceWithAloo: 139.99,
    note: "Coastal Saffron Special",
    description:
      "Succulent ocean king tiger prawns marinated in coastal roasted spices, layered with aged basmati, and steamed on gentle dum.",
    kcal: 1620,
    kcalAloo: 1777,
    ingredients: [
      "Basmati rice",
      "Wild Jumbo Tiger Prawns (1.5kg)",
      "Coastal coconut oil & ghee",
      "Cashews",
      "Fried onions",
      "Boiled eggs",
      "Coastal roasted whole spices",
    ],
    allergens: ["Crustacean Shellfish", "Egg", "Milk", "Tree Nuts (Cashew)"],
  },
];

export const CATEGORIES = [
  "Signature Trays",
  "Premium & Occasion",
  "Vegetarian Royal",
  "Seafood Specialty",
] as const;
