import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Truck,
  Flame,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Printer,
  ShoppingBag,
  ArrowUpDown,
  UtensilsCrossed,
  Phone,
  Mail,
  DollarSign,
  Calendar,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  FileText,
  Plus,
  Trash2,
  Sparkles,
  Volume2,
  VolumeX,
  Archive,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import { useAuth } from "@/lib/auth";
import {
  useDynamicOrders,
  useDynamicMenu,
  useKitchenSettings,
  normalizeDateKey,
  type DynamicOrder,
  type OrderStatus,
  type OrderItemDetail,
} from "@/lib/store";
import { formatMoney, BUSINESS, formatDate, nextAvailableDate } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface OrdersSearchParams {
  status?: string;
  fulfilment?: string;
  date?: string;
}

export const Route = createFileRoute("/admin/orders")({
  validateSearch: (search: Record<string, unknown>): OrdersSearchParams => {
    return {
      status: typeof search["status"] === "string" ? (search["status"] as string) : undefined,
      fulfilment:
        typeof search["fulfilment"] === "string"
          ? (search["fulfilment"] as string)
          : typeof search["type"] === "string"
            ? (search["type"] as string)
            : undefined,
      date: typeof search["date"] === "string" ? (search["date"] as string) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Order Management & Kitchen Queue — JAKloud J Paradize" },
      {
        name: "description",
        content: "Comprehensive order management table and live kitchen queue for JAKloud J Paradize.",
      },
    ],
  }),
  component: OrderManagementPage,
});

export function OrderManagementPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const searchParams = Route.useSearch();

  // Dynamic Reactive Orders & Menu Store Hooks
  const { orders, stats, createOrder, updateStatus, updateNotes, deleteOrder, purgeTestOrders, reload } = useDynamicOrders();
  const { items: menuItems } = useDynamicMenu();
  const { settings } = useKitchenSettings();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  // Today & Tomorrow keys for capacity and queue filtering
  const todayKey = useMemo(() => normalizeDateKey(new Date()), []);
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

  const activeDailyLimit = useMemo(() => {
    if (settings?.dateLimits && settings.dateLimits[todayKey]) {
      return Number(settings.dateLimits[todayKey]);
    }
    return Number(settings.dailyTrayLimit) || 10;
  }, [settings, todayKey]);

  const tomorrowLimit = useMemo(() => {
    if (settings?.dateLimits && settings.dateLimits[tomorrowKey]) {
      return Number(settings.dateLimits[tomorrowKey]);
    }
    return Number(settings.dailyTrayLimit) || 10;
  }, [settings, tomorrowKey]);

  // Search & Filters (Default to "today" so past orders are kept hidden by default)
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.status || "all");
  const [fulfilmentFilter, setFulfilmentFilter] = useState<string>(() => searchParams.fulfilment || "all");
  const [dateFilter, setDateFilter] = useState<string>(() => searchParams.date || "today");
  const [customDateInput, setCustomDateInput] = useState<string>("");
  const [selectedDishFilter, setSelectedDishFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"date" | "total" | "status">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Sync state if URL search params change
  useEffect(() => {
    if (searchParams.status) setStatusFilter(searchParams.status);
    if (searchParams.fulfilment) setFulfilmentFilter(searchParams.fulfilment);
    if (searchParams.date) setDateFilter(searchParams.date);
  }, [searchParams.status, searchParams.fulfilment, searchParams.date]);

  // Fallback to window.location.search for standard browser links
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sp = new URLSearchParams(window.location.search);
      const st = sp.get("status");
      const ful = sp.get("fulfilment") || sp.get("type");
      const dt = sp.get("date");
      if (st) setStatusFilter(st);
      if (ful) setFulfilmentFilter(ful);
      if (dt) setDateFilter(dt);
    }
  }, []);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  // Selected Order Drawer / Modal State
  const [selectedOrder, setSelectedOrder] = useState<DynamicOrder | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rejectDialogOrder, setRejectDialogOrder] = useState<DynamicOrder | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Edit Staff Notes in Drawer
  const [drawerNotes, setDrawerNotes] = useState("");
  const [drawerDriver, setDrawerDriver] = useState("");

  // Walk-in / Phone Order Creation Modal
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualPhone, setManualPhone] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [manualFulfilment, setManualFulfilment] = useState<"pickup" | "delivery">("pickup");
  const [manualDate, setManualDate] = useState(formatDate(nextAvailableDate()));
  const [manualTime, setManualTime] = useState("1:00 PM");
  const [manualAddress, setManualAddress] = useState("");
  const [manualPayment, setManualPayment] = useState<DynamicOrder["paymentMethod"]>("Cash on Pickup");
  const [manualSpecialNotes, setManualSpecialNotes] = useState("");

  // Manual Order Items List
  const [manualItems, setManualItems] = useState<
    { proteinId: string; aloo: boolean; extraSpicy: boolean; qty: number; notes: string }[]
  >([{ proteinId: "chicken", aloo: true, extraSpicy: false, qty: 1, notes: "" }]);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Keep selected order in sync
  useEffect(() => {
    if (selectedOrder) {
      const fresh = orders.find((o) => o.id === selectedOrder.id);
      if (fresh) {
        setSelectedOrder(fresh);
        setDrawerNotes(fresh.staffNotes || "");
        setDrawerDriver(fresh.assignedDriver || "");
      }
    }
  }, [orders, selectedOrder?.id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    reload();
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Live orders queue updated.");
    }, 400);
  };

  const handleCopyId = (orderNumber: string) => {
    navigator.clipboard.writeText(orderNumber);
    setCopiedId(orderNumber);
    toast.success(`Copied ${orderNumber} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    updateStatus(orderId, newStatus);
    toast.success(`Order status updated to "${newStatus.replace("_", " ").toUpperCase()}".`);
  };

  const handleSaveDrawerNotes = () => {
    if (!selectedOrder) return;
    updateNotes(selectedOrder.id, drawerNotes, drawerDriver);
    toast.success("Staff notes and dispatcher assignments saved.");
  };

  const handleConfirmReject = () => {
    if (!rejectDialogOrder) return;
    updateStatus(rejectDialogOrder.id, "cancelled");
    toast.error(`Order ${rejectDialogOrder.orderNumber} cancelled (${rejectReason || "Capacity limit"}).`);
    setRejectDialogOrder(null);
    setRejectReason("");
  };

  // Manual Order Submission
  const handleCreateManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) {
      toast.error("Please enter patron name and contact phone.");
      return;
    }

    if (manualItems.length === 0) {
      toast.error("Please add at least one Biryani tray.");
      return;
    }

    const compiledItems: OrderItemDetail[] = manualItems.map((item) => {
      const dish = menuItems.find((m) => m.proteinId === item.proteinId || m.id === item.proteinId) || menuItems[0]!;
      const unitPrice = item.aloo ? dish.priceWithAloo : dish.price;
      return {
        proteinId: item.proteinId,
        name: dish.name,
        aloo: item.aloo,
        extraSpicy: item.extraSpicy,
        notes: item.notes,
        qty: item.qty,
        unitPrice,
        lineTotal: Math.round(unitPrice * item.qty * 100) / 100,
      };
    });

    const newOrder = createOrder({
      items: compiledItems,
      fulfilmentType: manualFulfilment,
      fulfilmentDate: manualDate,
      fulfilmentTime: manualTime,
      customer: {
        name: manualName.trim(),
        phone: manualPhone.trim(),
        email: manualEmail.trim(),
        ...(manualFulfilment === "delivery" ? { address: manualAddress.trim(), city: "Springfield", zipCode: "65804" } : {}),
      },
      paymentMethod: manualPayment,
      specialInstructions: manualSpecialNotes.trim(),
    });

    toast.success(`Royal order ${newOrder.orderNumber} created for ${manualName}!`);
    setCreateOrderOpen(false);
    // Reset form
    setManualName("");
    setManualPhone("");
    setManualEmail("");
    setManualAddress("");
    setManualSpecialNotes("");
    setManualItems([{ proteinId: "chicken", aloo: true, extraSpicy: false, qty: 1, notes: "" }]);
  };

  // Filter & Search Logic
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (statusFilter !== "all" && order.status !== statusFilter) return false;
        if (fulfilmentFilter !== "all" && order.fulfilmentType !== fulfilmentFilter) return false;
        
        // Dish Filter
        if (selectedDishFilter !== "all") {
          const dishTarget = selectedDishFilter.toLowerCase();
          const matchDish = order.items.some((i) => {
            const iName = i.name.toLowerCase();
            const iProt = (i.proteinId || "").toLowerCase();
            return iName.includes(dishTarget) || iProt.includes(dishTarget);
          });
          if (!matchDish) return false;
        }

        // Date Filter (Strictly matches fulfilmentDate first, fallback createdAt)
        const orderDateKey = normalizeDateKey(order.fulfilmentDate) || normalizeDateKey(order.createdAt);

        if (dateFilter === "today") {
          if (orderDateKey !== todayKey) return false;
        } else if (dateFilter === "tomorrow") {
          if (orderDateKey !== tomorrowKey) return false;
        } else if (dateFilter === "upcoming") {
          if (orderDateKey <= todayKey) return false;
        } else if (dateFilter === "past") {
          const isPast = orderDateKey < todayKey || order.status === "completed" || order.status === "cancelled";
          if (!isPast) return false;
        } else if (dateFilter === "yesterday") {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (orderDateKey !== normalizeDateKey(yesterday)) return false;
        } else if (dateFilter === "last7") {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          const orderTime = new Date(order.createdAt).getTime();
          if (orderTime < sevenDaysAgo.getTime()) return false;
        } else if (dateFilter === "custom" && customDateInput) {
          if (orderDateKey !== customDateInput) return false;
        } else if (dateFilter !== "all" && dateFilter !== "custom") {
          if (orderDateKey !== dateFilter) return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchNumber = order.orderNumber.toLowerCase().includes(q);
          const matchName = order.customer.name.toLowerCase().includes(q);
          const matchPhone = order.customer.phone.toLowerCase().includes(q);
          const matchEmail = order.customer.email.toLowerCase().includes(q);
          const matchDishes = order.items.some((i) => i.name.toLowerCase().includes(q));
          if (!matchNumber && !matchName && !matchPhone && !matchEmail && !matchDishes) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "total") {
          return sortOrder === "asc" ? a.total - b.total : b.total - a.total;
        }
        if (sortBy === "status") {
          return sortOrder === "asc" ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
        }
        // Default: date created
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      });
  }, [orders, statusFilter, fulfilmentFilter, dateFilter, customDateInput, selectedDishFilter, searchQuery, sortBy, sortOrder]);

  // Item-wise Handi / Dish Prep Breakdown
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

  // Counts for status tabs
  const counts = useMemo(() => {
    return {
      all: orders.length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      preparing: orders.filter((o) => o.status === "preparing" || o.status === "dum_cooking").length,
      ready: orders.filter((o) => o.status === "ready").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredOrders.slice(start, start + rowsPerPage);
  }, [filteredOrders, currentPage, rowsPerPage]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-950/80 border-blue-500/50 text-blue-300";
      case "preparing":
      case "dum_cooking":
        return "bg-saffron/20 border-saffron/50 text-saffron animate-pulse";
      case "ready":
        return "bg-gold/20 border-gold text-gold font-bold";
      case "completed":
        return "bg-emerald-950/80 border-emerald-500/50 text-emerald-300";
      case "cancelled":
        return "bg-red-950/80 border-red-500/50 text-red-300 line-through";
      default:
        return "bg-zinc-900 border-zinc-700 text-zinc-300";
    }
  };

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
              alt="JAKloud"
              className="h-10 w-10 rounded-full border border-gold/50 bg-cream p-0.5 object-cover"
            />
            <div>
              <span className="font-display text-lg font-bold tracking-wider text-cream">
                JAKloud
              </span>
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gold">
                Live Kitchen Dispatch Queue
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setCreateOrderOpen(true)}
            size="sm"
            className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-semibold text-xs shadow-md hover:scale-105 transition-all gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Create Walk-in / Phone Order</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              if (confirm("Purge all test/mock orders and reset the kitchen queue?")) {
                await purgeTestOrders();
                toast.success("Test orders purged from database and local store.");
              }
            }}
            className="border-rose-500/30 text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 text-xs gap-1.5"
            title="Purge legacy test orders"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Purge Test Orders</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-gold/30 bg-black/40 text-xs text-cream hover:bg-gold/10 hover:text-gold gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin text-gold" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-cream/70 hover:text-gold gap-1 hidden md:flex"
          >
            <Link to="/" target="_blank">
              <ExternalLink className="h-3.5 w-3.5 text-gold" /> Public Site
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 space-y-6">
        {/* Page Title & Quick Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              <UtensilsCrossed className="h-3.5 w-3.5 text-gold" />
              <span>Kitchen Dispatch Queue</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-cream">
              Order Reception & Kitchen Dispatch
            </h1>
            <p className="mt-1 text-xs text-cream/70">
              Live orders received from web checkout, phone reservations, and counter walk-ins.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-gold/25 bg-black/40 px-3.5 py-2 text-xs">
              <span className="text-gold font-semibold">Total Revenue:</span>
              <span className="font-display font-bold text-cream">
                {formatMoney(stats.totalRevenue)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-gold/25 bg-black/40 px-3.5 py-2 text-xs">
              <span className="text-saffron font-semibold">Active Dum Trays:</span>
              <span className="font-mono font-bold text-cream">
                {stats.activeOrders}
              </span>
            </div>
            <div className="flex items-center gap-1.5 rounded-xl border border-gold/25 bg-black/40 px-3.5 py-2 text-xs">
              <span className="text-emerald-400 font-semibold">Ready for Dispatch:</span>
              <span className="font-mono font-bold text-cream">
                {stats.readyOrders}
              </span>
            </div>
          </div>
        </div>

        {/* 1. TIMELINE & CAPACITY SELECTOR BAR */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1A. TODAY */}
          <div
            onClick={() => {
              setDateFilter("today");
              setCustomDateInput("");
            }}
            className={`relative overflow-hidden rounded-2xl border p-4 transition-all cursor-pointer group ${
              dateFilter === "today"
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
                dateFilter === "today" ? "bg-gold text-black" : "bg-gold/15 text-gold border border-gold/30"
              }`}>
                Live Today
              </span>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="font-display text-2xl font-bold text-cream">
                {timelineStats.todayTrays}{" "}
                <span className="text-xs font-sans text-cream/60">/ {activeDailyLimit} Trays</span>
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

          {/* 1B. TOMORROW */}
          <div
            onClick={() => {
              setDateFilter("tomorrow");
              setCustomDateInput("");
            }}
            className={`relative overflow-hidden rounded-2xl border p-4 transition-all cursor-pointer group ${
              dateFilter === "tomorrow"
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
                dateFilter === "tomorrow" ? "bg-saffron text-black" : "bg-saffron/15 text-saffron border border-saffron/30"
              }`}>
                Advance
              </span>
            </div>

            <div className="mt-2.5 flex items-baseline justify-between">
              <div className="font-display text-2xl font-bold text-cream">
                {timelineStats.tomorrowTrays}{" "}
                <span className="text-xs font-sans text-cream/60">/ {tomorrowLimit} Trays</span>
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
              setDateFilter("upcoming");
              setCustomDateInput("");
            }}
            className={`relative overflow-hidden rounded-2xl border p-4 transition-all cursor-pointer group ${
              dateFilter === "upcoming"
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
                dateFilter === "upcoming" ? "bg-sky-500 text-black" : "bg-sky-500/15 text-sky-300 border border-sky-500/30"
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

          {/* 1D. PAST ARCHIVE */}
          <div
            onClick={() => {
              setDateFilter("past");
              setCustomDateInput("");
            }}
            className={`relative overflow-hidden rounded-2xl border p-4 transition-all cursor-pointer group ${
              dateFilter === "past"
                ? "border-zinc-400 bg-gradient-to-br from-zinc-700/30 via-[#181008] to-black/90 shadow-lg shadow-zinc-500/20 ring-1 ring-zinc-400"
                : "border-gold/20 bg-[#120c08]/85 hover:border-zinc-500/50 hover:bg-zinc-800/20"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Archive className="h-3.5 w-3.5 text-zinc-400" />
                Past Orders Archive
              </span>
              <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-bold ${
                dateFilter === "past" ? "bg-zinc-300 text-black" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
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
              <span>Archived records</span>
              <span className="text-zinc-300 font-medium">View Archive →</span>
            </p>
          </div>
        </div>

        {/* 2. MASTER KITCHEN PREPARATION BOARD */}
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
                Live ingredient and protein breakdown calculated from database orders
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

        {/* PAST ARCHIVE ALERT */}
        {dateFilter === "past" && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200">
            <div className="flex items-center gap-2">
              <Archive className="h-4 w-4 text-amber-300 shrink-0" />
              <span>
                <strong>Past Orders Archive Mode:</strong> Historical orders are archived and hidden from live kitchen queue by default.
              </span>
            </div>
            <button
              onClick={() => {
                setDateFilter("today");
                setCustomDateInput("");
              }}
              className="shrink-0 rounded-xl bg-amber-400 text-black font-bold px-3 py-1 text-xs hover:bg-amber-300 cursor-pointer"
            >
              ← Back to Today's Live Queue
            </button>
          </div>
        )}

        {/* Status Filter Tabs (Top Bar) */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-gold/15 pb-3">
          {[
            { id: "all", label: "All Orders", count: counts.all },
            { id: "confirmed", label: "Confirmed", count: counts.confirmed },
            { id: "preparing", label: "In Dum Prep", count: counts.preparing },
            { id: "ready", label: "Ready for Pickup", count: counts.ready },
            { id: "completed", label: "Completed", count: counts.completed },
            { id: "cancelled", label: "Cancelled / Rejected", count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setStatusFilter(tab.id);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all shrink-0 ${
                statusFilter === tab.id
                  ? "bg-gradient-to-r from-chili via-saffron to-gold text-white shadow-md shadow-chili/20"
                  : "border border-gold/20 bg-[#120c08] text-cream/70 hover:border-gold/50 hover:text-cream"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[0.65rem] ${
                  statusFilter === tab.id ? "bg-black/30 text-white" : "bg-gold/15 text-gold"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="grid gap-3 rounded-2xl border border-gold/20 bg-[#120c08]/90 p-4 shadow-lg backdrop-blur-xl sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Search Bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
            <Input
              placeholder="Search Order ID, patron, phone, dish..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 rounded-xl border-gold/25 bg-black/40 pl-10 pr-4 text-xs text-cream placeholder:text-cream/40 focus-visible:border-gold"
            />
          </div>

          {/* 2. Fulfilment Filter */}
          <div>
            <select
              value={fulfilmentFilter}
              onChange={(e) => {
                setFulfilmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="all">All Fulfilment Types</option>
              <option value="pickup">Pickup Only (Bedford Ave)</option>
              <option value="delivery">Delivery Only (Springfield Zone)</option>
            </select>
          </div>

          {/* 3. Date Filter */}
          <div className="flex items-center gap-1.5">
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 w-full rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="today">Scheduled for Today</option>
              <option value="tomorrow">Scheduled for Tomorrow</option>
              <option value="upcoming">Upcoming (Next 7 Days)</option>
              <option value="past">Past Orders Archive</option>
              <option value="all">All Dates & History</option>
              <option value="yesterday">Yesterday's Orders</option>
              <option value="last7">Past 7 Days</option>
              <option value="custom">Pick Specific Date...</option>
              {dateFilter && !["all", "today", "tomorrow", "yesterday", "last7", "custom"].includes(dateFilter) && (
                <option value={dateFilter}>Filtered Date: {dateFilter}</option>
              )}
            </select>
            {dateFilter === "custom" && (
              <input
                type="date"
                value={customDateInput}
                onChange={(e) => {
                  setCustomDateInput(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 rounded-xl border border-gold bg-gold/15 px-2 text-xs text-gold font-mono focus:outline-none cursor-pointer"
              />
            )}
          </div>

          {/* 4. Sort By */}
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="h-10 w-full rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="date">Sort by Date Placed</option>
              <option value="total">Sort by Total Amount</option>
              <option value="status">Sort by Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/25 bg-black/40 text-gold hover:bg-gold/15 transition-colors shrink-0"
              title="Toggle Sort Direction"
            >
              <ArrowUpDown className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* MAIN ORDER MANAGEMENT TABLE                                   */}
        {/* ------------------------------------------------------------- */}
        <div className="overflow-hidden rounded-3xl border border-gold/25 bg-[#120c08]/90 shadow-2xl backdrop-blur-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gold/20 bg-black/50 text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                <tr>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-4 py-4">Order ID</th>
                  <th className="px-4 py-4">Biryani & Tray Qty</th>
                  <th className="px-4 py-4">Fulfilment & Date</th>
                  <th className="px-4 py-4">Payment</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4">Amount</th>
                  <th className="px-5 py-4 text-right">Kitchen Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-16 text-center text-cream/60 space-y-3">
                      <ShoppingBag className="mx-auto h-10 w-10 text-gold/40" />
                      <p className="font-display text-base text-cream">No matching orders found</p>
                      <p className="text-xs text-cream/50">
                        Try adjusting your search keywords or status filter, or click "Create Walk-in / Phone Order" to add one.
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const initials = order.customer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "CU";

                    return (
                      <tr key={order.id} className="hover:bg-gold/5 transition-colors">
                        {/* Customer Avatar + Name + Phone */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/40 bg-gold/10 text-xs font-bold text-gold shadow-md shrink-0">
                              {initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-cream text-xs truncate max-w-[10rem]">
                                {order.customer.name}
                              </p>
                              <p className="text-[0.7rem] text-gold/90 font-mono mt-0.5">
                                {order.customer.phone}
                              </p>
                              <p className="text-[0.65rem] text-cream/50 truncate max-w-[10rem]">
                                {order.customer.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Order ID + Copy Shortcut */}
                        <td className="px-4 py-4 font-mono text-xs">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="font-bold text-gold hover:underline text-left"
                              title="Open full order details"
                            >
                              {order.orderNumber}
                            </button>
                            <button
                              onClick={() => handleCopyId(order.orderNumber)}
                              className="text-cream/40 hover:text-gold transition-colors p-0.5"
                              title="Copy Order Reference"
                            >
                              {copiedId === order.orderNumber ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          <p className="text-[0.65rem] text-cream/50 mt-0.5">
                            {new Date(order.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>

                        {/* Biryani Type, Protein & Tray Quantity */}
                        <td className="px-4 py-4 text-xs">
                          <div className="space-y-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <span className="rounded bg-gold/20 border border-gold/30 px-1.5 py-0.2 font-mono font-bold text-gold text-[0.7rem]">
                                  {item.qty}× Tray
                                </span>
                                <div>
                                  <span className="font-medium text-cream">{item.name}</span>
                                  <div className="flex flex-wrap items-center gap-1 text-[0.65rem] text-cream/60 mt-0.5">
                                    {item.aloo && (
                                      <span className="text-saffron font-semibold">+Aloo</span>
                                    )}
                                    {item.extraSpicy && (
                                      <span className="text-chili font-semibold">Extra Spicy</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Fulfilment & Date */}
                        <td className="px-4 py-4 text-xs">
                          <div className="flex items-center gap-1.5 font-medium capitalize text-cream">
                            {order.fulfilmentType === "pickup" ? (
                              <span className="inline-flex items-center gap-1 text-gold">
                                <MapPin className="h-3.5 w-3.5" /> Pickup
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-saffron">
                                <Truck className="h-3.5 w-3.5" /> Delivery
                              </span>
                            )}
                          </div>
                          <p className="text-cream/80 text-[0.75rem] mt-0.5 font-medium">
                            {order.fulfilmentDate} @ {order.fulfilmentTime}
                          </p>
                          {order.customer.address && (
                            <p className="text-[0.65rem] text-cream/50 truncate max-w-[11rem] mt-0.5">
                              {order.customer.address}
                            </p>
                          )}
                        </td>

                        {/* Payment Status */}
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center rounded-full border border-gold/30 bg-gold/10 px-2.5 py-0.5 text-[0.65rem] font-semibold text-gold">
                            {order.paymentStatus || "Paid Online"}
                          </span>
                          <p className="text-[0.65rem] text-cream/50 mt-1">{order.paymentMethod || "Instant UPI QR"}</p>
                        </td>

                        {/* Order Status Badge */}
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-semibold capitalize ${getStatusBadge(
                              order.status,
                            )}`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </td>

                        {/* Total Amount */}
                        <td className="px-4 py-4 font-mono font-bold text-cream text-xs">
                          {formatMoney(order.total)}
                        </td>

                        {/* 1-Click Status Transitions & Drawer Trigger */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {order.status === "confirmed" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order.id, "preparing")}
                                className="h-8 bg-saffron text-saffron-foreground hover:bg-saffron/90 text-xs px-2.5 gap-1"
                                title="Advance to Dum Prep"
                              >
                                <Flame className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">Start Prep</span>
                              </Button>
                            )}

                            {order.status === "preparing" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order.id, "ready")}
                                className="h-8 bg-gold text-black hover:bg-gold/90 text-xs font-bold px-2.5 gap-1"
                                title="Mark Ready for Pickup/Dispatch"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">Mark Ready</span>
                              </Button>
                            )}

                            {order.status === "ready" && (
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(order.id, "completed")}
                                className="h-8 bg-emerald-600 text-white hover:bg-emerald-700 text-xs px-2.5 gap-1"
                                title="Complete Fulfilment"
                              >
                                <Check className="h-3.5 w-3.5" />
                                <span className="hidden xl:inline">Complete</span>
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedOrder(order)}
                              className="h-8 border-gold/30 bg-black/40 text-cream/80 hover:bg-gold/15 hover:text-gold text-xs px-2"
                              title="View Order Prep Slip"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gold/15 bg-black/40 px-6 py-4 text-xs text-cream/70">
            <div>
              Showing{" "}
              <span className="font-semibold text-gold">
                {filteredOrders.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gold">
                {Math.min(currentPage * rowsPerPage, filteredOrders.length)}
              </span>{" "}
              of <span className="font-semibold text-cream">{filteredOrders.length}</span> live orders
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 border-gold/25 bg-black/40 text-xs text-cream hover:bg-gold/10 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
              <span className="font-mono text-xs text-gold px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="h-8 border-gold/25 bg-black/40 text-xs text-cream hover:bg-gold/10 disabled:opacity-40"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 2. ORDER DETAILS & PREP SLIP DRAWER (MODAL)                   */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-gold/30 bg-[#120c08] text-cream sm:max-w-2xl">
          {selectedOrder && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between border-b border-gold/20 pb-3">
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-gold">
                      Master Chef Prep Slip
                    </span>
                    <DialogTitle className="font-display text-2xl font-bold text-cream">
                      {selectedOrder.orderNumber}
                    </DialogTitle>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-bold capitalize ${getStatusBadge(
                      selectedOrder.status,
                    )}`}
                  >
                    {selectedOrder.status.replace("_", " ")}
                  </span>
                </div>
              </DialogHeader>

              {/* Customer & Schedule Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl border border-gold/20 bg-black/40 p-4 text-xs">
                <div className="space-y-1.5">
                  <p className="font-semibold text-gold uppercase tracking-wider text-[0.7rem]">
                    Patron Details
                  </p>
                  <p className="font-medium text-cream text-sm">{selectedOrder.customer.name}</p>
                  <p className="text-gold font-mono">{selectedOrder.customer.phone}</p>
                  <p className="text-cream/60">{selectedOrder.customer.email}</p>
                </div>

                <div className="space-y-1.5">
                  <p className="font-semibold text-gold uppercase tracking-wider text-[0.7rem]">
                    Fulfilment Schedule
                  </p>
                  <p className="capitalize font-medium text-cream">
                    {selectedOrder.fulfilmentType === "pickup" ? "🏬 Counter Pickup" : "🚚 Direct Delivery"}
                  </p>
                  <p className="text-cream/80">{selectedOrder.fulfilmentDate} @ {selectedOrder.fulfilmentTime}</p>
                  {selectedOrder.customer.address && (
                    <p className="text-cream/60">{selectedOrder.customer.address}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <p className="font-semibold text-gold uppercase tracking-wider text-xs">
                  Dum Handi Trays Ordered ({selectedOrder.items.reduce((s, i) => s + i.qty, 0)})
                </p>
                <div className="divide-y divide-gold/10 rounded-2xl border border-gold/20 bg-black/40 p-2">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-gold text-sm">
                            {it.qty}×
                          </span>
                          <span className="font-semibold text-cream text-sm">{it.name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[0.75rem] text-cream/70 mt-1">
                          <span className={it.aloo ? "text-saffron font-medium" : ""}>
                            {it.aloo ? "With Baby Potatoes (+Aloo)" : "Standard Rice-Meat"}
                          </span>
                          <span>·</span>
                          <span className={it.extraSpicy ? "text-chili font-semibold" : ""}>
                            {it.extraSpicy ? "Extra Spicy Masala" : "Regular Spice"}
                          </span>
                        </div>
                        {it.notes && (
                          <p className="text-[0.7rem] italic text-gold/90 mt-1">
                            Notes: “{it.notes}”
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-cream font-mono text-sm">
                        {formatMoney(it.lineTotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Staff Notes & Driver Assignment */}
              <div className="rounded-2xl border border-gold/20 bg-black/40 p-4 space-y-3 text-xs">
                <p className="font-semibold text-gold uppercase tracking-wider text-[0.7rem]">
                  Kitchen Staff Notes & Dispatcher
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="staff-notes" className="text-[0.7rem] text-cream/70">
                      Internal Staff / Kitchen Notes:
                    </Label>
                    <Input
                      id="staff-notes"
                      value={drawerNotes}
                      onChange={(e) => setDrawerNotes(e.target.value)}
                      placeholder="e.g. VIP guest, extra salan added"
                      className="mt-1 h-9 rounded-xl border-gold/20 bg-black/50 text-xs text-cream"
                    />
                  </div>
                  <div>
                    <Label htmlFor="assigned-driver" className="text-[0.7rem] text-cream/70">
                      Assigned Van / Driver:
                    </Label>
                    <Input
                      id="assigned-driver"
                      value={drawerDriver}
                      onChange={(e) => setDrawerDriver(e.target.value)}
                      placeholder="e.g. Chef Dispatch Van #1"
                      className="mt-1 h-9 rounded-xl border-gold/20 bg-black/50 text-xs text-cream"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={handleSaveDrawerNotes}
                  className="h-8 bg-gold/20 text-gold border border-gold/40 hover:bg-gold/30 text-xs"
                >
                  Save Internal Notes
                </Button>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-2xl border border-gold/20 bg-black/40 p-4 space-y-2 text-xs">
                <div className="flex justify-between text-cream/70">
                  <span>Subtotal</span>
                  <span>{formatMoney(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between text-cream/70">
                    <span>Tax</span>
                    <span>{formatMoney(selectedOrder.tax)}</span>
                  </div>
                )}
                <div className="flex justify-between text-cream/70">
                  <span>Fulfilment ({selectedOrder.fulfilmentType})</span>
                  <span>{selectedOrder.deliveryFee > 0 ? formatMoney(selectedOrder.deliveryFee) : "Free"}</span>
                </div>
                <div className="flex justify-between border-t border-gold/15 pt-2 text-base font-bold text-cream">
                  <span className="font-display">Total Amount</span>
                  <span className="text-gold font-display">{formatMoney(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.success("Printing Kitchen Prep Ticket...");
                    window.print();
                  }}
                  className="border-gold/30 text-gold hover:bg-gold/10 text-xs gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Prep Ticket
                </Button>

                <div className="flex items-center gap-2">
                  {selectedOrder.status === "confirmed" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedOrder.id, "preparing")}
                      className="bg-saffron text-saffron-foreground hover:bg-saffron/90 text-xs font-semibold gap-1"
                    >
                      <Flame className="h-3.5 w-3.5" /> Start Dum Cooking
                    </Button>
                  )}
                  {selectedOrder.status === "preparing" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedOrder.id, "ready")}
                      className="bg-gold text-black hover:bg-gold/90 text-xs font-bold"
                    >
                      Mark Ready for Dispatch
                    </Button>
                  )}
                  {selectedOrder.status === "ready" && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(selectedOrder.id, "completed")}
                      className="bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold"
                    >
                      Complete Fulfilment
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setRejectDialogOrder(selectedOrder);
                      setSelectedOrder(null);
                    }}
                    className="border-red-500/40 text-red-400 hover:bg-red-950/40 text-xs"
                  >
                    Cancel / Reject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (window.confirm(`Permanently delete order ${selectedOrder.orderNumber}?`)) {
                        deleteOrder(selectedOrder.id);
                        toast.success(`Order ${selectedOrder.orderNumber} deleted.`);
                        setSelectedOrder(null);
                      }
                    }}
                    className="border-red-600/60 text-red-400 hover:bg-red-950/60 text-xs gap-1"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 3. CREATE WALK-IN / PHONE ORDER MODAL                         */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={createOrderOpen} onOpenChange={setCreateOrderOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-gold/30 bg-[#120c08] text-cream sm:max-w-2xl">
          <form onSubmit={handleCreateManualOrder} className="space-y-6">
            <DialogHeader>
              <div className="flex items-center gap-2 text-gold">
                <Plus className="h-5 w-5" />
                <DialogTitle className="font-display text-2xl font-bold text-cream">
                  Create Walk-in / Phone Order
                </DialogTitle>
              </div>
              <DialogDescription className="text-xs text-cream/70">
                Book a handcrafted Dum Biryani Handi tray directly into the live kitchen queue.
              </DialogDescription>
            </DialogHeader>

            {/* Customer Details */}
            <div className="grid sm:grid-cols-3 gap-3 rounded-2xl border border-gold/20 bg-black/40 p-4">
              <div>
                <Label className="text-[0.7rem] text-gold uppercase">Patron Name *</Label>
                <Input
                  required
                  placeholder="e.g. Patron Name"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="mt-1 h-9 rounded-xl border-gold/20 bg-black/50 text-xs text-cream"
                />
              </div>
              <div>
                <Label className="text-[0.7rem] text-gold uppercase">Phone Number *</Label>
                <Input
                  required
                  placeholder="e.g. 417-897-9754"
                  value={manualPhone}
                  onChange={(e) => setManualPhone(e.target.value)}
                  className="mt-1 h-9 rounded-xl border-gold/20 bg-black/50 text-xs text-cream"
                />
              </div>
              <div>
                <Label className="text-[0.7rem] text-gold uppercase">Email (Optional)</Label>
                <Input
                  placeholder="patron@example.com"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  className="mt-1 h-9 rounded-xl border-gold/20 bg-black/50 text-xs text-cream"
                />
              </div>
            </div>

            {/* Fulfilment & Schedule */}
            <div className="grid sm:grid-cols-3 gap-3 rounded-2xl border border-gold/20 bg-black/40 p-4">
              <div>
                <Label className="text-[0.7rem] text-gold uppercase">Fulfilment Type</Label>
                <select
                  value={manualFulfilment}
                  onChange={(e) => setManualFulfilment(e.target.value as any)}
                  className="mt-1 h-9 w-full rounded-xl border border-gold/20 bg-black/50 px-3 text-xs text-cream focus:outline-none focus:border-gold"
                >
                  <option value="pickup">Store Pickup (Bedford Ave)</option>
                  <option value="delivery">Springfield Direct Delivery</option>
                </select>
              </div>
              <div>
                <Label className="text-[0.7rem] text-gold uppercase">Fulfilment Date</Label>
                <Input
                  value={manualDate}
                  onChange={(e) => setManualDate(e.target.value)}
                  className="mt-1 h-9 rounded-xl border-gold/20 bg-black/50 text-xs text-cream"
                />
              </div>
              <div>
                <Label className="text-[0.7rem] text-gold uppercase">Time Slot</Label>
                <select
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-gold/20 bg-black/50 px-3 text-xs text-cream focus:outline-none focus:border-gold"
                >
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="1:00 PM">1:00 PM</option>
                  <option value="2:00 PM">2:00 PM</option>
                  <option value="3:00 PM">3:00 PM</option>
                  <option value="4:00 PM">4:00 PM</option>
                  <option value="5:00 PM">5:00 PM</option>
                  <option value="6:00 PM">6:00 PM</option>
                </select>
              </div>
            </div>

            {manualFulfilment === "delivery" && (
              <div className="rounded-2xl border border-gold/20 bg-black/40 p-4">
                <Label className="text-[0.7rem] text-gold uppercase">Delivery Street Address in Springfield</Label>
                <Input
                  required
                  placeholder="e.g. 1420 E Sunshine St., Suite 100"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="mt-1 h-9 rounded-xl border-gold/20 bg-black/50 text-xs text-cream"
                />
              </div>
            )}

            {/* Ordered Biryani Trays Selection */}
            <div className="space-y-3 rounded-2xl border border-gold/20 bg-black/40 p-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-gold uppercase">Ordered Biryani Trays</Label>
                <button
                  type="button"
                  onClick={() =>
                    setManualItems((prev) => [
                      ...prev,
                      { proteinId: "mutton", aloo: true, extraSpicy: false, qty: 1, notes: "" },
                    ])
                  }
                  className="text-xs text-gold hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Another Tray
                </button>
              </div>

              {manualItems.map((item, idx) => (
                <div key={idx} className="flex flex-wrap items-center gap-3 border-b border-gold/10 pb-3">
                  <div className="flex-1 min-w-[140px]">
                    <select
                      value={item.proteinId}
                      onChange={(e) => {
                        const nextProt = e.target.value;
                        setManualItems((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, proteinId: nextProt } : it)),
                        );
                      }}
                      className="h-9 w-full rounded-xl border border-gold/20 bg-black/60 px-3 text-xs text-cream focus:outline-none focus:border-gold"
                    >
                      {menuItems.map((m) => (
                        <option key={m.id} value={m.proteinId || m.id}>
                          {m.name} (${m.price.toFixed(2)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setManualItems((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, qty: Math.max(1, it.qty - 1) } : it)),
                        )
                      }
                      className="h-8 w-8 rounded-lg border border-gold/30 bg-black/50 text-gold"
                    >
                      -
                    </button>
                    <span className="font-mono text-xs text-cream px-2">{item.qty}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setManualItems((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, qty: it.qty + 1 } : it)),
                        )
                      }
                      className="h-8 w-8 rounded-lg border border-gold/30 bg-black/50 text-gold"
                    >
                      +
                    </button>
                  </div>

                  <label className="flex items-center gap-1.5 text-xs text-cream/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.aloo}
                      onChange={(e) =>
                        setManualItems((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, aloo: e.target.checked } : it)),
                        )
                      }
                      className="rounded border-gold/30 bg-black/60 text-gold focus:ring-gold"
                    />
                    <span>+Aloo ($7)</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-xs text-chili cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.extraSpicy}
                      onChange={(e) =>
                        setManualItems((prev) =>
                          prev.map((it, i) => (i === idx ? { ...it, extraSpicy: e.target.checked } : it)),
                        )
                      }
                      className="rounded border-chili/40 bg-black/60 text-chili focus:ring-chili"
                    />
                    <span>Extra Spicy</span>
                  </label>

                  {manualItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setManualItems((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Payment Method & Special Notes */}
            <div className="grid sm:grid-cols-2 gap-3 rounded-2xl border border-gold/20 bg-black/40 p-4">
              <div>
                <Label className="text-[0.7rem] text-gold uppercase">Payment Method</Label>
                <select
                  value={manualPayment}
                  onChange={(e) => setManualPayment(e.target.value as any)}
                  className="mt-1 h-9 w-full rounded-xl border border-gold/20 bg-black/50 px-3 text-xs text-cream focus:outline-none focus:border-gold"
                >
                  <option value="Cash on Pickup">Cash on Pickup</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Instant UPI QR">Instant UPI QR</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Staff Direct">Staff Direct Comp</option>
                </select>
              </div>

              <div>
                <Label className="text-[0.7rem] text-gold uppercase">Special Cooking Instructions</Label>
                <Input
                  placeholder="e.g. Extra salan gravy, pack hot"
                  value={manualSpecialNotes}
                  onChange={(e) => setManualSpecialNotes(e.target.value)}
                  className="mt-1 h-9 rounded-xl border-gold/20 bg-black/50 text-xs text-cream"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOrderOpen(false)}
                className="border-gold/30 text-cream/70 hover:bg-gold/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-semibold text-xs shadow-md"
              >
                Book Dum Biryani Order
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 4. REJECT ORDER CONFIRMATION DIALOG                           */}
      {/* ------------------------------------------------------------- */}
      <Dialog
        open={!!rejectDialogOrder}
        onOpenChange={(open) => !open && setRejectDialogOrder(null)}
      >
        <DialogContent className="border-chili/40 bg-[#140e09] text-cream sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-chili/10 text-chili mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center font-display text-xl text-cream">
              Cancel Order #{rejectDialogOrder?.orderNumber}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-cream/70 pt-1">
              Are you sure you want to cancel this booking for {rejectDialogOrder?.customer.name}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-2">
            <div>
              <Label htmlFor="reject-reason" className="text-xs text-cream/80">
                Reason for Cancellation:
              </Label>
              <select
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gold/25 bg-black/40 p-2.5 text-xs text-cream focus:outline-none focus:border-gold"
              >
                <option value="Daily Dum capacity limit reached">Daily Dum capacity limit reached (25 trays max)</option>
                <option value="Customer schedule modification request">Customer schedule modification request</option>
                <option value="Delivery address outside 10-mile radius">Address outside Springfield 10-mile radius</option>
                <option value="Special protein portion unavailable">Specific protein portion unavailable</option>
                <option value="Other">Other operational reason</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectDialogOrder(null)}
                className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
              >
                Keep Order
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmReject}
                className="bg-chili text-white hover:bg-chili/90 text-xs font-semibold"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
