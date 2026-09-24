import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Flame,
  Sparkles,
  DollarSign,
  ChevronLeft,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Copy,
  Tag,
  Eye,
  SlidersHorizontal,
  RefreshCw,
  ExternalLink,
  Layers,
  Scale,
  Users,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";
import heroBiryaniImg from "@/assets/hero-biryani.jpg";

import { useAuth } from "@/lib/auth";
import { formatMoney } from "@/lib/menu";
import { useDynamicMenu, type DynamicMenuItem as BiryaniMenuCard } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/menu")({
  head: () => ({
    meta: [
      { title: "Menu Management & Tray Pricing — JAKLOUD Spice King" },
      {
        name: "description",
        content: "Manage Biryani menu categories, tray sizes, availability, photos and live pricing.",
      },
    ],
  }),
  component: MenuManagementPage,
});

export interface BiryaniMenuCard {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  priceWithAloo: number;
  image: string;
  available: boolean;
  traySize: string;
  meatWeight: string;
  riceWeight: string;
  kcal: number;
  badge?: string;
  spiciness: "Mild" | "Medium" | "Extra Spicy";
  dailyLimit: number;
  traysSoldWeek: number;
}

const PRESET_GALLERY = [
  { label: "Golden Chicken Handi", url: chickenImg },
  { label: "Royal Mutton Copper Handi", url: muttonImg },
  { label: "Shahi Paneer Brass Platter", url: paneerImg },
  { label: "Jumbo King Prawn Clay Pot", url: prawnImg },
  { label: "Traditional Sealed Handi", url: dumHandiImg },
  { label: "Rich Spiced Dum Platter", url: heroBiryaniImg },
];

const INITIAL_BIRYANI_MENU: BiryaniMenuCard[] = [
  {
    id: "dish-chicken",
    name: "Royal Chicken Dum Biryani",
    category: "Signature Trays",
    description:
      "Our flagship slow-cooked Dum biryani. Tender marinated chicken leg & quarter cuts layered with saffron aged basmati, caramelized crispy onions, ghee-roasted cashews, and sealed with traditional wheat dough.",
    price: 101.99,
    priceWithAloo: 108.99,
    image: chickenImg,
    available: true,
    traySize: "Serves 4–5 Diners (Family Handi)",
    meatWeight: "1.6 kg Marinated Chicken",
    riceWeight: "1.0 kg Raw Aged Basmati",
    kcal: 1714,
    badge: "Top Seller",
    spiciness: "Medium",
    dailyLimit: 12,
    traysSoldWeek: 48,
  },
  {
    id: "dish-mutton",
    name: "Hyderabadi Shahi Mutton Dum Biryani",
    category: "Royal & Occasion",
    description:
      "The authentic Nizami celebration tray. Succulent bone-in baby goat mutton cuts slow-cooked on dum for 4 hours with heavy saffron, cloves, black cardamom, and pure desi ghee.",
    price: 157.99,
    priceWithAloo: 164.99,
    image: muttonImg,
    available: true,
    traySize: "Serves 4–5 Diners (Feast Tray)",
    meatWeight: "1.8 kg Baby Goat Cuts",
    riceWeight: "1.0 kg Raw Aged Basmati",
    kcal: 2054,
    badge: "Chef's Signature",
    spiciness: "Extra Spicy",
    dailyLimit: 8,
    traysSoldWeek: 34,
  },
  {
    id: "dish-paneer",
    name: "Royal Shahi Paneer Dum Biryani",
    category: "Shahi Vegetarian",
    description:
      "Tender cubes of grilled artisanal paneer infused with saffron masala, pomegranate seeds, toasted almonds, fresh mint, and slow-steamed long-grain basmati.",
    price: 92.99,
    priceWithAloo: 99.99,
    image: paneerImg,
    available: true,
    traySize: "Serves 4–5 Diners (Veg Handi)",
    meatWeight: "1.2 kg Fresh Artisanal Paneer",
    riceWeight: "1.0 kg Raw Aged Basmati",
    kcal: 1560,
    badge: "Vegetarian Gold",
    spiciness: "Medium",
    dailyLimit: 6,
    traysSoldWeek: 21,
  },
  {
    id: "dish-prawn",
    name: "Jumbo King Tiger Prawn Dum Biryani",
    category: "Seafood Specialties",
    description:
      "Jumbo wild-caught tiger prawns seared in spicy ghee roast masala, layered over aromatic yellow basmati, finished with lime zest, curry leaves, and whole star anise.",
    price: 148.99,
    priceWithAloo: 155.99,
    image: prawnImg,
    available: true,
    traySize: "Serves 4–5 Diners (Deluxe Handi)",
    meatWeight: "1.5 kg Wild Tiger Prawns",
    riceWeight: "1.0 kg Raw Aged Basmati",
    kcal: 1640,
    badge: "Weekend Reserve",
    spiciness: "Extra Spicy",
    dailyLimit: 5,
    traysSoldWeek: 16,
  },
  {
    id: "dish-beef",
    name: "Slow-Braised Prime Beef Dum Biryani",
    category: "Signature Trays",
    description:
      "Hearty and deeply spiced prime beef cuts slow-cooked until meltingly tender with caramelized shallots, nutmeg, and aromatic basmati grains.",
    price: 122.99,
    priceWithAloo: 129.99,
    image: dumHandiImg,
    available: true,
    traySize: "Serves 4–5 Diners (Family Handi)",
    meatWeight: "1.7 kg Prime Beef Cuts",
    riceWeight: "1.0 kg Raw Aged Basmati",
    kcal: 1952,
    badge: "Rich & Hearty",
    spiciness: "Medium",
    dailyLimit: 8,
    traysSoldWeek: 28,
  },
  {
    id: "dish-pork",
    name: "Smoked Masala Pork Dum Biryani",
    category: "Signature Trays",
    description:
      "Slow-simmered pork cuts with a rich, robust masala gravy, finished with toasted coriander, fresh mint, and fragrant saffron rice.",
    price: 108.99,
    priceWithAloo: 115.99,
    image: heroBiryaniImg,
    available: false,
    traySize: "Serves 4–5 Diners (Family Handi)",
    meatWeight: "1.6 kg Pork Cuts",
    riceWeight: "1.0 kg Raw Aged Basmati",
    kcal: 1952,
    badge: "Sold Out Today",
    spiciness: "Medium",
    dailyLimit: 6,
    traysSoldWeek: 19,
  },
];

const CATEGORIES = [
  "All Categories",
  "Signature Trays",
  "Royal & Occasion",
  "Shahi Vegetarian",
  "Seafood Specialties",
];

function MenuManagementPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Menu Items State from Dynamic Reactive Store
  const {
    items,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
  } = useDynamicMenu();

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BiryaniMenuCard | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("Signature Trays");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState<string>("101.99");
  const [formPriceWithAloo, setFormPriceWithAloo] = useState<string>("108.99");
  const [formImage, setFormImage] = useState<string>(chickenImg);
  const [formAvailable, setFormAvailable] = useState<boolean>(true);
  const [formTraySize, setFormTraySize] = useState("Serves 4–5 Diners (Family Handi)");
  const [formMeatWeight, setFormMeatWeight] = useState("1.6 kg Marinated Meat");
  const [formRiceWeight, setFormRiceWeight] = useState("1.0 kg Raw Basmati");
  const [formKcal, setFormKcal] = useState<string>("1750");
  const [formBadge, setFormBadge] = useState("");
  const [formSpiciness, setFormSpiciness] = useState<"Mild" | "Medium" | "Extra Spicy">("Medium");
  const [formDailyLimit, setFormDailyLimit] = useState<string>("10");

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BiryaniMenuCard | null>(null);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Open Modal for Create
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormName("");
    setFormCategory("Signature Trays");
    setFormDescription("");
    setFormPrice("109.99");
    setFormPriceWithAloo("116.99");
    setFormImage(chickenImg);
    setFormAvailable(true);
    setFormTraySize("Serves 4–5 Diners (Family Handi)");
    setFormMeatWeight("1.6 kg Marinated Meat");
    setFormRiceWeight("1.0 kg Raw Aged Basmati");
    setFormKcal("1800");
    setFormBadge("Chef's Special");
    setFormSpiciness("Medium");
    setFormDailyLimit("10");
    setModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item: BiryaniMenuCard) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormPrice(item.price.toString());
    setFormPriceWithAloo(item.priceWithAloo.toString());
    setFormImage(item.image);
    setFormAvailable(item.available);
    setFormTraySize(item.traySize);
    setFormMeatWeight(item.meatWeight);
    setFormRiceWeight(item.riceWeight);
    setFormKcal(item.kcal.toString());
    setFormBadge(item.badge || "");
    setFormSpiciness(item.spiciness);
    setFormDailyLimit(item.dailyLimit.toString());
    setModalOpen(true);
  };

  // Save / Update Biryani Item
  const handleSaveBiryani = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter a Biryani name.");
      return;
    }

    const priceNum = parseFloat(formPrice) || 99.99;
    const priceAlooNum = parseFloat(formPriceWithAloo) || priceNum + 7.0;
    const kcalNum = parseInt(formKcal, 10) || 1700;
    const limitNum = parseInt(formDailyLimit, 10) || 10;

    if (editingItem) {
      // Update existing item in reactive store
      updateMenuItem(editingItem.id, {
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        price: priceNum,
        priceWithAloo: priceAlooNum,
        image: formImage,
        available: formAvailable,
        traySize: formTraySize,
        meatWeight: formMeatWeight,
        riceWeight: formRiceWeight,
        kcal: kcalNum,
        badge: formBadge.trim() || undefined,
        spiciness: formSpiciness,
        dailyLimit: limitNum,
      });
      toast.success(`Updated "${formName}" in live menu catalog.`);
    } else {
      // Create new item in reactive store
      const genProteinId = formName.toLowerCase().replace(/[^a-z0-9]/g, "-");
      addMenuItem({
        proteinId: genProteinId,
        name: formName.trim(),
        category: formCategory,
        description: formDescription.trim(),
        price: priceNum,
        priceWithAloo: priceAlooNum,
        image: formImage,
        available: formAvailable,
        traySize: formTraySize,
        meatWeight: formMeatWeight,
        riceWeight: formRiceWeight,
        kcal: kcalNum,
        badge: formBadge.trim() || undefined,
        spiciness: formSpiciness,
        dailyLimit: limitNum,
      });
      toast.success(`Created new Biryani tray "${formName}"! Live in customer catalog.`);
    }

    setModalOpen(false);
  };

  // Toggle Availability in reactive store
  const handleToggleAvailability = (id: string) => {
    const nextState = toggleAvailability(id);
    toast.info(nextState ? "Tray marked Available for online ordering" : "Tray marked Sold Out");
  };

  // Confirm Delete from reactive store
  const handleConfirmDelete = () => {
    if (!itemToDelete) return;
    deleteMenuItem(itemToDelete.id);
    toast.error(`Removed "${itemToDelete.name}" from active menu.`);
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Filtered Dishes
  const filteredItems = useMemo(() => {
    return items.filter((dish) => {
      // Category filter
      if (selectedCategory !== "All Categories" && dish.category !== selectedCategory) {
        return false;
      }
      // Availability filter
      if (availabilityFilter === "available" && !dish.available) return false;
      if (availabilityFilter === "unavailable" && dish.available) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = dish.name.toLowerCase().includes(q);
        const matchDesc = dish.description.toLowerCase().includes(q);
        const matchCat = dish.category.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [items, selectedCategory, availabilityFilter, searchQuery]);

  // Quick Stats
  const stats = useMemo(() => {
    const total = items.length;
    const availableCount = items.filter((i) => i.available).length;
    const avgPrice = total > 0 ? items.reduce((s, i) => s + i.price, 0) / total : 0;
    const totalTraysSold = items.reduce((s, i) => s + i.traysSoldWeek, 0);
    return { total, availableCount, avgPrice, totalTraysSold };
  }, [items]);

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold pb-28">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gold/20 bg-[#120c08]/95 px-4 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-black/40 text-gold hover:bg-gold/15 transition-colors"
            title="Back to Overview"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>

          <Link to="/admin" className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="JAKLOUD"
              className="h-10 w-10 rounded-full border border-gold/50 bg-cream p-0.5 object-cover"
            />
            <div>
              <span className="font-display text-lg font-bold tracking-wider text-cream">
                JAKLOUD
              </span>
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gold">
                Menu & Tray Catalog
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-gold/30 bg-black/40 text-xs text-gold hover:bg-gold/15 gap-1.5 hidden sm:flex"
          >
            <Link to="/admin/proteins">
              <ShieldCheck className="h-3.5 w-3.5" /> Meat & Halal Cuts
            </Link>
          </Button>

          <Button
            onClick={handleOpenCreateModal}
            className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs shadow-lg shadow-chili/30 hover:scale-105 transition-all gap-1.5"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Add New Biryani
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-cream/70 hover:text-gold gap-1 hidden md:flex"
          >
            <Link to="/menu" target="_blank">
              <ExternalLink className="h-3.5 w-3.5 text-gold" /> Diner Menu
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 space-y-8">
        {/* Executive Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl border border-gold/30 bg-gradient-to-r from-[#170f0a] via-[#120c08] to-[#1a100a] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold font-semibold">
              <UtensilsCrossed className="h-3.5 w-3.5 text-gold" />
              <span>Biryani Portfolio & Capacity Control</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-4xl text-cream font-bold">
              Menu Management
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-cream/75 max-w-2xl leading-relaxed">
              Configure slow-cooked handi tray offerings, portion sizes, customized saffron aloo pricing, and live kitchen availability toggles.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleOpenCreateModal}
              size="lg"
              className="bg-gold text-black hover:bg-gold/90 font-bold text-xs px-5 shadow-lg shadow-gold/30"
            >
              <Plus className="h-4 w-4 mr-1.5 stroke-[3]" /> Create New Tray
            </Button>
          </div>
        </div>

        {/* 4 Analytics & KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gold/25 bg-[#120c08]/90 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                Total Biryani Trays
              </p>
              <div className="rounded-xl bg-gold/15 p-2 text-gold">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-cream">
              {stats.total} <span className="text-xs font-sans text-cream/60">Recipes</span>
            </h3>
            <p className="text-[0.65rem] text-cream/50 mt-1">
              Across {CATEGORIES.length - 1} culinary categories
            </p>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-[#120c08]/90 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] uppercase tracking-wider text-emerald-400 font-semibold">
                Active & In-Stock
              </p>
              <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-cream">
              {stats.availableCount}{" "}
              <span className="text-xs font-sans text-cream/60">/ {stats.total} Live</span>
            </h3>
            <p className="text-[0.65rem] text-emerald-400/80 mt-1">
              {Math.round((stats.availableCount / stats.total) * 100)}% Menu Availability
            </p>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-[#120c08]/90 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                Average Tray Price
              </p>
              <div className="rounded-xl bg-gold/15 p-2 text-gold">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-cream">
              {formatMoney(stats.avgPrice)}
            </h3>
            <p className="text-[0.65rem] text-cream/50 mt-1">
              Standard family tray (serves 4–5)
            </p>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-[#120c08]/90 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] uppercase tracking-wider text-saffron font-semibold">
                Weekly Volume
              </p>
              <div className="rounded-xl bg-saffron/15 p-2 text-saffron">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-cream">
              {stats.totalTraysSold}{" "}
              <span className="text-xs font-sans text-cream/60">Trays Dispatched</span>
            </h3>
            <p className="text-[0.65rem] text-saffron/90 mt-1">
              ~{formatMoney(stats.totalTraysSold * stats.avgPrice)} weekly gross
            </p>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-gold/20 pb-4">
          {CATEGORIES.map((cat) => {
            const count =
              cat === "All Categories"
                ? items.length
                : items.filter((i) => i.category === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all shrink-0 ${
                  isSelected
                    ? "bg-gradient-to-r from-chili via-saffron to-gold text-white shadow-lg shadow-chili/25 font-bold"
                    : "border border-gold/20 bg-[#120c08] text-cream/70 hover:border-gold/50 hover:text-cream"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[0.65rem] ${
                    isSelected ? "bg-black/30 text-white" : "bg-gold/15 text-gold"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-gold/20 bg-[#120c08]/90 p-4 shadow-lg backdrop-blur-xl">
          <div className="relative w-full sm:w-96">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
            <Input
              placeholder="Search recipes, cuts, spices, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-xl border-gold/25 bg-black/40 pl-10 pr-4 text-xs text-cream placeholder:text-cream/40 focus-visible:border-gold"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value as any)}
              className="h-10 rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="all">All Availability Status</option>
              <option value="available">In Stock & Active</option>
              <option value="unavailable">Sold Out / Paused</option>
            </select>

            <span className="text-xs text-cream/50 hidden sm:inline">
              Showing <strong className="text-gold">{filteredItems.length}</strong> trays
            </span>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* BIRYANI CARDS GRID (Large Food Photography + Rounded Cards)   */}
        {/* ------------------------------------------------------------- */}
        {filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-gold/20 bg-[#120c08]/80 p-16 text-center text-cream/60 space-y-3">
            <UtensilsCrossed className="mx-auto h-12 w-12 text-gold/40" />
            <h3 className="font-display text-xl text-cream font-bold">No Biryani Trays Found</h3>
            <p className="text-xs text-cream/50 max-w-md mx-auto">
              No recipes match the selected category and search keywords. Try adjusting your search or add a new recipe.
            </p>
            <Button
              onClick={handleOpenCreateModal}
              className="mt-4 bg-gold text-black hover:bg-gold/90 font-bold text-xs"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Add New Biryani
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((dish) => (
              <div
                key={dish.id}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-[#140e09]/95 shadow-xl transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
                  dish.available
                    ? "border-gold/25 hover:border-gold/60 shadow-black/80"
                    : "border-cream/10 opacity-75 grayscale-[20%]"
                }`}
              >
                {/* 1. Large Food Image Container */}
                <div className="relative h-60 w-full overflow-hidden bg-black/60">
                  <img
                    src={dish.image}
                    alt={dish.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140e09] via-transparent to-black/40" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-black/80 border border-gold/40 px-3 py-1 text-[0.65rem] font-bold text-gold uppercase tracking-wider backdrop-blur-md">
                      {dish.category}
                    </span>

                    {dish.badge && (
                      <span className="rounded-full bg-gradient-to-r from-chili to-saffron px-3 py-1 text-[0.65rem] font-bold text-white shadow-md shadow-chili/30">
                        ⭐ {dish.badge}
                      </span>
                    )}
                  </div>

                  {/* Status Overlay Indicator */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[0.7rem] font-semibold backdrop-blur-md border ${
                        dish.available
                          ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                          : "bg-chili/80 text-white border-chili/60"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          dish.available ? "bg-emerald-400 animate-ping" : "bg-white"
                        }`}
                      />
                      {dish.available ? "In Stock & Active" : "Sold Out / Paused"}
                    </span>

                    <span className="rounded-full bg-black/70 border border-gold/30 px-2.5 py-0.5 text-[0.65rem] font-mono text-gold backdrop-blur-md">
                      {dish.kcal} kcal
                    </span>
                  </div>
                </div>

                {/* 2. Card Content Body */}
                <div className="flex flex-1 flex-col p-5 space-y-4">
                  {/* Dish Title & Base Price */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-xl font-bold text-cream group-hover:text-gold transition-colors">
                        {dish.name}
                      </h3>
                      <div className="flex items-center gap-2 text-[0.7rem] text-gold/90 font-medium mt-0.5">
                        <Flame className="h-3.5 w-3.5 text-chili" />
                        <span>{dish.spiciness} Spice Profile</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-display text-xl font-bold text-gold">
                        {formatMoney(dish.price)}
                      </span>
                      <span className="block text-[0.65rem] text-cream/50 font-sans">
                        Standard Tray
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-cream/70 line-clamp-3 leading-relaxed">
                    {dish.description}
                  </p>

                  {/* Portion & Customization Specs Grid */}
                  <div className="rounded-2xl border border-gold/15 bg-black/40 p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-cream/80">
                      <span className="flex items-center gap-1.5 text-cream/60">
                        <Users className="h-3.5 w-3.5 text-gold" /> Tray Capacity:
                      </span>
                      <span className="font-semibold text-cream">{dish.traySize}</span>
                    </div>

                    <div className="flex items-center justify-between text-cream/80">
                      <span className="flex items-center gap-1.5 text-cream/60">
                        <Scale className="h-3.5 w-3.5 text-gold" /> Protein Cut:
                      </span>
                      <span className="font-semibold text-cream">{dish.meatWeight}</span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gold/10 pt-1.5 text-cream/80">
                      <span className="text-cream/60">With Golden Aloo Addon:</span>
                      <span className="font-mono font-bold text-saffron">
                        {formatMoney(dish.priceWithAloo)} (+$7)
                      </span>
                    </div>
                  </div>

                  {/* Availability Toggle & Action Buttons */}
                  <div className="mt-auto space-y-3 pt-2 border-t border-gold/15">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor={`toggle-${dish.id}`}
                        className="text-xs font-semibold text-cream/90 cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Available for Order</span>
                      </Label>
                      <Switch
                        id={`toggle-${dish.id}`}
                        checked={dish.available}
                        onCheckedChange={() => handleToggleAvailability(dish.id)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Button
                        onClick={() => handleOpenEditModal(dish)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-gold/30 bg-black/30 text-gold hover:bg-gold/15 text-xs font-semibold gap-1.5"
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Edit Recipe
                      </Button>

                      <Button
                        onClick={() => {
                          setItemToDelete(dish);
                          setDeleteDialogOpen(true);
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-chili/70 hover:bg-chili/20 hover:text-chili"
                        title="Delete Biryani"
                        aria-label="Delete Biryani"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* ADD / EDIT BIRYANI MODAL                                      */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="border-gold/30 bg-[#140e09] text-cream sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold font-semibold">
              <UtensilsCrossed className="h-4 w-4 text-gold" />
              <span>{editingItem ? "Recipe Configuration" : "New Culinary Addition"}</span>
            </div>
            <DialogTitle className="font-display text-2xl text-cream font-bold">
              {editingItem ? `Edit "${editingItem.name}"` : "Add New Dum Biryani Tray"}
            </DialogTitle>
            <DialogDescription className="text-xs text-cream/60">
              Set photo, portion specifications, custom aloo pricing, and diner tags.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBiryani} className="space-y-4 pt-2 text-xs">
            {/* 1. Image Selection & Preview */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gold uppercase tracking-wider">
                Biryani Photography
              </Label>

              <div className="flex flex-col sm:flex-row gap-4 items-center rounded-2xl border border-gold/20 bg-black/40 p-4">
                <div className="relative h-24 w-32 rounded-xl overflow-hidden border border-gold/30 shrink-0">
                  <img src={formImage} alt="Preview" className="h-full w-full object-cover" />
                  <span className="absolute bottom-1 right-1 rounded bg-black/70 px-1 text-[0.6rem] text-gold font-mono">
                    Active
                  </span>
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <p className="text-cream/80 text-[0.7rem]">
                    Choose from Master Chef photo gallery or provide a custom image URL:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_GALLERY.map((gal, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormImage(gal.url)}
                        className={`rounded-lg px-2.5 py-1 text-[0.65rem] font-medium transition-all ${
                          formImage === gal.url
                            ? "bg-gold text-black font-bold shadow-md shadow-gold/30"
                            : "border border-gold/20 bg-black/50 text-cream/70 hover:border-gold/40"
                        }`}
                      >
                        {gal.label}
                      </button>
                    ))}
                  </div>

                  <Input
                    placeholder="Or paste custom image URL (https://...)"
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="h-8 rounded-lg border-gold/25 bg-black/50 text-xs text-cream"
                  />
                </div>
              </div>
            </div>

            {/* 2. Name & Category */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="dish-name" className="text-xs text-cream/80">
                  Biryani Name *
                </Label>
                <Input
                  id="dish-name"
                  placeholder="e.g. Awadhi Mutton Dum Biryani"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="dish-category" className="text-xs text-cream/80">
                  Category
                </Label>
                <select
                  id="dish-category"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full h-9 rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="Signature Trays">Signature Trays</option>
                  <option value="Royal & Occasion">Royal & Occasion</option>
                  <option value="Shahi Vegetarian">Shahi Vegetarian</option>
                  <option value="Seafood Specialties">Seafood Specialties</option>
                  <option value="Chef Reserve">Chef Reserve</option>
                </select>
              </div>
            </div>

            {/* 3. Description */}
            <div className="space-y-1">
              <Label htmlFor="dish-desc" className="text-xs text-cream/80">
                Detailed Culinary Description & Marination
              </Label>
              <Textarea
                id="dish-desc"
                rows={3}
                placeholder="Describe the marination, saffron basmati layering, ghee garnishes..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream placeholder:text-cream/40"
              />
            </div>

            {/* 4. Pricing & Aloo Addon */}
            <div className="grid gap-3 sm:grid-cols-3 rounded-2xl border border-gold/20 bg-black/40 p-4">
              <div className="space-y-1">
                <Label htmlFor="dish-price" className="text-xs text-gold font-semibold">
                  Standard Tray Price ($) *
                </Label>
                <Input
                  id="dish-price"
                  type="number"
                  step="0.01"
                  value={formPrice}
                  onChange={(e) => {
                    setFormPrice(e.target.value);
                    const p = parseFloat(e.target.value) || 0;
                    setFormPriceWithAloo((p + 7).toFixed(2));
                  }}
                  required
                  className="rounded-xl border-gold/30 bg-black/50 text-xs font-mono font-bold text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="dish-price-aloo" className="text-xs text-saffron font-semibold">
                  Price with Golden Aloo ($)
                </Label>
                <Input
                  id="dish-price-aloo"
                  type="number"
                  step="0.01"
                  value={formPriceWithAloo}
                  onChange={(e) => setFormPriceWithAloo(e.target.value)}
                  className="rounded-xl border-gold/30 bg-black/50 text-xs font-mono font-bold text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="dish-daily-limit" className="text-xs text-cream/80">
                  Daily Oven Limit (Trays)
                </Label>
                <Input
                  id="dish-daily-limit"
                  type="number"
                  value={formDailyLimit}
                  onChange={(e) => setFormDailyLimit(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/50 text-xs text-cream"
                />
              </div>
            </div>

            {/* 5. Portion Sizes & Weights */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="tray-size" className="text-xs text-cream/80">
                  Tray Size Label
                </Label>
                <Input
                  id="tray-size"
                  value={formTraySize}
                  onChange={(e) => setFormTraySize(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="meat-weight" className="text-xs text-cream/80">
                  Meat / Protein Cut Weight
                </Label>
                <Input
                  id="meat-weight"
                  value={formMeatWeight}
                  onChange={(e) => setFormMeatWeight(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="kcal" className="text-xs text-cream/80">
                  Approx Calories (kcal)
                </Label>
                <Input
                  id="kcal"
                  type="number"
                  value={formKcal}
                  onChange={(e) => setFormKcal(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                />
              </div>
            </div>

            {/* 6. Spiciness, Badge Tag & Availability */}
            <div className="grid gap-3 sm:grid-cols-3 items-center rounded-2xl border border-gold/20 bg-black/40 p-4">
              <div className="space-y-1">
                <Label htmlFor="spiciness" className="text-xs text-cream/80">
                  Spice Profile
                </Label>
                <select
                  id="spiciness"
                  value={formSpiciness}
                  onChange={(e) => setFormSpiciness(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-gold/25 bg-black/50 px-2 text-xs text-cream focus:outline-none cursor-pointer"
                >
                  <option value="Mild">Mild / Shahi</option>
                  <option value="Medium">Medium Signature</option>
                  <option value="Extra Spicy">Extra Spicy Masala</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="badge-tag" className="text-xs text-cream/80">
                  Badge Tag (Optional)
                </Label>
                <Input
                  id="badge-tag"
                  placeholder="e.g. Best Seller, New"
                  value={formBadge}
                  onChange={(e) => setFormBadge(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/50 text-xs text-cream"
                />
              </div>

              <div className="flex items-center justify-between sm:justify-center gap-3 pt-4 sm:pt-0">
                <Label htmlFor="form-available" className="text-xs font-semibold text-gold cursor-pointer">
                  Online In-Stock
                </Label>
                <Switch
                  id="form-available"
                  checked={formAvailable}
                  onCheckedChange={setFormAvailable}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </div>

            {/* Modal Footer Actions */}
            <DialogFooter className="flex flex-row justify-end gap-2 pt-3 border-t border-gold/15">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs shadow-md shadow-chili/30"
              >
                {editingItem ? "Save Changes" : "Publish to Menu"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* DELETE CONFIRMATION DIALOG                                    */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-chili/40 bg-[#140e09] text-cream sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-chili/10 text-chili mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center font-display text-xl text-cream">
              Delete "{itemToDelete?.name}"?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-cream/70 pt-1">
              This will remove this Dum Biryani recipe from the diner ordering catalog. You can re-create or pause availability anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
            >
              Keep Recipe
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-chili text-white hover:bg-chili/90 text-xs font-semibold"
            >
              Confirm Deletion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
