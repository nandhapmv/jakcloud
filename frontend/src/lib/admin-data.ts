import type { OrderStatus, OrderResponse } from "./api";

export interface ExtendedOrder extends OrderResponse {
  paymentStatus: "Paid Online" | "Cash on Pickup" | "Paid via Card" | "Pending";
  paymentMethod: "Stripe / Apple Pay" | "Cash" | "Credit Card" | "Zelle";
  customerAvatar: {
    initials: string;
    bgColor: string;
    textColor: string;
  };
}

export const INITIAL_ORDERS: ExtendedOrder[] = [
  {
    id: "ord_101",
    orderNumber: "JK-2026-9812",
    status: "confirmed",
    fulfilmentType: "delivery",
    fulfilmentDate: "Tomorrow",
    fulfilmentTime: "2:00 PM",
    paymentStatus: "Paid Online",
    paymentMethod: "Stripe / Apple Pay",
    customerAvatar: {
      initials: "MV",
      bgColor: "bg-red-950/80 border-red-500/50",
      textColor: "text-red-300",
    },
    customer: {
      name: "Marcus Vance",
      email: "marcus.v@example.com",
      phone: "417-555-3921",
      address: "1420 E Sunshine St, Apt 3B",
      city: "Springfield",
      zipCode: "65804",
      deliveryInstructions: "Gate code #4491. Ring bell at side entrance.",
    },
    items: [
      {
        proteinId: "mutton",
        name: "Mutton Dum Biryani",
        aloo: true,
        extraSpicy: true,
        notes: "Extra roasted cashews and crispy fried onions pack please.",
        qty: 1,
        unitPrice: 164.99,
        lineTotal: 164.99,
      },
    ],
    subtotal: 164.99,
    tax: 14.19,
    deliveryFee: 10.0,
    total: 174.99,
    specialInstructions: "Family celebration tray. Please ensure saffron aroma seal is hot.",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "ord_102",
    orderNumber: "JK-2026-9804",
    status: "preparing",
    fulfilmentType: "pickup",
    fulfilmentDate: "Tomorrow",
    fulfilmentTime: "12:00 PM",
    paymentStatus: "Paid Online",
    paymentMethod: "Credit Card",
    customerAvatar: {
      initials: "AP",
      bgColor: "bg-amber-950/80 border-amber-500/50",
      textColor: "text-amber-300",
    },
    customer: {
      name: "Ananya Patel",
      email: "ananya.patel@example.com",
      phone: "417-555-8492",
    },
    items: [
      {
        proteinId: "chicken",
        name: "Chicken Dum Biryani",
        aloo: false,
        extraSpicy: false,
        notes: "Mild spice preferred for guests",
        qty: 2,
        unitPrice: 101.99,
        lineTotal: 203.98,
      },
    ],
    subtotal: 203.98,
    tax: 17.54,
    deliveryFee: 0,
    total: 203.98,
    specialInstructions: "Will arrive right at 12:00 PM counter.",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: "ord_103",
    orderNumber: "JK-2026-9791",
    status: "ready",
    fulfilmentType: "pickup",
    fulfilmentDate: "Today",
    fulfilmentTime: "4:00 PM",
    paymentStatus: "Paid via Card",
    paymentMethod: "Credit Card",
    customerAvatar: {
      initials: "DS",
      bgColor: "bg-emerald-950/80 border-emerald-500/50",
      textColor: "text-emerald-300",
    },
    customer: {
      name: "David Sterling",
      email: "david.s@example.com",
      phone: "417-555-1104",
    },
    items: [
      {
        proteinId: "beef",
        name: "Beef Dum Biryani",
        aloo: true,
        extraSpicy: true,
        notes: "Include extra lime wedges and raita",
        qty: 1,
        unitPrice: 129.99,
        lineTotal: 129.99,
      },
    ],
    subtotal: 129.99,
    tax: 11.18,
    deliveryFee: 0,
    total: 129.99,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: "ord_104",
    orderNumber: "JK-2026-9780",
    status: "preparing",
    fulfilmentType: "delivery",
    fulfilmentDate: "Tomorrow",
    fulfilmentTime: "3:00 PM",
    paymentStatus: "Paid Online",
    paymentMethod: "Stripe / Apple Pay",
    customerAvatar: {
      initials: "ER",
      bgColor: "bg-blue-950/80 border-blue-500/50",
      textColor: "text-blue-300",
    },
    customer: {
      name: "Elena Rostova",
      email: "elena.r@example.com",
      phone: "417-555-9012",
      address: "921 S Glenstone Ave",
      city: "Springfield",
      zipCode: "65802",
      deliveryInstructions: "Leave on front porch table.",
    },
    items: [
      {
        proteinId: "pork",
        name: "Pork Dum Biryani",
        aloo: true,
        extraSpicy: false,
        notes: "",
        qty: 1,
        unitPrice: 115.99,
        lineTotal: 115.99,
      },
    ],
    subtotal: 115.99,
    tax: 9.98,
    deliveryFee: 10.0,
    total: 125.99,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "ord_105",
    orderNumber: "JK-2026-9765",
    status: "confirmed",
    fulfilmentType: "pickup",
    fulfilmentDate: "Tomorrow",
    fulfilmentTime: "5:00 PM",
    paymentStatus: "Cash on Pickup",
    paymentMethod: "Cash",
    customerAvatar: {
      initials: "RS",
      bgColor: "bg-purple-950/80 border-purple-500/50",
      textColor: "text-purple-300",
    },
    customer: {
      name: "Rajesh & Priya Sharma",
      email: "sharma.family@example.com",
      phone: "417-555-6677",
    },
    items: [
      {
        proteinId: "mutton",
        name: "Mutton Dum Biryani",
        aloo: true,
        extraSpicy: true,
        notes: "Heavy saffron and extra caramelized onion topping",
        qty: 2,
        unitPrice: 164.99,
        lineTotal: 329.98,
      },
    ],
    subtotal: 329.98,
    tax: 28.38,
    deliveryFee: 0,
    total: 329.98,
    specialInstructions: "Anniversary dinner party.",
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
  },
  {
    id: "ord_106",
    orderNumber: "JK-2026-9742",
    status: "completed",
    fulfilmentType: "delivery",
    fulfilmentDate: "Today",
    fulfilmentTime: "2:00 PM",
    paymentStatus: "Paid Online",
    paymentMethod: "Stripe / Apple Pay",
    customerAvatar: {
      initials: "JH",
      bgColor: "bg-teal-950/80 border-teal-500/50",
      textColor: "text-teal-300",
    },
    customer: {
      name: "James Henderson",
      email: "j.henderson@example.com",
      phone: "417-555-7721",
      address: "2234 E Cherry St",
      city: "Springfield",
      zipCode: "65802",
    },
    items: [
      {
        proteinId: "chicken",
        name: "Chicken Dum Biryani",
        aloo: true,
        extraSpicy: false,
        notes: "",
        qty: 1,
        unitPrice: 108.99,
        lineTotal: 108.99,
      },
    ],
    subtotal: 108.99,
    tax: 9.37,
    deliveryFee: 10.0,
    total: 118.99,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "ord_107",
    orderNumber: "JK-2026-9720",
    status: "completed",
    fulfilmentType: "pickup",
    fulfilmentDate: "Today",
    fulfilmentTime: "1:00 PM",
    paymentStatus: "Paid Online",
    paymentMethod: "Credit Card",
    customerAvatar: {
      initials: "SM",
      bgColor: "bg-rose-950/80 border-rose-500/50",
      textColor: "text-rose-300",
    },
    customer: {
      name: "Sophia Martinez",
      email: "sophia.m@example.com",
      phone: "417-555-4309",
    },
    items: [
      {
        proteinId: "beef",
        name: "Beef Dum Biryani",
        aloo: false,
        extraSpicy: true,
        notes: "Extra spicy masala layer",
        qty: 1,
        unitPrice: 122.99,
        lineTotal: 122.99,
      },
    ],
    subtotal: 122.99,
    tax: 10.58,
    deliveryFee: 0,
    total: 122.99,
    createdAt: new Date(Date.now() - 1000 * 60 * 420).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "ord_108",
    orderNumber: "JK-2026-9701",
    status: "cancelled",
    fulfilmentType: "delivery",
    fulfilmentDate: "Today",
    fulfilmentTime: "5:00 PM",
    paymentStatus: "Pending",
    paymentMethod: "Credit Card",
    customerAvatar: {
      initials: "TW",
      bgColor: "bg-zinc-900 border-zinc-700",
      textColor: "text-zinc-400",
    },
    customer: {
      name: "Thomas Wright",
      email: "twright@example.com",
      phone: "417-555-8901",
      address: "3100 S National Ave",
      city: "Springfield",
      zipCode: "65807",
    },
    items: [
      {
        proteinId: "chicken",
        name: "Chicken Dum Biryani",
        aloo: false,
        extraSpicy: false,
        notes: "",
        qty: 1,
        unitPrice: 101.99,
        lineTotal: 101.99,
      },
    ],
    subtotal: 101.99,
    tax: 8.77,
    deliveryFee: 10.0,
    total: 111.99,
    specialInstructions: "Cancelled per customer schedule conflict.",
    createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
  },
];

export interface WeeklySalesData {
  day: string;
  revenue: number;
  trays: number;
  pickup: number;
  delivery: number;
}

export const WEEKLY_SALES_DATA: WeeklySalesData[] = [
  { day: "Thu (Sep 17)", revenue: 1420.90, trays: 11, pickup: 6, delivery: 5 },
  { day: "Fri (Sep 18)", revenue: 2180.50, trays: 17, pickup: 9, delivery: 8 },
  { day: "Sat (Sep 19)", revenue: 3120.00, trays: 24, pickup: 14, delivery: 10 },
  { day: "Sun (Sep 20)", revenue: 2840.20, trays: 22, pickup: 12, delivery: 10 },
  { day: "Mon (Sep 21)", revenue: 1640.80, trays: 13, pickup: 7, delivery: 6 },
  { day: "Tue (Sep 22)", revenue: 1950.00, trays: 15, pickup: 8, delivery: 7 },
  { day: "Today (Sep 23)", revenue: 2480.90, trays: 19, pickup: 11, delivery: 8 },
];

export interface MonthlySalesRecord {
  month: string;
  revenue: number;
  trays: number;
  avgOrderValue: number;
  newCustomers: number;
  profit: number;
}

export const MONTHLY_SALES_DATA: MonthlySalesRecord[] = [
  { month: "Jan 2026", revenue: 28450.00, trays: 242, avgOrderValue: 138.50, newCustomers: 18, profit: 19346.00 },
  { month: "Feb 2026", revenue: 31200.00, trays: 265, avgOrderValue: 141.20, newCustomers: 22, profit: 21216.00 },
  { month: "Mar 2026", revenue: 36800.00, trays: 310, avgOrderValue: 144.80, newCustomers: 27, profit: 25024.00 },
  { month: "Apr 2026", revenue: 34500.00, trays: 290, avgOrderValue: 142.00, newCustomers: 21, profit: 23460.00 },
  { month: "May 2026", revenue: 39100.00, trays: 328, avgOrderValue: 146.50, newCustomers: 31, profit: 26588.00 },
  { month: "Jun 2026", revenue: 41800.00, trays: 350, avgOrderValue: 148.20, newCustomers: 34, profit: 28424.00 },
  { month: "Jul 2026", revenue: 44200.00, trays: 370, avgOrderValue: 151.00, newCustomers: 38, profit: 30056.00 },
  { month: "Aug 2026", revenue: 48900.00, trays: 405, avgOrderValue: 153.80, newCustomers: 42, profit: 33252.00 },
  { month: "Sep 2026 (MTD)", revenue: 38750.00, trays: 318, avgOrderValue: 154.50, newCustomers: 29, profit: 26350.00 },
];

export interface DailyOrderData {
  date: string;
  dayName: string;
  traysBooked: number;
  capacityLimit: number;
  revenue: number;
  pickup: number;
  delivery: number;
  capacityPct: number;
}

export const DAILY_ORDERS_DATA: DailyOrderData[] = [
  { date: "Sep 10", dayName: "Thu", traysBooked: 16, capacityLimit: 25, revenue: 2040.00, pickup: 9, delivery: 7, capacityPct: 64 },
  { date: "Sep 11", dayName: "Fri", traysBooked: 22, capacityLimit: 25, revenue: 2810.00, pickup: 12, delivery: 10, capacityPct: 88 },
  { date: "Sep 12", dayName: "Sat", traysBooked: 25, capacityLimit: 25, revenue: 3290.00, pickup: 15, delivery: 10, capacityPct: 100 },
  { date: "Sep 13", dayName: "Sun", traysBooked: 25, capacityLimit: 25, revenue: 3340.00, pickup: 14, delivery: 11, capacityPct: 100 },
  { date: "Sep 14", dayName: "Mon", traysBooked: 14, capacityLimit: 25, revenue: 1780.00, pickup: 8, delivery: 6, capacityPct: 56 },
  { date: "Sep 15", dayName: "Tue", traysBooked: 18, capacityLimit: 25, revenue: 2290.00, pickup: 10, delivery: 8, capacityPct: 72 },
  { date: "Sep 16", dayName: "Wed", traysBooked: 0, capacityLimit: 25, revenue: 0, pickup: 0, delivery: 0, capacityPct: 0 }, // Closed for spice grinding
  { date: "Sep 17", dayName: "Thu", traysBooked: 17, capacityLimit: 25, revenue: 2180.00, pickup: 9, delivery: 8, capacityPct: 68 },
  { date: "Sep 18", dayName: "Fri", traysBooked: 23, capacityLimit: 25, revenue: 2950.00, pickup: 13, delivery: 10, capacityPct: 92 },
  { date: "Sep 19", dayName: "Sat", traysBooked: 25, capacityLimit: 25, revenue: 3390.00, pickup: 15, delivery: 10, capacityPct: 100 },
  { date: "Sep 20", dayName: "Sun", traysBooked: 24, capacityLimit: 25, revenue: 3180.00, pickup: 14, delivery: 10, capacityPct: 96 },
  { date: "Sep 21", dayName: "Mon", traysBooked: 15, capacityLimit: 25, revenue: 1910.00, pickup: 8, delivery: 7, capacityPct: 60 },
  { date: "Sep 22", dayName: "Tue", traysBooked: 19, capacityLimit: 25, revenue: 2420.00, pickup: 11, delivery: 8, capacityPct: 76 },
  { date: "Sep 23", dayName: "Today", traysBooked: 19, capacityLimit: 25, revenue: 2480.90, pickup: 11, delivery: 8, capacityPct: 76 },
];

export const FULFILMENT_PIE_DATA = [
  { name: "Counter Pickup", value: 58, count: 184, revenue: 23640.00, color: "#d4a017" },
  { name: "Executive Delivery", value: 42, count: 134, revenue: 17110.00, color: "#b91c1c" },
];

export const CUSTOMER_GROWTH_DATA = [
  { month: "Apr", totalPatrons: 64, newPatrons: 21, repeatOrders: 43 },
  { month: "May", totalPatrons: 82, newPatrons: 31, repeatOrders: 51 },
  { month: "Jun", totalPatrons: 98, newPatrons: 34, repeatOrders: 64 },
  { month: "Jul", totalPatrons: 112, newPatrons: 38, repeatOrders: 74 },
  { month: "Aug", totalPatrons: 124, newPatrons: 42, repeatOrders: 82 },
  { month: "Sep", totalPatrons: 128, newPatrons: 29, repeatOrders: 99 },
];

export const PROTEIN_DISTRIBUTION = [
  { name: "Chicken Dum", value: 46, color: "#d97706", trays: 56, revenue: 5711.44 },
  { name: "Mutton Dum", value: 28, color: "#b91c1c", trays: 34, revenue: 5371.66 },
  { name: "Beef Dum", value: 16, color: "#d4a017", trays: 20, revenue: 2459.80 },
  { name: "Pork Dum", value: 10, color: "#ea580c", trays: 12, revenue: 1307.88 },
];

export interface BestSellingDish {
  id: string;
  name: string;
  category: string;
  rank: number;
  basePrice: number;
  traysSoldWeek: number;
  revenueWeek: number;
  alooRate: string;
  extraSpicyRate: string;
  rating: number;
  image: string;
}

export const BEST_SELLING_DISHES: BestSellingDish[] = [
  {
    id: "chicken",
    name: "Chicken Dum Biryani",
    category: "Signature Trays",
    rank: 1,
    basePrice: 101.99,
    traysSoldWeek: 56,
    revenueWeek: 5880.44,
    alooRate: "68%",
    extraSpicyRate: "45%",
    rating: 4.95,
    image: "/favicon.png",
  },
  {
    id: "mutton",
    name: "Mutton Dum Biryani",
    category: "Premium & Occasion",
    rank: 2,
    basePrice: 157.99,
    traysSoldWeek: 34,
    revenueWeek: 5490.66,
    alooRate: "82%",
    extraSpicyRate: "60%",
    rating: 4.98,
    image: "/favicon.png",
  },
  {
    id: "beef",
    name: "Beef Dum Biryani",
    category: "Signature Trays",
    rank: 3,
    basePrice: 122.99,
    traysSoldWeek: 20,
    revenueWeek: 2510.80,
    alooRate: "70%",
    extraSpicyRate: "52%",
    rating: 4.91,
    image: "/favicon.png",
  },
  {
    id: "pork",
    name: "Pork Dum Biryani",
    category: "Signature Trays",
    rank: 4,
    basePrice: 108.99,
    traysSoldWeek: 12,
    revenueWeek: 1340.88,
    alooRate: "55%",
    extraSpicyRate: "40%",
    rating: 4.88,
    image: "/favicon.png",
  },
];

export interface CustomerOrderHistoryItem {
  id: string;
  orderNumber: string;
  date: string;
  itemsSummary: string;
  trayCount: number;
  total: number;
  fulfilmentType: "pickup" | "delivery";
  status: OrderStatus;
  paymentStatus: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  favoriteProtein: string;
  preferredFulfilment: "Pickup" | "Delivery";
  lastOrderDate: string;
  status: "VIP Royal" | "Active Patron" | "Occasion Host" | "New Patron" | "Occasional";
  joinDate: string;
  avatarInitials: string;
  avatarBg: string;
  avatarText: string;
  spicePreference: "Mild & Fragrant" | "Medium Nizami" | "Extra Spicy Royal";
  dietaryNotes?: string;
  adminNotes?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  orderHistory: CustomerOrderHistoryItem[];
}

export const MOCK_CUSTOMERS: CustomerRecord[] = [
  {
    id: "cust_1",
    name: "Marcus Vance",
    email: "marcus.v@example.com",
    phone: "417-555-3921",
    totalOrders: 6,
    totalSpent: 980.50,
    favoriteProtein: "Mutton Dum Biryani",
    preferredFulfilment: "Delivery",
    lastOrderDate: "Today (Sep 23)",
    status: "VIP Royal",
    joinDate: "July 2025",
    avatarInitials: "MV",
    avatarBg: "bg-red-950/80 border-red-500/50",
    avatarText: "text-red-300",
    spicePreference: "Extra Spicy Royal",
    dietaryNotes: "Strict Halal, extra fried cashews & caramelized onions",
    adminNotes: "Hosts weekend executive dining gatherings. High average order value ($165+). Prefers delivery exactly on time.",
    address: "1420 E Sunshine St, Apt 3B",
    city: "Springfield",
    zipCode: "65804",
    orderHistory: [
      {
        id: "ord_101",
        orderNumber: "JK-2026-9812",
        date: "Today, 1:45 PM",
        itemsSummary: "1x Mutton Dum Biryani (Large Handi Tray + Extra Aloo)",
        trayCount: 1,
        total: 174.99,
        fulfilmentType: "delivery",
        status: "confirmed",
        paymentStatus: "Paid Online",
      },
      {
        id: "ord_092",
        orderNumber: "JK-2026-9712",
        date: "Sep 18, 2026",
        itemsSummary: "1x Mutton Dum Biryani, 1x Chicken Dum Biryani",
        trayCount: 2,
        total: 279.98,
        fulfilmentType: "delivery",
        status: "completed",
        paymentStatus: "Paid Online",
      },
      {
        id: "ord_081",
        orderNumber: "JK-2026-9602",
        date: "Sep 09, 2026",
        itemsSummary: "1x Mutton Dum Biryani",
        trayCount: 1,
        total: 164.99,
        fulfilmentType: "delivery",
        status: "completed",
        paymentStatus: "Paid Online",
      },
    ],
  },
  {
    id: "cust_2",
    name: "Ananya Patel",
    email: "ananya.patel@example.com",
    phone: "417-555-8492",
    totalOrders: 9,
    totalSpent: 1240.00,
    favoriteProtein: "Chicken Dum Biryani",
    preferredFulfilment: "Pickup",
    lastOrderDate: "Today (Sep 23)",
    status: "VIP Royal",
    joinDate: "May 2025",
    avatarInitials: "AP",
    avatarBg: "bg-amber-950/80 border-amber-500/50",
    avatarText: "text-amber-300",
    spicePreference: "Mild & Fragrant",
    dietaryNotes: "Prefers no extra green chili garnishes, mild for kids",
    adminNotes: "Always picks up on time at the front counter. Leaves 5-star reviews on Google and Yelp.",
    address: "3625 S Bedford Ave Area",
    city: "Springfield",
    zipCode: "65807",
    orderHistory: [
      {
        id: "ord_102",
        orderNumber: "JK-2026-9804",
        date: "Today, 12:15 PM",
        itemsSummary: "2x Chicken Dum Biryani (Mild Handi)",
        trayCount: 2,
        total: 203.98,
        fulfilmentType: "pickup",
        status: "preparing",
        paymentStatus: "Paid Online",
      },
      {
        id: "ord_089",
        orderNumber: "JK-2026-9689",
        date: "Sep 15, 2026",
        itemsSummary: "1x Chicken Dum Biryani",
        trayCount: 1,
        total: 101.99,
        fulfilmentType: "pickup",
        status: "completed",
        paymentStatus: "Paid Online",
      },
      {
        id: "ord_078",
        orderNumber: "JK-2026-9578",
        date: "Sep 02, 2026",
        itemsSummary: "2x Chicken Dum Biryani",
        trayCount: 2,
        total: 203.98,
        fulfilmentType: "pickup",
        status: "completed",
        paymentStatus: "Paid Online",
      },
    ],
  },
  {
    id: "cust_3",
    name: "David Sterling",
    email: "david.s@example.com",
    phone: "417-555-1104",
    totalOrders: 4,
    totalSpent: 560.20,
    favoriteProtein: "Beef Dum Biryani",
    preferredFulfilment: "Pickup",
    lastOrderDate: "Yesterday (Sep 22)",
    status: "Active Patron",
    joinDate: "August 2025",
    avatarInitials: "DS",
    avatarBg: "bg-emerald-950/80 border-emerald-500/50",
    avatarText: "text-emerald-300",
    spicePreference: "Medium Nizami",
    dietaryNotes: "Extra roasted whole baby potatoes (Aloo)",
    adminNotes: "Loves slow-cooked beef marrow pieces. Works nearby at Mercy Hospital medical center.",
    address: "2100 S Fremont Ave",
    city: "Springfield",
    zipCode: "65804",
    orderHistory: [
      {
        id: "ord_103",
        orderNumber: "JK-2026-9791",
        date: "Yesterday, 3:40 PM",
        itemsSummary: "1x Beef Dum Biryani (Spiced Handi)",
        trayCount: 1,
        total: 129.99,
        fulfilmentType: "pickup",
        status: "ready",
        paymentStatus: "Paid via Card",
      },
      {
        id: "ord_074",
        orderNumber: "JK-2026-9544",
        date: "Aug 28, 2026",
        itemsSummary: "1x Beef Dum Biryani, 1x Chicken Dum",
        trayCount: 2,
        total: 231.98,
        fulfilmentType: "pickup",
        status: "completed",
        paymentStatus: "Paid via Card",
      },
    ],
  },
  {
    id: "cust_4",
    name: "Elena Rostova",
    email: "elena.r@example.com",
    phone: "417-555-9012",
    totalOrders: 3,
    totalSpent: 420.00,
    favoriteProtein: "Chicken Dum Biryani",
    preferredFulfilment: "Delivery",
    lastOrderDate: "2 days ago (Sep 21)",
    status: "Active Patron",
    joinDate: "September 2025",
    avatarInitials: "ER",
    avatarBg: "bg-purple-950/80 border-purple-500/50",
    avatarText: "text-purple-300",
    spicePreference: "Mild & Fragrant",
    dietaryNotes: "Mild spice only. Extra Mirchi Ka Salan gravy side.",
    adminNotes: "Lives near MSU campus. Requests contactless drop-off on front porch.",
    address: "921 S Glenstone Ave",
    city: "Springfield",
    zipCode: "65802",
    orderHistory: [
      {
        id: "ord_104",
        orderNumber: "JK-2026-9780",
        date: "Sep 21, 2026",
        itemsSummary: "1x Chicken Dum Biryani + Extra Salan",
        trayCount: 1,
        total: 111.99,
        fulfilmentType: "delivery",
        status: "completed",
        paymentStatus: "Paid Online",
      },
    ],
  },
  {
    id: "cust_5",
    name: "Rajesh & Priya Sharma",
    email: "sharma.family@example.com",
    phone: "417-555-6677",
    totalOrders: 11,
    totalSpent: 1890.00,
    favoriteProtein: "Mutton Dum Biryani",
    preferredFulfilment: "Pickup",
    lastOrderDate: "3 days ago (Sep 20)",
    status: "Occasion Host",
    joinDate: "April 2025",
    avatarInitials: "RS",
    avatarBg: "bg-blue-950/80 border-blue-500/50",
    avatarText: "text-blue-300",
    spicePreference: "Extra Spicy Royal",
    dietaryNotes: "Strict 100% Zabiha Halal only, extra raita bowls",
    adminNotes: "Regularly orders 2-3 Handi trays for large family gatherings and weekend pujas.",
    address: "4420 E Chestnut Expy",
    city: "Springfield",
    zipCode: "65809",
    orderHistory: [
      {
        id: "ord_105",
        orderNumber: "JK-2026-9764",
        date: "Sep 20, 2026",
        itemsSummary: "2x Mutton Dum Biryani, 1x Paneer Royal Dum",
        trayCount: 3,
        total: 419.97,
        fulfilmentType: "pickup",
        status: "completed",
        paymentStatus: "Paid Online",
      },
      {
        id: "ord_061",
        orderNumber: "JK-2026-9421",
        date: "Aug 14, 2026",
        itemsSummary: "3x Mutton Dum Biryani",
        trayCount: 3,
        total: 494.97,
        fulfilmentType: "pickup",
        status: "completed",
        paymentStatus: "Paid Online",
      },
    ],
  },
  {
    id: "cust_6",
    name: "Dr. Bradley Hayes",
    email: "b.hayes@coxhealth.org",
    phone: "417-555-7731",
    totalOrders: 5,
    totalSpent: 730.00,
    favoriteProtein: "Pork Dum Biryani",
    preferredFulfilment: "Delivery",
    lastOrderDate: "Sep 19, 2026",
    status: "Active Patron",
    joinDate: "June 2025",
    avatarInitials: "BH",
    avatarBg: "bg-orange-950/80 border-orange-500/50",
    avatarText: "text-orange-300",
    spicePreference: "Medium Nizami",
    dietaryNotes: "Loves slow-braised pork belly cuts in roasted spices",
    adminNotes: "Orders for CoxHealth Friday surgery team lunch. High satisfaction score.",
    address: "3801 S National Ave",
    city: "Springfield",
    zipCode: "65807",
    orderHistory: [
      {
        id: "ord_106",
        orderNumber: "JK-2026-9742",
        date: "Sep 19, 2026",
        itemsSummary: "1x Pork Dum Biryani (Feast Tray)",
        trayCount: 1,
        total: 118.99,
        fulfilmentType: "delivery",
        status: "completed",
        paymentStatus: "Paid via Card",
      },
    ],
  },
  {
    id: "cust_7",
    name: "Sophia Martinez",
    email: "sophia.m@example.com",
    phone: "417-555-4309",
    totalOrders: 2,
    totalSpent: 245.98,
    favoriteProtein: "Beef Dum Biryani",
    preferredFulfilment: "Pickup",
    lastOrderDate: "Sep 17, 2026",
    status: "New Patron",
    joinDate: "September 2025",
    avatarInitials: "SM",
    avatarBg: "bg-rose-950/80 border-rose-500/50",
    avatarText: "text-rose-300",
    spicePreference: "Extra Spicy Royal",
    dietaryNotes: "Extra mirchi salan & fried mint leaves",
    adminNotes: "Discovered JAKLOUD through Instagram reels.",
    address: "1830 E Battlefield Rd",
    city: "Springfield",
    zipCode: "65804",
    orderHistory: [
      {
        id: "ord_107",
        orderNumber: "JK-2026-9720",
        date: "Sep 17, 2026",
        itemsSummary: "1x Beef Dum Biryani",
        trayCount: 1,
        total: 122.99,
        fulfilmentType: "pickup",
        status: "completed",
        paymentStatus: "Paid Online",
      },
    ],
  },
  {
    id: "cust_8",
    name: "Thomas Wright",
    email: "twright@example.com",
    phone: "417-555-8901",
    totalOrders: 1,
    totalSpent: 111.99,
    favoriteProtein: "Chicken Dum Biryani",
    preferredFulfilment: "Delivery",
    lastOrderDate: "Sep 16, 2026",
    status: "Occasional",
    joinDate: "September 2025",
    avatarInitials: "TW",
    avatarBg: "bg-zinc-900 border-zinc-700",
    avatarText: "text-zinc-400",
    spicePreference: "Mild & Fragrant",
    dietaryNotes: "No dairy allergy in raita",
    adminNotes: "Had one cancelled order due to schedule conflict, re-ordered following day.",
    address: "3100 S National Ave",
    city: "Springfield",
    zipCode: "65807",
    orderHistory: [
      {
        id: "ord_108",
        orderNumber: "JK-2026-9701",
        date: "Sep 16, 2026",
        itemsSummary: "1x Chicken Dum Biryani",
        trayCount: 1,
        total: 111.99,
        fulfilmentType: "delivery",
        status: "cancelled",
        paymentStatus: "Pending",
      },
    ],
  },
];

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "order" | "kitchen" | "alert" | "info";
  read: boolean;
}

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif_1",
    title: "New Tray Booking Placed",
    message: "Marcus Vance placed Order #JK-2026-9812 for Mutton Dum (Delivery)",
    time: "10 mins ago",
    type: "order",
    read: false,
  },
  {
    id: "notif_2",
    title: "Daily Limit Capacity Warning",
    message: "Kitchen has reached 76% of today's 25-tray dum capacity.",
    time: "45 mins ago",
    type: "kitchen",
    read: false,
  },
  {
    id: "notif_3",
    title: "Order Cutoff Approaching",
    message: "Today's 2:00 PM order cutoff is in 2 hours 15 mins.",
    time: "1 hour ago",
    type: "alert",
    read: true,
  },
  {
    id: "notif_4",
    title: "Fresh Saffron & Spice Delivery",
    message: "Royal Kashmiri saffron & cashew supply received for dum marinades.",
    time: "3 hours ago",
    type: "info",
    read: true,
  },
];
