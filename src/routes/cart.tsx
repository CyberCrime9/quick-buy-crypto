import { createFileRoute, Link } from "@tanstack/react-router";
import { EtsyShell } from "@/components/EtsyShell";
import { useCart, setQty, removeFromCart } from "@/lib/cart";
import { Trash2 } from "lucide-react";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const { items, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <EtsyShell back={{ to: "/", label: "Continue shopping" }}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-semibold mb-2" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Your cart is empty</h1>
          <p className="text-[#5e5e5e] mb-6">Find something special on the shop.</p>
          <Link to="/" className="inline-block bg-[#222] text-white font-semibold py-3 px-8 rounded-full">Browse shop</Link>
        </div>
      </EtsyShell>
    );
  }

  return (
    <EtsyShell back={{ to: "/", label: "Continue shopping" }}>
      <h1 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Your cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((it) => (
            <div key={it.id} className="flex gap-4 border border-[#e1e3df] rounded p-4">
              <Link to="/product/$id" params={{ id: it.id }} className="w-24 h-24 bg-[#f3f3f3] rounded overflow-hidden flex-shrink-0">
                {it.product.image && <img src={it.product.image} alt={it.product.title} className="w-full h-full object-cover" />}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to="/product/$id" params={{ id: it.id }} className="text-sm font-medium line-clamp-2 hover:underline">
                  {it.product.title}
                </Link>
                <p className="text-xs text-[#5e5e5e] mt-1">{it.product.shop || "Etsy Seller"}</p>
                <div className="flex items-center gap-3 mt-2">
                  <select
                    value={it.qty}
                    onChange={(e) => setQty(it.id, parseInt(e.target.value, 10))}
                    className="border border-[#222] rounded px-2 py-1 text-sm"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <button onClick={() => removeFromCart(it.id)} className="text-sm text-[#5e5e5e] inline-flex items-center gap-1 hover:text-[#d9534f]">
                    <Trash2 className="w-4 h-4" /> Remove
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{it.product.currency} {(parseFloat(it.product.price) * it.qty).toFixed(2)}</p>
                <p className="text-xs text-[#5e5e5e]">{it.product.currency} {it.product.price} each</p>
              </div>
            </div>
          ))}
        </div>

        <aside className="border border-[#e1e3df] rounded p-5 h-fit">
          <h2 className="font-semibold mb-3">Order summary</h2>
          <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><span>USD {subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between text-sm mb-2"><span>Shipping</span><span>Calculated at checkout</span></div>
          <div className="border-t border-[#e1e3df] mt-3 pt-3 flex justify-between font-semibold">
            <span>Total</span><span>USD {subtotal.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="block text-center bg-[#222] text-white font-semibold py-3 rounded-full mt-5 hover:bg-black">
            Proceed to checkout
          </Link>
          <p className="text-xs text-[#5e5e5e] text-center mt-3">Payment by Bitcoin (BTC)</p>
        </aside>
      </div>
    </EtsyShell>
  );
}
