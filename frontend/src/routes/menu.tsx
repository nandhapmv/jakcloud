import { createFileRoute } from "@tanstack/react-router";
import { BiryaniSelectionPage } from "./biryani";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Biryani Menu & Order — JAKloud J Paradize Dum Biryani" },
      {
        name: "description",
        content:
          "Order handcrafted Hyderabadi Dum Biryani handi trays made to order in Springfield, MO. 100% Zabiha Halal chicken, mutton, beef, pork, paneer, and prawn.",
      },
      { property: "og:title", content: "Biryani Menu & Selection — J Paradize Dum Biryani" },
      {
        property: "og:description",
        content: "Authentic slow-cooked Dum Biryani Handi trays serving 4–5 adults. Order by 2:00 PM for next-day fulfillment.",
      },
    ],
  }),
  component: BiryaniSelectionPage,
});
