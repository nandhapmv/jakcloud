import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useMemo } from "react";
import {
  UtensilsCrossed,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Flame,
  Sparkles,
  DollarSign,
  ChevronLeft,
  Image as ImageIcon,
  Check,
  AlertTriangle,
  Scale,
  ShieldCheck,
  ShieldAlert,
  Percent,
  Sliders,
  Layers,
  Thermometer,
  Clock,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import rawChickenImg from "@/assets/raw-chicken.jpg";
import rawMuttonImg from "@/assets/raw-mutton.jpg";
import rawBeefImg from "@/assets/raw-beef.jpg";
import rawPorkImg from "@/assets/raw-pork.jpg";
import paneerImg from "@/assets/paneer-biryani.jpg";
import prawnImg from "@/assets/prawn-biryani.jpg";

import { useAuth } from "@/lib/auth";
import { formatMoney } from "@/lib/menu";
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

export const Route = createFileRoute("/admin/proteins")({
  head: () => ({
    meta: [
      { title: "Protein & Halal Cut Management — JAKLOUD Spice King" },
      {
        name: "description",
        content: "Manage meat cuts, Halal certifications, portion weights, batch stock, and live pricing adjustments.",
      },
    ],
  }),
  component: ProteinManagementPage,
});

export interface ProteinItem {
  id: string;
  name: string;
  type: "poultry" | "mutton" | "beef" | "pork" | "seafood" | "vegetarian";
  image: string;
  isHalal: boolean;
  halalCertOrg?: string;
  available: boolean;
  basePrice: number;
  priceWithAloo: number;
  marinationWeight: string; // e.g. "1.6 kg per tray"
  marinationTime: string; // e.g. "18 Hours in Hung Curd & Saffron"
  currentStockKg: number;
  batchCapacityTrays: number;
  supplier: string;
  description: string;
  separateCookingVessel: boolean;
}

const PRESET_PROTEIN_PHOTOS = [
  { label: "Saffron Marinated Chicken", url: rawChickenImg },
  { label: "Hyderabadi Bone-in Mutton", url: rawMuttonImg },
  { label: "Aged Prime Beef Cast Iron", url: rawBeefImg },
  { label: "Spiced Masala Pork Cut", url: rawPorkImg },
  { label: "Artisanal Grilled Paneer", url: paneerImg },
  { label: "Wild Jumbo Tiger Prawns", url: prawnImg },
];

const INITIAL_PROTEINS: ProteinItem[] = [
  {
    id: "protein-chicken",
    name: "Royal Marinated Chicken",
    type: "poultry",
    image: rawChickenImg,
    isHalal: true,
    halalCertOrg: "ISNA Halal Certified (100% Zabiha)",
    available: true,
    basePrice: 101.99,
    priceWithAloo: 108.99,
    marinationWeight: "1.6 kg – 1.8 kg per Handi",
    marinationTime: "16 Hours (Kashmiri Saffron, Hung Curd & Green Cardamom)",
    currentStockKg: 42,
    batchCapacityTrays: 24,
    supplier: "Ozark Heritage Valley Farms",
    description:
      "Succulent bone-in thigh and whole leg quarter cuts. Slow-marinated with cold-pressed ginger-garlic, toasted coriander, and pure saffron strands for maximum juice retention during dum steaming.",
    separateCookingVessel: false,
  },
  {
    id: "protein-mutton",
    name: "Shahi Baby Goat Mutton",
    type: "mutton",
    image: rawMuttonImg,
    isHalal: true,
    halalCertOrg: "HFSAA Certified (Hand-Slaughtered Zabiha)",
    available: true,
    basePrice: 157.99,
    priceWithAloo: 164.99,
    marinationWeight: "1.8 kg – 2.0 kg per Handi",
    marinationTime: "24 Hours (Raw Papaya Paste, Shahi Jeera & Desi Ghee)",
    currentStockKg: 28,
    batchCapacityTrays: 14,
    supplier: "Springfield Halal Meats & Pastoral",
    description:
      "Tender young goat mutton cuts with bone marrow pieces. Marinated long and low with raw papaya enzymatic paste, black cardamom, cloves, and whole cinnamon bark to achieve melt-in-the-mouth tenderness.",
    separateCookingVessel: false,
  },
  {
    id: "protein-beef",
    name: "Prime Aged Beef Cuts",
    type: "beef",
    image: rawBeefImg,
    isHalal: true,
    halalCertOrg: "Halal Transactions of America (HTA)",
    available: true,
    basePrice: 122.99,
    priceWithAloo: 129.99,
    marinationWeight: "1.7 kg per Handi",
    marinationTime: "20 Hours (Caramelized Shallot Paste & Nutmeg)",
    currentStockKg: 22,
    batchCapacityTrays: 12,
    supplier: "Midwest Black Angus Ranchers",
    description:
      "Prime grass-fed beef shank and brisket cuts diced into hearty chunks. Deeply spiced with toasted cumin, mace flower, and fried onion marinade that penetrates deep into the beef fiber.",
    separateCookingVessel: false,
  },
  {
    id: "protein-pork",
    name: "Smoked Masala Pork",
    type: "pork",
    image: rawPorkImg,
    isHalal: false,
    halalCertOrg: undefined,
    available: false,
    basePrice: 108.99,
    priceWithAloo: 115.99,
    marinationWeight: "1.6 kg per Handi",
    marinationTime: "14 Hours (Star Anise, Peppercorn & Herb Marinade)",
    currentStockKg: 0,
    batchCapacityTrays: 0,
    supplier: "Heritage Berkshire Pork Supply",
    description:
      "Artisanal pork belly and shoulder cuts slow-simmered in robust dark masala. Dedicated designated cookware and sealed dum handi vessels are strictly maintained in the kitchen.",
    separateCookingVessel: true,
  },
];

function ProteinManagementPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Protein List State with localStorage persistence
  const [proteins, setProteins] = useState<ProteinItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("jakloud_protein_catalog");
        if (raw) return JSON.parse(raw);
      } catch {
        /* ignore */
      }
    }
    return INITIAL_PROTEINS;
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("jakloud_protein_catalog", JSON.stringify(proteins));
      } catch {
        /* ignore */
      }
    }
  }, [proteins]);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterHalal, setFilterHalal] = useState<"all" | "halal" | "non-halal">("all");
  const [filterAvailability, setFilterAvailability] = useState<"all" | "available" | "unavailable">("all");

  // Add / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProtein, setEditingProtein] = useState<ProteinItem | null>(null);

  // Price Adjustment Modal State
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [proteinForPrice, setProteinForPrice] = useState<ProteinItem | null>(null);
  const [adjustedBasePrice, setAdjustedBasePrice] = useState<string>("100");
  const [adjustedAlooPrice, setAdjustedAlooPrice] = useState<string>("107");

  // Form Fields for Create / Edit
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<ProteinItem["type"]>("poultry");
  const [formImage, setFormImage] = useState(rawChickenImg);
  const [formIsHalal, setFormIsHalal] = useState(true);
  const [formHalalOrg, setFormHalalOrg] = useState("ISNA Halal Certified (100% Zabiha)");
  const [formAvailable, setFormAvailable] = useState(true);
  const [formBasePrice, setFormBasePrice] = useState<string>("109.99");
  const [formPriceWithAloo, setFormPriceWithAloo] = useState<string>("116.99");
  const [formWeight, setFormWeight] = useState("1.6 kg per Handi");
  const [formTime, setFormTime] = useState("16 Hours Saffron Marinade");
  const [formStockKg, setFormStockKg] = useState<string>("30");
  const [formSupplier, setFormSupplier] = useState("Ozark Heritage Valley Farms");
  const [formDesc, setFormDesc] = useState("");
  const [formSeparateVessel, setFormSeparateVessel] = useState(false);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [proteinToDelete, setProteinToDelete] = useState<ProteinItem | null>(null);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingProtein(null);
    setFormName("");
    setFormType("poultry");
    setFormImage(rawChickenImg);
    setFormIsHalal(true);
    setFormHalalOrg("ISNA Halal Certified (100% Zabiha)");
    setFormAvailable(true);
    setFormBasePrice("119.99");
    setFormPriceWithAloo("126.99");
    setFormWeight("1.6 kg per Handi");
    setFormTime("18 Hours Marination");
    setFormStockKg("25");
    setFormSupplier("Midwest Certified Meats");
    setFormDesc("");
    setFormSeparateVessel(false);
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (protein: ProteinItem) => {
    setEditingProtein(protein);
    setFormName(protein.name);
    setFormType(protein.type);
    setFormImage(protein.image);
    setFormIsHalal(protein.isHalal);
    setFormHalalOrg(protein.halalCertOrg || "");
    setFormAvailable(protein.available);
    setFormBasePrice(protein.basePrice.toString());
    setFormPriceWithAloo(protein.priceWithAloo.toString());
    setFormWeight(protein.marinationWeight);
    setFormTime(protein.marinationTime);
    setFormStockKg(protein.currentStockKg.toString());
    setFormSupplier(protein.supplier);
    setFormDesc(protein.description);
    setFormSeparateVessel(protein.separateCookingVessel);
    setModalOpen(true);
  };

  // Open Price Adjustment Quick Modal
  const handleOpenPriceModal = (protein: ProteinItem) => {
    setProteinForPrice(protein);
    setAdjustedBasePrice(protein.basePrice.toFixed(2));
    setAdjustedAlooPrice(protein.priceWithAloo.toFixed(2));
    setPriceModalOpen(true);
  };

  // Save Price Adjustment
  const handleSavePriceAdjustment = () => {
    if (!proteinForPrice) return;
    const baseP = parseFloat(adjustedBasePrice) || proteinForPrice.basePrice;
    const alooP = parseFloat(adjustedAlooPrice) || baseP + 7;

    setProteins((prev) =>
      prev.map((p) =>
        p.id === proteinForPrice.id
          ? { ...p, basePrice: baseP, priceWithAloo: alooP }
          : p,
      ),
    );
    toast.success(`Updated pricing for ${proteinForPrice.name} to ${formatMoney(baseP)}`);
    setPriceModalOpen(false);
  };

  // Quick Markup Helper (+5%, +10%, -$5)
  const handleQuickAdjust = (percent: number) => {
    const current = parseFloat(adjustedBasePrice) || 100;
    const next = Math.round((current * (1 + percent / 100)) * 100) / 100;
    setAdjustedBasePrice(next.toFixed(2));
    setAdjustedAlooPrice((next + 7).toFixed(2));
  };

  // Save Protein
  const handleSaveProtein = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error("Please enter a protein name.");
      return;
    }

    const basePriceNum = parseFloat(formBasePrice) || 99.99;
    const alooPriceNum = parseFloat(formPriceWithAloo) || basePriceNum + 7.0;
    const stockNum = parseFloat(formStockKg) || 0;
    const capacityNum = Math.floor(stockNum / 1.7);

    if (editingProtein) {
      setProteins((prev) =>
        prev.map((p) =>
          p.id === editingProtein.id
            ? {
                ...p,
                name: formName.trim(),
                type: formType,
                image: formImage,
                isHalal: formIsHalal,
                halalCertOrg: formIsHalal ? formHalalOrg.trim() : undefined,
                available: formAvailable,
                basePrice: basePriceNum,
                priceWithAloo: alooPriceNum,
                marinationWeight: formWeight.trim(),
                marinationTime: formTime.trim(),
                currentStockKg: stockNum,
                batchCapacityTrays: capacityNum,
                supplier: formSupplier.trim(),
                description: formDesc.trim(),
                separateCookingVessel: formSeparateVessel,
              }
            : p,
        ),
      );
      toast.success(`Updated "${formName}" specifications.`);
    } else {
      const newProtein: ProteinItem = {
        id: `protein-${Date.now()}`,
        name: formName.trim(),
        type: formType,
        image: formImage,
        isHalal: formIsHalal,
        halalCertOrg: formIsHalal ? formHalalOrg.trim() : undefined,
        available: formAvailable,
        basePrice: basePriceNum,
        priceWithAloo: alooPriceNum,
        marinationWeight: formWeight.trim(),
        marinationTime: formTime.trim(),
        currentStockKg: stockNum,
        batchCapacityTrays: capacityNum,
        supplier: formSupplier.trim(),
        description: formDesc.trim(),
        separateCookingVessel: formSeparateVessel,
      };
      setProteins((prev) => [newProtein, ...prev]);
      toast.success(`Added new protein "${formName}" to kitchen roster!`);
    }

    setModalOpen(false);
  };

  // Toggle HALAL Status
  const handleToggleHalal = (id: string) => {
    setProteins((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.isHalal;
          toast.success(
            `${p.name} HALAL status set to: ${nextState ? "100% Certified Zabiha Halal" : "Standard Non-Halal"}`,
          );
          return {
            ...p,
            isHalal: nextState,
            halalCertOrg: nextState
              ? p.halalCertOrg || "100% Zabiha Halal Certified"
              : undefined,
          };
        }
        return p;
      }),
    );
  };

  // Toggle Availability
  const handleToggleAvailability = (id: string) => {
    setProteins((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nextState = !p.available;
          toast.info(
            `"${p.name}" availability is now: ${nextState ? "Active in Kitchen Queue" : "Paused / Out of Stock"}`,
          );
          return { ...p, available: nextState };
        }
        return p;
      }),
    );
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!proteinToDelete) return;
    setProteins((prev) => prev.filter((p) => p.id !== proteinToDelete.id));
    toast.error(`Removed "${proteinToDelete.name}" from protein master list.`);
    setDeleteDialogOpen(false);
    setProteinToDelete(null);
  };

  // Filtered List
  const filteredProteins = useMemo(() => {
    return proteins.filter((p) => {
      // Halal filter
      if (filterHalal === "halal" && !p.isHalal) return false;
      if (filterHalal === "non-halal" && p.isHalal) return false;
      // Availability filter
      if (filterAvailability === "available" && !p.available) return false;
      if (filterAvailability === "unavailable" && p.available) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name.toLowerCase().includes(q);
        const matchDesc = p.description.toLowerCase().includes(q);
        const matchSupp = p.supplier.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchSupp) return false;
      }
      return true;
    });
  }, [proteins, filterHalal, filterAvailability, searchQuery]);

  // Quick Metrics
  const stats = useMemo(() => {
    const total = proteins.length;
    const halalCount = proteins.filter((p) => p.isHalal).length;
    const availableCount = proteins.filter((p) => p.available).length;
    const totalStockKg = proteins.reduce((s, p) => s + p.currentStockKg, 0);
    const totalCapacity = proteins.reduce((s, p) => s + p.batchCapacityTrays, 0);
    return { total, halalCount, availableCount, totalStockKg, totalCapacity };
  }, [proteins]);

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold pb-28">
      {/* 1. Top Header Navigation */}
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
                Protein & Halal Roster
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleOpenCreateModal}
            className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs shadow-lg shadow-chili/30 hover:scale-105 transition-all gap-1.5"
          >
            <Plus className="h-4 w-4 stroke-[3]" /> Add Protein Cut
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-cream/70 hover:text-gold gap-1 hidden md:flex"
          >
            <Link to="/admin/menu">
              <UtensilsCrossed className="h-3.5 w-3.5 text-gold" /> Menu Catalog
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
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              <span>Meat Inventory, Halal Certification & Pricing</span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-4xl text-cream font-bold">
              Protein Management
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-cream/75 max-w-2xl leading-relaxed">
              Control premium meat cuts for Chicken, Mutton, Beef, and Pork. Manage verified Zabiha Halal certifications, live availability switches, and tray price adjustments.
            </p>
          </div>

          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Button
              onClick={handleOpenCreateModal}
              size="lg"
              className="bg-gold text-black hover:bg-gold/90 font-bold text-xs px-5 shadow-lg shadow-gold/30"
            >
              <Plus className="h-4 w-4 mr-1.5 stroke-[3]" /> Add New Protein
            </Button>
          </div>
        </div>

        {/* 4 KPI Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gold/25 bg-[#120c08]/90 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                Active Meat Cuts
              </p>
              <div className="rounded-xl bg-gold/15 p-2 text-gold">
                <UtensilsCrossed className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-cream">
              {stats.total} <span className="text-xs font-sans text-cream/60">Proteins</span>
            </h3>
            <p className="text-[0.65rem] text-cream/50 mt-1">
              {stats.availableCount} of {stats.total} available today
            </p>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-[#120c08]/90 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] uppercase tracking-wider text-gold font-semibold">
                HALAL Certified
              </p>
              <div className="rounded-xl bg-gold/15 p-2 text-gold">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-cream">
              {stats.halalCount}{" "}
              <span className="text-xs font-sans text-gold font-bold">100% Zabiha</span>
            </h3>
            <p className="text-[0.65rem] text-gold/80 mt-1">
              Strict separate vessels for non-halal items
            </p>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-[#120c08]/90 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] uppercase tracking-wider text-saffron font-semibold">
                Current Marinated Stock
              </p>
              <div className="rounded-xl bg-saffron/15 p-2 text-saffron">
                <Scale className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-cream">
              {stats.totalStockKg} <span className="text-xs font-sans text-cream/60">kg Meat</span>
            </h3>
            <p className="text-[0.65rem] text-saffron/90 mt-1">
              Yields ~{stats.totalCapacity} Dum Handis
            </p>
          </div>

          <div className="rounded-2xl border border-gold/25 bg-[#120c08]/90 p-5 backdrop-blur-xl shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-[0.7rem] uppercase tracking-wider text-emerald-400 font-semibold">
                Kitchen Capacity
              </p>
              <div className="rounded-xl bg-emerald-500/15 p-2 text-emerald-400">
                <Flame className="h-4 w-4" />
              </div>
            </div>
            <h3 className="mt-2 font-display text-2xl font-bold text-cream">
              {stats.totalCapacity}{" "}
              <span className="text-xs font-sans text-cream/60">Trays Max</span>
            </h3>
            <p className="text-[0.65rem] text-emerald-400/80 mt-1">
              Daily Dum oven cap: 25 trays/day
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-gold/20 bg-[#120c08]/90 p-4 shadow-lg backdrop-blur-xl">
          <div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/60" />
            <Input
              placeholder="Search protein cut, supplier, marinade..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 rounded-xl border-gold/25 bg-black/40 pl-10 pr-4 text-xs text-cream placeholder:text-cream/40 focus-visible:border-gold"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Halal Filter */}
            <select
              value={filterHalal}
              onChange={(e) => setFilterHalal(e.target.value as any)}
              className="h-10 rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="all">All Halal & Standard</option>
              <option value="halal">100% Halal Certified Only</option>
              <option value="non-halal">Non-Halal (Pork Cuts)</option>
            </select>

            {/* Availability Filter */}
            <select
              value={filterAvailability}
              onChange={(e) => setFilterAvailability(e.target.value as any)}
              className="h-10 rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="all">All Stock Status</option>
              <option value="available">Active in Kitchen</option>
              <option value="unavailable">Paused / Out of Stock</option>
            </select>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PROTEIN CARDS GRID (Chicken, Mutton, Beef, Pork)              */}
        {/* ------------------------------------------------------------- */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {filteredProteins.map((protein) => (
            <div
              key={protein.id}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border bg-[#140e09]/95 shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
                protein.available
                  ? "border-gold/30 hover:border-gold/70"
                  : "border-cream/10 opacity-80"
              }`}
            >
              {/* Top Photo & Halal Glow Badge */}
              <div className="relative h-64 w-full overflow-hidden bg-black/70">
                <img
                  src={protein.image}
                  alt={protein.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#140e09] via-transparent to-black/50" />

                {/* Top Badges: Halal Badge & Type */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
                  {/* GOLD HALAL BADGE WITH INTERACTIVE TOGGLE */}
                  <button
                    onClick={() => handleToggleHalal(protein.id)}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold shadow-lg transition-all backdrop-blur-md cursor-pointer ${
                      protein.isHalal
                        ? "bg-gradient-to-r from-amber-500 via-gold to-amber-300 text-black shadow-gold/40 border border-yellow-200/60 animate-pulse hover:scale-105"
                        : "bg-black/70 border border-cream/20 text-cream/60 hover:text-gold"
                    }`}
                    title="Click to toggle Halal status"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>{protein.isHalal ? "⭐ 100% ZABIHA HALAL" : "NON-HALAL"}</span>
                  </button>

                  <span className="rounded-full bg-black/80 border border-gold/30 px-3 py-0.5 text-[0.65rem] font-mono text-gold uppercase tracking-wider backdrop-blur-md">
                    {protein.type}
                  </span>
                </div>

                {/* Bottom Photo Overlay: RED/GREEN Availability Indicator */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[0.7rem] font-bold backdrop-blur-md border ${
                        protein.available
                          ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/50"
                          : "bg-chili/80 text-white border-chili/70"
                      }`}
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          protein.available ? "bg-emerald-400 animate-ping" : "bg-white"
                        }`}
                      />
                      {protein.available ? "ACTIVE IN KITCHEN" : "PAUSED / OUT OF STOCK"}
                    </span>
                  </div>

                  <span className="rounded-full bg-black/70 border border-gold/30 px-3 py-0.5 text-[0.7rem] font-mono font-bold text-gold backdrop-blur-md">
                    {protein.currentStockKg} kg Available
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-1 flex-col p-6 space-y-4">
                {/* Title & Base Price Display */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-cream group-hover:text-gold transition-colors">
                      {protein.name}
                    </h3>
                    <p className="text-xs text-gold/90 font-medium mt-0.5 flex items-center gap-1.5">
                      <Scale className="h-3.5 w-3.5 text-gold" />
                      <span>{protein.marinationWeight}</span>
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-display text-2xl font-bold text-gold">
                      {formatMoney(protein.basePrice)}
                    </span>
                    <span className="block text-[0.65rem] text-cream/50 font-sans">
                      Standard Tray Base
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-cream/70 leading-relaxed">
                  {protein.description}
                </p>

                {/* Culinary & Supply Specs Grid */}
                <div className="grid gap-2.5 sm:grid-cols-2 rounded-2xl border border-gold/15 bg-black/40 p-4 text-xs">
                  <div>
                    <span className="text-[0.65rem] uppercase tracking-wider text-cream/50 font-semibold block">
                      Marination Time & Spices
                    </span>
                    <p className="font-medium text-cream text-[0.75rem] mt-0.5">
                      {protein.marinationTime}
                    </p>
                  </div>

                  <div>
                    <span className="text-[0.65rem] uppercase tracking-wider text-cream/50 font-semibold block">
                      Local Supplier
                    </span>
                    <p className="font-medium text-gold text-[0.75rem] mt-0.5 truncate">
                      {protein.supplier}
                    </p>
                  </div>

                  <div className="sm:col-span-2 border-t border-gold/10 pt-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[0.75rem]">
                      <span className="text-cream/60">With Golden Aloo: </span>
                      <strong className="text-saffron font-mono">
                        {formatMoney(protein.priceWithAloo)}
                      </strong>
                    </div>

                    {protein.isHalal && protein.halalCertOrg && (
                      <span className="text-[0.65rem] text-gold/90 font-medium italic">
                        ✓ {protein.halalCertOrg}
                      </span>
                    )}

                    {protein.separateCookingVessel && (
                      <span className="text-[0.65rem] text-chili font-semibold bg-chili/10 px-2 py-0.5 rounded border border-chili/30">
                        ⚠ Dedicated Separate Vessels
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Controls: Availability Switch + Price Adjust + Edit/Delete */}
                <div className="mt-auto space-y-3 pt-3 border-t border-gold/15">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`stock-${protein.id}`}
                      className="text-xs font-semibold text-cream cursor-pointer flex items-center gap-2"
                    >
                      <span
                        className={`h-2 w-2 rounded-full ${
                          protein.available ? "bg-emerald-400" : "bg-chili"
                        }`}
                      />
                      <span>Live Ordering Availability</span>
                    </Label>
                    <Switch
                      id={`stock-${protein.id}`}
                      checked={protein.available}
                      onCheckedChange={() => handleToggleAvailability(protein.id)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {/* Price Adjustment Button */}
                    <Button
                      onClick={() => handleOpenPriceModal(protein)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gold/30 bg-black/40 text-gold hover:bg-gold/15 text-xs font-semibold gap-1.5"
                    >
                      <DollarSign className="h-3.5 w-3.5" /> Adjust Price
                    </Button>

                    {/* Edit Protein Specs */}
                    <Button
                      onClick={() => handleOpenEditModal(protein)}
                      variant="outline"
                      size="sm"
                      className="flex-1 border-gold/30 bg-black/40 text-cream hover:bg-gold/10 text-xs font-semibold gap-1.5"
                    >
                      <Edit3 className="h-3.5 w-3.5 text-gold" /> Edit Specs
                    </Button>

                    {/* Delete */}
                    <Button
                      onClick={() => {
                        setProteinToDelete(protein);
                        setDeleteDialogOpen(true);
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-chili/70 hover:bg-chili/20 hover:text-chili"
                      title="Delete Protein"
                      aria-label="Delete Protein"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 1. PRICE ADJUSTMENT QUICK MODAL                               */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={priceModalOpen} onOpenChange={setPriceModalOpen}>
        <DialogContent className="border-gold/30 bg-[#140e09] text-cream sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold font-semibold">
              <DollarSign className="h-4 w-4 text-gold" />
              <span>Dynamic Pricing Engine</span>
            </div>
            <DialogTitle className="font-display text-xl text-cream font-bold">
              Adjust Price for {proteinForPrice?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-cream/60">
              Apply quick markups or set custom base tray and aloo addon pricing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-xs pt-2">
            {/* Quick Adjustment Pills */}
            <div>
              <span className="text-[0.65rem] uppercase tracking-wider text-gold font-semibold block mb-1.5">
                Quick Price Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(5)}
                  className="rounded-lg border border-gold/30 bg-black/40 px-2.5 py-1 text-xs text-gold hover:bg-gold/15"
                >
                  +5% Markup
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(10)}
                  className="rounded-lg border border-gold/30 bg-black/40 px-2.5 py-1 text-xs text-gold hover:bg-gold/15"
                >
                  +10% Markup
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickAdjust(-5)}
                  className="rounded-lg border border-gold/30 bg-black/40 px-2.5 py-1 text-xs text-cream/80 hover:bg-gold/15"
                >
                  -5% Discount
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (proteinForPrice) {
                      setAdjustedBasePrice(proteinForPrice.basePrice.toFixed(2));
                      setAdjustedAlooPrice(proteinForPrice.priceWithAloo.toFixed(2));
                    }
                  }}
                  className="rounded-lg border border-gold/20 bg-black/40 px-2.5 py-1 text-xs text-cream/50 hover:text-cream"
                >
                  Reset Original
                </button>
              </div>
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gold/20 bg-black/40 p-4">
              <div className="space-y-1">
                <Label htmlFor="adj-base" className="text-xs text-gold font-semibold">
                  Standard Tray Price ($)
                </Label>
                <Input
                  id="adj-base"
                  type="number"
                  step="0.01"
                  value={adjustedBasePrice}
                  onChange={(e) => {
                    setAdjustedBasePrice(e.target.value);
                    const p = parseFloat(e.target.value) || 0;
                    setAdjustedAlooPrice((p + 7).toFixed(2));
                  }}
                  className="font-mono font-bold text-cream rounded-xl border-gold/30 bg-black/60"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="adj-aloo" className="text-xs text-saffron font-semibold">
                  With Golden Aloo ($)
                </Label>
                <Input
                  id="adj-aloo"
                  type="number"
                  step="0.01"
                  value={adjustedAlooPrice}
                  onChange={(e) => setAdjustedAlooPrice(e.target.value)}
                  className="font-mono font-bold text-cream rounded-xl border-gold/30 bg-black/60"
                />
              </div>
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2 pt-2 border-t border-gold/15">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPriceModalOpen(false)}
                className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSavePriceAdjustment}
                className="bg-gold text-black hover:bg-gold/90 font-bold text-xs"
              >
                Apply Price
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 2. ADD / EDIT PROTEIN MODAL                                   */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="border-gold/30 bg-[#140e09] text-cream sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold font-semibold">
              <ShieldCheck className="h-4 w-4 text-gold" />
              <span>{editingProtein ? "Protein Specification" : "New Meat Roster Entry"}</span>
            </div>
            <DialogTitle className="font-display text-2xl text-cream font-bold">
              {editingProtein ? `Edit "${editingProtein.name}"` : "Add New Protein Cut"}
            </DialogTitle>
            <DialogDescription className="text-xs text-cream/60">
              Configure Halal certification, photo, portion weights, batch stock, and pricing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProtein} className="space-y-4 pt-2 text-xs">
            {/* Image Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-gold uppercase tracking-wider">
                Protein Photography
              </Label>
              <div className="flex flex-col sm:flex-row gap-4 items-center rounded-2xl border border-gold/20 bg-black/40 p-4">
                <div className="relative h-24 w-32 rounded-xl overflow-hidden border border-gold/30 shrink-0">
                  <img src={formImage} alt="Preview" className="h-full w-full object-cover" />
                </div>

                <div className="flex-1 space-y-2 w-full">
                  <p className="text-cream/80 text-[0.7rem]">
                    Select prep photo or paste custom URL:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PROTEIN_PHOTOS.map((p, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormImage(p.url)}
                        className={`rounded-lg px-2.5 py-1 text-[0.65rem] font-medium transition-all ${
                          formImage === p.url
                            ? "bg-gold text-black font-bold shadow-md shadow-gold/30"
                            : "border border-gold/20 bg-black/50 text-cream/70 hover:border-gold/40"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <Input
                    placeholder="Custom image URL..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="h-8 rounded-lg border-gold/25 bg-black/50 text-xs text-cream"
                  />
                </div>
              </div>
            </div>

            {/* Name & Protein Type */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label htmlFor="protein-name" className="text-xs text-cream/80">
                  Protein Name *
                </Label>
                <Input
                  id="protein-name"
                  placeholder="e.g. Free-Range Chicken"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="protein-type" className="text-xs text-cream/80">
                  Protein Classification
                </Label>
                <select
                  id="protein-type"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-gold/25 bg-black/40 px-3 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
                >
                  <option value="poultry">Poultry (Chicken)</option>
                  <option value="mutton">Mutton (Goat / Lamb)</option>
                  <option value="beef">Beef (Prime Angus)</option>
                  <option value="pork">Pork (Artisanal Cut)</option>
                  <option value="seafood">Seafood (Prawns / Fish)</option>
                  <option value="vegetarian">Vegetarian (Artisanal Paneer)</option>
                </select>
              </div>
            </div>

            {/* HALAL CERTIFICATION SWITCH & ORG */}
            <div className="rounded-2xl border border-gold/30 bg-gradient-to-r from-gold/10 via-black/40 to-gold/5 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="halal-toggle" className="text-xs font-bold text-gold cursor-pointer flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-gold" />
                    <span>100% Zabiha Halal Certified Item</span>
                  </Label>
                  <p className="text-[0.65rem] text-cream/60">
                    Enables the gleaming Gold Halal badge on diner menu and admin orders.
                  </p>
                </div>
                <Switch
                  id="halal-toggle"
                  checked={formIsHalal}
                  onCheckedChange={setFormIsHalal}
                  className="data-[state=checked]:bg-gold"
                />
              </div>

              {formIsHalal && (
                <div className="pt-2 border-t border-gold/15 space-y-1">
                  <Label htmlFor="halal-org" className="text-xs text-cream/80">
                    Certifying Organization / Slaughter Standard
                  </Label>
                  <Input
                    id="halal-org"
                    placeholder="e.g. ISNA / HFSAA Certified Hand-Slaughtered Zabiha"
                    value={formHalalOrg}
                    onChange={(e) => setFormHalalOrg(e.target.value)}
                    className="rounded-xl border-gold/25 bg-black/50 text-xs text-cream"
                  />
                </div>
              )}
            </div>

            {/* Pricing & Stock */}
            <div className="grid gap-3 sm:grid-cols-3 rounded-2xl border border-gold/20 bg-black/40 p-4">
              <div className="space-y-1">
                <Label htmlFor="p-base-price" className="text-xs text-gold font-semibold">
                  Base Tray Price ($) *
                </Label>
                <Input
                  id="p-base-price"
                  type="number"
                  step="0.01"
                  value={formBasePrice}
                  onChange={(e) => {
                    setFormBasePrice(e.target.value);
                    const p = parseFloat(e.target.value) || 0;
                    setFormPriceWithAloo((p + 7).toFixed(2));
                  }}
                  required
                  className="rounded-xl border-gold/30 bg-black/50 text-xs font-mono font-bold text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="p-aloo-price" className="text-xs text-saffron font-semibold">
                  With Golden Aloo ($)
                </Label>
                <Input
                  id="p-aloo-price"
                  type="number"
                  step="0.01"
                  value={formPriceWithAloo}
                  onChange={(e) => setFormPriceWithAloo(e.target.value)}
                  className="rounded-xl border-gold/30 bg-black/50 text-xs font-mono font-bold text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="p-stock" className="text-xs text-cream/80">
                  Current Stock (kg)
                </Label>
                <Input
                  id="p-stock"
                  type="number"
                  value={formStockKg}
                  onChange={(e) => setFormStockKg(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/50 text-xs text-cream"
                />
              </div>
            </div>

            {/* Weights & Supplier */}
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="p-weight" className="text-xs text-cream/80">
                  Meat Portion per Tray
                </Label>
                <Input
                  id="p-weight"
                  value={formWeight}
                  onChange={(e) => setFormWeight(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="p-time" className="text-xs text-cream/80">
                  Marination Protocol
                </Label>
                <Input
                  id="p-time"
                  value={formTime}
                  onChange={(e) => setFormTime(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="p-supplier" className="text-xs text-cream/80">
                  Meat Supplier / Ranch
                </Label>
                <Input
                  id="p-supplier"
                  value={formSupplier}
                  onChange={(e) => setFormSupplier(e.target.value)}
                  className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="p-desc" className="text-xs text-cream/80">
                Culinary Cut Description
              </Label>
              <Textarea
                id="p-desc"
                rows={2}
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Details on cut selection, bone ratio, marination herbs..."
                className="rounded-xl border-gold/25 bg-black/40 text-xs text-cream"
              />
            </div>

            {/* Availability & Separate Vessel Switches */}
            <div className="grid gap-3 sm:grid-cols-2 rounded-2xl border border-gold/20 bg-black/40 p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="p-avail" className="text-xs font-semibold text-emerald-400 cursor-pointer">
                  Available in Kitchen Queue
                </Label>
                <Switch
                  id="p-avail"
                  checked={formAvailable}
                  onCheckedChange={setFormAvailable}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="p-vessel" className="text-xs font-semibold text-cream/90 cursor-pointer">
                  Strict Separate Vessel Protocol
                </Label>
                <Switch
                  id="p-vessel"
                  checked={formSeparateVessel}
                  onCheckedChange={setFormSeparateVessel}
                  className="data-[state=checked]:bg-chili"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <DialogFooter className="flex flex-row justify-end gap-2 pt-3 border-t border-gold/15">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-chili via-saffron to-gold text-white font-bold text-xs shadow-md shadow-chili/30"
              >
                {editingProtein ? "Save Protein Cut" : "Add to Kitchen Roster"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------- */}
      {/* 3. DELETE CONFIRMATION DIALOG                                 */}
      {/* ------------------------------------------------------------- */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="border-chili/40 bg-[#140e09] text-cream sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-chili/10 text-chili mb-2">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center font-display text-xl text-cream">
              Delete "{proteinToDelete?.name}"?
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-cream/70 pt-1">
              This will remove this meat cut from active inventory tracking and portion recipes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-end gap-2 pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
            >
              Keep Cut
            </Button>
            <Button
              size="sm"
              onClick={handleConfirmDelete}
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
