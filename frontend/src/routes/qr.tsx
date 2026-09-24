import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Sparkles,
  Shield,
  Phone,
  MessageSquare,
  MessageCircle,
  UtensilsCrossed,
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  Star,
  Plus,
  Share2,
  Wifi,
  ChevronRight,
  Info,
  Calendar,
  Layers,
  Store,
  Truck,
  Heart,
  QrCode,
  ArrowRight,
  AlertCircle,
  Check,
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import heroImg from "@/assets/hero-biryani.jpg";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";

import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { BUSINESS, formatDate, nextAvailableDate, formatMoney, MENU } from "@/lib/menu";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "Welcome to JAKLOUD — QR Code Mobile Ordering" },
      {
        name: "description",
        content:
          "Scan confirmed! Welcome to JAKLOUD Spice King Dum Biryani. Order your handcrafted Dum Biryani Handi tray for Springfield pickup or doorstep delivery.",
      },
      { property: "og:title", content: "JAKLOUD QR Mobile Ordering Hub" },
      { property: "og:description", content: "Order handcrafted royal dum biryani handi trays direct from your phone." },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: QrWelcomePage,
});

export function QrWelcomePage() {
  const { addLine, count } = useCart();
  const navigate = useNavigate();
  const nextDate = formatDate(nextAvailableDate());

  // Interactive Table/Pickup Mode
  const [serviceType, setServiceType] = useState<"table" | "pickup" | "delivery">("pickup");
  const [tableNumber, setTableNumber] = useState<string>("Table 1");
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick Order WhatsApp URL
  const whatsappUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    `Hello Master Chef Kartheek! I just scanned the JAKLOUD QR Stand (${serviceType === "table" ? tableNumber : serviceType.toUpperCase()}). I would like to order a handcrafted Dum Biryani Handi tray.`,
  )}`;

  // SMS Text to Order URL
  const smsUrl = `sms:14178979754?&body=${encodeURIComponent(
    `Hello JAKLOUD! I scanned the QR Code (${serviceType === "table" ? tableNumber : serviceType.toUpperCase()}) and want to order a Dum Biryani Handi Tray.`,
  )}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "JAKLOUD – Spice King Dum Biryani",
          text: "Check out JAKLOUD Dum Biryani Handi Trays made to order in Springfield, MO!",
          url: window.location.href,
        });
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("QR Link copied to clipboard!");
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const quickDishes = [
    {
      id: "chicken" as const,
      name: "Royal Chicken Dum Biryani",
      price: 101.99,
      image: chickenImg,
      servings: "Serves 4–5",
      meat: "1.6 – 1.8 kg Chicken",
      halal: true,
    },
    {
      id: "mutton" as const,
      name: "Hyderabadi Shahi Mutton Dum",
      price: 157.99,
      image: muttonImg,
      servings: "Serves 4–5",
      meat: "1.6 – 1.8 kg Mutton",
      halal: true,
    },
    {
      id: "beef" as const,
      name: "Slow-Braised Spiced Beef Dum",
      price: 122.99,
      image: rawBeefImg,
      servings: "Serves 4–5",
      meat: "1.6 – 1.8 kg Beef",
      halal: true,
    },
    {
      id: "pork" as const,
      name: "Springfield Signature Pork Dum",
      price: 108.99,
      image: rawPorkImg,
      servings: "Serves 4–5",
      meat: "1.6 – 1.8 kg Pork",
      halal: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold relative overflow-hidden pb-16">
      {/* Background Ambience Photography with Dark Gold/Crimson Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <img
          src={heroImg}
          alt="Cinematic Dum Biryani"
          className="h-full w-full object-cover object-center opacity-25 brightness-40 blur-[2px] scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#080503]/90 via-[#0d0906]/95 to-[#080503]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gradient-to-b from-gold/15 via-chili/10 to-transparent blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 mx-auto max-w-lg px-4 pt-6 sm:pt-10 space-y-6">
        {/* ========================================================================= */}
        {/* 1. QR CODE SCANNER SUCCESS HEADER BANNER                                 */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/80 via-[#0f1d14]/90 to-emerald-950/80 p-3.5 sm:p-4 backdrop-blur-2xl shadow-[0_0_30px_rgba(16,185,129,0.25)] flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-400">
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[0.65rem] uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1">
                <span>QR Scanner Verified</span>
                <span>•</span>
                <span className="text-cream/90 font-mono">Live Session</span>
              </p>
              <h2 className="font-display text-sm font-bold text-cream">
                Connected to JAKLOUD Kitchen
              </h2>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/50 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all text-xs"
              title="Share QR Hub"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. RESTAURANT HERO BRANDING & WELCOME CARD                               */}
        {/* ========================================================================= */}
        <div className="relative rounded-3xl border border-gold/30 bg-gradient-to-b from-[#170f0a]/95 via-[#120c08]/90 to-[#0d0906]/95 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl text-center space-y-5 overflow-hidden">
          {/* Subtle Decorative Golden Corner Accents */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gold/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-chili/10 rounded-full blur-2xl pointer-events-none" />

          {/* Logo with Golden Glowing Halo */}
          <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28">
            <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-chili via-saffron to-gold opacity-75 blur-md animate-pulse" />
            <img
              src={logoImg}
              alt="JAKLOUD Spice King Dum Biryani Crest"
              className="relative h-full w-full rounded-full border-2 border-gold bg-cream p-1 object-cover shadow-[0_0_25px_rgba(212,160,23,0.5)]"
              width={112}
              height={112}
            />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-black/60 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-gold shadow-sm">
              <Sparkles className="h-3 w-3 text-gold" />
              <span>Royal Dum Pukht Heritage</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-wide text-cream">
              JAKLOUD – Spice King
            </h1>

            <p className="font-display text-xs uppercase tracking-[0.25em] text-gold font-semibold">
              Made To Order Dum Biryani
            </p>

            <p className="text-xs text-cream/75 leading-relaxed max-w-sm mx-auto pt-1">
              Welcome! Every royal handi tray is slow-cooked over gentle flame by Master Chef Kartheek with saffron aged basmati and dough-sealed steam pots.
            </p>
          </div>

          {/* Today's Availability & Live Capacity Meter */}
          <div className="rounded-2xl border border-gold/25 bg-black/50 p-3.5 space-y-2.5 text-xs text-left">
            <div className="flex items-center justify-between">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-gold" /> Today's Dum Batch Status
              </span>
              <span className="rounded-md bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[0.62rem] font-bold text-emerald-400">
                ● Accepting Orders
              </span>
            </div>

            {/* Capacity Progress Bar (19 of 25 trays) */}
            <div className="space-y-1">
              <div className="flex justify-between text-[0.7rem] text-cream/80 font-medium">
                <span>Handi Tray Allocation:</span>
                <span className="text-gold font-bold">19 / 25 Booked (6 Left)</span>
              </div>
              <div className="h-2 w-full rounded-full bg-black/80 overflow-hidden border border-gold/20 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-gold to-chili transition-all duration-1000"
                  style={{ width: "76%" }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 text-[0.68rem] text-cream/70 border-t border-gold/15">
              <span className="flex items-center gap-1 text-gold">
                <Calendar className="h-3 w-3" /> Next Batch: <strong>{nextDate}</strong>
              </span>
              <span className="text-saffron font-semibold">2:00 PM Cutoff</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. ORDERING CHANNEL / SERVICE LOCATION SELECTOR                           */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-4 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-display font-bold text-gold uppercase tracking-wider flex items-center gap-1.5">
              <Store className="h-3.5 w-3.5 text-gold" /> Select Fulfilment Method
            </span>
            <span className="text-[0.68rem] text-cream/50">Springfield, MO</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "pickup", label: "Counter Pickup", icon: Store, note: "Bedford Ave" },
              { id: "delivery", label: "Home Delivery", icon: Truck, note: "Within 10 mi" },
              { id: "table", label: "Table Dine-In", icon: UtensilsCrossed, note: "Scan & Eat" },
            ].map((method) => {
              const Icon = method.icon;
              const isSelected = serviceType === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setServiceType(method.id as any)}
                  className={`rounded-2xl p-2.5 text-center transition-all border ${
                    isSelected
                      ? "bg-gradient-to-b from-gold/25 to-gold/10 border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)] text-cream"
                      : "bg-black/40 border-gold/15 text-cream/70 hover:bg-black/60"
                  }`}
                >
                  <Icon className={`h-4 w-4 mx-auto mb-1 ${isSelected ? "text-gold" : "text-cream/50"}`} />
                  <p className="text-[0.7rem] font-bold leading-tight">{method.label}</p>
                  <p className="text-[0.6rem] text-gold/80 mt-0.5">{method.note}</p>
                </button>
              );
            })}
          </div>

          {serviceType === "table" && (
            <div className="pt-2 flex items-center gap-2 border-t border-gold/15">
              <label className="text-[0.7rem] text-gold font-semibold shrink-0">Table / Stand #:</label>
              <select
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="flex-1 rounded-xl bg-black/60 border border-gold/30 text-cream px-3 py-1.5 text-xs focus:border-gold outline-none"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={`Table ${i + 1}`} className="bg-[#120c08] text-cream">
                    Table {i + 1} (Main Dining & Patio)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. QUADRUPLE DIRECT ORDERING BUTTONS (MOBILE-FIRST)                      */}
        {/* ========================================================================= */}
        <div className="space-y-2.5">
          {/* PRIMARY ORDER NOW (DIGITAL MENU) */}
          <Button
            asChild
            size="lg"
            className="w-full h-auto rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-base py-4 shadow-[0_0_25px_rgba(185,28,28,0.4)] hover:scale-[1.02] transition-all flex items-center justify-between px-6 group"
          >
            <Link to="/menu">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-black/30 p-2 text-gold">
                  <UtensilsCrossed className="h-5 w-5" />
                </div>
                <div className="text-left leading-tight">
                  <p className="text-xs uppercase tracking-wider text-amber-200">Interactive Menu</p>
                  <p className="text-base font-bold text-white">Order Online Now →</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gold group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>

          {/* WHATSAPP ORDER */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full rounded-2xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/80 via-[#0a2414]/90 to-emerald-950/80 hover:bg-emerald-900/80 px-5 py-3.5 text-emerald-300 hover:border-emerald-400 transition-all shadow-lg hover:scale-[1.01] flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/20 border border-emerald-400/40 p-2 text-emerald-400">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="text-left leading-tight">
                <p className="text-[0.65rem] uppercase tracking-wider text-emerald-400/80 font-bold">Instant Chef Chat</p>
                <p className="text-sm font-bold text-white">WhatsApp Order Direct</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/90 border border-emerald-500/40 rounded-lg px-2.5 py-1">
              Live Chat
            </span>
          </a>

          {/* CALL & TEXT TWO-COLUMN GRID */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* CALL TO ORDER */}
            <a
              href={`tel:${BUSINESS.phone}`}
              className="rounded-2xl border border-gold/35 bg-black/60 hover:bg-gold/15 px-4 py-3 text-gold hover:border-gold transition-all shadow-md flex items-center gap-2.5 hover:scale-[1.01]"
            >
              <div className="rounded-xl bg-gold/15 p-2 text-gold shrink-0">
                <Phone className="h-4 w-4" />
              </div>
              <div className="text-left leading-tight min-w-0">
                <p className="text-[0.62rem] uppercase tracking-wider text-cream/60 font-semibold">Voice Call</p>
                <p className="text-xs font-bold text-gold truncate">Call to Order</p>
              </div>
            </a>

            {/* TEXT TO ORDER (SMS) */}
            <a
              href={smsUrl}
              className="rounded-2xl border border-amber-500/35 bg-black/60 hover:bg-amber-500/15 px-4 py-3 text-amber-300 hover:border-amber-400 transition-all shadow-md flex items-center gap-2.5 hover:scale-[1.01]"
            >
              <div className="rounded-xl bg-amber-500/15 p-2 text-amber-400 shrink-0">
                <MessageCircle className="h-4 w-4" />
              </div>
              <div className="text-left leading-tight min-w-0">
                <p className="text-[0.62rem] uppercase tracking-wider text-cream/60 font-semibold">Direct SMS</p>
                <p className="text-xs font-bold text-amber-300 truncate">Text to Order</p>
              </div>
            </a>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. QUICK-ADD SIGNATURE DISHES                                             */}
        {/* ========================================================================= */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-chili" />
              <h3 className="font-display text-base font-bold text-cream">Chef's Signature Trays</h3>
            </div>
            <Link to="/menu" className="text-xs text-gold hover:underline font-semibold flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {quickDishes.map((dish) => (
              <div
                key={dish.id}
                className="rounded-2xl border border-gold/25 bg-[#140e09] p-3 shadow-lg flex gap-3 items-center group hover:border-gold/60 transition-all"
              >
                <img
                  src={dish.image}
                  alt={dish.name}
                  className="h-16 w-16 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform"
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-display text-xs font-bold text-cream truncate">{dish.name}</h4>
                    {dish.halal && (
                      <span className="shrink-0 text-[0.6rem] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        Halal
                      </span>
                    )}
                  </div>
                  <p className="text-[0.65rem] text-cream/60">{dish.servings} · {dish.meat}</p>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="font-display text-xs font-bold text-gold">{formatMoney(dish.price)}</span>
                    <button
                      onClick={() => {
                        addLine({
                          proteinId: dish.id,
                          name: dish.name,
                          aloo: false,
                          extraSpicy: false,
                          notes: `QR Welcome Quick-Add (${serviceType === "table" ? tableNumber : serviceType.toUpperCase()})`,
                          qty: 1,
                          unitPrice: dish.price,
                        });
                        toast.success(`${dish.name} added to your Handi Order!`);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-chili to-gold text-white px-2.5 py-1 text-[0.65rem] font-bold hover:scale-105 transition-all shadow-sm"
                    >
                      <Plus className="h-3 w-3" /> Quick Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6. ROYAL CULINARY PROMISE & HALAL BADGE                                  */}
        {/* ========================================================================= */}
        <div className="rounded-3xl border border-gold/25 bg-gradient-to-br from-[#150e0a] to-[#0d0906] p-4 sm:p-5 backdrop-blur-xl space-y-3">
          <div className="flex items-center gap-2 text-gold font-display text-sm font-bold">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>The JAKLOUD Quality Guarantee</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[0.68rem] text-cream/80">
            <div className="flex items-start gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>100% Zabiha Halal poultry & meats</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Check className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
              <span>Sealed dough-pot 4-hour slow Dum</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Check className="h-3.5 w-3.5 text-saffron shrink-0 mt-0.5" />
              <span>Generously feeds 4–5 adults</span>
            </div>
            <div className="flex items-start gap-1.5">
              <Check className="h-3.5 w-3.5 text-amber-300 shrink-0 mt-0.5" />
              <span>Complimentary royal dessert pack</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7. QUICK ASSISTANCE & WI-FI BAR                                          */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between gap-2 text-[0.7rem] text-cream/60 px-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-gold" />
            <span>3625 S Bedford Ave, Springfield</span>
          </div>

          <button
            onClick={() => {
              toast.info("Guest Wi-Fi: 'JAKLOUD-GUEST' • Password: 'spicekingbiryani'");
            }}
            className="flex items-center gap-1 text-gold hover:underline cursor-pointer font-medium"
          >
            <Wifi className="h-3.5 w-3.5" />
            <span>Wi-Fi Access</span>
          </button>
        </div>

        {/* Floating Cart Pill if items added */}
        {count > 0 && (
          <div className="fixed bottom-4 inset-x-4 max-w-md mx-auto z-50 animate-in slide-in-from-bottom-5 duration-300">
            <Button
              asChild
              className="w-full rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-sm py-4 shadow-[0_0_30px_rgba(212,160,23,0.6)] flex items-center justify-between px-5"
            >
              <Link to="/checkout">
                <span className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-gold text-xs font-bold">
                    {count}
                  </span>
                  <span>{count === 1 ? "1 Handi Tray in Order" : `${count} Handi Trays in Order`}</span>
                </span>
                <span className="flex items-center gap-1">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
