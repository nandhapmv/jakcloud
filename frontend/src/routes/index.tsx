import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
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
  Eye,
  X,
} from "lucide-react";

import heroImg from "@/assets/hero-biryani.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";
import logoImg from "@/assets/logo.png";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";

import { Button } from "@/components/ui/button";
import { MenuSection } from "@/components/menu-section";
import { formatDate, nextAvailableDate, BUSINESS } from "@/lib/menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
  const [lightboxImg, setLightboxImg] = useState<{ url: string; title: string; desc: string } | null>(null);

  const whatsappUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    "Hello Master Chef Kartheek! I would like to order a fresh handcrafted Dum Biryani Handi tray from JAKLOUD.",
  )}`;

  const galleryItems = [
    {
      url: chickenImg,
      title: "Royal Chicken Dum Biryani",
      desc: "Slow-cooked bone-in chicken thighs layered in fragrant saffron basmati rice with whole spices.",
      category: "Signature Handi",
    },
    {
      url: muttonImg,
      title: "Hyderabadi Shahi Mutton Dum",
      desc: "Tender baby goat cuts slow-braised for 4 hours in pure desi ghee and roasted spice marinades.",
      category: "Feast Tray",
    },
    {
      url: dumHandiImg,
      title: "Traditional Sealed Dum Handi",
      desc: "Clay vessel sealed with whole wheat dough to trap steam and infuse pure floral saffron aromatics.",
      category: "Culinary Craft",
    },
    {
      url: paneerImg,
      title: "Royal Shahi Paneer Dum",
      desc: "Fresh golden paneer cubes with spiced baby potatoes and royal Mughlai saffron gravy.",
      category: "Vegetarian Royal",
    },
    {
      url: prawnImg,
      title: "Jumbo King Tiger Prawn Dum",
      desc: "Succulent ocean tiger prawns marinated in coastal spices and layered in aged long-grain basmati.",
      category: "Seafood Specialty",
    },
    {
      url: heroImg,
      title: "Ghee Roasted Garnishes Platter",
      desc: "Golden fried crispy onions (birista), toasted whole cashews, boiled eggs, and fresh mint leaves.",
      category: "Gourmet Plating",
    },
  ];

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
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden border-b border-white/[0.08]">
        {/* Background Photography */}
        <img
          src={heroImg}
          alt="Cinematic platter of royal Hyderabadi dum biryani"
          className="absolute inset-0 h-full w-full object-cover object-center brightness-50 scale-105 transition-transform duration-10000"
          width={1920}
          height={1080}
        />

        {/* Dark Multi-Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-[#09090b]/50" />

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 text-center space-y-6 animate-in fade-in-50 duration-700">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/60 px-4 py-1.5 backdrop-blur-xl shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-medium text-amber-300">
              Limited to 25 Handcrafted Handi Trays Daily
            </span>
          </div>

          {/* JAKLOUD Crest Logo */}
          <div className="mx-auto flex justify-center">
            <img
              src={logoImg}
              alt="JAKLOUD Spice King Crest"
              className="relative h-20 w-20 rounded-full border border-amber-500/40 bg-zinc-900 p-1 object-cover shadow-xl"
              width={80}
              height={80}
            />
          </div>

          {/* Display Headline */}
          <div className="space-y-3 max-w-3xl mx-auto">
            <p className="text-xs tracking-widest uppercase text-amber-400 font-medium">
              JAKLOUD · Royal Culinary Heritage
            </p>
            <h1 className="font-display text-4xl sm:text-6xl font-semibold leading-tight text-white text-balance">
              Made To Order <span className="text-amber-400 italic font-normal">Dum Biryani</span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-zinc-300 font-normal leading-relaxed">
              Springfield's authentic slow-cooked royal Dum Pukht handi trays. Prepared with saffron aged basmati,
              whole roasted spices, and sealed with traditional dough for an unforgettable feast.
            </p>
          </div>

          {/* Next Batch Date Pill */}
          <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-2 text-xs text-zinc-300 shadow-sm">
            <Calendar className="h-3.5 w-3.5 text-amber-400" />
            <span>
              Next Available Batch: <strong className="text-amber-300 font-medium">{nextDate}</strong>
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-400 text-xs font-normal">
              Order by 2:00 PM Cutoff
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-semibold text-sm px-7 py-5 shadow-md hover:brightness-105 transition-all gap-2 cursor-pointer"
            >
              <Link to="/menu">
                <UtensilsCrossed className="h-4 w-4" /> Order Dum Handi Now →
              </Link>
            </Button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 px-5 py-3 text-sm font-medium text-emerald-400 transition-all shadow-sm"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              <span>WhatsApp Order</span>
            </a>

            <a
              href={`tel:${BUSINESS.phone}`}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 hover:text-amber-400 transition-all shadow-sm"
            >
              <Phone className="h-4 w-4 text-amber-400" />
              <span>Call: {BUSINESS.phone}</span>
            </a>
          </div>

          {/* Specifications Strip */}
          <div className="mx-auto max-w-3xl pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            {[
              { label: "Generous Tray", val: "Serves 4–5 Adults" },
              { label: "Meat Portion", val: "1.6 – 1.8 kg Meat" },
              { label: "Zabiha Halal", val: "100% Certified" },
              { label: "Free Bonus", val: "Chef's Dessert Pack" },
            ].map((spec, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.08] bg-zinc-900/50 p-3 backdrop-blur-md text-center sm:text-left"
              >
                <p className="text-[10px] uppercase tracking-wider text-amber-400 font-medium">{spec.label}</p>
                <p className="text-xs font-semibold text-zinc-100 mt-0.5">{spec.val}</p>
              </div>
            ))}
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
      {/* 3. QUALITY STANDARD                                          */}
      {/* ------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-medium">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Uncompromising Quality Standard</span>
          </div>
          <h2 className="font-display text-3xl font-semibold text-zinc-100">
            The Pillars of JAKLOUD Dum Pukht
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
            Every handi tray is crafted in Springfield with centuries-old Nizami culinary techniques, pristine
            ingredients, and rigorous standards.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 shadow-sm hover:border-amber-500/30 transition-all">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 w-fit text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-100">
              100% Zabiha Halal
            </h3>
            <p className="mt-1.5 text-xs text-zinc-400 font-normal leading-relaxed">
              All poultry and red meat cuts are certified 100% Hand-Slaughtered Zabiha Halal from trusted suppliers.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 shadow-sm hover:border-amber-500/30 transition-all">
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 w-fit text-rose-400">
              <Flame className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-100">
              4-Hour Slow Dum Pukht
            </h3>
            <p className="mt-1.5 text-xs text-zinc-400 font-normal leading-relaxed">
              Vessels are sealed with traditional dough to trap natural steam, allowing juices to gently infuse every basmati grain.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 shadow-sm hover:border-amber-500/30 transition-all">
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 w-fit text-amber-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-zinc-100">
              Pure Kashmiri Saffron & Ghee
            </h3>
            <p className="mt-1.5 text-xs text-zinc-400 font-normal leading-relaxed">
              Layered exclusively with aged long-grain basmati, golden desi ghee, and house-ground whole spices.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 shadow-sm hover:border-amber-500/30 transition-all">
            <div className="rounded-xl bg-zinc-800 border border-white/10 p-3 w-fit text-zinc-300">
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
      {/* 4. SIGNATURE HANDI MENU SHOWCASE                              */}
      {/* ------------------------------------------------------------- */}
      <section id="menu" className="border-t border-white/[0.08] bg-[#0c0c0e] py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-medium">
                Limited Daily Batches
              </span>
              <h2 className="mt-1 font-display text-2xl sm:text-4xl font-semibold text-zinc-100">
                Signature Dum Handi Trays
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 font-normal max-w-xl">
                Each tray serves 4–5 adults with 1.6–1.8 kg meat, 1 kg basmati, boiled eggs, roasted cashews, raita,
                salan, and dessert.
              </p>
            </div>

            <Button asChild className="rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-medium text-xs shrink-0 gap-1">
              <Link to="/menu">
                View Full Menu & Pricing →
              </Link>
            </Button>
          </div>

          {/* Integrated Menu Section */}
          <MenuSection />
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. INTERACTIVE FOOD GALLERY PREVIEW                           */}
      {/* ------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 space-y-10">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-wider text-amber-400 font-medium">
            Visual Craftsmanship
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-100">
            The Art of Dum Cooking
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 font-normal">
            Click any image to inspect the steam, saffron layering, and royal golden garnishes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxImg(item)}
              className="group relative rounded-2xl overflow-hidden border border-white/[0.08] bg-zinc-900/60 shadow-sm cursor-pointer hover:border-amber-500/40 transition-all"
            >
              <img
                src={item.url}
                alt={item.title}
                className="h-60 w-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              <div className="absolute bottom-0 inset-x-0 p-4 space-y-1">
                <span className="rounded-md bg-zinc-900/80 border border-white/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                  {item.category}
                </span>
                <h4 className="font-semibold text-sm text-zinc-100 group-hover:text-amber-300 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-400 line-clamp-1 font-normal">{item.desc}</p>
              </div>

              <div className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 border border-white/10 text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. CUSTOMER REVIEWS                                           */}
      {/* ------------------------------------------------------------- */}
      <section className="border-y border-white/[0.08] bg-[#0c0c0e] py-16">
        <div className="mx-auto max-w-7xl px-6 sm:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
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

          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
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
      <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
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

        <div className="grid gap-5 md:grid-cols-2">
          {/* Pickup Card */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-6 shadow-sm space-y-3">
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
          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-6 shadow-sm space-y-3">
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
      <section className="border-t border-white/[0.08] bg-[#0c0c0e] py-16">
        <div className="mx-auto max-w-4xl px-6 sm:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-medium">
              Got Questions?
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-zinc-100">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/[0.08] bg-[#121216] p-4 space-y-1.5 text-xs shadow-sm"
              >
                <h4 className="text-xs sm:text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <span className="text-amber-400 font-mono">0{i + 1}.</span> {faq.q}
                </h4>
                <p className="text-zinc-400 font-normal leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. LIGHTBOX PHOTO MODAL                                       */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={!!lightboxImg} onOpenChange={(open) => !open && setLightboxImg(null)}>
        <DialogContent className="border-white/10 bg-[#121216] text-zinc-100 sm:max-w-2xl p-0 overflow-hidden">
          {lightboxImg && (
            <div>
              <img src={lightboxImg.url} alt={lightboxImg.title} className="h-80 w-full object-cover" />
              <div className="p-5 space-y-2 text-xs">
                <DialogTitle className="text-lg font-semibold text-zinc-100">
                  {lightboxImg.title}
                </DialogTitle>
                <DialogDescription className="text-zinc-400 text-xs leading-relaxed font-normal">
                  {lightboxImg.desc}
                </DialogDescription>
                <div className="pt-3 flex justify-between items-center border-t border-white/10">
                  <Button asChild className="rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-medium text-xs">
                    <Link to="/menu">Order This Dish →</Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLightboxImg(null)}
                    className="border-white/10 text-zinc-400 text-xs font-normal"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </>
  );
}
