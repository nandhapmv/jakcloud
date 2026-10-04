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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#09090b] font-sans text-zinc-200 selection:bg-amber-500/20 selection:text-amber-300 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Backdrop */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Royal Hyderabadi Dum Biryani"
          className="h-full w-full object-cover object-center filter brightness-25 opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-[#09090b]/95" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121216]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {/* Logo & Brand Title */}
          <div className="text-center">
            <img
              src={logoImg}
              alt="JAKLOUD Spice King Heritage Seal"
              className="h-16 w-16 rounded-full border border-amber-500/30 bg-black p-0.5 object-cover mx-auto"
              width={64}
              height={64}
            />

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-widest text-amber-400">
              <Flame className="h-3 w-3 text-amber-400" />
              <span>JAKLOUD · SPICE KING</span>
            </div>

            <h1 className="mt-1 font-display text-xl sm:text-2xl font-semibold text-zinc-100">
              Kitchen Admin Portal
            </h1>
            <p className="mt-0.5 text-xs text-zinc-400 font-normal">
              Authorized personnel & restaurant administration
            </p>
          </div>

          {/* Quick Demo Fill Badge */}
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={handleQuickFill}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#18181f] px-3 py-1 text-[0.68rem] font-medium text-zinc-300 transition-colors hover:text-amber-300 hover:border-amber-500/30"
            >
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Autofill Demo Credentials</span>
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="mt-5 space-y-4 text-xs font-normal">
            <div className="space-y-1">
              <Label
                htmlFor="admin-email"
                className="text-xs font-medium text-zinc-300"
              >
                Admin Email
              </Label>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 group-focus-within:text-amber-400 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <Input
                  id="admin-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="admin@jakloud.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl border-white/[0.08] bg-[#18181f] pl-9 pr-3 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-amber-500/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="admin-password"
                  className="text-xs font-medium text-zinc-300"
                >
                  Password
                </Label>
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-[0.68rem] text-zinc-400 hover:text-amber-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500 group-focus-within:text-amber-400 transition-colors">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 rounded-xl border-white/[0.08] bg-[#18181f] pl-9 pr-9 text-xs text-zinc-200 placeholder:text-zinc-500 focus:border-amber-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-0.5">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(c) => setRememberMe(c === true)}
                className="border-white/20 data-[state=checked]:bg-amber-500 data-[state=checked]:text-zinc-950"
              />
              <label
                htmlFor="remember-me"
                className="text-xs text-zinc-400 select-none cursor-pointer"
              >
                Remember this session for 30 days
              </label>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs py-5 shadow-md transition-colors gap-1.5"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <>
                  <span>Enter Kitchen Portal</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-white/[0.06] pt-4 text-center text-[0.68rem] text-zinc-500 font-normal">
            <ShieldCheck className="h-3 w-3 text-amber-400" />
            <span>256-Bit Encrypted Kitchen Management</span>
          </div>

          <div className="mt-2 text-center">
            <Link
              to="/"
              className="text-[0.7rem] text-zinc-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1 font-normal"
            >
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="border-white/10 bg-[#121216] text-zinc-200 sm:max-w-md rounded-2xl">
          <DialogHeader>
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 mb-1">
              <KeyRound className="h-5 w-5" />
            </div>
            <DialogTitle className="text-center font-display text-lg font-semibold text-zinc-100">
              Administrator Password Reset
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-zinc-400 pt-0.5 font-normal">
              Admin credentials for the live Dum biryani kitchen portal are managed by the Head Chef & Founders.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-xl border border-white/[0.06] bg-[#18181f] p-3 text-xs text-zinc-300 space-y-1.5 font-normal">
            <p className="font-medium text-amber-400">Master Recovery Contact:</p>
            <p>• Email: <span className="font-mono text-zinc-200">sales@jakloud.com</span></p>
            <p>• Phone: <span className="font-mono text-zinc-200">417-897-9754</span></p>
            <p className="text-[0.68rem] text-zinc-500 pt-1">
              Default demo credentials: <span className="font-mono text-amber-300">admin@jakloud.com</span> / <span className="font-mono text-amber-300">spiceking2026</span>
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                handleQuickFill();
                setForgotOpen(false);
              }}
              className="border-white/10 text-zinc-300 hover:bg-white/[0.06] text-xs"
            >
              Fill Demo Login
            </Button>
            <Button
              size="sm"
              className="bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-medium"
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
