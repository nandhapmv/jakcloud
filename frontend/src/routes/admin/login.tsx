import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Flame,
  ChefHat,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";

import heroBg from "@/assets/hero-biryani.jpg";
import logoImg from "@/assets/logo.png";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Kitchen Command Portal — JAKLOUD Spice King" },
      {
        name: "description",
        content: "Secure kitchen and restaurant management portal for JAKLOUD Spice King Dum Biryani.",
      },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: "/admin" });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      await login({ email: email.trim(), password }, rememberMe);
      toast.success("Welcome back, Master Chef. Access granted.");
      navigate({ to: "/admin" });
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Authentication failed";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = () => {
    setEmail("admin@jakloud.com");
    setPassword("spiceking2026");
    toast.info("Demo credentials loaded.");
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0a0705] font-sans text-cream selection:bg-gold/30 selection:text-gold flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Full-Screen Luxury Hero Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Royal Hyderabadi Dum Biryani"
          className="h-full w-full object-cover object-center scale-105 filter brightness-50 transition-all duration-1000"
        />
        {/* Matte Black & Royal Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080503] via-[#0d0906]/85 to-[#080503]/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,160,23,0.12)_0%,rgba(8,5,3,0.85)_70%,#080503_100%)]" />
        {/* Ambient Gold & Chili Lighting Orbs */}
        <div className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-chili/15 blur-[120px]" />
        <div className="pointer-events-none absolute -right-20 bottom-1/4 h-96 w-96 rounded-full bg-gold/15 blur-[120px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-700">
        {/* Glassmorphism Luxury Card */}
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-[#120c08]/80 p-8 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:p-10">
          {/* Subtle Top Gold Aura Line */}
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

          {/* Logo & Brand Title */}
          <div className="text-center">
            <div className="relative mx-auto inline-block">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-chili/40 via-gold/50 to-saffron/40 blur-md opacity-80" />
              <img
                src={logoImg}
                alt="JAKLOUD Spice King Heritage Seal"
                className="relative h-20 w-20 rounded-full border-2 border-gold/60 bg-cream p-0.5 shadow-[0_0_25px_rgba(212,160,23,0.35)] object-cover sm:h-24 sm:w-24 mx-auto"
                width={96}
                height={96}
              />
            </div>

            <div className="mt-5 flex items-center justify-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-gold">
              <Flame className="h-3.5 w-3.5 text-chili animate-pulse" />
              <span>JAKLOUD · SPICE KING</span>
              <Flame className="h-3.5 w-3.5 text-chili animate-pulse" />
            </div>

            <h1 className="mt-1 font-display text-2xl tracking-wide text-cream sm:text-3xl">
              Kitchen Command Portal
            </h1>
            <p className="mt-1 text-xs text-cream/70">
              Authorized personnel & restaurant administration
            </p>
          </div>

          {/* Quick Demo Fill Badge */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="group flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[0.7rem] font-medium text-gold/90 transition-all hover:border-gold hover:bg-gold/20 hover:text-gold"
            >
              <Sparkles className="h-3 w-3 text-gold group-hover:rotate-12 transition-transform" />
              <span>Autofill Demo Credentials</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-email"
                className="text-xs font-medium uppercase tracking-wider text-gold/90"
              >
                Admin Email Address
              </Label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gold/60 group-focus-within:text-gold transition-colors">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@jakloud.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-gold/30 bg-black/40 pl-10 pr-4 text-sm text-cream placeholder:text-cream/35 transition-all focus-visible:border-gold focus-visible:bg-black/60 focus-visible:ring-2 focus-visible:ring-gold/30"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="admin-password"
                  className="text-xs font-medium uppercase tracking-wider text-gold/90"
                >
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-xs text-gold/80 hover:text-gold hover:underline transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-gold/60 group-focus-within:text-gold transition-colors">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-gold/30 bg-black/40 pl-10 pr-10 text-sm text-cream placeholder:text-cream/35 transition-all focus-visible:border-gold focus-visible:bg-black/60 focus-visible:ring-2 focus-visible:ring-gold/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-cream/50 hover:text-gold transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center space-x-2 pt-1">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(c) => setRememberMe(c === true)}
                className="border-gold/50 data-[state=checked]:bg-gold data-[state=checked]:text-black"
              />
              <label
                htmlFor="remember-me"
                className="text-xs font-medium text-cream/80 select-none cursor-pointer"
              >
                Remember this session for 30 days
              </label>
            </div>

            {/* Red & Gold Luxury Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#b91c1c] via-[#d97706] to-[#d4a017] p-px font-display font-medium shadow-[0_10px_25px_-5px_rgba(185,28,28,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_30px_-5px_rgba(212,160,23,0.5)] active:scale-[0.99] disabled:opacity-70 group"
            >
              <div className="flex h-12 w-full items-center justify-center gap-2 rounded-[11px] bg-gradient-to-r from-chili/90 via-saffron to-gold/90 px-6 text-sm font-semibold tracking-wide text-white transition-all group-hover:bg-opacity-90">
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-cream border-t-transparent" />
                    <span>Verifying Credentials...</span>
                  </div>
                ) : (
                  <>
                    <span>Enter Kitchen Portal</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </div>
            </button>
          </form>

          {/* Security Guarantee Footer */}
          <div className="mt-8 flex items-center justify-center gap-2 border-t border-gold/15 pt-5 text-center text-[0.7rem] text-cream/60">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />
            <span>256-Bit Encrypted Restaurant Portal</span>
          </div>

          <div className="mt-3 text-center">
            <Link
              to="/"
              className="text-[0.75rem] text-gold/70 hover:text-gold transition-colors inline-flex items-center gap-1"
            >
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="border-gold/30 bg-[#120c08] text-cream sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold mb-2">
              <KeyRound className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center font-display text-xl text-primary-foreground">
              Administrator Password Reset
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-cream/70 pt-1">
              For security reasons, admin credentials for the live Dum biryani kitchen portal are managed by the Head Chef & Founders.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-gold/20 bg-black/40 p-4 text-xs text-cream/80 space-y-2">
            <p className="font-semibold text-gold">Master Recovery Contact:</p>
            <p>• Email: <span className="font-mono text-cream">sales@jakloud.com</span></p>
            <p>• Phone: <span className="font-mono text-cream">417-897-9754</span></p>
            <p className="text-[0.7rem] text-muted-foreground pt-1">
              Default demo credentials: <span className="font-mono text-gold">admin@jakloud.com</span> / <span className="font-mono text-gold">spiceking2026</span>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleQuickFill();
                setForgotOpen(false);
              }}
              className="border-gold/40 text-gold hover:bg-gold/20"
            >
              Fill Demo Login
            </Button>
            <Button
              size="sm"
              className="bg-saffron text-saffron-foreground hover:bg-saffron/90"
              onClick={() => setForgotOpen(false)}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
