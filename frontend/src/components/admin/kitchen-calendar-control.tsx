import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Ban,
  Save,
  Sparkles,
  Info,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useKitchenSettings, useDynamicOrders, normalizeDateKey } from "@/lib/store";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function KitchenCalendarControl() {
  const { settings, updateSettings } = useKitchenSettings();
  const { orders } = useDynamicOrders();

  // Local state initialized from persistent settings
  const [autoRoll, setAutoRoll] = useState(() => settings.isKitchenOpen ?? true);
  const [cutoffHour, setCutoffHour] = useState(() => settings.orderCutoffHour || 15);
  const [capacityLimit, setCapacityLimit] = useState(() => settings.dailyTrayLimit || 10);
  const [horizonDays, setHorizonDays] = useState(() => settings.bookingHorizonDays || 7);
  const [blockedDates, setBlockedDates] = useState<string[]>(() =>
    Array.isArray(settings.blockedDates) ? [...settings.blockedDates] : []
  );
  const [isSaving, setIsSaving] = useState(false);

  // Calendar month view (starts from today's month, never allows past months)
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());

  const isCurrentMonthView =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();

  const handlePrevMonth = () => {
    if (isCurrentMonthView) return; // Prevent going to past months
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Toggle date blocked state
  const handleToggleBlockDate = (dateKey: string) => {
    setBlockedDates((prev) => {
      const exists = prev.includes(dateKey);
      const next = exists ? prev.filter((d) => d !== dateKey) : [...prev, dateKey].sort();
      if (exists) {
        toast.info(`Date ${dateKey} unblocked (open for customer booking). Click "Save Settings" to confirm.`);
      } else {
        toast.warning(`Date ${dateKey} marked as BLOCKED (customers cannot book). Click "Save Settings" to confirm.`);
      }
      return next;
    });
  };

  const handleUnblockDate = (dateKey: string) => {
    setBlockedDates((prev) => prev.filter((d) => d !== dateKey));
    toast.info(`Unblocked ${dateKey}.`);
  };

  // Save all settings including blocked dates
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const updates = {
        isKitchenOpen: autoRoll,
        orderCutoffHour: cutoffHour,
        dailyTrayLimit: capacityLimit,
        bookingHorizonDays: horizonDays,
        blockedDates,
      };

      updateSettings(updates);
      toast.success(
        `Kitchen settings & ${blockedDates.length} blocked date(s) saved successfully! Live for all customer orders.`,
        { duration: 4000 }
      );
    } catch (err: any) {
      toast.error(err?.message || "Failed to save kitchen settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // Generate calendar days for current view
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const maxHorizonDate = new Date(today);
    maxHorizonDate.setDate(maxHorizonDate.getDate() + horizonDays);

    const cells: {
      day: number;
      month: number;
      year: number;
      dateKey: string;
      isCurrentMonth: boolean;
      isPast: boolean;
      isToday: boolean;
      isTomorrow: boolean;
      isInHorizon: boolean;
      isBlocked: boolean;
      bookedCount: number;
      limit: number;
    }[] = [];

    // Prev month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const m = viewMonth === 0 ? 11 : viewMonth - 1;
      const y = viewMonth === 0 ? viewYear - 1 : viewYear;
      const dateKey = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const cellDate = new Date(y, m, d, 0, 0, 0, 0);

      cells.push({
        day: d,
        month: m,
        year: y,
        dateKey,
        isCurrentMonth: false,
        isPast: cellDate < today,
        isToday: cellDate.getTime() === today.getTime(),
        isTomorrow: cellDate.getTime() === today.getTime() + 86400000,
        isInHorizon: cellDate >= today && cellDate <= maxHorizonDate,
        isBlocked: blockedDates.includes(dateKey),
        bookedCount: 0,
        limit: capacityLimit,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const cellDate = new Date(viewYear, viewMonth, d, 0, 0, 0, 0);

      // Count booked orders from orders state
      const matchingOrders = orders.filter((o) => {
        if (o.status === "cancelled") return false;
        return normalizeDateKey(o.fulfilmentDate) === dateKey;
      });
      const bookedCount = matchingOrders.reduce((sum, o) => {
        const trays = Array.isArray(o.items) && o.items.length > 0
          ? o.items.reduce((acc, item) => acc + (Number(item.qty) || 1), 0)
          : 1;
        return sum + trays;
      }, 0);

      cells.push({
        day: d,
        month: viewMonth,
        year: viewYear,
        dateKey,
        isCurrentMonth: true,
        isPast: cellDate < today,
        isToday: cellDate.getTime() === today.getTime(),
        isTomorrow: cellDate.getTime() === today.getTime() + 86400000,
        isInHorizon: cellDate >= today && cellDate <= maxHorizonDate,
        isBlocked: blockedDates.includes(dateKey),
        bookedCount,
        limit: capacityLimit,
      });
    }

    // Next month padding to complete 35 or 42 cells
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      const m = viewMonth === 11 ? 0 : viewMonth + 1;
      const y = viewMonth === 11 ? viewYear + 1 : viewYear;
      const dateKey = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const cellDate = new Date(y, m, d, 0, 0, 0, 0);

      cells.push({
        day: d,
        month: m,
        year: y,
        dateKey,
        isCurrentMonth: false,
        isPast: cellDate < today,
        isToday: cellDate.getTime() === today.getTime(),
        isTomorrow: cellDate.getTime() === today.getTime() + 86400000,
        isInHorizon: cellDate >= today && cellDate <= maxHorizonDate,
        isBlocked: blockedDates.includes(dateKey),
        bookedCount: 0,
        limit: capacityLimit,
      });
    }

    return cells;
  }, [viewYear, viewMonth, today, horizonDays, blockedDates, orders, capacityLimit]);

  return (
    <div className="rounded-3xl border border-gold/30 bg-[#120c08]/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-5 text-cream">
      {/* 1. Header with Automation Switch & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gold/15 pb-4">
        <div>
          <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-gold" /> Slot Booking Horizon & Date Blocker
          </h3>
          <p className="text-xs text-cream/70 font-normal mt-0.5">
            Manage advance booking windows, cutoff timing, and 1-click block specific holiday/closed dates
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center bg-black/40 border border-gold/20 px-3 py-1.5 rounded-2xl">
          <span className="text-xs text-cream/80 font-medium">Auto-Rollover</span>
          <Switch
            id="kitchen-calendar-autoroll"
            checked={autoRoll}
            onCheckedChange={setAutoRoll}
            className="data-[state=checked]:bg-gold"
          />
        </div>
      </div>

      {/* 2. Top Controls: Cutoff Time & Daily Tray Limit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="rounded-2xl border border-gold/20 bg-black/50 p-3.5 space-y-1">
          <Label htmlFor="kc-cutoff-hour" className="text-xs text-gold font-semibold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-gold" /> Daily Order Cutoff Hour:
          </Label>
          <select
            id="kc-cutoff-hour"
            value={cutoffHour}
            onChange={(e) => setCutoffHour(parseInt(e.target.value, 10))}
            className="w-full h-8 rounded-xl border border-gold/25 bg-black/80 px-2.5 text-xs text-cream focus:outline-none cursor-pointer font-mono"
          >
            <option value={9}>9:00 AM (Early Morning Cutoff)</option>
            <option value={10}>10:00 AM</option>
            <option value={11}>11:00 AM</option>
            <option value={12}>12:00 PM (Noon Cutoff)</option>
            <option value={13}>1:00 PM</option>
            <option value={14}>2:00 PM (2:00 PM Cutoff)</option>
            <option value={15}>3:00 PM (Standard 3:00 PM Cutoff)</option>
            <option value={16}>4:00 PM</option>
            <option value={17}>5:00 PM</option>
            <option value={18}>6:00 PM (Evening Cutoff)</option>
            <option value={20}>8:00 PM</option>
            <option value={22}>10:00 PM</option>
          </select>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-black/50 p-3.5 space-y-1">
          <Label htmlFor="kc-capacity-limit" className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Daily Handi Tray Capacity:
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="kc-capacity-limit"
              type="number"
              min={1}
              max={100}
              value={capacityLimit}
              onChange={(e) => setCapacityLimit(parseInt(e.target.value, 10) || 10)}
              className="h-8 rounded-xl border-gold/25 bg-black/80 text-xs font-mono font-bold text-cream"
            />
            <span className="text-xs text-cream/60 shrink-0">trays/day</span>
          </div>
        </div>
      </div>

      {/* 3. Horizon Days Stepper & Quick Presets */}
      <div className="rounded-2xl border border-gold/25 bg-black/40 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-gold font-bold flex items-center gap-1.5">
            <CalendarIcon className="h-4 w-4 text-gold" /> Advance Slot Booking Horizon (Days):
          </Label>
          <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-md">
            {horizonDays} Days Open
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHorizonDays((prev) => Math.max(1, prev - 1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-black/70 text-gold hover:bg-gold/20 text-base font-bold transition-colors cursor-pointer"
            title="Decrease 1 day"
          >
            -
          </button>
          <Input
            type="number"
            min={1}
            max={60}
            value={horizonDays}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setHorizonDays(isNaN(val) ? 7 : Math.max(1, Math.min(60, val)));
            }}
            className="h-9 text-center font-display text-sm font-bold text-cream rounded-xl border-gold/30 bg-black/70 focus:border-gold"
          />
          <button
            type="button"
            onClick={() => setHorizonDays((prev) => Math.min(60, prev + 1))}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-black/70 text-gold hover:bg-gold/20 text-base font-bold transition-colors cursor-pointer"
            title="Increase 1 day"
          >
            +
          </button>

          {/* Quick Presets */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            {[
              { label: "7 Days (1 Wk)", val: 7 },
              { label: "10 Days", val: 10 },
              { label: "14 Days (2 Wks)", val: 14 },
              { label: "30 Days (Month)", val: 30 },
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setHorizonDays(p.val)}
                className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-all cursor-pointer ${
                  horizonDays === p.val
                    ? "bg-gold text-black font-bold shadow-xs"
                    : "border border-gold/20 bg-black/40 text-cream/70 hover:border-gold/40 hover:text-cream"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. REAL CALENDAR WITH BLOCK/UNBLOCK CAPABILITY */}
      <div className="rounded-2xl border border-gold/30 bg-black/60 p-4 space-y-3">
        {/* Month Navigation & Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gold/15 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-sm sm:text-base text-cream">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={isCurrentMonthView}
                onClick={handlePrevMonth}
                className="h-7 w-7 rounded-lg border border-gold/25 bg-black/60 flex items-center justify-center text-cream/70 hover:text-gold hover:border-gold disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="h-7 w-7 rounded-lg border border-gold/25 bg-black/60 flex items-center justify-center text-cream/70 hover:text-gold hover:border-gold transition-colors"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex items-center gap-3 text-[10.5px]">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Open for Orders</span>
            </span>
            <span className="flex items-center gap-1 text-rose-400 font-bold">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>🔴 Blocked (Closed)</span>
            </span>
            <span className="flex items-center gap-1 text-cream/40">
              <span className="h-2 w-2 rounded-full bg-zinc-600" />
              <span>Past Date</span>
            </span>
          </div>
        </div>

        {/* Instructions banner */}
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2 text-[11px] text-amber-200 flex items-center gap-2">
          <Info className="h-4 w-4 text-amber-400 shrink-0" />
          <span>
            <strong>Tap any future date</strong> to toggle between Open and Blocked. When a date is blocked, customers cannot place orders for that date.
          </span>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gold uppercase tracking-wider py-1 border-b border-gold/10">
          {DAY_NAMES.map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>

        {/* Calendar Day Cells */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {calendarDays.map((cell, idx) => {
            const isClickable = !cell.isPast && cell.isCurrentMonth;

            return (
              <button
                key={idx}
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && handleToggleBlockDate(cell.dateKey)}
                className={`relative flex flex-col items-center justify-between rounded-xl p-1.5 h-14 sm:h-16 text-xs transition-all ${
                  cell.isPast
                    ? "opacity-25 bg-zinc-950/40 text-cream/30 border border-transparent cursor-not-allowed"
                    : cell.isBlocked
                    ? "bg-rose-950/70 border-2 border-rose-500 text-rose-200 shadow-sm cursor-pointer hover:brightness-125"
                    : cell.isInHorizon
                    ? "bg-black/80 border border-emerald-500/50 text-cream hover:border-gold hover:bg-gold/10 cursor-pointer shadow-xs"
                    : cell.isCurrentMonth
                    ? "bg-black/40 border border-gold/15 text-cream/70 hover:border-gold/40 cursor-pointer"
                    : "opacity-20 bg-transparent text-cream/20 cursor-not-allowed"
                }`}
                title={
                  cell.isPast
                    ? `${cell.dateKey}: Past Date`
                    : cell.isBlocked
                    ? `${cell.dateKey}: BLOCKED (Click to Unblock)`
                    : `${cell.dateKey}: Open (${cell.bookedCount}/${cell.limit} booked). Click to Block.`
                }
              >
                {/* Top Row: Day Number + Today/Tomorrow Badge */}
                <div className="w-full flex items-center justify-between px-0.5">
                  <span
                    className={`font-mono text-xs font-bold ${
                      cell.isToday
                        ? "text-amber-400"
                        : cell.isBlocked
                        ? "text-rose-400"
                        : "text-cream"
                    }`}
                  >
                    {cell.day}
                  </span>
                  {cell.isToday && (
                    <span className="text-[8px] bg-amber-500 text-black font-extrabold px-1 rounded">
                      Today
                    </span>
                  )}
                  {cell.isTomorrow && (
                    <span className="text-[8px] bg-gold/20 text-gold font-bold px-1 rounded">
                      Tmrw
                    </span>
                  )}
                </div>

                {/* Middle / Bottom Badge: Status indicator */}
                {cell.isPast ? (
                  <span className="text-[8px] text-cream/30">Past</span>
                ) : cell.isBlocked ? (
                  <div className="flex items-center gap-0.5 bg-rose-600 text-white rounded px-1 py-0.2 text-[8.5px] font-bold">
                    <Ban className="h-2.5 w-2.5" />
                    <span>Blocked</span>
                  </div>
                ) : cell.isInHorizon ? (
                  <div className="flex flex-col items-center">
                    <span className="text-[8.5px] text-emerald-400 font-medium">
                      {cell.bookedCount}/{cell.limit}
                    </span>
                    <span className="text-[7.5px] text-emerald-500/80">Open</span>
                  </div>
                ) : (
                  <span className="text-[8px] text-cream/40">Later</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Currently Blocked Dates List */}
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
            <Ban className="h-4 w-4 text-rose-400" />
            <span>Currently Blocked Dates ({blockedDates.length})</span>
          </span>
          {blockedDates.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setBlockedDates([]);
                toast.info("All blocked dates cleared. Click 'Save Settings' to apply.");
              }}
              className="text-[11px] text-rose-400 hover:text-rose-200 underline cursor-pointer"
            >
              Clear All Blocked Dates
            </button>
          )}
        </div>

        {blockedDates.length === 0 ? (
          <p className="text-xs text-emerald-300/80 flex items-center gap-1.5">
            <Check className="h-3.5 w-3.5 text-emerald-400" />
            <span>No dates are currently blocked. The kitchen accepts orders for all days in the horizon.</span>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {blockedDates.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/50 px-2.5 py-1 text-xs font-mono font-bold text-rose-200"
              >
                <span>🚫 {d}</span>
                <button
                  type="button"
                  onClick={() => handleUnblockDate(d)}
                  className="hover:text-white hover:bg-rose-600 rounded-full h-4 w-4 flex items-center justify-center transition-colors cursor-pointer text-xs"
                  title="Unblock date"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 6. PROMINENT SAVE BUTTON */}
      <div className="pt-2">
        <Button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving}
          className="w-full h-12 rounded-2xl bg-gradient-to-r from-amber-500 via-gold to-amber-600 hover:brightness-110 active:scale-[0.99] text-black font-extrabold text-sm shadow-xl shadow-amber-950/40 flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-300"
        >
          <Save className="h-4 w-4 stroke-[2.5]" />
          <span>{isSaving ? "Saving Kitchen Settings..." : "Save Kitchen Automation & Blocked Dates"}</span>
        </Button>
      </div>
    </div>
  );
}
