import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Mail, MapPin, Phone, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

import { BUSINESS } from "@/lib/menu";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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
    <div>
      <section className="surface-royal px-4 py-14 text-center">
        <h1 className="text-3xl sm:text-4xl">Talk to Spice King</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-cream/80">
          Email, phone, text, or drop us a message below. We respond during order hours, 7:00 AM to 2:00 PM.
        </p>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-14 space-y-10">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact details */}
          <div className="space-y-4 rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-xl text-primary">Reach us</h2>
            <a href={`tel:${BUSINESS.phone}`} className="flex items-center gap-3 text-sm hover:text-chili">
              <Phone className="h-5 w-5 shrink-0 text-gold" /> Call or text {BUSINESS.phone}
            </a>
            <a href={`mailto:${BUSINESS.email}`} className="flex items-center gap-3 text-sm hover:text-chili">
              <Mail className="h-5 w-5 shrink-0 text-gold" /> {BUSINESS.email}
            </a>
            <p className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" /> {BUSINESS.address}
            </p>
            <p className="text-sm text-muted-foreground">
              Delivery area: within 10 miles of 65809. Delivery fee $10.
            </p>
          </div>

          {/* Operating hours */}
          <div className="space-y-3 rounded-xl border bg-card p-6 text-sm shadow-[var(--shadow-card)]">
            <h2 className="flex items-center gap-2 font-display text-xl text-primary">
              <Clock className="h-5 w-5 text-gold" /> Hours
            </h2>
            <p>Order taking: 7:00 AM – 2:00 PM</p>
            <p>Pickup: 11:00 AM – 6:00 PM</p>
            <p>Delivery: 2:00 PM – 6:00 PM</p>
            <p>Open Sunday, Monday, Tuesday, Thursday, Friday, Saturday</p>
            <p className="text-muted-foreground">Closed Wednesdays and some holidays.</p>
            <p className="rounded-md bg-accent/70 p-3 text-xs">
              Orders must be placed by 2:00 PM for next-day pickup or delivery, subject to ingredient, production and
              delivery availability.
            </p>
          </div>
        </div>

        {/* Send message form */}
        <div className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
          <h2 className="font-display text-2xl text-primary">Send Us a Direct Message</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Have questions about catering, private events, ingredients, or custom spice levels? Write to us.
          </p>

          {sentSuccess ? (
            <div className="mt-6 rounded-lg bg-primary/10 p-6 text-center">
              <CheckCircle className="mx-auto h-10 w-10 text-gold" />
              <h3 className="mt-2 font-display text-lg text-primary">Message Received!</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Thank you for contacting JAKLOUD Spice King. Our team will reply to your email shortly.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setSentSuccess(false)}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="c-name">Your Name *</Label>
                  <Input
                    id="c-name"
                    required
                    placeholder="e.g. Kartheek"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="c-email">Email Address *</Label>
                  <Input
                    id="c-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="c-phone">Phone Number (Optional)</Label>
                  <Input
                    id="c-phone"
                    type="tel"
                    placeholder="417-897-9754"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="c-subject">Subject (Optional)</Label>
                  <Input
                    id="c-subject"
                    placeholder="e.g. Catering inquiry / Event tray order"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="c-msg">Message *</Label>
                <Textarea
                  id="c-msg"
                  required
                  rows={4}
                  placeholder="Tell us what you need..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 bg-card text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-saffron text-saffron-foreground hover:bg-saffron/90 gap-2"
              >
                <Send className="h-4 w-4" /> {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
