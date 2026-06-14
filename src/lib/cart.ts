import { useEffect, useState, useCallback } from "react";
import { productById, type Product } from "@/data/products";

const KEY = "cart_v1";
const EVT = "cart_v1_change";

export type CartItem = { id: string; qty: number };

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVT));
}

export function addToCart(id: string, qty = 1) {
  const items = read();
  const existing = items.find((i) => i.id === id);
  if (existing) existing.qty += qty;
  else items.push({ id, qty });
  write(items);
}

export function setQty(id: string, qty: number) {
  let items = read();
  if (qty <= 0) items = items.filter((i) => i.id !== id);
  else items = items.map((i) => (i.id === id ? { ...i, qty } : i));
  write(items);
}

export function removeFromCart(id: string) {
  write(read().filter((i) => i.id !== id));
}

export function clearCart() {
  write([]);
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    setItems(read());
    const onChange = () => setItems(read());
    window.addEventListener(EVT, onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener(EVT, onChange);
      window.removeEventListener("storage", onChange);
    };
  }, []);
  const detailed = items
    .map((i) => {
      const p = productById.get(i.id);
      return p ? { ...i, product: p } : null;
    })
    .filter(Boolean) as Array<CartItem & { product: Product }>;
  const subtotal = detailed.reduce(
    (s, it) => s + parseFloat(it.product.price) * it.qty,
    0,
  );
  const count = items.reduce((n, i) => n + i.qty, 0);
  return { items: detailed, subtotal, count };
}
