export type ProteinId = "chicken" | "pork" | "beef" | "mutton" | "paneer" | "prawn";

export type MenuItem = {
  id: ProteinId;
  name: string;
  category: string;
  price: number;
  priceWithAloo: number;
  note: string;
  description: string;
  kcal: number;
  kcalAloo: number;
};

export const ALOO_CHARGE = 7;
export const DELIVERY_FEE = 10;
export const ORDER_CUTOFF_HOUR = 14;

export const MENU: MenuItem[] = [
  {
    id: "chicken",
    name: "Royal Chicken Dum Biryani",
    category: "Signature Trays",
    price: 101.99,
    priceWithAloo: 108.99,
    note: "Chef's Classic Signature",
    description:
      "Our house specialty. 1.6–1.8 kg marinated bone-in chicken thighs layered with aged saffron basmati rice, fried onions, and roasted cashews, sealed on dum.",
    kcal: 1714,
    kcalAloo: 1871,
  },
  {
    id: "mutton",
    name: "Hyderabadi Shahi Mutton Dum",
    category: "Premium & Occasion",
    price: 157.99,
    priceWithAloo: 164.99,
    note: "Royal Nizami Feast",
    description:
      "Tender baby goat cuts slow-braised for 4 hours in pure desi ghee, mint, and whole roasted spices. Fall-apart succulent meat.",
    kcal: 2054,
    kcalAloo: 2211,
  },
  {
    id: "beef",
    name: "Slow-Braised Spiced Beef Dum",
    category: "Signature Trays",
    price: 122.99,
    priceWithAloo: 129.99,
    note: "Bold & Hearty Flavor",
    description:
      "Prime tender beef cooked long and low so rich caramelized spiced juices settle deeply through every single basmati grain.",
    kcal: 1952,
    kcalAloo: 2109,
  },
  {
    id: "pork",
    name: "Springfield Signature Pork Dum",
    category: "Signature Trays",
    price: 108.99,
    priceWithAloo: 115.99,
    note: "Ozarks Fusion Special",
    description:
      "Slow-cooked succulent pork shoulder with a deeper, richer roasted masala base, finished with desi ghee, fresh mint, and toasted spices.",
    kcal: 1952,
    kcalAloo: 2109,
  },
  {
    id: "paneer",
    name: "Royal Shahi Paneer Dum (Veg)",
    category: "Vegetarian Royal",
    price: 98.99,
    priceWithAloo: 105.99,
    note: "Vegetarian Delicacy",
    description:
      "Fresh golden paneer cubes slow-simmered with aromatic saffron gravy, baby potatoes, roasted cashews, and caramelized onions.",
    kcal: 1540,
    kcalAloo: 1697,
  },
  {
    id: "prawn",
    name: "Jumbo King Tiger Prawn Dum",
    category: "Seafood Specialty",
    price: 139.99,
    priceWithAloo: 146.99,
    note: "Coastal Saffron Special",
    description:
      "Succulent ocean king tiger prawns marinated in coastal roasted spices, layered with aged basmati, and steamed on gentle dum.",
    kcal: 1620,
    kcalAloo: 1777,
  },
];

export const CATEGORIES = [
  "Signature Trays",
  "Premium & Occasion",
  "Vegetarian Royal",
  "Seafood Specialty",
] as const;

export const CLOSED_WEEKDAY = 3; // Wednesday

export function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

/** Next available fulfilment date: next day, after the 2:00 PM cutoff roll, skipping Wednesdays. */
export function nextAvailableDate(now = new Date()) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + (now.getHours() >= ORDER_CUTOFF_HOUR ? 2 : 1));
  while (date.getDay() === CLOSED_WEEKDAY) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

export function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export const PICKUP_TIMES = [
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

export const DELIVERY_TIMES = ["2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

export const BUSINESS = {
  phone: "417-897-9754",
  email: "sales@jakloud.com",
  address: "3625 S Bedford Ave., Springfield, MO 65809",
};
