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
    "Hello Master Chef Kartheek! I would like to order a fresh handcrafted Dum Biryani Handi tray from JAKloud.",
  )}`;

  return (
    <footer className="hidden lg:block mt-6 sm:mt-8 border-t border-zinc-200 bg-zinc-50 text-zinc-800 relative overflow-hidden">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 grid gap-8 md:grid-cols-2 lg:grid-cols-4 relative z-10">
        {/* Column 1: Brand & Craft */}
        <div className="space-y-3.5">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logoImg}
              alt="JAKloud J Paradize seal"
              className="h-10 w-10 rounded-full border border-amber-500/40 bg-white p-0.5 object-cover shadow-sm"
              loading="lazy"
              width={40}
              height={40}
            />
            <div>
              <span className="font-display text-lg font-semibold text-zinc-900 block">
                JAKloud
              </span>
              <span className="block text-[10px] font-bold text-amber-700">
                J Paradize Dum Biryani
              </span>
            </div>
          </Link>

          <p className="text-xs text-zinc-600 leading-relaxed font-normal">
            Springfield's authentic slow-cooked royal Dum Pukht handi trays. Prepared fresh daily with aged saffron basmati and sealed with traditional dough.
          </p>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/70 p-2.5 text-xs text-emerald-900 font-normal">
            <Shield className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>100% Zabiha Halal Certified Poultry & Meats</span>
          </div>
        </div>

        {/* Column 2: Order Channels & Hotline */}
        <div className="space-y-3 text-xs">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-amber-600" /> Contact & Orders
          </h3>

          <div className="space-y-2 pt-1 font-normal">
            <a
              href={`tel:${BUSINESS.phone}`}
              className="flex items-center gap-2 text-zinc-700 hover:text-amber-700 transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Hotline: {BUSINESS.phone}</span>
            </a>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-emerald-700 hover:underline font-medium"
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <span>WhatsApp: +1 417-897-9754</span>
            </a>

            <a
              href={`mailto:${BUSINESS.email}`}
              className="flex items-center gap-2 text-zinc-700 hover:text-amber-700 transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>{BUSINESS.email}</span>
            </a>

            <p className="flex items-start gap-2 text-zinc-600 pt-1">
              <MapPin className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>{BUSINESS.address}</span>
            </p>
          </div>
        </div>

        {/* Column 3: Daily Timing & Cutoffs */}
        <div className="space-y-3 text-xs">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-600" /> Daily Schedule
          </h3>

          <div className="space-y-1.5 pt-1 text-zinc-600 font-normal">
            <p>
              <span className="text-zinc-900 font-medium">Daily Order Cutoff:</span> 2:00 PM
            </p>
            <p>
              <span className="text-zinc-900 font-medium">Counter Pickup:</span> 11:00 AM – 6:00 PM
            </p>
            <p>
              <span className="text-zinc-900 font-medium">Delivery:</span> 2:00 PM – 6:00 PM
            </p>
            <p className="text-[11px] text-emerald-700 font-medium pt-1">
              Open 7 days a week for slow-cooked artisanal Dum Biryani.
            </p>
            <p className="text-[11px] text-zinc-500">
              Limited to 25 Handi Trays daily for slow-cooked perfection.
            </p>
          </div>
        </div>

        {/* Column 4: Quick Navigation & Admin Access */}
        <div className="space-y-3 text-xs">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
            Quick Navigation
          </h3>

          <div className="grid grid-cols-2 gap-2 pt-1 font-normal">
            <Link to="/" className="text-zinc-600 hover:text-amber-700 transition-colors">
              Home
            </Link>
            <Link to="/menu" className="text-zinc-600 hover:text-amber-700 transition-colors">
              Food Menu
            </Link>
            <Link to="/about" className="text-zinc-600 hover:text-amber-700 transition-colors">
              Our Story
            </Link>
            <Link to="/delivery" className="text-zinc-600 hover:text-amber-700 transition-colors">
              Delivery Zones
            </Link>
            <Link to="/contact" className="text-zinc-600 hover:text-amber-700 transition-colors">
              Contact
            </Link>
            <Link to="/cart" className="text-zinc-600 hover:text-amber-700 transition-colors">
              View Cart
            </Link>
          </div>

          <div className="pt-3 border-t border-zinc-200">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-amber-700 hover:underline font-medium"
            >
              <Lock className="h-3 w-3" /> Kitchen Admin Portal →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-zinc-200 bg-zinc-100 py-4 px-6 text-center text-[11px] text-zinc-500 font-normal">
        <p>© {new Date().getFullYear()} JAKloud J Paradize Dum Biryani. All rights reserved. Springfield, Missouri.</p>
      </div>
    </footer>
  );
}
