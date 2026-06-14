import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/cart";
import { PAYMENT_CONFIG } from "@/config/payment";

type BackTarget = "/" | "/cart" | "/checkout" | "/checkout/payment";

export function EtsyShell({
  children,
  back,
}: {
  children: ReactNode;
  back?: { to: BackTarget; label: string };
}) {
  const { count } = useCart();
  const navigate = useNavigate();

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
      return;
    }
    navigate({ to: back?.to || "/" });
  };

  return (
    <div className="min-h-screen bg-transparent text-[#222]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <header className="border-b border-[#e1e3df] sticky top-0 bg-white/85 backdrop-blur z-30">

        <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold tracking-tight" style={{ color: "#F1641E", fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {PAYMENT_CONFIG.shopName}
          </Link>
          <Link to="/cart" className="relative inline-flex items-center gap-2 text-sm font-medium">
            <ShoppingBag className="w-6 h-6" />
            {count > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#d9534f] text-white text-[11px] leading-none px-[6px] py-[3px] rounded-full font-bold">
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>
      {back && (
        <div className="max-w-[1200px] mx-auto px-4 pt-4">
          <button type="button" onClick={goBack} className="inline-flex items-center gap-1 text-sm text-[#5e5e5e] hover:underline">
            <ArrowLeft className="w-4 h-4" /> {back.label}
          </button>
        </div>
      )}
      <main className="max-w-[1200px] mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-[#e1e3df] mt-16">
        <div className="max-w-[1200px] mx-auto px-4 py-6 text-xs text-[#7a7a7a] text-center">
          © {new Date().getFullYear()} {PAYMENT_CONFIG.shopName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
