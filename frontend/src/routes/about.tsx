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
    <div>
      <section className="surface-royal px-4 py-14 text-center">
        <img
          src={logoImg}
          alt="JAKLOUD Spice King heritage seal"
          className="mx-auto h-28 w-28 rounded-full bg-cream object-cover"
          width={112}
          height={112}
        />
        <h1 className="mt-6 text-3xl sm:text-4xl">Two Backgrounds. One Shared Table.</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-cream/80">
          Spice King is a JAKLOUD brand founded by Kartheek A. and Jeanette C.
        </p>
      </section>

      <section className="mx-auto grid max-w-5xl gap-10 px-4 py-14 md:grid-cols-2">
        <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Kartheek comes from Hyderabad, a city whose food culture helped shape the foundation of the Spice King
            recipe. He brings a deep appreciation for authentic dum preparation, layered spices, generous hospitality,
            and the belief that good biryani should turn an ordinary meal into an occasion.
          </p>
          <p>
            Jeanette was raised in Missouri and has always been drawn to creativity, connection, and the ways people can
            come together through shared experiences. She brings that spirit to Spice King, helping bridge two cultures
            through food, hospitality, and a shared table.
          </p>
          <p>
            Together, we want to share a dish we care about deeply: biryani that is fragrant, filling, made with
            intention, and ready to bring people together. By combining Hyderabad-inspired flavor with Missouri
            hospitality, we hope to give Springfield a new way to gather, celebrate, and enjoy a thoughtfully prepared
            meal.
          </p>
        </div>
        <img
          src={handiImg}
          alt="Clay handi of dum biryani"
          className="rounded-xl shadow-[var(--shadow-card)]"
          loading="lazy"
          width={1200}
          height={912}
        />
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 pb-16 md:grid-cols-2">
        <div className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-xl text-primary">Vision</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            To make authentic, Hyderabad-inspired dum biryani a beloved part of Springfield's food culture and to build a
            trusted JAKLOUD food brand known for flavor, nourishment, hospitality, and memorable shared meals.
          </p>
        </div>
        <div className="rounded-xl border bg-card p-6 shadow-[var(--shadow-card)]">
          <h2 className="font-display text-xl text-primary">Mission</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            To prepare generous, made-to-order dum biryani using carefully sourced ingredients, traditional slow-cooking
            principles, and dependable local service.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16">
        <h2 className="text-2xl text-primary">Ingredients & storage</h2>
        <div className="mt-4 rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-[var(--shadow-card)]">
          <p className="font-medium text-foreground">Spice King Dum Biryani (Chicken)</p>
          <p className="mt-2">
            Basmati rice, chicken, water, potato (only if aloo is selected), yogurt and sour cream (MILK), onion, egg,
            ghee (MILK), cashew (TREE NUT), milk (MILK), ginger, garlic, green chili, cilantro, mint, dates, dried
            apricot, raisin, coconut oil, peanut oil, lime juice, Himalayan pink salt, spices (biryani/meat masala,
            garam masala, turmeric, ground red chili, shah jeera, cinnamon, bay leaf, dried fenugreek leaf, saffron,
            dried rose petal). Complimentary dessert (Chef's Selection — laddoo): chickpea flour, sugar, ghee (MILK),
            cashew (TREE NUT), cardamom — may contain WHEAT. For mutton, beef or pork trays, substitute the protein
            name for “chicken”.
          </p>
          <p className="mt-3 font-medium text-foreground">
            CONTAINS: MILK, EGG, TREE NUT (CASHEW). MAY CONTAIN WHEAT AND PEANUT.
          </p>
          <p className="mt-3">
            Your tray is cooked to order and sealed hot. Serve within two hours of pickup or delivery. Open the sealed
            lid, pour over the warm ghee, cashew and fried onion pack, add the boiled eggs, and serve with raita,
            onion-lime and your Chef's Selection dessert. Refrigerate leftovers below 40°F within two hours and enjoy
            within three days, reheating to 165°F before serving.
          </p>
        </div>
      </section>
    </div>
  );
}
