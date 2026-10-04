import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send, CheckCircle, MessageSquare } from "lucide-react";
import { toast } from "sonner";

import { BUSINESS } from "@/lib/menu";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { sanitizeName, formatUsPhone, isValidName, isValidUsPhone } from "@/lib/validation";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Hours — JAKLOUD Spice King" },
      {
        name: "description",
        content:
          "Call or text 417-897-9754, email sales@jakloud.com, or visit 3625 S Bedford Ave., Springfield, MO 65809. Order hours 7:00 AM – 2:00 PM.",
      },
      { property: "og:title", content: "Contact JAKLOUD Spice King" },
      { property: "og:description", content: "Hours, pickup address and delivery area for Spice King Dum Biryani." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in your name, email, and message.");
      return;
    }

    if (!isValidName(name)) {
      toast.error("Please enter a valid name (letters only, min 2 characters).");
      return;
    }

    if (phone.trim() && !isValidUsPhone(phone)) {
      toast.error("Please enter a valid 10-digit US phone number, e.g. (417) 897-9754.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.sendContact({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim() || undefined,
        message: message.trim(),
      });

      setSentSuccess(true);
      toast.success(res.message || "Message sent successfully!");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Failed to send message";
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-200 selection:bg-amber-500/20 selection:text-amber-300 pb-20">
      <section className="relative border-b border-white/[0.08] bg-[#121216] px-4 py-12 text-center">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-zinc-100">Talk to Spice King</h1>
        <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-zinc-400 font-normal">
          Email, phone, text, or drop us a message below. We respond promptly during kitchen hours (7:00 AM to 2:00 PM).
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact details */}
          <div className="space-y-3.5 rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 shadow-xl text-xs font-normal">
            <h2 className="font-display text-lg font-semibold text-amber-400">Reach Us</h2>
            <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-2.5 text-zinc-300 hover:text-amber-300 transition-colors">
              <Phone className="h-4 w-4 shrink-0 text-amber-400" /> <span>Call or text {BUSINESS.phone}</span>
            </a>
            <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-2.5 text-zinc-300 hover:text-amber-300 transition-colors">
              <Mail className="h-4 w-4 shrink-0 text-amber-400" /> <span>{BUSINESS.email}</span>
            </a>
            <a
              href="https://wa.me/14178979754?text=Hello%20Master%20Chef%20Kartheek!%20I%20have%20an%20inquiry%20regarding%20JAKLOUD%20Dum%20Biryani."
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 text-emerald-400 hover:underline"
            >
              <MessageSquare className="h-4 w-4 shrink-0" /> <span>WhatsApp: +1 417-897-9754</span>
            </a>
            <p className="flex items-start gap-2.5 text-zinc-400 pt-1">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" /> <span>{BUSINESS.address}</span>
            </p>
            <p className="text-zinc-500 text-[0.72rem] pt-2 border-t border-white/[0.04]">
              Springfield Delivery Area: within 10 miles of 65809. Flat delivery fee $10.
            </p>
          </div>

          {/* Operating hours */}
          <div className="space-y-2.5 rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 text-xs shadow-xl text-zinc-400 font-normal">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-amber-400">
              <Clock className="h-4 w-4 text-amber-400" /> Daily Kitchen Schedule
            </h2>
            <p><span className="text-zinc-200 font-medium">Order Cutoff:</span> 7:00 AM – 2:00 PM</p>
            <p><span className="text-zinc-200 font-medium">Hot Counter Pickup:</span> 11:00 AM – 6:00 PM</p>
            <p><span className="text-zinc-200 font-medium">Doorstep Delivery:</span> 2:00 PM – 6:00 PM</p>
            <p className="text-zinc-500">Open Sunday, Monday, Tuesday, Thursday, Friday, Saturday</p>
            <p className="text-amber-400/80 text-[0.68rem]">Closed Wednesdays for fresh spice grinding and marinations.</p>
            <p className="rounded-xl bg-[#18181f] border border-white/[0.06] p-2.5 text-[0.68rem] text-zinc-400">
              Orders must be placed by 2:00 PM for next-day pickup or delivery, subject to our 25-tray daily slow-cooked batch limit.
            </p>
          </div>
        </div>

        {/* Send message form */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-8 shadow-xl space-y-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-zinc-100">Send Us a Direct Message</h2>
            <p className="text-xs text-zinc-400 font-normal mt-0.5">
              Have questions about catering, private celebrations, ingredients, or custom spice requests? Let us know.
            </p>
          </div>

          {sentSuccess ? (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-6 text-center space-y-2">
              <CheckCircle className="mx-auto h-8 w-8 text-amber-400" />
              <h3 className="font-display text-base font-semibold text-zinc-100">Message Received!</h3>
              <p className="text-xs text-zinc-400 font-normal">
                Thank you for reaching out to JAKLOUD Spice King. Master Chef Kartheek will reply to your email shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 text-xs border-white/10 text-zinc-300 hover:bg-white/[0.06]"
                onClick={() => setSentSuccess(false)}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="c-name" className="text-xs font-medium text-zinc-300">Your Name (Letters Only) *</Label>
                  <Input
                    id="c-name"
                    required
                    placeholder="e.g. Kartheek Reddy"
                    value={name}
                    onChange={(e) => setName(sanitizeName(e.target.value))}
                    className="mt-1 bg-[#18181f] border-white/[0.08] text-zinc-200 text-xs rounded-xl focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <Label htmlFor="c-email" className="text-xs font-medium text-zinc-300">Email Address *</Label>
                  <Input
                    id="c-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 bg-[#18181f] border-white/[0.08] text-zinc-200 text-xs rounded-xl focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="c-phone" className="text-xs font-medium text-zinc-300">US Phone Number (Optional)</Label>
                  <Input
                    id="c-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={14}
                    placeholder="(417) 897-9754"
                    value={phone}
                    onChange={(e) => setPhone(formatUsPhone(e.target.value))}
                    className="mt-1 bg-[#18181f] border-white/[0.08] text-zinc-200 font-mono text-xs rounded-xl focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <Label htmlFor="c-subject" className="text-xs font-medium text-zinc-300">Subject (Optional)</Label>
                  <Input
                    id="c-subject"
                    placeholder="e.g. Catering inquiry / Event tray order"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 bg-[#18181f] border-white/[0.08] text-zinc-200 text-xs rounded-xl focus:border-amber-500/50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="c-msg" className="text-xs font-medium text-zinc-300">Message *</Label>
                <Textarea
                  id="c-msg"
                  required
                  rows={4}
                  placeholder="Tell us what you need..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 bg-[#18181f] border-white/[0.08] text-zinc-200 text-xs rounded-xl focus:border-amber-500/50"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-medium text-xs rounded-xl px-5 py-2.5 gap-2"
              >
                <Send className="h-3.5 w-3.5" /> {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
