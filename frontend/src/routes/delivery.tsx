import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Store,
  Truck,
  MapPin,
  Clock,
  Navigation,
  Shield,
  Sparkles,
  Phone,
  MessageSquare,
  CheckCircle2,
  Check,
  ChevronRight,
  ExternalLink,
  Search,
  AlertCircle,
  Calendar,
  Layers,
  ArrowRight,
  UtensilsCrossed,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import {
  BUSINESS,
  DELIVERY_FEE,
  PICKUP_TIMES,
  DELIVERY_TIMES,
  formatDate,
  formatMoney,
  nextAvailableDate,
} from "@/lib/menu";

export const Route = createFileRoute("/delivery")({
  head: () => ({
    meta: [
      { title: "Pickup & Delivery — JAKLOUD Spice King Dum Biryani" },
      {
        name: "description",
        content:
          "Choose between Springfield Counter Pickup (3625 S Bedford Ave) or Express Doorstep Delivery within 10 miles. Freshly hot-sealed Dum Biryani handi trays.",
      },
      { property: "og:title", content: "Pickup or Delivery — JAKLOUD Dum Biryani" },
      {
        property: "og:description",
        content: "Hot pickup counter on Bedford Ave or $10 Springfield doorstep delivery within 10 miles.",
      },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: PickupDeliveryPage,
});

const SPRINGFIELD_ZONES = [
  {
    name: "Zone 1: Galloway & South Springfield",
    radius: "0 – 3 miles",
    zipCodes: ["65809", "65804"],
    deliveryFee: 10,
    eta: "20 – 35 mins",
    status: "Active · Prime Coverage",
  },
  {
    name: "Zone 2: Battlefield & Medical District",
    radius: "3 – 6 miles",
    zipCodes: ["65807", "65810", "65802"],
    deliveryFee: 10,
    eta: "30 – 45 mins",
    status: "Active · Daily Routes",
  },
  {
    name: "Zone 3: North Springfield & Metro Ring",
    radius: "6 – 10 miles",
    zipCodes: ["65803", "65714", "65721", "65619"],
    deliveryFee: 10,
    eta: "40 – 55 mins",
    status: "Active · Afternoon Schedule",
  },
];

export function PickupDeliveryPage() {
  const { count } = useCart();
  const navigate = useNavigate();
  const nextDate = formatDate(nextAvailableDate());

  // Fulfilment Choice
  const [selectedMethod, setSelectedMethod] = useState<"pickup" | "delivery">("pickup");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(PICKUP_TIMES[0] || "12:00 PM");

  // Zip / Address Radius Checker
  const [zipCheckInput, setZipCheckInput] = useState("");
  const [zipCheckResult, setZipCheckResult] = useState<{
    valid: boolean;
    zone?: string;
    message: string;
  } | null>(null);

  // Handle Zip Checker
  const handleCheckZip = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanZip = zipCheckInput.trim();
    if (!cleanZip) return;

    const matchedZone = SPRINGFIELD_ZONES.find((z) =>
      z.zipCodes.some((code) => cleanZip.includes(code)),
    );

    if (matchedZone) {
      setZipCheckResult({
        valid: true,
        zone: matchedZone.name,
        message: `Great news! ZIP ${cleanZip} is within our ${matchedZone.radius} delivery zone (${matchedZone.eta} window).`,
      });
      toast.success(`ZIP ${cleanZip} is in our Springfield Delivery Zone!`);
    } else if (cleanZip.startsWith("658") || cleanZip.startsWith("657")) {
      setZipCheckResult({
        valid: true,
        zone: "Springfield Extended Zone",
        message: `ZIP ${cleanZip} is eligible for Springfield scheduled delivery!`,
      });
      toast.success("Eligible for delivery!");
    } else {
      setZipCheckResult({
        valid: false,
        message: `ZIP ${cleanZip} appears to be outside our standard 10-mile Springfield radius. Hot Counter Pickup is available at 3625 S Bedford Ave!`,
      });
      toast.warning("Outside standard radius. Counter pickup is available!");
    }
  };

  const whatsappInquiryUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    `Hello Master Chef Kartheek! I am inquiring about ${selectedMethod === "pickup" ? "Counter Pickup" : "Doorstep Delivery"} in Springfield, MO for ${nextDate}.`,
  )}`;

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold relative overflow-hidden pb-24">
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO HEADER BANNER                                         */}
      {/* ------------------------------------------------------------- */}
      <section className="relative border-b border-gold/20 bg-gradient-to-r from-[#170f0a] via-[#24150d] to-[#170f0a] py-12 px-4 sm:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-black/80 pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/60 px-4 py-1 text-xs font-bold uppercase tracking-[0.25em] text-gold shadow-[0_0_20px_rgba(212,160,23,0.3)]">
            <MapPin className="h-3.5 w-3.5 text-gold animate-pulse" />
            <span>Springfield Fulfilment Hub & Delivery Radius</span>
          </div>

          <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-wide text-cream">
            Pickup or <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">Doorstep Delivery</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-cream/80 leading-relaxed">
            Every Dum Biryani Handi tray is slow-cooked to order and packed in thermal insulated carriers to ensure
            steaming hot, aromatic delivery or counter pickup across Springfield, Missouri.
          </p>

          <div className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-black/60 px-3.5 py-1.5 text-xs text-cream/90 shadow-md">
            <Calendar className="h-3.5 w-3.5 text-gold" />
            <span>Next Available Batch: <strong className="text-gold">{nextDate}</strong> (Order by 2:00 PM)</span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN 2-CARD SELECTION SECTION                             */}
      {/* ------------------------------------------------------------- */}
      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-10 space-y-12">
        <div className="grid gap-8 md:grid-cols-2">
          {/* ========================================================= */}
          {/* CARD 1: HOT COUNTER PICKUP                                */}
          {/* ========================================================= */}
          <div
            onClick={() => {
              setSelectedMethod("pickup");
              setSelectedTimeSlot(PICKUP_TIMES[0] || "12:00 PM");
            }}
            className={`relative rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-500 flex flex-col justify-between overflow-hidden group ${
              selectedMethod === "pickup"
                ? "bg-gradient-to-b from-[#22140b] via-[#1a0f07] to-[#120a05] border-2 border-gold shadow-[0_0_40px_rgba(212,175,55,0.45)] ring-1 ring-gold/50 scale-[1.01]"
                : "bg-[#140e09]/95 border border-gold/25 hover:border-gold/60 hover:bg-[#18100a] hover:-translate-y-1 shadow-2xl"
            }`}
          >
            {/* Ambient Background Flare */}
            <div
              className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-opacity ${
                selectedMethod === "pickup" ? "bg-gold/20 opacity-100" : "opacity-0"
              }`}
            />

            <div className="space-y-6 relative z-10">
              {/* Header Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${
                      selectedMethod === "pickup"
                        ? "bg-gold text-black shadow-lg shadow-gold/30"
                        : "bg-gold/15 border border-gold/30 text-gold"
                    }`}
                  >
                    <Store className="h-7 w-7" />
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-gold block">
                      Free Fulfilment
                    </span>
                    <h2 className="font-display text-2xl font-bold text-cream">
                      Counter Pickup
                    </h2>
                  </div>
                </div>

                {selectedMethod === "pickup" && (
                  <div className="flex items-center gap-1 rounded-full bg-gold px-3 py-1 text-xs font-bold text-black shadow-md">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Selected</span>
                  </div>
                )}
              </div>

              {/* Specs & Address Strip */}
              <div className="space-y-3 rounded-2xl bg-black/50 border border-gold/20 p-4 text-xs text-cream/85">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-cream">{BUSINESS.address}</p>
                    <p className="text-[0.7rem] text-cream/60">East Springfield (Near Highway 65 & Battlefield)</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t border-gold/10 pt-2.5">
                  <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-cream">Pickup Hours: 11:00 AM – 6:00 PM</p>
                    <p className="text-[0.7rem] text-cream/60">Available daily except Wednesdays</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t border-gold/10 pt-2.5">
                  <Shield className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-400">Freshly Hot-Sealed Guarantee</p>
                    <p className="text-[0.7rem] text-cream/60">Packed in golden thermal bags for 90-min heat retention</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-cream/70 leading-relaxed">
                Pick up your handi directly from our kitchen counter. Ideal for family feasts, weekend pickups, and local Springfield residents.
              </p>

              {/* Time Slots Radio Strip */}
              {selectedMethod === "pickup" && (
                <div className="space-y-2 pt-2 animate-in fade-in duration-300">
                  <Label className="text-[0.68rem] uppercase tracking-wider text-gold font-bold">
                    Select Pickup Time Slot ({nextDate}):
                  </Label>
                  <div className="grid grid-cols-4 gap-2">
                    {PICKUP_TIMES.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTimeSlot(slot);
                        }}
                        className={`rounded-xl py-2 text-xs font-bold border transition-all ${
                          selectedTimeSlot === slot
                            ? "bg-gold text-black border-gold shadow-md"
                            : "bg-black/60 border-gold/20 text-cream/70 hover:bg-gold/15"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 mt-6 border-t border-gold/15 flex items-center justify-between relative z-10">
              <div>
                <span className="text-[0.65rem] text-cream/50 uppercase tracking-wider block">Fulfilment Cost</span>
                <p className="font-display text-2xl font-bold text-emerald-400">FREE ($0.00)</p>
              </div>

              <a
                href="https://maps.google.com/?q=3625+S+Bedford+Ave+Springfield+MO+65809"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-black/60 hover:bg-gold/20 px-4 py-2 text-xs font-bold text-gold transition-colors"
              >
                <Navigation className="h-3.5 w-3.5" />
                <span>Google Maps Directions ↗</span>
              </a>
            </div>
          </div>

          {/* ========================================================= */}
          {/* CARD 2: SPRINGFIELD EXPRESS DOORSTEP DELIVERY             */}
          {/* ========================================================= */}
          <div
            onClick={() => {
              setSelectedMethod("delivery");
              setSelectedTimeSlot(DELIVERY_TIMES[0] || "2:00 PM");
            }}
            className={`relative rounded-3xl p-6 sm:p-8 cursor-pointer transition-all duration-500 flex flex-col justify-between overflow-hidden group ${
              selectedMethod === "delivery"
                ? "bg-gradient-to-b from-[#22140b] via-[#1a0f07] to-[#120a05] border-2 border-chili shadow-[0_0_40px_rgba(185,28,28,0.45)] ring-1 ring-chili/50 scale-[1.01]"
                : "bg-[#140e09]/95 border border-gold/25 hover:border-chili/60 hover:bg-[#18100a] hover:-translate-y-1 shadow-2xl"
            }`}
          >
            {/* Ambient Background Flare */}
            <div
              className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none transition-opacity ${
                selectedMethod === "delivery" ? "bg-chili/25 opacity-100" : "opacity-0"
              }`}
            />

            <div className="space-y-6 relative z-10">
              {/* Header Badge & Icon */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-all ${
                      selectedMethod === "delivery"
                        ? "bg-gradient-to-tr from-chili to-gold text-white shadow-lg shadow-chili/40"
                        : "bg-chili/15 border border-chili/30 text-chili"
                    }`}
                  >
                    <Truck className="h-7 w-7" />
                  </div>
                  <div>
                    <span className="text-[0.65rem] font-bold uppercase tracking-widest text-saffron block">
                      Doorstep Service
                    </span>
                    <h2 className="font-display text-2xl font-bold text-cream">
                      Doorstep Delivery
                    </h2>
                  </div>
                </div>

                {selectedMethod === "delivery" && (
                  <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-chili to-gold px-3 py-1 text-xs font-bold text-white shadow-md">
                    <Check className="h-3.5 w-3.5 stroke-[3]" />
                    <span>Selected</span>
                  </div>
                )}
              </div>

              {/* Specs & Radius Strip */}
              <div className="space-y-3 rounded-2xl bg-black/50 border border-gold/20 p-4 text-xs text-cream/85">
                <div className="flex items-start gap-2.5">
                  <Truck className="h-4 w-4 text-saffron shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-cream">Flat $10 Delivery Fee</p>
                    <p className="text-[0.7rem] text-emerald-400 font-semibold">FREE Delivery for orders of 5+ Handi Trays</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t border-gold/10 pt-2.5">
                  <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-cream">10-Mile Springfield Radius</p>
                    <p className="text-[0.7rem] text-cream/60">Serving Springfield, Galloway, Battlefield & Metro</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 border-t border-gold/10 pt-2.5">
                  <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-cream">Delivery Windows: 2:00 PM – 6:00 PM</p>
                    <p className="text-[0.7rem] text-cream/60">Dispatched hot from the oven in thermal insulated bins</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-cream/70 leading-relaxed">
                Enjoy hot royal Dum Biryani handi trays delivered directly to your doorstep, hospital office, medical center, or event venue in Springfield.
              </p>

              {/* Time Slots Radio Strip */}
              {selectedMethod === "delivery" && (
                <div className="space-y-2 pt-2 animate-in fade-in duration-300">
                  <Label className="text-[0.68rem] uppercase tracking-wider text-saffron font-bold">
                    Select Delivery Time Window ({nextDate}):
                  </Label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {DELIVERY_TIMES.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTimeSlot(slot);
                        }}
                        className={`rounded-xl py-2 text-xs font-bold border transition-all ${
                          selectedTimeSlot === slot
                            ? "bg-gradient-to-r from-chili to-gold text-white border-gold shadow-md"
                            : "bg-black/60 border-gold/20 text-cream/70 hover:bg-gold/15"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 mt-6 border-t border-gold/15 flex items-center justify-between relative z-10">
              <div>
                <span className="text-[0.65rem] text-cream/50 uppercase tracking-wider block">Standard Fee</span>
                <p className="font-display text-2xl font-bold text-gold">$10.00 <span className="text-xs font-normal text-cream/60">Flat Rate</span></p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMethod("delivery");
                  const inputEl = document.getElementById("zip-checker-input");
                  if (inputEl) inputEl.focus();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-chili/40 bg-black/60 hover:bg-chili/20 px-4 py-2 text-xs font-bold text-amber-200 transition-colors"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Check Delivery Zip ↓</span>
              </button>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. INTERACTIVE MAP & DELIVERY RADIUS RADAR                    */}
        {/* ------------------------------------------------------------- */}
        <section className="rounded-3xl border border-gold/30 bg-gradient-to-br from-[#170f0a] via-[#120c08] to-[#0a0705] p-6 sm:p-10 shadow-2xl backdrop-blur-2xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gold/20 pb-6">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-[0.25em] text-gold font-bold">Live Coverage Radar</span>
              <h3 className="font-display text-2xl sm:text-3xl font-bold text-cream">
                Springfield Delivery Radius & Zones
              </h3>
              <p className="text-xs text-cream/70">
                Hub Location: <strong className="text-gold">3625 S Bedford Ave, Springfield, MO 65809</strong>
              </p>
            </div>

            {/* Interactive ZIP Checker */}
            <form onSubmit={handleCheckZip} className="flex gap-2 max-w-sm w-full">
              <Input
                id="zip-checker-input"
                type="text"
                placeholder="Enter Springfield ZIP (e.g. 65804)"
                value={zipCheckInput}
                onChange={(e) => setZipCheckInput(e.target.value)}
                className="bg-black/60 border-gold/30 text-cream placeholder:text-cream/40 text-xs rounded-xl focus:border-gold"
              />
              <Button
                type="submit"
                className="bg-gradient-to-r from-chili to-gold text-white font-bold text-xs px-4 rounded-xl shrink-0 shadow-md"
              >
                Verify
              </Button>
            </form>
          </div>

          {/* Zip Check Result Banner */}
          {zipCheckResult && (
            <div
              className={`rounded-2xl p-4 text-xs flex items-center justify-between border animate-in fade-in duration-300 ${
                zipCheckResult.valid
                  ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300"
                  : "bg-amber-950/70 border-amber-500/50 text-amber-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {zipCheckResult.valid ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-400 shrink-0" />
                )}
                <span>{zipCheckResult.message}</span>
              </div>
              <button
                onClick={() => setZipCheckResult(null)}
                className="text-xs text-cream/50 hover:text-cream"
              >
                ✕
              </button>
            </div>
          )}

          {/* SVG Map Canvas with Concentric Radial Zones */}
          <div className="grid gap-8 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 relative h-80 w-full rounded-3xl bg-black/80 border border-gold/30 overflow-hidden flex items-center justify-center p-4">
              {/* Radar Grid Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />

              {/* Concentric Radius Circles */}
              <div className="absolute h-72 w-72 rounded-full border border-gold/20 border-dashed animate-pulse pointer-events-none" />
              <div className="absolute h-52 w-52 rounded-full border border-gold/35 pointer-events-none" />
              <div className="absolute h-32 w-32 rounded-full border-2 border-gold/50 bg-gold/5 pointer-events-none" />

              {/* Zone Annotations */}
              <span className="absolute top-6 text-[0.62rem] font-bold text-gold/60 uppercase tracking-widest">
                10-Mile Metro Radius ($10)
              </span>
              <span className="absolute top-16 text-[0.62rem] font-bold text-gold/80 uppercase tracking-widest">
                6-Mile District
              </span>
              <span className="absolute top-26 text-[0.62rem] font-bold text-gold uppercase tracking-widest">
                3-Mile Hub
              </span>

              {/* Central Kitchen Pin */}
              <div className="relative z-10 flex flex-col items-center group cursor-pointer">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-tr from-chili to-gold text-white shadow-[0_0_25px_rgba(212,160,23,0.8)] border-2 border-white animate-bounce">
                  <Store className="h-5 w-5" />
                </div>
                <div className="mt-2 rounded-xl bg-black/90 border border-gold/40 px-3 py-1 text-center shadow-xl backdrop-blur-md">
                  <p className="font-display text-[0.72rem] font-bold text-gold">JAKLOUD Kitchen</p>
                  <p className="text-[0.6rem] text-cream/70">3625 S Bedford Ave</p>
                </div>
              </div>
            </div>

            {/* Zone Information Cards */}
            <div className="lg:col-span-6 space-y-3">
              {SPRINGFIELD_ZONES.map((zone, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-gold/20 bg-black/40 p-4 space-y-1.5 hover:border-gold/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-display text-sm font-bold text-cream flex items-center gap-2">
                      <span className="text-gold font-mono">0{idx + 1}.</span>
                      <span>{zone.name}</span>
                    </h4>
                    <span className="rounded bg-gold/15 border border-gold/30 px-2 py-0.5 text-[0.65rem] font-bold text-gold">
                      {zone.radius}
                    </span>
                  </div>

                  <p className="text-[0.7rem] text-cream/70">
                    Covered Zip Codes: <span className="text-gold font-mono font-medium">{zone.zipCodes.join(", ")}</span>
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[0.68rem] text-cream/60 border-t border-gold/10">
                    <span className="text-emerald-400 font-medium">✓ {zone.status}</span>
                    <span>Est. Window: {zone.eta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------- */}
        {/* 4. CALL TO ACTION & FLOW TRANSITION                           */}
        {/* ------------------------------------------------------------- */}
        <section className="rounded-3xl border-2 border-gold/40 bg-gradient-to-b from-[#18100a] via-[#120c08] to-[#0a0705] p-6 sm:p-10 shadow-2xl backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-[0.68rem] font-bold uppercase tracking-widest text-gold">
              Ready to Order?
            </span>
            <h3 className="font-display text-2xl font-bold text-cream">
              Proceed with {selectedMethod === "pickup" ? "Counter Pickup" : "Doorstep Delivery"}
            </h3>
            <p className="text-xs text-cream/70">
              Selected window: <strong className="text-gold">{selectedTimeSlot}</strong> on{" "}
              <strong className="text-gold">{nextDate}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs sm:text-sm px-6 py-6 shadow-[0_0_25px_rgba(185,28,28,0.5)] hover:scale-105 transition-all gap-2"
            >
              <Link to="/menu">
                <UtensilsCrossed className="h-4 w-4" />
                <span>Explore Menu & Place Order →</span>
              </Link>
            </Button>

            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/80 px-5 py-3.5 text-xs font-bold text-emerald-400 transition-all shadow-md hover:scale-105"
            >
              <MessageSquare className="h-4 w-4" />
              <span>WhatsApp Inquiry</span>
            </a>

            <a
              href={`tel:${BUSINESS.phone}`}
              className="flex items-center gap-2 rounded-2xl border border-gold/30 bg-black/60 hover:bg-gold/15 px-4 py-3.5 text-xs font-semibold text-gold transition-all"
            >
              <Phone className="h-4 w-4" />
              <span>{BUSINESS.phone}</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
