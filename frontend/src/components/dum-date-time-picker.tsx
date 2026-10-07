import React, { useState, useMemo, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Sparkles,
  Info,
  X,
  Flame,
  Lock,
} from "lucide-react";
import {
  PICKUP_TIMES,
  DELIVERY_TIMES,
  nextAvailableDate,
  formatDate,
} from "@/lib/menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useKitchenSettings, useDynamicOrders, jakloudStore } from "@/lib/store";

export interface DumDateTimePickerProps {
  selectedDate: string;
  onDateChange: (formattedDate: string, dateObj: Date) => void;
  selectedTime: string;
  onTimeChange: (time: string) => void;
  fulfilmentMode: "pickup" | "delivery";
  className?: string;
}

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

const DAY_NAMES_SHORT = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function DumDateTimePicker({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  fulfilmentMode,
  className = "",
}: DumDateTimePickerProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [clockModalOpen, setClockModalOpen] = useState(false);

  // Dynamic Kitchen Settings from reactive store
  const { settings } = useKitchenSettings();
  const { orders } = useDynamicOrders();
  const dailyLimit = settings.dailyTrayLimit || 10;
  const cutoffHour = settings.orderCutoffHour || 15; // 3:00 PM (15:00) default
  const horizonDays = settings.bookingHorizonDays || 7; // 7 days (1 week) default

  const cutoffLabel = useMemo(() => {
    if (cutoffHour === 12) return "12:00 PM";
    if (cutoffHour > 12) return `${cutoffHour - 12}:00 PM`;
    return `${cutoffHour}:00 AM`;
  }, [cutoffHour]);

  // Precise minute-level 3:00 PM cutoff check
  const isPastCutoff = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes() >= cutoffHour * 60;
  }, [cutoffHour]);

  // Determine earliest valid date based on cutoff (open 7 days a week)
  const earliestValidDate = useMemo(() => {
    const now = new Date();
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + (isPastCutoff ? 2 : 1));
    return date;
  }, [isPastCutoff]);

  // Dynamic Rolling Window info for diner display
  const rollingWindowRange = useMemo(() => {
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + horizonDays);
    return {
      startStr: formatDate(start),
      endStr: formatDate(end),
    };
  }, [horizonDays]);

  // Month navigation view state
  const [viewYear, setViewYear] = useState(() => earliestValidDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => earliestValidDate.getMonth());

  // Capacity calculation for the currently selected date
  const selectedCapacity = useMemo(() => {
    return jakloudStore.getCapacityForDate(selectedDate);
  }, [selectedDate, orders, dailyLimit]);

  // Auto-roll if selected date is sold out (10/10 reached): shifts to next available open day
  useEffect(() => {
    if (selectedCapacity.isSoldOut && selectedDate) {
      const now = new Date();
      let probe = new Date(now);
      const pastCutoff = now.getHours() * 60 + now.getMinutes() >= cutoffHour * 60;
      probe.setDate(probe.getDate() + (pastCutoff ? 2 : 1));
      let foundOpenDate: Date | null = null;

      for (let i = 0; i < horizonDays + 7; i++) {
        const cap = jakloudStore.getCapacityForDate(probe);
        if (!cap.isSoldOut) {
          foundOpenDate = new Date(probe);
          break;
        }
        probe.setDate(probe.getDate() + 1);
      }

      if (foundOpenDate) {
        const nextFormatted = formatDate(foundOpenDate);
        onDateChange(nextFormatted, foundOpenDate);
      }
    }
  }, [selectedCapacity.isSoldOut, selectedDate, cutoffHour, horizonDays, onDateChange]);

  // Check if a given date is disabled for dum order booking
  const isDateDisabled = (
    year: number,
    month: number,
    day: number,
  ): {
    disabled: boolean;
    reason?: string;
    isSoldOut?: boolean;
    capacity: ReturnType<typeof jakloudStore.getCapacityForDate>;
  } => {
    const candidate = new Date(year, month, day, 0, 0, 0, 0);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const cap = jakloudStore.getCapacityForDate(candidate);
    const pastCutoff = now.getHours() * 60 + now.getMinutes() >= cutoffHour * 60;

    // 1. Past dates
    if (candidate < today) {
      return { disabled: true, reason: "Past date", capacity: cap };
    }

    // 2. Same day (today) is never available (Dum Pukht requires overnight marinating and 24h advance scheduling)
    if (candidate.getTime() === today.getTime()) {
      return { disabled: true, reason: "Same-day closed (24h advance marinating required)", capacity: cap };
    }

    // 3. Tomorrow if after cutoff hour (3:00 PM cutoff strictly closes tomorrow)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (candidate.getTime() === tomorrow.getTime() && pastCutoff) {
      return {
        disabled: true,
        reason: `Orders must be placed before ${cutoffLabel} the previous day. Next-day bookings closed at ${cutoffLabel}.`,
        capacity: cap,
      };
    }

    // 4. Horizon limit check (e.g. 7 days / 10 days / 30 days)
    const maxHorizonDate = new Date(today);
    maxHorizonDate.setDate(maxHorizonDate.getDate() + horizonDays);
    if (candidate > maxHorizonDate) {
      return {
        disabled: true,
        reason: `Slot opens in advance (${horizonDays}-day rolling booking window)`,
        capacity: cap,
      };
    }

    // 5. Capacity check: Sold out if booked count reaches dailyLimit
    if (cap.isSoldOut) {
      return {
        disabled: true,
        reason: `Sold Out (${cap.limit}/${cap.limit} Orders Filled)`,
        isSoldOut: true,
        capacity: cap,
      };
    }

    return { disabled: false, capacity: cap };
  };

  // Generate calendar grid days with capacity data
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const days: {
      day: number;
      month: number;
      year: number;
      isCurrentMonth: boolean;
      disabled: boolean;
      reason?: string;
      dateStr: string;
      isEarliest: boolean;
      isSoldOut?: boolean;
      capacity: ReturnType<typeof jakloudStore.getCapacityForDate>;
    }[] = [];

    // Previous month padding
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevMonth = viewMonth === 0 ? 11 : viewMonth - 1;
      const prevYear = viewMonth === 0 ? viewYear - 1 : viewYear;
      const check = isDateDisabled(prevYear, prevMonth, prevDay);
      const dObj = new Date(prevYear, prevMonth, prevDay);
      days.push({
        day: prevDay,
        month: prevMonth,
        year: prevYear,
        isCurrentMonth: false,
        disabled: check.disabled,
        reason: check.reason,
        dateStr: formatDate(dObj),
        isEarliest: dObj.toDateString() === earliestValidDate.toDateString(),
        isSoldOut: check.isSoldOut,
        capacity: check.capacity,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const check = isDateDisabled(viewYear, viewMonth, day);
      const dObj = new Date(viewYear, viewMonth, day);
      days.push({
        day,
        month: viewMonth,
        year: viewYear,
        isCurrentMonth: true,
        disabled: check.disabled,
        reason: check.reason,
        dateStr: formatDate(dObj),
        isEarliest: dObj.toDateString() === earliestValidDate.toDateString(),
        isSoldOut: check.isSoldOut,
        capacity: check.capacity,
      });
    }

    // Next month padding to fill complete weeks (35 or 42 cells)
    const totalCells = days.length > 35 ? 42 : 35;
    const remaining = totalCells - days.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = viewMonth === 11 ? 0 : viewMonth + 1;
      const nextYear = viewMonth === 11 ? viewYear + 1 : viewYear;
      const check = isDateDisabled(nextYear, nextMonth, day);
      const dObj = new Date(nextYear, nextMonth, day);
      days.push({
        day,
        month: nextMonth,
        year: nextYear,
        isCurrentMonth: false,
        disabled: check.disabled,
        reason: check.reason,
        dateStr: formatDate(dObj),
        isEarliest: dObj.toDateString() === earliestValidDate.toDateString(),
        isSoldOut: check.isSoldOut,
        capacity: check.capacity,
      });
    }

    return days;
  }, [viewYear, viewMonth, earliestValidDate, cutoffHour, horizonDays, dailyLimit, orders]);

  // Navigate calendar month
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (year: number, month: number, day: number) => {
    const dObj = new Date(year, month, day);
    const formatted = formatDate(dObj);
    onDateChange(formatted, dObj);
    setCalendarOpen(false);
  };

  // Quick preset shortcuts (only within horizon and not sold out)
  const quickPresets = useMemo(() => {
    const presets: { label: string; date: Date }[] = [];
    const base = earliestValidDate;

    // 1. Earliest Available
    const baseCap = jakloudStore.getCapacityForDate(base);
    if (!baseCap.isSoldOut) {
      presets.push({
        label: "Earliest Next Batch",
        date: base,
      });
    }

    // 2. Next Friday, Saturday, Sunday within horizon
    const cur = new Date(base);
    for (let i = 0; i < horizonDays; i++) {
      const d = new Date(cur);
      d.setDate(d.getDate() + i);
      const cap = jakloudStore.getCapacityForDate(d);
      if (!cap.isSoldOut) {
        if (d.getDay() === 5 && presets.length < 3) {
          presets.push({ label: "Friday Feast", date: d });
        } else if (d.getDay() === 6 && presets.length < 4) {
          presets.push({ label: "Saturday Weekend", date: d });
        } else if (d.getDay() === 0 && presets.length < 4) {
          presets.push({ label: "Sunday Family Dum", date: d });
        }
      }
    }

    return presets;
  }, [earliestValidDate, horizonDays, orders, dailyLimit]);

  // Time slot options (Pickup: 11 AM, 12 PM, 1 PM Lunch only)
  const availableTimeSlots = fulfilmentMode === "pickup" ? PICKUP_TIMES : DELIVERY_TIMES;

  // Auto-correct time if current selectedTime is not valid for the active fulfilment mode
  useEffect(() => {
    if (!availableTimeSlots.includes(selectedTime)) {
      onTimeChange(availableTimeSlots[0] || (fulfilmentMode === "pickup" ? "12:00 PM" : "2:00 PM"));
    }
  }, [fulfilmentMode, availableTimeSlots, selectedTime, onTimeChange]);

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* ------------------------------------------------------------- */}
      {/* TWO-COLUMN INTERACTIVE PICKER TRIGGER BUTTONS                  */}
      {/* ------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 1. INTERACTIVE CALENDAR DATE TRIGGER */}
        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5 text-amber-400" />
              <span>Handi Dum Date</span>
            </span>
            <span className="text-[9px] text-amber-400/90 font-mono">
              Cutoff {cutoffLabel}
            </span>
          </label>

          <button
            type="button"
            onClick={() => setCalendarOpen(true)}
            className="w-full text-left rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-[#18161a] border border-amber-500/30 hover:border-amber-400 p-2.5 shadow-sm transition-all group flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            <div className="min-w-0 pr-2">
              <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                Scheduled Date
              </span>
              <span className="block text-xs font-semibold text-amber-300 truncate mt-0.5 group-hover:text-amber-200">
                {selectedDate || "Tap to Select Date"}
              </span>
            </div>

            <div className="h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 group-hover:bg-amber-500/25 transition-colors">
              <CalendarIcon className="h-3.5 w-3.5" />
            </div>
          </button>
        </div>

        {/* 2. INTERACTIVE CLOCK TIME TRIGGER */}
        <div className="space-y-1">
          <label className="block text-[11px] font-medium text-zinc-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-400" />
              <span>Fulfilment Time</span>
            </span>
            <span className="text-[9px] text-zinc-400">
              {fulfilmentMode === "delivery" ? "2 PM – 6 PM" : "11 AM – 1 PM (Lunch)"}
            </span>
          </label>

          <button
            type="button"
            onClick={() => setClockModalOpen(true)}
            className="w-full text-left rounded-xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-[#18161a] border border-amber-500/30 hover:border-amber-400 p-2.5 shadow-sm transition-all group flex items-center justify-between cursor-pointer active:scale-[0.99]"
          >
            <div className="min-w-0 pr-2">
              <span className="block text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">
                Ready Window
              </span>
              <span className="block text-xs font-semibold text-amber-300 truncate mt-0.5 group-hover:text-amber-200">
                {selectedTime || "Tap to Select Time"}
              </span>
            </div>

            <div className="h-7 w-7 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center justify-center shrink-0 group-hover:bg-amber-500/25 transition-colors">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CLEAN CAPACITY AVAILABILITY BADGE                             */}
      {/* ------------------------------------------------------------- */}
      <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.08] text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full shrink-0 ${
              selectedCapacity.status === "green"
                ? "bg-emerald-500 shadow-[0_0_8px_#10b981]"
                : selectedCapacity.status === "yellow"
                ? "bg-amber-400 shadow-[0_0_8px_#f59e0b]"
                : selectedCapacity.status === "red"
                ? "bg-rose-500 animate-pulse shadow-[0_0_8px_#ef4444]"
                : "bg-zinc-600"
            }`}
          />
          <span className="font-medium text-zinc-200">
            {selectedCapacity.status === "green" && (
              <span className="text-emerald-400 font-semibold">{selectedCapacity.remainingSlots} Trays Available</span>
            )}
            {selectedCapacity.status === "yellow" && (
              <span className="text-amber-300 font-semibold">Filling Fast ({selectedCapacity.remainingSlots} Left)</span>
            )}
            {selectedCapacity.status === "red" && (
              <span className="text-rose-400 font-semibold">Almost Sold Out ({selectedCapacity.remainingSlots} Left)</span>
            )}
            {selectedCapacity.status === "sold_out" && (
              <span className="text-zinc-400">Sold Out · Rolling to Next Day</span>
            )}
          </span>
        </div>

        <span className="text-[11px] text-amber-400/80 font-medium">
          Fresh Handi Batch
        </span>
      </div>

      {/* Auto-lock & rollover advisory if date reached limit */}
      {selectedCapacity.isSoldOut && (
        <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2.5 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>This day is fully booked. Please choose another date.</span>
        </div>
      )}

      {/* ============================================================= */}
      {/* 1. INTERACTIVE FULL CALENDAR MODAL                             */}
      {/* ============================================================= */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-w-md w-[94vw] sm:w-full rounded-2xl bg-[#121217] border border-amber-500/30 text-zinc-100 p-3.5 sm:p-4 shadow-2xl max-h-[86vh] overflow-y-auto scrollbar-thin flex flex-col gap-2.5">
          <DialogHeader className="pb-2 border-b border-white/[0.08] space-y-1.5 text-left">
            <div className="flex items-center justify-between gap-2">
              <DialogTitle className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Select Dum Handi Date</span>
              </DialogTitle>
              <span
                className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap shrink-0 ${
                  isPastCutoff
                    ? "bg-rose-500/15 border-rose-500/30 text-rose-300"
                    : "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                }`}
              >
                {isPastCutoff ? "3:00 PM Passed · Tomorrow Closed" : "Open for Tomorrow"}
              </span>
            </div>

            {/* CRITICAL NOTE: ORDER BEFORE 3:00 PM THE DAY BEFORE */}
            <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-2 text-amber-200">
              <div className="flex items-start gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[10px] leading-snug">
                  <span className="font-bold text-amber-300 block">
                    ⚠️ Cutoff Rule: Order by 3:00 PM the Day Before
                  </span>
                  <span className="text-zinc-300 font-normal">
                    Dum biryani requires overnight marinating. Orders must be booked before <strong>3:00 PM the previous day</strong>. At 3:00 PM sharp, next-day booking automatically closes.
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Rolling Window Pill */}
            <div className="flex items-center justify-between rounded-lg bg-zinc-900/70 border border-white/[0.06] px-2.5 py-1 text-[10px]">
              <span className="flex items-center gap-1 text-amber-300 font-medium">
                <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                <span>Rolling {horizonDays}-Day Horizon</span>
              </span>
              <span className="font-mono text-zinc-400">
                Open through {rollingWindowRange.endStr.split(",")[1]}
              </span>
            </div>
          </DialogHeader>

          {/* Month Header with < > Nav */}
          <div className="flex items-center justify-between pt-0.5 px-0.5">
            <span className="font-display font-semibold text-sm text-amber-300">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="h-7 w-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-amber-500/40 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="h-7 w-7 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-amber-500/40 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-semibold text-zinc-400 uppercase tracking-wider py-0.5 border-b border-white/[0.05]">
            {DAY_NAMES_SHORT.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          {/* Calendar Day Grid (Compact & Sleek) */}
          <div className="grid grid-cols-7 gap-1 pt-0.5">
            {calendarDays.map((cell, idx) => {
              const isSelected = selectedDate === cell.dateStr;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                  className={`relative flex flex-col items-center justify-center rounded-lg p-0.5 h-8 sm:h-8.5 text-xs transition-all ${
                    cell.disabled
                      ? "opacity-30 cursor-not-allowed bg-zinc-950/40 text-zinc-600 border border-transparent"
                      : isSelected
                      ? "bg-amber-500 text-zinc-950 font-bold ring-2 ring-amber-400 shadow-md scale-105 z-10 cursor-pointer"
                      : cell.isCurrentMonth
                      ? "bg-zinc-900/60 border border-white/[0.06] text-zinc-200 hover:border-amber-500/50 hover:bg-amber-500/10 cursor-pointer"
                      : "bg-transparent text-zinc-600 hover:text-zinc-400 cursor-pointer"
                  }`}
                  title={cell.reason || `${cell.dateStr} — ${cell.capacity.remainingSlots} slots left`}
                >
                  <span className="text-[11px] font-semibold leading-none">{cell.day}</span>

                  {/* Badges / Dots for availability */}
                  {cell.isSoldOut ? (
                    <span className="text-[6.5px] text-rose-400 font-bold leading-none mt-0.5">
                      Full
                    </span>
                  ) : !cell.disabled && cell.isCurrentMonth ? (
                    <span className="flex items-center gap-0.5 mt-0.5">
                      <span
                        className={`h-1 w-1 rounded-full ${
                          cell.capacity.status === "green"
                            ? "bg-emerald-400"
                            : cell.capacity.status === "yellow"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                      />
                      <span className="text-[7px] text-zinc-400 font-mono leading-none">
                        {cell.capacity.remainingSlots}
                      </span>
                    </span>
                  ) : null}

                  {cell.isEarliest && !cell.disabled && !isSelected && (
                    <span className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-emerald-400 ring-1 ring-emerald-500/40" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Kitchen Rule Indicator Notes */}
          <div className="pt-1.5 border-t border-white/[0.06] flex items-center justify-center gap-3 text-[8.5px] text-zinc-400 font-normal">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> 7–10 Trays Open
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> 4–6 Left
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> 1–3 Left
            </span>
          </div>

          {/* Quick Preset Buttons (Single Horizontal Scrollable Line) */}
          {quickPresets.length > 0 && (
            <div className="space-y-1 pt-0.5">
              <span className="block text-[9.5px] text-zinc-400 font-medium">Quick Dates:</span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                {quickPresets.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const formatted = formatDate(preset.date);
                      onDateChange(formatted, preset.date);
                      setCalendarOpen(false);
                    }}
                    className="px-2 py-1 rounded-md bg-zinc-900 border border-white/10 hover:border-amber-500/40 text-[9.5px] text-zinc-300 hover:text-amber-300 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                  >
                    ✨ {preset.label} ({preset.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })})
                  </button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================= */}
      {/* 2. INTERACTIVE TIME SLOT CLOCK MODAL                           */}
      {/* ============================================================= */}
      <Dialog open={clockModalOpen} onOpenChange={setClockModalOpen}>
        <DialogContent className="max-w-sm w-[95vw] rounded-2xl bg-[#121217] border border-amber-500/30 text-zinc-100 p-4 sm:p-5 shadow-2xl">
          <DialogHeader className="pb-2 border-b border-white/[0.08]">
            <DialogTitle className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-400" />
              <span>Select Ready Window</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 mt-0.5 font-normal">
              {fulfilmentMode === "delivery"
                ? "Doorstep delivery routes depart hot between 2:00 PM and 6:00 PM."
                : "Kitchen counter pickup is available fresh for lunch between 11:00 AM and 1:00 PM."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 pt-3">
            {availableTimeSlots.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    onTimeChange(time);
                    setClockModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-md"
                      : "bg-zinc-900/70 border-white/10 text-zinc-200 hover:border-amber-500/40 hover:text-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className={`h-4 w-4 ${isSelected ? "text-zinc-950" : "text-amber-400"}`} />
                    <span className="text-xs font-semibold">{time}</span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-zinc-950 stroke-[3]" />}
                </button>
              );
            })}
          </div>

          <div className="mt-3 rounded-xl bg-zinc-900/40 border border-white/[0.06] p-2.5 text-[11px] text-zinc-400 font-normal leading-relaxed">
            <span className="text-amber-300 font-medium">Dum Heat Guarantee:</span> Trays are sealed in traditional dough containers and transferred directly into insulated carriers before release.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
