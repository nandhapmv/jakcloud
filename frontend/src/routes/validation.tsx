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
    <div className="min-h-screen bg-[#fbf9f5] font-sans text-zinc-900 selection:bg-amber-500/20 selection:text-amber-900 relative overflow-hidden pb-24">
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO HEADER WITH LIVE COUNTDOWN TO 2:00 PM CUTOFF          */}
      {/* ------------------------------------------------------------- */}
      <section className="relative border-b border-zinc-200 bg-white py-12 px-4 sm:px-8 text-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-amber-800 shadow-xs">
            <Hourglass className="h-3.5 w-3.5 text-amber-600 animate-spin" />
            <span>Real-Time Dum Capacity & Booking Engine</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-zinc-900">
            Made To Order <span className="text-amber-700">Booking Validation</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
            Every royal Dum Biryani handi tray is slow-cooked from scratch over hardwood coals. We require 24-hour advance
            reservations and strictly limit production to <strong>25 Handi Trays daily</strong> to guarantee authentic taste.
          </p>

          {/* Live Springfield Cutoff Countdown Clock Card */}
          <div className="mx-auto max-w-xl rounded-3xl border border-zinc-200 bg-zinc-50/80 p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-200/80 pb-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-900">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>Daily 2:00 PM Dum Preparation Cutoff</span>
              </div>
              <span className="rounded-full bg-amber-100/70 border border-amber-300 px-2.5 py-0.5 text-[0.65rem] font-bold text-amber-900">
                Springfield, MO (CST)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-2xl bg-white border border-zinc-200 p-3 shadow-xs">
                <span className="font-display text-2xl sm:text-3xl font-bold text-zinc-900 font-mono block">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-[0.65rem] text-zinc-500 uppercase font-semibold tracking-wider">Hours</span>
              </div>
              <div className="rounded-2xl bg-white border border-zinc-200 p-3 shadow-xs">
                <span className="font-display text-2xl sm:text-3xl font-bold text-zinc-900 font-mono block">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-[0.65rem] text-zinc-500 uppercase font-semibold tracking-wider">Minutes</span>
              </div>
              <div className="rounded-2xl bg-white border border-zinc-200 p-3 shadow-xs">
                <span className="font-display text-2xl sm:text-3xl font-bold text-amber-600 font-mono block animate-pulse">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-[0.65rem] text-zinc-500 uppercase font-semibold tracking-wider">Seconds</span>
              </div>
            </div>

            <p className="text-[0.72rem] text-zinc-600 text-center font-normal">
              {timeLeft.isPassed ? (
                <span className="text-amber-800 font-semibold">
                  ⚠️ Today's 2:00 PM batch cutoff has passed. Reservations placed now will slow-cook for{" "}
                  <strong className="text-amber-900">{nextDate}</strong>.
                </span>
              ) : (
                <span className="text-emerald-700 font-semibold">
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
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
            <div>
              <span className="text-[0.65rem] font-bold uppercase tracking-widest text-amber-800">Interactive Checker</span>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-zinc-900">
                Test Booking Scenarios & Capacity Status
              </h2>
            </div>
            <p className="text-xs text-zinc-500">Simulate order eligibility rules in real-time:</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSimulatedScenario("normal");
                toast.success("Simulating Valid 24-Hour Advance Booking");
              }}
              className={`rounded-2xl p-3 text-left border transition-all text-xs font-semibold cursor-pointer ${
                simulatedScenario === "normal"
                  ? "bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm ring-1 ring-emerald-400"
                  : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                <span>1. Valid Booking</span>
              </div>
              <p className="text-[0.65rem] font-normal text-zinc-500">24h advance, capacity open</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSimulatedScenario("post_cutoff");
                toast.warning("Simulating Post-2:00 PM Cutoff Alert");
              }}
              className={`rounded-2xl p-3 text-left border transition-all text-xs font-semibold cursor-pointer ${
                simulatedScenario === "post_cutoff"
                  ? "bg-amber-50 border-amber-400 text-amber-900 shadow-sm ring-1 ring-amber-400"
                  : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-amber-700">
                <Clock className="h-4 w-4" />
                <span>2. Post 2 PM Cutoff</span>
              </div>
              <p className="text-[0.65rem] font-normal text-zinc-500">Rolls to next day batch</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSimulatedScenario("sold_out");
                setShowSoldOutModal(true);
                toast.error("Simulating 25/25 Daily Handis Sold Out");
              }}
              className={`rounded-2xl p-3 text-left border transition-all text-xs font-semibold cursor-pointer ${
                simulatedScenario === "sold_out"
                  ? "bg-rose-50 border-rose-400 text-rose-900 shadow-sm ring-1 ring-rose-400"
                  : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-rose-600">
                <XCircle className="h-4 w-4" />
                <span>3. Daily Limit Full</span>
              </div>
              <p className="text-[0.65rem] font-normal text-zinc-500">25/25 Trays Sold Out</p>
            </button>

            <button
              type="button"
              onClick={() => {
                setSimulatedScenario("wednesday");
                toast.info("Simulating Wednesday Kitchen Closure");
              }}
              className={`rounded-2xl p-3 text-left border transition-all text-xs font-semibold cursor-pointer ${
                simulatedScenario === "wednesday"
                  ? "bg-purple-50 border-purple-400 text-purple-900 shadow-sm ring-1 ring-purple-400"
                  : "bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100"
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-purple-700">
                <Calendar className="h-4 w-4" />
                <span>4. Wednesday Closed</span>
              </div>
              <p className="text-[0.65rem] font-normal text-zinc-500">Spice prep & rest day</p>
            </button>
          </div>

          {/* Dynamic Result Card with Luxury Styling */}
          <div
            className={`rounded-3xl p-6 sm:p-8 border transition-all relative overflow-hidden ${
              validationResult.type === "success"
                ? "bg-emerald-50/70 border-emerald-300 shadow-sm"
                : validationResult.type === "warning"
                  ? "bg-amber-50/70 border-amber-300 shadow-sm"
                  : "bg-rose-50/70 border-rose-300 shadow-sm"
            }`}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-semibold tracking-wider uppercase border border-current shadow-2xs">
                  {validationResult.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                  {validationResult.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                  {validationResult.type === "danger" && <XCircle className="h-4 w-4 text-rose-600" />}
                  <span
                    className={
                      validationResult.type === "success"
                        ? "text-emerald-800"
                        : validationResult.type === "warning"
                          ? "text-amber-800"
                          : "text-rose-800"
                    }
                  >
                    {validationResult.badge}
                  </span>
                </div>

                <h3 className="font-display text-2xl sm:text-3xl font-bold text-zinc-900">
                  {validationResult.title}
                </h3>

                <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-normal">
                  {validationResult.description}
                </p>

                <div className="rounded-2xl bg-white border border-zinc-200 p-3.5 text-xs text-zinc-700 flex items-center gap-2.5 shadow-2xs">
                  <Info className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>{validationResult.recommendation}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-auto">
                <Button
                  asChild
                  size="lg"
                  className="rounded-2xl font-bold text-xs sm:text-sm px-6 py-6 shadow-md transition-all gap-2 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 hover:brightness-105 cursor-pointer"
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
                    className="rounded-2xl border-zinc-300 text-zinc-800 hover:bg-zinc-100 text-xs font-semibold px-5 py-5 gap-1.5"
                  >
                    <Bell className="h-4 w-4" /> View Sold Out Capacity Modal
                  </Button>
                )}

                <a
                  href={whatsappWaitlistUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-5 py-3 text-xs font-semibold text-emerald-800 transition-all shadow-xs text-center"
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
            <span className="text-[0.68rem] font-bold uppercase tracking-widest text-amber-800">Production Limits</span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-zinc-900">
              Why We Cap Production at 25 Handi Trays Daily
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-normal">
              True Dum Biryani cannot be mass-produced in factory kettles or warmed under heat lamps. Master Chef
              Kartheek hand-tends each heavy brass Handi pot individually over glowing wood embers.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-2xl bg-white border border-zinc-200 p-3.5 text-xs shadow-xs">
                <Shield className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-900">100% Zabiha Halal Certified Proteins</p>
                  <p className="text-[0.68rem] text-zinc-500">Strictly separate pots, spoons, and cooking vessels for each meat type.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white border border-zinc-200 p-3.5 text-xs shadow-xs">
                <Flame className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-900">Pure Desi Ghee & Saffron Milk Seal</p>
                  <p className="text-[0.68rem] text-zinc-500">Layered with 2-year aged Extra-Long Basmati rice that expands to 24mm.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Progress Gauge Card */}
          <div className="lg:col-span-6 rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[0.65rem] font-semibold uppercase tracking-widest text-amber-800">Capacity Radar</span>
                <h3 className="font-display text-xl font-bold text-zinc-900">Today's Batch Availability</h3>
              </div>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 font-mono text-xs font-semibold text-amber-800">
                {currentCapacity.booked} / {currentCapacity.total} Booked
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-zinc-800">
                <span>Production Load</span>
                <span className="text-amber-800 font-mono">
                  {Math.round((currentCapacity.booked / currentCapacity.total) * 100)}% Capacity
                </span>
              </div>
              <div className="h-4 w-full rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden p-0.5">
                <div
                  style={{ width: `${(currentCapacity.booked / currentCapacity.total) * 100}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500 shadow-xs"
                />
              </div>
            </div>

            {/* Quick Status Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3">
                <span className="font-display text-lg font-bold text-zinc-900 block">{currentCapacity.total}</span>
                <span className="text-[0.62rem] text-zinc-500 uppercase font-semibold">Max Limit</span>
              </div>
              <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-3">
                <span className="font-display text-lg font-bold text-amber-700 block">{currentCapacity.booked}</span>
                <span className="text-[0.62rem] text-zinc-500 uppercase font-semibold">Reserved</span>
              </div>
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3">
                <span className="font-display text-lg font-bold text-emerald-700 block">{currentCapacity.remaining}</span>
                <span className="text-[0.62rem] text-emerald-800 uppercase font-semibold">Open Slots</span>
              </div>
            </div>

            <div className="pt-2">
              <Button
                asChild
                className="w-full rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs py-5 shadow-sm hover:brightness-105 transition-all cursor-pointer"
              >
                <Link to="/menu">Reserve Your Handi Tray Before Cutoff →</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 4. FOUR-STAGE SLOW DUM COOKING TIMELINE                       */}
        {/* ------------------------------------------------------------- */}
        <section className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest text-amber-800 font-bold">The Royal Craft</span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-zinc-900">
              Why 24-Hour Notice is Non-Negotiable
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-normal">
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
                  className="rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5 space-y-3 hover:border-amber-300 hover:bg-zinc-50 transition-colors flex flex-col justify-between group shadow-2xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-700">{stage.step}</span>
                      <div className="h-9 w-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 group-hover:bg-amber-500 group-hover:text-zinc-950 transition-colors">
                        <IconComp className="h-4 w-4" />
                      </div>
                    </div>
                    <h3 className="font-display text-base font-bold text-zinc-900">{stage.title}</h3>
                    <span className="text-[0.65rem] font-semibold text-amber-800 block">{stage.timing}</span>
                    <p className="text-[0.7rem] text-zinc-600 leading-relaxed font-normal">{stage.description}</p>
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
          <DialogContent className="border border-zinc-200 bg-white text-zinc-900 max-w-lg p-6 sm:p-8 rounded-3xl shadow-2xl">
            <DialogHeader className="space-y-3 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 border border-rose-200 text-rose-600 shadow-sm">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <DialogTitle className="font-display text-2xl font-bold text-zinc-900">
                Daily Capacity Reached (25/25 Trays Booked)
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-600 leading-relaxed font-normal">
                All 25 handcrafted Dum Biryani Handi trays for today's batch have been reserved by Springfield patrons.
                Master Chef Kartheek has sealed all clay pots on wood coals.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="rounded-2xl bg-zinc-50 border border-zinc-200 p-4 text-xs space-y-2">
                <p className="font-bold text-amber-900 uppercase tracking-wider text-[0.68rem]">
                  Tomorrow's Batch Status ({nextDate}):
                </p>
                <div className="flex items-center justify-between text-zinc-700">
                  <span>Open Slots for Tomorrow:</span>
                  <span className="font-bold text-emerald-700">18 Slots Available</span>
                </div>
                <div className="flex items-center justify-between text-zinc-700">
                  <span>Tomorrow's Cutoff:</span>
                  <span className="text-amber-800 font-mono font-medium">2:00 PM CST</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button
                  asChild
                  className="rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs py-5 shadow-sm hover:brightness-105"
                  onClick={() => setShowSoldOutModal(false)}
                >
                  <Link to="/menu">Reserve for {nextDate} →</Link>
                </Button>

                <a
                  href={whatsappWaitlistUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setShowSoldOutModal(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 px-4 py-3 text-xs font-semibold text-emerald-800 transition-all text-center"
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
