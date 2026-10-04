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
  CLOSED_WEEKDAY,
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

  // Determine earliest valid date based on cutoff
  const earliestValidDate = useMemo(() => {
    const now = new Date();
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + (now.getHours() >= cutoffHour ? 2 : 1));
    while (date.getDay() === CLOSED_WEEKDAY) {
      date.setDate(date.getDate() + 1);
    }
    return date;
  }, [cutoffHour]);

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
      probe.setDate(probe.getDate() + (now.getHours() >= cutoffHour ? 2 : 1));
      let foundOpenDate: Date | null = null;

      for (let i = 0; i < horizonDays + 7; i++) {
        if (probe.getDay() !== CLOSED_WEEKDAY) {
          const cap = jakloudStore.getCapacityForDate(probe);
          if (!cap.isSoldOut) {
            foundOpenDate = new Date(probe);
            break;
          }
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

    // 1. Past dates
    if (candidate < today) {
      return { disabled: true, reason: "Past date", capacity: cap };
    }

    // 2. Same day (today) is never available (Dum Pukht requires overnight marinating and 24h advance scheduling)
    if (candidate.getTime() === today.getTime()) {
      return { disabled: true, reason: "24h advance Dum booking required", capacity: cap };
    }

    // 3. Tomorrow if after cutoff hour
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (candidate.getTime() === tomorrow.getTime() && now.getHours() >= cutoffHour) {
      return { disabled: true, reason: `${cutoffLabel} cutoff passed for next-day dum`, capacity: cap };
    }

    // 4. Wednesday closed
    if (candidate.getDay() === CLOSED_WEEKDAY) {
      return { disabled: true, reason: "Kitchen Closed on Wednesdays (Rest & Marinade)", capacity: cap };
    }

    // 5. Horizon limit check (e.g. 7 days / 10 days / 30 days)
    const maxHorizonDate = new Date(today);
    maxHorizonDate.setDate(maxHorizonDate.getDate() + horizonDays);
    if (candidate > maxHorizonDate) {
      return {
        disabled: true,
        reason: `Slot opens in advance (${horizonDays}-day booking window)`,
        capacity: cap,
      };
    }

    // 6. Capacity check: Sold out if booked count reaches dailyLimit
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
      isWednesday: boolean;
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
        isWednesday: dObj.getDay() === CLOSED_WEEKDAY,
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
        isWednesday: dObj.getDay() === CLOSED_WEEKDAY,
        isEarliest: dObj.toDateString() === earliestValidDate.toDateString(),
        isSoldOut: check.isSoldOut,
        capacity: check.capacity,
      });
    }

    // Next month padding to fill complete weeks (up to 42 cells)
    const remaining = 42 - days.length;
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
        isWednesday: dObj.getDay() === CLOSED_WEEKDAY,
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
      if (!cap.isSoldOut && d.getDay() !== CLOSED_WEEKDAY) {
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
      {/* DYNAMIC TRAFFIC LIGHT CAPACITY LINE (GREEN / YELLOW / RED)     */}
      {/* ------------------------------------------------------------- */}
      <div className="rounded-xl border border-white/[0.08] bg-zinc-950/90 p-2.5 space-y-2 backdrop-blur-md shadow-sm">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 min-w-0">
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
            <span className="font-semibold text-zinc-200 truncate">
              {selectedCapacity.status === "green" && (
                <span className="text-emerald-400">Slots Available ({selectedCapacity.remainingSlots} Trays Left)</span>
              )}
              {selectedCapacity.status === "yellow" && (
                <span className="text-amber-300">Filling Fast ({selectedCapacity.remainingSlots} Trays Left)</span>
              )}
              {selectedCapacity.status === "red" && (
                <span className="text-rose-400">Almost Sold Out ({selectedCapacity.remainingSlots} Left)!</span>
              )}
              {selectedCapacity.status === "sold_out" && (
                <span className="text-zinc-400">Sold Out · Rolling to Next Day</span>
              )}
            </span>
          </div>

          <div className="text-[10px] font-mono text-zinc-400 flex items-center gap-1 shrink-0">
            <span className="text-zinc-500">Booked:</span>
            <span className="font-bold text-amber-300">
              {selectedCapacity.bookedCount}/{selectedCapacity.limit}
            </span>
          </div>
        </div>

        {/* The Traffic Light Progress Line */}
        <div className="space-y-1">
          <div className="relative h-2 w-full rounded-full bg-zinc-900 border border-white/10 overflow-hidden">
            {/* Background 3-Zone Reference Markers (Red: 0-30%, Yellow: 30-60%, Green: 60-100%) */}
            <div className="absolute inset-0 flex opacity-25 pointer-events-none">
              <div className="w-[30%] bg-rose-500/40 h-full border-r border-zinc-800" />
              <div className="w-[30%] bg-amber-500/40 h-full border-r border-zinc-800" />
              <div className="w-[40%] bg-emerald-500/40 h-full" />
            </div>

            {/* Glowing Active Dynamic Bar representing remaining slots */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                selectedCapacity.status === "green"
                  ? "bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]"
                  : selectedCapacity.status === "yellow"
                  ? "bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(245,158,11,0.7)]"
                  : selectedCapacity.status === "red"
                  ? "bg-gradient-to-r from-rose-600 via-rose-500 to-red-400 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                  : "bg-zinc-700"
              }`}
              style={{
                width: `${Math.max(6, (selectedCapacity.remainingSlots / selectedCapacity.limit) * 100)}%`,
              }}
            />
          </div>

          {/* Traffic Light Zone Guide (7-10 Green, 4-6 Yellow, 1-3 Red) */}
          <div className="flex items-center justify-between text-[9px] text-zinc-400 pt-0.5 px-0.5 font-medium">
            <span className="flex items-center gap-1 text-rose-400/90">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> 1–3 Red
            </span>
            <span className="flex items-center gap-1 text-amber-400/90">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> 4–6 Yellow
            </span>
            <span className="flex items-center gap-1 text-emerald-400/90">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> 7–10 Green
            </span>
          </div>
        </div>

        {/* Auto-lock & rollover advisory if date reached limit */}
        {selectedCapacity.isSoldOut && (
          <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-2 text-[10px] text-rose-300 flex items-center gap-1.5">
            <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
            <span>This day's {dailyLimit}-tray oven capacity is 100% booked. Automatically shifting to next available date.</span>
          </div>
        )}
      </div>

      {/* Quick Visual Time Chips (Direct 1-Tap on Mobile) */}
      <div className="space-y-1.5 pt-0.5">
        <span className="block text-[10px] text-zinc-400 font-medium">Quick Time Slots:</span>
        <div className="flex flex-wrap gap-1.5">
          {availableTimeSlots.map((time) => {
            const isSelected = selectedTime === time;
            return (
              <button
                key={time}
                type="button"
                onClick={() => onTimeChange(time)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1 shadow-sm ${
                  isSelected
                    ? "bg-amber-500 text-zinc-950 font-bold border border-amber-400 scale-[1.03]"
                    : "bg-zinc-900/80 border border-white/10 text-zinc-300 hover:border-amber-500/40 hover:text-amber-300"
                }`}
              >
                <Clock className={`h-3 w-3 ${isSelected ? "text-zinc-950" : "text-amber-400"}`} />
                <span>{time}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================= */}
      {/* 1. INTERACTIVE FULL CALENDAR MODAL                             */}
      {/* ============================================================= */}
      <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-2xl bg-[#121217] border border-amber-500/30 text-zinc-100 p-4 sm:p-5 shadow-2xl overflow-hidden">
          <DialogHeader className="pb-2 border-b border-white/[0.08]">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-sm sm:text-base font-semibold text-zinc-100 flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-amber-400" />
                  <span>Select Dum Handi Date</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-400 mt-0.5 font-normal">
                  Daily capacity limited to {dailyLimit} artisanal trays. Order by {cutoffLabel}.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Month Header with < > Nav */}
          <div className="flex items-center justify-between pt-2 pb-1 px-1">
            <span className="font-display font-semibold text-sm sm:text-base text-amber-300">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-amber-500/40 transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:border-amber-500/40 transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-zinc-400 uppercase tracking-wider py-1 border-b border-white/[0.05]">
            {DAY_NAMES_SHORT.map((day, idx) => (
              <span key={day} className={idx === 3 ? "text-rose-400/80 font-bold" : ""}>
                {day}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 pt-1.5">
            {calendarDays.map((cell, idx) => {
              const isSelected = selectedDate === cell.dateStr;

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={cell.disabled}
                  onClick={() => handleSelectDay(cell.year, cell.month, cell.day)}
                  className={`relative flex flex-col items-center justify-center rounded-xl p-1 h-11 sm:h-12 text-xs transition-all ${
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
                  <span className="text-xs font-semibold">{cell.day}</span>

                  {/* Badges / Dots for availability */}
                  {cell.isWednesday ? (
                    <span className="text-[7px] text-rose-400 font-semibold leading-none scale-90">
                      Closed
                    </span>
                  ) : cell.isSoldOut ? (
                    <span className="text-[7px] text-rose-400 font-bold leading-none scale-90">
                      Full
                    </span>
                  ) : !cell.disabled && cell.isCurrentMonth ? (
                    <span className="flex items-center gap-0.5 mt-0.5">
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          cell.capacity.status === "green"
                            ? "bg-emerald-400"
                            : cell.capacity.status === "yellow"
                            ? "bg-amber-400"
                            : "bg-rose-400"
                        }`}
                      />
                      <span className="text-[7px] text-zinc-400 font-mono">
                        {cell.capacity.remainingSlots}
                      </span>
                    </span>
                  ) : null}

                  {cell.isEarliest && !cell.disabled && !isSelected && (
                    <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400 ring-2 ring-emerald-500/40" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Kitchen Rule Indicator Notes */}
          <div className="pt-2 border-t border-white/[0.08] grid grid-cols-3 gap-1 text-[9px] text-zinc-400 font-normal text-center">
            <span className="flex items-center justify-center gap-1 text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> 7–10 Green
            </span>
            <span className="flex items-center justify-center gap-1 text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> 4–6 Yellow
            </span>
            <span className="flex items-center justify-center gap-1 text-rose-400">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400" /> 1–3 Red
            </span>
          </div>

          {/* Quick Preset Buttons */}
          {quickPresets.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="block text-[10px] text-zinc-400 font-medium">Quick Shortcuts:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickPresets.map((preset, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      const formatted = formatDate(preset.date);
                      onDateChange(formatted, preset.date);
                      setCalendarOpen(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-white/10 hover:border-amber-500/40 text-[10px] text-zinc-300 hover:text-amber-300 transition-colors cursor-pointer"
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
