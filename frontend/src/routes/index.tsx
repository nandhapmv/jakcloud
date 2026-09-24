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
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold">
      {/* ------------------------------------------------------------- */}
      {/* 1. CINEMATIC FULL-WIDTH HERO BANNER                           */}
      {/* ------------------------------------------------------------- */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-gold/20">
        {/* Background Photography with slow scale */}
        <img
          src={heroImg}
          alt="Cinematic platter of royal Hyderabadi dum biryani with saffron basmati, chicken, cashews, and golden eggs"
          className="absolute inset-0 h-full w-full object-cover object-center brightness-60 scale-105 transition-transform duration-10000"
          width={1920}
          height={1080}
        />

        {/* Luxury Black, Gold & Crimson Multi-Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080503] via-[#0d0906]/80 to-[#140b07]/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-black/80 pointer-events-none" />

        {/* Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20 text-center sm:px-8 space-y-6 animate-in fade-in-50 duration-700">
          {/* Floating Heritage Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-black/60 px-4 py-1.5 backdrop-blur-xl shadow-[0_0_20px_rgba(212,160,23,0.3)]">
            <Sparkles className="h-4 w-4 text-gold animate-pulse" />
            <span className="text-[0.7rem] sm:text-xs font-bold uppercase tracking-[0.25em] text-gold">
              Limited to 25 Handcrafted Handi Trays Daily
            </span>
          </div>

          {/* JAKLOUD Crest Logo */}
          <div className="mx-auto flex justify-center">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-chili via-saffron to-gold opacity-60 blur-md animate-pulse" />
              <img
                src={logoImg}
                alt="JAKLOUD Spice King Crest"
                className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full border-2 border-gold bg-cream p-1 object-cover shadow-[0_0_30px_rgba(212,160,23,0.5)]"
                width={112}
                height={112}
              />
            </div>
          </div>

          {/* Bold Display Headline */}
          <div className="space-y-2 max-w-4xl mx-auto">
            <p className="font-display text-xs sm:text-sm uppercase tracking-[0.4em] text-gold font-semibold">
              JAKLOUD · Royal Culinary Heritage
            </p>
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold leading-tight tracking-wide text-cream text-balance drop-shadow-2xl">
              Made To Order <span className="bg-gradient-to-r from-gold via-amber-200 to-gold bg-clip-text text-transparent">Dum Biryani</span>
            </h1>
            <p className="mx-auto max-w-2xl text-sm sm:text-base text-cream/85 font-light leading-relaxed pt-2">
              Springfield's authentic slow-cooked royal Dum Pukht handi trays. Prepared with saffron aged basmati,
              whole roasted spices, and sealed with traditional dough for an unforgettable dining feast.
            </p>
          </div>

          {/* Next Batch Date Pill */}
          <div className="inline-flex items-center gap-2 rounded-xl border border-gold/30 bg-[#170f0a]/90 px-4 py-2 text-xs text-cream/90 shadow-md">
            <Calendar className="h-3.5 w-3.5 text-gold" />
            <span>
              Next Available Dum Handi Batch: <strong className="text-gold font-semibold">{nextDate}</strong>
            </span>
            <span className="hidden sm:inline text-gold/40">•</span>
            <span className="hidden sm:inline text-saffron text-[0.7rem] font-semibold">
              Order by 2:00 PM Cutoff
            </span>
          </div>

          {/* Triple CTA Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {/* Primary Order CTA */}
            <Button
              asChild
              size="lg"
              className="rounded-2xl bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-sm sm:text-base px-8 py-6 shadow-[0_0_25px_rgba(185,28,28,0.4)] hover:scale-105 transition-all gap-2"
            >
              <Link to="/menu">
                <UtensilsCrossed className="h-5 w-5" /> Order Dum Handi Now →
              </Link>
            </Button>

            {/* WhatsApp Order CTA */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-2xl border border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/80 px-6 py-3.5 text-sm sm:text-base font-bold text-emerald-400 hover:border-emerald-400 transition-all shadow-lg hover:scale-105"
            >
              <MessageSquare className="h-5 w-5 text-emerald-400" />
              <span>WhatsApp Order</span>
            </a>

            {/* Call Button */}
            <a
              href={`tel:${BUSINESS.phone}`}
              className="flex items-center gap-2 rounded-2xl border border-gold/40 bg-black/60 hover:bg-gold/20 px-6 py-3.5 text-sm sm:text-base font-semibold text-gold hover:border-gold transition-all shadow-lg hover:scale-105"
            >
              <Phone className="h-5 w-5 text-gold" />
              <span>Call: {BUSINESS.phone}</span>
            </a>
          </div>

          {/* Quick Specifications Strip */}
          <div className="mx-auto max-w-3xl pt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            {[
              { label: "Generous Tray", val: "Serves 4–5 Adults" },
              { label: "Meat Portion", val: "1.6 – 1.8 kg Meat" },
              { label: "Zabiha Halal", val: "100% Certified" },
              { label: "Free Bonus", val: "Chef's Dessert Pack" },
            ].map((spec, i) => (
              <div
                key={i}
                className="rounded-xl border border-gold/20 bg-black/50 p-2.5 backdrop-blur-md text-center sm:text-left"
              >
                <p className="text-[0.65rem] uppercase tracking-wider text-gold font-semibold">{spec.label}</p>
                <p className="text-xs font-bold text-cream mt-0.5">{spec.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. SCROLLING FOOD CATEGORIES TICKER RIBBON                    */}
      {/* ------------------------------------------------------------- */}
      <div className="border-y border-gold/25 bg-gradient-to-r from-[#140e09] via-[#1c120a] to-[#140e09] py-3.5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap gap-8 text-xs font-semibold uppercase tracking-widest text-gold">
          {[
            "🍗 Royal Chicken Dum Biryani",
            "🍖 Hyderabadi Shahi Mutton Dum",
            "🥩 Slow-Braised Spiced Beef Dum",
            "🥓 Springfield Signature Pork Dum",
            "🧀 Royal Shahi Paneer Dum (Veg)",
            "🦐 Jumbo King Tiger Prawns",
            "🥔 Slow-Steamed Spiced Baby Aloo",
            "🌰 Desi Ghee Roasted Cashews & Fried Onions",
            "🥣 Mirchi Ka Salan & Mint Raita",
            "🍮 Royal Gulab Jamun Dessert",
          ].map((item, idx) => (
            <span key={idx} className="flex items-center gap-3">
              <span>{item}</span>
              <span className="text-gold/40">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. 100% ZABIHA HALAL & CULINARY EXCELLENCE GUARANTEE          */}
      {/* ------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.3em] text-gold font-bold">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span>Uncompromising Quality Standard</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cream">
            The Royal Pillars of JAKLOUD Dum Pukht
          </h2>
          <p className="text-xs sm:text-sm text-cream/75 leading-relaxed">
            Every single handi tray is crafted in Springfield with centuries-old Nizam culinary techniques, pristine
            ingredients, and rigorous preparation ethics.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Pillar 1: Halal Certified */}
          <div className="rounded-3xl border border-gold/30 bg-[#120c08]/90 p-6 shadow-2xl backdrop-blur-xl hover:border-gold/60 transition-all group">
            <div className="rounded-2xl bg-emerald-950/60 border border-emerald-500/40 p-3.5 w-fit text-emerald-400 group-hover:scale-110 transition-transform">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-cream">
              100% Zabiha Halal
            </h3>
            <p className="mt-2 text-xs text-cream/70 leading-relaxed">
              All poultry and red meat cuts are certified 100% Hand-Slaughtered Zabiha Halal from trusted suppliers.
            </p>
          </div>

          {/* Pillar 2: 4-Hour Slow Dum */}
          <div className="rounded-3xl border border-gold/30 bg-[#120c08]/90 p-6 shadow-2xl backdrop-blur-xl hover:border-gold/60 transition-all group">
            <div className="rounded-2xl bg-chili/20 border border-chili/40 p-3.5 w-fit text-chili group-hover:scale-110 transition-transform">
              <Flame className="h-6 w-6 animate-pulse" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-cream">
              4-Hour Slow Dum Pukht
            </h3>
            <p className="mt-2 text-xs text-cream/70 leading-relaxed">
              Vessels are sealed with traditional dough to trap natural steam, allowing meat juices to gently infuse
              every basmati grain.
            </p>
          </div>

          {/* Pillar 3: Aged Basmati & Kashmiri Saffron */}
          <div className="rounded-3xl border border-gold/30 bg-[#120c08]/90 p-6 shadow-2xl backdrop-blur-xl hover:border-gold/60 transition-all group">
            <div className="rounded-2xl bg-gold/20 border border-gold/40 p-3.5 w-fit text-gold group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-cream">
              Pure Kashmiri Saffron & Ghee
            </h3>
            <p className="mt-2 text-xs text-cream/70 leading-relaxed">
              Layered exclusively with aged long-grain basmati, golden desi ghee, and house-ground whole spices.
            </p>
          </div>

          {/* Pillar 4: Dedicated Separate Vessels */}
          <div className="rounded-3xl border border-gold/30 bg-[#120c08]/90 p-6 shadow-2xl backdrop-blur-xl hover:border-gold/60 transition-all group">
            <div className="rounded-2xl bg-saffron/20 border border-saffron/40 p-3.5 w-fit text-saffron group-hover:scale-110 transition-transform">
              <UtensilsCrossed className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-cream">
              Dedicated Separate Vessels
            </h3>
            <p className="mt-2 text-xs text-cream/70 leading-relaxed">
              Strictly separate vessels and preparation counters are maintained for specialty cuts and Halal dishes.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. SIGNATURE HANDI MENU SHOWCASE                              */}
      {/* ------------------------------------------------------------- */}
      <section id="menu" className="border-t border-gold/20 bg-[#0e0a07] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-gold/15 pb-6">
            <div>
              <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">
                Limited Daily Batches
              </span>
              <h2 className="mt-1 font-display text-3xl sm:text-5xl font-bold text-cream">
                Signature Dum Handi Trays
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-cream/75 max-w-xl">
                Each tray serves 4–5 adults with 1.6–1.8 kg meat, 1 kg basmati, boiled eggs, roasted cashews, raita,
                salan, and dessert.
              </p>
            </div>

            <Button asChild className="bg-gold text-black hover:bg-gold/90 font-bold text-xs shrink-0 gap-1">
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
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">
            Visual Craftsmanship
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cream">
            The Art of Dum Cooking
          </h2>
          <p className="text-xs sm:text-sm text-cream/75">
            Click any image to inspect the steam, saffron layering, and royal golden garnishes.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {galleryItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setLightboxImg(item)}
              className="group relative rounded-3xl overflow-hidden border border-gold/25 bg-black/60 shadow-xl cursor-pointer hover:border-gold transition-all"
            >
              <img
                src={item.url}
                alt={item.title}
                className="h-64 w-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              <div className="absolute bottom-0 inset-x-0 p-5 space-y-1">
                <span className="rounded-lg bg-gold/20 border border-gold/30 px-2 py-0.5 text-[0.65rem] font-bold text-gold uppercase tracking-wider">
                  {item.category}
                </span>
                <h4 className="font-display text-lg font-bold text-cream group-hover:text-gold transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-cream/70 line-clamp-2">{item.desc}</p>
              </div>

              <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 border border-gold/30 text-gold opacity-0 group-hover:opacity-100 transition-opacity">
                <Eye className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. CUSTOMER REVIEWS & TESTIMONIALS CAROUSEL                   */}
      {/* ------------------------------------------------------------- */}
      <section className="border-y border-gold/20 bg-[#120c08] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">
              Verified Patron Testimonials
            </span>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cream">
              Loved by Springfield Diners
            </h2>
            <p className="text-xs sm:text-sm text-cream/75">
              Read authentic feedback from local medical teams, celebration hosts, and biryani enthusiasts.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {reviews.map((rev, i) => (
              <div
                key={i}
                className="rounded-3xl border border-gold/25 bg-[#170f0a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-gold">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-cream/85 italic leading-relaxed">
                    "{rev.text}"
                  </p>
                </div>

                <div className="pt-4 border-t border-gold/15 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-cream text-sm">{rev.name}</h4>
                    <p className="text-[0.7rem] text-gold">{rev.role}</p>
                  </div>
                  <span className="text-[0.65rem] text-cream/50 bg-black/40 px-2 py-1 rounded-lg border border-gold/15">
                    {rev.dish}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. PICKUP LOCATION & GOOGLE MAPS DELIVERY PREVIEW             */}
      {/* ------------------------------------------------------------- */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">
            Springfield, MO Hub
          </span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-cream">
            Pickup Counter & Delivery Routing
          </h2>
          <p className="text-xs sm:text-sm text-cream/75">
            Convenient hot-sealed pickup in East Springfield or express delivery within 10 miles.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Pickup Card */}
          <div className="rounded-3xl border border-gold/30 bg-[#120c08] p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gold/15 p-3 text-gold border border-gold/30">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-cream">Springfield Pickup Counter</h3>
                <p className="text-xs text-gold">Freshly hot-sealed in golden thermal bags</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs text-cream/80">
              <p className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span className="font-medium">{BUSINESS.address}</span>
              </p>
              <p className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>Pickup Window: 11:00 AM – 6:00 PM (Order 1 day prior)</span>
              </p>
            </div>

            <div className="pt-2">
              <a
                href="https://maps.google.com/?q=3625+S+Bedford+Ave+Springfield+MO+65809"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-gold/40 bg-black/60 px-4 py-2 text-xs font-semibold text-gold hover:bg-gold/15 transition-colors"
              >
                <MapPin className="h-3.5 w-3.5" /> Open in Google Maps ↗
              </a>
            </div>
          </div>

          {/* Delivery Card */}
          <div className="rounded-3xl border border-gold/30 bg-[#120c08] p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-chili/20 p-3 text-chili border border-chili/30">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-cream">Express Doorstep Delivery</h3>
                <p className="text-xs text-saffron">Delivered piping hot across Springfield</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 text-xs text-cream/80">
              <p className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Flat $10 Delivery within 10 miles of 65809</span>
              </p>
              <p className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>Delivery Window: 2:00 PM – 6:00 PM (Scheduled at checkout)</span>
              </p>
            </div>

            <div className="pt-2">
              <Button asChild size="sm" className="bg-gradient-to-r from-chili to-gold text-white font-bold text-xs">
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
      <section className="border-t border-gold/20 bg-[#0e0a07] py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.3em] text-gold font-bold">
              Got Questions?
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-cream">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-2xl border border-gold/20 bg-[#140e09] p-5 space-y-2 text-xs shadow-lg"
              >
                <h4 className="font-display text-base font-bold text-gold flex items-center gap-2">
                  <span className="text-saffron font-mono">0{i + 1}.</span> {faq.q}
                </h4>
                <p className="text-cream/80 leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. FLOATING WHATSAPP BUTTON                                   */}
      {/* ------------------------------------------------------------- */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 sm:px-5 sm:py-3.5 shadow-[0_0_30px_rgba(16,185,129,0.5)] border-2 border-emerald-300 hover:scale-110 transition-all group"
        title="Order via WhatsApp Direct"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
        </span>
        <MessageSquare className="h-5 w-5" />
        <span className="hidden sm:inline font-bold text-xs tracking-wider uppercase">
          Order on WhatsApp
        </span>
      </a>

      {/* ------------------------------------------------------------- */}
      {/* 10. LIGHTBOX PHOTO MODAL                                      */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={!!lightboxImg} onOpenChange={(open) => !open && setLightboxImg(null)}>
        <DialogContent className="border-gold/30 bg-[#140e09] text-cream sm:max-w-2xl p-0 overflow-hidden">
          {lightboxImg && (
            <div>
              <img src={lightboxImg.url} alt={lightboxImg.title} className="h-80 w-full object-cover" />
              <div className="p-6 space-y-2 text-xs">
                <DialogTitle className="font-display text-2xl font-bold text-cream">
                  {lightboxImg.title}
                </DialogTitle>
                <DialogDescription className="text-cream/75 text-xs leading-relaxed">
                  {lightboxImg.desc}
                </DialogDescription>
                <div className="pt-4 flex justify-between items-center border-t border-gold/15">
                  <Button asChild className="bg-gold text-black hover:bg-gold/90 font-bold text-xs">
                    <Link to="/menu">Order This Dish →</Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setLightboxImg(null)}
                    className="border-gold/30 text-cream/80 text-xs"
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
  );
}
