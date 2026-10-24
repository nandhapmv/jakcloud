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
    <footer className="hidden lg:block mt-4 sm:mt-6 border-t border-zinc-200 bg-white text-zinc-800 relative z-10 shadow-sm">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4 relative z-10">
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

          {/* Social Media Channels with Original Brand Colors */}
          <div className="pt-2 space-y-2">
            <span className="text-[11px] font-semibold text-zinc-800 uppercase tracking-wider block">
              Follow & Connect
            </span>
            <div className="flex items-center gap-2.5">
              {/* Instagram with Official Gradient */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                title="Follow on Instagram"
                aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-110 active:scale-95"
                style={{
                  background:
                    "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
                }}
              >
                <Instagram className="h-4 w-4 stroke-[2.2]" />
              </a>

              {/* Facebook with Official Brand Blue */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                title="Follow on Facebook"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-110 active:scale-95 bg-[#1877F2]"
              >
                <Facebook className="h-4 w-4 fill-current stroke-none" />
              </a>

              {/* YouTube with Official Brand Red */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                title="Watch on YouTube"
                aria-label="YouTube"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-110 active:scale-95 bg-[#FF0000]"
              >
                <Youtube className="h-4 w-4 fill-current stroke-none" />
              </a>

              {/* WhatsApp with Official Brand Green */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                title="Chat on WhatsApp"
                aria-label="WhatsApp"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white shadow-sm transition-transform hover:scale-110 active:scale-95 bg-[#25D366]"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </a>
            </div>
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
      <div className="border-t border-zinc-100 bg-zinc-50 py-4 px-6 text-center text-[11px] text-zinc-500 font-normal">
        <p>© {new Date().getFullYear()} JAKloud J Paradize Dum Biryani. All rights reserved. Springfield, Missouri.</p>
      </div>
    </footer>
  );
}
