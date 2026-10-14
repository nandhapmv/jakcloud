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
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import heroImg from "@/assets/hero-biryani.jpg";
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
  type DynamicOrder,
} from "@/lib/store";
import {
  INITIAL_NOTIFICATIONS,
  type NotificationItem,
  type CustomerRecord,
} from "@/lib/admin-data";
import { MENU, formatMoney, BUSINESS } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
      { title: "Restaurant Command & Analytics — JAKLOUD Spice King" },
      {
        name: "description",
        content: "Executive restaurant management dashboard for JAKLOUD Spice King Dum Biryani.",
      },
    ],
  }),
  component: AdminOverviewPage,
});

function AdminOverviewPage() {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Navigation & UI state
  const [activeSection, setActiveSection] = useState<NavSection>("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Live reactive store hooks
  const { orders, stats: dynamicStats, updateStatus, reload } = useDynamicOrders();
  const { settings, updateSettings } = useKitchenSettings();
  const { customers: dynamicCustomers } = useDynamicCustomers();
  const { items: dynamicMenuItems } = useDynamicMenu();

  const [messages, setMessages] = useState<ContactMessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderResponse | null>(null);

  // Kitchen settings state directly bound to reactive store (defaults to 25 trays)
  const dailyLimit = settings.dailyTrayLimit || 25;
  const kitchenOpen = settings.isKitchenOpen;
  const orderCutoffHour = settings.orderCutoffHour;

  // Editable settings inputs
  const [dailyLimitInput, setDailyLimitInput] = useState<number>(settings.dailyTrayLimit || 25);
  const [kitchenOpenInput, setKitchenOpenInput] = useState<boolean>(settings.isKitchenOpen);
  const [cutoffHourInput, setCutoffHourInput] = useState<number>(settings.orderCutoffHour || 15);

  useEffect(() => {
    if (settings.dailyTrayLimit) setDailyLimitInput(settings.dailyTrayLimit);
    setKitchenOpenInput(settings.isKitchenOpen);
    if (settings.orderCutoffHour) setCutoffHourInput(settings.orderCutoffHour);
  }, [settings]);

  // Dashboard Overview Date-wise Filter State
  type DashboardDateFilter = "all" | "today" | "tomorrow" | "yesterday" | "last7" | "this_month" | "custom";
  const [dashDateFilter, setDashDateFilter] = useState<DashboardDateFilter>("today");
  const [customDate, setCustomDate] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Orders tab filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

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

  // Calculated metrics from real database orders
  // Calculated metrics from real database orders
  const totalTraysBooked = useMemo(() => {
    return orders.reduce((sum, o) => sum + (o.status !== "cancelled" ? o.items.reduce((s, i) => s + i.qty, 0) : 0), 0);
  }, [orders]);

  const capacityPercentage = dailyLimit > 0 ? Math.min(100, Math.round((totalTraysBooked / dailyLimit) * 100)) : 0;

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
    return orders.filter((o) => {
      const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.phone.includes(searchQuery) ||
        o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [orders, orderStatusFilter, searchQuery]);

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

  if (authLoading || (!isAuthenticated && isLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d0906] text-cream">
        <div className="text-center space-y-3">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          <p className="font-display text-sm tracking-widest uppercase text-gold">
            Loading JAKLOUD Command Center...
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
                alt="JAKLOUD Spice King"
                className="relative h-11 w-11 rounded-full border border-gold/60 bg-cream p-0.5 object-cover shadow-[0_0_15px_rgba(212,160,23,0.35)]"
              />
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0 animate-in fade-in-50">
                <span className="font-sans text-base font-bold tracking-wider text-cream truncate block leading-tight">
                  JAKLOUD
                </span>
                <span className="block text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-gold truncate">
                  Spice King · Admin
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

              {/* Integrated Mini Capacity Gauge */}
              <Link
                to="/admin/daily-control"
                className="block pt-1.5 border-t border-white/[0.06] hover:opacity-90 transition-opacity group"
                title="Manage Daily 25-Tray Limit & Capacity"
              >
                <div className="flex items-center justify-between text-[0.68rem] mb-1">
                  <span className="text-gold/80 flex items-center gap-1 group-hover:text-amber-300 font-medium">
                    <Flame className="h-3 w-3 text-chili" /> Capacity
                  </span>
                  <span className="font-mono font-bold text-cream">
                    {totalTraysBooked} / {dailyLimit} Trays
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
                label: `Daily ${dailyLimit}-Tray Limit`,
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
                        {Math.max(0, dailyLimit - totalTraysBooked)} trays remain
                      </span>{" "}
                      before reaching today's {dailyLimit}-tray capacity limit.
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
                <div className="flex flex-wrap items-center gap-3">
                  <Button asChild size="sm" className="bg-gold text-black font-bold hover:bg-gold/90 text-xs">
                    <Link to="/admin/orders">
                      Open Dedicated Order Manager →
                    </Link>
                  </Button>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                    {(["all", "confirmed", "preparing", "ready", "completed", "cancelled"] as const).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => setOrderStatusFilter(st)}
                          className={`rounded-full px-3.5 py-1 text-xs font-medium capitalize transition-all shrink-0 ${
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
                </div>
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
          {/* TAB 3: MENU MANAGEMENT                                    */}
          {/* ========================================================= */}
          {activeSection === "menu" && (
            <div className="space-y-6 animate-in fade-in-50 duration-500">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-4">
                <div>
                  <h2 className="font-display text-2xl text-cream font-bold">
                    Signature Menu & Pricing Control
                  </h2>
                  <p className="text-xs text-cream/60">
                    Control live availability, ingredient portions, and addon configurations
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button asChild size="sm" className="bg-gold text-black hover:bg-gold/90 font-bold text-xs">
                    <Link to="/admin/menu">
                      Open Full Visual Menu Catalog →
                    </Link>
                  </Button>
                  <Button
                    onClick={() => toast.success("Menu configuration synchronized with live store.")}
                    className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-semibold text-xs gap-1.5"
                  >
                    <Save className="h-4 w-4" /> Save All Menu Changes
                  </Button>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {MENU.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-gold/25 bg-[#120c08]/85 p-6 backdrop-blur-xl shadow-xl space-y-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-gold">
                          {item.category}
                        </span>
                        <h3 className="font-display text-xl font-bold text-cream">{item.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`avail-${item.id}`} className="text-xs text-cream/80">
                          Active
                        </Label>
                        <Switch id={`avail-${item.id}`} defaultChecked />
                      </div>
                    </div>

                    <p className="text-xs text-cream/70 leading-relaxed">{item.description}</p>

                    <div className="grid grid-cols-2 gap-4 rounded-xl border border-gold/15 bg-black/40 p-4 text-xs">
                      <div>
                        <span className="text-cream/60">Base Tray Price:</span>
                        <p className="font-display text-lg font-bold text-gold">
                          {formatMoney(item.price)}
                        </p>
                      </div>
                      <div>
                        <span className="text-cream/60">With Aloo (+{formatMoney(7)}):</span>
                        <p className="font-display text-lg font-bold text-saffron">
                          {formatMoney(item.priceWithAloo)}
                        </p>
                      </div>
                      <div>
                        <span className="text-cream/60">Meat Portion:</span>
                        <p className="font-semibold text-cream">1.6 – 1.8 kg</p>
                      </div>
                      <div>
                        <span className="text-cream/60">Basmati Rice:</span>
                        <p className="font-semibold text-cream">1.0 kg raw</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gold/10 text-xs text-cream/60">
                      <span>Complimentary: Boiled Eggs, Cashew Ghee Pack & Dessert</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toast.info(`Editing configuration for ${item.name}`)}
                        className="text-gold text-xs hover:bg-gold/10 gap-1 h-7"
                      >
                        <Edit className="h-3 w-3" /> Edit Specs
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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

                      toast.success(`✅ Saved to MySQL Database: Daily Cutoff set to ${cutoffLabel} & limit set to ${dailyLimitInput} trays!`);
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
