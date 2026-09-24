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
  type DynamicOrder,
} from "@/lib/store";
import {
  WEEKLY_SALES_DATA,
  PROTEIN_DISTRIBUTION,
  BEST_SELLING_DISHES,
  MOCK_CUSTOMERS,
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
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  // Live reactive store hooks
  const { orders, stats: dynamicStats, updateStatus, reload } = useDynamicOrders();
  const { settings, updateSettings } = useKitchenSettings();

  const [messages, setMessages] = useState<ContactMessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<OrderResponse | null>(null);

  // Kitchen settings state directly bound to reactive store
  const dailyLimit = settings.dailyTrayLimit;
  const kitchenOpen = settings.isKitchenOpen;
  const orderCutoffHour = settings.orderCutoffHour;

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

  // Calculated metrics
  const totalTraysBooked = useMemo(() => {
    return orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0) || 19;
  }, [orders]);

  const capacityPercentage = Math.min(100, Math.round((totalTraysBooked / dailyLimit) * 100));

  const pickupOrdersCount = orders.filter((o) => o.fulfilmentType === "pickup").length || 11;
  const deliveryOrdersCount = orders.filter((o) => o.fulfilmentType === "delivery").length || 8;
  const pendingOrdersCount = orders.filter((o) => o.status === "confirmed" || o.status === "preparing").length || 4;

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
    <div className="flex min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold">
      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT SIDEBAR                                               */}
      {/* ------------------------------------------------------------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gold/20 bg-[#100b07] transition-all duration-300 lg:static lg:translate-x-0 ${
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
                <span className="font-display text-lg tracking-wider text-cream font-bold truncate block">
                  JAKLOUD
                </span>
                <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gold truncate">
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
            className="text-cream/60 hover:text-gold lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Live Kitchen Status Pill */}
        {!sidebarCollapsed ? (
          <div className="px-4 pt-3.5 animate-in fade-in-50">
            <div className="flex items-center justify-between rounded-xl border border-gold/20 bg-black/40 p-2.5 text-xs shadow-inner">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="font-medium text-cream text-[0.75rem]">Kitchen Active</span>
              </div>
              <span className="rounded bg-gold/15 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-gold">
                Dum Oven Live
              </span>
            </div>
          </div>
        ) : (
          <div className="pt-3 flex justify-center">
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
        <nav className="flex-1 space-y-1 px-2.5 py-3 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            {
              id: "orders",
              label: "Live Orders",
              icon: ShoppingBag,
              badge: orders.length,
            },
            { id: "menu", label: "Menu Management", icon: MenuSquare },
            { id: "customers", label: "Customers CRM", icon: Users, badge: "128" },
            { id: "delivery", label: "Delivery & Routing", icon: Truck },
            { id: "reports", label: "Financial Reports", icon: BarChart3 },
            { id: "settings", label: "Kitchen Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
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
                <div className="flex items-center gap-3">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-white" : "text-gold/80"}`} />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </div>
                {!sidebarCollapsed && item.badge !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold ${
                      isActive
                        ? "bg-black/30 text-white"
                        : "bg-gold/15 text-gold border border-gold/25"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Dedicated Submodules Section */}
          <div className="pt-3 mt-2 border-t border-gold/15 space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 text-[0.62rem] font-semibold uppercase tracking-wider text-gold/60">
                Dedicated Modules
              </p>
            )}
            {[
              { to: "/admin/orders", label: "Orders Table", icon: ShoppingBag },
              { to: "/admin/menu", label: "Menu Editor", icon: MenuSquare },
              { to: "/admin/proteins", label: "Protein & Halal", icon: Flame },
              { to: "/admin/customers", label: "Customer CRM", icon: Users },
              { to: "/admin/reports", label: "Reports & BI", icon: BarChart3 },
              { to: "/admin/delivery", label: "Delivery Zones", icon: Truck },
              { to: "/admin/daily-control", label: "Daily Capacity", icon: Sliders },
              { to: "/admin/cms", label: "Website CMS", icon: Sparkles },
            ].map((mod) => {
              const ModIcon = mod.icon;
              return (
                <Link
                  key={mod.to}
                  to={mod.to}
                  title={sidebarCollapsed ? mod.label : undefined}
                  className={`flex items-center rounded-xl p-2 text-xs font-medium text-cream/75 hover:bg-gold/15 hover:text-gold transition-colors ${
                    sidebarCollapsed ? "justify-center" : "gap-3 px-3"
                  }`}
                >
                  <ModIcon className="h-3.5 w-3.5 shrink-0 text-gold/80" />
                  {!sidebarCollapsed && <span className="truncate">{mod.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Daily Order Limit Gauge Widget */}
        {!sidebarCollapsed ? (
          <div className="p-3.5 border-t border-gold/15 bg-black/30 animate-in fade-in-50">
            <Link
              to="/admin/daily-control"
              className="block rounded-xl border border-gold/25 bg-[#170f0a] p-3 space-y-2 hover:border-gold/60 transition-colors group cursor-pointer"
              title="Open Daily Order & Capacity Control"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gold uppercase tracking-wider flex items-center gap-1 group-hover:text-amber-300 transition-colors text-[0.7rem]">
                  <Flame className="h-3.5 w-3.5 text-chili animate-pulse" /> Daily Limit
                </span>
                <span className="font-mono font-bold text-cream group-hover:text-gold text-xs">
                  {totalTraysBooked} / {dailyLimit}
                </span>
              </div>
              <Progress
                value={capacityPercentage}
                className="h-1.5 bg-black/60 border border-gold/20"
              />
              <div className="flex justify-between text-[0.62rem] text-cream/60">
                <span>{capacityPercentage}% Reached</span>
                <span className="text-gold font-medium group-hover:underline">Control →</span>
              </div>
            </Link>
          </div>
        ) : (
          <div className="p-2 border-t border-gold/15 flex justify-center">
            <Link
              to="/admin/daily-control"
              className="h-9 w-9 rounded-xl border border-gold/25 bg-[#170f0a] flex items-center justify-center text-gold hover:border-gold"
              title={`Daily Capacity: ${totalTraysBooked}/${dailyLimit} Trays (${capacityPercentage}%)`}
            >
              <Flame className="h-4 w-4 text-chili animate-pulse" />
            </Link>
          </div>
        )}

        {/* Sidebar Footer / User Profile */}
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
                className="rounded-lg p-1.5 text-cream/50 hover:bg-chili/20 hover:text-chili transition-colors"
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
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gold/20 bg-[#120c08]/90 px-4 backdrop-blur-xl sm:px-8">
          {/* Left: Mobile Toggle, Desktop Collapse Toggle & Live Search */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-lg">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="rounded-lg p-2 text-cream hover:bg-gold/10 lg:hidden"
              aria-label="Open navigation drawer"
            >
              <MenuSquare className="h-5 w-5 text-gold" />
            </button>

            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex h-9 w-9 items-center justify-center rounded-xl border border-gold/25 bg-black/40 text-gold hover:bg-gold/15 transition-colors"
              title="Toggle Sidebar Collapse"
            >
              <Sliders className="h-4 w-4" />
            </button>

            <div className="relative w-full">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
              <Input
                placeholder="Search orders, phone, patrons, biryani..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 w-full rounded-2xl border-gold/25 bg-black/40 pl-10 pr-4 text-xs text-cream placeholder:text-cream/40 focus-visible:border-gold focus-visible:ring-1 focus-visible:ring-gold"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/40 hover:text-cream"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Date, Springfield Time, Actions, Notifications & Profile */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* Live Clock & Date */}
            <div className="hidden xl:flex flex-col text-right">
              <span className="text-xs font-semibold text-cream">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="text-[0.7rem] font-mono text-gold flex items-center justify-end gap-1">
                <Clock className="h-3 w-3" />
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })} · Springfield, MO
              </span>
            </div>

            {/* Quick Public View */}
            <Button
              asChild
              variant="outline"
              size="sm"
              className="hidden md:flex border-gold/30 bg-black/40 text-xs text-cream hover:bg-gold/10 hover:text-gold gap-1.5"
            >
              <Link to="/" target="_blank">
                <ExternalLink className="h-3.5 w-3.5 text-gold" /> Website
              </Link>
            </Button>

            {/* Refresh Live Data */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className="h-9 w-9 rounded-full border-gold/30 bg-black/40 text-cream hover:bg-gold/10 hover:text-gold"
              title="Refresh live metrics"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-gold" : ""}`} />
            </Button>

            {/* Notifications Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gold/30 bg-black/40 text-cream/80 hover:bg-gold/10 hover:text-gold transition-colors"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-chili px-1 text-[0.6rem] font-bold text-white animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-gold/30 bg-[#140e09] p-4 shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="flex items-center justify-between border-b border-gold/15 pb-3">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gold" />
                      <h4 className="font-display text-sm text-cream font-semibold">Kitchen Alerts</h4>
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
          </div>
        </header>

        {/* ------------------------------------------------------------- */}
        {/* 3. SECTION CONTENT                                            */}
        {/* ------------------------------------------------------------- */}
        <main className="flex-1 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto w-full">
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
                        {dailyLimit - totalTraysBooked} trays remain
                      </span>{" "}
                      before reaching today's 25-tray capacity limit.
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

              {/* 6 Luxury Analytics Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {/* 1. Today's Orders */}
                <div className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                      Today's Orders
                    </p>
                    <div className="rounded-xl bg-gold/15 p-2 text-gold group-hover:scale-110 transition-transform">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-cream">
                    {totalTraysBooked} <span className="text-xs font-sans text-cream/60">Trays</span>
                  </h3>
                  <div className="mt-2 flex items-center gap-1 text-[0.65rem] text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>+18% vs yesterday</span>
                  </div>
                </div>

                {/* 2. Pending / Preparing */}
                <div className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-wider text-saffron font-semibold">
                      In Dum Prep
                    </p>
                    <div className="rounded-xl bg-saffron/15 p-2 text-saffron group-hover:scale-110 transition-transform">
                      <Flame className="h-4 w-4 animate-pulse text-chili" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-cream">
                    {pendingOrdersCount} <span className="text-xs font-sans text-cream/60">Handis</span>
                  </h3>
                  <div className="mt-2 text-[0.65rem] text-cream/60">
                    Slow cooking on dum
                  </div>
                </div>

                {/* 3. Pickup Orders */}
                <div className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                      Pickup Orders
                    </p>
                    <div className="rounded-xl bg-gold/15 p-2 text-gold group-hover:scale-110 transition-transform">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-cream">
                    {pickupOrdersCount} <span className="text-xs font-sans text-cream/60">Trays</span>
                  </h3>
                  <div className="mt-2 text-[0.65rem] text-cream/60">
                    3625 S Bedford Ave
                  </div>
                </div>

                {/* 4. Delivery Orders */}
                <div className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-wider text-saffron font-semibold">
                      Delivery Orders
                    </p>
                    <div className="rounded-xl bg-saffron/15 p-2 text-saffron group-hover:scale-110 transition-transform">
                      <Truck className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-cream">
                    {deliveryOrdersCount} <span className="text-xs font-sans text-cream/60">Trays</span>
                  </h3>
                  <div className="mt-2 text-[0.65rem] text-cream/60">
                    Within 10 miles radius
                  </div>
                </div>

                {/* 5. Revenue Today */}
                <div className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                      Revenue Today
                    </p>
                    <div className="rounded-xl bg-gold/15 p-2 text-gold group-hover:scale-110 transition-transform">
                      <DollarSign className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-xl font-bold text-cream sm:text-2xl">
                    {stats ? formatMoney(stats.totalRevenue) : "$2,480.90"}
                  </h3>
                  <div className="mt-2 flex items-center gap-1 text-[0.65rem] text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    <span>+24% vs last week</span>
                  </div>
                </div>

                {/* 6. Total Diners */}
                <div className="rounded-2xl border border-gold/25 bg-[#120c08]/85 p-5 backdrop-blur-xl shadow-lg hover:border-gold/50 transition-all group">
                  <div className="flex items-center justify-between">
                    <p className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                      Diner Base
                    </p>
                    <div className="rounded-xl bg-gold/15 p-2 text-gold group-hover:scale-110 transition-transform">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-cream">
                    128 <span className="text-xs font-sans text-cream/60">Diners</span>
                  </h3>
                  <div className="mt-2 text-[0.65rem] text-emerald-400">
                    84% Repeat order rate
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
                      <AreaChart data={WEEKLY_SALES_DATA}>
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
                          data={PROTEIN_DISTRIBUTION}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {PROTEIN_DISTRIBUTION.map((entry, index) => (
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
                          formatter={(value: any) => [`${value}% share`, ""]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-gold/15 pt-3">
                    {PROTEIN_DISTRIBUTION.map((p) => (
                      <div key={p.name} className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        <span className="text-cream/80 truncate">{p.name}</span>
                        <span className="font-bold text-gold ml-auto">{p.value}%</span>
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
                  {BEST_SELLING_DISHES.map((dish) => (
                    <div
                      key={dish.id}
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
                          ⭐ {dish.rating}
                        </span>
                      </div>

                      <h4 className="mt-3 font-display text-lg font-bold text-cream">
                        {dish.name}
                      </h4>
                      <p className="text-xs text-gold font-mono font-medium">
                        {formatMoney(dish.basePrice)} / tray
                      </p>

                      <div className="mt-4 space-y-1.5 border-t border-gold/15 pt-3 text-xs">
                        <div className="flex justify-between text-cream/70">
                          <span>Trays Sold:</span>
                          <span className="font-bold text-cream">{dish.traysSoldWeek} trays</span>
                        </div>
                        <div className="flex justify-between text-cream/70">
                          <span>Week Revenue:</span>
                          <span className="font-bold text-gold">{formatMoney(dish.revenueWeek)}</span>
                        </div>
                        <div className="flex justify-between text-cream/70">
                          <span>Aloo Addon Rate:</span>
                          <span className="font-medium text-emerald-400">{dish.alooRate}</span>
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
                      {MOCK_CUSTOMERS.map((cust) => (
                        <tr key={cust.id} className="hover:bg-gold/5 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-bold border ${cust.avatarBg} ${cust.avatarText}`}
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
                            <p className="text-[0.65rem] text-cream/50">Last: {cust.lastOrderDate}</p>
                          </td>
                          <td className="px-5 py-4 font-display font-bold text-gold text-sm font-mono">
                            {formatMoney(cust.totalSpent)}
                          </td>
                          <td className="px-5 py-4 text-xs text-cream font-medium">
                            {cust.favoriteProtein}
                          </td>
                          <td className="px-5 py-4 text-xs">
                            <span className="rounded-full bg-black/50 border border-gold/20 px-2.5 py-0.5 text-[0.7rem] text-cream/80">
                              {cust.preferredFulfilment}
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
                      ))}
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
                  <h3 className="font-display text-lg text-cream font-bold">Dum Kitchen Capacity Quota</h3>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <Label htmlFor="limit-slider">Maximum Daily Trays Limit</Label>
                      <span className="font-bold text-gold font-mono">{dailyLimit} Trays</span>
                    </div>
                    <input
                      id="limit-slider"
                      type="range"
                      min={10}
                      max={50}
                      value={dailyLimit}
                      onChange={(e) => setDailyLimit(parseInt(e.target.value, 10))}
                      className="w-full accent-gold cursor-pointer"
                    />
                    <p className="text-[0.7rem] text-cream/60">
                      When this limit is reached, website ordering rolls to the next available date automatically.
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-gold/15 pt-4">
                    <Label htmlFor="cutoff-time">Next-Day Order Cutoff Time</Label>
                    <Input
                      id="cutoff-time"
                      defaultValue="2:00 PM (14:00)"
                      className="border-gold/25 bg-black/40 text-cream"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-gold/15 pt-4">
                    <div>
                      <p className="text-sm font-medium text-cream">Kitchen Open / Accepting Trays</p>
                      <p className="text-[0.7rem] text-cream/60">Turn off to temporarily pause new website orders</p>
                    </div>
                    <Switch checked={kitchenOpen} onCheckedChange={setKitchenOpen} />
                  </div>

                  <Button
                    onClick={() => toast.success("Kitchen settings saved successfully.")}
                    className="w-full bg-saffron text-saffron-foreground hover:bg-saffron/90 font-semibold"
                  >
                    Save Operational Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
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
                <span>Grand Total (Tax Included)</span>
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
