import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Flame,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Users,
  Truck,
  Store,
  PieChart as PieIcon,
  Award,
  Layers,
  Percent,
  ChefHat,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Sliders,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";

import { useAuth } from "@/lib/auth";
import { useDynamicOrders } from "@/lib/store";
import {
  WEEKLY_SALES_DATA,
  MONTHLY_SALES_DATA,
  DAILY_ORDERS_DATA,
  FULFILMENT_PIE_DATA,
  CUSTOMER_GROWTH_DATA,
  PROTEIN_DISTRIBUTION,
  BEST_SELLING_DISHES,
} from "@/lib/admin-data";
import { formatMoney, BUSINESS } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Financial Reports & Analytics — JAKLOUD Spice King" },
      {
        name: "description",
        content: "Executive restaurant analytics, monthly sales revenue, capacity limits, protein share, and exportable reports.",
      },
    ],
  }),
  component: ReportsAnalyticsPage,
});

function ReportsAnalyticsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Date Range Filter State
  const [dateRange, setDateRange] = useState<
    "today" | "week" | "month" | "last30" | "quarter" | "year"
  >("month");

  // Download Reports Modal State
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | "excel">("pdf");
  const [selectedReportType, setSelectedReportType] = useState("pnl");

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Dynamic Reactive Orders Store Hook
  const { orders, stats } = useDynamicOrders();

  // Handle Export Download Action
  const handleDownloadReport = () => {
    if (exportFormat === "csv") {
      const headers = ["Order ID", "Date", "Patron Name", "Phone", "Email", "Fulfilment", "Status", "Items", "Subtotal", "Tax", "Delivery Fee", "Total"];
      const rows = orders.map((o) => [
        o.orderNumber,
        o.fulfilmentDate,
        `"${o.customer.name}"`,
        `"${o.customer.phone}"`,
        `"${o.customer.email}"`,
        o.fulfilmentType,
        o.status,
        `"${o.items.map((i) => `${i.qty}x ${i.name}`).join("; ")}"`,
        o.subtotal.toFixed(2),
        o.tax.toFixed(2),
        o.deliveryFee.toFixed(2),
        o.total.toFixed(2),
      ]);

      const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `jakloud_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Sales records CSV exported successfully!");
    } else {
      const jsonContent = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ report: selectedReportType, generatedAt: new Date().toISOString(), stats, orders }, null, 2));
      const link = document.createElement("a");
      link.setAttribute("href", jsonContent);
      link.setAttribute("download", `jakloud_analytics_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Analytics data exported successfully!");
    }
    setExportModalOpen(false);
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-gold/40 bg-[#140e09]/95 p-3 text-xs shadow-2xl backdrop-blur-xl space-y-1">
          <p className="font-display font-bold text-gold text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="text-cream/80 flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-cream">
                {typeof entry.value === "number" && entry.name.toLowerCase().includes("revenue")
                  ? formatMoney(entry.value)
                  : typeof entry.value === "number" && entry.name.toLowerCase().includes("profit")
                    ? formatMoney(entry.value)
                    : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
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
            title="Back to Dashboard"
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
                Financial Reports & Analytics
              </span>
            </div>
          </Link>
        </div>

        {/* Date Filter & Export Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              toast.success("Printing Executive Analytics Sheet...");
              window.print();
            }}
            className="hidden lg:flex border-gold/30 bg-black/40 text-xs text-cream hover:bg-gold/15 hover:text-gold gap-1.5"
          >
            <Printer className="h-3.5 w-3.5 text-gold" /> Print Summary
          </Button>

          <Button
            onClick={() => setExportModalOpen(true)}
            className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs shadow-lg shadow-chili/30 hover:scale-105 transition-all gap-1.5"
          >
            <Download className="h-4 w-4" /> Download Reports
          </Button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN REPORT CONTAINER                                      */}
      {/* ------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-8 space-y-6">
        {/* Date Filter Range Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gold/20 bg-[#120c08]/90 p-3 sm:px-5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs text-cream/70 font-medium">
            <Calendar className="h-4 w-4 text-gold" />
            <span>Time Horizon:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {[
              { id: "today", label: "Today" },
              { id: "week", label: "Last 7 Days" },
              { id: "month", label: "This Month (Sep)" },
              { id: "last30", label: "Last 30 Days" },
              { id: "quarter", label: "Quarter (Q3)" },
              { id: "year", label: "Year-to-Date (2026)" },
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDateRange(d.id as any)}
                className={`rounded-xl px-3 py-1.5 transition-all text-xs font-semibold ${
                  dateRange === d.id
                    ? "bg-gold text-black shadow-md shadow-gold/25 font-bold"
                    : "border border-gold/20 bg-black/30 text-cream/70 hover:border-gold/50 hover:text-cream"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* 6 Executive KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {/* Card 1: Gross Sales */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-wider text-gold font-semibold">
                Gross Sales (MTD)
              </span>
              <div className="rounded-xl bg-gold/15 p-2 text-gold group-hover:scale-110 transition-transform">
                <DollarSign className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-cream font-mono">
              $38,750.00
            </h3>
            <div className="mt-2 flex items-center gap-1 text-[0.65rem] text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>+16.8% vs Aug</span>
            </div>
          </div>

          {/* Card 2: Handi Trays Sold */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-wider text-saffron font-semibold">
                Handi Trays Sold
              </span>
              <div className="rounded-xl bg-saffron/15 p-2 text-saffron group-hover:scale-110 transition-transform">
                <ShoppingBag className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-cream font-mono">
              318 <span className="text-xs font-sans text-cream/60">Trays</span>
            </h3>
            <div className="mt-2 flex items-center gap-1 text-[0.65rem] text-cream/70">
              <span>Avg. 21.2 trays / day</span>
            </div>
          </div>

          {/* Card 3: Average Order Value (AOV) */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-wider text-gold font-semibold">
                Average Order (AOV)
              </span>
              <div className="rounded-xl bg-gold/15 p-2 text-gold group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-gold font-mono">
              $154.50
            </h3>
            <div className="mt-2 flex items-center gap-1 text-[0.65rem] text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>+$12.50 per booking</span>
            </div>
          </div>

          {/* Card 4: Net Kitchen Profit */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-wider text-emerald-400 font-semibold">
                Net Kitchen Margin
              </span>
              <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-400 group-hover:scale-110 transition-transform">
                <Percent className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-emerald-400 font-mono">
              68.0%
            </h3>
            <div className="mt-2 flex items-center gap-1 text-[0.65rem] text-cream/70 font-mono">
              <span>$26,350 net profit</span>
            </div>
          </div>

          {/* Card 5: Capacity Utilization */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-wider text-chili font-semibold">
                Capacity Utilization
              </span>
              <div className="rounded-xl bg-chili/15 p-2 text-chili group-hover:scale-110 transition-transform">
                <Flame className="h-4 w-4 animate-pulse" />
              </div>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-cream font-mono">
              84.8%
            </h3>
            <div className="mt-2 flex items-center gap-1 text-[0.65rem] text-cream/70">
              <span>Limit: 25 trays/day</span>
            </div>
          </div>

          {/* Card 6: Aloo Addon Attachment */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-5 shadow-xl backdrop-blur-xl hover:border-gold/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] uppercase tracking-wider text-saffron font-semibold">
                Aloo Attachment
              </span>
              <div className="rounded-xl bg-saffron/15 p-2 text-saffron group-hover:scale-110 transition-transform">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold text-saffron font-mono">
              71.2%
            </h3>
            <div className="mt-2 flex items-center gap-1 text-[0.65rem] text-emerald-400">
              <ArrowUpRight className="h-3 w-3" />
              <span>High profit addon</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. ROW 1: MONTHLY SALES REVENUE & DAILY CAPACITY LIMIT CHARTS */}
        {/* ------------------------------------------------------------- */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Monthly Revenue Progression Area Chart */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-2xl backdrop-blur-xl lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between border-b border-gold/15 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gold" /> Monthly Sales & Net Profit Growth
                </h3>
                <p className="text-xs text-cream/60">
                  Gross Revenue vs Net Profit after premium meats, saffron, and packaging
                </p>
              </div>
              <span className="rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[0.65rem] font-bold text-gold font-mono">
                2026 Fiscal Year
              </span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={MONTHLY_SALES_DATA}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#d4a017" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#d4a017" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a1f18" />
                  <XAxis
                    dataKey="month"
                    stroke="#9ca3af"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    tickFormatter={(val) => `$${val / 1000}k`}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: "12px", color: "#fdf8f0" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Gross Revenue ($)"
                    stroke="#d4a017"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenueGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="profit"
                    name="Net Profit ($)"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#profitGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Daily Capacity & Orders vs 25-Tray Limit */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-2xl backdrop-blur-xl lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between border-b border-gold/15 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                  <Flame className="h-5 w-5 text-chili" /> Daily Dum Capacity Tracking
                </h3>
                <p className="text-xs text-cream/60">
                  Daily tray bookings vs 25-tray capacity limit ceiling
                </p>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={DAILY_ORDERS_DATA.slice(-8)}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a1f18" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={11}
                    domain={[0, 28]}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: "12px", color: "#fdf8f0" }}
                  />
                  <Bar
                    dataKey="pickup"
                    name="Counter Pickup"
                    fill="#d4a017"
                    stackId="a"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="delivery"
                    name="Delivery Trays"
                    fill="#b91c1c"
                    stackId="a"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 4. ROW 2: FULFILMENT DONUT & PROTEIN DISTRIBUTION PIE         */}
        {/* ------------------------------------------------------------- */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Pickup vs Delivery Donut */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="border-b border-gold/15 pb-4">
              <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                <Store className="h-5 w-5 text-gold" /> Pickup vs Delivery Breakdown
              </h3>
              <p className="text-xs text-cream/60">Fulfilment channel volume & revenue</p>
            </div>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={FULFILMENT_PIE_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {FULFILMENT_PIE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#120c08" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value}% of total orders`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-gold/15 text-xs">
              {FULFILMENT_PIE_DATA.map((f, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: f.color }} />
                    <span className="text-cream">{f.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-cream">{f.count} trays</span>
                    <span className="text-cream/50 text-[0.65rem] ml-1.5">({f.value}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Protein Share Distribution */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="border-b border-gold/15 pb-4">
              <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                <Flame className="h-5 w-5 text-chili" /> Best-Selling Protein Share
              </h3>
              <p className="text-xs text-cream/60">Halal chicken, mutton, beef & special cuts</p>
            </div>

            <div className="h-52 w-full">
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#120c08" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value}% share`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 pt-2 border-t border-gold/15 text-xs">
              {PROTEIN_DISTRIBUTION.map((p, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-cream">{p.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <span className="font-bold text-gold">{formatMoney(p.revenue)}</span>
                    <span className="text-cream/50 text-[0.65rem] ml-1.5">({p.value}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Patron Retention & Growth Curve */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-2xl backdrop-blur-xl space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="border-b border-gold/15 pb-4">
              <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                <Users className="h-5 w-5 text-gold" /> Patron Retention Growth
              </h3>
              <p className="text-xs text-cream/60">New patrons vs repeat Handi bookings</p>
            </div>

            <div className="h-52 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={CUSTOMER_GROWTH_DATA}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a1f18" />
                  <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="repeatOrders"
                    name="Repeat Bookings"
                    stroke="#d4a017"
                    strokeWidth={2.5}
                    dot={{ fill: "#d4a017", r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="newPatrons"
                    name="New Diners"
                    stroke="#ea580c"
                    strokeWidth={2}
                    dot={{ fill: "#ea580c", r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-gold/15 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>78.5% 30-day return rate</span>
              </div>
              <span className="text-cream/50 text-[0.65rem] font-mono">128 Total Patrons</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 5. BEST-SELLING BIRYANI RANKING LEADERBOARD                   */}
        {/* ------------------------------------------------------------- */}
        <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 shadow-2xl backdrop-blur-xl overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold/15 px-6 py-4">
            <div>
              <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                <Award className="h-5 w-5 text-gold" /> Best-Selling Biryani Leaderboard
              </h3>
              <p className="text-xs text-cream/60">
                Weekly tray sales volumes, revenue generation, and addon attachment metrics
              </p>
            </div>
            <span className="rounded-full bg-black/40 border border-gold/20 px-3 py-1 text-xs text-gold font-mono">
              Sep 17 – Sep 23, 2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-cream">
              <thead className="border-b border-gold/15 bg-black/40 font-mono text-[0.68rem] uppercase tracking-wider text-gold">
                <tr>
                  <th className="py-3.5 pl-6 pr-3">Rank & Dish</th>
                  <th className="px-3 py-3.5">Category</th>
                  <th className="px-3 py-3.5 font-mono">Base Price</th>
                  <th className="px-3 py-3.5 text-center">Trays Sold (Week)</th>
                  <th className="px-3 py-3.5 text-right font-mono">Revenue Generated</th>
                  <th className="px-3 py-3.5 text-center">Aloo Addon %</th>
                  <th className="px-3 py-3.5 text-center">Extra Spicy %</th>
                  <th className="py-3.5 pl-3 pr-6 text-right">Patron Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {BEST_SELLING_DISHES.map((dish) => (
                  <tr key={dish.id} className="hover:bg-gold/5 transition-colors">
                    {/* Rank & Dish */}
                    <td className="py-4 pl-6 pr-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
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
                        <div>
                          <p className="font-semibold text-cream text-sm">{dish.name}</p>
                          <span className="text-[0.65rem] text-gold/80">Dum Pukht Handi</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-4 text-cream/70 font-medium">
                      {dish.category}
                    </td>

                    {/* Base Price */}
                    <td className="px-3 py-4 font-mono font-bold text-cream">
                      {formatMoney(dish.basePrice)}
                    </td>

                    {/* Trays Sold */}
                    <td className="px-3 py-4 text-center font-mono font-bold text-cream">
                      <span className="rounded-lg bg-black/40 border border-gold/15 px-2.5 py-1 text-xs">
                        {dish.traysSoldWeek} trays
                      </span>
                    </td>

                    {/* Revenue */}
                    <td className="px-3 py-4 text-right font-mono font-bold text-gold text-sm">
                      {formatMoney(dish.revenueWeek)}
                    </td>

                    {/* Aloo % */}
                    <td className="px-3 py-4 text-center font-mono font-semibold text-emerald-400">
                      {dish.alooRate}
                    </td>

                    {/* Extra Spicy % */}
                    <td className="px-3 py-4 text-center font-mono font-semibold text-saffron">
                      {dish.extraSpicyRate}
                    </td>

                    {/* Rating */}
                    <td className="py-4 pl-3 pr-6 text-right">
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 border border-gold/30 px-2.5 py-0.5 text-xs font-bold text-gold">
                        ⭐ {dish.rating}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 6. DOWNLOADABLE REPORTS MODAL                                 */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="border-gold/30 bg-[#140e09] text-cream sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold font-semibold">
              <Download className="h-4 w-4 text-gold" />
              <span>Report Generation</span>
            </div>
            <DialogTitle className="font-display text-xl text-cream font-bold">
              Download Executive Business Reports
            </DialogTitle>
            <DialogDescription className="text-xs text-cream/60">
              Select report type, time horizon, and export format.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            {/* Report Type Selector */}
            <div className="space-y-2">
              <label className="text-xs text-gold font-semibold uppercase tracking-wider">
                Select Report Type:
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: "pnl",
                    title: "Executive P&L Statement (Sep 2026)",
                    desc: "Gross revenue, food cost of sales, packaging, net profit margins.",
                    icon: DollarSign,
                  },
                  {
                    id: "capacity",
                    title: "Daily Handi Capacity & Tray Log",
                    desc: "Daily 25-tray production audit, pickup/delivery times, and turnaways.",
                    icon: Flame,
                  },
                  {
                    id: "proteins",
                    title: "Protein Sourcing & Halal Audit",
                    desc: "Chicken, mutton, beef weights, batch certifications, supplier costs.",
                    icon: ChefHat,
                  },
                  {
                    id: "patrons",
                    title: "Patron Lifetime Spend & Loyalty Ledger",
                    desc: "128 customer records, VIP rankings, phone numbers, total spend.",
                    icon: Users,
                  },
                ].map((rep) => {
                  const Icon = rep.icon;
                  return (
                    <div
                      key={rep.id}
                      onClick={() => setSelectedReportType(rep.id)}
                      className={`flex items-start gap-3 rounded-2xl border p-3 cursor-pointer transition-all ${
                        selectedReportType === rep.id
                          ? "border-gold bg-gold/10 text-cream shadow-md"
                          : "border-gold/20 bg-black/40 text-cream/70 hover:border-gold/50 hover:text-cream"
                      }`}
                    >
                      <div className="mt-0.5 rounded-lg bg-gold/15 p-1.5 text-gold shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-xs text-cream">{rep.title}</p>
                        <p className="text-[0.65rem] text-cream/60 mt-0.5 leading-relaxed">{rep.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export Format Selector */}
            <div className="space-y-2">
              <label className="text-xs text-gold font-semibold uppercase tracking-wider">
                Format:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "pdf", label: "PDF Document", icon: FileText },
                  { id: "csv", label: "CSV Spreadsheet", icon: FileSpreadsheet },
                  { id: "excel", label: "Excel (.xlsx)", icon: FileSpreadsheet },
                ].map((fmt) => {
                  const Icon = fmt.icon;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setExportFormat(fmt.id as any)}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition-all ${
                        exportFormat === fmt.id
                          ? "bg-gold text-black font-bold border-gold"
                          : "border-gold/20 bg-black/40 text-cream/70 hover:border-gold/50 hover:text-cream"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{fmt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t border-gold/15">
              <Button
                type="button"
                variant="outline"
                onClick={() => setExportModalOpen(false)}
                className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDownloadReport}
                className="bg-gold text-black hover:bg-gold/90 font-bold text-xs"
              >
                Generate & Download
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
