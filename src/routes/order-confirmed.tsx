import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { EtsyShell } from "@/components/EtsyShell";
import { CheckCircle2 } from "lucide-react";
import { PAYMENT_CONFIG } from "@/config/payment";

export const Route = createFileRoute("/order-confirmed")({
  component: OrderConfirmed,
});

type Order = {
  orderId: string;
  items: { id: string; title: string; qty: number; price: string }[];
  subtotal: number;
  btcAmount: string;
  proofName: string;
  placedAt: string;
};

function OrderConfirmed() {
  const [order, setOrder] = useState<Order | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("last_order_v1");
      if (raw) setOrder(JSON.parse(raw));
    } catch {}
  }, []);

  return (
    <EtsyShell>
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#e8f6ec] flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-9 h-9 text-[#2e7d32]" />
        </div>
        <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          Thank you — your order is being verified
        </h1>
        <p className="text-[#5e5e5e] mb-6">
          We've received your payment proof. Our team is verifying the BTC transaction on-chain and will email you a confirmation as soon as it's complete (usually within 1–6 hours).
        </p>
        {order && (
          <div className="text-left border border-[#e1e3df] rounded p-5 mb-6">
            <p className="text-sm text-[#5e5e5e] mb-1">Order reference</p>
            <p className="font-mono font-semibold mb-4">{order.orderId}</p>
            <div className="space-y-2 mb-4">
              {order.items.map((it) => (
                <div key={it.id} className="flex justify-between text-sm">
                  <span className="line-clamp-1 pr-2">{it.title} × {it.qty}</span>
                  <span>USD {(parseFloat(it.price) * it.qty).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#e1e3df] pt-2 flex justify-between text-sm font-semibold">
              <span>Total</span><span>USD {order.subtotal.toFixed(2)} ({order.btcAmount} BTC)</span>
            </div>
            <p className="text-xs text-[#5e5e5e] mt-3">Proof file received: {order.proofName}</p>
          </div>
        )}
        <Link to="/" className="inline-block bg-[#222] text-white font-semibold py-3 px-8 rounded-full">
          Continue shopping
        </Link>
        <p className="text-xs text-[#5e5e5e] mt-6">
          Questions? Email <a href={`mailto:${PAYMENT_CONFIG.contactEmail}`} className="underline">{PAYMENT_CONFIG.contactEmail}</a>
        </p>
      </div>
    </EtsyShell>
  );
}
