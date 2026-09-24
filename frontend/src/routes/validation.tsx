import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  Clock,
  Shield,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  Flame,
  ArrowRight,
  Store,
  Truck,
  Phone,
  MessageSquare,
  UtensilsCrossed,
  Hourglass,
  Users,
  Info,
  Layers,
  ChevronRight,
  RefreshCw,
  Bell,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import heroImg from "@/assets/hero-biryani.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BUSINESS,
  ORDER_CUTOFF_HOUR,
  CLOSED_WEEKDAY,
  formatDate,
  nextAvailableDate,
} from "@/lib/menu";
import { useKitchenSettings, useDynamicOrders } from "@/lib/store";

export const Route = createFileRoute("/validation")({
  head: () => ({
    meta: [
      { title: "Booking Validation & Daily Dum Capacity — JAKLOUD Spice King Dum Biryani" },
      {
        name: "description",
        content:
          "Check real-time Dum Biryani Handi booking eligibility, 24-hour advance preparation requirements, today's 2:00 PM cutoff status, and daily 25-tray limit availability in Springfield, MO.",
      },
      { property: "og:title", content: "Booking Validation — JAKLOUD Dum Biryani" },
      {
        property: "og:description",
        content: "Real-time 24-hour advance booking verification and 25-handi capacity radar.",
      },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: BookingValidationPage,
});

const DUM_PREPARATION_STAGES = [
  {
    step: "01",
    title: "18-Hour Royal Marination",
    timing: "Day Before (2:00 PM Cutoff)",
    description:
      "Tender meat cuts are infused with roasted whole masalas, Kashmiri chili, saffron milk, and farm-fresh ginger-garlic in desi dahi.",
    icon: Flame,
  },
  {
    step: "02",
    title: "6:00 AM Charcoal Hearth Ignition",
    timing: "Morning of Fulfilment (6:00 AM)",
    description:
      "Natural hardwood coal embers are ignited to establish a steady, gentle glowing heat bed for unhurried Dum Pukht steaming.",
    icon: Hourglass,
  },
  {
    step: "03",
    title: "Sealed Dough Dum Steaming",
    timing: "Morning Batch (7:00 – 10:30 AM)",
    description:
      "Aged long-grain basmati is layered over spiced meat, sealed airtight with fresh flour dough, trapping every aromatic saffron vapor.",
    icon: Sparkles,
  },
  {
    step: "04",
    title: "Thermal Carrier Dispatch",
    timing: "Fulfilment (11:00 AM – 6:00 PM)",
    description:
      "Freshly unsealed handi trays are packed into heavy-gauge thermal insulated bags for piping hot delivery and pickup.",
    icon: Truck,
  },
];

export function BookingValidationPage() {
  const nextDate = formatDate(nextAvailableDate());

  // Real-time Countdown to 2:00 PM (14:00) Springfield Time
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isPassed: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPassed: false,
  });

  // Dynamic Reactive Settings & Orders Hook
  const { settings } = useKitchenSettings();
  const { stats } = useDynamicOrders();

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const cutoff = new Date();
      cutoff.setHours(settings.orderCutoffHour, 0, 0, 0);

      if (now.getTime() >= cutoff.getTime()) {
        // Cutoff passed for today
        const tomorrowCutoff = new Date(cutoff);
        tomorrowCutoff.setDate(tomorrowCutoff.getDate() + 1);
        const diff = tomorrowCutoff.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isPassed: true });
      } else {
        const diff = cutoff.getTime() - now.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isPassed: false });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, [settings.orderCutoffHour]);

  // Simulator State
  const [simulatedDate, setSimulatedDate] = useState(() => {
    const d = nextAvailableDate();
    return d.toISOString().split("T")[0];
  });
  const [simulatedHour, setSimulatedHour] = useState(11); // 11 AM
  const [simulatedTrays, setSimulatedTrays] = useState(2);
  const [simulatedScenario, setSimulatedScenario] = useState<"normal" | "post_cutoff" | "sold_out" | "wednesday">("normal");
  const [showSoldOutModal, setShowSoldOutModal] = useState(false);

  // Active Capacity
  const currentCapacity = useMemo(() => {
    const max = settings.dailyTrayLimit || 25;
    if (simulatedScenario === "sold_out" || !settings.isKitchenOpen) return { booked: max, total: max, remaining: 0 };
    if (simulatedScenario === "post_cutoff") return { booked: max - 2, total: max, remaining: 2 };
    if (simulatedScenario === "wednesday") return { booked: 0, total: max, remaining: 0 };
    const booked = Math.min(max, stats.todayTraysBooked || 19);
    return { booked, total: max, remaining: Math.max(0, max - booked) };
  }, [simulatedScenario, settings.dailyTrayLimit, settings.isKitchenOpen, stats.todayTraysBooked]);

  // Validation Logic based on Simulator
  const validationResult = useMemo(() => {
    if (simulatedScenario === "sold_out") {
      return {
        status: "sold_out",
        title: "Daily Capacity Limit Reached (25/25 Trays Booked)",
        badge: "SOLD OUT FOR SELECTED BATCH",
        type: "danger" as const,
        description:
          "Master Chef Kartheek has reached the maximum daily limit of 25 Handi Trays to preserve uncompromising coal-dum cooking quality.",
        recommendation: `Next available open batch is scheduled for ${nextDate}. Reserve your handi now before next slots fill!`,
        actionText: "Reserve for Next Available Batch",
        actionTo: "/menu",
      };
    }

    if (simulatedScenario === "wednesday") {
      return {
        status: "closed_day",
        title: "Wednesday Dum Prep & Wood-Fire Rest Day",
        badge: "KITCHEN CLOSED ON WEDNESDAYS",
        type: "warning" as const,
        description:
          "Every Wednesday, our kitchen closes public fulfillment to roast and hand-pound whole spices, cure fresh proteins, and prepare slow marinades.",
        recommendation: "Select Thursday or Friday for steaming hot pickup or delivery.",
        actionText: "Select Next Available Thursday",
        actionTo: "/menu",
      };
    }

    if (simulatedScenario === "post_cutoff") {
      return {
        status: "post_cutoff",
        title: "Today's 2:00 PM Dum Cutoff Has Passed",
        badge: "2:00 PM BATCH CUTOFF PASSED",
        type: "warning" as const,
        description:
          "Today's slow-cooking clay pots are already sealed on wood coals and cannot accept additional modifications or late same-day additions.",
        recommendation: `Your booking will automatically be scheduled for ${nextDate}.`,
        actionText: "Continue Booking for Next Day",
        actionTo: "/checkout",
      };
    }

    return {
      status: "eligible",
      title: "Booking Verified & Eligible for Handi Dum Prep",
      badge: "✓ 24-HOUR ADVANCE RESERVATION CONFIRMED",
      type: "success" as const,
      description:
        `Your reservation meets the 24-hour slow-cooking notice. ${currentCapacity.remaining} Handi Trays remain available in this fresh batch.`,
      recommendation: "Proceed directly to select your proteins, tray sizes, or complete checkout.",
      actionText: "Proceed to Handi Menu & Reserve",
      actionTo: "/menu",
    };
  }, [simulatedScenario, currentCapacity, nextDate]);

  const whatsappWaitlistUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    `Hello Master Chef Kartheek! I am requesting priority waitlist access for the next available Dum Biryani Handi batch (${nextDate}).`,
  )}`;

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold relative overflow-hidden pb-24">
      {/* Background Ambience Flares */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-gold/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-chili/10 blur-[140px] pointer-events-none" />

      {/* ------------------------------------------------------------- */}
      {/* 1. HERO HEADER WITH LIVE COUNTDOWN TO 2:00 PM CUTOFF          */}
      {/* ------------------------------------------------------------- */}
      <section className="relative border-b border-gold/20 bg-gradient-to-r from-[#180f0a] via-[#24150d] to-[#180f0a] py-12 px-4 sm:px-8 text-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/60 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-gold shadow-[0_0_20px_rgba(212,160,23,0.3)]">
            <Hourglass className="h-3.5 w-3.5 text-gold animate-spin" />
            <span>Real-Time Dum Capacity & Booking Engine</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-wide text-cream">
            Made To Order <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">Booking Validation</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-cream/80 leading-relaxed">
            Every royal Dum Biryani handi tray is slow-cooked from scratch over hardwood coals. We require 24-hour advance
            reservations and strictly limit production to <strong>25 Handi Trays daily</strong> to guarantee authentic taste.
          </p>

          {/* Live Springfield Cutoff Countdown Clock Card */}
          <div className="mx-auto max-w-xl rounded-3xl border-2 border-gold/40 bg-black/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gold/20 pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cream">
                <Clock className="h-4 w-4 text-gold" />
                <span>Daily 2:00 PM Dum Preparation Cutoff</span>
              </div>
              <span className="rounded-full bg-gold/15 border border-gold/30 px-2.5 py-0.5 text-[0.65rem] font-bold text-gold">
                Springfield, MO (CST)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-[#140e09] border border-gold/25 p-3">
                <span className="font-display text-2xl sm:text-3xl font-bold text-gold font-mono block">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[0.65rem] text-cream/60 uppercase font-bold tracking-wider">Hours</span>
              </div>
              <div className="rounded-2xl bg-[#140e09] border border-gold/25 p-3">
                <span className="font-display text-2xl sm:text-3xl font-bold text-gold font-mono block">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[0.65rem] text-cream/60 uppercase font-bold tracking-wider">Minutes</span>
              </div>
              <div className="rounded-2xl bg-[#140e09] border border-gold/25 p-3">
                <span className="font-display text-2xl sm:text-3xl font-bold text-saffron font-mono block animate-pulse">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[0.65rem] text-cream/60 uppercase font-bold tracking-wider">Seconds</span>
              </div>
            </div>

            <p className="text-[0.72rem] text-cream/70 text-center">
              {timeLeft.isPassed ? (
                <span className="text-saffron font-semibold">
                  ⚠️ Today's 2:00 PM batch cutoff has passed. Reservations placed now will slow-cook for{" "}
                  <strong className="text-gold">{nextDate}</strong>.
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold">
                  ✓ Order within the next {timeLeft.hours}h {timeLeft.minutes}m to reserve for tomorrow's morning dum batch!
                </span>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. DYNAMIC VALIDATION & ELIGIBILITY SIMULATOR HUB              */}
      {/* ------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-12 space-y-12">
        {/* Interactive Scenario Tester Buttons */}
        <section className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/15 pb-4">
            <div>
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gold">Interactive Checker</span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-cream">
                Test Booking Scenarios & Capacity Status
              </h2>
            </div>
            <p className="text-xs text-cream/60">Simulate order eligibility rules in real-time:</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSimulatedScenario("normal");
                toast.success("Simulating Valid 24-Hour Advance Booking");
              }}
              className={`rounded-2xl p-3 text-left border transition-all text-xs font-bold ${
                simulatedScenario === "normal"
                  ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md ring-1 ring-emerald-500"
                  : "bg-black/50 border-gold/20 text-cream/70 hover:bg-black/80"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                <span>1. Valid Booking</span>
              </div>
              <p className="text-[0.65rem] font-normal text-cream/60">24h advance, capacity open</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSimulatedScenario("post_cutoff");
                toast.warning("Simulating Post-2:00 PM Cutoff Alert");
              }}
              className={`rounded-2xl p-3 text-left border transition-all text-xs font-bold ${
                simulatedScenario === "post_cutoff"
                  ? "bg-amber-950/70 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500"
                  : "bg-black/50 border-gold/20 text-cream/70 hover:bg-black/80"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-amber-400">
                <Clock className="h-4 w-4" />
                <span>2. Post 2 PM Cutoff</span>
              </div>
              <p className="text-[0.65rem] font-normal text-cream/60">Rolls to next day batch</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSimulatedScenario("sold_out");
                setShowSoldOutModal(true);
                toast.error("Simulating 25/25 Daily Handis Sold Out");
              }}
              className={`rounded-2xl p-3 text-left border transition-all text-xs font-bold ${
                simulatedScenario === "sold_out"
                  ? "bg-red-950/70 border-red-500 text-red-300 shadow-md ring-1 ring-red-500"
                  : "bg-black/50 border-gold/20 text-cream/70 hover:bg-black/80"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-red-400">
                <XCircle className="h-4 w-4" />
                <span>3. Daily Limit Full</span>
              </div>
              <p className="text-[0.65rem] font-normal text-cream/60">25/25 Trays Sold Out</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSimulatedScenario("wednesday");
                toast.info("Simulating Wednesday Kitchen Closure");
              }}
              className={`rounded-2xl p-3 text-left border transition-all text-xs font-bold ${
                simulatedScenario === "wednesday"
                  ? "bg-purple-950/70 border-purple-500 text-purple-300 shadow-md ring-1 ring-purple-500"
                  : "bg-black/50 border-gold/20 text-cream/70 hover:bg-black/80"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-purple-400">
                <Calendar className="h-4 w-4" />
                <span>4. Wednesday Closed</span>
              </div>
              <p className="text-[0.65rem] font-normal text-cream/60">Spice prep & rest day</p>
            </button>
          </div>

          {/* Dynamic Result Card with Luxury Styling */}
          <div
            className={`rounded-3xl p-6 sm:p-8 border transition-all relative overflow-hidden ${
              validationResult.type === "success"
                ? "bg-gradient-to-b from-[#142616] via-[#0d1c10] to-[#080503] border-emerald-500/60 shadow-[0_0_40px_rgba(16,185,129,0.25)]"
                : validationResult.type === "warning"
                  ? "bg-gradient-to-b from-[#2a1a08] via-[#1a1105] to-[#080503] border-gold/60 shadow-[0_0_40px_rgba(212,175,55,0.25)]"
                  : "bg-gradient-to-b from-[#2b0e0c] via-[#1c0807] to-[#080503] border-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.25)]"
            }`}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1 text-xs font-bold tracking-wider uppercase border border-current">
                  {validationResult.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                  {validationResult.type === "warning" && <AlertTriangle className="h-4 w-4 text-gold" />}
                  {validationResult.type === "danger" && <XCircle className="h-4 w-4 text-red-400" />}
                  <span
                    className={
                      validationResult.type === "success"
                        ? "text-emerald-400"
                        : validationResult.type === "warning"
                          ? "text-gold"
                          : "text-red-400"
                    }
                  >
                    {validationResult.badge}
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream">
                  {validationResult.title}
                </h3>

                <p className="text-xs sm:text-sm text-cream/85 leading-relaxed">
                  {validationResult.description}
                </p>

                <div className="rounded-2xl bg-black/50 border border-gold/20 p-3.5 text-xs text-cream/90 flex items-center gap-2.5">
                  <Info className="h-4 w-4 text-gold shrink-0" />
                  <span>{validationResult.recommendation}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-auto">
                <Button
                  asChild
                  size="lg"
                  className={`rounded-2xl font-bold text-xs sm:text-sm px-6 py-6 shadow-xl hover:scale-105 transition-all gap-2 text-white ${
                    validationResult.type === "danger"
                      ? "bg-gradient-to-r from-red-600 to-amber-600"
                      : "bg-gradient-to-r from-chili via-saffron to-gold"
                  }`}
                >
                  <Link to={validationResult.actionTo}>
                    <UtensilsCrossed className="h-4 w-4" />
                    <span>{validationResult.actionText} →</span>
                  </Link>
                </Button>

                {validationResult.type === "danger" && (
                  <Button
                    type="button"
                    onClick={() => setShowSoldOutModal(true)}
                    variant="outline"
                    className="rounded-2xl border-gold/40 text-gold hover:bg-gold/15 text-xs font-bold px-5 py-5 gap-1.5"
                  >
                    <Bell className="h-4 w-4" /> View Sold Out Capacity Modal
                  </Button>
                )}

                <a
                  href={whatsappWaitlistUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/80 px-5 py-3 text-xs font-bold text-emerald-400 transition-all shadow-md text-center"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp Priority Waitlist</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 3. DAILY 25-HANDI CAPACITY RADAR & LIVE GAUGE                 */}
        {/* ------------------------------------------------------------- */}
        <section className="grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <span className="text-[0.68rem] font-bold uppercase tracking-widest text-gold">Production Limits</span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-cream">
              Why We Cap Production at 25 Handi Trays Daily
            </h2>
            <p className="text-xs sm:text-sm text-cream/75 leading-relaxed">
              True Dum Biryani cannot be mass-produced in factory kettles or warmed under heat lamps. Master Chef
              Kartheek hand-tends each heavy brass Handi pot individually over glowing wood embers.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-2xl bg-black/40 border border-gold/20 p-3.5 text-xs">
                <Shield className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-cream">100% Zabiha Halal Certified Proteins</p>
                  <p className="text-[0.68rem] text-cream/60">Strictly separate pots, spoons, and cooking vessels for each meat type.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-black/40 border border-gold/20 p-3.5 text-xs">
                <Flame className="h-5 w-5 text-chili shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-cream">Pure Desi Ghee & Saffron Milk Seal</p>
                  <p className="text-[0.68rem] text-cream/60">Layered with 2-year aged Extra-Long Basmati rice that expands to 24mm.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Progress Gauge Card */}
          <div className="lg:col-span-6 rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-[#18100a] via-[#120c08] to-[#0a0705] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gold/20 pb-4">
              <div>
                <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gold">Capacity Radar</span>
                <h3 className="font-display text-xl font-bold text-cream">Today's Batch Availability</h3>
              </div>
              <span className="rounded-full bg-gold/15 border border-gold/30 px-3 py-1 font-mono text-xs font-bold text-gold">
                {currentCapacity.booked} / {currentCapacity.total} Booked
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-cream">
                <span>Production Load</span>
                <span className="text-gold font-mono">
                  {Math.round((currentCapacity.booked / currentCapacity.total) * 100)}% Capacity
                </span>
              </div>
              <div className="h-4 w-full rounded-full bg-black/80 border border-gold/30 overflow-hidden p-0.5">
                <div
                  style={{ width: `${(currentCapacity.booked / currentCapacity.total) * 100}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-chili via-saffron to-gold transition-all duration-500 shadow-[0_0_15px_rgba(212,160,23,0.8)]"
                />
              </div>
            </div>

            {/* Quick Status Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-2xl bg-black/60 border border-gold/20 p-3">
                <span className="font-display text-lg font-bold text-cream block">{currentCapacity.total}</span>
                <span className="text-[0.62rem] text-cream/50 uppercase font-bold">Max Limit</span>
              </div>
              <div className="rounded-2xl bg-black/60 border border-gold/20 p-3">
                <span className="font-display text-lg font-bold text-saffron block">{currentCapacity.booked}</span>
                <span className="text-[0.62rem] text-cream/50 uppercase font-bold">Reserved</span>
              </div>
              <div className="rounded-2xl bg-black/60 border border-emerald-500/30 p-3">
                <span className="font-display text-lg font-bold text-emerald-400 block">{currentCapacity.remaining}</span>
                <span className="text-[0.62rem] text-emerald-300/70 uppercase font-bold">Open Slots</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                asChild
                className="w-full rounded-2xl bg-gradient-to-r from-chili to-gold text-white font-bold text-xs py-5 shadow-lg hover:scale-105 transition-all"
              >
                <Link to="/menu">Reserve Your Handi Tray Before Cutoff →</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 4. FOUR-STAGE SLOW DUM COOKING TIMELINE                       */}
        {/* ------------------------------------------------------------- */}
        <section className="rounded-3xl border border-gold/25 bg-[#120c08]/95 p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">The Royal Craft</span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-cream">
              Why 24-Hour Notice is Non-Negotiable
            </h2>
            <p className="text-xs sm:text-sm text-cream/70">
              Unlike ordinary restaurants that reheat pre-boiled rice and frozen curries, our slow-cooked handi trays
              follow centuries-old Nizami Dum Pukht traditions.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {DUM_PREPARATION_STAGES.map((stage) => {
              const IconComp = stage.icon;
              return (
                <div
                  key={stage.step}
                  className="rounded-2xl border border-gold/20 bg-black/50 p-5 space-y-3 hover:border-gold/50 transition-colors flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-gold/60">{stage.step}</span>
                      <div className="h-9 w-9 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold group-hover:bg-gold group-hover:text-black transition-colors">
                        <IconComp className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className="font-display text-base font-bold text-cream">{stage.title}</h3>
                    <span className="text-[0.65rem] font-semibold text-gold block">{stage.timing}</span>
                    <p className="text-[0.7rem] text-cream/70 leading-relaxed">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 5. POPUP / MODAL: DAILY ORDER LIMIT SOLD OUT ALERT            */}
        {/* ------------------------------------------------------------- */}
        <Dialog open={showSoldOutModal} onOpenChange={setShowSoldOutModal}>
          <DialogContent className="border-2 border-gold/50 bg-gradient-to-b from-[#1c120a] via-[#140c07] to-[#0a0705] text-cream max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl">
            <DialogHeader className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-950/80 border-2 border-red-500/80 text-red-400 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <DialogTitle className="font-display text-2xl font-bold text-cream">
                Daily Capacity Reached (25/25 Trays Booked)
              </DialogTitle>
              <DialogDescription className="text-xs text-cream/75 leading-relaxed">
                All 25 handcrafted Dum Biryani Handi trays for today's batch have been reserved by Springfield patrons.
                Master Chef Kartheek has sealed all clay pots on wood coals.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="rounded-2xl bg-black/60 border border-gold/25 p-4 text-xs space-y-2">
                <p className="font-bold text-gold uppercase tracking-wider text-[0.68rem]">
                  Tomorrow's Batch Status ({nextDate}):
                </p>
                <div className="flex items-center justify-between text-cream">
                  <span>Open Slots for Tomorrow:</span>
                  <span className="font-bold text-emerald-400">18 Slots Available</span>
                </div>
                <div className="flex items-center justify-between text-cream">
                  <span>Tomorrow's Cutoff:</span>
                  <span className="text-gold font-mono">2:00 PM CST</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  asChild
                  className="rounded-2xl bg-gradient-to-r from-chili to-gold text-white font-bold text-xs py-5 shadow-lg"
                  onClick={() => setShowSoldOutModal(false)}
                >
                  <Link to="/menu">Reserve for {nextDate} →</Link>
                </Button>

                <a
                  href={whatsappWaitlistUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowSoldOutModal(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/80 px-4 py-3 text-xs font-bold text-emerald-400 transition-all text-center"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Join VIP WhatsApp Waitlist</span>
                </a>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
