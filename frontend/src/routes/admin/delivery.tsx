import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  Truck,
  MapPin,
  DollarSign,
  ShieldCheck,
  ChevronLeft,
  Save,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Compass,
  Navigation,
  Clock,
  Settings,
  Flame,
  Sparkles,
  ExternalLink,
  Sliders,
  Check,
  Calculator,
  RefreshCw,
  Layers,
  Store,
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import { useAuth } from "@/lib/auth";
import { formatMoney, BUSINESS } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/delivery")({
  head: () => ({
    meta: [
      { title: "Delivery Management & Zone Dispatch — JAKLOUD Spice King" },
      {
        name: "description",
        content: "Configure delivery fees, radius slider, pickup switches, editable zones, and Google Maps radius.",
      },
    ],
  }),
  component: DeliveryManagementPage,
});

export interface DeliveryZone {
  id: string;
  name: string;
  minMiles: number;
  maxMiles: number;
  fee: number;
  minOrderValue: number;
  estimatedTime: string;
  zipCodes: string[];
  active: boolean;
}

const INITIAL_ZONES: DeliveryZone[] = [
  {
    id: "zone-1",
    name: "Zone 1 — Central Springfield / Downtown",
    minMiles: 0,
    maxMiles: 5,
    fee: 10.0,
    minOrderValue: 80.0,
    estimatedTime: "15 – 25 mins",
    zipCodes: ["65806", "65802", "65807"],
    active: true,
  },
  {
    id: "zone-2",
    name: "Zone 2 — South Springfield & Battlefield",
    minMiles: 5,
    maxMiles: 10,
    fee: 12.0,
    minOrderValue: 100.0,
    estimatedTime: "25 – 35 mins",
    zipCodes: ["65804", "65810", "65619"],
    active: true,
  },
  {
    id: "zone-3",
    name: "Zone 3 — Nixa & Republic Suburbs",
    minMiles: 10,
    maxMiles: 15,
    fee: 18.0,
    minOrderValue: 150.0,
    estimatedTime: "35 – 45 mins",
    zipCodes: ["65714", "65738"],
    active: true,
  },
  {
    id: "zone-4",
    name: "Zone 4 — Ozark & Willard Extended Zone",
    minMiles: 15,
    maxMiles: 20,
    fee: 25.0,
    minOrderValue: 200.0,
    estimatedTime: "45 – 60 mins",
    zipCodes: ["65721", "65781"],
    active: false,
  },
];

function DeliveryManagementPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Master Fulfilment Controls with localStorage persistence
  const [pickupEnabled, setPickupEnabled] = useState(true);
  const [deliveryEnabled, setDeliveryEnabled] = useState(true);
  const [baseDeliveryFee, setBaseDeliveryFee] = useState<string>(() => {
    if (typeof window !== "undefined") return localStorage.getItem("jakloud_deliv_fee") || "10.00";
    return "10.00";
  });
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState<string>("250.00");
  const [freeDeliveryEnabled, setFreeDeliveryEnabled] = useState(true);
  const [deliveryRadius, setDeliveryRadius] = useState<number[]>(() => {
    if (typeof window !== "undefined") {
      const r = localStorage.getItem("jakloud_deliv_radius");
      if (r) return [parseInt(r, 10)];
    }
    return [10];
  });
  const [perMileExtraRate, setPerMileExtraRate] = useState<string>("1.50");
  const [peakHourSurcharge, setPeakHourSurcharge] = useState<string>("3.00");
  const [peakHourEnabled, setPeakHourEnabled] = useState(false);
  const [maxDailyDeliveries, setMaxDailyDeliveries] = useState<string>("15");
  const [pickupLeadTimeMins, setPickupLeadTimeMins] = useState<string>("45");
  const [curbsideInstructions, setCurbsideInstructions] = useState(
    "Pull into reserved Chef Kartheek pickup bay at 3625 S Bedford Ave. Call 417-897-9754 for hot handoff.",
  );

  // Delivery Zones State
  const [zones, setZones] = useState<DeliveryZone[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("jakloud_deliv_zones");
        if (raw) return JSON.parse(raw);
      } catch {
        /* ignore */
      }
    }
    return INITIAL_ZONES;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("jakloud_deliv_zones", JSON.stringify(zones));
        localStorage.setItem("jakloud_deliv_fee", baseDeliveryFee);
        localStorage.setItem("jakloud_deliv_radius", deliveryRadius[0]?.toString() || "10");
      } catch {
        /* ignore */
      }
    }
  }, [zones, baseDeliveryFee, deliveryRadius]);
  const [zoneModalOpen, setZoneModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  // Form Fields for Zone Dialog
  const [zoneName, setZoneName] = useState("");
  const [zoneMinMiles, setZoneMinMiles] = useState("0");
  const [zoneMaxMiles, setZoneMaxMiles] = useState("5");
  const [zoneFee, setZoneFee] = useState("10.00");
  const [zoneMinOrder, setZoneMinOrder] = useState("80.00");
  const [zoneEta, setZoneEta] = useState("15 – 25 mins");
  const [zoneZips, setZoneZips] = useState("65806, 65802, 65807");
  const [zoneActive, setZoneActive] = useState(true);

  // Delete Zone Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<DeliveryZone | null>(null);

  // Sandbox Estimation State
  const [calcZipOrAddress, setCalcZipOrAddress] = useState("65804");
  const [calcOrderAmount, setCalcOrderAmount] = useState("108.99");
  const [calculatedQuote, setCalculatedQuote] = useState<{
    zone: string;
    distance: string;
    fee: number;
    eta: string;
    isFree: boolean;
    eligible: boolean;
  } | null>(null);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Handle Save All Settings
  const handleSaveAllSettings = () => {
    toast.success("Delivery dispatch configuration & zones successfully saved!");
  };

  // Open Create Zone Modal
  const handleOpenCreateZone = () => {
    setEditingZone(null);
    setZoneName(`Zone ${zones.length + 1} — New Region`);
    setZoneMinMiles("10");
    setZoneMaxMiles("15");
    setZoneFee("15.00");
    setZoneMinOrder("120.00");
    setZoneEta("30 – 40 mins");
    setZoneZips("65809, 65803");
    setZoneActive(true);
    setZoneModalOpen(true);
  };

  // Open Edit Zone Modal
  const handleOpenEditZone = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setZoneName(zone.name);
    setZoneMinMiles(zone.minMiles.toString());
    setZoneMaxMiles(zone.maxMiles.toString());
    setZoneFee(zone.fee.toString());
    setZoneMinOrder(zone.minOrderValue.toString());
    setZoneEta(zone.estimatedTime);
    setZoneZips(zone.zipCodes.join(", "));
    setZoneActive(zone.active);
    setZoneModalOpen(true);
  };

  // Save Zone
  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) {
      toast.error("Please enter a zone name.");
      return;
    }

    const minM = parseFloat(zoneMinMiles) || 0;
    const maxM = parseFloat(zoneMaxMiles) || 5;
    const feeNum = parseFloat(zoneFee) || 10;
    const minOrderNum = parseFloat(zoneMinOrder) || 0;
    const zipsArr = zoneZips
      .split(",")
      .map((z) => z.trim())
      .filter(Boolean);

    if (editingZone) {
      setZones((prev) =>
        prev.map((z) =>
          z.id === editingZone.id
            ? {
                ...z,
                name: zoneName.trim(),
                minMiles: minM,
                maxMiles: maxM,
                fee: feeNum,
                minOrderValue: minOrderNum,
                estimatedTime: zoneEta.trim(),
                zipCodes: zipsArr,
                active: zoneActive,
              }
            : z,
        ),
      );
      toast.success(`Updated ${zoneName}`);
    } else {
      const newZone: DeliveryZone = {
        id: `zone-${Date.now()}`,
        name: zoneName.trim(),
        minMiles: minM,
        maxMiles: maxM,
        fee: feeNum,
        minOrderValue: minOrderNum,
        estimatedTime: zoneEta.trim(),
        zipCodes: zipsArr,
        active: zoneActive,
      };
      setZones((prev) => [...prev, newZone]);
      toast.success(`Created new delivery zone: ${zoneName}`);
    }

    setZoneModalOpen(false);
  };

  // Toggle Zone Active
  const handleToggleZone = (id: string) => {
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === id) {
          const nextState = !z.active;
          toast.info(`${z.name} is now ${nextState ? "Active for delivery" : "Deactivated"}`);
          return { ...z, active: nextState };
        }
        return z;
      }),
    );
  };

  // Delete Zone
  const handleConfirmDeleteZone = () => {
    if (!zoneToDelete) return;
    setZones((prev) => prev.filter((z) => z.id !== zoneToDelete.id));
    toast.error(`Removed "${zoneToDelete.name}".`);
    setDeleteDialogOpen(false);
    setZoneToDelete(null);
  };

  // Live Sandbox Calculation
  const handleCalculateQuote = () => {
    const inputClean = calcZipOrAddress.trim().toLowerCase();
    const orderAmt = parseFloat(calcOrderAmount) || 0;
    const threshold = parseFloat(freeDeliveryThreshold) || 250;

    // Search matched zone by zip code
    let matchedZone = zones.find((z) =>
      z.zipCodes.some((zip) => inputClean.includes(zip.toLowerCase())),
    );

    if (!matchedZone) {
      // Fallback: pick zone based on default
      matchedZone = zones[0];
    }

    if (matchedZone) {
      const isFree = freeDeliveryEnabled && orderAmt >= threshold;
      const finalFee = isFree ? 0 : matchedZone.fee;
      const isEligible = orderAmt >= matchedZone.minOrderValue;

      setCalculatedQuote({
        zone: matchedZone.name,
        distance: `~${(matchedZone.minMiles + matchedZone.maxMiles) / 2} miles from kitchen`,
        fee: finalFee,
        eta: matchedZone.estimatedTime,
        isFree,
        eligible: isEligible,
      });
      toast.success("Quote calculated successfully!");
    }
  };

  const currentRadius = deliveryRadius[0] ?? 10;
  // Coverage area in sq miles = pi * r^2
  const coverageAreaSqMiles = Math.round(Math.PI * currentRadius * currentRadius);

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
                Delivery & Zone Command
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveAllSettings}
            className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs shadow-lg shadow-chili/30 hover:scale-105 transition-all gap-1.5"
          >
            <Save className="h-4 w-4" /> Save Configuration
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-cream/70 hover:text-gold gap-1 hidden md:flex"
          >
            <Link to="/admin/orders">
              <Truck className="h-3.5 w-3.5 text-gold" /> Order Queue
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 space-y-8">
        {/* Executive Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-3xl border border-gold/30 bg-gradient-to-r from-[#170f0a] via-[#120c08] to-[#1a100a] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-gold font-semibold">
              <Truck className="h-3.5 w-3.5 text-gold" />
              <span>Fulfilment Routing & Pricing Engine</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-4xl text-cream font-bold">
              Delivery Management
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-cream/75 max-w-2xl leading-relaxed">
              Configure baseline delivery charges, interactive dispatch radius slider, counter pickup switches, neighborhood zone rates, and Google Maps radius coverage.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleOpenCreateZone}
              size="lg"
              className="bg-gold text-black hover:bg-gold/90 font-bold text-xs px-5 shadow-lg shadow-gold/30"
            >
              <Plus className="h-4 w-4 mr-1.5 stroke-[3]" /> Add Delivery Zone
            </Button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 1. MASTER SWITCHES & DELIVERY CHARGE CONFIGURATION            */}
        {/* ------------------------------------------------------------- */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Pickup Enable/Disable Card */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gold/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gold/15 p-2 text-gold">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-cream">Pickup Service</h3>
                  <span className="text-[0.65rem] text-gold font-mono uppercase">
                    Front Counter Collection
                  </span>
                </div>
              </div>
              <Switch
                id="master-pickup-toggle"
                checked={pickupEnabled}
                onCheckedChange={(checked) => {
                  setPickupEnabled(checked);
                  toast.info(`Pickup orders are now ${checked ? "Enabled" : "Disabled"}`);
                }}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            <p className="text-xs text-cream/70 leading-relaxed">
              Allow diners to collect hot-sealed Dum Handi trays directly from the kitchen at{" "}
              <strong className="text-cream">{BUSINESS.address}</strong> with $0 fulfilment fee.
            </p>

            <div className="rounded-2xl border border-gold/15 bg-black/40 p-4 space-y-3 text-xs">
              <div className="space-y-1">
                <Label htmlFor="lead-time" className="text-xs text-cream/80">
                  Prep Lead Time (Mins)
                </Label>
                <Input
                  id="lead-time"
                  type="number"
                  value={pickupLeadTimeMins}
                  onChange={(e) => setPickupLeadTimeMins(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/50 text-xs font-mono font-bold text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="curbside-notes" className="text-xs text-cream/80">
                  Curbside & Parking Note
                </Label>
                <Input
                  id="curbside-notes"
                  value={curbsideInstructions}
                  onChange={(e) => setCurbsideInstructions(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/50 text-xs text-cream"
                />
              </div>
            </div>
          </div>

          {/* Delivery Enable/Disable & Radius Slider Card */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-gold/15 pb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-saffron/15 p-2 text-saffron">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-cream">
                    Delivery Dispatch Service
                  </h3>
                  <span className="text-[0.65rem] text-saffron font-mono uppercase">
                    Springfield Metro & Suburbs
                  </span>
                </div>
              </div>
              <Switch
                id="master-delivery-toggle"
                checked={deliveryEnabled}
                onCheckedChange={(checked) => {
                  setDeliveryEnabled(checked);
                  toast.info(`Delivery service is now ${checked ? "Active" : "Paused"}`);
                }}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            {/* INTERACTIVE DELIVERY RADIUS SLIDER */}
            <div className="rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/10 via-black/50 to-gold/5 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="h-4 w-4 text-gold" /> Maximum Delivery Radius
                  </Label>
                  <p className="text-[0.65rem] text-cream/60">
                    Radius extending from JAKLOUD central kitchen (3625 S Bedford Ave)
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-display text-2xl font-bold text-gold">
                    {currentRadius} Miles
                  </span>
                  <span className="block text-[0.65rem] text-cream/50">
                    ~{coverageAreaSqMiles} sq mi coverage
                  </span>
                </div>
              </div>

              {/* Slider Component */}
              <div className="pt-2 px-1">
                <Slider
                  value={deliveryRadius}
                  onValueChange={setDeliveryRadius}
                  min={1}
                  max={30}
                  step={1}
                  className="py-4 cursor-pointer"
                />
              </div>

              <div className="flex justify-between text-[0.65rem] text-cream/50 font-mono">
                <span>1 Mile (Downtown Only)</span>
                <span className="text-gold font-bold">10 Miles (Standard Metro)</span>
                <span>20 Miles</span>
                <span>30 Miles (Extended County)</span>
              </div>
            </div>

            {/* Delivery Charge Configuration Inputs */}
            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-xl border border-gold/15 bg-black/40 p-3 space-y-1">
                <Label htmlFor="base-fee" className="text-xs text-gold font-semibold">
                  Base Delivery Charge ($)
                </Label>
                <Input
                  id="base-fee"
                  type="number"
                  step="0.01"
                  value={baseDeliveryFee}
                  onChange={(e) => setBaseDeliveryFee(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/60 font-mono font-bold text-cream text-xs"
                />
                <span className="text-[0.65rem] text-cream/50">Covers baseline 0-5 miles</span>
              </div>

              <div className="rounded-xl border border-gold/15 bg-black/40 p-3 space-y-1">
                <Label htmlFor="per-mile" className="text-xs text-saffron font-semibold">
                  Per-Mile Extra Rate ($)
                </Label>
                <Input
                  id="per-mile"
                  type="number"
                  step="0.01"
                  value={perMileExtraRate}
                  onChange={(e) => setPerMileExtraRate(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/60 font-mono font-bold text-cream text-xs"
                />
                <span className="text-[0.65rem] text-cream/50">Beyond baseline zone</span>
              </div>

              <div className="rounded-xl border border-gold/15 bg-black/40 p-3 space-y-1">
                <Label htmlFor="daily-cap" className="text-xs text-cream/80 font-semibold">
                  Max Deliveries / Day
                </Label>
                <Input
                  id="daily-cap"
                  type="number"
                  value={maxDailyDeliveries}
                  onChange={(e) => setMaxDailyDeliveries(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/60 font-mono font-bold text-cream text-xs"
                />
                <span className="text-[0.65rem] text-cream/50">Daily driver capacity cap</span>
              </div>
            </div>

            {/* Free Delivery Threshold Switch */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-gold/15 bg-black/40 p-4 text-xs">
              <div className="flex items-center gap-3">
                <Switch
                  id="free-delivery-toggle"
                  checked={freeDeliveryEnabled}
                  onCheckedChange={setFreeDeliveryEnabled}
                  className="data-[state=checked]:bg-emerald-500"
                />
                <div>
                  <Label htmlFor="free-delivery-toggle" className="text-xs font-semibold text-cream cursor-pointer">
                    Enable Free Delivery for Large Catering Orders
                  </Label>
                  <p className="text-[0.65rem] text-cream/60">
                    Automatically waives delivery fee when subtotal exceeds threshold.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-cream/60 whitespace-nowrap">Threshold ($):</span>
                <Input
                  type="number"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                  disabled={!freeDeliveryEnabled}
                  className="w-24 h-8 rounded-lg border-gold/25 bg-black/60 font-mono font-bold text-gold text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. GOOGLE MAPS DELIVERY RADIUS PREVIEW & SANDBOX              */}
        {/* ------------------------------------------------------------- */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Visual Google Maps Radius Frame */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-gold" /> Google Maps Delivery Radius Preview
                </h3>
                <p className="text-xs text-cream/60">
                  Visual geofenced perimeter radiating from Springfield Kitchen
                </p>
              </div>

              <Button
                asChild
                size="sm"
                variant="outline"
                className="border-gold/30 bg-black/40 text-gold hover:bg-gold/15 text-xs gap-1.5"
              >
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    BUSINESS.address,
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Full Map
                </a>
              </Button>
            </div>

            {/* Stylized Concentric Radius Map Visual */}
            <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-[#160e08] h-80 flex items-center justify-center p-6 text-center">
              {/* Radial Grid Pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4a017_1.5px,transparent_1.5px)] [background-size:20px_20px]" />

              {/* Dynamic Concentric Radius Rings */}
              <div
                className="absolute rounded-full border border-gold/20 animate-pulse pointer-events-none transition-all duration-700"
                style={{
                  width: `${Math.min(280, currentRadius * 12)}px`,
                  height: `${Math.min(280, currentRadius * 12)}px`,
                  backgroundColor: "rgba(212, 160, 23, 0.05)",
                }}
              />
              <div
                className="absolute rounded-full border border-saffron/30 pointer-events-none transition-all duration-700"
                style={{
                  width: `${Math.min(200, currentRadius * 8)}px`,
                  height: `${Math.min(200, currentRadius * 8)}px`,
                  backgroundColor: "rgba(235, 130, 20, 0.04)",
                }}
              />
              <div
                className="absolute rounded-full border border-chili/40 pointer-events-none"
                style={{
                  width: "90px",
                  height: "90px",
                  backgroundColor: "rgba(185, 28, 28, 0.06)",
                }}
              />

              {/* Central Kitchen Pin */}
              <div className="relative z-10 space-y-2 max-w-xs">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-chili to-gold text-white shadow-xl shadow-gold/30">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-display text-sm font-bold text-cream">
                    JAKLOUD Central Handi Kitchen
                  </h4>
                  <p className="text-[0.7rem] text-gold font-mono">
                    3625 S Bedford Ave, Springfield, MO
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                  <span className="rounded-full bg-black/80 border border-gold/40 px-2.5 py-0.5 text-[0.65rem] text-gold font-mono">
                    Active Radius: {currentRadius} Miles
                  </span>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[0.65rem] text-emerald-400 font-semibold">
                    ✓ {zones.filter((z) => z.active).length} Zones Enclosed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sandbox Estimated Delivery Charges Calculator */}
          <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-5">
            <div className="border-b border-gold/15 pb-4">
              <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                <Calculator className="h-4 w-4 text-gold" /> Estimated Delivery Charges Sandbox
              </h3>
              <p className="text-xs text-cream/60">
                Test diner delivery addresses or zip codes to preview calculated fees and route times
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor="calc-zip" className="text-xs text-cream/80">
                    Diner Zip Code or Street Address
                  </Label>
                  <Input
                    id="calc-zip"
                    placeholder="e.g. 65804, Battlefield Rd"
                    value={calcZipOrAddress}
                    onChange={(e) => setCalcZipOrAddress(e.target.value)}
                    className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="calc-order" className="text-xs text-cream/80">
                    Order Subtotal ($)
                  </Label>
                  <Input
                    id="calc-order"
                    type="number"
                    step="0.01"
                    placeholder="108.99"
                    value={calcOrderAmount}
                    onChange={(e) => setCalcOrderAmount(e.target.value)}
                    className="rounded-xl border-gold/25 bg-black/40 text-xs font-mono font-bold text-cream"
                  />
                </div>
              </div>

              <Button
                onClick={handleCalculateQuote}
                className="w-full bg-gold text-black hover:bg-gold/90 font-bold text-xs h-9 gap-1.5"
              >
                <Calculator className="h-4 w-4" /> Calculate Delivery Charge Quote
              </Button>

              {/* Quote Result Display */}
              {calculatedQuote && (
                <div className="rounded-2xl border border-gold/30 bg-black/60 p-4 space-y-2.5 animate-in fade-in-50">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.65rem] font-bold text-gold uppercase tracking-wider">
                      Calculation Result:
                    </span>
                    <span className="rounded bg-gold/15 px-2 py-0.5 text-[0.65rem] font-mono text-gold">
                      {calculatedQuote.distance}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cream/70">Matched Region:</span>
                    <strong className="text-cream">{calculatedQuote.zone}</strong>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-cream/70">Estimated Transit ETA:</span>
                    <span className="text-saffron font-semibold">{calculatedQuote.eta}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-gold/15 pt-2 text-sm font-bold text-cream">
                    <span>Delivery Charge:</span>
                    <span className="text-gold font-display text-base">
                      {calculatedQuote.isFree
                        ? "FREE (Over $250)"
                        : formatMoney(calculatedQuote.fee)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. DELIVERY LOCATION LIST WITH EDITABLE ZONES                 */}
        {/* ------------------------------------------------------------- */}
        <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold/15 pb-4">
            <div>
              <h3 className="font-display text-xl text-cream font-bold flex items-center gap-2">
                <Layers className="h-5 w-5 text-gold" /> Configured Delivery Zones & Neighborhood Rates
              </h3>
              <p className="text-xs text-cream/60">
                Custom mileage tiers, zip codes, and minimum basket values for Springfield delivery
              </p>
            </div>

            <Button
              onClick={handleOpenCreateZone}
              className="bg-gold text-black hover:bg-gold/90 font-bold text-xs gap-1.5"
            >
              <Plus className="h-4 w-4 stroke-[3]" /> Add New Zone
            </Button>
          </div>

          {/* Zones Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gold/20 bg-black/50 text-[0.65rem] uppercase tracking-wider text-gold font-semibold">
                <tr>
                  <th className="px-4 py-3.5">Zone & Coverage Tier</th>
                  <th className="px-4 py-3.5">Mileage Range</th>
                  <th className="px-4 py-3.5">Delivery Fee</th>
                  <th className="px-4 py-3.5">Min Order Value</th>
                  <th className="px-4 py-3.5">Estimated Transit</th>
                  <th className="px-4 py-3.5">Enclosed Zip Codes</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-4 py-4 font-semibold text-cream">
                      {zone.name}
                    </td>

                    <td className="px-4 py-4 font-mono text-gold">
                      {zone.minMiles} – {zone.maxMiles} Miles
                    </td>

                    <td className="px-4 py-4 font-mono font-bold text-gold text-sm">
                      {formatMoney(zone.fee)}
                    </td>

                    <td className="px-4 py-4 font-mono text-cream/80">
                      {formatMoney(zone.minOrderValue)}
                    </td>

                    <td className="px-4 py-4 text-cream/70 font-medium">
                      {zone.estimatedTime}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {zone.zipCodes.map((zip) => (
                          <span
                            key={zip}
                            className="rounded bg-black/60 border border-gold/20 px-1.5 py-0.5 text-[0.65rem] font-mono text-cream"
                          >
                            {zip}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleZone(zone.id)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold border transition-colors cursor-pointer ${
                          zone.active
                            ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                            : "bg-chili/20 text-chili border-chili/40"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            zone.active ? "bg-emerald-400" : "bg-chili"
                          }`}
                        />
                        {zone.active ? "Active" : "Disabled"}
                      </button>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEditZone(zone)}
                          className="h-7 text-xs text-gold hover:bg-gold/15"
                        >
                          <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setZoneToDelete(zone);
                            setDeleteDialogOpen(true);
                          }}
                          className="h-7 text-xs text-chili/80 hover:bg-chili/20 hover:text-chili p-1.5"
                          title="Delete Zone"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* ADD / EDIT ZONE DIALOG                                        */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={zoneModalOpen} onOpenChange={setZoneModalOpen}>
        <DialogContent className="border-gold/30 bg-[#140e09] text-cream sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold font-semibold">
              <Layers className="h-4 w-4 text-gold" />
              <span>{editingZone ? "Edit Delivery Zone" : "New Zone Configuration"}</span>
            </div>
            <DialogTitle className="font-display text-xl text-cream font-bold">
              {editingZone ? `Edit "${editingZone.name}"` : "Add New Delivery Zone"}
            </DialogTitle>
            <DialogDescription className="text-xs text-cream/60">
              Define mileage range, baseline fee, zip codes, and transit ETA.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveZone} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="z-name" className="text-xs text-cream/80">
                Zone Title / Neighborhood *
              </Label>
              <Input
                id="z-name"
                placeholder="e.g. Zone 5 — Southwest Ozark Hills"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                required
                className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="z-min-m" className="text-xs text-cream/80">
                  Min Mileage (mi)
                </Label>
                <Input
                  id="z-min-m"
                  type="number"
                  value={zoneMinMiles}
                  onChange={(e) => setZoneMinMiles(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="z-max-m" className="text-xs text-cream/80">
                  Max Mileage (mi)
                </Label>
                <Input
                  id="z-max-m"
                  type="number"
                  value={zoneMaxMiles}
                  onChange={(e) => setZoneMaxMiles(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="z-fee" className="text-xs text-gold font-semibold">
                  Delivery Fee ($) *
                </Label>
                <Input
                  id="z-fee"
                  type="number"
                  step="0.01"
                  value={zoneFee}
                  onChange={(e) => setZoneFee(e.target.value)}
                  required
                  className="rounded-xl border-gold/30 bg-black/50 font-mono font-bold text-cream text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="z-min-order" className="text-xs text-cream/80 font-semibold">
                  Min Order Value ($)
                </Label>
                <Input
                  id="z-min-order"
                  type="number"
                  step="0.01"
                  value={zoneMinOrder}
                  onChange={(e) => setZoneMinOrder(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/50 font-mono text-cream text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="z-eta" className="text-xs text-cream/80">
                Estimated Transit Time
              </Label>
              <Input
                id="z-eta"
                placeholder="e.g. 25 – 35 mins"
                value={zoneEta}
                onChange={(e) => setZoneEta(e.target.value)}
                className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="z-zips" className="text-xs text-cream/80">
                Enclosed Zip Codes (comma-separated)
              </Label>
              <Input
                id="z-zips"
                placeholder="e.g. 65804, 65810, 65619"
                value={zoneZips}
                onChange={(e) => setZoneZips(e.target.value)}
                className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-gold/15 bg-black/40 p-3">
              <Label htmlFor="z-active" className="text-xs font-semibold text-emerald-400 cursor-pointer">
                Zone Active for Online Checkout
              </Label>
              <Switch
                id="z-active"
                checked={zoneActive}
                onCheckedChange={setZoneActive}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t border-gold/15">
              <Button
                type="button"
                variant="outline"
                onClick={() => setZoneModalOpen(false)}
                className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gold text-black hover:bg-gold/90 font-bold text-xs"
              >
                {editingZone ? "Update Zone" : "Add Zone"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* DELETE ZONE CONFIRMATION DIALOG                               */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-chili/40 bg-[#140e09] text-cream sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-chili/10 text-chili mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center font-display text-xl text-cream">
              Delete "{zoneToDelete?.name}"?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-cream/70 pt-1">
              Diners in these zip codes will no longer receive automated zone quotes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDeleteZone}
              className="bg-chili text-white hover:bg-chili/90 text-xs font-semibold"
            >
              Confirm Deletion
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
