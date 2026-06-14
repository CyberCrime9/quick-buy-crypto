import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { EtsyShell } from "@/components/EtsyShell";
import { useCart, clearCart } from "@/lib/cart";
import { PAYMENT_METHODS, type PaymentMethod } from "@/config/payment";
import { Copy, RefreshCw, Upload, CheckCircle2 } from "lucide-react";

const searchSchema = z.object({
  method: z.enum(["btc", "eth", "usdt"]).default("btc"),
});

export const Route = createFileRoute("/checkout/payment")({
  validateSearch: searchSchema,
  component: PaymentPage,
});

function PaymentPage() {
  const navigate = useNavigate();
  const { method } = Route.useSearch();
  const m = PAYMENT_METHODS[method];
  const { items, subtotal } = useCart();
  const [rate, setRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);
  const [rateError, setRateError] = useState(false);
  const [proof, setProof] = useState<File | null>(null);
  const [proofError, setProofError] = useState<string | null>(null);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedAmt, setCopiedAmt] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkout, setCheckout] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("checkout_v1");
      if (raw) setCheckout(JSON.parse(raw));
    } catch {/* ignore */}
  }, []);

  const shippingCost = Number(checkout?.shippingCost) || 0;
  const grandTotal = subtotal + shippingCost;

  const fetchRate = async () => {
    setRateLoading(true);
    setRateError(false);
    try {
      const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${m.coingeckoId}&vs_currencies=usd`);
      const j = await r.json();
      const v = j?.[m.coingeckoId]?.usd;
      if (v) setRate(v);
      else setRateError(true);
    } catch {
      setRateError(true);
    } finally {
      setRateLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
    const iv = setInterval(fetchRate, 30000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method]);

  if (items.length === 0) {
    return (
      <EtsyShell back={{ to: "/cart", label: "Back to cart" }}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-semibold mb-2">Your cart is empty</h1>
          <Link to="/cart" className="text-[#a05c00] underline">Go to cart</Link>
        </div>
      </EtsyShell>
    );
  }

  const cryptoAmount = rate ? (grandTotal / rate).toFixed(m.decimals) : "—";

  const copy = (text: string, which: "addr" | "amt") => {
    navigator.clipboard.writeText(text).then(() => {
      if (which === "addr") { setCopiedAddr(true); setTimeout(() => setCopiedAddr(false), 1500); }
      else { setCopiedAmt(true); setTimeout(() => setCopiedAmt(false), 1500); }
    });
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) {
      setProofError("File too large (max 10 MB)");
      setProof(null);
      return;
    }
    setProofError(null);
    setProof(f);
  };

  const onComplete = () => {
    if (!checkout) {
      setProofError("Missing shipping details. Please complete the previous step.");
      setTimeout(() => navigate({ to: "/checkout" }), 800);
      return;
    }
    if (!checkout.shippingCourier) {
      setProofError("No shipping method selected. Please go back and pick one.");
      return;
    }
    if (!proof) { setProofError("Please upload your payment proof first."); return; }
    setSubmitting(true);
    const order = {
      orderId: "VW-" + Date.now().toString(36).toUpperCase(),
      items: items.map((it) => ({ id: it.id, title: it.product.title, qty: it.qty, price: it.product.price })),
      subtotal,
      shippingCost,
      shippingCourier: checkout.shippingCourierName || checkout.shippingCourier,
      total: grandTotal,
      paymentMethod: m.ticker,
      cryptoAmount,
      proofName: proof.name,
      proofSize: proof.size,
      placedAt: new Date().toISOString(),
    };
    localStorage.setItem("last_order_v1", JSON.stringify(order));
    clearCart();
    setTimeout(() => navigate({ to: "/order-confirmed" }), 400);
  };

  return (
    <EtsyShell back={{ to: "/checkout/method", label: "Back to payment methods" }}>
      <h1 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Payment</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="border-2 border-[#222] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: m.color }}>{m.symbol}</div>
                <div>
                  <p className="font-semibold">{m.name} ({m.ticker})</p>
                  <p className="text-xs text-[#5e5e5e]">Network: {m.network}</p>
                </div>
              </div>
              <Link to="/checkout/method" className="text-xs text-[#a05c00] underline">Change</Link>
            </div>

            <div className="bg-[#fafafa] border border-[#e1e3df] rounded p-4 space-y-3">
              <div>
                <p className="text-xs text-[#5e5e5e] mb-1">Order total</p>
                <p className="text-2xl font-bold">USD {grandTotal.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-[#5e5e5e]">Live {m.ticker} rate:</span>
                {rateLoading ? <span>Updating…</span> : rateError ? <span className="text-[#d9534f]">Unavailable</span> : <span>1 {m.ticker} = USD {rate?.toLocaleString()}</span>}
                <button onClick={fetchRate} className="ml-1 text-[#5e5e5e] hover:text-[#222]" aria-label="Refresh">
                  <RefreshCw className={`w-3.5 h-3.5 ${rateLoading ? "animate-spin" : ""}`} />
                </button>
              </div>
              <div>
                <p className="text-xs text-[#5e5e5e] mb-1">Amount to send</p>
                <div className="flex items-center gap-2 bg-white border border-[#e1e3df] rounded px-3 py-2">
                  <span className="font-mono text-lg flex-1">{cryptoAmount} {m.ticker}</span>
                  <button onClick={() => copy(cryptoAmount, "amt")} className="text-xs inline-flex items-center gap-1 text-[#5e5e5e] hover:text-[#222]">
                    {copiedAmt ? <><CheckCircle2 className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="bg-white border border-[#e1e3df] rounded p-2 flex-shrink-0">
                  <img src={m.qr} alt={`${m.name} QR code`} className="w-36 h-36 block" />
                  <p className="text-[10px] text-center text-[#5e5e5e] mt-1">Scan to pay</p>
                </div>
                <div className="flex-1 w-full">
                  <p className="text-xs text-[#5e5e5e] mb-1">Send to this {m.ticker} address ({m.network})</p>
                  <div className="flex items-center gap-2 bg-white border border-[#e1e3df] rounded px-3 py-2 mb-2">
                    <span className="font-mono text-sm break-all flex-1">{m.address}</span>
                  </div>
                  <button
                    onClick={() => copy(m.address, "addr")}
                    className="w-full text-sm inline-flex items-center justify-center gap-2 bg-[#222] text-white px-3 py-2 rounded hover:bg-black"
                  >
                    {copiedAddr ? <><CheckCircle2 className="w-4 h-4" /> Address copied</> : <><Copy className="w-4 h-4" /> Copy wallet address</>}
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#5e5e5e]">
                The {m.ticker} amount is recalculated against the live rate. Please send the exact amount shown above to avoid order delays.
                {m.id === "usdt" && " Make sure you send via the TRC20 network."}
              </p>
            </div>
          </div>

          <div className="border border-[#e1e3df] rounded-lg p-5">
            <h2 className="font-semibold mb-2">Upload payment proof <span className="text-[#d9534f]">*</span></h2>
            <p className="text-sm text-[#5e5e5e] mb-3">
              Upload a screenshot or PDF of your transaction confirmation (max 10 MB). Required before completing the order.
            </p>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#222] rounded p-6 cursor-pointer hover:bg-[#fafafa]">
              <Upload className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">{proof ? proof.name : "Choose file"}</span>
              <span className="text-xs text-[#5e5e5e] mt-1">{proof ? `${(proof.size / 1024).toFixed(1)} KB — click to replace` : "PNG, JPG, or PDF"}</span>
              <input type="file" accept="image/*,.pdf" onChange={onFile} className="hidden" />
            </label>
            {proofError && <p className="text-xs text-[#d9534f] mt-2">{proofError}</p>}
          </div>

          <button
            type="button"
            onClick={onComplete}
            disabled={submitting}
            className="w-full bg-[#222] text-white font-semibold py-3 rounded-full hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Processing…" : "Complete Payment"}
          </button>

          <div className="text-center">
            <Link to="/payment-other" className="text-sm text-[#a05c00] underline">
              Don't see your payment option?
            </Link>
          </div>
        </div>

        <aside className="border border-[#e1e3df] rounded p-5 h-fit">
          <h2 className="font-semibold mb-3">Order summary</h2>
          <div className="space-y-3 mb-4">
            {items.map((it) => (
              <div key={it.id} className="flex gap-3 text-sm">
                <div className="w-12 h-12 bg-[#f3f3f3] rounded overflow-hidden flex-shrink-0">
                  {it.product.image && <img src={it.product.image} className="w-full h-full object-cover" alt="" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="line-clamp-2">{it.product.title}</p>
                  <p className="text-[#5e5e5e] text-xs">Qty {it.qty}</p>
                </div>
                <p className="font-medium">USD {(parseFloat(it.product.price) * it.qty).toFixed(2)}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#e1e3df] pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>USD {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between">
              <span>Shipping{checkout?.shippingCourierName ? ` (${checkout.shippingCourierName})` : ""}</span>
              <span>{shippingCost > 0 ? `USD ${shippingCost.toFixed(2)}` : "—"}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-[#e1e3df]">
              <span>Total</span><span>USD {grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[#5e5e5e]">
              <span>In {m.ticker}</span><span className="font-mono">{cryptoAmount}</span>
            </div>
          </div>
        </aside>
      </div>
    </EtsyShell>
  );
}
