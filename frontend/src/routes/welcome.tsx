import { createFileRoute } from "@tanstack/react-router";
import { QrWelcomePage } from "./qr";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to JAKloud — QR Mobile Ordering" },
      {
        name: "description",
        content:
          "Welcome to JAKloud J Paradize Dum Biryani. Scan confirmed! Order your royal Dum Biryani Handi tray now.",
      },
    ],
  }),
  component: QrWelcomePage,
});
