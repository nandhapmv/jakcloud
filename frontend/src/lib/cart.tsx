import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ALOO_CHARGE, MENU, type ProteinId } from "./menu";

export type CartLine = {
  key: string;
  proteinId: ProteinId;
  name: string;
  aloo: boolean;
  extraSpicy: boolean;
  notes: string;
  qty: number;
  unitPrice: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  addLine: (line: Omit<CartLine, "key">) => void;
  setQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "spiceking-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* ignore */
    }
  }, [lines]);

  const value = useMemo<CartContextValue>(() => {
    const addLine: CartContextValue["addLine"] = (line) => {
      const key = [line.proteinId, line.aloo ? "aloo" : "plain", line.extraSpicy ? "hot" : "reg", line.notes.trim()].join(
        "|",
      );
      setLines((prev) => {
        const existing = prev.find((l) => l.key === key);
        if (existing) {
          return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + line.qty } : l));
        }
        return [...prev, { ...line, key }];
      });
    };

    return {
      lines,
      count: lines.reduce((sum, l) => sum + l.qty, 0),
      subtotal: lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0),
      addLine,
      setQty: (key, qty) =>
        setLines((prev) =>
          qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty } : l)),
        ),
      removeLine: (key) => setLines((prev) => prev.filter((l) => l.key !== key)),
      clear: () => setLines([]),
    };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

export function unitPriceFor(proteinId: ProteinId, aloo: boolean) {
  const item = MENU.find((m) => m.id === proteinId)!;
  return aloo ? item.price + ALOO_CHARGE : item.price;
}
