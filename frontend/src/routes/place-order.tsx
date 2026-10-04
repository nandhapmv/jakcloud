import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/place-order")({
  component: () => <Navigate to="/checkout" replace />,
});
