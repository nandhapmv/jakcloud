import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  Search,
  AlertCircle,
  Calendar,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BUSINESS,
  PICKUP_TIMES,
  DELIVERY_TIMES,
  formatDate,
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
  const nextDate = formatDate(nextAvailableDate());

  const [selectedMethod, setSelectedMethod] = useState<"pickup" | "delivery">("pickup");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(PICKUP_TIMES[0] || "12:00 PM");

  const [zipCheckInput, setZipCheckInput] = useState("");
  const [zipCheckResult, setZipCheckResult] = useState<{
    valid: boolean;
    zone?: string;
    message: string;
  } | null>(null);

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
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-200 selection:bg-amber-500/20 selection:text-amber-300 relative overflow-hidden pb-24">
      {/* 1. HERO HEADER BANNER */}
      <section className="relative border-b border-white/[0.08] bg-[#121216] py-12 px-4 sm:px-8 text-center overflow-hidden">
        <div className="relative z-10 mx-auto max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-medium text-amber-300">
            <MapPin className="h-3.5 w-3.5 text-amber-400" />
            <span>Fulfilment Hub & Delivery Radius</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-zinc-100">
            Pickup or <span className="text-amber-400">Doorstep Delivery</span>
          </h1>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal">
            Every Dum Biryani Handi tray is slow-cooked to order and packed in thermal insulated carriers to ensure
            steaming hot, aromatic delivery or counter pickup across Springfield, Missouri.
          </p>

          <div className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#18181f] px-3.5 py-1.5 text-xs text-zinc-300">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>Next Available Batch: <strong className="text-amber-300 font-medium">{nextDate}</strong> (Order by 2:00 PM)</span>
          </div>
        </div>
      </section>

      {/* 2. MAIN 2-CARD SELECTION SECTION */}
      <main className="mx-auto max-w-7xl px-4 sm:px-8 py-10 space-y-10">
        <div className="grid gap-6 md:grid-cols-2">
          {/* CARD 1: COUNTER PICKUP */}
          <div
            onClick={() => {
              setSelectedMethod("pickup");
              setSelectedTimeSlot(PICKUP_TIMES[0] || "12:00 PM");
            }}
            className={`relative rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden ${
              selectedMethod === "pickup"
                ? "bg-[#18181f] border-2 border-amber-500/70 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                : "bg-[#121216] border border-white/[0.08] hover:border-white/20 hover:bg-[#15151a]"
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                      selectedMethod === "pickup"
                        ? "bg-amber-500 text-zinc-950 font-semibold"
                        : "bg-white/[0.06] border border-white/10 text-zinc-300"
                    }`}
                  >
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[0.62rem] font-medium text-amber-400 uppercase tracking-wider block">
                      Free Fulfilment
                    </span>
                    <h2 className="font-display text-lg font-semibold text-zinc-100">
                      Counter Pickup
                    </h2>
                  </div>
                </div>

                {selectedMethod === "pickup" && (
                  <div className="flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-zinc-950 shadow-sm">
                    <Check className="h-3 w-3 stroke-[3]" />
                    <span>Selected</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-xl bg-[#18181f] border border-white/[0.06] p-3 text-xs text-zinc-300 font-normal">
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-zinc-200">{BUSINESS.address}</p>
                    <p className="text-[0.68rem] text-zinc-500">East Springfield (Near Highway 65 & Battlefield)</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 border-t border-white/[0.04] pt-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-zinc-200">Lunch Pickup Hours: 11:00 AM – 1:00 PM</p>
                    <p className="text-[0.68rem] text-zinc-500">Available daily for lunch except Wednesdays</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 border-t border-white/[0.04] pt-2">
                  <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-emerald-400">Freshly Hot-Sealed Guarantee</p>
                    <p className="text-[0.68rem] text-zinc-500">Packed in thermal bags for 90-min heat retention</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Pick up your handi directly from our kitchen counter. Ideal for family feasts, weekend pickups, and local Springfield residents.
              </p>

              {selectedMethod === "pickup" && (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                  <Label className="text-[0.65rem] uppercase tracking-wider text-zinc-400 font-medium">
                    Select Pickup Time Slot ({nextDate}):
                  </Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PICKUP_TIMES.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTimeSlot(slot);
                        }}
                        className={`rounded-lg py-1.5 text-xs font-medium border transition-all ${
                          selectedTimeSlot === slot
                            ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold"
                            : "bg-[#18181f] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[0.62rem] text-zinc-500 uppercase tracking-wider block">Fulfilment Cost</span>
                <p className="font-display text-lg font-semibold text-emerald-400">FREE ($0.00)</p>
              </div>

              <a
                href="https://maps.google.com/?q=3625+S+Bedford+Ave+Springfield+MO+65809"
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#18181f] hover:bg-[#22222a] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors"
              >
                <Navigation className="h-3 w-3 text-amber-400" />
                <span>Google Maps Directions ↗</span>
              </a>
            </div>
          </div>

          {/* CARD 2: DOORSTEP DELIVERY */}
          <div
            onClick={() => {
              setSelectedMethod("delivery");
              setSelectedTimeSlot(DELIVERY_TIMES[0] || "2:00 PM");
            }}
            className={`relative rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden ${
              selectedMethod === "delivery"
                ? "bg-[#18181f] border-2 border-amber-500/70 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30"
                : "bg-[#121216] border border-white/[0.08] hover:border-white/20 hover:bg-[#15151a]"
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                      selectedMethod === "delivery"
                        ? "bg-amber-500 text-zinc-950 font-semibold"
                        : "bg-white/[0.06] border border-white/10 text-zinc-300"
                    }`}
                  >
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="text-[0.62rem] font-medium text-amber-400 uppercase tracking-wider block">
                      Doorstep Service
                    </span>
                    <h2 className="font-display text-lg font-semibold text-zinc-100">
                      Doorstep Delivery
                    </h2>
                  </div>
                </div>

                {selectedMethod === "delivery" && (
                  <div className="flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-semibold text-zinc-950 shadow-sm">
                    <Check className="h-3 w-3 stroke-[3]" />
                    <span>Selected</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-xl bg-[#18181f] border border-white/[0.06] p-3 text-xs text-zinc-300 font-normal">
                <div className="flex items-start gap-2">
                  <Truck className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-zinc-200">Flat $10 Delivery Fee</p>
                    <p className="text-[0.68rem] text-emerald-400">FREE Delivery for orders of 5+ Handi Trays</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 border-t border-white/[0.04] pt-2">
                  <MapPin className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-zinc-200">10-Mile Springfield Radius</p>
                    <p className="text-[0.68rem] text-zinc-500">Serving Springfield, Galloway, Battlefield & Metro</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 border-t border-white/[0.04] pt-2">
                  <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-zinc-200">Delivery Windows: 2:00 PM – 6:00 PM</p>
                    <p className="text-[0.68rem] text-zinc-500">Dispatched hot in thermal insulated carriers</p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                Enjoy hot royal Dum Biryani handi trays delivered directly to your doorstep, hospital office, medical center, or event venue in Springfield.
              </p>

              {selectedMethod === "delivery" && (
                <div className="space-y-1.5 pt-1 animate-in fade-in duration-200">
                  <Label className="text-[0.65rem] uppercase tracking-wider text-zinc-400 font-medium">
                    Select Delivery Time Window ({nextDate}):
                  </Label>
                  <div className="grid grid-cols-5 gap-1">
                    {DELIVERY_TIMES.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTimeSlot(slot);
                        }}
                        className={`rounded-lg py-1.5 text-xs font-medium border transition-all ${
                          selectedTimeSlot === slot
                            ? "bg-amber-500/15 border-amber-500/50 text-amber-300 font-semibold"
                            : "bg-[#18181f] border-white/[0.06] text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-[0.62rem] text-zinc-500 uppercase tracking-wider block">Standard Fee</span>
                <p className="font-display text-lg font-semibold text-amber-400">$10.00 <span className="text-xs font-normal text-zinc-500">Flat</span></p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMethod("delivery");
                  const inputEl = document.getElementById("zip-checker-input");
                  if (inputEl) inputEl.focus();
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#18181f] hover:bg-[#22222a] px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors"
              >
                <Search className="h-3 w-3 text-amber-400" />
                <span>Check Delivery Zip ↓</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. INTERACTIVE MAP & DELIVERY RADIUS RADAR */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div className="space-y-1">
              <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">Coverage Radius</span>
              <h3 className="font-display text-xl font-semibold text-zinc-100">
                Springfield Delivery Radius & Zones
              </h3>
              <p className="text-xs text-zinc-400 font-normal">
                Hub Location: <strong className="text-zinc-200 font-medium">3625 S Bedford Ave, Springfield, MO 65809</strong>
              </p>
            </div>

            <form onSubmit={handleCheckZip} className="flex gap-2 max-w-sm w-full">
              <Input
                id="zip-checker-input"
                type="text"
                placeholder="Enter Springfield ZIP (e.g. 65804)"
                value={zipCheckInput}
                onChange={(e) => setZipCheckInput(e.target.value)}
                className="bg-[#18181f] border-white/[0.08] text-zinc-200 placeholder:text-zinc-500 text-xs rounded-xl focus:border-amber-500/50"
              />
              <Button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium text-xs px-4 rounded-xl shrink-0"
              >
                Verify
              </Button>
            </form>
          </div>

          {zipCheckResult && (
            <div
              className={`rounded-xl p-3 text-xs flex items-center justify-between border animate-in fade-in duration-200 ${
                zipCheckResult.valid
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                  : "bg-amber-950/40 border-amber-500/30 text-amber-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {zipCheckResult.valid ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                )}
                <span>{zipCheckResult.message}</span>
              </div>
              <button
                onClick={() => setZipCheckResult(null)}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-12 items-center">
            <div className="lg:col-span-6 relative h-72 w-full rounded-2xl bg-[#09090b] border border-white/[0.08] overflow-hidden flex items-center justify-center p-4">
              <div className="absolute h-64 w-64 rounded-full border border-white/[0.06] border-dashed pointer-events-none" />
              <div className="absolute h-44 w-44 rounded-full border border-white/[0.08] pointer-events-none" />
              <div className="absolute h-24 w-24 rounded-full border border-amber-500/30 bg-amber-500/5 pointer-events-none" />

              <span className="absolute top-4 text-[0.62rem] text-zinc-500 uppercase tracking-wider">
                10-Mile Metro Radius ($10)
              </span>
              <span className="absolute top-14 text-[0.62rem] text-zinc-500 uppercase tracking-wider">
                6-Mile District
              </span>
              <span className="absolute top-24 text-[0.62rem] text-amber-400/80 uppercase tracking-wider">
                3-Mile Hub
              </span>

              <div className="relative z-10 flex flex-col items-center">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-zinc-950 shadow-md">
                  <Store className="h-4 w-4" />
                </div>
                <div className="mt-1.5 rounded-lg bg-[#18181f] border border-white/[0.08] px-2.5 py-0.5 text-center shadow-md">
                  <p className="text-[0.7rem] font-medium text-amber-300">JAKLOUD Kitchen</p>
                  <p className="text-[0.6rem] text-zinc-400">3625 S Bedford Ave</p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-2.5">
              {SPRINGFIELD_ZONES.map((zone, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/[0.06] bg-[#18181f] p-3.5 space-y-1 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                      <span className="text-amber-400 font-mono text-[0.7rem]">0{idx + 1}.</span>
                      <span>{zone.name}</span>
                    </h4>
                    <span className="rounded bg-white/[0.06] border border-white/10 px-2 py-0.5 text-[0.62rem] font-medium text-zinc-300">
                      {zone.radius}
                    </span>
                  </div>

                  <p className="text-[0.68rem] text-zinc-400 font-normal">
                    Covered Zip Codes: <span className="text-zinc-200 font-mono">{zone.zipCodes.join(", ")}</span>
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[0.65rem] text-zinc-500 border-t border-white/[0.04]">
                    <span className="text-emerald-400 font-medium">✓ {zone.status}</span>
                    <span>Est. Window: {zone.eta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. CALL TO ACTION & FLOW TRANSITION */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-medium text-amber-400 uppercase tracking-wider">
              Ready to Order?
            </span>
            <h3 className="font-display text-xl font-semibold text-zinc-100">
              Proceed with {selectedMethod === "pickup" ? "Counter Pickup" : "Doorstep Delivery"}
            </h3>
            <p className="text-xs text-zinc-400 font-normal">
              Selected window: <strong className="text-zinc-200 font-medium">{selectedTimeSlot}</strong> on{" "}
              <strong className="text-zinc-200 font-medium">{nextDate}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs px-5 py-4 shadow-md transition-colors gap-1.5"
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
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/50 px-4 py-2 text-xs font-medium text-emerald-400 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>WhatsApp Inquiry</span>
            </a>

            <a
              href={`tel:${BUSINESS.phone}`}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#18181f] hover:bg-[#22222a] px-3.5 py-2 text-xs font-normal text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <Phone className="h-3.5 w-3.5" />
              <span>{BUSINESS.phone}</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
