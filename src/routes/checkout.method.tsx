import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { EtsyShell } from "@/components/EtsyShell";
import { PAYMENT_METHODS, type PaymentMethod } from "@/config/payment";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/checkout/method")({
  component: MethodPage,
});

function MethodPage() {
  const navigate = useNavigate();
  const { items } = useCart();

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

  const choose = (m: PaymentMethod) => {
    navigate({ to: "/checkout/payment", search: { method: m } });
  };

  return (
    <EtsyShell back={{ to: "/checkout", label: "Back to details" }}>
      <div className="max-w-2xl mx-auto py-6">
        <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          Choose your payment method
        </h1>
        <p className="text-[#5e5e5e] mb-6">Select a cryptocurrency to continue.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(Object.values(PAYMENT_METHODS)).map((m) => (
            <button
              key={m.id}
              onClick={() => choose(m.id)}
              className="border-2 border-[#e1e3df] hover:border-[#222] rounded-lg p-5 flex flex-col items-center text-center transition-colors bg-white"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-3"
                style={{ backgroundColor: m.color }}
              >
                {m.symbol}
              </div>
              <p className="font-semibold">{m.name}</p>
              <p className="text-xs text-[#5e5e5e]">{m.ticker} · {m.network}</p>
            </button>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/payment-other" className="text-sm text-[#a05c00] underline">
            Don't see your payment option?
          </Link>
        </div>
      </div>
    </EtsyShell>
  );
}
