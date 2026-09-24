import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Image as ImageIcon,
  Phone,
  Mail,
  MessageSquare,
  QrCode,
  Share2,
  Globe,
  Sparkles,
  Save,
  Eye,
  ChevronLeft,
  Upload,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Store,
  MapPin,
  Clock,
  Instagram,
  Facebook,
  Youtube,
  UtensilsCrossed,
  Layers,
  Smartphone,
  Monitor,
  Tablet,
  Check,
  Plus,
  Trash2,
  Sliders,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import heroBiryaniImg from "@/assets/hero-biryani.jpg";
import dumHandiImg from "@/assets/dum-handi.jpg";
import chickenImg from "@/assets/chicken-biryani.jpg";
import muttonImg from "@/assets/mutton-biryani.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";

import { useAuth } from "@/lib/auth";
import { BUSINESS } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/cms")({
  head: () => ({
    meta: [
      { title: "Website Content Management (CMS) — JAKLOUD Spice King" },
      {
        name: "description",
        content: "Manage Hero banner, about section, gallery images, contacts, WhatsApp, QR codes, social links and footer.",
      },
    ],
  }),
  component: CmsManagementPage,
});

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: string;
}

function CmsManagementPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Active Tab: Editor vs Split Live Preview
  const [viewMode, setViewMode] = useState<"editor" | "split" | "preview">("split");
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [activeSection, setActiveSection] = useState<
    "hero" | "about" | "gallery" | "contact" | "qr" | "social" | "footer"
  >("hero");

  // 1. Hero Banner State with localStorage persistence
  const [heroHeadline, setHeroHeadline] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("jakloud_cms_headline") || "JAKLOUD – Spice King Dum Biryani";
    return "JAKLOUD – Spice King Dum Biryani";
  });
  const [heroTagline, setHeroTagline] = useState(() => {
    if (typeof window !== "undefined") return localStorage.getItem("jakloud_cms_tagline") || "Springfield's authentic slow-cooked Dum Biryani Handi trays. Prepared with saffron aged basmati, whole spices, and sealed with traditional dough.";
    return "Springfield's authentic slow-cooked Dum Biryani Handi trays. Prepared with saffron aged basmati, whole spices, and sealed with traditional dough.";
  });
  const [heroBadge, setHeroBadge] = useState("⭐ Limited to 25 Handi Trays Daily");
  const [heroImage, setHeroImage] = useState(heroBiryaniImg);
  const [heroPrimaryCtaText, setHeroPrimaryCtaText] = useState("Order Dum Handi Tray");
  const [heroPrimaryCtaLink, setHeroPrimaryCtaLink] = useState("/menu");
  const [heroSecondaryCtaText, setHeroSecondaryCtaText] = useState("Explore Our Craft");
  const [heroSecondaryCtaLink, setHeroSecondaryCtaLink] = useState("/about");

  // 2. About Section State
  const [aboutTitle, setAboutTitle] = useState("The Royal Craft of Slow Dum Cooking");
  const [aboutStory, setAboutStory] = useState(
    "At JAKLOUD, Master Chef Kartheek honors the centuries-old Nizami tradition of Dum Pukht. Every single handi is slow-cooked over low flame for 4 hours with fragrant basmati, pure desi ghee, and house-ground spice blends.",
  );
  const [aboutImage, setAboutImage] = useState(dumHandiImg);
  const [aboutMetric1Label, setAboutMetric1Label] = useState("Daily Capacity Limit");
  const [aboutMetric1Value, setAboutMetric1Value] = useState("25 Trays Max");
  const [aboutMetric2Label, setAboutMetric2Label] = useState("Slow Dum Cooking");
  const [aboutMetric2Value, setAboutMetric2Value] = useState("4+ Hours");
  const [aboutMetric3Label, setAboutMetric3Label] = useState("Halal Standard");
  const [aboutMetric3Value, setAboutMetric3Value] = useState("100% Zabiha");

  // 3. Gallery Images State
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([
    { id: "g-1", url: chickenImg, title: "Royal Chicken Dum Biryani", category: "Handi Trays" },
    { id: "g-2", url: muttonImg, title: "Hyderabadi Shahi Mutton", category: "Feast Trays" },
    { id: "g-3", url: paneerImg, title: "Royal Shahi Paneer", category: "Vegetarian" },
    { id: "g-4", url: prawnImg, title: "Jumbo King Tiger Prawn", category: "Seafood" },
    { id: "g-5", url: dumHandiImg, title: "Traditional Sealed Handi", category: "Kitchen Craft" },
    { id: "g-6", url: heroBiryaniImg, title: "Ghee Roasted Garnishes", category: "Plating" },
  ]);
  const [newImageModalOpen, setNewImageModalOpen] = useState(false);
  const [newImgUrl, setNewImgUrl] = useState("");
  const [newImgTitle, setNewImgTitle] = useState("");
  const [newImgCategory, setNewImgCategory] = useState("Handi Trays");

  // 4. Contact & Communications State
  const [phone, setPhone] = useState(BUSINESS.phone);
  const [whatsapp, setWhatsapp] = useState("+1 417-897-9754");
  const [email, setEmail] = useState(BUSINESS.email);
  const [address, setAddress] = useState(BUSINESS.address);
  const [operatingHours, setOperatingHours] = useState(
    "11:00 AM – 6:00 PM Daily (Closed Wednesdays for Spice Grinding)",
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("jakloud_cms_headline", heroHeadline);
        localStorage.setItem("jakloud_cms_tagline", heroTagline);
      } catch {
        /* ignore */
      }
    }
  }, [heroHeadline, heroTagline]);

  // 5. QR Code & Digital Menu State
  const [qrDestinationUrl, setQrDestinationUrl] = useState("https://jakloud.com/menu");
  const [qrTitle, setQrTitle] = useState("Scan to Order Dum Biryani");
  const [qrSubtitle, setQrSubtitle] = useState("Instant mobile checkout & daily tray availability");
  const [qrBadgeEnabled, setQrBadgeEnabled] = useState(true);

  // 6. Social Media Links State
  const [instagram, setInstagram] = useState("https://instagram.com/jakloud_biryani");
  const [facebook, setFacebook] = useState("https://facebook.com/jakloudspiceking");
  const [youtube, setYoutube] = useState("https://youtube.com/@jakloudspiceking");
  const [tiktok, setTiktok] = useState("https://tiktok.com/@jakloud_dum");

  // 7. Footer Content State
  const [footerTagline, setFooterTagline] = useState(
    "JAKLOUD — Authentic slow-cooked Dum Biryani handi trays in Springfield, Missouri. Made fresh daily in limited batches.",
  );
  const [footerCopyright, setFooterCopyright] = useState(
    "© 2026 JAKLOUD – Spice King Dum Biryani. All rights reserved.",
  );
  const [footerDisclaimer, setFooterDisclaimer] = useState(
    "Halal Certified Poultry & Meats. Dedicated separate vessels strictly maintained for special cuts.",
  );

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Save / Publish Action
  const handlePublishChanges = () => {
    toast.success("Website content successfully published to live customer storefront!");
  };

  // Add Gallery Image
  const handleAddGalleryImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImgTitle.trim()) {
      toast.error("Please enter a title for the photo.");
      return;
    }
    const item: GalleryItem = {
      id: `g-${Date.now()}`,
      url: newImgUrl || chickenImg,
      title: newImgTitle.trim(),
      category: newImgCategory,
    };
    setGalleryImages((prev) => [item, ...prev]);
    toast.success(`Added "${item.title}" to gallery.`);
    setNewImgUrl("");
    setNewImgTitle("");
    setNewImageModalOpen(false);
  };

  // Delete Gallery Image
  const handleDeleteGalleryImage = (id: string) => {
    setGalleryImages((prev) => prev.filter((i) => i.id !== id));
    toast.error("Removed image from gallery.");
  };

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold pb-28">
      {/* 1. Header Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gold/20 bg-[#120c08]/95 px-4 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-black/40 text-gold hover:bg-gold/15 transition-colors"
            title="Back to Dashboard"
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
                Website Content Management (CMS)
              </span>
            </div>
          </Link>
        </div>

        {/* View Mode & Publish Actions */}
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center rounded-xl border border-gold/25 bg-black/40 p-1 text-xs">
            <button
              onClick={() => setViewMode("editor")}
              className={`rounded-lg px-3 py-1 font-medium transition-all ${
                viewMode === "editor" ? "bg-gold text-black font-bold" : "text-cream/70 hover:text-cream"
              }`}
            >
              Editor Only
            </button>
            <button
              onClick={() => setViewMode("split")}
              className={`rounded-lg px-3 py-1 font-medium transition-all ${
                viewMode === "split" ? "bg-gold text-black font-bold" : "text-cream/70 hover:text-cream"
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`rounded-lg px-3 py-1 font-medium transition-all ${
                viewMode === "preview" ? "bg-gold text-black font-bold" : "text-cream/70 hover:text-cream"
              }`}
            >
              Live Preview
            </button>
          </div>

          <Button
            onClick={handlePublishChanges}
            className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs shadow-lg shadow-chili/30 hover:scale-105 transition-all gap-1.5"
          >
            <Save className="h-4 w-4" /> Publish Live Store
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-cream/70 hover:text-gold gap-1 hidden lg:flex"
          >
            <Link to="/" target="_blank">
              <ExternalLink className="h-3.5 w-3.5 text-gold" /> Public Site
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-8 space-y-6">
        {/* Navigation Tabs for CMS Sections */}
        <div className="flex items-center gap-2 overflow-x-auto border-b border-gold/20 pb-3">
          {[
            { id: "hero", label: "Hero Banner", icon: Flame },
            { id: "about", label: "About Story & Metrics", icon: Sparkles },
            { id: "gallery", label: "Food Gallery", icon: ImageIcon },
            { id: "contact", label: "Contact & Hours", icon: Phone },
            { id: "qr", label: "QR Code Menu", icon: QrCode },
            { id: "social", label: "Social Media Links", icon: Share2 },
            { id: "footer", label: "Footer Content", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id as any)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2 text-xs font-semibold transition-all shrink-0 ${
                  isSelected
                    ? "bg-gradient-to-r from-chili via-saffron to-gold text-white shadow-md shadow-chili/25 font-bold"
                    : "border border-gold/20 bg-[#120c08] text-cream/70 hover:border-gold/50 hover:text-cream"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* EDITORS & LIVE PREVIEW SPLIT LAYOUT                           */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`grid gap-6 ${
            viewMode === "split"
              ? "lg:grid-cols-12"
              : viewMode === "editor"
                ? "grid-cols-1 max-w-4xl mx-auto"
                : "grid-cols-1"
          }`}
        >
          {/* ========================================================= */}
          {/* LEFT: EDITABLE CARDS FORM                                 */}
          {/* ========================================================= */}
          {(viewMode === "editor" || viewMode === "split") && (
            <div
              className={`space-y-6 ${
                viewMode === "split" ? "lg:col-span-6 xl:col-span-7" : "w-full"
              }`}
            >
              {/* 1. HERO BANNER CARD */}
              {activeSection === "hero" && (
                <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4 animate-in fade-in-50">
                  <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                    <div>
                      <h3 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                        <Flame className="h-5 w-5 text-chili" /> Hero Banner Configuration
                      </h3>
                      <p className="text-xs text-cream/60">
                        Top homepage visual hero, luxury headline, call-to-actions, and badge
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs">
                    {/* Hero Image Selector */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gold uppercase tracking-wider">
                        Hero Photography Preview
                      </Label>
                      <div className="flex flex-col sm:flex-row gap-4 items-center rounded-2xl border border-gold/20 bg-black/40 p-4">
                        <div className="relative h-24 w-36 rounded-xl overflow-hidden border border-gold/30 shrink-0">
                          <img src={heroImage} alt="Hero" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                          <p className="text-cream/80 text-[0.7rem]">Select background hero visual:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: "Spiced Dum Platter", img: heroBiryaniImg },
                              { label: "Golden Brass Handi", img: chickenImg },
                              { label: "Royal Copper Vessel", img: muttonImg },
                            ].map((p, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setHeroImage(p.img)}
                                className={`rounded-lg px-2.5 py-1 text-[0.65rem] font-medium transition-all ${
                                  heroImage === p.img
                                    ? "bg-gold text-black font-bold"
                                    : "border border-gold/20 bg-black/50 text-cream/70"
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                          <Input
                            placeholder="Custom Image URL..."
                            value={heroImage}
                            onChange={(e) => setHeroImage(e.target.value)}
                            className="h-8 rounded-lg border-gold/25 bg-black/50 text-xs text-cream"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Headline & Badge */}
                    <div className="space-y-1">
                      <Label htmlFor="hero-head" className="text-xs text-cream/80">
                        Main Brand Headline *
                      </Label>
                      <Input
                        id="hero-head"
                        value={heroHeadline}
                        onChange={(e) => setHeroHeadline(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs font-semibold text-cream"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="hero-badge" className="text-xs text-gold">
                        Floating Announcement Badge Text
                      </Label>
                      <Input
                        id="hero-badge"
                        value={heroBadge}
                        onChange={(e) => setHeroBadge(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs font-mono text-gold"
                      />
                    </div>

                    {/* Tagline */}
                    <div className="space-y-1">
                      <Label htmlFor="hero-tag" className="text-xs text-cream/80">
                        Hero Description / Story Subtitle
                      </Label>
                      <Textarea
                        id="hero-tag"
                        rows={3}
                        value={heroTagline}
                        onChange={(e) => setHeroTagline(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                      />
                    </div>

                    {/* CTAs */}
                    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gold/20 bg-black/40 p-4">
                      <div className="space-y-1">
                        <Label className="text-xs text-gold font-semibold">Primary Button Text</Label>
                        <Input
                          value={heroPrimaryCtaText}
                          onChange={(e) => setHeroPrimaryCtaText(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/50 text-xs text-cream"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gold font-semibold">Primary Button Link</Label>
                        <Input
                          value={heroPrimaryCtaLink}
                          onChange={(e) => setHeroPrimaryCtaLink(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/50 text-xs text-cream"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs text-cream/70">Secondary Button Text</Label>
                        <Input
                          value={heroSecondaryCtaText}
                          onChange={(e) => setHeroSecondaryCtaText(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/50 text-xs text-cream"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-cream/70">Secondary Button Link</Label>
                        <Input
                          value={heroSecondaryCtaLink}
                          onChange={(e) => setHeroSecondaryCtaLink(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/50 text-xs text-cream"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ABOUT SECTION CARD */}
              {activeSection === "about" && (
                <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4 animate-in fade-in-50">
                  <div className="border-b border-gold/15 pb-4">
                    <h3 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-gold" /> About Story & Culinary Metrics
                    </h3>
                    <p className="text-xs text-cream/60">
                      Nizami slow-cooking philosophy, Chef bio, and heritage credentials
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <Label htmlFor="about-title" className="text-xs text-cream/80">
                        About Headline
                      </Label>
                      <Input
                        id="about-title"
                        value={aboutTitle}
                        onChange={(e) => setAboutTitle(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs font-semibold text-cream"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="about-story" className="text-xs text-cream/80">
                        Chef Kartheek's Story & Craft Philosophy
                      </Label>
                      <Textarea
                        id="about-story"
                        rows={4}
                        value={aboutStory}
                        onChange={(e) => setAboutStory(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                      />
                    </div>

                    {/* 3 Metrics Cards */}
                    <div className="grid grid-cols-3 gap-3 rounded-2xl border border-gold/20 bg-black/40 p-4">
                      <div className="space-y-1">
                        <Label className="text-[0.65rem] text-gold font-semibold uppercase">
                          Metric 1 Value / Label
                        </Label>
                        <Input
                          value={aboutMetric1Value}
                          onChange={(e) => setAboutMetric1Value(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/50 text-xs font-mono font-bold text-gold"
                        />
                        <Input
                          value={aboutMetric1Label}
                          onChange={(e) => setAboutMetric1Label(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/50 text-[0.65rem] text-cream"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[0.65rem] text-saffron font-semibold uppercase">
                          Metric 2 Value / Label
                        </Label>
                        <Input
                          value={aboutMetric2Value}
                          onChange={(e) => setAboutMetric2Value(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/50 text-xs font-mono font-bold text-saffron"
                        />
                        <Input
                          value={aboutMetric2Label}
                          onChange={(e) => setAboutMetric2Label(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/50 text-[0.65rem] text-cream"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[0.65rem] text-emerald-400 font-semibold uppercase">
                          Metric 3 Value / Label
                        </Label>
                        <Input
                          value={aboutMetric3Value}
                          onChange={(e) => setAboutMetric3Value(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/50 text-xs font-mono font-bold text-emerald-400"
                        />
                        <Input
                          value={aboutMetric3Label}
                          onChange={(e) => setAboutMetric3Label(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/50 text-[0.65rem] text-cream"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. GALLERY IMAGES CARD */}
              {activeSection === "gallery" && (
                <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4 animate-in fade-in-50">
                  <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                    <div>
                      <h3 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-gold" /> Food Photography Gallery
                      </h3>
                      <p className="text-xs text-cream/60">
                        Manage high-resolution showcase dishes and kitchen visuals
                      </p>
                    </div>

                    <Button
                      onClick={() => setNewImageModalOpen(true)}
                      className="bg-gold text-black hover:bg-gold/90 font-bold text-xs gap-1"
                    >
                      <Plus className="h-4 w-4 stroke-[3]" /> Add Photo
                    </Button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {galleryImages.map((img) => (
                      <div
                        key={img.id}
                        className="group relative rounded-2xl overflow-hidden border border-gold/20 bg-black/50"
                      >
                        <img src={img.url} alt={img.title} className="h-32 w-full object-cover" />
                        <div className="p-2.5">
                          <p className="font-semibold text-cream text-xs truncate">{img.title}</p>
                          <span className="text-[0.65rem] text-gold font-mono">{img.category}</span>
                        </div>

                        <button
                          onClick={() => handleDeleteGalleryImage(img.id)}
                          className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/80 text-chili border border-chili/30 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Delete image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. CONTACT & HOURS CARD */}
              {activeSection === "contact" && (
                <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4 animate-in fade-in-50">
                  <div className="border-b border-gold/15 pb-4">
                    <h3 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                      <Phone className="h-5 w-5 text-gold" /> Contact Information & Store Channels
                    </h3>
                    <p className="text-xs text-cream/60">
                      Direct phone hotline, WhatsApp business chat, email, and kitchen hours
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="c-phone" className="text-xs text-gold font-semibold flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5" /> Phone Number (Hotline)
                        </Label>
                        <Input
                          id="c-phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/40 text-xs font-mono font-bold text-cream"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="c-whatsapp" className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                          <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Direct Chat
                        </Label>
                        <Input
                          id="c-whatsapp"
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/40 text-xs font-mono font-bold text-cream"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="c-email" className="text-xs text-cream/80 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-gold" /> Official Email Address
                      </Label>
                      <Input
                        id="c-email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="c-address" className="text-xs text-cream/80 flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gold" /> Physical Kitchen Location
                      </Label>
                      <Input
                        id="c-address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="c-hours" className="text-xs text-saffron font-semibold flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Operating Hours Schedule
                      </Label>
                      <Input
                        id="c-hours"
                        value={operatingHours}
                        onChange={(e) => setOperatingHours(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 5. QR CODE CARD */}
              {activeSection === "qr" && (
                <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4 animate-in fade-in-50">
                  <div className="border-b border-gold/15 pb-4">
                    <h3 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                      <QrCode className="h-5 w-5 text-gold" /> QR Code & Contactless Ordering
                    </h3>
                    <p className="text-xs text-cream/60">
                      Generate high-contrast QR code for dine-in tables, social flyers, and catering cards
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="flex flex-col sm:flex-row gap-6 items-center rounded-2xl border border-gold/20 bg-black/40 p-6">
                      {/* Stylized QR Code Visual */}
                      <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl border-4 border-gold shadow-2xl shrink-0">
                        <QrCode className="h-28 w-28 text-black" />
                        <span className="text-[0.6rem] font-bold text-black uppercase tracking-widest mt-1">
                          JAKLOUD DUM
                        </span>
                      </div>

                      <div className="space-y-2 flex-1 w-full">
                        <Label htmlFor="qr-dest" className="text-xs text-gold font-semibold">
                          Target QR Destination URL:
                        </Label>
                        <Input
                          id="qr-dest"
                          value={qrDestinationUrl}
                          onChange={(e) => setQrDestinationUrl(e.target.value)}
                          className="rounded-xl border-gold/25 bg-black/60 font-mono text-xs text-cream"
                        />
                        <p className="text-[0.65rem] text-cream/60">
                          When diners scan this code with their smartphone camera, they are instantly routed to today's live handi tray reservation screen.
                        </p>

                        <div className="pt-2 flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              toast.success("Printing QR table display card...");
                              window.print();
                            }}
                            className="bg-gold text-black hover:bg-gold/90 text-xs font-bold gap-1"
                          >
                            <QrCode className="h-3.5 w-3.5" /> Print QR Table Stand
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. SOCIAL MEDIA LINKS CARD */}
              {activeSection === "social" && (
                <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4 animate-in fade-in-50">
                  <div className="border-b border-gold/15 pb-4">
                    <h3 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                      <Share2 className="h-5 w-5 text-gold" /> Social Media & Video Profiles
                    </h3>
                    <p className="text-xs text-cream/60">
                      Link active social channels displayed in the website header and footer
                    </p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <Label htmlFor="s-insta" className="text-xs text-cream/80 flex items-center gap-1.5">
                        <Instagram className="h-3.5 w-3.5 text-pink-400" /> Instagram Profile URL
                      </Label>
                      <Input
                        id="s-insta"
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs font-mono text-cream"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="s-fb" className="text-xs text-cream/80 flex items-center gap-1.5">
                        <Facebook className="h-3.5 w-3.5 text-blue-400" /> Facebook Page URL
                      </Label>
                      <Input
                        id="s-fb"
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs font-mono text-cream"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="s-yt" className="text-xs text-cream/80 flex items-center gap-1.5">
                        <Youtube className="h-3.5 w-3.5 text-red-500" /> YouTube Channel / Dum Prep Videos
                      </Label>
                      <Input
                        id="s-yt"
                        value={youtube}
                        onChange={(e) => setYoutube(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs font-mono text-cream"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="s-tt" className="text-xs text-cream/80 flex items-center gap-1.5">
                        <Share2 className="h-3.5 w-3.5 text-gold" /> TikTok Food Channel
                      </Label>
                      <Input
                        id="s-tt"
                        value={tiktok}
                        onChange={(e) => setTiktok(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs font-mono text-cream"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 7. FOOTER CONTENT CARD */}
              {activeSection === "footer" && (
                <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4 animate-in fade-in-50">
                  <div className="border-b border-gold/15 pb-4">
                    <h3 className="font-display text-xl font-bold text-cream flex items-center gap-2">
                      <FileText className="h-5 w-5 text-gold" /> Footer Content & Disclaimers
                    </h3>
                    <p className="text-xs text-cream/60">
                      Brand tagline, copyright information, and allergen disclaimer text
                    </p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <Label htmlFor="f-tag" className="text-xs text-cream/80">
                        Footer Brand Summary
                      </Label>
                      <Textarea
                        id="f-tag"
                        rows={3}
                        value={footerTagline}
                        onChange={(e) => setFooterTagline(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="f-copy" className="text-xs text-cream/80">
                        Copyright Text
                      </Label>
                      <Input
                        id="f-copy"
                        value={footerCopyright}
                        onChange={(e) => setFooterCopyright(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="f-disc" className="text-xs text-gold">
                        Allergen & Halal Standard Disclaimer
                      </Label>
                      <Textarea
                        id="f-disc"
                        rows={2}
                        value={footerDisclaimer}
                        onChange={(e) => setFooterDisclaimer(e.target.value)}
                        className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* RIGHT: LIVE WEBSITE PREVIEW PANEL                         */}
          {/* ========================================================= */}
          {(viewMode === "preview" || viewMode === "split") && (
            <div
              className={`space-y-4 ${
                viewMode === "split" ? "lg:col-span-6 xl:col-span-5" : "w-full max-w-4xl mx-auto"
              }`}
            >
              {/* Preview Device Bar */}
              <div className="flex items-center justify-between rounded-2xl border border-gold/20 bg-[#120c08]/95 p-3 backdrop-blur-xl">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gold" />
                  <span className="text-xs font-bold text-cream font-display">
                    Live Storefront Preview
                  </span>
                </div>

                <div className="flex items-center gap-1 rounded-lg bg-black/60 p-1 border border-gold/20">
                  <button
                    onClick={() => setDevicePreview("desktop")}
                    className={`p-1 rounded ${
                      devicePreview === "desktop" ? "bg-gold text-black" : "text-cream/60"
                    }`}
                    title="Desktop Preview"
                  >
                    <Monitor className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDevicePreview("tablet")}
                    className={`p-1 rounded ${
                      devicePreview === "tablet" ? "bg-gold text-black" : "text-cream/60"
                    }`}
                    title="Tablet Preview"
                  >
                    <Tablet className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setDevicePreview("mobile")}
                    className={`p-1 rounded ${
                      devicePreview === "mobile" ? "bg-gold text-black" : "text-cream/60"
                    }`}
                    title="Mobile Preview"
                  >
                    <Smartphone className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Live Render Frame */}
              <div
                className={`mx-auto rounded-3xl border border-gold/30 bg-[#080503] shadow-2xl overflow-hidden transition-all duration-300 ${
                  devicePreview === "mobile"
                    ? "max-w-xs"
                    : devicePreview === "tablet"
                      ? "max-w-md"
                      : "w-full"
                }`}
              >
                {/* Simulated Browser Bar */}
                <div className="flex items-center justify-between border-b border-gold/20 bg-[#140e09] px-4 py-2.5 text-[0.65rem] text-cream/60">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-chili" />
                    <span className="h-2 w-2 rounded-full bg-saffron" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="font-mono text-gold truncate">https://jakloud.com</span>
                  <ExternalLink className="h-3 w-3 text-cream/40" />
                </div>

                {/* Rendered Live Content */}
                <div className="max-h-[650px] overflow-y-auto space-y-6 p-4 sm:p-6 text-cream">
                  {/* Top Bar Banner */}
                  <div className="rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-center text-[0.65rem] font-bold text-gold">
                    {heroBadge}
                  </div>

                  {/* Rendered Hero Banner */}
                  <div className="relative rounded-2xl overflow-hidden border border-gold/30 bg-[#160e08] p-6 text-center space-y-3">
                    <img
                      src={heroImage}
                      alt="Hero"
                      className="absolute inset-0 h-full w-full object-cover opacity-20"
                    />
                    <div className="relative z-10 space-y-2">
                      <h2 className="font-display text-2xl sm:text-3xl font-bold text-cream">
                        {heroHeadline}
                      </h2>
                      <p className="text-xs text-cream/80 max-w-sm mx-auto leading-relaxed">
                        {heroTagline}
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                        <span className="rounded-xl bg-gradient-to-r from-chili via-saffron to-gold px-4 py-1.5 text-xs font-bold text-white shadow-md">
                          {heroPrimaryCtaText} →
                        </span>
                        <span className="rounded-xl border border-gold/30 bg-black/60 px-3 py-1.5 text-xs text-gold">
                          {heroSecondaryCtaText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rendered About Section */}
                  <div className="rounded-2xl border border-gold/20 bg-[#120c08] p-5 space-y-3">
                    <h3 className="font-display text-lg font-bold text-gold">{aboutTitle}</h3>
                    <p className="text-xs text-cream/75 leading-relaxed">{aboutStory}</p>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gold/15 text-center">
                      <div className="rounded-lg bg-black/50 p-2">
                        <span className="font-bold text-gold text-xs">{aboutMetric1Value}</span>
                        <p className="text-[0.6rem] text-cream/50 mt-0.5">{aboutMetric1Label}</p>
                      </div>
                      <div className="rounded-lg bg-black/50 p-2">
                        <span className="font-bold text-saffron text-xs">{aboutMetric2Value}</span>
                        <p className="text-[0.6rem] text-cream/50 mt-0.5">{aboutMetric2Label}</p>
                      </div>
                      <div className="rounded-lg bg-black/50 p-2">
                        <span className="font-bold text-emerald-400 text-xs">{aboutMetric3Value}</span>
                        <p className="text-[0.6rem] text-cream/50 mt-0.5">{aboutMetric3Label}</p>
                      </div>
                    </div>
                  </div>

                  {/* Rendered Contact & Hours Strip */}
                  <div className="rounded-2xl border border-gold/20 bg-[#120c08] p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between text-gold font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {phone}
                      </span>
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <MessageSquare className="h-3.5 w-3.5" /> WhatsApp Active
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-cream/70">📍 {address}</p>
                    <p className="text-[0.65rem] text-saffron">⏰ {operatingHours}</p>
                  </div>

                  {/* Rendered Footer */}
                  <div className="rounded-2xl border border-gold/15 bg-black/60 p-4 text-center space-y-2 text-xs">
                    <p className="text-[0.7rem] text-cream/70">{footerTagline}</p>
                    <div className="flex justify-center gap-3 pt-1 text-gold">
                      <Instagram className="h-4 w-4" />
                      <Facebook className="h-4 w-4" />
                      <Youtube className="h-4 w-4" />
                    </div>
                    <p className="text-[0.65rem] text-cream/40 pt-1">{footerCopyright}</p>
                    <p className="text-[0.6rem] text-gold/80 italic">{footerDisclaimer}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* ADD GALLERY PHOTO MODAL                                       */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={newImageModalOpen} onOpenChange={setNewImageModalOpen}>
        <DialogContent className="border-gold/30 bg-[#140e09] text-cream sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold font-semibold">
              <ImageIcon className="h-4 w-4 text-gold" />
              <span>Gallery Upload</span>
            </div>
            <DialogTitle className="font-display text-xl text-cream font-bold">
              Add Photo to Food Gallery
            </DialogTitle>
            <DialogDescription className="text-xs text-cream/60">
              Provide a high-resolution food photo URL and caption.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddGalleryImage} className="space-y-4 pt-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="img-title" className="text-xs text-cream/80">
                Dish Photo Caption / Title *
              </Label>
              <Input
                id="img-title"
                placeholder="e.g. Saffron Basmati Layering"
                value={newImgTitle}
                onChange={(e) => setNewImgTitle(e.target.value)}
                required
                className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="img-cat" className="text-xs text-cream/80">
                Category Tag
              </Label>
              <select
                id="img-cat"
                value={newImgCategory}
                onChange={(e) => setNewImgCategory(e.target.value)}
                className="w-full h-9 rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none cursor-pointer"
              >
                <option value="Handi Trays">Handi Trays</option>
                <option value="Feast Trays">Feast Trays</option>
                <option value="Kitchen Craft">Kitchen Craft</option>
                <option value="Plating">Plating & Garnishes</option>
                <option value="Vegetarian">Vegetarian</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="img-url" className="text-xs text-cream/80">
                Image URL (or select preset)
              </Label>
              <Input
                id="img-url"
                placeholder="https://..."
                value={newImgUrl}
                onChange={(e) => setNewImgUrl(e.target.value)}
                className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream font-mono"
              />
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t border-gold/15">
              <Button
                type="button"
                variant="outline"
                onClick={() => setNewImageModalOpen(false)}
                className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gold text-black hover:bg-gold/90 font-bold text-xs"
              >
                Add to Gallery
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
