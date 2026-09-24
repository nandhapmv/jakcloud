import { Link } from "@tanstack/react-router";
import {
  Mail,
  MapPin,
  Phone,
  MessageSquare,
  Shield,
  Sparkles,
  Flame,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  Lock,
  Heart,
} from "lucide-react";

import logoImg from "@/assets/logo.png";
import { BUSINESS } from "@/lib/menu";

export function SiteFooter() {
  const whatsappUrl = `https://wa.me/14178979754?text=${encodeURIComponent(
    "Hello Master Chef Kartheek! I would like to order a fresh handcrafted Dum Biryani Handi tray from JAKLOUD.",
  )}`;

  return (
    <footer className="mt-20 border-t border-gold/25 bg-[#0a0705] text-cream selection:bg-gold/30 selection:text-gold relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gold/5 blur-3xl pointer-events-none" />

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8 grid gap-10 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        {/* Column 1: Brand & Craft */}
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gold/30 blur-sm" />
              <img
                src={logoImg}
                alt="JAKLOUD Spice King heritage seal"
                className="relative h-14 w-14 rounded-full border border-gold/60 bg-cream p-0.5 object-cover shadow-[0_0_15px_rgba(212,160,23,0.35)]"
                loading="lazy"
                width={56}
                height={56}
              />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-wider text-cream block">
                JAKLOUD
              </span>
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-gold">
                Spice King Dum Biryani
              </span>
            </div>
          </Link>

          <p className="text-xs text-cream/75 leading-relaxed">
            Springfield's authentic slow-cooked royal Dum Pukht handi trays. Prepared fresh daily with saffron aged
            basmati, pure desi ghee, and sealed with traditional dough.
          </p>

          <div className="flex items-center gap-2 rounded-xl border border-gold/20 bg-black/40 p-2.5 text-xs text-gold">
            <Shield className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-[0.7rem] font-semibold">100% Zabiha Halal Certified Poultry & Meats</span>
          </div>
        </div>

        {/* Column 2: Order Channels & Hotline */}
        <div className="space-y-3 text-xs">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5" /> Order & Contact Channels
          </h3>

          <div className="space-y-2 pt-1">
            <a
              href={`tel:${BUSINESS.phone}`}
              className="flex items-center gap-2 text-cream/90 hover:text-gold transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-gold shrink-0" />
              <span>Hotline: {BUSINESS.phone}</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-emerald-400 hover:underline"
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span>WhatsApp Direct Chat (+1 417-897-9754)</span>
            </a>

            <a
              href={`mailto:${BUSINESS.email}`}
              className="flex items-center gap-2 text-cream/80 hover:text-gold transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-gold shrink-0" />
              <span>{BUSINESS.email}</span>
            </a>

            <p className="flex items-start gap-2 text-cream/80 pt-1">
              <MapPin className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
              <span>{BUSINESS.address}</span>
            </p>
          </div>
        </div>

        {/* Column 3: Daily Timing & Cutoffs */}
        <div className="space-y-3 text-xs">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> Daily Dum Schedule
          </h3>

          <div className="space-y-1.5 pt-1 text-cream/80">
            <p>
              <span className="text-gold font-semibold">Daily Order Cutoff:</span> 2:00 PM
            </p>
            <p>
              <span className="text-gold font-semibold">Counter Pickup:</span> 11:00 AM – 6:00 PM
            </p>
            <p>
              <span className="text-gold font-semibold">Executive Delivery:</span> 2:00 PM – 6:00 PM
            </p>
            <p className="text-[0.7rem] text-saffron pt-1">
              ⚠️ Closed Wednesdays for fresh spice grinding and marinade preparations.
            </p>
            <p className="text-[0.7rem] text-cream/60">
              Limited to 25 Handi Trays daily to preserve slow-cooked perfection.
            </p>
          </div>
        </div>

        {/* Column 4: Quick Navigation & Admin Access */}
        <div className="space-y-3 text-xs">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-gold">
            Navigation & Social
          </h3>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <Link to="/" className="text-cream/80 hover:text-gold transition-colors">
              Home
            </Link>
            <Link to="/menu" className="text-cream/80 hover:text-gold transition-colors font-semibold text-gold">
              Handi Menu
            </Link>
            <Link to="/validation" className="text-cream/80 hover:text-gold transition-colors">
              Live Capacity
            </Link>
            <Link to="/delivery" className="text-cream/80 hover:text-gold transition-colors">
              Delivery Radar
            </Link>
            <Link to="/about" className="text-cream/80 hover:text-gold transition-colors">
              Our Story
            </Link>
            <Link to="/contact" className="text-cream/80 hover:text-gold transition-colors">
              Location
            </Link>
          </div>

          <div className="pt-2 border-t border-gold/15 space-y-2">
            <p className="text-[0.68rem] text-cream/60">Follow our slow Dum cooking craft:</p>
            <div className="flex items-center gap-3 text-gold">
              <a
                href="https://instagram.com/jakloud_biryani"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-lg bg-black/60 border border-gold/25 flex items-center justify-center hover:bg-gold/20 hover:text-cream transition-colors"
                title="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://facebook.com/jakloudspiceking"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-lg bg-black/60 border border-gold/25 flex items-center justify-center hover:bg-gold/20 hover:text-cream transition-colors"
                title="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://youtube.com/@jakloudspiceking"
                target="_blank"
                rel="noreferrer"
                className="h-8 w-8 rounded-lg bg-black/60 border border-gold/25 flex items-center justify-center hover:bg-gold/20 hover:text-cream transition-colors"
                title="YouTube"
              >
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Subfooter Bar */}
      <div className="border-t border-gold/15 bg-black/60 px-4 py-4 text-xs text-cream/60">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <span>
            © {new Date().getFullYear()} JAKLOUD – Spice King Dum Biryani. Springfield, Missouri. All rights reserved.
          </span>
          <div className="flex items-center gap-4">
            <Link to="/about" className="hover:text-gold transition-colors text-[0.7rem]">
              Halal Standards
            </Link>
            <span className="text-gold/30">•</span>
            <Link
              to="/admin/login"
              className="text-gold hover:underline transition-colors text-[0.7rem] flex items-center gap-1 font-semibold"
            >
              <Lock className="h-3 w-3" /> Kitchen Command Login →
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
