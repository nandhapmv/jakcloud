import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  ChefHat,
  Clock,
  DollarSign,
  Flame,
  LogOut,
  Mail,
  MapPin,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Truck,
  UserCheck,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LayoutDashboard,
  MenuSquare,
  Users,
  BarChart3,
  Settings,
  Search,
  Bell,
  Sliders,
  Filter,
  Eye,
  TrendingUp,
  Percent,
  Calendar,
  Phone,
  Shield,
  Layers,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Info,
  Edit,
  Save,
  Check,
  X,
  Send,
  Trash2,
  Archive,
  History,
  Store,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import heroImg from "@/assets/hero-biryani.jpg";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";
import { useAuth } from "@/lib/auth";
import {
  api,
  type AdminStats,
  type OrderResponse,
  type OrderStatus,
  type ContactMessageResponse,
} from "@/lib/api";
import {
  useDynamicOrders,
  useKitchenSettings,
  useDynamicMenu,
  useDynamicCustomers,
  normalizeDateKey,
  type DynamicOrder,
  type DynamicMenuItem,
} from "@/lib/store";
import {
  INITIAL_NOTIFICATIONS,
  type NotificationItem,
  type CustomerRecord,
} from "@/lib/admin-data";
import { MENU, formatMoney, BUSINESS } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type NavSection =
  | "dashboard"
  | "orders"
  | "menu"
  | "customers"
  | "delivery"
  | "reports"
  | "settings";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Restaurant Command & Analytics — JAKloud J Paradize" },
      {
        name: "description",
        content: "Executive restaurant management dashboard for JAKloud J Paradize Dum Biryani.",
      },
    ],
  }),
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Client mount state to ensure 100% hydration match with server
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Navigation & UI state
  const [activeSection, setActiveSection] = useState<NavSection>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Live reactive store hooks
  const { orders, stats: dynamicStats, updateStatus, deleteOrder, purgeTestOrders, reload } = useDynamicOrders();
  const { settings, updateSettings } = useKitchenSettings();
  const { customers: dynamicCustomers } = useDynamicCustomers();
  const {
    items: dynamicMenuItems,
    isSyncing: menuSyncing,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleMenuItemAvailability,
    refreshFromBackend: refreshMenuFromBackend,
  } = useDynamicMenu();

  const [messages, setMessages] = useState<ContactMessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderResponse | null>(null);

  // Today key for daily capacity tracking & rollover
  const todayKey = useMemo(() => normalizeDateKey(new Date()), []);

  // Kitchen settings state directly bound to reactive store (defaults to 10 trays)
  const dailyLimit = settings.dailyTrayLimit || 10;
  const activeDailyLimit = useMemo(() => {
    if (settings?.dateLimits && settings.dateLimits[todayKey]) {
      return Number(settings.dateLimits[todayKey]);
    }
    return Number(settings.dailyTrayLimit) || 10;
  }, [settings, todayKey]);
  const kitchenOpen = settings.isKitchenOpen;
  const orderCutoffHour = settings.orderCutoffHour;

  // Editable settings inputs
  const [dailyLimitInput, setDailyLimitInput] = useState<number>(settings.dailyTrayLimit || 10);
  const [kitchenOpenInput, setKitchenOpenInput] = useState<boolean>(settings.isKitchenOpen);
  const [cutoffHourInput, setCutoffHourInput] = useState<number>(settings.orderCutoffHour || 15);
  const [deliveryFeeInput, setDeliveryFeeInput] = useState<number>(settings.deliveryFee !== undefined ? Number(settings.deliveryFee) : 10);

  useEffect(() => {
    if (settings.dailyTrayLimit) setDailyLimitInput(settings.dailyTrayLimit);
    setKitchenOpenInput(settings.isKitchenOpen);
    if (settings.orderCutoffHour) setCutoffHourInput(settings.orderCutoffHour);
    if (settings.deliveryFee !== undefined) setDeliveryFeeInput(Number(settings.deliveryFee));
  }, [settings]);

  // Dashboard Overview Date-wise Filter State
  type DashboardDateFilter = "all" | "today" | "tomorrow" | "yesterday" | "last7" | "this_month" | "custom";
  const [dashDateFilter, setDashDateFilter] = useState<DashboardDateFilter>("today");
  const [customDate, setCustomDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Today & Tomorrow keys for capacity and queue filtering
  const tomorrowKey = useMemo(() => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return normalizeDateKey(tmrw);
  }, []);

  const todayDateFormatted = useMemo(() => {
    return new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }, []);

  const tomorrowDateFormatted = useMemo(() => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    return tmrw.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  }, []);

  const tomorrowLimit = useMemo(() => {
    if (settings?.dateLimits && settings.dateLimits[tomorrowKey]) {
      return Number(settings.dateLimits[tomorrowKey]);
    }
    return Number(settings.dailyTrayLimit) || 10;
  }, [settings, tomorrowKey]);

  // Orders tab filters (Default to "today" so past orders are hidden by default)
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [ordersDateFilter, setOrdersDateFilter] = useState<string>("today");
  const [ordersCustomDate, setOrdersCustomDate] = useState<string>("");
  const [selectedDishFilter, setSelectedDishFilter] = useState<string>("all");

  // Menu & Tray Pricing Management State
  const [menuSearchQuery, setMenuSearchQuery] = useState("");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState("all");
  const [menuAvailFilter, setMenuAvailFilter] = useState<"all" | "active" | "inactive">("all");

  // Modal State for Add / Edit Dish
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<DynamicMenuItem | null>(null);

  // Form Fields (Empty by default for adding new items!)
  const [mFormName, setMFormName] = useState("");
  const [mFormCategory, setMFormCategory] = useState("Signature Trays");
  const [mFormDescription, setMFormDescription] = useState("");
  const [mFormPrice, setMFormPrice] = useState("");
  const [mFormPriceWithAloo, setMFormPriceWithAloo] = useState("");
  const [mFormImage, setMFormImage] = useState("");
  const [mFormAvailable, setMFormAvailable] = useState(true);
  const [mFormTraySize, setMFormTraySize] = useState("");
  const [mFormMeatWeight, setMFormMeatWeight] = useState("");
  const [mFormRiceWeight, setMFormRiceWeight] = useState("");
  const [mFormKcal, setMFormKcal] = useState("");
  const [mFormBadge, setMFormBadge] = useState("");
  const [mFormSpiciness, setMFormSpiciness] = useState<"Mild" | "Medium" | "Extra Spicy">("Medium");
  const [mFormDailyLimit, setMFormDailyLimit] = useState("");
  const [mFormIsHalal, setMFormIsHalal] = useState(true);
  const [isSavingDish, setIsSavingDish] = useState(false);

  // Delete Dish State
  const [menuDeleteOpen, setMenuDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<DynamicMenuItem | null>(null);
  const [isDeletingDish, setIsDeletingDish] = useState(false);

  // Handlers for Add / Edit / Delete
  const handleOpenAddDishModal = () => {
    setEditingMenuItem(null);
    setMFormName("");
    setMFormCategory("Signature Trays");
    setMFormDescription("");
    setMFormPrice("");
    setMFormPriceWithAloo("");
    setMFormImage("");
    setMFormAvailable(true);
    setMFormTraySize("");
    setMFormMeatWeight("");
    setMFormRiceWeight("");
    setMFormKcal("");
    setMFormBadge("");
    setMFormSpiciness("Medium");
    setMFormDailyLimit("");
    setMFormIsHalal(true);
    setMenuModalOpen(true);
  };

  const handleOpenEditDishModal = (item: DynamicMenuItem) => {
    setEditingMenuItem(item);
    setMFormName(item.name || "");
    setMFormCategory(item.category || "Signature Trays");
    setMFormDescription(item.description || "");
    setMFormPrice(item.price !== undefined ? String(item.price) : "");
    setMFormPriceWithAloo(item.priceWithAloo !== undefined ? String(item.priceWithAloo) : "");
    setMFormImage(item.image || "");
    setMFormAvailable(item.available !== false);
    setMFormTraySize(item.traySize || item.serves || "");
    setMFormMeatWeight(item.meatWeight || "");
    setMFormRiceWeight(item.riceWeight || "");
    setMFormKcal(item.kcal ? String(item.kcal) : "");
    setMFormBadge(item.badge || "");
    setMFormSpiciness(item.spiciness || "Medium");
    setMFormDailyLimit(item.dailyLimit ? String(item.dailyLimit) : "10");
    setMFormIsHalal(item.isHalalCertified !== false);
    setMenuModalOpen(true);
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mFormName.trim()) {
      toast.error("Please enter a Biryani Tray name.");
      return;
    }
    const numPrice = parseFloat(mFormPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error("Please enter a valid base price.");
      return;
    }
    const numPriceWithAloo = mFormPriceWithAloo ? parseFloat(mFormPriceWithAloo) : numPrice + 7;
    const numDailyLimit = parseInt(mFormDailyLimit, 10) || 10;
    const numKcal = parseInt(mFormKcal, 10) || 1700;

    setIsSavingDish(true);
    try {
      const payload = {
        name: mFormName.trim(),
        proteinId: mFormName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        category: mFormCategory || "Signature Trays",
        description: mFormDescription.trim(),
        price: numPrice,
        priceWithAloo: numPriceWithAloo,
        image: mFormImage.trim() || chickenImg,
        available: mFormAvailable,
        traySize: mFormTraySize.trim() || "Serves 4–5 Diners (Family Handi)",
        serves: mFormTraySize.trim() || "Serves 4–5",
        meatWeight: mFormMeatWeight.trim(),
        riceWeight: mFormRiceWeight.trim() || "1.0 kg Raw Aged Basmati",
        kcal: numKcal,
        badge: mFormBadge.trim(),
        spiciness: mFormSpiciness,
        dailyLimit: numDailyLimit,
        isHalalCertified: mFormIsHalal,
      };

      if (editingMenuItem) {
        await updateMenuItem(editingMenuItem.id, payload);
        toast.success(`'${mFormName}' updated in database!`);
      } else {
        await addMenuItem(payload);
        toast.success(`New dish '${mFormName}' saved to database!`);
      }
      setMenuModalOpen(false);
    } catch (err: any) {
      toast.error("Failed to save menu dish: " + (err?.message || "Unknown error"));
    } finally {
      setIsSavingDish(false);
    }
  };

  const handleOpenDeleteDishModal = (item: DynamicMenuItem) => {
    setItemToDelete(item);
    setMenuDeleteOpen(true);
  };

  const handleConfirmDeleteDish = async () => {
    if (!itemToDelete) return;
    setIsDeletingDish(true);
    try {
      const ok = await deleteMenuItem(itemToDelete.id);
      if (ok) {
        toast.success(`'${itemToDelete.name}' deleted from database.`);
      } else {
        toast.error("Could not delete dish.");
      }
      setMenuDeleteOpen(false);
      setItemToDelete(null);
    } catch (err: any) {
      toast.error("Failed to delete dish: " + (err?.message || "Unknown error"));
    } finally {
      setIsDeletingDish(false);
    }
  };

  const filteredMenuItems = useMemo(() => {
    if (!Array.isArray(dynamicMenuItems)) return [];
    return dynamicMenuItems.filter((item) => {
      if (!item) return false;
      if (menuCategoryFilter !== "all" && item.category !== menuCategoryFilter) return false;
      if (menuAvailFilter === "active" && !item.available) return false;
      if (menuAvailFilter === "inactive" && item.available) return false;
      if (menuSearchQuery.trim()) {
        const q = menuSearchQuery.toLowerCase().trim();
        const matchName = (item.name || "").toLowerCase().includes(q);
        const matchDesc = (item.description || "").toLowerCase().includes(q);
        const matchCat = (item.category || "").toLowerCase().includes(q);
        const matchBadge = (item.badge || "").toLowerCase().includes(q);
        return matchName || matchDesc || matchCat || matchBadge;
      }
      return true;
    });
  }, [dynamicMenuItems, menuCategoryFilter, menuAvailFilter, menuSearchQuery]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load messages & sync
  const loadData = async (showToast = false) => {
    try {
      setIsRefreshing(true);
      reload();
      const messagesRes = await api.getContactMessages();
      setMessages(messagesRes.messages);

      if (showToast) {
        toast.success("Live kitchen metrics updated.");
      }
    } catch {
      /* ignore */
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Update order status directly through store
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateStatus(orderId, newStatus);
    toast.success(`Order status updated to "${newStatus}".`);
    if (selectedOrderDetails?.id === orderId) {
      setSelectedOrderDetails((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleToggleKitchenOpen = (next: boolean) => {
    updateSettings({ isKitchenOpen: next });
    toast.info(next ? "Live Online Ordering is now OPEN." : "Emergency Kitchen Pause ACTIVATED.");
  };

  const handleChangeDailyLimit = (newLimit: number) => {
    updateSettings({ dailyTrayLimit: newLimit });
    toast.success(`Daily Dum capacity set to ${newLimit} handi trays.`);
  };

  // Calculated stats object for backwards-compatibility
  const stats = dynamicStats;

  // Calculated metrics strictly for today's orders (resets automatically each new day)
  const todayTraysBooked = useMemo(() => {
    return orders.reduce((sum, o) => {
      if (o.status === "cancelled") return sum;
      const orderDateKey = normalizeDateKey(o.fulfilmentDate) || normalizeDateKey(o.createdAt);
      if (orderDateKey === todayKey) {
        return sum + (o.items || []).reduce((s, i) => s + (Number(i.qty) || 0), 0);
      }
      return sum;
    }, 0);
  }, [orders, todayKey]);

  const capacityPercentage = activeDailyLimit > 0 ? Math.min(100, Math.round((todayTraysBooked / activeDailyLimit) * 100)) : 0;
  const totalTraysBooked = todayTraysBooked;

  // Real-time Date-Filtered Orders for Executive Analytics
  const dateFilteredOrders = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const todayStr = new Date().toDateString();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIso = tomorrow.toISOString().slice(0, 10);
    const tomorrowStr = tomorrow.toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = yesterday.toISOString().slice(0, 10);
    const yesterdayStr = yesterday.toDateString();

    return orders.filter((o) => {
      if (o.status === "cancelled") return false;

      const orderCreatedIso = new Date(o.createdAt).toISOString().slice(0, 10);
      const orderCreatedStr = new Date(o.createdAt).toDateString();
      const orderFulfil = (o.fulfilmentDate || "").toLowerCase();

      switch (dashDateFilter) {
        case "all":
          return true;
        case "today":
          return (
            orderCreatedIso === todayIso ||
            orderCreatedStr === todayStr ||
            orderFulfil.includes("today") ||
            orderFulfil.includes(todayIso)
          );
        case "tomorrow":
          return (
            orderCreatedIso === tomorrowIso ||
            orderCreatedStr === tomorrowStr ||
            orderFulfil.includes("tomorrow") ||
            orderFulfil.includes(tomorrowIso)
          );
        case "yesterday":
          return (
            orderCreatedIso === yesterdayIso ||
            orderCreatedStr === yesterdayStr ||
            orderFulfil.includes(yesterdayIso)
          );
        case "last7": {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          return new Date(o.createdAt).getTime() >= sevenDaysAgo.getTime();
        }
        case "this_month": {
          const now = new Date();
          const oDate = new Date(o.createdAt);
          return oDate.getFullYear() === now.getFullYear() && oDate.getMonth() === now.getMonth();
        }
        case "custom": {
          if (!customDate) return true;
          return (
            orderCreatedIso === customDate ||
            orderFulfil.includes(customDate)
          );
        }
        default:
          return true;
      }
    });
  }, [orders, dashDateFilter, customDate]);

  const dateFilterLabel = useMemo(() => {
    switch (dashDateFilter) {
      case "today":
        return "Today";
      case "tomorrow":
        return "Tomorrow";
      case "yesterday":
        return "Yesterday";
      case "last7":
        return "Past 7 Days";
      case "this_month":
        return "This Month";
      case "all":
        return "All Time";
      case "custom":
        return customDate || "Custom Date";
      default:
        return "Selected Period";
    }
  }, [dashDateFilter, customDate]);

  // Dynamic Metrics for Selected Timeframe
  const filteredTraysBooked = useMemo(() => {
    return dateFilteredOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);
  }, [dateFilteredOrders]);

  const filteredPendingCount = useMemo(() => {
    return dateFilteredOrders.filter((o) => o.status === "confirmed" || o.status === "preparing" || o.status === "dum_cooking").length;
  }, [dateFilteredOrders]);

  const filteredPickupCount = useMemo(() => {
    return dateFilteredOrders
      .filter((o) => o.fulfilmentType === "pickup")
      .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);
  }, [dateFilteredOrders]);

  const filteredDeliveryCount = useMemo(() => {
    return dateFilteredOrders
      .filter((o) => o.fulfilmentType === "delivery")
      .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);
  }, [dateFilteredOrders]);

  const filteredRevenue = useMemo(() => {
    return dateFilteredOrders.reduce((sum, o) => sum + o.total, 0);
  }, [dateFilteredOrders]);

  const filteredDinersCount = useMemo(() => {
    const set = new Set<string>();
    dateFilteredOrders.forEach((o) => {
      const key = o.customer.phone || o.customer.email || o.customer.name;
      if (key) set.add(key.toLowerCase().trim());
    });
    return set.size;
  }, [dateFilteredOrders]);

  const uniqueDinersCount = useMemo(() => {
    const set = new Set<string>();
    orders.forEach((o) => {
      const key = o.customer.phone || o.customer.email || o.customer.name;
      if (key) set.add(key.toLowerCase().trim());
    });
    return set.size;
  }, [orders]);

  // Dynamic Best Selling Dum Biryanis Aggregated from Live Database Orders
  const dynamicBestSellingDishes = useMemo(() => {
    const salesByDish: Record<string, { trays: number; revenue: number; dishName: string; basePrice: number }> = {};
    
    // Seed with current menu items so real dishes appear
    dynamicMenuItems.forEach((item) => {
      salesByDish[item.id] = {
        dishName: item.name,
        basePrice: item.price,
        trays: 0,
        revenue: 0,
      };
    });

    // Count actual sales from database
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      o.items.forEach((it) => {
        const key = it.dishId || it.name;
        if (!salesByDish[key]) {
          salesByDish[key] = {
            dishName: it.name,
            basePrice: it.unitPrice || 0,
            trays: 0,
            revenue: 0,
          };
        }
        salesByDish[key].trays += it.qty;
        salesByDish[key].revenue += (it.unitPrice || salesByDish[key].basePrice) * it.qty;
      });
    });

    const list = Object.values(salesByDish).sort((a, b) => b.trays - a.trays || b.revenue - a.revenue);
    return list.slice(0, 4).map((d, idx) => ({
      id: d.dishName,
      rank: idx + 1,
      name: d.dishName,
      basePrice: d.basePrice,
      traysSold: d.trays,
      revenue: d.revenue,
    }));
  }, [orders, dynamicMenuItems]);

  // Real 7-day sales aggregation from database
  const dynamicWeeklySalesData = useMemo(() => {
    const days: { day: string; dateStr: string; revenue: number; trays: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
      const dateStr = d.toDateString();
      days.push({ day: dayName, dateStr, revenue: 0, trays: 0 });
    }

    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      const orderDateStr = new Date(o.createdAt).toDateString();
      const match = days.find((d) => d.dateStr === orderDateStr);
      if (match) {
        match.revenue += o.total;
        match.trays += o.items.reduce((s, it) => s + it.qty, 0);
      }
    });

    return days.map(({ day, revenue, trays }) => ({
      day,
      revenue: Math.round(revenue * 100) / 100,
      trays,
    }));
  }, [orders]);

  // Real protein breakdown from actual database orders
  const dynamicProteinData = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.status === "cancelled") return;
      o.items.forEach((item) => {
        const name = item.name.replace(/Dum Biryani|Royal|Hyderabadi|Slow-Braised|Artisanal|\(Veg\)/gi, "").trim() || item.name;
        counts[name] = (counts[name] || 0) + item.qty;
      });
    });

    const entries = Object.entries(counts);
    if (entries.length === 0) {
      return [
        { name: "Chicken Dum", value: 1, color: "#d4a017" },
        { name: "Mutton Dum", value: 1, color: "#b91c1c" },
        { name: "Beef Dum", value: 1, color: "#ea580c" },
        { name: "Paneer / Seafood", value: 1, color: "#10b981" },
      ];
    }

    const palette = ["#d4a017", "#b91c1c", "#ea580c", "#10b981", "#3b82f6", "#a855f7"];
    return entries.map(([name, value], idx) => ({
      name,
      value,
      color: palette[idx % palette.length]!,
    }));
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const todayIso = new Date().toISOString().slice(0, 10);
    const todayStr = new Date().toDateString();

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowIso = tomorrow.toISOString().slice(0, 10);
    const tomorrowStr = tomorrow.toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayIso = yesterday.toISOString().slice(0, 10);
    const yesterdayStr = yesterday.toDateString();

    return orders.filter((o) => {
      // 1. Status Filter
      if (orderStatusFilter !== "all" && o.status !== orderStatusFilter) return false;

      // 2. Dish/Item Filter
      if (selectedDishFilter !== "all") {
        const dishFilterLower = selectedDishFilter.toLowerCase();
        const hasDish = o.items.some((it) => {
          const itName = it.name.trim().toLowerCase();
          const itProtein = (it.proteinId || "").toLowerCase();
          return itName.includes(dishFilterLower) || itProtein === dishFilterLower;
        });
        if (!hasDish) return false;
      }

      // 3. Date Filter (matches fulfilmentDate primarily, fallback createdAt)
      const orderDateKey = normalizeDateKey(o.fulfilmentDate) || normalizeDateKey(o.createdAt);

      if (ordersDateFilter === "today") {
        if (orderDateKey !== todayKey) return false;
      } else if (ordersDateFilter === "tomorrow") {
        if (orderDateKey !== tomorrowKey) return false;
      } else if (ordersDateFilter === "upcoming") {
        if (orderDateKey <= todayKey) return false;
      } else if (ordersDateFilter === "past") {
        const isPast = orderDateKey < todayKey || o.status === "completed" || o.status === "cancelled";
        if (!isPast) return false;
      } else if (ordersDateFilter === "custom" && ordersCustomDate) {
        if (orderDateKey !== ordersCustomDate) return false;
      }
      // If "all", no date filtering

      // 4. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q) ||
          o.items.some((i) => i.name.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [orders, orderStatusFilter, ordersDateFilter, ordersCustomDate, selectedDishFilter, searchQuery, todayKey, tomorrowKey]);

  // Timeline stats for quick day tabs
  const timelineStats = useMemo(() => {
    let todayTrays = 0;
    let todayOrdersCount = 0;
    let tomorrowTrays = 0;
    let tomorrowOrdersCount = 0;
    let upcomingTrays = 0;
    let upcomingOrdersCount = 0;
    let pastTrays = 0;
    let pastOrdersCount = 0;

    orders.forEach((o) => {
      const dateKey = normalizeDateKey(o.fulfilmentDate) || normalizeDateKey(o.createdAt);
      const isPast = dateKey < todayKey || o.status === "completed" || o.status === "cancelled";
      const qty = o.status !== "cancelled" ? (o.items || []).reduce((s, it) => s + (Number(it.qty) || 1), 0) : 0;

      if (dateKey === todayKey && o.status !== "cancelled") {
        todayTrays += qty;
        todayOrdersCount += 1;
      } else if (dateKey === tomorrowKey && o.status !== "cancelled") {
        tomorrowTrays += qty;
        tomorrowOrdersCount += 1;
      } else if (dateKey > todayKey && o.status !== "cancelled") {
        upcomingTrays += qty;
        upcomingOrdersCount += 1;
      }

      if (isPast) {
        pastTrays += qty;
        pastOrdersCount += 1;
      }
    });

    return {
      todayTrays,
      todayOrdersCount,
      tomorrowTrays,
      tomorrowOrdersCount,
      upcomingTrays,
      upcomingOrdersCount,
      pastTrays,
      pastOrdersCount,
    };
  }, [orders, todayKey, tomorrowKey]);

  // Master Kitchen Preparation & Customization Board
  const kitchenMatrix = useMemo(() => {
    let totalTrays = 0;
    let totalAloo = 0;
    let totalNoAloo = 0;
    let totalExtraSpicy = 0;
    let totalRegularSpicy = 0;
    let totalPickup = 0;
    let totalDelivery = 0;

    const proteins: Record<string, {
      id: string;
      name: string;
      proteinId: string;
      trays: number;
      aloo: number;
      noAloo: number;
      extraSpicy: number;
      regularSpicy: number;
      orders: number;
      meatRateKg: number;
      riceRateKg: number;
      icon: string;
      color: string;
      badgeColor: string;
      desc: string;
    }> = {
      chicken: {
        id: "chicken",
        name: "Royal Chicken Dum Biryani",
        proteinId: "chicken",
        trays: 0,
        aloo: 0,
        noAloo: 0,
        extraSpicy: 0,
        regularSpicy: 0,
        orders: 0,
        meatRateKg: 1.6,
        riceRateKg: 1.0,
        icon: "🍗",
        color: "border-amber-500/30 bg-gradient-to-br from-amber-500/15 via-[#181008] to-black/60",
        badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
        desc: "Bone-in chicken thighs",
      },
      mutton: {
        id: "mutton",
        name: "Hyderabadi Shahi Mutton Dum Biryani",
        proteinId: "mutton",
        trays: 0,
        aloo: 0,
        noAloo: 0,
        extraSpicy: 0,
        regularSpicy: 0,
        orders: 0,
        meatRateKg: 1.8,
        riceRateKg: 1.0,
        icon: "🐐",
        color: "border-saffron/30 bg-gradient-to-br from-saffron/15 via-[#181008] to-black/60",
        badgeColor: "bg-saffron/20 text-saffron border-saffron/40",
        desc: "Halal baby goat cuts",
      },
      beef: {
        id: "beef",
        name: "Slow-Braised Spiced Beef Dum Biryani",
        proteinId: "beef",
        trays: 0,
        aloo: 0,
        noAloo: 0,
        extraSpicy: 0,
        regularSpicy: 0,
        orders: 0,
        meatRateKg: 1.7,
        riceRateKg: 1.0,
        icon: "🥩",
        color: "border-rose-500/30 bg-gradient-to-br from-rose-500/15 via-[#181008] to-black/60",
        badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/40",
        desc: "Halal choice beef cuts",
      },
      pork: {
        id: "pork",
        name: "Ozarks Smoked Pork Dum Biryani",
        proteinId: "pork",
        trays: 0,
        aloo: 0,
        noAloo: 0,
        extraSpicy: 0,
        regularSpicy: 0,
        orders: 0,
        meatRateKg: 1.6,
        riceRateKg: 1.0,
        icon: "🥓",
        color: "border-purple-500/30 bg-gradient-to-br from-purple-500/15 via-[#181008] to-black/60",
        badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
        desc: "Isolated prep vessel",
      },
    };

    filteredOrders.forEach((o) => {
      if (o.status === "cancelled") return;
      if (o.fulfilmentType === "pickup") totalPickup += 1;
      else if (o.fulfilmentType === "delivery") totalDelivery += 1;

      (o.items || []).forEach((it) => {
        const qty = Number(it.qty) || 1;
        totalTrays += qty;

        if (it.aloo) totalAloo += qty;
        else totalNoAloo += qty;

        if (it.extraSpicy) totalExtraSpicy += qty;
        else totalRegularSpicy += qty;

        const pId = (it.proteinId || it.dishId || it.name || "").toLowerCase();
        let targetKey: "chicken" | "mutton" | "beef" | "pork" = "chicken";
        if (pId.includes("mutton") || pId.includes("goat")) targetKey = "mutton";
        else if (pId.includes("beef")) targetKey = "beef";
        else if (pId.includes("pork")) targetKey = "pork";

        proteins[targetKey].trays += qty;
        proteins[targetKey].orders += 1;
        if (it.aloo) proteins[targetKey].aloo += qty;
        else proteins[targetKey].noAloo += qty;

        if (it.extraSpicy) proteins[targetKey].extraSpicy += qty;
        else proteins[targetKey].regularSpicy += qty;
      });
    });

    return {
      totalTrays,
      totalAloo,
      totalNoAloo,
      totalExtraSpicy,
      totalRegularSpicy,
      totalPickup,
      totalDelivery,
      proteinList: [proteins.chicken, proteins.mutton, proteins.beef, proteins.pork],
    };
  }, [filteredOrders]);

  // Item-wise Handi / Dish Prep Breakdown for Kitchen clarity
  interface DishPrepCount {
    name: string;
    totalTrays: number;
    withAloo: number;
    noAloo: number;
    extraSpicy: number;
    regularSpicy: number;
    orderCount: number;
    totalRevenue: number;
  }

  const itemWisePrepSummary = useMemo(() => {
    const summary: Record<string, DishPrepCount> = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const name = item.name.trim();
        if (!summary[name]) {
          summary[name] = {
            name,
            totalTrays: 0,
            withAloo: 0,
            noAloo: 0,
            extraSpicy: 0,
            regularSpicy: 0,
            orderCount: 0,
            totalRevenue: 0,
          };
        }
        summary[name].totalTrays += item.qty;
        summary[name].orderCount += 1;
        summary[name].totalRevenue += (item.unitPrice || 0) * item.qty;
        if (item.aloo) {
          summary[name].withAloo += item.qty;
        } else {
          summary[name].noAloo += item.qty;
        }
        if (item.extraSpicy) {
          summary[name].extraSpicy += item.qty;
        } else {
          summary[name].regularSpicy += item.qty;
        }
      });
    });

    return Object.values(summary).sort((a, b) => b.totalTrays - a.totalTrays);
  }, [filteredOrders]);

  const totalFilteredTrays = useMemo(() => {
    return filteredOrders.reduce((sum, o) => sum + o.items.reduce((s, it) => s + it.qty, 0), 0);
  }, [filteredOrders]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      case "preparing":
        return "bg-saffron/15 text-saffron border-saffron/40 animate-pulse";
      case "ready":
        return "bg-gold/15 text-gold border-gold/40";
      case "completed":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "cancelled":
        return "bg-chili/15 text-chili border-chili/30";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  if (!isMounted || authLoading || (!isAuthenticated && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0906] text-cream">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="font-display text-sm tracking-widest uppercase text-gold">
            Loading JAKloud Command Center...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold">
      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR                                               */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen h-[100dvh] flex-col border-r border-gold/20 bg-[#100b07] transition-all duration-300 lg:sticky lg:top-0 lg:h-[100dvh] lg:self-start lg:translate-x-0 shrink-0 ${
          sidebarCollapsed ? "lg:w-20" : "lg:w-72"
        } ${mobileNavOpen ? "w-72 translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand Header */}
        <div
          className={`flex h-20 items-center border-b border-gold/15 transition-all ${
            sidebarCollapsed ? "justify-center px-2" : "justify-between px-5"
          }`}
        >
          <Link to="/admin" className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="absolute -inset-1 rounded-full bg-gold/30 blur-sm" />
              <img
                src={logoImg}
                alt="JAKloud J Paradize"
                className="relative h-11 w-11 rounded-full border border-gold/60 bg-cream p-0.5 object-cover shadow-[0_0_15px_rgba(212,160,23,0.35)]"
              />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 animate-in fade-in-50">
                <span className="font-sans text-base font-bold tracking-wider text-cream truncate block leading-tight">
                  JAKloud
                </span>
                <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold truncate">
                  J Paradize · Admin
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg text-gold/70 hover:bg-gold/15 hover:text-gold transition-colors"
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileNavOpen(false)}
            className="text-cream/60 hover:text-gold lg:hidden p-1 rounded-lg"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Operational Status & Capacity Card */}
        {!sidebarCollapsed ? (
          <div className="px-3.5 pt-3 animate-in fade-in-50">
            <div className="rounded-2xl border border-gold/20 bg-gradient-to-b from-[#18110b] to-[#110c08] p-3 shadow-inner space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </span>
                  <span className="font-semibold text-cream text-xs">Kitchen Active</span>
                </div>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-emerald-400">
                  Dum Live
                </span>
              </div>

              {/* Integrated Mini Capacity Gauge (Per-Day Rollover) */}
              <Link
                to="/admin/daily-control"
                className="block pt-1.5 border-t border-white/[0.06] hover:opacity-90 transition-opacity group"
                title={`Manage Daily ${activeDailyLimit}-Tray Limit & Capacity`}
              >
                <div className="flex items-center justify-between text-[0.68rem] mb-1">
                  <span className="text-gold/80 flex items-center gap-1 group-hover:text-amber-300 font-medium">
                    <Flame className="h-3 w-3 text-chili" /> Capacity
                  </span>
                  <span className="font-mono font-bold text-cream">
                    {todayTraysBooked} / {activeDailyLimit} Trays
                  </span>
                </div>
                <Progress
                  value={capacityPercentage}
                  className="h-1.5 bg-black/60 border border-gold/20"
                />
              </Link>
            </div>
          </div>
        ) : (
          <div className="pt-3 flex flex-col items-center gap-2">
            <span
              className="relative flex h-3 w-3"
              title="Kitchen Active • Dum Oven Live"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-3.5 px-2.5 py-3 overflow-y-auto">
          {/* Group 1: CORE OPERATIONS */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 text-[0.62rem] font-semibold uppercase tracking-wider text-gold/60 mb-1">
                Operations
              </p>
            )}
            {[
              { id: "dashboard", label: "Dashboard Overview", icon: LayoutDashboard },
              {
                id: "orders",
                label: "Live Orders Queue",
                icon: ShoppingBag,
                badge: orders.length,
                fullRoute: "/admin/orders",
              },
              {
                id: "menu",
                label: "Menu & Tray Pricing",
                icon: MenuSquare,
                fullRoute: "/admin/menu",
              },
              {
                link: "/admin/proteins",
                label: "Meat & Halal Matrix",
                icon: Flame,
              },
              {
                link: "/admin/daily-control",
                label: `Daily ${activeDailyLimit}-Tray Limit`,
                icon: Sliders,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.id ? activeSection === item.id : false;

              if (item.link) {
                return (
                  <Link
                    key={item.link}
                    to={item.link}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex w-full items-center rounded-xl p-2.5 text-xs font-medium text-cream/75 hover:bg-gold/15 hover:text-gold transition-all ${
                      sidebarCollapsed ? "justify-center" : "gap-3 px-3.5"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gold/80" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              }

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      setActiveSection(item.id as NavSection);
                      setMobileNavOpen(false);
                    }}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex w-full items-center rounded-xl p-2.5 text-xs font-medium transition-all ${
                      sidebarCollapsed ? "justify-center" : "justify-between px-3.5"
                    } ${
                      isActive
                        ? "bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold shadow-md shadow-chili/30"
                        : "text-cream/70 hover:bg-gold/10 hover:text-gold"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-gold/80"}`} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && item.badge !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold shrink-0 ${
                          isActive
                            ? "bg-black/30 text-white"
                            : "bg-gold/15 text-gold border border-gold/25"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                  {!sidebarCollapsed && item.fullRoute && (
                    <Link
                      to={item.fullRoute}
                      title={`Open full ${item.label} page`}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-md text-[0.6rem] transition-all ${
                        isActive ? "text-white/80 hover:text-white" : "text-gold/70 hover:text-gold hover:bg-gold/15"
                      }`}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Group 2: MANAGEMENT & CRM */}
          <div className="space-y-1 pt-2 border-t border-gold/15">
            {!sidebarCollapsed && (
              <p className="px-3 text-[0.62rem] font-semibold uppercase tracking-wider text-gold/60 mb-1">
                Management & CRM
              </p>
            )}
            {[
              {
                id: "customers",
                label: "Customers CRM",
                icon: Users,
                badge: uniqueDinersCount > 0 ? String(uniqueDinersCount) : undefined,
                fullRoute: "/admin/customers",
              },
              {
                id: "delivery",
                label: "Delivery & Routing",
                icon: Truck,
                fullRoute: "/admin/delivery",
              },
              {
                id: "reports",
                label: "Financial Reports & BI",
                icon: BarChart3,
                fullRoute: "/admin/reports",
              },
              {
                link: "/admin/cms",
                label: "Website CMS & Media",
                icon: Sparkles,
              },
              {
                id: "settings",
                label: "Kitchen Settings",
                icon: Settings,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = item.id ? activeSection === item.id : false;

              if (item.link) {
                return (
                  <Link
                    key={item.link}
                    to={item.link}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex w-full items-center rounded-xl p-2.5 text-xs font-medium text-cream/75 hover:bg-gold/15 hover:text-gold transition-all ${
                      sidebarCollapsed ? "justify-center" : "gap-3 px-3.5"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0 text-gold/80" />
                    {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              }

              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => {
                      setActiveSection(item.id as NavSection);
                      setMobileNavOpen(false);
                    }}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={`flex w-full items-center rounded-xl p-2.5 text-xs font-medium transition-all ${
                      sidebarCollapsed ? "justify-center" : "justify-between px-3.5"
                    } ${
                      isActive
                        ? "bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold shadow-md shadow-chili/30"
                        : "text-cream/70 hover:bg-gold/10 hover:text-gold"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-gold/80"}`} />
                      {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!sidebarCollapsed && item.badge !== undefined && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold shrink-0 ${
                          isActive
                            ? "bg-black/30 text-white"
                            : "bg-gold/15 text-gold border border-gold/25"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                  {!sidebarCollapsed && item.fullRoute && (
                    <Link
                      to={item.fullRoute}
                      title={`Open full ${item.label} page`}
                      className={`absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded-md text-[0.6rem] transition-all ${
                        isActive ? "text-white/80 hover:text-white" : "text-gold/70 hover:text-gold hover:bg-gold/15"
                      }`}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer / Administrator Profile Card */}
        <div className="border-t border-gold/15 p-3 bg-[#0d0906]">
          <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-chili to-gold text-xs font-bold text-white shadow-md">
                KA
              </div>
              {!sidebarCollapsed && (
                <div className="min-w-0 animate-in fade-in-50">
                  <p className="truncate text-xs font-semibold text-cream">
                    {user?.name || "Master Chef Kartheek"}
                  </p>
                  <p className="truncate text-[0.62rem] text-gold">{user?.role || "Kitchen Admin"}</p>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={() => {
                  logout();
                  navigate({ to: "/admin/login" });
                  toast.info("Logged out from admin portal.");
                }}
                className="rounded-lg p-1.5 text-cream/50 hover:bg-chili/20 hover:text-chili transition-colors cursor-pointer"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Backdrop for Mobile Nav */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN VIEWPORT                                              */}
      {/* ------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col h-screen h-[100dvh] max-h-[100dvh] min-w-0 overflow-hidden">
        {/* TOP NAVBAR (Permanently fixed at top) */}
        <header className="sticky top-0 z-30 h-20 shrink-0 flex items-center justify-between border-b border-gold/20 bg-[#120c08]/95 px-4 backdrop-blur-xl sm:px-8">
          {/* Left: Mobile Toggle & Clean Live Search */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-md lg:max-w-lg">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-xl p-2 text-cream hover:bg-gold/15 lg:hidden border border-gold/20 bg-black/40"
              aria-label="Open navigation drawer"
            >
              <MenuSquare className="h-5 w-5 text-gold" />
            </button>

            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
              <Input
                placeholder="Search orders, phone, patrons, biryani..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-2xl border-gold/25 bg-black/40 pl-10 pr-9 text-xs text-cream placeholder:text-cream/40 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream p-0.5 rounded transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Date/Time Badge, Website, Refresh, Notifications & Profile */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Live Clock & Springfield Badge */}
            <div className="hidden lg:flex items-center gap-2 rounded-xl border border-gold/20 bg-black/40 px-3 py-1.5 text-xs shadow-inner">
              <Clock className="h-3.5 w-3.5 text-gold shrink-0" />
              <div className="flex flex-col text-left leading-tight">
                <span className="font-semibold text-cream text-[0.72rem]">
                  {currentTime.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="font-mono text-gold text-[0.65rem]">
                  {currentTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })} · Springfield, MO
                </span>
              </div>
            </div>

            {/* Quick Public View */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden sm:flex border-gold/30 bg-black/40 text-xs text-cream hover:bg-gold/15 hover:text-gold gap-1.5 rounded-xl h-9"
            >
              <Link to="/" target="_blank">
                <ExternalLink className="h-3.5 w-3.5 text-gold" />
                <span>Website</span>
              </Link>
            </Button>

            {/* Refresh Live Data */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="h-9 w-9 rounded-xl border-gold/30 bg-black/40 text-cream hover:bg-gold/15 hover:text-gold"
              title="Refresh live metrics"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-gold" : ""}`} />
            </Button>

            {/* Click-away overlay for dropdown menus */}
            {(notificationsOpen || profileMenuOpen) && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => {
                  setNotificationsOpen(false);
                  setProfileMenuOpen(false);
                }}
              />
            )}

            {/* Notifications Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen);
                  setProfileMenuOpen(false);
                }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-black/40 text-cream/80 hover:bg-gold/15 hover:text-gold transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-chili px-1 text-[0.6rem] font-bold text-white shadow-md animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-gold/30 bg-[#140e09] p-4 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="flex items-center justify-between border-b border-gold/15 pb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gold" />
                      <h4 className="font-sans text-sm text-cream font-semibold">Kitchen Alerts</h4>
                    </div>
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-[0.65rem] text-gold/80 hover:text-gold hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="mt-3 max-h-72 space-y-2 overflow-y-auto divide-y divide-gold/10">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`pt-2.5 first:pt-0 p-2 rounded-lg transition-colors ${
                          n.read ? "opacity-70" : "bg-gold/5 border-l-2 border-gold"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-cream">{n.title}</p>
                          <span className="text-[0.6rem] text-cream/40 shrink-0 font-mono">{n.time}</span>
                        </div>
                        <p className="mt-1 text-[0.75rem] text-cream/75 leading-relaxed">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown / Quick User Pill */}
            <div className="relative">
              <button
                onClick={() => {
                  setProfileMenuOpen(!profileMenuOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl border border-gold/25 bg-black/40 py-1 px-2.5 text-left hover:border-gold/50 transition-all cursor-pointer"
                title="Admin Account & Settings"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-chili to-gold text-xs font-bold text-white shadow-sm">
                  KA
                </div>
                <div className="hidden md:block leading-tight text-left">
                  <span className="block text-xs font-semibold text-cream">
                    {user?.name ? user.name.split(" ")[0] : "Chef Kartheek"}
                  </span>
                  <span className="block text-[0.6rem] text-gold uppercase tracking-wider font-mono">
                    Admin
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-gold/70 hidden sm:block" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-gold/30 bg-[#140e09] p-2 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="p-2 border-b border-gold/15">
                    <p className="text-xs font-semibold text-cream">{user?.name || "Master Chef Kartheek"}</p>
                    <p className="text-[0.65rem] text-gold/80 truncate">{user?.email || "admin@jakloud.com"}</p>
                  </div>
                  <div className="py-1 space-y-0.5">
                    <button
                      onClick={() => {
                        setActiveSection("settings");
                        setProfileMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-cream/80 hover:bg-gold/15 hover:text-gold transition-colors text-left cursor-pointer"
                    >
                      <Settings className="h-3.5 w-3.5 text-gold" />
                      <span>Kitchen Settings</span>
                    </button>
                    <Link
                      to="/"
                      target="_blank"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-cream/80 hover:bg-gold/15 hover:text-gold transition-colors text-left cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-gold" />
                      <span>Customer Storefront</span>
                    </Link>
                  </div>
                  <div className="pt-1 border-t border-gold/15">
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false);
                        logout();
                        navigate({ to: "/admin/login" });
                        toast.info("Logged out from admin portal.");
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs text-rose-400 hover:bg-rose-500/15 transition-colors text-left font-medium cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* 3. SECTION CONTENT                                            */}
        {/* ------------------------------------------------------------- */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-8 space-y-8 w-full">
          <div className="max-w-7xl mx-auto space-y-8 pb-12">
            {/* ========================================================= */}
            {/* TAB 1: DASHBOARD OVERVIEW                                 */}
            {/* ========================================================= */}
            {activeSection === "dashboard" && (
            <div className="space-y-8 animate-in fade-in-50 duration-500">
              {/* Executive Welcome Banner */}
              <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-r from-[#170f0a] via-[#120c08] to-[#1a100a] p-6 sm:p-8 shadow-[var(--shadow-royal)]">
                <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold font-semibold">
                      <Sparkles className="h-3.5 w-3.5 text-gold" />
                      <span>Executive Overview</span>
                    </div>
                    <h1 className="mt-1 font-display text-2xl sm:text-4xl text-cream font-bold">
                      Welcome back, Chef Kartheek
                    </h1>
                    <p className="mt-2 text-xs sm:text-sm text-cream/75 max-w-2xl leading-relaxed">
                      Springfield's slow-cooked Dum biryani operation is running on schedule.{" "}
                      <span className="text-gold font-medium">
                        {Math.max(0, activeDailyLimit - todayTraysBooked)} trays remain
                      </span>{" "}
                      before reaching today's {activeDailyLimit}-tray capacity limit.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={() => setActiveSection("orders")}
                      className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-semibold text-xs shadow-lg shadow-chili/30 hover:scale-105 transition-transform"
                    >
                      <ShoppingBag className="h-4 w-4 mr-1.5" /> View Live Orders ({orders.length})
                    </Button>
                    <Button
                      onClick={() => setActiveSection("menu")}
                      variant="outline"
                      className="border-gold/40 text-gold hover:bg-gold/15 text-xs"
                    >
                      <MenuSquare className="h-4 w-4 mr-1.5" /> Manage Menu
                    </Button>
                  </div>
                </div>
              </div>

              {/* Date-Wise Interactive Filter Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-gold/30 bg-[#120c08]/95 p-4 sm:p-5 backdrop-blur-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 text-gold border border-gold/30 shadow-inner">
                    <Calendar className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs uppercase tracking-wider font-bold text-cream">
                        Executive Date Filter
                      </h3>
                      <span className="rounded-full bg-gold/15 border border-gold/30 px-2.5 py-0.5 text-[0.68rem] font-semibold text-gold font-mono">
                        {dateFilterLabel}
                      </span>
                    </div>
                    <p className="text-[0.72rem] text-cream/60">
                      Filter live capacity, kitchen queue, and receipts by date or timeframe
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Quick Filter Buttons */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
                    {[
                      { id: "today", label: "Today" },
                      { id: "tomorrow", label: "Tomorrow" },
                      { id: "yesterday", label: "Yesterday" },
                      { id: "last7", label: "7 Days" },
                      { id: "this_month", label: "This Month" },
                      { id: "all", label: "All Time" },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        onClick={() => setDashDateFilter(btn.id as DashboardDateFilter)}
                        className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                          dashDateFilter === btn.id
                            ? "bg-gradient-to-r from-chili via-saffron to-gold text-white shadow-md shadow-chili/30"
                            : "border border-gold/20 bg-black/40 text-cream/75 hover:border-gold/50 hover:text-gold"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Pick Specific Date */}
                  <div className="flex items-center gap-1.5 border-l border-gold/20 pl-2">
                    <label className="text-[0.68rem] text-gold/70 font-medium hidden lg:inline">
                      Pick Date:
                    </label>
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => {
                        if (e.target.value) {
                          setCustomDate(e.target.value);
                          setDashDateFilter("custom");
                        }
                      }}
                      className={`h-8 rounded-xl border px-2.5 text-xs font-mono transition-all cursor-pointer ${
                        dashDateFilter === "custom"
                          ? "border-gold bg-gold/20 text-gold font-bold shadow-[0_0_10px_rgba(212,160,23,0.3)]"
                          : "border-gold/25 bg-black/50 text-cream/80 hover:border-gold/50"
                      } focus:outline-none focus:border-gold`}
                    />
                  </div>
                </div>
              </div>

              {/* 6 Luxury Interactive Analytics Cards (Click to Navigate with Filtered Data) */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* 1. Filtered Orders */}
                <div
                  onClick={() => {
                    navigate({
                      to: "/admin/orders",
                      search: {
                        date: dashDateFilter === "custom" ? customDate : dashDateFilter,
                      },
                    });
                  }}
                  className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 backdrop-blur-xl shadow-lg hover:border-gold hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/10 active:scale-[0.99] transition-all cursor-pointer group"
                  title="Click to view full orders queue for this timeframe"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold truncate">
                      {dashDateFilter === "today" ? "Today's Orders" : `Orders (${dateFilterLabel})`}
                    </p>
                    <div className="rounded-xl bg-gold/15 p-2 text-gold group-hover:scale-110 transition-transform">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-cream">
                    {filteredTraysBooked} <span className="text-xs font-sans text-cream/60">Trays</span>
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-[0.68rem] text-emerald-400">
                    <span className="flex items-center gap-1 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {dateFilteredOrders.length} order{dateFilteredOrders.length === 1 ? "" : "s"}
                    </span>
                    <span className="text-gold/60 group-hover:text-gold group-hover:translate-x-0.5 transition-all text-[0.65rem] font-bold">
                      View →
                    </span>
                  </div>
                </div>

                {/* 2. Pending / Preparing */}
                <div
                  onClick={() => {
                    navigate({
                      to: "/admin/orders",
                      search: {
                        status: "preparing",
                        date: dashDateFilter === "custom" ? customDate : dashDateFilter,
                      },
                    });
                  }}
                  className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 backdrop-blur-xl shadow-lg hover:border-saffron hover:scale-[1.02] hover:shadow-xl hover:shadow-saffron/10 active:scale-[0.99] transition-all cursor-pointer group"
                  title="Click to view all biryani handis actively in dum prep"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-wider text-saffron font-semibold truncate">
                      In Dum Prep
                    </p>
                    <div className="rounded-xl bg-saffron/15 p-2 text-saffron group-hover:scale-110 transition-transform">
                      <Flame className="h-4 w-4 animate-pulse text-chili" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-cream">
                    {filteredPendingCount} <span className="text-xs font-sans text-cream/60">Handis</span>
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-[0.68rem]">
                    <span className="text-cream/70 truncate">
                      {filteredPendingCount > 0 ? "Slow cooking on dum" : "No handis on dum"}
                    </span>
                    <span className="text-saffron/70 group-hover:text-saffron group-hover:translate-x-0.5 transition-all text-[0.65rem] font-bold">
                      View →
                    </span>
                  </div>
                </div>

                {/* 3. Pickup Orders */}
                <div
                  onClick={() => {
                    navigate({
                      to: "/admin/orders",
                      search: {
                        fulfilment: "pickup",
                        date: dashDateFilter === "custom" ? customDate : dashDateFilter,
                      },
                    });
                  }}
                  className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 backdrop-blur-xl shadow-lg hover:border-gold hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/10 active:scale-[0.99] transition-all cursor-pointer group"
                  title="Click to view scheduled counter collections"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold truncate">
                      Pickup Orders
                    </p>
                    <div className="rounded-xl bg-gold/15 p-2 text-gold group-hover:scale-110 transition-transform">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-cream">
                    {filteredPickupCount} <span className="text-xs font-sans text-cream/60">Trays</span>
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-[0.68rem]">
                    <span className="text-cream/70 truncate">
                      {dateFilteredOrders.filter((o) => o.fulfilmentType === "pickup").length} counter pickup{dateFilteredOrders.filter((o) => o.fulfilmentType === "pickup").length === 1 ? "" : "s"}
                    </span>
                    <span className="text-gold/60 group-hover:text-gold group-hover:translate-x-0.5 transition-all text-[0.65rem] font-bold">
                      View →
                    </span>
                  </div>
                </div>

                {/* 4. Delivery Orders */}
                <div
                  onClick={() => {
                    navigate({
                      to: "/admin/delivery",
                    });
                  }}
                  className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 backdrop-blur-xl shadow-lg hover:border-saffron hover:scale-[1.02] hover:shadow-xl hover:shadow-saffron/10 active:scale-[0.99] transition-all cursor-pointer group"
                  title="Click to manage delivery routes and dispatch"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-wider text-saffron font-semibold truncate">
                      Delivery Orders
                    </p>
                    <div className="rounded-xl bg-saffron/15 p-2 text-saffron group-hover:scale-110 transition-transform">
                      <Truck className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-cream">
                    {filteredDeliveryCount} <span className="text-xs font-sans text-cream/60">Trays</span>
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-[0.68rem]">
                    <span className="text-cream/70 truncate">
                      {dateFilteredOrders.filter((o) => o.fulfilmentType === "delivery").length} in {settings.deliveryRadiusMiles || 10}-mi zone
                    </span>
                    <span className="text-saffron/70 group-hover:text-saffron group-hover:translate-x-0.5 transition-all text-[0.65rem] font-bold">
                      Routes →
                    </span>
                  </div>
                </div>

                {/* 5. Revenue Today / Timeframe */}
                <div
                  onClick={() => {
                    navigate({
                      to: "/admin/reports",
                    });
                  }}
                  className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 backdrop-blur-xl shadow-lg hover:border-gold hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/10 active:scale-[0.99] transition-all cursor-pointer group"
                  title="Click to open financial reports and business intelligence"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold truncate">
                      {dashDateFilter === "today" ? "Revenue Today" : `Revenue (${dateFilterLabel})`}
                    </p>
                    <div className="rounded-xl bg-gold/15 p-2 text-gold group-hover:scale-110 transition-transform">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold text-cream sm:text-2xl">
                    {formatMoney(filteredRevenue)}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-[0.68rem] text-emerald-400">
                    <span className="flex items-center gap-1 font-medium truncate">
                      <TrendingUp className="h-3 w-3" /> Real database receipts
                    </span>
                    <span className="text-gold/60 group-hover:text-gold group-hover:translate-x-0.5 transition-all text-[0.65rem] font-bold">
                      Reports →
                    </span>
                  </div>
                </div>

                {/* 6. Diner Base */}
                <div
                  onClick={() => {
                    navigate({
                      to: "/admin/customers",
                    });
                  }}
                  className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 backdrop-blur-xl shadow-lg hover:border-gold hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/10 active:scale-[0.99] transition-all cursor-pointer group"
                  title="Click to view Customer CRM and active diner profiles"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold truncate">
                      Diner Base
                    </p>
                    <div className="rounded-xl bg-gold/15 p-2 text-gold group-hover:scale-110 transition-transform">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-cream">
                    {filteredDinersCount} <span className="text-xs font-sans text-cream/60">Diners</span>
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-[0.68rem] text-emerald-400">
                    <span className="truncate">
                      {filteredDinersCount > 0 ? `${filteredDinersCount} active in ${dateFilterLabel.toLowerCase()}` : "No diners in period"}
                    </span>
                    <span className="text-gold/60 group-hover:text-gold group-hover:translate-x-0.5 transition-all text-[0.65rem] font-bold">
                      CRM →
                    </span>
                  </div>
                </div>
              </div>

              {/* Charts Grid: Weekly Sales & Protein Breakdown */}
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Left (2 cols): Weekly Revenue & Trays Area Graph */}
                <div className="lg:col-span-2 rounded-3xl border border-gold/25 bg-[#120c08]/85 p-6 backdrop-blur-xl shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold/15 pb-4">
                    <div>
                      <h3 className="font-display text-lg text-cream font-bold flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-gold" /> Weekly Sales & Tray Volume
                      </h3>
                      <p className="text-xs text-cream/60">
                        Daily performance from Springfield orders over the past 7 days
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-gold">
                        <span className="h-2.5 w-2.5 rounded-full bg-gold inline-block" /> Revenue ($)
                      </span>
                      <span className="flex items-center gap-1.5 text-saffron">
                        <span className="h-2.5 w-2.5 rounded-full bg-saffron inline-block" /> Trays Sold
                      </span>
                    </div>
                  </div>

                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dynamicWeeklySalesData}>
                        <defs>
                          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d4a017" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#d4a017" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="chiliGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ea580c" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ea580c" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="day"
                          stroke="#a89f91"
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: "#3a2c20" }}
                        />
                        <YAxis
                          yAxisId="left"
                          stroke="#d4a017"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#ea580c"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(val) => `${val}t`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#170f0a",
                            borderColor: "#d4a017",
                            borderRadius: "12px",
                            boxShadow: "0 10px 25px rgba(0,0,0,0.8)",
                            color: "#fff",
                            fontSize: "12px",
                          }}
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          name="Revenue"
                          stroke="#d4a017"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#goldGradient)"
                        />
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="trays"
                          name="Trays Sold"
                          stroke="#ea580c"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#chiliGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Right (1 col): Protein Distribution Donut */}
                <div className="rounded-3xl border border-gold/25 bg-[#120c08]/85 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                  <div>
                    <h3 className="font-display text-lg text-cream font-bold flex items-center gap-2">
                      <UtensilsCrossed className="h-5 w-5 text-gold" /> Protein Popularity
                    </h3>
                    <p className="text-xs text-cream/60">
                      Distribution across 4 signature dum meats
                    </p>
                  </div>

                  <div className="h-52 w-full my-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dynamicProteinData}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {dynamicProteinData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#170f0a",
                            borderColor: "#d4a017",
                            borderRadius: "10px",
                            fontSize: "11px",
                          }}
                          formatter={(value: any) => [`${value} trays`, ""]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-gold/15 pt-3">
                    {dynamicProteinData.map((p) => (
                      <div key={p.name} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-cream/80 truncate">{p.name}</span>
                        <span className="font-bold text-gold ml-auto">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Best-Selling Biryani Showcase */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl text-cream font-bold flex items-center gap-2">
                      <Flame className="h-5 w-5 text-chili" /> Best-Selling Dum Biryani Trays
                    </h3>
                    <p className="text-xs text-cream/60">
                      Rankings based on weekly order volume and revenue generation
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="text-gold text-xs hover:bg-gold/10"
                  >
                    <Link to="/admin/menu">
                      Manage Trays & Pricing →
                    </Link>
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {dynamicBestSellingDishes.map((dish) => (
                    <div
                      key={dish.name}
                      className="relative overflow-hidden rounded-2xl border border-gold/25 bg-[#140e09]/90 p-5 shadow-lg backdrop-blur-md transition-all hover:-translate-y-1 hover:border-gold/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            dish.rank === 1
                              ? "bg-gold text-black shadow-md shadow-gold/40"
                              : dish.rank === 2
                                ? "bg-slate-300 text-black shadow-md"
                                : dish.rank === 3
                                  ? "bg-amber-700 text-white"
                                  : "bg-white/10 text-white"
                          }`}
                        >
                          #{dish.rank}
                        </span>
                        <span className="rounded bg-gold/15 px-2 py-0.5 text-[0.65rem] font-semibold text-gold">
                          {dish.traysSold > 0 ? "🔥 In Demand" : "✨ On Menu"}
                        </span>
                      </div>

                      <h4 className="mt-3 font-display text-base font-bold text-cream truncate" title={dish.name}>
                        {dish.name}
                      </h4>
                      <p className="text-xs text-gold font-mono font-medium">
                        {formatMoney(dish.basePrice)} / handi
                      </p>

                      <div className="mt-4 space-y-1.5 border-t border-gold/15 pt-3 text-xs">
                        <div className="flex justify-between text-cream/70">
                          <span>Total Sold:</span>
                          <span className="font-bold text-cream">
                            {dish.traysSold} {dish.traysSold === 1 ? "tray" : "trays"}
                          </span>
                        </div>
                        <div className="flex justify-between text-cream/70">
                          <span>Total Revenue:</span>
                          <span className="font-bold text-gold">{formatMoney(dish.revenue)}</span>
                        </div>
                        <div className="flex justify-between text-cream/70">
                          <span>Live Status:</span>
                          <span className="font-medium text-emerald-400">
                            {dish.traysSold > 0 ? "Ordered" : "Available"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Orders Overview Table */}
              <div className="rounded-3xl border border-gold/25 bg-[#120c08]/85 p-6 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold/15 pb-4">
                  <div>
                    <h3 className="font-display text-xl text-cream font-bold flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-gold" /> Recent Kitchen Orders
                    </h3>
                    <p className="text-xs text-cream/60">
                      Live queue for today & tomorrow's scheduled dum handis
                    </p>
                  </div>
                  <Button
                    onClick={() => setActiveSection("orders")}
                    variant="outline"
                    size="sm"
                    className="border-gold/30 text-gold hover:bg-gold/10 text-xs"
                  >
                    View All {orders.length} Orders Queue →
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-gold/15 bg-black/40 text-[0.7rem] uppercase tracking-wider text-gold">
                      <tr>
                        <th className="px-4 py-3">Order Ref</th>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Fulfilment</th>
                        <th className="px-4 py-3">Biryani Selection</th>
                        <th className="px-4 py-3">Total</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/10">
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-gold/5 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-xs">
                            <Link
                              to="/admin/orders/$orderId"
                              params={{ orderId: order.id }}
                              className="font-bold text-gold hover:underline"
                            >
                              {order.orderNumber}
                            </Link>
                          </td>
                          <td className="px-4 py-3.5">
                            <p className="font-medium text-cream text-xs">{order.customer.name}</p>
                            <p className="text-[0.7rem] text-cream/50">{order.customer.phone}</p>
                          </td>
                          <td className="px-4 py-3.5 text-xs">
                            <span className="capitalize font-medium text-cream">
                              {order.fulfilmentType}
                            </span>
                            <p className="text-[0.7rem] text-cream/60">
                              {order.fulfilmentDate} @ {order.fulfilmentTime}
                            </p>
                          </td>
                          <td className="px-4 py-3.5 text-xs">
                            {order.items.map((it, idx) => (
                              <p key={idx} className="text-cream">
                                <span className="font-bold text-gold">{it.qty}×</span> {it.name}{" "}
                                {it.aloo && <span className="text-saffron text-[0.7rem]">(+Aloo)</span>}
                              </p>
                            ))}
                          </td>
                          <td className="px-4 py-3.5 font-display font-bold text-cream">
                            {formatMoney(order.total)}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold capitalize ${getStatusBadge(
                                order.status,
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setSelectedOrderDetails(order)}
                              className="h-7 text-xs text-gold hover:bg-gold/15"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" /> Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: ORDERS MANAGEMENT QUEUE                            */}
          {/* ========================================================= */}
          {activeSection === "orders" && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/20 pb-4">
                <div>
                  <h2 className="font-display text-2xl text-cream font-bold">
                    Kitchen Orders & Dispatch Queue
                  </h2>
                  <p className="text-xs text-cream/60">
                    Realtime progress for Dum biryani production and delivery routes
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      if (confirm("Purge all test/mock orders and reset the kitchen queue?")) {
                        await purgeTestOrders();
                        toast.success("Test orders purged from database and local store.");
                      }
                    }}
                    className="border-rose-500/30 text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 text-xs"
                    title="Purge legacy test orders"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Purge Test Orders
                  </Button>
                  <Button asChild size="sm" className="bg-gold text-black font-bold hover:bg-gold/90 text-xs">
                    <Link to="/admin/orders">
                      Open Dedicated Order Manager →
                    </Link>
                  </Button>
                </div>
              </div>

              {/* 1. TIMELINE & CAPACITY SELECTOR BAR (Today, Tomorrow, Upcoming, Past Archive) */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* 1A. TODAY'S LIVE OVEN TRAY QUEUE */}
                <div
                  onClick={() => {
                    setOrdersDateFilter("today");
                    setOrdersCustomDate("");
                  }}
                  className={`relative overflow-hidden rounded-2xl border p-4 transition-all cursor-pointer group ${
                    ordersDateFilter === "today"
                      ? "border-gold bg-gradient-to-br from-gold/20 via-[#181008] to-black/90 shadow-lg shadow-gold/20 ring-1 ring-gold"
                      : "border-gold/20 bg-[#120c08]/85 hover:border-gold/50 hover:bg-gold/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[0.68rem] font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5 text-chili animate-pulse" />
                      Today ({todayDateFormatted})
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold ${
                      ordersDateFilter === "today" ? "bg-gold text-black" : "bg-gold/15 text-gold border border-gold/30"
                    }`}>
                      Live Today
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between">
                    <div className="font-display text-2xl font-bold text-cream">
                      {timelineStats.todayTrays}{" "}
                      <span className="text-xs font-sans text-cream/60">
                        / {activeDailyLimit} Trays
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-emerald-400">
                      {Math.max(0, activeDailyLimit - timelineStats.todayTrays)} Free
                    </span>
                  </div>

                  <div className="mt-2">
                    <Progress
                      value={activeDailyLimit > 0 ? Math.min(100, Math.round((timelineStats.todayTrays / activeDailyLimit) * 100)) : 0}
                      className="h-1.5 bg-black/60 border border-gold/20"
                    />
                  </div>

                  <p className="mt-2 text-[0.68rem] text-cream/60 flex items-center justify-between">
                    <span>{timelineStats.todayOrdersCount} order{timelineStats.todayOrdersCount === 1 ? "" : "s"} scheduled</span>
                    <span className="text-gold font-medium">Click to View →</span>
                  </p>
                </div>

                {/* 1B. TOMORROW'S PRE-ORDER TRAY QUEUE */}
                <div
                  onClick={() => {
                    setOrdersDateFilter("tomorrow");
                    setOrdersCustomDate("");
                  }}
                  className={`relative overflow-hidden rounded-2xl border p-4 transition-all cursor-pointer group ${
                    ordersDateFilter === "tomorrow"
                      ? "border-saffron bg-gradient-to-br from-saffron/20 via-[#181008] to-black/90 shadow-lg shadow-saffron/20 ring-1 ring-saffron"
                      : "border-gold/20 bg-[#120c08]/85 hover:border-saffron/50 hover:bg-saffron/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[0.68rem] font-bold uppercase tracking-wider text-saffron flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-saffron" />
                      Tomorrow ({tomorrowDateFormatted})
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold ${
                      ordersDateFilter === "tomorrow" ? "bg-saffron text-black" : "bg-saffron/15 text-saffron border border-saffron/30"
                    }`}>
                      Advance
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between">
                    <div className="font-display text-2xl font-bold text-cream">
                      {timelineStats.tomorrowTrays}{" "}
                      <span className="text-xs font-sans text-cream/60">
                        / {tomorrowLimit} Trays
                      </span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-emerald-400">
                      {Math.max(0, tomorrowLimit - timelineStats.tomorrowTrays)} Free
                    </span>
                  </div>

                  <div className="mt-2">
                    <Progress
                      value={tomorrowLimit > 0 ? Math.min(100, Math.round((timelineStats.tomorrowTrays / tomorrowLimit) * 100)) : 0}
                      className="h-1.5 bg-black/60 border border-saffron/20"
                    />
                  </div>

                  <p className="mt-2 text-[0.68rem] text-cream/60 flex items-center justify-between">
                    <span>{timelineStats.tomorrowOrdersCount} order{timelineStats.tomorrowOrdersCount === 1 ? "" : "s"} booked</span>
                    <span className="text-saffron font-medium">Click to View →</span>
                  </p>
                </div>

                {/* 1C. UPCOMING 7 DAYS */}
                <div
                  onClick={() => {
                    setOrdersDateFilter("upcoming");
                    setOrdersCustomDate("");
                  }}
                  className={`relative overflow-hidden rounded-2xl border p-4 transition-all cursor-pointer group ${
                    ordersDateFilter === "upcoming"
                      ? "border-sky-500 bg-gradient-to-br from-sky-500/20 via-[#181008] to-black/90 shadow-lg shadow-sky-500/20 ring-1 ring-sky-500"
                      : "border-gold/20 bg-[#120c08]/85 hover:border-sky-500/50 hover:bg-sky-500/5"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[0.68rem] font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-sky-400" />
                      Upcoming 7 Days
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold ${
                      ordersDateFilter === "upcoming" ? "bg-sky-500 text-black" : "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                    }`}>
                      Horizon
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between">
                    <div className="font-display text-2xl font-bold text-cream">
                      {timelineStats.upcomingTrays}{" "}
                      <span className="text-xs font-sans text-cream/60">Trays Booked</span>
                    </div>
                  </div>

                  <p className="mt-4 text-[0.68rem] text-cream/60 flex items-center justify-between">
                    <span>{timelineStats.upcomingOrdersCount} advance pre-orders</span>
                    <span className="text-sky-400 font-medium">Click to View →</span>
                  </p>
                </div>

                {/* 1D. PAST ORDERS ARCHIVE (HIDDEN BY DEFAULT) */}
                <div
                  onClick={() => {
                    setOrdersDateFilter("past");
                    setOrdersCustomDate("");
                  }}
                  className={`relative overflow-hidden rounded-2xl border p-4 transition-all cursor-pointer group ${
                    ordersDateFilter === "past"
                      ? "border-zinc-400 bg-gradient-to-br from-zinc-700/30 via-[#181008] to-black/90 shadow-lg shadow-zinc-500/20 ring-1 ring-zinc-400"
                      : "border-gold/20 bg-[#120c08]/85 hover:border-zinc-500/50 hover:bg-zinc-800/20"
                  }`}
                  title="Past fulfilled orders are hidden from live queue by default"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[0.68rem] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Archive className="h-3.5 w-3.5 text-zinc-400" />
                      Past Orders Archive
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold ${
                      ordersDateFilter === "past" ? "bg-zinc-300 text-black" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                    }`}>
                      Hidden
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between">
                    <div className="font-display text-2xl font-bold text-cream">
                      {timelineStats.pastOrdersCount}{" "}
                      <span className="text-xs font-sans text-cream/60">Past Orders</span>
                    </div>
                  </div>

                  <p className="mt-4 text-[0.68rem] text-cream/50 flex items-center justify-between">
                    <span>Archived from live kitchen</span>
                    <span className="text-zinc-300 font-medium">View Archive →</span>
                  </p>
                </div>
              </div>

              {/* SPECIFIC DATE PICKER & QUICK FILTERS TOOLBAR */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gold/20 bg-[#120c08]/90 p-3.5 backdrop-blur-xl shadow-md">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-cream/80">Active Timeframe:</span>
                  <span className="font-bold text-gold uppercase tracking-wider font-mono">
                    {ordersDateFilter === "today"
                      ? `Today · ${todayDateFormatted}`
                      : ordersDateFilter === "tomorrow"
                        ? `Tomorrow · ${tomorrowDateFormatted}`
                        : ordersDateFilter === "upcoming"
                          ? "Upcoming 7 Days"
                          : ordersDateFilter === "past"
                            ? "Past Orders Archive (Hidden Records)"
                            : ordersDateFilter === "custom"
                              ? `Date: ${ordersCustomDate}`
                              : "All Orders"}
                  </span>
                  {selectedDishFilter !== "all" && (
                    <span className="rounded-full bg-gold/20 text-gold border border-gold/30 px-2 py-0.5 text-[0.68rem] font-bold">
                      Filtered: {selectedDishFilter}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 border border-gold/25 rounded-xl px-2.5 py-1 bg-black/40">
                    <Calendar className="h-3.5 w-3.5 text-gold" />
                    <span className="text-[0.68rem] text-cream/70 hidden md:inline">Pick Date:</span>
                    <input
                      type="date"
                      value={ordersCustomDate}
                      onChange={(e) => {
                        if (e.target.value) {
                          setOrdersCustomDate(e.target.value);
                          setOrdersDateFilter("custom");
                        }
                      }}
                      className="bg-transparent text-xs text-gold font-mono cursor-pointer focus:outline-none"
                    />
                  </div>
                  {ordersDateFilter !== "today" && (
                    <button
                      onClick={() => {
                        setOrdersDateFilter("today");
                        setOrdersCustomDate("");
                        setSelectedDishFilter("all");
                      }}
                      className="rounded-xl border border-gold/30 bg-gold/15 px-3 py-1.5 text-xs font-bold text-gold hover:bg-gold/25 transition-all cursor-pointer"
                    >
                      ← Back to Today
                    </button>
                  )}
                </div>
              </div>

              {/* 2. MASTER KITCHEN PREPARATION BOARD (Real Database Breakdown: Proteins, Spicy, Aloo) */}
              <div className="rounded-2xl border border-gold/25 bg-[#120c08]/95 p-5 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold/15 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-chili animate-pulse" />
                      <h3 className="font-display text-base font-bold text-cream">
                        Master Kitchen Preparation & Customization Board
                      </h3>
                      <span className="rounded-full bg-gold/20 border border-gold/30 px-2.5 py-0.5 text-xs font-bold text-gold font-mono">
                        {kitchenMatrix.totalTrays} Total Handis Required
                      </span>
                    </div>
                    <p className="text-[0.72rem] text-cream/60 mt-0.5">
                      Real-time ingredient, protein, and customization breakdown calculated from database orders
                    </p>
                  </div>

                  {selectedDishFilter !== "all" && (
                    <button
                      onClick={() => setSelectedDishFilter("all")}
                      className="text-xs text-saffron hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      Show All Meats ✕
                    </button>
                  )}
                </div>

                {/* 2A. QUICK-GLANCE CUSTOMIZATION SUMMARY STRIP */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs font-medium">
                  <div className="rounded-xl border border-gold/20 bg-black/50 p-2.5 text-center">
                    <span className="text-[0.65rem] text-gold uppercase tracking-wider block font-semibold">Total Handis</span>
                    <span className="font-display text-xl font-bold text-cream">{kitchenMatrix.totalTrays}</span>
                    <span className="text-[0.62rem] text-cream/50 block">Dum Trays</span>
                  </div>

                  <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-2.5 text-center">
                    <span className="text-[0.65rem] text-amber-300 uppercase tracking-wider block font-semibold">🥔 With Aloo</span>
                    <span className="font-display text-xl font-bold text-amber-200">{kitchenMatrix.totalAloo}</span>
                    <span className="text-[0.62rem] text-amber-300/60 block">Trays</span>
                  </div>

                  <div className="rounded-xl border border-white/15 bg-white/5 p-2.5 text-center">
                    <span className="text-[0.65rem] text-cream/70 uppercase tracking-wider block font-semibold">🚫 No Aloo</span>
                    <span className="font-display text-xl font-bold text-cream">{kitchenMatrix.totalNoAloo}</span>
                    <span className="text-[0.62rem] text-cream/50 block">Trays</span>
                  </div>

                  <div className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-2.5 text-center">
                    <span className="text-[0.65rem] text-rose-300 uppercase tracking-wider block font-semibold">🌶️ Extra Spicy</span>
                    <span className="font-display text-xl font-bold text-rose-200">{kitchenMatrix.totalExtraSpicy}</span>
                    <span className="text-[0.62rem] text-rose-300/60 block">Trays</span>
                  </div>

                  <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-2.5 text-center">
                    <span className="text-[0.65rem] text-emerald-300 uppercase tracking-wider block font-semibold">✨ Regular</span>
                    <span className="font-display text-xl font-bold text-emerald-200">{kitchenMatrix.totalRegularSpicy}</span>
                    <span className="text-[0.62rem] text-emerald-300/60 block">Trays</span>
                  </div>

                  <div className="rounded-xl border border-sky-500/25 bg-sky-500/10 p-2.5 text-center">
                    <span className="text-[0.65rem] text-sky-300 uppercase tracking-wider block font-semibold">Dispatch Mode</span>
                    <span className="font-mono text-sm font-bold text-cream block mt-1">
                      🛍️ {kitchenMatrix.totalPickup} · 🚚 {kitchenMatrix.totalDelivery}
                    </span>
                    <span className="text-[0.62rem] text-sky-300/60 block">Pickup · Delivery</span>
                  </div>
                </div>

                {/* 2B. 4 CORE SIGNATURE PROTEIN CARDS (CHICKEN, MUTTON, BEEF, PORK) */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-1">
                  {kitchenMatrix.proteinList.map((prot) => {
                    const isSelected = selectedDishFilter.toLowerCase() === prot.id;
                    return (
                      <div
                        key={prot.id}
                        onClick={() => setSelectedDishFilter(isSelected ? "all" : prot.id)}
                        className={`rounded-2xl border p-4 transition-all cursor-pointer group ${prot.color} ${
                          isSelected ? "ring-2 ring-gold scale-[1.02] shadow-xl" : "hover:border-gold/60"
                        }`}
                        title={`Click to filter table by ${prot.name}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xl">{prot.icon}</span>
                            <div>
                              <h4 className="font-display text-xs font-bold text-cream group-hover:text-gold transition-colors line-clamp-1">
                                {prot.name}
                              </h4>
                              <p className="text-[0.62rem] text-cream/50">{prot.meatType}</p>
                            </div>
                          </div>
                          <span className={`shrink-0 rounded-full px-2.5 py-0.5 font-mono font-bold text-xs ${prot.badgeColor}`}>
                            {prot.trays} {prot.trays === 1 ? "Tray" : "Trays"}
                          </span>
                        </div>

                        {/* Customization Details: Spicy & Aloo */}
                        <div className="mt-3 grid grid-cols-2 gap-1.5 text-[0.68rem]">
                          <div className="rounded-lg bg-black/50 border border-gold/15 p-1.5">
                            <span className="text-[0.6rem] text-cream/50 uppercase block font-semibold">Aloo Option</span>
                            <div className="flex items-center justify-between font-mono font-bold mt-0.5">
                              <span className="text-amber-300">🥔 {prot.aloo}</span>
                              <span className="text-cream/70">🚫 {prot.noAloo}</span>
                            </div>
                          </div>

                          <div className="rounded-lg bg-black/50 border border-gold/15 p-1.5">
                            <span className="text-[0.6rem] text-cream/50 uppercase block font-semibold">Spiciness</span>
                            <div className="flex items-center justify-between font-mono font-bold mt-0.5">
                              <span className="text-rose-300">🌶️ {prot.extraSpicy}</span>
                              <span className="text-emerald-300">✨ {prot.regularSpicy}</span>
                            </div>
                          </div>
                        </div>

                        {/* Kitchen Preparation Specs */}
                        <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[0.65rem] text-cream/60">
                          <span>Req Meat: <strong className="text-cream">{(prot.trays * prot.meatRateKg).toFixed(1)} kg</strong></span>
                          <span>Rice: <strong className="text-cream">{(prot.trays * prot.riceRateKg).toFixed(1)} kg</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* PAST ARCHIVE ALERT (Only shown when past orders are opened) */}
              {ordersDateFilter === "past" && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
                  <div className="flex items-center gap-2">
                    <Archive className="h-4 w-4 text-amber-300 shrink-0" />
                    <span>
                      <strong>Past Orders Archive Mode:</strong> You are viewing historical orders. These are kept hidden from the live kitchen queue by default so your kitchen prep stays 100% focused on active orders.
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setOrdersDateFilter("today");
                      setOrdersCustomDate("");
                    }}
                    className="shrink-0 rounded-xl bg-amber-400 text-black font-bold px-3 py-1 text-xs hover:bg-amber-300 cursor-pointer"
                  >
                    ← Back to Today's Live Queue
                  </button>
                </div>
              )}

              {/* 3. STATUS FILTER PILLS & LIVE TABLE */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {(["all", "confirmed", "preparing", "ready", "completed", "cancelled"] as const).map(
                  (st) => (
                    <button
                      key={st}
                      onClick={() => setOrderStatusFilter(st)}
                      className={`rounded-full px-3.5 py-1 text-xs font-medium capitalize transition-all shrink-0 cursor-pointer ${
                        orderStatusFilter === st
                          ? "bg-gold text-black font-bold shadow-md shadow-gold/30"
                          : "border border-gold/20 bg-black/40 text-cream/70 hover:border-gold/50 hover:text-cream"
                      }`}
                    >
                      {st}
                    </button>
                  ),
                )}
              </div>

              <div className="rounded-3xl border border-gold/25 bg-[#120c08]/85 shadow-2xl overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-gold/15 bg-black/40 text-[0.7rem] uppercase tracking-wider text-gold">
                      <tr>
                        <th className="px-5 py-4">Reference</th>
                        <th className="px-5 py-4">Customer & Contact</th>
                        <th className="px-4 py-4">Fulfilment Plan</th>
                        <th className="px-5 py-4">Trays & Customizations</th>
                        <th className="px-4 py-4">Total</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-5 py-4 text-right">Progress Dum Stage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/10">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-cream/50">
                            No orders found matching this filter.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.id} className="hover:bg-gold/5 transition-colors">
                            <td className="px-5 py-4 font-mono text-xs">
                              <Link
                                to="/admin/orders/$orderId"
                                params={{ orderId: order.id }}
                                className="font-bold text-gold hover:underline"
                              >
                                {order.orderNumber}
                              </Link>
                              <p className="text-[0.65rem] text-cream/50 mt-0.5">
                                {new Date(order.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </td>
                            <td className="px-5 py-4">
                              <p className="font-semibold text-cream text-xs">{order.customer.name}</p>
                              <p className="text-xs text-cream/70">{order.customer.phone}</p>
                              <p className="text-[0.7rem] text-cream/50">{order.customer.email}</p>
                            </td>
                            <td className="px-4 py-4 text-xs">
                              <div className="flex items-center gap-1.5 font-medium capitalize text-cream">
                                {order.fulfilmentType === "pickup" ? (
                                  <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
                                ) : (
                                  <Truck className="h-3.5 w-3.5 text-saffron shrink-0" />
                                )}
                                <span>{order.fulfilmentType}</span>
                              </div>
                              <p className="text-cream/80 text-[0.75rem] mt-0.5">
                                {order.fulfilmentDate} @ {order.fulfilmentTime}
                              </p>
                              {order.customer.address && (
                                <p className="text-[0.65rem] text-cream/60 truncate max-w-[12rem]">
                                  {order.customer.address}
                                </p>
                              )}
                            </td>
                            <td className="px-5 py-4 text-xs space-y-1">
                              {order.items.map((it, idx) => (
                                <div key={idx}>
                                  <span className="font-bold text-gold">{it.qty}×</span>{" "}
                                  <span className="text-cream font-medium">{it.name}</span>
                                  <span className="text-[0.7rem] text-cream/60 ml-1">
                                    ({it.aloo ? "Aloo" : "No aloo"} · {it.extraSpicy ? "Extra spicy" : "Regular"})
                                  </span>
                                  {it.notes && (
                                    <p className="text-[0.65rem] italic text-gold/80">“{it.notes}”</p>
                                  )}
                                </div>
                              ))}
                              {order.specialInstructions && (
                                <p className="mt-1 rounded bg-black/40 p-1.5 text-[0.65rem] text-cream/80 border border-gold/15">
                                  <span className="text-gold font-medium">Note:</span> {order.specialInstructions}
                                </p>
                              )}
                            </td>
                            <td className="px-4 py-4 font-display font-bold text-cream text-base">
                              {formatMoney(order.total)}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getStatusBadge(
                                  order.status,
                                )}`}
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {order.status === "confirmed" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateStatus(order.id, "preparing")}
                                    className="h-8 bg-saffron text-saffron-foreground hover:bg-saffron/90 text-xs px-3 font-semibold"
                                  >
                                    Start Dum Cooking
                                  </Button>
                                )}
                                {order.status === "preparing" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateStatus(order.id, "ready")}
                                    className="h-8 bg-gold text-black hover:bg-gold/90 text-xs px-3 font-bold"
                                  >
                                    Mark Ready
                                  </Button>
                                )}
                                {order.status === "ready" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateStatus(order.id, "completed")}
                                    className="h-8 bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-3 font-semibold"
                                  >
                                    Complete Fulfilment
                                  </Button>
                                )}
                                {order.status === "completed" && (
                                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="h-4 w-4" /> Fulfilled
                                  </span>
                                )}
                                {order.status !== "completed" && order.status !== "cancelled" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleUpdateStatus(order.id, "cancelled")}
                                    className="h-8 text-chili hover:bg-chili/20 text-xs px-2"
                                  >
                                    Cancel
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (confirm(`Permanently delete order ${order.orderNumber || order.id}?`)) {
                                      deleteOrder(order.id);
                                      toast.success(`Order ${order.orderNumber || order.id} deleted.`);
                                    }
                                  }}
                                  className="h-8 text-cream/40 hover:text-rose-400 hover:bg-rose-500/15 text-xs px-2"
                                  title="Permanently Delete Order"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: MENU MANAGEMENT & TRAY PRICING (ALL-IN-ONE)        */}
          {/* ========================================================= */}
          {activeSection === "menu" && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              {/* 1. Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-gold" />
                    <h2 className="font-display text-2xl text-cream font-bold">
                      Signature Menu & Tray Pricing Control
                    </h2>
                  </div>
                  <p className="text-xs text-cream/60 mt-0.5">
                    Live database recipes ({dynamicMenuItems?.length || 0} dishes). Add new recipes, edit prices & portion specs, or delete items right here.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={handleOpenAddDishModal}
                    className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs shadow-md shadow-gold/20 hover:scale-105 transition-all gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add New Biryani Tray</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      await refreshMenuFromBackend();
                      toast.success("Menu synchronized with MySQL database!");
                    }}
                    disabled={menuSyncing}
                    className="border-gold/30 bg-black/40 text-xs text-cream hover:bg-gold/15 hover:text-gold gap-1.5"
                    title="Refresh live menu from MySQL database"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${menuSyncing ? "animate-spin text-gold" : "text-gold"}`} />
                    <span>Sync DB</span>
                  </Button>
                </div>
              </div>

              {/* 2. Filter & Search Controls */}
              <div className="grid gap-3 sm:grid-cols-3 rounded-2xl border border-gold/20 bg-[#120c08]/90 p-4 shadow-lg backdrop-blur-xl">
                {/* Search */}
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
                  <Input
                    placeholder="Search biryani recipe, meat cuts, spices..."
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    className="h-10 rounded-xl border-gold/25 bg-black/40 pl-10 pr-4 text-xs text-cream placeholder:text-cream/40 focus-visible:border-gold"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={menuCategoryFilter}
                    onChange={(e) => setMenuCategoryFilter(e.target.value)}
                    className="h-10 w-full rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="all">All Culinary Categories</option>
                    <option value="Signature Trays">Signature Trays</option>
                    <option value="Royal & Occasion">Royal & Occasion</option>
                    <option value="Chef Reserve">Chef Reserve</option>
                  </select>
                </div>

                {/* Availability Filter */}
                <div>
                  <select
                    value={menuAvailFilter}
                    onChange={(e) => setMenuAvailFilter(e.target.value as any)}
                    className="h-10 w-full rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
                  >
                    <option value="all">All Dishes (Active & Inactive)</option>
                    <option value="active">Active On Menu Only</option>
                    <option value="inactive">Inactive / Sold Out Only</option>
                  </select>
                </div>
              </div>

              {/* 3. Luxury Grid of Real Database Dishes */}
              {filteredMenuItems.length === 0 ? (
                <div className="rounded-3xl border border-gold/20 bg-[#120c08]/80 p-12 text-center space-y-4">
                  <UtensilsCrossed className="h-12 w-12 text-gold/40 mx-auto" />
                  <h3 className="font-display text-lg text-cream font-bold">No Menu Items Found</h3>
                  <p className="text-xs text-cream/60 max-w-md mx-auto">
                    {menuSearchQuery ? "No dishes match your search query." : "No dishes currently in database for this filter."}
                  </p>
                  <Button
                    onClick={handleOpenAddDishModal}
                    className="bg-gold text-black font-bold text-xs hover:bg-gold/90"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Your First Dish
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredMenuItems.map((item) => (
                    <div
                      key={item.id}
                      className={`rounded-3xl border p-6 backdrop-blur-xl shadow-xl space-y-4 transition-all ${
                        item.available
                          ? "border-gold/25 bg-[#120c08]/90 hover:border-gold/50"
                          : "border-zinc-800 bg-zinc-950/60 opacity-80"
                      }`}
                    >
                      {/* Dish Photo Thumbnail & Top Status Row */}
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        <div className="relative h-24 w-32 rounded-2xl overflow-hidden border border-gold/30 shrink-0 bg-black/60 shadow-md">
                          <img
                            src={item.image || chickenImg}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                          {item.badge && (
                            <span className="absolute top-1 left-1 rounded-md bg-gold/90 px-1.5 py-0.5 text-[0.58rem] font-bold text-black uppercase tracking-wider">
                              {item.badge}
                            </span>
                          )}
                          <span
                            className={`absolute bottom-1 right-1 rounded-md px-1.5 py-0.5 text-[0.6rem] font-bold ${
                              item.available
                                ? "bg-emerald-950/90 text-emerald-300 border border-emerald-500/40"
                                : "bg-red-950/90 text-red-300 border border-red-500/40"
                            }`}
                          >
                            {item.available ? "Active" : "Inactive"}
                          </span>
                        </div>

                        <div className="flex-1 space-y-1 w-full">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[0.62rem] font-bold uppercase tracking-widest text-gold block">
                                {item.category || "Signature Trays"}
                              </span>
                              <h3 className="font-display text-lg font-bold text-cream leading-tight">
                                {item.name}
                              </h3>
                            </div>

                            {/* Active Switch Toggle */}
                            <div className="flex items-center gap-1.5 shrink-0 bg-black/50 border border-gold/20 rounded-xl px-2.5 py-1">
                              <Label htmlFor={`avail-${item.id}`} className="text-[0.68rem] text-cream/70 cursor-pointer">
                                {item.available ? "Active" : "Off"}
                              </Label>
                              <Switch
                                id={`avail-${item.id}`}
                                checked={item.available}
                                onCheckedChange={() => {
                                  const newStatus = toggleMenuItemAvailability(item.id);
                                  toast.success(`'${item.name}' is now ${newStatus ? "Active on public menu" : "Inactive (Hidden)"}`);
                                }}
                              />
                            </div>
                          </div>

                          <p className="text-xs text-cream/70 line-clamp-2 leading-relaxed pt-1">
                            {item.description || "Freshly layered dum biryani cooked in sealed handi vessels."}
                          </p>
                        </div>
                      </div>

                      {/* 4-Box Pricing & Portion Specs Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 rounded-2xl border border-gold/15 bg-black/50 p-3 text-xs">
                        <div className="p-1">
                          <span className="text-[0.62rem] text-gold uppercase tracking-wider block font-semibold">Standard Tray</span>
                          <p className="font-display text-base font-bold text-cream mt-0.5">
                            {formatMoney(item.price)}
                          </p>
                        </div>

                        <div className="p-1">
                          <span className="text-[0.62rem] text-saffron uppercase tracking-wider block font-semibold">With Golden Aloo</span>
                          <p className="font-display text-base font-bold text-saffron mt-0.5">
                            {formatMoney(item.priceWithAloo || item.price + 7)}
                          </p>
                        </div>

                        <div className="p-1">
                          <span className="text-[0.62rem] text-cream/50 uppercase tracking-wider block font-semibold">Meat Weight</span>
                          <p className="font-medium text-cream text-[0.72rem] mt-0.5 truncate" title={item.meatWeight}>
                            {item.meatWeight || "1.6 – 1.8 kg"}
                          </p>
                        </div>

                        <div className="p-1">
                          <span className="text-[0.62rem] text-cream/50 uppercase tracking-wider block font-semibold">Basmati Rice</span>
                          <p className="font-medium text-cream text-[0.72rem] mt-0.5 truncate" title={item.riceWeight}>
                            {item.riceWeight || "1.0 kg raw"}
                          </p>
                        </div>
                      </div>

                      {/* Meta Tags Strip */}
                      <div className="flex flex-wrap items-center gap-2 text-[0.65rem] text-cream/60 pt-1">
                        <span className={`rounded-full px-2 py-0.5 border font-semibold ${
                          item.isHalalCertified !== false
                            ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                            : "bg-purple-950/60 border-purple-500/40 text-purple-300"
                        }`}>
                          {item.isHalalCertified !== false ? "✅ 100% Halal Certified" : "⚠️ Dedicated Isolated Vessel"}
                        </span>

                        <span className="rounded-full bg-black/40 border border-gold/20 px-2 py-0.5 text-cream/70">
                          👥 {item.serves || "Serves 4–5"}
                        </span>

                        <span className="rounded-full bg-black/40 border border-gold/20 px-2 py-0.5 text-cream/70">
                          🌶️ {item.spiciness || "Medium"}
                        </span>

                        <span className="rounded-full bg-black/40 border border-gold/20 px-2 py-0.5 text-cream/70">
                          🍲 {item.dailyLimit || 10} Trays Limit
                        </span>

                        {item.kcal && (
                          <span className="rounded-full bg-black/40 border border-gold/20 px-2 py-0.5 text-cream/70">
                            ⚡ {item.kcal} kcal
                          </span>
                        )}
                      </div>

                      {/* Card Action Buttons (Edit Specs & Delete) */}
                      <div className="flex items-center justify-between pt-3 border-t border-gold/10 text-xs">
                        <span className="text-[0.68rem] text-cream/50">
                          Complimentary: Boiled Eggs & Cashew Ghee Pack
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditDishModal(item)}
                            className="border-gold/30 bg-gold/10 text-gold hover:bg-gold hover:text-black font-semibold text-xs h-8 gap-1 cursor-pointer"
                          >
                            <Edit className="h-3 w-3" />
                            <span>Edit Specs</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDeleteDishModal(item)}
                            className="border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:text-rose-200 text-xs h-8 px-2.5 cursor-pointer"
                            title="Delete this dish"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 4. ADD / EDIT DISH DIALOG MODAL (Integrated on this page) */}
              <Dialog open={menuModalOpen} onOpenChange={setMenuModalOpen}>
                <DialogContent className="max-w-2xl border-gold/40 bg-[#0d0704] text-cream max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                      <UtensilsCrossed className="h-4 w-4 text-gold" />
                      <span>{editingMenuItem ? "Edit Recipe Specs & Pricing" : "New Culinary Dish Addition"}</span>
                    </div>
                    <DialogTitle className="font-display text-2xl text-cream font-bold">
                      {editingMenuItem ? `Edit "${editingMenuItem.name}"` : "Add New Dum Biryani Tray"}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-cream/60">
                      {editingMenuItem
                        ? "Update portion weights, pricing, aloo rate, and chef tags in database."
                        : "Enter fresh details for this new recipe. All inputs are clean and ready for your custom data."}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSaveDish} className="space-y-4 pt-2 text-xs">
                    {/* 1. Photography Selection & Preview */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gold uppercase tracking-wider">
                        Biryani Photography
                      </Label>

                      <div className="flex flex-col sm:flex-row gap-4 items-center rounded-2xl border border-gold/20 bg-black/40 p-4">
                        <div className="relative h-24 w-32 rounded-xl overflow-hidden border border-gold/30 shrink-0 bg-black/60 flex items-center justify-center">
                          {mFormImage ? (
                            <img src={mFormImage} alt="Preview" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[0.68rem] text-cream/40 text-center px-2">No photo selected</span>
                          )}
                        </div>

                        <div className="flex-1 space-y-2 w-full">
                          <p className="text-cream/80 text-[0.7rem]">
                            Choose from signature presets or provide custom image URL:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: "🍗 Chicken Handi", url: chickenImg },
                              { label: "🐐 Mutton Copper Handi", url: muttonImg },
                              { label: "🥩 Spiced Beef Handi", url: dumHandiImg },
                              { label: "🥓 Pork Platter", url: heroImg },
                            ].map((preset, idx) => (
                              <button
                                type="button"
                                key={idx}
                                onClick={() => setMFormImage(preset.url)}
                                className={`rounded-lg px-2.5 py-1 text-[0.65rem] font-medium transition-all ${
                                  mFormImage === preset.url
                                    ? "bg-gold text-black font-bold shadow-md shadow-gold/30"
                                    : "border border-gold/20 bg-black/50 text-cream/70 hover:border-gold/40"
                                }`}
                              >
                                {preset.label}
                              </button>
                            ))}
                          </div>

                          <Input
                            placeholder="Or paste custom image URL (https://...)"
                            value={mFormImage}
                            onChange={(e) => setMFormImage(e.target.value)}
                            className="h-8 rounded-lg border-gold/25 bg-black/50 text-xs text-cream"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. Name & Category */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="m-dish-name" className="text-xs text-cream/80">
                          Biryani Name *
                        </Label>
                        <Input
                          id="m-dish-name"
                          placeholder="e.g. Awadhi Mutton Dum Biryani"
                          value={mFormName}
                          onChange={(e) => setMFormName(e.target.value)}
                          required
                          className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="m-dish-category" className="text-xs text-cream/80">
                          Category
                        </Label>
                        <select
                          id="m-dish-category"
                          value={mFormCategory}
                          onChange={(e) => setMFormCategory(e.target.value)}
                          className="w-full h-9 rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
                        >
                          <option value="Signature Trays">Signature Trays</option>
                          <option value="Royal & Occasion">Royal & Occasion</option>
                          <option value="Chef Reserve">Chef Reserve</option>
                        </select>
                      </div>
                    </div>

                    {/* 3. Description */}
                    <div className="space-y-1">
                      <Label htmlFor="m-dish-desc" className="text-xs text-cream/80">
                        Detailed Culinary Description & Marination
                      </Label>
                      <Textarea
                        id="m-dish-desc"
                        rows={3}
                        placeholder="Describe the marination, saffron basmati layering, ghee garnishes..."
                        value={mFormDescription}
                        onChange={(e) => setMFormDescription(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream placeholder:text-cream/40"
                      />
                    </div>

                    {/* 4. Pricing & Daily Oven Limit */}
                    <div className="grid gap-3 sm:grid-cols-3 rounded-2xl border border-gold/20 bg-black/40 p-4">
                      <div className="space-y-1">
                        <Label htmlFor="m-dish-price" className="text-xs text-gold font-semibold">
                          Standard Tray Price ($) *
                        </Label>
                        <Input
                          id="m-dish-price"
                          type="number"
                          step="0.01"
                          placeholder="e.g. 109.99"
                          value={mFormPrice}
                          onChange={(e) => {
                            setMFormPrice(e.target.value);
                            const p = parseFloat(e.target.value) || 0;
                            setMFormPriceWithAloo((p + 7).toFixed(2));
                          }}
                          required
                          className="rounded-xl border-gold/30 bg-black/50 text-xs font-mono font-bold text-cream"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="m-dish-price-aloo" className="text-xs text-saffron font-semibold">
                          Price with Golden Aloo ($)
                        </Label>
                        <Input
                          id="m-dish-price-aloo"
                          type="number"
                          step="0.01"
                          placeholder="e.g. 116.99"
                          value={mFormPriceWithAloo}
                          onChange={(e) => setMFormPriceWithAloo(e.target.value)}
                          className="rounded-xl border-gold/30 bg-black/50 text-xs font-mono font-bold text-cream"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="m-dish-daily-limit" className="text-xs text-cream/80">
                          Daily Oven Limit (Trays)
                        </Label>
                        <Input
                          id="m-dish-daily-limit"
                          type="number"
                          placeholder="e.g. 10"
                          value={mFormDailyLimit}
                          onChange={(e) => setMFormDailyLimit(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/50 text-xs text-cream"
                        />
                      </div>
                    </div>

                    {/* 5. Portion Sizes & Weights */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label htmlFor="m-tray-size" className="text-xs text-cream/80">
                          Serving Size
                        </Label>
                        <Input
                          id="m-tray-size"
                          value={mFormTraySize}
                          onChange={(e) => setMFormTraySize(e.target.value)}
                          placeholder="e.g. Serves 4–5"
                          className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="m-meat-weight" className="text-xs text-cream/80">
                          Meat Weight / Cut
                        </Label>
                        <Input
                          id="m-meat-weight"
                          value={mFormMeatWeight}
                          onChange={(e) => setMFormMeatWeight(e.target.value)}
                          placeholder="e.g. 1.6 kg Halal Marinated Chicken"
                          className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="m-rice-weight" className="text-xs text-cream/80">
                          Raw Basmati Rice
                        </Label>
                        <Input
                          id="m-rice-weight"
                          value={mFormRiceWeight}
                          onChange={(e) => setMFormRiceWeight(e.target.value)}
                          placeholder="e.g. 1.0 kg Raw Aged Basmati"
                          className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                        />
                      </div>
                    </div>

                    {/* 6. Heat, Calories, Badge */}
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="space-y-1">
                        <Label htmlFor="m-kcal" className="text-xs text-cream/80">
                          Approx Calories (kcal)
                        </Label>
                        <Input
                          id="m-kcal"
                          type="number"
                          placeholder="e.g. 1750"
                          value={mFormKcal}
                          onChange={(e) => setMFormKcal(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="m-badge" className="text-xs text-cream/80">
                          Diner Badge (Optional)
                        </Label>
                        <Input
                          id="m-badge"
                          placeholder="e.g. Chef's Special, Top Seller"
                          value={mFormBadge}
                          onChange={(e) => setMFormBadge(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="m-spiciness" className="text-xs text-cream/80">
                          Spiciness Profile
                        </Label>
                        <select
                          id="m-spiciness"
                          value={mFormSpiciness}
                          onChange={(e) => setMFormSpiciness(e.target.value as any)}
                          className="w-full h-9 rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
                        >
                          <option value="Mild">Mild</option>
                          <option value="Medium">Medium</option>
                          <option value="Extra Spicy">Extra Spicy</option>
                        </select>
                      </div>
                    </div>

                    {/* 7. Halal & Availability Switches */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-gold/20 bg-black/40 p-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          id="m-halal"
                          checked={mFormIsHalal}
                          onCheckedChange={setMFormIsHalal}
                        />
                        <Label htmlFor="m-halal" className="text-xs text-cream/90 cursor-pointer">
                          100% Halal Certified Meat
                        </Label>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          id="m-avail"
                          checked={mFormAvailable}
                          onCheckedChange={setMFormAvailable}
                        />
                        <Label htmlFor="m-avail" className="text-xs text-cream/90 cursor-pointer">
                          Active & Orderable on Public Menu
                        </Label>
                      </div>
                    </div>

                    {/* 8. Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gold/20">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setMenuModalOpen(false)}
                        className="text-xs text-cream/70 hover:text-cream"
                      >
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        disabled={isSavingDish}
                        className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs shadow-md shadow-gold/20"
                      >
                        {isSavingDish ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin mr-1" />
                            Saving to Database...
                          </>
                        ) : (
                          editingMenuItem ? "Save Recipe Changes" : "Save & Publish Dish"
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* 5. DELETE CONFIRMATION MODAL */}
              <Dialog open={menuDeleteOpen} onOpenChange={setMenuDeleteOpen}>
                <DialogContent className="max-w-md border-rose-500/40 bg-[#0d0704] text-cream">
                  <DialogHeader>
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-400">
                      <Trash2 className="h-4 w-4 text-rose-400" />
                      <span>Delete Recipe from Database</span>
                    </div>
                    <DialogTitle className="font-display text-xl text-cream font-bold">
                      Delete "{itemToDelete?.name}"?
                    </DialogTitle>
                    <DialogDescription className="text-xs text-cream/70">
                      Are you sure you want to permanently delete this recipe? It will be removed from the MySQL database and diner checkout immediately.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-rose-500/20">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setMenuDeleteOpen(false)}
                      className="text-xs text-cream/70 hover:text-cream"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={handleConfirmDeleteDish}
                      disabled={isDeletingDish}
                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                    >
                      {isDeletingDish ? "Deleting..." : "Yes, Delete Dish"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: CUSTOMERS DIRECTORY                                */}
          {/* ========================================================= */}
          {activeSection === "customers" && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
                <div>
                  <h2 className="font-display text-2xl text-cream font-bold">
                    Diner Database & VIP Profiles
                  </h2>
                  <p className="text-xs text-cream/60">
                    128 registered diners across Springfield, MO • VIP loyalty & order histories
                  </p>
                </div>
                <Button asChild className="bg-gold text-black hover:bg-gold/90 font-bold text-xs">
                  <Link to="/admin/customers">
                    Open Dedicated Customer CRM →
                  </Link>
                </Button>
              </div>

              <div className="rounded-3xl border border-gold/25 bg-[#120c08]/85 shadow-2xl overflow-hidden backdrop-blur-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-gold/15 bg-black/40 text-[0.7rem] uppercase tracking-wider text-gold">
                      <tr>
                        <th className="px-5 py-4">Customer</th>
                        <th className="px-5 py-4">Contact Info</th>
                        <th className="px-5 py-4">Status</th>
                        <th className="px-5 py-4">Order Frequency</th>
                        <th className="px-5 py-4">Total Spend</th>
                        <th className="px-5 py-4">Favorite Tray</th>
                        <th className="px-5 py-4">Preferred Method</th>
                        <th className="px-5 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold/10">
                      {dynamicCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="px-5 py-12 text-center">
                            <Users className="mx-auto h-8 w-8 text-gold/40 mb-2" />
                            <p className="text-sm font-semibold text-cream">No customer records in database yet</p>
                            <p className="text-xs text-cream/60 mt-1">
                              Customers who place orders on the storefront or reservations will automatically appear here.
                            </p>
                            <Link
                              to="/admin/customers"
                              className="mt-3 inline-flex items-center gap-1.5 rounded-xl border border-gold/30 bg-black/40 px-3 py-1.5 text-xs text-gold hover:bg-gold/15 transition-all"
                            >
                              Open Customer Management →
                            </Link>
                          </td>
                        </tr>
                      ) : (
                        dynamicCustomers.map((cust) => (
                          <tr key={cust.id} className="hover:bg-gold/5 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold border ${cust.avatarBg || "bg-gold/15 border-gold/30"} ${cust.avatarText || "text-gold"}`}
                                >
                                  {cust.avatarInitials}
                                </div>
                                <div>
                                  <p className="font-semibold text-cream text-xs">{cust.name}</p>
                                  <p className="text-[0.65rem] text-cream/50">Joined {cust.joinDate}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-xs">
                              <p className="text-cream font-mono">{cust.phone}</p>
                              <p className="text-[0.7rem] text-cream/60">{cust.email}</p>
                            </td>
                            <td className="px-5 py-4 text-xs">
                              <span className="rounded-full bg-gold/15 border border-gold/30 px-2 py-0.5 text-[0.65rem] font-semibold text-gold">
                                {cust.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs">
                              <span className="font-bold text-cream">{cust.totalOrders} Orders</span>
                              <p className="text-[0.65rem] text-cream/50">Last: {cust.lastOrderDate || "Recent"}</p>
                            </td>
                            <td className="px-5 py-4 font-display font-bold text-gold text-sm font-mono">
                              {formatMoney(cust.totalSpend || 0)}
                            </td>
                            <td className="px-5 py-4 text-xs text-cream font-medium">
                              {cust.favoriteProtein || "Signature Dum"}
                            </td>
                            <td className="px-5 py-4 text-xs">
                              <span className="rounded-full bg-black/50 border border-gold/20 px-2.5 py-0.5 text-[0.7rem] text-cream/80">
                                {cust.preferredFulfilment || "Pickup"}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <Link
                                to="/admin/customers"
                                className="inline-flex items-center gap-1 text-xs text-gold hover:underline font-semibold"
                              >
                                Profile & CRM →
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: DELIVERY & ROUTING                                 */}
          {/* ========================================================= */}
          {activeSection === "delivery" && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
                <div>
                  <h2 className="font-display text-2xl text-cream font-bold">
                    Springfield Delivery & Route Dispatch
                  </h2>
                  <p className="text-xs text-cream/60">
                    Local 10-mile radius from 3625 S Bedford Ave (65809)
                  </p>
                </div>
                <Button asChild size="sm" className="bg-gold text-black hover:bg-gold/90 font-bold text-xs">
                  <Link to="/admin/delivery">
                    Open Full Delivery Command →
                  </Link>
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-3xl border border-gold/25 bg-[#120c08]/85 p-6 backdrop-blur-xl shadow-xl space-y-4">
                  <h3 className="font-display text-lg text-cream font-bold flex items-center gap-2">
                    <Truck className="h-5 w-5 text-gold" /> Delivery Schedule & Windows
                  </h3>
                  <p className="text-xs text-cream/70">
                    Deliveries are dispatched in insulated thermal carriers between 2:00 PM and 6:00 PM daily.
                  </p>

                  <div className="space-y-2 border-t border-gold/15 pt-3">
                    {[
                      { window: "2:00 PM – 3:00 PM", count: "3 Trays Scheduled", status: "Active" },
                      { window: "3:00 PM – 4:00 PM", count: "2 Trays Scheduled", status: "Active" },
                      { window: "4:00 PM – 5:00 PM", count: "2 Trays Scheduled", status: "Preparing" },
                      { window: "5:00 PM – 6:00 PM", count: "1 Tray Scheduled", status: "Confirmed" },
                    ].map((w, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-xl border border-gold/15 bg-black/40 p-3 text-xs"
                      >
                        <span className="font-mono font-medium text-cream">{w.window}</span>
                        <span className="text-gold font-semibold">{w.count}</span>
                        <span className="rounded bg-emerald-500/15 text-emerald-400 px-2 py-0.5 text-[0.65rem]">
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-gold/25 bg-[#120c08]/85 p-6 backdrop-blur-xl shadow-xl space-y-4">
                  <h3 className="font-display text-lg text-cream font-bold flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gold" /> Pickup Counter Instructions
                  </h3>
                  <p className="text-xs text-cream/70">
                    Pickup orders are hot-sealed in our signature golden packaging at 3625 S Bedford Ave.
                  </p>

                  <div className="rounded-xl border border-gold/15 bg-black/40 p-4 space-y-2 text-xs text-cream/80">
                    <p className="font-semibold text-gold">Pickup Hours:</p>
                    <p>• 11:00 AM – 6:00 PM (Every day except Wednesdays)</p>
                    <p className="font-semibold text-gold pt-2">Packaging Inclusions:</p>
                    <p>• Hot-sealed Aluminum Biryani Tray (serving 4–5 adults)</p>
                    <p>• Warm Ghee, Roasted Cashew & Fried Onion topping pack</p>
                    <p>• Raita, Cut Onions & Lime Wedges, Complimentary Dessert</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: FINANCIAL REPORTS                                  */}
          {/* ========================================================= */}
          {activeSection === "reports" && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
                <div>
                  <h2 className="font-display text-2xl text-cream font-bold">
                    Financial Performance & Sales Analytics
                  </h2>
                  <p className="text-xs text-cream/60">
                    Gross revenue, net margins, daily capacity tracking, protein share & downloadable reports
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild className="bg-gold text-black hover:bg-gold/90 font-bold text-xs">
                    <Link to="/admin/reports">
                      Open Dedicated Analytics & BI Dashboard →
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-gold">Average Order Value (AOV)</p>
                  <h3 className="mt-2 font-display text-3xl font-bold text-cream font-mono">$154.50</h3>
                  <p className="mt-1 text-[0.7rem] text-cream/60">+$12.50 per Handi booking</p>
                </div>
                <div className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-saffron">Aloo Addon Margin Rate</p>
                  <h3 className="mt-2 font-display text-3xl font-bold text-cream font-mono">71.2%</h3>
                  <p className="mt-1 text-[0.7rem] text-cream/60">+$7.00 per tray upgrade</p>
                </div>
                <div className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-emerald-400">Gross Month Revenue</p>
                  <h3 className="mt-2 font-display text-3xl font-bold text-cream font-mono">$38,750.00</h3>
                  <p className="mt-1 text-[0.7rem] text-emerald-400 font-mono">+16.8% monthly growth</p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 7: KITCHEN SETTINGS                                   */}
          {/* ========================================================= */}
          {activeSection === "settings" && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
                <div>
                  <h2 className="font-display text-2xl text-cream font-bold">
                    Kitchen Operations & Store Configuration
                  </h2>
                  <p className="text-xs text-cream/60">
                    Manage daily cooking quotas, order cutoff schedules, and operating hours
                  </p>
                </div>
                <Button asChild size="sm" className="bg-gold text-black hover:bg-gold/90 font-bold text-xs">
                  <Link to="/admin/daily-control">
                    Open Dedicated Daily Control →
                  </Link>
                </Button>
              </div>

              <div className="max-w-2xl space-y-6">
                <div className="rounded-3xl border border-gold/25 bg-[#120c08]/85 p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-gold/15 pb-3">
                    <h3 className="font-display text-lg text-cream font-bold">Dum Kitchen Capacity Quota</h3>
                    <span className="font-mono text-xs text-gold font-bold">Active Limit: {dailyLimit} Trays</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <Label htmlFor="limit-input" className="text-gold font-semibold">Maximum Daily Trays Limit:</Label>
                      <span className="font-bold text-cream font-mono">{dailyLimitInput} Trays</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDailyLimitInput((prev) => Math.max(1, prev - 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-black/50 text-gold hover:bg-gold/15 text-lg font-bold cursor-pointer"
                        title="Decrease 1 tray"
                      >
                        -
                      </button>

                      <Input
                        id="limit-input"
                        type="number"
                        min={1}
                        max={100}
                        value={dailyLimitInput}
                        onChange={(e) => setDailyLimitInput(Math.max(1, parseInt(e.target.value, 10) || 10))}
                        className="h-10 text-center font-display text-lg font-bold text-cream rounded-xl border-gold/30 bg-black/60"
                      />

                      <button
                        type="button"
                        onClick={() => setDailyLimitInput((prev) => Math.min(100, prev + 1))}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-black/50 text-gold hover:bg-gold/15 text-lg font-bold cursor-pointer"
                        title="Increase 1 tray"
                      >
                        +
                      </button>

                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          updateSettings({ dailyTrayLimit: dailyLimitInput });
                          toast.success(`✅ Saved to Database: Capacity limit set to ${dailyLimitInput} trays!`);
                        }}
                        className="h-10 bg-gold text-black hover:bg-amber-400 font-bold text-xs px-3 shadow-md shrink-0 cursor-pointer"
                      >
                        Apply Limit
                      </Button>
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[0.65rem] text-cream/50 uppercase tracking-wider font-semibold block">
                        Quick Capacity Presets (Click to Save to DB):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: "10 Trays (Default)", val: 10 },
                          { label: "15 Trays", val: 15 },
                          { label: "20 Trays", val: 20 },
                          { label: "25 Trays", val: 25 },
                          { label: "35 Trays (Weekend)", val: 35 },
                          { label: "50 Trays (Feast)", val: 50 },
                        ].map((preset) => (
                          <button
                            key={preset.val}
                            type="button"
                            onClick={() => {
                              setDailyLimitInput(preset.val);
                              updateSettings({ dailyTrayLimit: preset.val });
                              toast.success(`✅ Saved to Database: Capacity set to ${preset.val} trays!`);
                            }}
                            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all cursor-pointer ${
                              dailyLimitInput === preset.val
                                ? "bg-gold text-black font-bold shadow-md shadow-gold/30"
                                : "border border-gold/20 bg-black/40 text-cream/70 hover:border-gold/40 hover:text-cream"
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gold/15 pt-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="cutoff-time" className="text-xs text-gold font-semibold">
                        Daily Order Acceptance Cutoff Time
                      </Label>
                      {(() => {
                        const now = new Date();
                        const isPast = now.getHours() * 60 + now.getMinutes() >= cutoffHourInput * 60;
                        const hour12 = cutoffHourInput > 12 ? cutoffHourInput - 12 : cutoffHourInput === 0 ? 12 : cutoffHourInput;
                        const ampm = cutoffHourInput >= 12 ? "PM" : "AM";
                        return (
                          <span
                            className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                              isPast
                                ? "bg-red-500/15 text-red-400 border border-red-500/30"
                                : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            }`}
                          >
                            {isPast ? `🔴 Closed for Today (Past ${hour12}:00 ${ampm})` : `🟢 Active (Closes at ${hour12}:00 ${ampm})`}
                          </span>
                        );
                      })()}
                    </div>
                    <select
                      id="cutoff-time"
                      value={cutoffHourInput}
                      onChange={(e) => setCutoffHourInput(parseInt(e.target.value, 10))}
                      className="w-full h-10 rounded-xl border border-gold/25 bg-black/50 px-3 text-xs text-cream font-mono cursor-pointer focus:outline-none focus:border-gold"
                    >
                      <option value={9}>9:00 AM (Morning Cutoff)</option>
                      <option value={10}>10:00 AM</option>
                      <option value={11}>11:00 AM</option>
                      <option value={12}>12:00 PM (Noon Cutoff)</option>
                      <option value={13}>1:00 PM</option>
                      <option value={14}>2:00 PM (2:00 PM Cutoff)</option>
                      <option value={15}>3:00 PM (Standard 3:00 PM Cutoff)</option>
                      <option value={16}>4:00 PM</option>
                      <option value={17}>5:00 PM</option>
                      <option value={18}>6:00 PM (Evening Cutoff)</option>
                      <option value={19}>7:00 PM</option>
                      <option value={20}>8:00 PM</option>
                      <option value={21}>9:00 PM (Night Cutoff)</option>
                      <option value={22}>10:00 PM</option>
                      <option value={23}>11:00 PM</option>
                    </select>
                    <p className="text-[0.65rem] text-cream/60">
                      Once this time passes today, new customer checkout is automatically closed and blocked in the database.
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-gold/15 pt-4">
                    <div>
                      <p className="text-xs font-medium text-cream">Kitchen Open / Accepting Trays</p>
                      <p className="text-[0.65rem] text-cream/60">Turn off to temporarily pause new customer orders</p>
                    </div>
                    <Switch
                      checked={kitchenOpenInput}
                      onCheckedChange={setKitchenOpenInput}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  <div className="space-y-2 border-t border-gold/15 pt-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="admin-delivery-fee" className="text-xs text-gold font-semibold">
                        Delivery Charge ($)
                      </Label>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold border ${
                          deliveryFeeInput === 0
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        }`}
                      >
                        {deliveryFeeInput === 0 ? "🎉 FREE ($0.00)" : `💵 $${deliveryFeeInput.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cream/40 font-mono text-xs">$</span>
                      <input
                        id="admin-delivery-fee"
                        type="number"
                        min="0"
                        step="0.01"
                        value={deliveryFeeInput}
                        onChange={(e) => setDeliveryFeeInput(Math.max(0, parseFloat(e.target.value) || 0))}
                        className="w-full h-10 rounded-xl border border-gold/25 bg-black/50 pl-7 pr-3 text-xs text-cream font-mono font-bold focus:outline-none focus:border-gold"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                      <button
                        type="button"
                        onClick={() => setDeliveryFeeInput(0)}
                        className={`px-2.5 py-1 text-[11px] rounded-lg font-bold border transition-all cursor-pointer ${
                          deliveryFeeInput === 0
                            ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-sm"
                            : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                        }`}
                      >
                        🎉 Free ($0)
                      </button>
                      {[5, 10, 12, 15].map((fee) => (
                        <button
                          key={fee}
                          type="button"
                          onClick={() => setDeliveryFeeInput(fee)}
                          className={`px-2.5 py-1 text-[11px] rounded-lg font-mono font-medium border transition-all cursor-pointer ${
                            deliveryFeeInput === fee
                              ? "bg-gold text-zinc-950 border-gold font-bold shadow-sm"
                              : "border-gold/20 bg-black/40 text-cream hover:bg-gold/10"
                          }`}
                        >
                          ${fee}.00
                        </button>
                      ))}
                    </div>
                    <p className="text-[0.65rem] text-cream/60">
                      Set to 0 for Free Delivery, or enter custom fee. Stored in MySQL and dynamically reflected in customer app.
                    </p>
                  </div>

                  <Button
                    onClick={async () => {
                      const hour12 = cutoffHourInput > 12 ? cutoffHourInput - 12 : cutoffHourInput === 0 ? 12 : cutoffHourInput;
                      const ampm = cutoffHourInput >= 12 ? "PM" : "AM";
                      const cutoffLabel = `${hour12}:00 ${ampm}`;

                      const payload = {
                        dailyTrayLimit: dailyLimitInput,
                        isKitchenOpen: kitchenOpenInput,
                        orderCutoffHour: cutoffHourInput,
                        orderCutoffTime: `${cutoffHourInput}:00`,
                        deliveryFee: deliveryFeeInput,
                        strictCutoffEnforced: true,
                      };

                      updateSettings(payload);

                      try {
                        await fetch("/api/settings", {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                      } catch (err) {
                        console.warn("Settings sync warning:", err);
                      }

                      toast.success(
                        `✅ Saved to MySQL Database: Daily Cutoff set to ${cutoffLabel}, limit set to ${dailyLimitInput} trays & Delivery Fee set to ${
                          deliveryFeeInput === 0 ? "FREE ($0.00)" : `$${deliveryFeeInput.toFixed(2)}`
                        }!`
                      );
                    }}
                    className="w-full bg-gradient-to-r from-chili via-saffron to-gold text-white hover:brightness-110 font-bold text-xs h-10 shadow-lg shadow-chili/30 cursor-pointer"
                  >
                    Save Operational Settings to Database
                  </Button>
                </div>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. ORDER DETAILS MODAL                                        */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={!!selectedOrderDetails}
        onOpenChange={(open) => !open && setSelectedOrderDetails(null)}
      >
        <DialogContent className="border-gold/30 bg-[#140e09] text-cream sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-cream flex items-center justify-between">
              <span>Order Details</span>
              <span className="font-mono text-sm text-gold">
                {selectedOrderDetails?.orderNumber}
              </span>
            </DialogTitle>
            <DialogDescription className="text-xs text-cream/60">
              Placed on {selectedOrderDetails ? new Date(selectedOrderDetails.createdAt).toLocaleString() : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedOrderDetails && (
            <div className="space-y-4 text-xs">
              {/* Customer */}
              <div className="rounded-xl border border-gold/15 bg-black/40 p-4 space-y-1">
                <p className="font-semibold text-gold uppercase tracking-wider text-[0.65rem]">Customer Information</p>
                <p className="font-medium text-sm text-cream">{selectedOrderDetails.customer.name}</p>
                <p className="text-cream/80">Phone: {selectedOrderDetails.customer.phone}</p>
                <p className="text-cream/80">Email: {selectedOrderDetails.customer.email}</p>
                {selectedOrderDetails.customer.address && (
                  <p className="text-cream/80 pt-1">
                    Delivery Address: {selectedOrderDetails.customer.address},{" "}
                    {selectedOrderDetails.customer.city} {selectedOrderDetails.customer.zipCode}
                  </p>
                )}
              </div>

              {/* Items */}
              <div className="rounded-xl border border-gold/15 bg-black/40 p-4 space-y-2">
                <p className="font-semibold text-gold uppercase tracking-wider text-[0.65rem]">Trays in Dum Handi</p>
                {selectedOrderDetails.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between border-b border-gold/10 pb-1.5 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-cream">{it.qty} × {it.name}</p>
                      <p className="text-[0.7rem] text-cream/60">
                        {it.aloo ? "With Aloo (+$7.00)" : "No Aloo"} · {it.extraSpicy ? "Extra Spicy" : "Regular Spice"}
                      </p>
                      {it.notes && <p className="text-[0.7rem] italic text-gold">“{it.notes}”</p>}
                    </div>
                    <span className="font-bold text-cream font-mono">{formatMoney(it.lineTotal)}</span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="flex justify-between items-center rounded-xl bg-gold/10 p-3 text-sm font-semibold text-cream border border-gold/25">
                <span>Total Amount</span>
                <span className="font-display text-lg text-gold">{formatMoney(selectedOrderDetails.total)}</span>
              </div>

              {/* Quick Status Advancement */}
              <div className="flex items-center justify-end gap-2 pt-2">
                {selectedOrderDetails.status === "confirmed" && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrderDetails.id, "preparing")}
                    className="bg-saffron text-saffron-foreground hover:bg-saffron/90 text-xs"
                  >
                    Start Dum Cooking
                  </Button>
                )}
                {selectedOrderDetails.status === "preparing" && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrderDetails.id, "ready")}
                    className="bg-gold text-black hover:bg-gold/90 text-xs font-bold"
                  >
                    Mark Ready for Pickup/Delivery
                  </Button>
                )}
                {selectedOrderDetails.status === "ready" && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedOrderDetails.id, "completed")}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs"
                  >
                    Complete Fulfilment
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
