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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JAKLOUD – Spice King Dum Biryani | Made To Order Handi Trays" },
      {
        name: "description",
        content:
          "Springfield's authentic slow-cooked royal Dum Pukht biryani handi trays made to order. 100% Zabiha Halal chicken, mutton, beef or pork. Limited to 25 handi trays daily.",
      },
      { property: "og:title", content: "JAKLOUD – Spice King Dum Biryani (Made To Order)" },
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
  const nextDate = formatDate(nextAvailableDate());

  const whatsappUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    "Hello Master Chef Kartheek! I would like to order a fresh handcrafted Dum Biryani Handi tray from JAKLOUD.",
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
      text: "JAKLOUD’s made-to-order concept is a game changer. Knowing it was slow-cooked specifically for our family gathering rather than sitting in a buffet makes a massive difference in quality.",
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
      <div className="hidden lg:block min-h-screen bg-[#09090b] font-sans text-zinc-100 selection:bg-amber-500/20 selection:text-amber-300 w-full max-w-full overflow-x-hidden">
      {/* ------------------------------------------------------------- */}
      {/* 1. CINEMATIC HERO BANNER                                      */}
      {/* ------------------------------------------------------------- */}
      <section className="relative flex items-center justify-center overflow-hidden border-b border-white/[0.08] py-10 lg:py-12">
        {/* Background Photography */}
        <img
          src={heroImg}
          alt="Cinematic platter of royal Hyderabadi dum biryani"
          className="absolute inset-0 h-full w-full object-cover object-center brightness-40 scale-105"
          width={1920}
          height={1080}
        />

        {/* Dark Multi-Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-[#09090b]/55" />

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 text-center space-y-4 animate-in fade-in-50 duration-700">
          {/* Refined Batch Status Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/80 px-4 py-1.5 backdrop-blur-xl shadow-sm text-xs">
            <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span className="text-amber-300 font-medium">Limited to 25 Handi Trays Daily</span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-300">
              Next Batch: <strong className="text-amber-300 font-semibold">{nextDate}</strong>
            </span>
          </div>

          {/* Display Headline */}
          <div className="space-y-2 max-w-2xl mx-auto">
            <p className="text-[11px] tracking-[0.25em] uppercase text-amber-400 font-semibold">
              JAKLOUD · Royal Culinary Heritage
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-tight text-white text-balance">
              Made To Order <span className="text-amber-400 italic font-normal">Dum Biryani</span>
            </h1>
            <p className="mx-auto max-w-xl text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
              Springfield's authentic slow-cooked royal Dum Pukht handi trays. Prepared with saffron aged basmati,
              whole roasted spices, and sealed with traditional dough for an unforgettable feast.
            </p>
          </div>

          {/* Clean Focused Action Button */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="#menu"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-bold text-xs px-5 py-2.5 h-10 shadow-md hover:brightness-105 transition-all"
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span>Explore Handi Trays ↓</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 py-2.5 text-xs font-semibold text-emerald-400 transition-all shadow-sm h-10"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>WhatsApp Order</span>
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. SCROLLING FOOD CATEGORIES TICKER RIBBON                    */}
      {/* ------------------------------------------------------------- */}
      <div className="border-y border-white/[0.08] bg-[#0c0c0e] py-3 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-8 text-xs font-medium text-zinc-300">
          {[
            "🍗 Royal Chicken Dum Biryani",
            "🍖 Hyderabadi Shahi Mutton Dum",
            "🥩 Slow-Braised Spiced Beef Dum",
            "🥓 Springfield Signature Pork Dum",
            "🧀 Royal Shahi Paneer Dum (Veg)",
            "🦐 Jumbo King Tiger Prawns",
            "🥔 Slow-Steamed Spiced Baby Aloo",
            "🌰 Desi Ghee Roasted Cashews & Birista",
            "🥣 Mirchi Ka Salan & Mint Raita",
            "🍮 Royal Gulab Jamun Dessert",
          ].map((item, idx) => (
            <span key={idx} className="flex items-center gap-3">
              <span>{item}</span>
              <span className="text-amber-500/40">✦</span>
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
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Uncompromising Quality Standard</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-100">
            The Pillars of JAKLOUD Dum Pukht
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
            Every handi tray is crafted in Springfield with centuries-old Nizami culinary techniques, pristine
            ingredients, and rigorous standards.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-4 sm:p-5 shadow-sm hover:border-amber-500/30 transition-all">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 w-fit text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-100">
              100% Zabiha Halal
            </h3>
            <p className="mt-1.5 text-xs text-zinc-400 font-normal leading-relaxed">
              All poultry and red meat cuts are certified 100% Hand-Slaughtered Zabiha Halal from trusted suppliers.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-4 sm:p-5 shadow-sm hover:border-amber-500/30 transition-all">
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-2.5 w-fit text-rose-400">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-100">
              4-Hour Slow Dum Pukht
            </h3>
            <p className="mt-1.5 text-xs text-zinc-400 font-normal leading-relaxed">
              Vessels are sealed with traditional dough to trap natural steam, allowing juices to gently infuse every basmati grain.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-4 sm:p-5 shadow-sm hover:border-amber-500/30 transition-all">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-2.5 w-fit text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-100">
              Pure Kashmiri Saffron & Ghee
            </h3>
            <p className="mt-1.5 text-xs text-zinc-400 font-normal leading-relaxed">
              Layered exclusively with aged long-grain basmati, golden desi ghee, and house-ground whole spices.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-4 sm:p-5 shadow-sm hover:border-amber-500/30 transition-all">
            <div className="rounded-xl bg-zinc-800 border border-white/10 p-2.5 w-fit text-zinc-300">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-100">
              Dedicated Separate Cookware
            </h3>
            <p className="mt-1.5 text-xs text-zinc-400 font-normal leading-relaxed">
              Strictly separate vessels and preparation zones are maintained for specialty cuts and Halal dishes.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. CUSTOMER REVIEWS                                           */}
      {/* ------------------------------------------------------------- */}
      <section className="border-y border-white/[0.08] bg-[#0c0c0e] py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="text-left space-y-1 max-w-2xl">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-medium">
              Verified Patron Testimonials
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-100">
              Loved by Springfield Diners
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal">
              Authentic feedback from local healthcare teams, celebration hosts, and biryani enthusiasts.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.08] bg-[#121216] p-4 sm:p-5 shadow-sm space-y-3 flex flex-col justify-between hover:border-amber-500/30 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>

                <div className="pt-2.5 border-t border-white/[0.06] flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-semibold text-zinc-100">{rev.name}</h4>
                    <p className="text-[11px] text-zinc-400 font-normal">{rev.role}</p>
                  </div>
                  <span className="text-[10px] text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
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
          <span className="text-xs uppercase tracking-wider text-amber-400 font-medium">
            Springfield, MO Hub
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-100">
            Pickup Counter & Delivery Routing
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal">
            Hot-sealed pickup in East Springfield or express delivery within 10 miles.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Pickup Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 shadow-sm space-y-2.5 hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400 border border-amber-500/20">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Springfield Pickup Counter</h3>
                <p className="text-xs text-zinc-400 font-normal">Hot-sealed in thermal containers</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-xs text-zinc-300 font-normal">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{BUSINESS.address}</span>
              </p>
              <p className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Pickup Window: 11:00 AM – 6:00 PM (Order 1 day prior)</span>
              </p>
            </div>

            <div className="pt-1">
              <a
                href="https://maps.google.com/?q=3625+S+Bedford+Ave+Springfield+MO+65809"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-zinc-900/60 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:text-amber-400 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" /> Open in Google Maps ↗
              </a>
            </div>
          </div>

          {/* Delivery Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 shadow-sm space-y-2.5 hover:border-amber-500/30 transition-all">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400 border border-amber-500/20">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-100">Express Doorstep Delivery</h3>
                <p className="text-xs text-zinc-400 font-normal">Delivered piping hot across Springfield</p>
              </div>
            </div>

            <div className="space-y-1.5 pt-1 text-xs text-zinc-300 font-normal">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Flat $10 Delivery within 10 miles of 65809</span>
              </p>
              <p className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Delivery Window: 2:00 PM – 6:00 PM (Scheduled at checkout)</span>
              </p>
            </div>

            <div className="pt-1">
              <Button asChild size="sm" className="rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-medium text-xs">
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
      <section className="border-t border-white/[0.08] bg-[#0c0c0e] py-8 lg:py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
          <div className="text-left space-y-1 max-w-2xl">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-medium">
              Got Questions?
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-100">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 shadow-sm hover:border-amber-500/30 transition-all flex flex-col justify-start"
              >
                <h4 className="text-sm sm:text-base font-semibold text-zinc-100 flex items-start gap-2.5">
                  <span className="text-amber-400 font-mono font-bold shrink-0">0{i + 1}.</span>
                  <span>{faq.q}</span>
                </h4>
                <p className="mt-2 text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
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
