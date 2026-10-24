import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Clock,
  MapPin,
  Soup,
  Truck,
  UtensilsCrossed,
  Phone,
  MessageSquare,
  Sparkles,
  Shield,
  Flame,
  Star,
  CheckCircle2,
  ChevronRight,
  Store,
  Award,
  Heart,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  ArrowRight,
} from "lucide-react";

import heroImg from "@/assets/hero-biryani.jpg";
import { Button } from "@/components/ui/button";
import { MenuSection } from "@/components/menu-section";
import { formatDate, nextAvailableDate, BUSINESS } from "@/lib/menu";
import { MobileAppView } from "@/components/mobile-app-view";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JAKloud – J Paradize Dum Biryani | Made To Order Handi Trays" },
      {
        name: "description",
        content:
          "Springfield's authentic slow-cooked royal Dum Pukht biryani handi trays made to order. 100% Zabiha Halal chicken, mutton, beef or pork. Limited to 25 handi trays daily.",
      },
      { property: "og:title", content: "JAKloud – J Paradize Dum Biryani (Made To Order)" },
      {
        property: "og:description",
        content: "Authentic royal dum biryani handi trays serving 4–5 adults. Made fresh to order in Springfield, Missouri.",
      },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { openTraySelector } = useCart();
  const nextDate = formatDate(nextAvailableDate());

  const whatsappUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    "Hello Master Chef Kartheek! I would like to order a fresh handcrafted Dum Biryani Handi tray from JAKloud.",
  )}`;

  const reviews = [
    {
      name: "Dr. Bradley Hayes",
      role: "CoxHealth Medical Center",
      text: "The aroma when you break open the sealed tray is simply out of this world! We ordered 3 handi trays for our surgery team lunch, and everyone said it was the best biryani in Missouri. The mutton was fall-apart tender.",
      rating: 5,
      dish: "Mutton Dum & Pork Feast Trays",
    },
    {
      name: "Ananya Patel",
      role: "Verified Springfield Patron",
      text: "Authentic Hyderabadi flavor just like home! The rice grains are perfectly separated, fragrant with saffron and ghee, and the spice level was spot on. Adding the extra Aloo is a must-have upgrade!",
      rating: 5,
      dish: "Chicken Dum Biryani (+Aloo)",
    },
    {
      name: "Marcus Vance",
      role: "Executive Catering Host",
      text: "JAKloud’s made-to-order concept is a game changer. Knowing it was slow-cooked specifically for our family gathering rather than sitting in a buffet makes a massive difference in quality.",
      rating: 5,
      dish: "Royal Feast Trays",
    },
  ];

  const faqs = [
    {
      q: "How does 'Made To Order' work?",
      a: "Unlike fast food buffets, Master Chef Kartheek slow-cooks every single Dum Biryani handi tray specifically for your booking. Orders must be placed by 2:00 PM the prior day so that fresh marinades can rest overnight.",
    },
    {
      q: "Why is daily capacity limited to 25 Handi Trays?",
      a: "Authentic Dum Pukht requires 4 hours of gentle slow cooking over low flame with dough-sealed vessels. Limiting production to 25 trays guarantees uncompromising royal flavor, portion generousness, and culinary excellence in every batch.",
    },
    {
      q: "Is the poultry and meat 100% Halal?",
      a: "Yes! All chicken, mutton, and beef are 100% Zabiha Halal certified. We maintain strictly separated, dedicated cooking vessels and preparation zones for all distinct meat cuts.",
    },
    {
      q: "How many people does one Handi Tray serve?",
      a: "Each generous Handi Tray serves 4 to 5 adults comfortably. It contains 1.6 to 1.8 kg of marinated protein, 1 kg of raw aged basmati rice, boiled eggs, roasted cashews, fried onions, raita, and complimentary dessert.",
    },
  ];

  return (
    <>
      {/* Mobile-First App Design (Screens 1 & 2 - Matching User Mockup) */}
      <div className="block lg:hidden w-full max-w-full overflow-x-hidden">
        <MobileAppView />
      </div>

      {/* Desktop Rich Brand Experience */}
      <div className="hidden lg:block min-h-screen bg-[#fbf9f5] font-sans text-zinc-900 selection:bg-amber-500/20 selection:text-amber-800 w-full max-w-full overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* 1. ULTRA-LUXURY SPLIT HERO SECTION (LIGHT / WARM IVORY THEME)  */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#fbf9f5] via-amber-50/30 to-[#fbf9f5] border-b border-zinc-200/80 pt-8 pb-12 lg:pt-14 lg:pb-16">
        {/* Ambient Subtle Warm Glows */}
        <div className="absolute top-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-gradient-to-br from-amber-200/40 via-orange-100/30 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -z-10 h-72 w-72 rounded-full bg-gradient-to-tr from-amber-300/20 via-orange-200/10 to-transparent blur-2xl pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* LEFT COLUMN: Majestic Editorial Typography & CTAs (Col 7) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Status Badge Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50/90 px-3.5 py-1.5 shadow-sm text-xs">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
                </span>
                <span className="text-amber-900 font-bold uppercase tracking-wider text-[11px]">
                  Daily Dum Pukht Heritage
                </span>
                <span className="text-zinc-300">•</span>
                <span className="text-zinc-700 font-medium">
                  Next Batch: <strong className="text-amber-800 font-semibold">{nextDate}</strong>
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-zinc-900 leading-[1.12]">
                  Authentic Slow-Cooked{" "}
                  <span className="block font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 font-normal">
                    Made-To-Order Dum Biryani
                  </span>
                </h1>

                <p className="text-sm sm:text-base text-zinc-600 leading-relaxed max-w-xl font-normal">
                  Springfield's authentic royal culinary feast. Master Chef Kartheek slow-cooks each sealed handi tray with <strong className="text-zinc-900 font-semibold">1.6–1.8 kg of marinated protein</strong>, aged saffron basmati, and traditional dough dum. Freshly prepared to order — never sitting in a buffet.
                </p>
              </div>

              {/* Action Buttons & Order Hotline */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <a
                  href="#menu"
                  onClick={(e) => {
                    e.preventDefault();
                    openTraySelector();
                    const el = document.getElementById("menu");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-extrabold text-sm px-6 py-3.5 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <UtensilsCrossed className="h-4 w-4" />
                  <span>Order Your Handi Tray →</span>
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50/90 hover:bg-emerald-100/80 px-5 py-3.5 text-xs font-bold text-emerald-800 transition-all shadow-sm hover:scale-[1.01]"
                >
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>WhatsApp Chef Kartheek</span>
                </a>
              </div>

              {/* Live Batch Allocation Meter Card */}
              <div className="rounded-2xl border border-amber-200/90 bg-white/90 p-4 shadow-sm backdrop-blur-md space-y-2.5 max-w-lg">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="font-bold text-zinc-900">Today's Kitchen Allocation</span>
                  </div>
                  <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10.5px] font-bold text-emerald-800">
                    ● 19 of 25 Trays Booked (6 Left)
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-600 transition-all duration-1000"
                    style={{ width: "76%" }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1 text-zinc-700">
                    <MapPin className="h-3 w-3 text-amber-600" />
                    Springfield Pickup & Delivery
                  </span>
                  <span className="text-amber-800 font-semibold">
                    Cutoff: 2:00 PM Prior Day
                  </span>
                </div>
              </div>

              {/* Trust Badges Row */}
              <div className="grid grid-cols-3 gap-3 pt-1 max-w-lg">
                <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xs">
                  <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div className="text-left leading-tight">
                    <p className="text-[11px] font-bold text-zinc-900">100% Halal</p>
                    <p className="text-[9.5px] text-zinc-500">Zabiha Certified</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xs">
                  <UtensilsCrossed className="h-4 w-4 text-amber-600 shrink-0" />
                  <div className="text-left leading-tight">
                    <p className="text-[11px] font-bold text-zinc-900">Feeds 4–5</p>
                    <p className="text-[9.5px] text-zinc-500">1.8 kg Meat Tray</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-xs">
                  <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
                  <div className="text-left leading-tight">
                    <p className="text-[11px] font-bold text-zinc-900">Free Aloo</p>
                    <p className="text-[9.5px] text-emerald-700 font-medium">$0.00 Included</p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Splendid Culinary Food Showcase (Col 5) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              {/* Halo Glow */}
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-amber-400/20 via-orange-300/30 to-amber-200/20 blur-2xl -z-10" />

              {/* Main Image Frame */}
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white group">
                <img
                  src={heroImg}
                  alt="Sizzling Royal Hyderabadi Dum Biryani Handi"
                  className="h-80 sm:h-96 w-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Floating Tray Badge Over Image Bottom */}
                <div className="absolute bottom-3 inset-x-3 rounded-2xl bg-white/95 backdrop-blur-md p-3 border border-zinc-200 shadow-lg flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
                      Signature Royal Cut
                    </span>
                    <h3 className="font-display text-sm font-bold text-zinc-900">
                      Dum Handi Tray Platter
                    </h3>
                    <p className="text-[10.5px] text-zinc-500">
                      1.8 kg Meat · Saffron Basmati · 2 Eggs · Salan · Raita
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">From</span>
                    <span className="font-display text-lg font-extrabold text-amber-700">$101.99</span>
                  </div>
                </div>
              </div>

              {/* Floating Pill Top Left */}
              <div className="absolute -top-3 -left-4 rounded-2xl bg-white/95 border border-zinc-200 p-2.5 shadow-lg backdrop-blur-md flex items-center gap-2.5 animate-bounce-subtle">
                <div className="rounded-xl bg-amber-50 p-2 text-amber-700 border border-amber-200">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                </div>
                <div className="text-left pr-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold text-zinc-900">4.9 / 5.0</span>
                    <span className="text-[10px] text-zinc-400">(1,200+ Patrons)</span>
                  </div>
                  <p className="text-[10px] text-zinc-500">Springfield's #1 Biryani</p>
                </div>
              </div>

              {/* Floating Pill Bottom Right */}
              <div className="absolute -bottom-3 -right-4 rounded-2xl bg-white/95 border border-zinc-200 p-2.5 shadow-lg backdrop-blur-md flex items-center gap-2.5">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 border border-emerald-200">
                  <Shield className="h-4 w-4 text-emerald-600" />
                </div>
                <div className="text-left pr-1">
                  <p className="text-xs font-bold text-zinc-900">100% Zabiha Halal</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">Strict Separate Kitchen Pots</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. SCROLLING FOOD CATEGORIES TICKER RIBBON                    */}
      {/* ------------------------------------------------------------- */}
      <div className="border-y border-amber-200/60 bg-gradient-to-r from-amber-50/80 via-white to-amber-50/80 py-3.5 overflow-hidden shadow-xs">
        <div className="flex animate-marquee whitespace-nowrap gap-8 text-xs font-bold text-amber-950">
          {[
            "🍗 Royal Chicken Dum Biryani",
            "🍖 Hyderabadi Shahi Mutton Dum",
            "🥩 Slow-Braised Spiced Beef Dum",
            "🥓 Springfield Signature Pork Dum",
            "🥔 Slow-Steamed Spiced Baby Aloo",
            "🌰 Desi Ghee Roasted Cashews & Birista",
            "🥣 Mirchi Ka Salan & Mint Raita",
            "🍮 Royal Gulab Jamun Dessert",
          ].map((item, idx) => (
            <span key={idx} className="flex items-center gap-3">
              <span>{item}</span>
              <span className="text-amber-500 text-xs">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. HANDI MENU SELECTION (EXACT MOBILE APP DESIGN)             */}
      {/* ------------------------------------------------------------- */}
      <MenuSection />

      {/* ------------------------------------------------------------- */}
      {/* 3. QUALITY STANDARD                                          */}
      {/* ------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-5">
        <div className="text-left space-y-1 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span>Uncompromising Quality Standard</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900">
            The Pillars of JAKloud Dum Pukht
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed">
            Every handi tray is crafted in Springfield with centuries-old Nizami culinary techniques, pristine
            ingredients, and rigorous standards.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 w-fit text-emerald-700">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-900">
              100% Zabiha Halal
            </h3>
            <p className="mt-1.5 text-xs text-zinc-600 font-normal leading-relaxed">
              All poultry and red meat cuts are certified 100% Hand-Slaughtered Zabiha Halal from trusted suppliers.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all">
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 w-fit text-rose-600">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-900">
              4-Hour Slow Dum Pukht
            </h3>
            <p className="mt-1.5 text-xs text-zinc-600 font-normal leading-relaxed">
              Vessels are sealed with traditional dough to trap natural steam, allowing juices to gently infuse every basmati grain.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all">
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-2.5 w-fit text-amber-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-900">
              Pure Kashmiri Saffron & Ghee
            </h3>
            <p className="mt-1.5 text-xs text-zinc-600 font-normal leading-relaxed">
              Layered exclusively with aged long-grain basmati, golden desi ghee, and house-ground whole spices.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all">
            <div className="rounded-xl bg-zinc-100 border border-zinc-200 p-2.5 w-fit text-zinc-700">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-900">
              Dedicated Separate Cookware
            </h3>
            <p className="mt-1.5 text-xs text-zinc-600 font-normal leading-relaxed">
              Strictly separate vessels and preparation zones are maintained for specialty cuts and Halal dishes.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. CUSTOMER REVIEWS                                           */}
      {/* ------------------------------------------------------------- */}
      <section className="border-y border-zinc-200 bg-zinc-50/70 py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="text-left space-y-1 max-w-2xl">
            <span className="text-xs uppercase tracking-wider text-amber-800 font-semibold">
              Verified Patron Testimonials
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900">
              Loved by Springfield Diners
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 font-normal">
              Authentic feedback from local healthcare teams, celebration hosts, and biryani enthusiasts.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-amber-500/40 hover:shadow-md transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 font-normal leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>

                <div className="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-semibold text-zinc-900">{rev.name}</h4>
                    <p className="text-[11px] text-zinc-500 font-normal">{rev.role}</p>
                  </div>
                  <span className="text-[10px] text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {rev.dish}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. PICKUP & DELIVERY LOCATION                                 */}
      {/* ------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-5">
        <div className="text-left space-y-1 max-w-2xl">
          <span className="text-xs uppercase tracking-wider text-amber-800 font-semibold">
            Springfield, MO Hub
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900">
            Pickup Counter & Delivery Routing
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 font-normal">
            Hot-sealed pickup in East Springfield or express delivery within 10 miles.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Pickup Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2.5 hover:border-amber-500/40 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700 border border-amber-200">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Springfield Pickup Counter</h3>
                <p className="text-xs text-zinc-500 font-normal">Hot-sealed in thermal containers</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-xs text-zinc-700 font-normal">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{BUSINESS.address}</span>
              </p>
              <p className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Pickup Window: 11:00 AM – 6:00 PM (Order 1 day prior)</span>
              </p>
            </div>

            <div className="pt-1">
              <a
                href="https://maps.google.com/?q=3625+S+Bedford+Ave+Springfield+MO+65809"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:text-amber-800 hover:bg-zinc-100 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" /> Open in Google Maps ↗
              </a>
            </div>
          </div>

          {/* Delivery Card */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-2.5 hover:border-amber-500/40 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-50 p-2.5 text-amber-700 border border-amber-200">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900">Express Doorstep Delivery</h3>
                <p className="text-xs text-zinc-500 font-normal">Delivered piping hot across Springfield</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-xs text-zinc-700 font-normal">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Flat $10 Delivery within 10 miles of 65809</span>
              </p>
              <p className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Delivery Window: 2:00 PM – 6:00 PM (Scheduled at checkout)</span>
              </p>
            </div>

            <div className="pt-1">
              <Button asChild size="sm" className="rounded-lg bg-amber-500 text-zinc-950 hover:bg-amber-400 font-bold text-xs">
                <Link to="/menu">
                  Book Delivery Handi Tray →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. FREQUENTLY ASKED QUESTIONS                                 */}
      {/* ------------------------------------------------------------- */}
      <section className="border-t border-zinc-200 bg-zinc-50/70 py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="text-left space-y-1 max-w-2xl">
            <span className="text-xs uppercase tracking-wider text-amber-800 font-semibold">
              Got Questions?
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm hover:border-amber-500/40 hover:shadow-md transition-all flex flex-col justify-start"
              >
                <h4 className="text-sm sm:text-base font-semibold text-zinc-900 flex items-start gap-2.5">
                  <span className="text-amber-600 font-mono font-bold shrink-0">0{i + 1}.</span>
                  <span>{faq.q}</span>
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-zinc-600 font-normal leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      </div>
    </>
  );
}
