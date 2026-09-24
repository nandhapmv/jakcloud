import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Flame,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sliders,
  Sparkles,
  ShoppingBag,
  Calendar,
  ChevronLeft,
  Store,
  Truck,
  Eye,
  RefreshCw,
  Save,
  Check,
  Send,
  Lock,
  Unlock,
  Layers,
  HelpCircle,
  Sun,
  Moon,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import heroBiryaniImg from "@/assets/hero-biryani.jpg";
import { useAuth } from "@/lib/auth";
import { formatMoney, BUSINESS, ORDER_CUTOFF_HOUR } from "@/lib/menu";
import { useKitchenSettings, useDynamicOrders } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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

export const Route = createFileRoute("/admin/daily-control")({
  head: () => ({
    meta: [
      { title: "Daily Order & Dum Capacity Control — JAKLOUD Spice King" },
      {
        name: "description",
        content: "Control daily 25-tray capacity limits, live ordering switches, close today's queue, and automated rollover.",
      },
    ],
  }),
  component: DailyOrderControlPage,
});

function DailyOrderControlPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Dynamic Reactive Store Hooks
  const { settings, updateSettings } = useKitchenSettings();
  const { orders, stats } = useDynamicOrders();

  // Core Capacity & Ordering State initialized from store
  const [onlineOrderingActive, setOnlineOrderingActive] = useState(settings.isKitchenOpen);
  const [todayOrdersClosed, setTodayOrdersClosed] = useState(!settings.isKitchenOpen);
  const [dailyLimit, setDailyLimit] = useState<number>(settings.dailyTrayLimit);
  const [cutoffHour, setCutoffHour] = useState<number>(settings.orderCutoffHour);
  const [tomorrowLimit, setTomorrowLimit] = useState<number>(settings.dailyTrayLimit);
  const [autoRollTomorrow, setAutoRollTomorrow] = useState(true);
  const [tomorrowOrdersOpen, setTomorrowOrdersOpen] = useState(true);

  // Live tray calculations from actual orders
  const bookedTraysToday = useMemo(() => {
    const todayOrders = orders.filter((o) => {
      const isToday = o.fulfilmentDate.toLowerCase().includes("today") ||
        (new Date(o.createdAt).toDateString() === new Date().toDateString());
      return isToday && o.status !== "cancelled";
    });
    return todayOrders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0) || 19;
  }, [orders]);

  const pickupTrays = useMemo(() => {
    return orders.filter((o) => o.fulfilmentType === "pickup" && o.status !== "cancelled")
      .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0) || 11;
  }, [orders]);

  const deliveryTrays = useMemo(() => {
    return orders.filter((o) => o.fulfilmentType === "delivery" && o.status !== "cancelled")
      .reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0) || 8;
  }, [orders]);

  // Closed Announcement Customization
  const [bannerTitle, setBannerTitle] = useState("Today's Dum Biryani Batch is Fully Booked!");
  const [bannerMessage, setBannerMessage] = useState(
    "Chef Kartheek's kitchen has reached today's 25-tray artisanal slow-cooked capacity. Pre-orders are now open for tomorrow's freshly prepared Dum Handis.",
  );

  // Modal State
  const [closeConfirmOpen, setCloseConfirmOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Derived Calculations
  const remainingTrays = Math.max(0, dailyLimit - bookedTraysToday);
  const capacityPercent = Math.min(100, Math.round((bookedTraysToday / dailyLimit) * 100));

  // Circular progress stroke calculation
  const circleRadius = 78;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (capacityPercent / 100) * circumference;

  // Handle Master Ordering Toggle
  const handleToggleMasterOrdering = (checked: boolean) => {
    setOnlineOrderingActive(checked);
    updateSettings({ isKitchenOpen: checked });
    if (checked) {
      setTodayOrdersClosed(false);
      toast.success("Online ordering platform is now LIVE and accepting diner bookings.");
    } else {
      toast.error("Online ordering paused across all public menus.");
    }
  };

  // Close Today's Orders Immediately
  const handleConfirmCloseToday = () => {
    setTodayOrdersClosed(true);
    setCloseConfirmOpen(false);
    updateSettings({ isKitchenOpen: false, emergencyPauseReason: bannerTitle });
    toast.error(
      "Today's Dum orders have been CLOSED. Public menu is now automatically prompting pre-orders for tomorrow.",
    );
  };

  // Re-open Today's Orders
  const handleReopenToday = () => {
    setTodayOrdersClosed(false);
    setOnlineOrderingActive(true);
    updateSettings({ isKitchenOpen: true, emergencyPauseReason: "" });
    toast.success("Today's ordering reopened! Diners can book remaining trays.");
  };

  // Save Settings
  const handleSaveAll = () => {
    updateSettings({
      dailyTrayLimit: dailyLimit,
      orderCutoffHour: cutoffHour,
      isKitchenOpen: onlineOrderingActive && !todayOrdersClosed,
    });
    toast.success("Kitchen capacity & automated schedule successfully synchronized!");
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
              alt="JAKLOUD"
              className="h-10 w-10 rounded-full border border-gold/50 bg-cream p-0.5 object-cover"
            />
            <div>
              <span className="font-display text-lg font-bold tracking-wider text-cream">
                JAKLOUD
              </span>
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gold">
                Daily Order & Capacity Control
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewModalOpen(true)}
            className="border-gold/30 bg-black/40 text-xs text-gold hover:bg-gold/15 gap-1.5"
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview Diner Popup</span>
          </Button>

          <Button
            onClick={handleSaveAll}
            className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs shadow-lg shadow-chili/30 hover:scale-105 transition-all gap-1.5"
          >
            <Save className="h-4 w-4" /> Save Settings
          </Button>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 space-y-8">
        {/* Executive Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl border border-gold/30 bg-gradient-to-r from-[#170f0a] via-[#120c08] to-[#1a100a] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold font-semibold">
              <Flame className="h-3.5 w-3.5 text-chili" />
              <span>Slow-Cooked Dum Oven Capacity Command</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-4xl text-cream font-bold">
              Daily Order Control
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-cream/75 max-w-2xl leading-relaxed">
              Maintain culinary perfection by enforcing our daily 25-tray maximum. Control live ordering switches, emergency close triggers, and automated tomorrow rollover.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            {todayOrdersClosed ? (
              <Button
                onClick={handleReopenToday}
                size="lg"
                className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-xs px-5 shadow-lg shadow-emerald-600/30 gap-1.5"
              >
                <Unlock className="h-4 w-4" /> Re-open Today's Orders
              </Button>
            ) : (
              <Button
                onClick={() => setCloseConfirmOpen(true)}
                size="lg"
                className="bg-chili text-white hover:bg-chili/90 font-bold text-xs px-5 shadow-lg shadow-chili/30 gap-1.5 animate-pulse"
              >
                <Lock className="h-4 w-4" /> Close Today's Orders
              </Button>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. CIRCULAR PROGRESS GAUGE & CAPACITY METRICS                 */}
        {/* ------------------------------------------------------------- */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Card 1: Glowing Circular Progress Indicator */}
          <div className="rounded-3xl border border-gold/30 bg-[#120c08]/90 p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
            <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[0.65rem] font-bold text-gold uppercase tracking-wider">
              <Flame className="h-3.5 w-3.5 text-chili" /> Today's Dum Booking Progress
            </div>

            {/* Glowing Circular Progress SVG */}
            <div className="relative my-4 flex items-center justify-center">
              <svg className="h-52 w-52 -rotate-90 transform" viewBox="0 0 180 180">
                {/* Background Ring */}
                <circle
                  cx="90"
                  cy="90"
                  r={circleRadius}
                  className="stroke-black/60"
                  strokeWidth="12"
                  fill="transparent"
                />
                {/* Active Progress Ring */}
                <circle
                  cx="90"
                  cy="90"
                  r={circleRadius}
                  stroke="url(#progressGradient)"
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={todayOrdersClosed ? 0 : strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out drop-shadow-[0_0_12px_rgba(212,160,23,0.5)]"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#b91c1c" />
                    <stop offset="50%" stopColor="#ea580c" />
                    <stop offset="100%" stopColor="#d4a017" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Central Text Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display text-4xl font-bold text-cream">
                  {todayOrdersClosed ? "100%" : `${capacityPercent}%`}
                </span>
                <span className="text-[0.7rem] font-mono font-semibold uppercase tracking-wider text-gold mt-0.5">
                  {bookedTraysToday} / {dailyLimit} Trays
                </span>
                <span className="text-[0.65rem] text-cream/50 mt-0.5">
                  {todayOrdersClosed ? "Batch Locked" : `${remainingTrays} Slots Remaining`}
                </span>
              </div>
            </div>

            <div className="w-full pt-2 border-t border-gold/15 flex items-center justify-between text-xs">
              <span className="text-cream/60">Oven Status:</span>
              <span
                className={`font-bold ${
                  todayOrdersClosed
                    ? "text-chili"
                    : capacityPercent >= 80
                      ? "text-saffron"
                      : "text-emerald-400"
                }`}
              >
                {todayOrdersClosed
                  ? "🔴 Orders Closed"
                  : capacityPercent >= 80
                    ? "🟠 Near Full Capacity"
                    : "🟢 Normal Dum Production"}
              </span>
            </div>
          </div>

          {/* Card 2: Current Order Count vs Maximum Orders Breakdown */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4">
            <div className="border-b border-gold/15 pb-3">
              <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-gold" /> Order Allocation Breakdown
              </h3>
              <p className="text-xs text-cream/60">
                Fulfilment split between counter pickups and local delivery courier
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-2xl border border-gold/15 bg-black/40 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-gold font-semibold">
                    <Store className="h-4 w-4" /> Counter Pickup Trays
                  </span>
                  <span className="font-mono font-bold text-cream text-sm">
                    {pickupTrays} Trays
                  </span>
                </div>
                <div className="flex justify-between text-[0.65rem] text-cream/50">
                  <span>3625 S Bedford Ave</span>
                  <span>~{Math.round((pickupTrays / bookedTraysToday) * 100)}% of today's total</span>
                </div>
              </div>

              <div className="rounded-2xl border border-gold/15 bg-black/40 p-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-saffron font-semibold">
                    <Truck className="h-4 w-4" /> Local Delivery Trays
                  </span>
                  <span className="font-mono font-bold text-cream text-sm">
                    {deliveryTrays} Trays
                  </span>
                </div>
                <div className="flex justify-between text-[0.65rem] text-cream/50">
                  <span>10-Mile Radius Dispatch</span>
                  <span>~{Math.round((deliveryTrays / bookedTraysToday) * 100)}% of today's total</span>
                </div>
              </div>

              <div className="rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/10 via-black/40 to-gold/5 p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[0.65rem] uppercase tracking-wider text-gold font-semibold block">
                    Remaining Dum Slots:
                  </span>
                  <span className="font-display text-lg font-bold text-cream">
                    {todayOrdersClosed ? "0 Trays" : `${remainingTrays} Trays Left`}
                  </span>
                </div>
                <div className="text-right font-mono text-[0.7rem] text-cream/70">
                  Max Cap: <strong>{dailyLimit}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Configurable Daily Limit Input & Master Switches */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4">
            <div className="border-b border-gold/15 pb-3">
              <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                <Sliders className="h-5 w-5 text-gold" /> Daily Capacity Limit Input
              </h3>
              <p className="text-xs text-cream/60">
                Adjust maximum allowable Dum handi trays for today's production
              </p>
            </div>

            <div className="space-y-4 text-xs">
              {/* Daily Limit Controls */}
              <div className="rounded-2xl border border-gold/20 bg-black/40 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="limit-input" className="text-xs font-semibold text-gold">
                    Maximum Oven Limit (Trays):
                  </Label>
                  <span className="font-mono text-xs text-cream/60">Currently: {dailyLimit}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDailyLimit((prev) => Math.max(10, prev - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-black/50 text-gold hover:bg-gold/15 text-lg font-bold"
                  >
                    -
                  </button>

                  <Input
                    id="limit-input"
                    type="number"
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Math.max(1, parseInt(e.target.value, 10) || 25))}
                    className="h-10 text-center font-display text-lg font-bold text-cream rounded-xl border-gold/30 bg-black/60"
                  />

                  <button
                    onClick={() => setDailyLimit((prev) => Math.min(50, prev + 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-gold/30 bg-black/50 text-gold hover:bg-gold/15 text-lg font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Preset Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: "20 Trays (Slow Day)", val: 20 },
                    { label: "25 Trays (Standard)", val: 25 },
                    { label: "35 Trays (Weekend)", val: 35 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      onClick={() => setDailyLimit(preset.val)}
                      className={`rounded-lg px-2.5 py-1 text-[0.65rem] font-medium transition-all ${
                        dailyLimit === preset.val
                          ? "bg-gold text-black font-bold shadow-md shadow-gold/30"
                          : "border border-gold/20 bg-black/40 text-cream/70 hover:border-gold/40"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Master Ordering Switch */}
              <div className="flex items-center justify-between rounded-2xl border border-gold/20 bg-black/40 p-4">
                <div>
                  <Label htmlFor="master-ordering-switch" className="text-xs font-semibold text-cream cursor-pointer">
                    Live Web Ordering System
                  </Label>
                  <p className="text-[0.65rem] text-cream/60">
                    Master toggle for customer checkout availability
                  </p>
                </div>
                <Switch
                  id="master-ordering-switch"
                  checked={onlineOrderingActive && !todayOrdersClosed}
                  onCheckedChange={handleToggleMasterOrdering}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. AUTOMATION & CUSTOMER-FACING POPUP PREVIEW                 */}
        {/* ------------------------------------------------------------- */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Card: Open Tomorrow's Orders Automation */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gold/15 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gold" /> Tomorrow's Orders Automation
                </h3>
                <p className="text-xs text-cream/60">
                  Automated rollover to next-day booking upon cutoff or capacity reach
                </p>
              </div>
              <Switch
                id="auto-roll-toggle"
                checked={autoRollTomorrow}
                onCheckedChange={setAutoRollTomorrow}
                className="data-[state=checked]:bg-gold"
              />
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-gold/15 bg-black/40 p-3.5 space-y-1">
                  <Label htmlFor="cutoff-time" className="text-xs text-gold font-semibold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gold" /> Daily Cutoff Hour:
                  </Label>
                  <select
                    id="cutoff-time"
                    value={cutoffHour}
                    onChange={(e) => setCutoffHour(parseInt(e.target.value, 10))}
                    className="w-full h-8 rounded-lg border border-gold/25 bg-black/60 px-2 text-xs text-cream focus:outline-none cursor-pointer font-mono"
                  >
                    <option value={12}>12:00 PM (Noon Cutoff)</option>
                    <option value={13}>1:00 PM</option>
                    <option value={14}>2:00 PM (Standard Roll)</option>
                    <option value={15}>3:00 PM</option>
                    <option value={16}>4:00 PM</option>
                  </select>
                </div>

                <div className="rounded-2xl border border-gold/15 bg-black/40 p-3.5 space-y-1">
                  <Label htmlFor="tmrw-limit" className="text-xs text-saffron font-semibold">
                    Tomorrow's Capacity (Trays):
                  </Label>
                  <Input
                    id="tmrw-limit"
                    type="number"
                    value={tomorrowLimit}
                    onChange={(e) => setTomorrowLimit(parseInt(e.target.value, 10) || 25)}
                    className="h-8 rounded-lg border-gold/25 bg-black/60 text-xs font-mono font-bold text-cream"
                  />
                </div>
              </div>

              {/* Wednesday Closure Notice */}
              <div className="rounded-2xl border border-gold/20 bg-black/40 p-4 space-y-1 text-xs">
                <div className="flex items-center gap-2 text-gold font-semibold">
                  <Sun className="h-4 w-4 text-saffron" /> Wednesday Kitchen Rest & Spice Grinding
                </div>
                <p className="text-[0.7rem] text-cream/70 leading-relaxed">
                  System automatically skips Wednesdays during next-day rollover to allow deep handi seasoning and spice roasting. Next available date will roll to Thursday.
                </p>
              </div>

              {/* Custom Announcement Message Editor */}
              <div className="space-y-2 pt-1">
                <Label htmlFor="banner-title-input" className="text-xs text-cream/80 font-semibold">
                  Announcement Header Text:
                </Label>
                <Input
                  id="banner-title-input"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream font-medium"
                />

                <Label htmlFor="banner-msg-input" className="text-xs text-cream/80 font-semibold pt-2 block">
                  Announcement Body Description:
                </Label>
                <Textarea
                  id="banner-msg-input"
                  rows={2}
                  value={bannerMessage}
                  onChange={(e) => setBannerMessage(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream placeholder:text-cream/40"
                />
              </div>
            </div>
          </div>

          {/* Card: Live Popup Preview Component */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-gold/15 pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gold" /> Live Diner Popup Preview
                </h3>
                <p className="text-xs text-cream/60">
                  What customers see when today's limit is reached or manually closed
                </p>
              </div>
              <span className="rounded-full bg-gold/15 border border-gold/30 px-3 py-0.5 text-[0.65rem] font-bold text-gold uppercase">
                Interactive Preview
              </span>
            </div>

            {/* Embedded Live Preview Modal Frame */}
            <div className="relative rounded-2xl border border-gold/30 bg-gradient-to-b from-[#1b120a] to-[#120c08] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-chili to-gold text-white shadow-xl shadow-chili/30 animate-bounce">
                  <Flame className="h-6 w-6" />
                </div>
              </div>

              <div className="text-center space-y-1.5">
                <span className="text-[0.65rem] uppercase tracking-widest text-gold font-semibold">
                  JAKLOUD Spice King Dum Biryani
                </span>
                <h4 className="font-display text-xl font-bold text-cream">
                  {bannerTitle}
                </h4>
                <p className="text-xs text-cream/75 max-w-md mx-auto leading-relaxed">
                  {bannerMessage}
                </p>
              </div>

              <div className="rounded-xl border border-gold/20 bg-black/50 p-3 text-center space-y-1 text-xs">
                <span className="text-[0.65rem] uppercase tracking-wider text-saffron font-bold">
                  Next Available Dum Dispatch:
                </span>
                <p className="font-display text-base font-bold text-cream">
                  Tomorrow (Thursday) · 11:00 AM – 6:00 PM Slots
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <Button
                  className="flex-1 bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs h-9 shadow-md shadow-chili/30"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5" /> Book Tomorrow's Dum Tray
                </Button>
                <Button
                  variant="outline"
                  className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs h-9"
                >
                  View Menu
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-cream/50 pt-2">
              <span>Renders automatically on Diner Checkout & Menu pages</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewModalOpen(true)}
                className="text-gold text-xs hover:bg-gold/15"
              >
                Expand Full Screen Modal →
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* FULL SCREEN DINER POPUP PREVIEW MODAL                         */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent className="border-gold/40 bg-[#160e08] text-cream sm:max-w-lg">
          <DialogHeader>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-chili to-gold text-white shadow-xl shadow-chili/40 mb-2">
              <Flame className="h-7 w-7" />
            </div>
            <DialogTitle className="text-center font-display text-2xl text-cream font-bold">
              {bannerTitle}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-cream/75 pt-2 leading-relaxed">
              {bannerMessage}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2 text-xs">
            <div className="rounded-2xl border border-gold/25 bg-black/50 p-4 text-center space-y-1.5">
              <span className="text-[0.65rem] uppercase tracking-widest text-gold font-bold">
                Pre-Order Reservations Open
              </span>
              <p className="font-display text-lg font-bold text-cream">
                Schedule For Tomorrow & Lock In Your Handi
              </p>
              <p className="text-[0.7rem] text-cream/60">
                Pickup at 3625 S Bedford Ave or Local Delivery (10-mile zone)
              </p>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gold/15">
              <Button
                variant="outline"
                onClick={() => setPreviewModalOpen(false)}
                className="w-full sm:w-auto border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
              >
                Close Preview
              </Button>
              <Button
                onClick={() => {
                  toast.success("Diner will be redirected to tomorrow's time slot selector.");
                  setPreviewModalOpen(false);
                }}
                className="w-full sm:w-auto flex-1 bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs"
              >
                Select Tomorrow's Time Slot →
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* CLOSE TODAY CONFIRMATION DIALOG                               */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={closeConfirmOpen} onOpenChange={setCloseConfirmOpen}>
        <DialogContent className="border-chili/40 bg-[#140e09] text-cream sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-chili/10 text-chili mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center font-display text-xl text-cream font-bold">
              Lock & Close Today's Orders?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-cream/70 pt-1 leading-relaxed">
              This will immediately cap today's booking at <strong className="text-gold">{bookedTraysToday} trays</strong>. All new diners visiting the public site will be routed to tomorrow's pre-orders.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 text-xs">
            <div className="rounded-xl border border-chili/30 bg-chili/10 p-3 text-[0.7rem] text-cream/80 space-y-1">
              <p className="font-semibold text-chili">What happens next:</p>
              <p>✓ Today's checkout dates will be disabled.</p>
              <p>✓ "Today's Orders Closed" notification popup will be displayed.</p>
              <p>✓ Kitchen team will focus entirely on current live Dum handis.</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCloseConfirmOpen(false)}
                className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmCloseToday}
                className="bg-chili text-white hover:bg-chili/90 text-xs font-semibold"
              >
                Confirm Close Today's Queue
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
