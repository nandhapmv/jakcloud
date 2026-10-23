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
} from "lucide-react";
import { toast } from "sonner";

import heroBg from "@/assets/hero-biryani.jpg";
import logoImg from "@/assets/logo.png";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Kitchen Command Portal — JAKloud J Paradize" },
      {
        name: "description",
        content: "Secure kitchen and restaurant management portal for JAKloud J Paradize Dum Biryani.",
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
    setPassword("jparadize2026");
    toast.info("Master Chef credentials autofilled.");
  };

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#070402] font-sans text-cream selection:bg-gold/30 selection:text-gold flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Ambient Radial Glows */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[600px] rounded-full bg-gradient-to-b from-amber-500/20 via-saffron/10 to-transparent blur-3xl z-0" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[400px] w-[400px] rounded-full bg-chili/10 blur-3xl z-0" />

      {/* Background Backdrop with Biryani Texture */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Royal Hyderabadi Dum Biryani"
          className="h-full w-full object-cover object-center filter brightness-[0.18] contrast-125 opacity-40 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070402]/95 via-[#070402]/90 to-[#070402]" />
        {/* Subtle royal pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(#d4a017_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-[0.06]" />
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-[430px] my-auto">
        <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-[#180e07]/95 via-[#110904]/98 to-[#090502]/98 p-6 sm:p-9 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(212,160,23,0.12)] backdrop-blur-2xl">
          {/* Top Golden Accent Line */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

          {/* Logo & Brand Title */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gold via-saffron to-amber-600 opacity-40 blur-md animate-pulse" />
              <img
                src={logoImg}
                alt="JAKloud J Paradize Heritage Seal"
                className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-gold/60 bg-black p-0.5 object-cover mx-auto shadow-xl"
                width={80}
                height={80}
              />
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[0.68rem] font-bold uppercase tracking-widest text-gold">
              <Flame className="h-3.5 w-3.5 text-saffron fill-saffron/20" />
              <span>JAKloud · J PARADIZE</span>
            </div>

            <h1 className="mt-1.5 font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-cream">
              Kitchen Admin Portal
            </h1>
            <p className="mt-1 text-xs text-cream/60 font-normal">
              Authorized Personnel & Restaurant Command
            </p>
          </div>

          {/* Quick Demo Fill Badge */}
          <div className="mt-5 flex justify-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="group flex items-center gap-2 rounded-full border border-gold/35 bg-gold/10 hover:bg-gold/20 active:scale-95 px-4 py-1.5 text-xs font-semibold text-gold transition-all duration-200 shadow-sm shadow-gold/10 hover:border-gold/60 hover:text-amber-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-saffron group-hover:rotate-12 transition-transform" />
              <span>Autofill Master Chef Credentials</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-6 space-y-4 text-xs font-normal">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-email"
                className="text-xs font-semibold text-cream/90 flex items-center gap-1.5"
              >
                <span>Admin Email</span>
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
                  className="h-11 sm:h-12 rounded-xl border-gold/25 bg-[#0b0603]/80 pl-10 pr-3 text-base sm:text-xs text-cream placeholder:text-cream/35 focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-inner transition-colors"
                />
              </div>
            </div>

            {/* Password Field - NOTE: 'Forgot password?' completely removed as requested */}
            <div className="space-y-1.5">
              <Label
                htmlFor="admin-password"
                className="text-xs font-semibold text-cream/90"
              >
                Password
              </Label>
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
                  className="h-11 sm:h-12 rounded-xl border-gold/25 bg-[#0b0603]/80 pl-10 pr-10 text-base sm:text-xs text-cream placeholder:text-cream/35 focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-inner transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gold/60 hover:text-gold transition-colors"
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
            <div className="flex items-center space-x-2.5 pt-1">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(c) => setRememberMe(c === true)}
                className="h-4 w-4 rounded border-gold/40 data-[state=checked]:bg-gold data-[state=checked]:text-[#070402]"
              />
              <label
                htmlFor="remember-me"
                className="text-xs text-cream/70 select-none cursor-pointer font-medium hover:text-cream transition-colors"
              >
                Remember this session for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-saffron to-gold hover:from-amber-400 hover:via-amber-500 hover:to-gold/90 active:scale-[0.99] text-[#070402] font-bold text-sm tracking-wide shadow-[0_10px_25px_rgba(217,119,6,0.35)] hover:shadow-[0_14px_35px_rgba(217,119,6,0.5)] transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#070402] border-t-transparent" />
                    <span>Verifying Credentials...</span>
                  </div>
                ) : (
                  <>
                    <span>Enter Kitchen Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Security Badge */}
          <div className="mt-7 flex items-center justify-center gap-2 border-t border-gold/15 pt-5 text-center text-[0.72rem] text-gold/80 font-medium">
            <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
            <span>256-Bit Encrypted Kitchen Management</span>
          </div>

          {/* Return Link */}
          <div className="mt-3 text-center">
            <Link
              to="/"
              className="text-xs text-cream/50 hover:text-gold transition-colors inline-flex items-center gap-1 font-medium"
            >
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
