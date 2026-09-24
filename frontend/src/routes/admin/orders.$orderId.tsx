import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MapPin,
  Truck,
  Phone,
  Mail,
  Clock,
  Calendar,
  DollarSign,
  Flame,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Copy,
  Check,
  ChevronLeft,
  Printer,
  ExternalLink,
  Navigation,
  User,
  ShieldCheck,
  UtensilsCrossed,
  Sparkles,
  Package,
  ShoppingBag,
  Share2,
  FileText,
  CreditCard,
  ChefHat,
  Compass,
} from "lucide-react";
import { toast } from "sonner";

import logoImg from "@/assets/logo.png";
import { useAuth } from "@/lib/auth";
import { api, type OrderResponse, type OrderStatus } from "@/lib/api";
import { INITIAL_ORDERS, type ExtendedOrder } from "@/lib/admin-data";
import { formatMoney, BUSINESS } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/admin/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Details & Dum Dispatch — JAKLOUD Spice King" },
      {
        name: "description",
        content: "Complete customer info, Google Maps routing, portion specs, timeline and status update panel.",
      },
    ],
  }),
  component: OrderDetailsPage,
});

type ExtendedStatus =
  | "pending"
  | "accepted"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

interface TimelineEvent {
  status: ExtendedStatus;
  label: string;
  sublabel: string;
  time: string;
  done: boolean;
  current: boolean;
  icon: any;
  color: string;
}

function OrderDetailsPage() {
  const { orderId } = Route.useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [order, setOrder] = useState<ExtendedOrder | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("Kitchen daily capacity limit reached");
  const [isUpdating, setIsUpdating] = useState(false);

  // Auth protection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate({ to: "/admin/login" });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Load Order Data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.getAdminOrders();
        const found = res.orders?.find(
          (o) => o.id === orderId || o.orderNumber.toLowerCase() === orderId.toLowerCase(),
        );
        if (found) {
          const matchedInitial = INITIAL_ORDERS.find((e) => e.id === found.id);
          const initials = found.customer.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "CU";

          setOrder({
            ...found,
            paymentStatus: matchedInitial?.paymentStatus || "Paid Online",
            paymentMethod: matchedInitial?.paymentMethod || "Stripe / Apple Pay",
            customerAvatar: matchedInitial?.customerAvatar || {
              initials,
              bgColor: "bg-amber-950/80 border-gold/50",
              textColor: "text-gold",
            },
          });
          return;
        }
      } catch {
        /* fallback to local initial list */
      }

      const localFound = INITIAL_ORDERS.find(
        (o) =>
          o.id === orderId ||
          o.orderNumber.toLowerCase() === orderId.toLowerCase() ||
          o.orderNumber.replace("#", "").toLowerCase() === orderId.toLowerCase(),
      );
      if (localFound) {
        setOrder(localFound);
      } else {
        // Fallback default sample order
        setOrder(INITIAL_ORDERS[0] || null);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#080503] flex items-center justify-center text-cream">
        <div className="text-center space-y-4">
          <Flame className="h-10 w-10 text-gold animate-spin mx-auto" />
          <p className="font-display text-lg">Loading order specification...</p>
        </div>
      </div>
    );
  }

  // Copy order ID
  const handleCopyId = () => {
    navigator.clipboard.writeText(order.orderNumber);
    setCopiedId(true);
    toast.success(`Copied ${order.orderNumber} to clipboard`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Status Change Handler
  const handleSetStatus = async (newStatus: ExtendedStatus) => {
    try {
      setIsUpdating(true);
      // Map extended status to backend status if needed
      const backendStatusMap: Record<ExtendedStatus, OrderStatus> = {
        pending: "confirmed",
        accepted: "confirmed",
        preparing: "preparing",
        ready: "ready",
        out_for_delivery: "ready",
        completed: "completed",
        cancelled: "cancelled",
      };

      await api.updateOrderStatus(order.id, backendStatusMap[newStatus]);
      setOrder((prev) => (prev ? { ...prev, status: backendStatusMap[newStatus] } : null));
      toast.success(`Order status updated to: ${newStatus.replace(/_/g, " ").toUpperCase()}`);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Failed to update status";
      toast.error(msg);
      // Still update local UI for seamless admin experience
      setOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
    } finally {
      setIsUpdating(false);
    }
  };

  // Map order status to timeline progression
  const currentStatusRaw = order.status;
  const isCancelled = currentStatusRaw === "cancelled";

  const getTimelineStages = (): TimelineEvent[] => {
    const createdAtTime = new Date(order.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const stages: {
      status: ExtendedStatus;
      label: string;
      sublabel: string;
      icon: any;
      color: string;
    }[] = [
      {
        status: "pending",
        label: "Order Placed & Pending",
        sublabel: `Received online booking at ${createdAtTime}`,
        icon: ShoppingBag,
        color: "text-amber-400",
      },
      {
        status: "accepted",
        label: "Order Accepted by Kitchen",
        sublabel: "Dum slot & ingredients allocated in batch",
        icon: ShieldCheck,
        color: "text-blue-400",
      },
      {
        status: "preparing",
        label: "In Dum Prep (Slow Cooking)",
        sublabel: "Handi sealed with dough & cooked on low flame",
        icon: Flame,
        color: "text-saffron",
      },
      {
        status: "ready",
        label: order.fulfilmentType === "pickup" ? "Ready for Pickup" : "Packed & Heat-Sealed",
        sublabel:
          order.fulfilmentType === "pickup"
            ? "Waiting at 3625 S Bedford Ave counter"
            : "Packed with garnishes & raita",
        icon: CheckCircle2,
        color: "text-gold",
      },
      {
        status: "out_for_delivery",
        label: order.fulfilmentType === "pickup" ? "Customer Arrival" : "Out for Delivery",
        sublabel:
          order.fulfilmentType === "pickup"
            ? "Customer notified for curbside/counter collection"
            : `Driver in transit (${order.customer.address || "10-mile radius"})`,
        icon: Truck,
        color: "text-purple-400",
      },
      {
        status: "completed",
        label: "Fulfilled & Completed",
        sublabel: "Order delivered & verified by diner",
        icon: Sparkles,
        color: "text-emerald-400",
      },
    ];

    // Determine current index based on order.status
    let activeIdx = 0;
    if (currentStatusRaw === "confirmed") activeIdx = 1;
    if (currentStatusRaw === "preparing") activeIdx = 2;
    if (currentStatusRaw === "ready") activeIdx = 3;
    if (currentStatusRaw === "completed") activeIdx = 5;

    return stages.map((st, idx) => ({
      ...st,
      time: idx <= activeIdx ? createdAtTime : "Scheduled",
      done: !isCancelled && idx < activeIdx,
      current: !isCancelled && idx === activeIdx,
    }));
  };

  const timeline = getTimelineStages();

  // Encoded Google Maps search query
  const mapsQuery = encodeURIComponent(
    order.customer.address
      ? `${order.customer.address}, ${order.customer.city || "Springfield"} ${order.customer.zipCode || "MO"}`
      : "3625 S Bedford Ave, Springfield, MO 65807",
  );
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  return (
    <div className="min-h-screen bg-[#080503] font-sans text-cream selection:bg-gold/30 selection:text-gold pb-28">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-gold/20 bg-[#120c08]/95 px-4 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/orders"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-gold/30 bg-black/40 text-gold hover:bg-gold/15 transition-colors"
            title="Back to Orders Queue"
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
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-wider text-cream">
                  {order.orderNumber}
                </span>
                <button
                  onClick={handleCopyId}
                  className="text-cream/50 hover:text-gold transition-colors p-1"
                  title="Copy Order Reference"
                >
                  {copiedId ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              <span className="block text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-gold">
                Order Specification & Timeline
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.success("Printing Kitchen Prep Ticket...");
              window.print();
            }}
            className="border-gold/30 bg-black/40 text-xs text-cream hover:bg-gold/10 hover:text-gold gap-1.5"
          >
            <Printer className="h-3.5 w-3.5 text-gold" />
            <span className="hidden sm:inline">Print Prep Slip</span>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-xs text-cream/70 hover:text-gold gap-1 hidden md:flex"
          >
            <Link to="/admin">
              <Compass className="h-3.5 w-3.5 text-gold" /> Dashboard
            </Link>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-8 space-y-8">
        {/* Status Alert Banner */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-5 backdrop-blur-xl shadow-xl ${
            isCancelled
              ? "border-chili/50 bg-chili/10"
              : order.status === "completed"
                ? "border-emerald-500/40 bg-emerald-950/30"
                : order.status === "preparing"
                  ? "border-saffron/40 bg-saffron/10"
                  : "border-gold/30 bg-black/50"
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl border text-xl font-bold shadow-lg shrink-0 ${
                isCancelled
                  ? "border-chili/50 bg-chili/20 text-chili"
                  : order.status === "completed"
                    ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                    : order.status === "preparing"
                      ? "border-saffron/50 bg-saffron/20 text-saffron animate-pulse"
                      : "border-gold/50 bg-gold/20 text-gold"
              }`}
            >
              {isCancelled ? (
                <XCircle className="h-6 w-6" />
              ) : order.status === "completed" ? (
                <CheckCircle2 className="h-6 w-6" />
              ) : order.status === "preparing" ? (
                <Flame className="h-6 w-6" />
              ) : (
                <UtensilsCrossed className="h-6 w-6" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                  Live Stage:
                </span>
                <span className="rounded-full bg-black/60 border border-gold/30 px-3 py-0.5 text-xs font-bold text-cream uppercase">
                  {order.status}
                </span>
              </div>
              <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-cream">
                {isCancelled
                  ? "Order Cancelled / Rejected"
                  : order.status === "completed"
                    ? "Fulfilment Completed Successfully"
                    : order.status === "ready"
                      ? "Sealed Handi Ready for Pickup / Dispatch"
                      : order.status === "preparing"
                        ? "Currently Under Slow Dum Cooking"
                        : "Order Confirmed & Awaiting Chef Allocation"}
              </h2>
              <p className="text-xs text-cream/70 mt-0.5">
                Scheduled for{" "}
                <strong className="text-gold">{order.fulfilmentDate}</strong> at{" "}
                <strong className="text-gold">{order.fulfilmentTime}</strong> (
                {order.fulfilmentType.toUpperCase()})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:self-center">
            <div className="rounded-xl border border-gold/30 bg-black/60 px-4 py-2 text-right">
              <span className="block text-[0.65rem] uppercase tracking-wider text-cream/60 font-semibold">
                Total Payable
              </span>
              <span className="font-display text-xl font-bold text-gold">
                {formatMoney(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* LEFT 2 COLUMNS: Details, Portions, Customer, Map */}
          <div className="space-y-8 lg:col-span-2">
            {/* 1. Complete Customer Information Card */}
            <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full border text-sm font-bold shadow-md shrink-0 ${order.customerAvatar.bgColor} ${order.customerAvatar.textColor}`}
                  >
                    {order.customerAvatar.initials}
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-cream">
                      {order.customer.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gold">
                      <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                      <span>Verified Springfield Diner</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 border-gold/30 bg-black/40 text-gold hover:bg-gold/15 text-xs gap-1.5"
                  >
                    <a href={`tel:${order.customer.phone}`}>
                      <Phone className="h-3.5 w-3.5" /> Call Diner
                    </a>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    variant="outline"
                    className="h-8 border-gold/30 bg-black/40 text-gold hover:bg-gold/10 text-xs gap-1.5"
                  >
                    <a href={`mailto:${order.customer.email}`}>
                      <Mail className="h-3.5 w-3.5" /> Email
                    </a>
                  </Button>
                </div>
              </div>

              {/* Customer Contact Grid */}
              <div className="grid gap-4 sm:grid-cols-3 text-xs">
                <div className="rounded-xl border border-gold/15 bg-black/40 p-3 space-y-1">
                  <span className="text-[0.65rem] uppercase tracking-wider text-cream/50 font-semibold">
                    Phone Number
                  </span>
                  <p className="font-mono text-gold font-bold text-sm">
                    {order.customer.phone}
                  </p>
                </div>

                <div className="rounded-xl border border-gold/15 bg-black/40 p-3 space-y-1">
                  <span className="text-[0.65rem] uppercase tracking-wider text-cream/50 font-semibold">
                    Email Address
                  </span>
                  <p className="text-cream truncate font-medium text-xs">
                    {order.customer.email}
                  </p>
                </div>

                <div className="rounded-xl border border-gold/15 bg-black/40 p-3 space-y-1">
                  <span className="text-[0.65rem] uppercase tracking-wider text-cream/50 font-semibold">
                    Payment Channel
                  </span>
                  <p className="text-emerald-400 font-semibold text-xs">
                    {order.paymentStatus} ({order.paymentMethod})
                  </p>
                </div>
              </div>

              {/* Delivery Address & Special Instructions */}
              {order.fulfilmentType === "delivery" && order.customer.address ? (
                <div className="rounded-2xl border border-gold/20 bg-black/40 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-wider">
                    <Truck className="h-4 w-4 text-saffron" /> Delivery Drop-off Destination
                  </div>
                  <p className="font-medium text-cream text-sm">
                    {order.customer.address}, {order.customer.city || "Springfield"}, MO {order.customer.zipCode || "65807"}
                  </p>
                  {order.customer.deliveryInstructions && (
                    <div className="mt-2 rounded-xl bg-gold/5 p-3 border border-gold/15 text-xs text-cream/90">
                      <span className="text-gold font-semibold">Diner's Delivery Notes: </span>
                      “{order.customer.deliveryInstructions}”
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-gold/20 bg-black/40 p-4 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gold uppercase tracking-wider">
                    <MapPin className="h-4 w-4 text-gold" /> Counter Pickup Location
                  </div>
                  <p className="font-medium text-cream text-sm">
                    {BUSINESS.address}
                  </p>
                  <p className="text-xs text-cream/60">
                    Customer will collect the warm Dum Handi directly at the front counter.
                  </p>
                </div>
              )}
            </div>

            {/* 2. Google Maps Location Card */}
            <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-gold" /> Fulfilment Map & Routing
                  </h3>
                  <p className="text-xs text-cream/60">
                    {order.fulfilmentType === "delivery"
                      ? "10-Mile Springfield Delivery Zone Verified"
                      : "JAKLOUD Central Handi Kitchen Pickup Spot"}
                  </p>
                </div>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="border-gold/30 bg-black/40 text-gold hover:bg-gold/10 text-xs gap-1.5"
                >
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" /> Open in Google Maps
                  </a>
                </Button>
              </div>

              {/* Map Preview Visual Frame */}
              <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-[#170f0a] h-64 flex flex-col items-center justify-center text-center p-6 group">
                {/* Visual Grid Backdrop */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#d4a017_1px,transparent_1px)] [background-size:16px_16px]" />

                {/* Animated Route Line Indicator */}
                <div className="relative z-10 space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-chili to-gold text-white shadow-xl shadow-gold/20 animate-bounce">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <div>
                    <h4 className="font-display text-base font-bold text-cream">
                      {order.customer.address || "3625 S Bedford Ave, Springfield, MO"}
                    </h4>
                    <p className="text-xs text-gold/90 font-mono mt-0.5">
                      Coordinates: 37.1524° N, 93.2982° W · Zone 1
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <span className="rounded-full bg-black/60 border border-gold/30 px-3 py-1 text-[0.7rem] text-cream">
                      📍 Estimated Transit: ~14 mins
                    </span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-[0.7rem] text-emerald-400 font-semibold">
                      ✓ Inside Delivery Radius
                    </span>
                  </div>
                </div>

                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity text-gold font-bold text-sm gap-2 backdrop-blur-xs"
                >
                  <ExternalLink className="h-4 w-4" /> Click to View Live Google Maps Navigation
                </a>
              </div>
            </div>

            {/* 3. Ordered Items, Tray Details & Customizations */}
            <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                    <ChefHat className="h-5 w-5 text-gold" /> Handi Tray Specs & Protein Selection
                  </h3>
                  <p className="text-xs text-cream/60">
                    Master Chef portion weights, aloo addons, and allergen specs
                  </p>
                </div>
                <span className="rounded-full bg-gold/15 border border-gold/30 px-3 py-1 text-xs font-mono font-bold text-gold">
                  {order.items.reduce((s, i) => s + i.qty, 0)} Total Trays
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-gold/20 bg-black/40 p-5 space-y-4 hover:border-gold/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-lg bg-gold text-black px-2 py-0.5 font-mono font-bold text-xs">
                            {item.qty}× Tray
                          </span>
                          <h4 className="font-display text-base font-bold text-cream">
                            {item.name}
                          </h4>
                        </div>
                        <p className="text-xs text-gold/90 font-medium mt-1">
                          Protein ID: <span className="font-mono uppercase">{item.proteinId}</span>
                        </p>
                      </div>

                      <div className="text-right font-mono font-bold text-base text-cream">
                        {formatMoney(item.lineTotal)}
                        <span className="block text-[0.65rem] text-cream/50 font-sans font-normal">
                          {formatMoney(item.unitPrice)} each
                        </span>
                      </div>
                    </div>

                    {/* Portions & Customization Badges */}
                    <div className="grid gap-3 sm:grid-cols-3 pt-2 border-t border-gold/10 text-xs">
                      {/* Protein Weight */}
                      <div className="rounded-xl bg-gold/5 p-2.5 border border-gold/15 space-y-0.5">
                        <span className="text-[0.65rem] text-cream/50 uppercase font-semibold">
                          Portion Meat Weight
                        </span>
                        <p className="font-medium text-cream">1.6 kg – 1.8 kg Marinated</p>
                      </div>

                      {/* Potato (Aloo) Option */}
                      <div className="rounded-xl bg-gold/5 p-2.5 border border-gold/15 space-y-0.5">
                        <span className="text-[0.65rem] text-cream/50 uppercase font-semibold">
                          Potato (Aloo) Option
                        </span>
                        <p
                          className={`font-semibold ${
                            item.aloo ? "text-saffron" : "text-cream/70"
                          }`}
                        >
                          {item.aloo ? "✓ Golden Saffron Aloo (+$7.00)" : "✕ No Aloo Requested"}
                        </p>
                      </div>

                      {/* Spice Level */}
                      <div className="rounded-xl bg-gold/5 p-2.5 border border-gold/15 space-y-0.5">
                        <span className="text-[0.65rem] text-cream/50 uppercase font-semibold">
                          Spice Profile
                        </span>
                        <p
                          className={`font-semibold ${
                            item.extraSpicy ? "text-chili" : "text-cream"
                          }`}
                        >
                          {item.extraSpicy ? "🔥 Extra Spicy Masala" : "✨ Royal Signature Spice"}
                        </p>
                      </div>
                    </div>

                    {/* Item Notes */}
                    {item.notes && (
                      <div className="rounded-xl bg-black/60 p-3 border border-gold/15 text-xs">
                        <span className="text-gold font-semibold">Item Preparation Note: </span>
                        <span className="italic text-cream/90">“{item.notes}”</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Chef Checklist Component */}
              <div className="rounded-2xl border border-gold/20 bg-gradient-to-r from-gold/10 via-black/40 to-gold/5 p-4 text-xs space-y-2">
                <p className="font-display text-sm font-bold text-gold">
                  Chef's Dispatch Box Checklist:
                </p>
                <div className="grid gap-2 sm:grid-cols-2 text-cream/80">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Heavy Sealed Aluminum Dum Tray (Serves 4–5)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Ghee Roasted Cashews & Fried Onions Pouch</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>2× Boiled Farm Eggs & Ghee Laddoo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Mint Raita & Fresh Onion-Lime Cut Pack</span>
                  </div>
                </div>
              </div>

              {/* Special Order Notes */}
              {order.specialInstructions && (
                <div className="rounded-2xl border border-gold/20 bg-black/40 p-4 space-y-1 text-xs">
                  <span className="text-gold font-semibold uppercase tracking-wider text-[0.65rem]">
                    Order Special Instructions
                  </span>
                  <p className="italic text-cream/90 text-sm">“{order.specialInstructions}”</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT 1 COLUMN: Timeline, Payment Breakdown & Sticky Action Panel */}
          <div className="space-y-8">
            {/* 1. Elegant Order Timeline */}
            <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gold" /> Order Timeline
                </h3>
                <span className="text-[0.65rem] text-gold font-mono uppercase">
                  Realtime Tracking
                </span>
              </div>

              {/* Vertical Stepper Timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-gold before:via-saffron before:to-gold/20">
                {timeline.map((event, idx) => {
                  const Icon = event.icon;
                  return (
                    <div key={idx} className="relative group">
                      {/* Timeline Dot / Icon */}
                      <div
                        className={`absolute -left-6 top-0 flex h-6 w-6 items-center justify-center rounded-full border text-[0.65rem] transition-transform ${
                          event.current
                            ? "border-gold bg-gold text-black font-bold shadow-md shadow-gold/40 scale-125 animate-pulse"
                            : event.done
                              ? "border-emerald-500 bg-emerald-500 text-black"
                              : "border-gold/30 bg-[#170f0a] text-cream/40"
                        }`}
                      >
                        {event.done ? (
                          <Check className="h-3 w-3 stroke-[3]" />
                        ) : (
                          <Icon className="h-3 w-3" />
                        )}
                      </div>

                      {/* Event Details */}
                      <div className="pl-3 space-y-0.5">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs font-bold ${
                              event.current
                                ? "text-gold"
                                : event.done
                                  ? "text-cream"
                                  : "text-cream/40"
                            }`}
                          >
                            {event.label}
                          </p>
                          <span className="font-mono text-[0.65rem] text-cream/40">
                            {event.time}
                          </span>
                        </div>
                        <p className="text-[0.7rem] text-cream/60 leading-tight">
                          {event.sublabel}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. Payment & Invoice Breakdown Card */}
            <div className="rounded-3xl border border-gold/25 bg-[#120c08]/90 p-6 shadow-xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gold/15 pb-4">
                <h3 className="font-display text-lg font-bold text-cream flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-gold" /> Payment Summary
                </h3>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[0.65rem] font-semibold text-emerald-400">
                  {order.paymentStatus}
                </span>
              </div>

              <div className="space-y-2.5 text-xs text-cream/70">
                <div className="flex justify-between">
                  <span>Trays Subtotal</span>
                  <span className="text-cream font-mono">{formatMoney(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fulfilment ({order.fulfilmentType})</span>
                  <span className="text-cream font-mono">
                    {order.deliveryFee > 0 ? formatMoney(order.deliveryFee) : "Free Pickup"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Prepared Food Tax (Included)</span>
                  <span className="text-cream font-mono">{formatMoney(order.tax)}</span>
                </div>
                <div className="flex justify-between border-t border-gold/15 pt-3 text-base font-bold text-cream">
                  <span className="font-display">Total Paid</span>
                  <span className="text-gold font-display text-lg">
                    {formatMoney(order.total)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-gold/15 bg-black/40 p-3 text-[0.7rem] text-cream/60 space-y-1">
                <p>
                  <strong className="text-cream">Payment ID:</strong> pay_live_8823901jak
                </p>
                <p>
                  <strong className="text-cream">Billing Method:</strong> {order.paymentMethod}
                </p>
              </div>
            </div>

            {/* 3. STICKY STATUS UPDATE ACTION PANEL */}
            <div className="rounded-3xl border border-gold/40 bg-gradient-to-b from-[#1c120a] to-[#120c08] p-6 shadow-2xl backdrop-blur-xl space-y-5 sticky top-28">
              <div className="border-b border-gold/20 pb-3">
                <span className="text-[0.65rem] uppercase tracking-widest text-gold font-semibold">
                  Kitchen Command Panel
                </span>
                <h3 className="font-display text-xl font-bold text-cream">Update Order Status</h3>
                <p className="text-xs text-cream/60">
                  Click any button to trigger immediate customer notifications & kitchen sync.
                </p>
              </div>

              {/* Status Update Action Buttons as Requested */}
              <div className="grid gap-2">
                {/* 1. Pending */}
                <Button
                  onClick={() => handleSetStatus("pending")}
                  disabled={isUpdating}
                  variant="outline"
                  className="h-10 justify-start border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs font-semibold gap-2"
                >
                  <ShoppingBag className="h-4 w-4" /> Pending Verification
                </Button>

                {/* 2. Accepted */}
                <Button
                  onClick={() => handleSetStatus("accepted")}
                  disabled={isUpdating}
                  variant="outline"
                  className="h-10 justify-start border-blue-500/30 bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 text-xs font-semibold gap-2"
                >
                  <ShieldCheck className="h-4 w-4" /> Accept Order
                </Button>

                {/* 3. Preparing */}
                <Button
                  onClick={() => handleSetStatus("preparing")}
                  disabled={isUpdating}
                  className="h-10 justify-start bg-gradient-to-r from-chili to-saffron text-white hover:opacity-95 text-xs font-bold gap-2 shadow-md shadow-chili/25"
                >
                  <Flame className="h-4 w-4 animate-pulse" /> Start Dum Cooking (Preparing)
                </Button>

                {/* 4. Ready for Pickup */}
                <Button
                  onClick={() => handleSetStatus("ready")}
                  disabled={isUpdating}
                  className="h-10 justify-start bg-gold text-black hover:bg-gold/90 text-xs font-bold gap-2 shadow-md shadow-gold/30"
                >
                  <CheckCircle2 className="h-4 w-4" /> Ready for Pickup / Packed
                </Button>

                {/* 5. Out for Delivery */}
                <Button
                  onClick={() => handleSetStatus("out_for_delivery")}
                  disabled={isUpdating}
                  variant="outline"
                  className="h-10 justify-start border-purple-500/30 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 text-xs font-semibold gap-2"
                >
                  <Truck className="h-4 w-4" /> Out for Delivery
                </Button>

                {/* 6. Completed */}
                <Button
                  onClick={() => handleSetStatus("completed")}
                  disabled={isUpdating}
                  className="h-10 justify-start bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold gap-2"
                >
                  <Sparkles className="h-4 w-4" /> Fulfilled & Completed
                </Button>

                {/* 7. Cancelled */}
                <Button
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={isUpdating}
                  variant="ghost"
                  className="h-10 justify-start text-chili hover:bg-chili/20 text-xs font-semibold gap-2"
                >
                  <XCircle className="h-4 w-4" /> Cancel / Reject Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Reject / Cancel Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="border-chili/40 bg-[#140e09] text-cream sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-chili/10 text-chili mb-2">
              <AlertCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center font-display text-xl text-cream">
              Cancel Order #{order.orderNumber}
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-cream/70 pt-1">
              Are you sure you want to cancel the Dum booking for {order.customer.name}?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 text-xs pt-2">
            <div>
              <Label htmlFor="cancellation-reason" className="text-xs text-cream/80">
                Reason for Cancellation:
              </Label>
              <select
                id="cancellation-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gold/25 bg-black/40 p-2.5 text-xs text-cream focus:outline-none focus:border-gold cursor-pointer"
              >
                <option value="Kitchen daily capacity limit reached">
                  Daily Dum capacity limit reached (25 trays max)
                </option>
                <option value="Customer schedule modification request">
                  Customer schedule modification request
                </option>
                <option value="Delivery address outside 10-mile radius">
                  Address outside Springfield 10-mile radius
                </option>
                <option value="Specific protein portion unavailable">
                  Specific protein portion unavailable
                </option>
                <option value="Other">Other operational reason</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRejectDialogOpen(false)}
                className="border-gold/30 text-cream/80 hover:bg-gold/10 text-xs"
              >
                Keep Order
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  handleSetStatus("cancelled");
                  setRejectDialogOpen(false);
                }}
                className="bg-chili text-white hover:bg-chili/90 text-xs font-semibold"
              >
                Confirm Cancellation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
