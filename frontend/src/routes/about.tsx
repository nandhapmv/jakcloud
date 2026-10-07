import { createFileRoute } from "@tanstack/react-router";

import logoImg from "@/assets/logo.png";
import handiImg from "@/assets/dum-handi.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — JAKLOUD Spice King" },
      {
        name: "description",
        content:
          "Spice King is a JAKLOUD brand founded by Kartheek A. and Jeanette C., bringing Hyderabad-inspired dum biryani to Springfield, Missouri.",
      },
      { property: "og:title", content: "Two Backgrounds. One Shared Table." },
      {
        property: "og:description",
        content: "Hyderabad soul, Missouri hospitality — the story behind Spice King Dum Biryani.",
      },
      { property: "og:image", content: "/logo.png" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-[#09090b] font-sans text-zinc-200 selection:bg-amber-500/20 selection:text-amber-300 pb-12">
      <section className="relative border-b border-white/[0.08] bg-[#121216] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center gap-5 text-left">
          <img
            src={logoImg}
            alt="JAKLOUD Spice King heritage seal"
            className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-full border border-amber-500/30 object-cover shadow-lg"
            width={96}
            height={96}
          />
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-medium">Culinary Heritage</span>
            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-zinc-100">
              Two Backgrounds. One Shared Table.
            </h1>
            <p className="max-w-2xl text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
              Spice King is a JAKLOUD culinary brand founded by Kartheek A. and Jeanette C. in Springfield, Missouri.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="grid gap-6 md:grid-cols-2 items-center">
          <div className="space-y-3 text-xs sm:text-sm leading-relaxed text-zinc-400 font-normal">
            <p>
              Kartheek comes from Hyderabad, a city whose centuries-old food culture shaped the foundation of the Spice King
              recipe. He brings deep appreciation for authentic dum preparation, layered slow-roasted spices, and the belief that handcrafted biryani turns every meal into an occasion.
            </p>
            <p>
              Jeanette was raised in Missouri and has always been drawn to creativity, connection, and the ways people come
              together through shared experiences. She brings that warmth to Spice King, bridging two cultures through food, hospitality, and a welcoming table.
            </p>
            <p>
              Together, we share biryani that is fragrant, generous, and made with intention. By combining Hyderabad-inspired
              slow-cooking technique with Missouri warmth, we offer Springfield a new way to celebrate with memorable meals.
            </p>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-xl">
            <img
              src={handiImg}
              alt="Clay handi of dum biryani"
              className="w-full h-72 sm:h-80 object-cover"
              loading="lazy"
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 shadow-sm hover:border-amber-500/30 transition-all space-y-2">
            <h2 className="font-display text-lg font-semibold text-amber-400">Our Vision</h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
              To make authentic, Hyderabad-inspired dum biryani a beloved staple of Springfield's culinary landscape, building a trusted JAKLOUD brand celebrated for pure flavors, nourishment, and hospitality.
            </p>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 shadow-sm hover:border-amber-500/30 transition-all space-y-2">
            <h2 className="font-display text-lg font-semibold text-amber-400">Our Mission</h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
              To prepare generous, made-to-order dum biryani using 100% Zabiha Halal proteins, aged long-grain basmati, and traditional sealed-dough slow-cooking with reliable local pickup and delivery.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <div className="text-left space-y-1">
            <span className="text-xs uppercase tracking-wider text-amber-400 font-medium">Safe Preparation & Care</span>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-zinc-100">Ingredients & Storage Guide</h2>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#121216] p-5 sm:p-6 text-xs text-zinc-400 space-y-3 font-normal leading-relaxed">
            <p className="font-medium text-zinc-200">Spice King Dum Biryani (Chicken)</p>
            <p>
              Basmati rice, chicken, water, potato (only if aloo is selected), yogurt and sour cream (MILK), onion, egg,
              ghee (MILK), cashew (TREE NUT), milk (MILK), ginger, garlic, green chili, cilantro, mint, dates, dried
              apricot, raisin, coconut oil, peanut oil, lime juice, Himalayan pink salt, spices (biryani/meat masala,
              garam masala, turmeric, ground red chili, shah jeera, cinnamon, bay leaf, dried fenugreek leaf, saffron,
              dried rose petal). Complimentary dessert (Chef's Selection laddoo): chickpea flour, sugar, ghee (MILK),
              cashew (TREE NUT), cardamom. For mutton, beef, or pork trays, substitute the protein name.
            </p>
            <p className="font-medium text-amber-400">
              CONTAINS: MILK, EGG, TREE NUT (CASHEW). MAY CONTAIN WHEAT AND PEANUT.
            </p>
            <p className="text-zinc-500">
              Your tray is cooked to order and sealed hot. Serve within two hours of pickup or delivery. Open the sealed
              lid, pour over the warm ghee, cashew, and fried onion garnish, add the boiled eggs, and serve with raita,
              onion-lime, and your dessert. Refrigerate leftovers below 40°F within two hours and enjoy within three days.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
