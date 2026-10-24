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

export const ALOO_CHARGE = 0;
export const DELIVERY_FEE = 10;
export const ORDER_CUTOFF_HOUR = 15; // 3:00 PM (Default Cutoff)

export const MENU: MenuItem[] = [
  {
    id: "chicken",
    name: "Royal Chicken Dum Biryani",
    category: "Signature Trays",
    price: 101.99,
    priceWithAloo: 101.99,
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
    priceWithAloo: 157.99,
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
    priceWithAloo: 122.99,
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
    priceWithAloo: 108.99,
    note: "Ozarks Fusion Special",
    description:
      "Slow-cooked succulent pork shoulder with a deeper, richer roasted masala base, finished with desi ghee, fresh mint, and toasted spices.",
    kcal: 1952,
    kcalAloo: 2109,
  },
];

export const CATEGORIES = [
  "Signature Trays",
  "Premium & Occasion",
] as const;

export const CLOSED_WEEKDAY = -1; // All 7 days open (No forced weekday closure)

export function formatMoney(value: number | string | undefined | null) {
  if (value === undefined || value === null || value === "") return "$0.00";
  const num = typeof value === "number" ? value : parseFloat(String(value));
  return `$${(isNaN(num) ? 0 : num).toFixed(2)}`;
}

/** Next available fulfilment date: next day (or day-after if after cutoff), open 7 days a week, skipping any admin-blocked dates. */
export function nextAvailableDate(now = new Date(), customCutoff?: number) {
  let cutoff = customCutoff;
  let blockedDates: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const s = localStorage.getItem("jakloud_settings_v2");
      if (s) {
        const parsed = JSON.parse(s);
        if (parsed.orderCutoffHour !== undefined && cutoff === undefined) {
          cutoff = Number(parsed.orderCutoffHour);
        }
        if (Array.isArray(parsed.blockedDates)) {
          blockedDates = parsed.blockedDates;
        }
      }
    } catch {}
  }
  const effectiveCutoff = cutoff !== undefined ? cutoff : ORDER_CUTOFF_HOUR;
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + (now.getHours() >= effectiveCutoff ? 2 : 1));

  // Loop forward to skip any admin-blocked dates
  for (let i = 0; i < 30; i++) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${d}`;
    if (!blockedDates.includes(key)) {
      break;
    }
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
];

export const DELIVERY_TIMES = ["2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"];

export const BUSINESS = {
  name: "JAKloud J Paradize Dum Biryani",
  phone: "417-897-9754",
  text: "417-897-9754",
  phoneAndText: "417-897-9754",
  email: "sales@jakloud.com",
  preferredContactMethod: "Email / Phone / Text",
  address: "3625 S Bedford Ave., Springfield, MO 65809",
  businessAddress: "3625 S Bedford Ave., Springfield, MO 65809",
  pickupAddress: "3625 S Bedford Ave., Springfield, MO 65809",
  street: "3625 S Bedford Ave.",
  city: "Springfield",
  state: "MO",
  stateFullName: "Missouri",
  zip: "65809",
  currentLocation: "Springfield, Missouri",
  pickupArea: "Springfield, Missouri",
  deliveryArea: "within 10 miles of Springfield from 65809 zip code",
  deliveryRadiusMiles: 10,
  hubZip: "65809",
};

