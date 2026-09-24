import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Users,
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Award,
  Flame,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  FileSpreadsheet,
  Calendar,
  Heart,
  Truck,
  Store,
  CheckCircle2,
  AlertCircle,
  X,
  Edit,
  Save,
  Trash2,
  Sliders,
  UtensilsCrossed,
  Shield,
  Send,
  MoreVertical,
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";

import { useAuth } from "@/lib/auth";
import {
  MOCK_CUSTOMERS,
  type CustomerRecord,
  type CustomerOrderHistoryItem,
} from "@/lib/admin-data";
import { useDynamicOrders } from "@/lib/store";
import { formatMoney, BUSINESS } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/customers")({
  head: () => ({
    meta: [
      { title: "Patron & Customer Management — JAKLOUD Spice King" },
      {
        name: "description",
        content: "Manage VIP patrons, customer loyalty profiles, lifetime spending, and order history timelines.",
      },
    ],
  }),
  component: CustomerManagementPage,
});

const STORAGE_KEY = "jakloud_admin_customers_v2";

function CustomerManagementPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { orders } = useDynamicOrders();

  // State with LocalStorage persistence
  const [customers, setCustomers] = useState<CustomerRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch {
        /* fallback */
      }
    }
    return MOCK_CUSTOMERS;
  });

  // Persist customers whenever state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    }
  }, [customers]);

  // Dynamically sync orders with customer profiles
  useEffect(() => {
    if (!orders || orders.length === 0) return;

    setCustomers((prev) => {
      let updated = [...prev];
      let changed = false;

      orders.forEach((ord) => {
        const phone = ord.customer.phone.trim();
        const email = ord.customer.email.toLowerCase().trim();
        const existingIdx = updated.findIndex(
          (c) => (phone && c.phone === phone) || (email && c.email.toLowerCase() === email)
        );

        if (existingIdx >= 0) {
          const c = updated[existingIdx];
          const hasOrder = c.orderHistory?.some((h) => h.orderNumber === ord.orderNumber);
          if (!hasOrder) {
            changed = true;
            const newHistoryItem: CustomerOrderHistoryItem = {
              id: ord.id,
              orderNumber: ord.orderNumber,
              date: ord.fulfilmentDate === "Today" ? "Today" : "Recent",
              itemsSummary: ord.items.map((i) => `${i.qty}x ${i.name}`).join(", "),
              trayCount: ord.items.reduce((sum, i) => sum + i.qty, 0),
              total: ord.total,
              fulfilmentType: ord.fulfilmentType,
              status: ord.status,
              paymentStatus: ord.paymentStatus,
            };

            const newTotalSpend = Math.round((c.totalSpent + ord.total) * 100) / 100;
            const newTotalOrders = c.totalOrders + 1;
            let status = c.status;
            if (newTotalSpend >= 1000 || newTotalOrders >= 6) status = "VIP Royal";
            else if (newTotalSpend >= 400 || newTotalOrders >= 3) status = "Occasion Host";

            updated[existingIdx] = {
              ...c,
              totalSpent: newTotalSpend,
              totalOrders: newTotalOrders,
              status,
              lastOrderDate: "Just now",
              orderHistory: [newHistoryItem, ...(c.orderHistory || [])],
            };
          }
        }
      });

      return changed ? updated : prev;
    });
  }, [orders]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [fulfilmentFilter, setFulfilmentFilter] = useState<string>("all");
  const [proteinFilter, setProteinFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"spend" | "orders" | "recent" | "name">("spend");

  // Selected customer for Profile Drawer
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Add Customer Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newFavorite, setNewFavorite] = useState("Chicken Dum Biryani");
  const [newFulfilment, setNewFulfilment] = useState<"Pickup" | "Delivery">("Pickup");
  const [newStatus, setNewStatus] = useState<CustomerRecord["status"]>("Active Patron");
  const [newSpice, setNewSpice] = useState<CustomerRecord["spicePreference"]>("Medium Nizami");
  const [newNotes, setNewNotes] = useState("");

  // Edit Admin Notes state in drawer
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Handle open drawer
  const handleOpenCustomer = (customer: CustomerRecord) => {
    setSelectedCustomer(customer);
    setTempNotes(customer.adminNotes || "");
    setEditingNotes(false);
    setDrawerOpen(true);
  };

  // Save admin notes
  const handleSaveNotes = () => {
    if (!selectedCustomer) return;
    setCustomers((prev) =>
      prev.map((c) => (c.id === selectedCustomer.id ? { ...c, adminNotes: tempNotes } : c)),
    );
    setSelectedCustomer((prev) => (prev ? { ...prev, adminNotes: tempNotes } : null));
    setEditingNotes(false);
    toast.success("Admin culinary notes updated.");
  };

  // Add customer submit
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) {
      toast.error("Name and Phone Number are required.");
      return;
    }

    const initials = newName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

    const newCust: CustomerRecord = {
      id: `cust_${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, ".")}@example.com`,
      phone: newPhone.trim(),
      totalOrders: 1,
      totalSpent: 101.99,
      favoriteProtein: newFavorite,
      preferredFulfilment: newFulfilment,
      lastOrderDate: "Today (Sep 23)",
      status: newStatus,
      joinDate: "Sep 2026",
      avatarInitials: initials || "JK",
      avatarBg: "bg-gold/20 border-gold/40",
      avatarText: "text-gold",
      spicePreference: newSpice,
      dietaryNotes: "Standard Halal preference",
      adminNotes: newNotes.trim() || "Newly enrolled patron.",
      address: newAddress.trim() || "Springfield, MO",
      city: "Springfield",
      zipCode: "65804",
      orderHistory: [
        {
          id: `ord_${Date.now()}`,
          orderNumber: `JK-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          date: "Today, Just Now",
          itemsSummary: `1x ${newFavorite}`,
          trayCount: 1,
          total: 101.99,
          fulfilmentType: newFulfilment === "Delivery" ? "delivery" : "pickup",
          status: "confirmed",
          paymentStatus: "Paid Online",
        },
      ],
    };

    setCustomers((prev) => [newCust, ...prev]);
    toast.success(`Patron ${newCust.name} successfully registered.`);
    setAddModalOpen(false);

    // Reset Form
    setNewName("");
    setNewPhone("");
    setNewEmail("");
    setNewAddress("");
    setNewNotes("");
  };

  // Filtered & Sorted Customers
  const filteredCustomers = useMemo(() => {
    return customers
      .filter((c) => {
        const matchesSearch =
          !searchQuery.trim() ||
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.phone.includes(searchQuery) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.favoriteProtein.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || c.status.toLowerCase().replace(/\s+/g, "-") === statusFilter;

        const matchesFulfilment =
          fulfilmentFilter === "all" ||
          c.preferredFulfilment.toLowerCase() === fulfilmentFilter.toLowerCase();

        const matchesProtein =
          proteinFilter === "all" ||
          c.favoriteProtein.toLowerCase().includes(proteinFilter.toLowerCase());

        return matchesSearch && matchesStatus && matchesFulfilment && matchesProtein;
      })
      .sort((a, b) => {
        if (sortBy === "spend") return b.totalSpent - a.totalSpent;
        if (sortBy === "orders") return b.totalOrders - a.totalOrders;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0; // recent order order
      });
  }, [customers, searchQuery, statusFilter, fulfilmentFilter, proteinFilter, sortBy]);

  // Aggregate Metrics
  const totalRegistered = 128; // Active patron directory total
  const vipCount = customers.filter((c) => c.status === "VIP Royal" || c.status === "Occasion Host").length;
  const totalLtvSpend = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgLtv = totalLtvSpend / (customers.length || 1);

  // Status Badge Class
  const getStatusBadge = (status: CustomerRecord["status"]) => {
    switch (status) {
      case "VIP Royal":
        return "bg-gold/20 text-gold border-gold/40 shadow-[0_0_10px_rgba(212,160,23,0.3)]";
      case "Occasion Host":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "Active Patron":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "New Patron":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
      case "Occasional":
        return "bg-zinc-800 text-zinc-300 border-zinc-700";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  // Biryani Image Thumbnail helper
  const getDishThumbnail = (favorite: string) => {
    if (favorite.toLowerCase().includes("mutton")) return muttonImg;
    if (favorite.toLowerCase().includes("paneer")) return paneerImg;
    if (favorite.toLowerCase().includes("prawn")) return prawnImg;
    return chickenImg;
  };

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold pb-28">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP HEADER NAVIGATION                                      */}
      {/* ------------------------------------------------------------- */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gold/20 bg-[#120c08]/95 px-4 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-black/40 text-gold hover:bg-gold/15 transition-colors"
            title="Back to Command Center"
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
                Patron & Customer CRM
              </span>
            </div>
          </Link>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              const headers = "ID,Name,Phone,Email,Status,TotalOrders,TotalSpent,FavoriteProtein,Fulfilment,LastOrderDate\n";
              const rows = customers.map((c) => 
                `"${c.id}","${c.name}","${c.phone}","${c.email}","${c.status}","${c.totalOrders}","${c.totalSpent}","${c.favoriteProtein}","${c.preferredFulfilment}","${c.lastOrderDate}"`
              ).join("\n");
              const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `jakloud_patron_directory_${new Date().toISOString().slice(0, 10)}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              toast.success("Patron Directory CSV exported successfully.");
            }}
            className="hidden sm:flex border-gold/30 bg-black/40 text-xs text-cream hover:bg-gold/15 hover:text-gold gap-1.5"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-gold" /> Export Directory
          </Button>

          <Button
            onClick={() => setAddModalOpen(true)}
            className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs shadow-lg shadow-chili/30 hover:scale-105 transition-all gap-1.5"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Add New Patron
          </Button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN CONTAINER                                             */}
      {/* ------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-8 space-y-6">
        {/* 4 Luxury KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Total Registered Patrons */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                Patron Directory
              </span>
              <div className="rounded-xl bg-gold/15 p-2 text-gold group-hover:scale-110 transition-transform">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-cream">
              {totalRegistered} <span className="text-xs font-sans text-cream/60">Registered</span>
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-[0.65rem] text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+14 new diners this month</span>
            </div>
          </div>

          {/* Card 2: VIP Royal Patrons */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                VIP Royal Patrons
              </span>
              <div className="rounded-xl bg-gold/15 p-2 text-gold group-hover:scale-110 transition-transform">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-gold">
              {vipCount} <span className="text-xs font-sans text-cream/60">VIP Accounts</span>
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-[0.65rem] text-cream/70">
              <Sparkles className="h-3 w-3 text-gold" />
              <span>Lifetime spend &gt; $500.00</span>
            </div>
          </div>

          {/* Card 3: Avg Lifetime Value (LTV) */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] uppercase tracking-wider text-saffron font-semibold">
                Average Patron LTV
              </span>
              <div className="rounded-xl bg-saffron/15 p-2 text-saffron group-hover:scale-110 transition-transform">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-cream font-mono">
              {formatMoney(avgLtv)}
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-[0.65rem] text-emerald-400">
              <TrendingUp className="h-3 w-3" />
              <span>+22% higher average Handi tray size</span>
            </div>
          </div>

          {/* Card 4: Repeat Order Rate */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[0.7rem] uppercase tracking-wider text-emerald-400 font-semibold">
                Repeat Order Loyalty
              </span>
              <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-400 group-hover:scale-110 transition-transform">
                <Heart className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-emerald-400">
              78.5% <span className="text-xs font-sans text-cream/60">Retention</span>
            </h3>
            <div className="mt-2 flex items-center gap-1.5 text-[0.65rem] text-cream/70">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              <span>Repeat Handi bookings &gt; 3x</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. FILTER & SEARCH CONTROLS                                  */}
        {/* ------------------------------------------------------------- */}
        <div className="rounded-3xl border border-gold/20 bg-[#120c08]/95 p-4 sm:p-5 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
              <Input
                placeholder="Search patrons by name, phone (e.g. 417-555-...), email, favorite biryani..."
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

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <Label htmlFor="sort-select" className="text-xs text-gold/80 font-semibold hidden sm:inline">
                Sort:
              </Label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-10 rounded-2xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:border-gold focus:outline-none cursor-pointer"
              >
                <option value="spend">Highest Lifetime Spend ($)</option>
                <option value="orders">Most Orders Placed</option>
                <option value="recent">Recent Order Date</option>
                <option value="name">Patron Name (A–Z)</option>
              </select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gold/10 text-xs">
            <span className="text-gold/60 font-semibold uppercase tracking-wider text-[0.65rem] mr-1">
              Status:
            </span>
            {[
              { id: "all", label: "All Patrons" },
              { id: "vip-royal", label: "VIP Royal" },
              { id: "occasion-host", label: "Occasion Hosts" },
              { id: "active-patron", label: "Active Patrons" },
              { id: "new-patron", label: "New Patrons" },
              { id: "occasional", label: "Occasional" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`rounded-xl px-3 py-1.5 transition-all text-xs ${
                  statusFilter === f.id
                    ? "bg-gold text-black font-bold shadow-md shadow-gold/20"
                    : "border border-gold/20 bg-black/30 text-cream/70 hover:border-gold/50 hover:text-cream"
                }`}
              >
                {f.label}
              </button>
            ))}

            <div className="h-4 w-px bg-gold/20 mx-1 hidden md:block" />

            <span className="text-gold/60 font-semibold uppercase tracking-wider text-[0.65rem] mr-1">
              Fulfilment:
            </span>
            {[
              { id: "all", label: "All" },
              { id: "pickup", label: "Pickup Pref." },
              { id: "delivery", label: "Delivery Pref." },
            ].map((ful) => (
              <button
                key={ful.id}
                onClick={() => setFulfilmentFilter(ful.id)}
                className={`rounded-xl px-2.5 py-1 text-[0.7rem] transition-all ${
                  fulfilmentFilter === ful.id
                    ? "bg-saffron text-white font-bold"
                    : "border border-gold/20 bg-black/30 text-cream/70 hover:text-cream"
                }`}
              >
                {ful.label}
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. PREMIUM RESPONSIVE CUSTOMERS TABLE                         */}
        {/* ------------------------------------------------------------- */}
        <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-gold/15 px-6 py-4">
            <div>
              <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" /> Patron Directory
              </h3>
              <p className="text-xs text-cream/60">
                Showing {filteredCustomers.length} of {customers.length} patrons
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream">
              <thead className="border-b border-gold/15 bg-black/40 font-mono text-[0.68rem] uppercase tracking-wider text-gold">
                <tr>
                  <th className="py-3.5 pl-6 pr-3">Patron Avatar & Name</th>
                  <th className="px-3 py-3.5">Contact / Phone</th>
                  <th className="px-3 py-3.5">Loyalty Status</th>
                  <th className="px-3 py-3.5 text-center">Total Orders</th>
                  <th className="px-3 py-3.5 text-right">Lifetime Spend</th>
                  <th className="px-3 py-3.5">Favorite Biryani</th>
                  <th className="px-3 py-3.5">Last Order</th>
                  <th className="px-3 py-3.5">Preference</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-cream/50">
                      <Users className="mx-auto h-8 w-8 text-gold/40 mb-2" />
                      <p className="text-sm font-semibold">No patrons match your search filter.</p>
                      <p className="text-xs text-cream/40">Try resetting your status or search terms.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => (
                    <tr
                      key={cust.id}
                      className="transition-colors hover:bg-gold/5 group cursor-pointer"
                      onClick={() => handleOpenCustomer(cust)}
                    >
                      {/* Patron Avatar & Name */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border text-xs font-bold shadow-md ${cust.avatarBg} ${cust.avatarText}`}
                          >
                            {cust.avatarInitials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-cream group-hover:text-gold transition-colors truncate">
                              {cust.name}
                            </p>
                            <p className="text-[0.65rem] text-cream/50 truncate">{cust.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact / Phone */}
                      <td className="px-3 py-4 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-cream/90">{cust.phone}</span>
                          <a
                            href={`https://wa.me/${cust.phone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="rounded-lg p-1 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                            title="WhatsApp Chat"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                          </a>
                        </div>
                      </td>

                      {/* Loyalty Status Badge */}
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold ${getStatusBadge(
                            cust.status,
                          )}`}
                        >
                          {cust.status === "VIP Royal" && <Sparkles className="h-2.5 w-2.5" />}
                          {cust.status}
                        </span>
                      </td>

                      {/* Total Orders */}
                      <td className="px-3 py-4 text-center font-mono">
                        <span className="rounded-lg bg-black/40 border border-gold/15 px-2.5 py-1 text-xs font-bold text-cream">
                          {cust.totalOrders} {cust.totalOrders === 1 ? "tray" : "trays"}
                        </span>
                      </td>

                      {/* Lifetime Spend */}
                      <td className="px-3 py-4 text-right font-mono font-bold text-gold text-xs">
                        {formatMoney(cust.totalSpent)}
                      </td>

                      {/* Favorite Biryani */}
                      <td className="px-3 py-4">
                        <div className="flex items-center gap-2">
                          <img
                            src={getDishThumbnail(cust.favoriteProtein)}
                            alt={cust.favoriteProtein}
                            className="h-7 w-7 rounded-lg object-cover border border-gold/30 shrink-0"
                          />
                          <span className="text-xs text-cream/90 truncate max-w-[130px]">
                            {cust.favoriteProtein}
                          </span>
                        </div>
                      </td>

                      {/* Last Order */}
                      <td className="px-3 py-4 text-xs text-cream/70 font-mono">
                        {cust.lastOrderDate}
                      </td>

                      {/* Preference */}
                      <td className="px-3 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[0.65rem] font-medium border ${
                            cust.preferredFulfilment === "Delivery"
                              ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                              : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          }`}
                        >
                          {cust.preferredFulfilment === "Delivery" ? (
                            <Truck className="h-3 w-3" />
                          ) : (
                            <Store className="h-3 w-3" />
                          )}
                          {cust.preferredFulfilment}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pl-3 pr-6 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCustomer(cust);
                          }}
                          className="h-8 rounded-xl border border-gold/20 bg-black/40 px-2.5 text-xs text-gold hover:bg-gold/15"
                        >
                          Profile & History →
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 5. CUSTOMER PROFILE & ORDER HISTORY DRAWER / MODAL            */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent className="border-gold/30 bg-[#120c08] text-cream max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl">
          {selectedCustomer && (
            <div className="space-y-6">
              {/* Header with Avatar & VIP Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/20 pb-5">
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-3xl border-2 text-lg font-bold shadow-xl ${selectedCustomer.avatarBg} ${selectedCustomer.avatarText}`}
                  >
                    {selectedCustomer.avatarInitials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-2xl font-bold text-cream">
                        {selectedCustomer.name}
                      </h2>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold ${getStatusBadge(
                          selectedCustomer.status,
                        )}`}
                      >
                        {selectedCustomer.status}
                      </span>
                    </div>
                    <p className="text-xs text-cream/60 flex items-center gap-2 mt-0.5">
                      <span>Patron since {selectedCustomer.joinDate}</span>
                      <span>•</span>
                      <span className="text-gold font-mono">{selectedCustomer.totalOrders} Lifetime Orders</span>
                    </p>
                  </div>
                </div>

                {/* Quick Contact Buttons */}
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-gold/30 bg-black/40 px-3 text-xs font-semibold text-gold hover:bg-gold/15 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call
                  </a>
                  <a
                    href={`https://wa.me/${selectedCustomer.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-9 items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                </div>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-gold/20 bg-black/40 p-3 text-center">
                  <span className="text-[0.65rem] uppercase tracking-wider text-gold font-semibold">
                    Lifetime Spend
                  </span>
                  <p className="mt-1 font-mono text-lg font-bold text-cream">
                    {formatMoney(selectedCustomer.totalSpent)}
                  </p>
                </div>
                <div className="rounded-2xl border border-gold/20 bg-black/40 p-3 text-center">
                  <span className="text-[0.65rem] uppercase tracking-wider text-saffron font-semibold">
                    Total Handis
                  </span>
                  <p className="mt-1 font-mono text-lg font-bold text-cream">
                    {selectedCustomer.totalOrders} Trays
                  </p>
                </div>
                <div className="rounded-2xl border border-gold/20 bg-black/40 p-3 text-center">
                  <span className="text-[0.65rem] uppercase tracking-wider text-emerald-400 font-semibold">
                    Preference
                  </span>
                  <p className="mt-1 text-xs font-bold text-emerald-300">
                    {selectedCustomer.preferredFulfilment}
                  </p>
                </div>
              </div>

              {/* Patron Profile Details & Address */}
              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                {/* Contact & Address */}
                <div className="rounded-2xl border border-gold/20 bg-black/40 p-4 space-y-2">
                  <h4 className="font-display font-bold text-gold text-sm flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" /> Address & Contact Info
                  </h4>
                  <p className="text-cream/80">
                    <span className="text-cream/50">Phone:</span> {selectedCustomer.phone}
                  </p>
                  <p className="text-cream/80">
                    <span className="text-cream/50">Email:</span> {selectedCustomer.email}
                  </p>
                  <p className="text-cream/80">
                    <span className="text-cream/50">Address:</span> {selectedCustomer.address || "1420 E Sunshine St, Springfield, MO"}
                  </p>
                </div>

                {/* Culinary Preferences */}
                <div className="rounded-2xl border border-gold/20 bg-black/40 p-4 space-y-2">
                  <h4 className="font-display font-bold text-gold text-sm flex items-center gap-1.5">
                    <UtensilsCrossed className="h-4 w-4" /> Culinary Notes & Spice
                  </h4>
                  <p className="text-cream/80">
                    <span className="text-cream/50">Favorite:</span>{" "}
                    <span className="text-gold font-semibold">{selectedCustomer.favoriteProtein}</span>
                  </p>
                  <p className="text-cream/80">
                    <span className="text-cream/50">Spice Level:</span>{" "}
                    <span className="text-saffron font-semibold">{selectedCustomer.spicePreference}</span>
                  </p>
                  <p className="text-cream/80 text-[0.7rem] italic">
                    "{selectedCustomer.dietaryNotes || "Strict Halal, extra raita and salan."}"
                  </p>
                </div>
              </div>

              {/* Internal Admin Culinary Notes */}
              <div className="rounded-2xl border border-gold/20 bg-black/40 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-bold text-gold text-sm flex items-center gap-1.5">
                    <Edit className="h-4 w-4" /> Master Chef & Admin Notes
                  </h4>
                  {!editingNotes ? (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="text-xs text-gold/80 hover:text-gold hover:underline flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" /> Edit Notes
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingNotes(false)}
                        className="h-7 text-xs border-gold/25 text-cream"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveNotes}
                        className="h-7 text-xs bg-gold text-black font-bold"
                      >
                        <Save className="h-3 w-3 mr-1" /> Save
                      </Button>
                    </div>
                  )}
                </div>

                {editingNotes ? (
                  <Textarea
                    rows={3}
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    className="rounded-xl border-gold/30 bg-black/60 text-xs text-cream"
                  />
                ) : (
                  <p className="text-cream/75 leading-relaxed bg-[#160e08] p-3 rounded-xl border border-gold/10">
                    {selectedCustomer.adminNotes || "No internal notes recorded yet for this patron."}
                  </p>
                )}
              </div>

              {/* Order History Timeline */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-cream text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gold" /> Order History Timeline (
                  {selectedCustomer.orderHistory?.length || 0})
                </h4>

                <div className="space-y-3">
                  {selectedCustomer.orderHistory?.map((hist) => (
                    <div
                      key={hist.id}
                      className="rounded-2xl border border-gold/20 bg-black/40 p-4 space-y-2 text-xs hover:border-gold/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-gold">{hist.orderNumber}</span>
                          <span className="text-cream/50">•</span>
                          <span className="text-cream/70">{hist.date}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[0.65rem] font-semibold border ${
                              hist.status === "completed"
                                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                : hist.status === "cancelled"
                                  ? "bg-chili/15 text-chili border-chili/30"
                                  : "bg-gold/15 text-gold border-gold/30"
                            }`}
                          >
                            {hist.status}
                          </span>
                          <span className="font-mono font-bold text-gold">{formatMoney(hist.total)}</span>
                        </div>
                      </div>

                      <p className="text-cream/90">{hist.itemsSummary}</p>

                      <div className="flex items-center justify-between text-[0.7rem] text-cream/50 pt-1 border-t border-gold/10">
                        <span className="capitalize">
                          {hist.fulfilmentType} • {hist.paymentStatus}
                        </span>
                        <Link
                          to={`/admin/orders/${hist.orderNumber}`}
                          className="text-gold font-medium hover:underline"
                        >
                          View Full Order Details →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 6. ADD NEW PATRON MODAL                                       */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="border-gold/30 bg-[#140e09] text-cream sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold font-semibold">
              <Users className="h-4 w-4 text-gold" />
              <span>Patron Registration</span>
            </div>
            <DialogTitle className="font-display text-xl text-cream font-bold">
              Register New Diner / VIP Patron
            </DialogTitle>
            <DialogDescription className="text-xs text-cream/60">
              Add a new customer profile to the JAKLOUD Springfield patron directory.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCustomer} className="space-y-4 pt-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cust-name" className="text-xs text-cream/80">
                  Full Patron Name *
                </Label>
                <Input
                  id="cust-name"
                  placeholder="e.g. Dr. Jennifer Clark"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cust-phone" className="text-xs text-gold font-semibold">
                  Phone Number *
                </Label>
                <Input
                  id="cust-phone"
                  placeholder="417-555-0199"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  required
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cust-email" className="text-xs text-cream/80">
                  Email Address
                </Label>
                <Input
                  id="cust-email"
                  type="email"
                  placeholder="j.clark@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cust-status" className="text-xs text-cream/80">
                  Patron Tier / Status
                </Label>
                <select
                  id="cust-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none cursor-pointer"
                >
                  <option value="Active Patron">Active Patron</option>
                  <option value="VIP Royal">VIP Royal</option>
                  <option value="Occasion Host">Occasion Host</option>
                  <option value="New Patron">New Patron</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cust-addr" className="text-xs text-cream/80">
                Delivery Address
              </Label>
              <Input
                id="cust-addr"
                placeholder="e.g. 2450 E Battlefield Rd, Springfield, MO"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="cust-fav" className="text-xs text-gold">
                  Favorite Biryani
                </Label>
                <select
                  id="cust-fav"
                  value={newFavorite}
                  onChange={(e) => setNewFavorite(e.target.value)}
                  className="w-full h-9 rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none cursor-pointer"
                >
                  <option value="Chicken Dum Biryani">Chicken Dum Biryani</option>
                  <option value="Mutton Dum Biryani">Mutton Dum Biryani</option>
                  <option value="Beef Dum Biryani">Beef Dum Biryani</option>
                  <option value="Pork Dum Biryani">Pork Dum Biryani</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="cust-ful" className="text-xs text-cream/80">
                  Preferred Fulfilment
                </Label>
                <select
                  id="cust-ful"
                  value={newFulfilment}
                  onChange={(e) => setNewFulfilment(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none cursor-pointer"
                >
                  <option value="Pickup">Pickup at Counter</option>
                  <option value="Delivery">Delivery Routing</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="cust-notes" className="text-xs text-cream/80">
                Internal Culinary / Kitchen Notes
              </Label>
              <Textarea
                id="cust-notes"
                rows={2}
                placeholder="e.g. Extra fried onions preference, celebration events host"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
              />
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t border-gold/15">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddModalOpen(false)}
                className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gold text-black hover:bg-gold/90 font-bold text-xs"
              >
                Register Patron
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
