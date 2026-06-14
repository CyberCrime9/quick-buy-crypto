import { createFileRoute, Link } from "@tanstack/react-router";
import { EtsyShell } from "@/components/EtsyShell";
import { PAYMENT_CONFIG } from "@/config/payment";
import { Mail } from "lucide-react";

export const Route = createFileRoute("/payment-other")({
  component: PaymentOther,
});

function PaymentOther() {
  return (
    <EtsyShell back={{ to: "/checkout/payment", label: "Back to payment" }}>
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="w-16 h-16 rounded-full bg-[#fff4eb] flex items-center justify-center mx-auto mb-5">
          <Mail className="w-8 h-8 text-[#a05c00]" />
        </div>
        <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          Don't see your payment option?
        </h1>
        <p className="text-[#5e5e5e] mb-5">
          No problem. Please email us with your preferred payment method and your order details, and we'll get back to you with instructions within a few hours.
        </p>
        <a
          href={`mailto:${PAYMENT_CONFIG.contactEmail}?subject=Alternative%20payment%20method`}
          className="inline-block bg-[#222] text-white font-semibold py-3 px-8 rounded-full mb-3"
        >
          {PAYMENT_CONFIG.contactEmail}
        </a>
        <p className="text-xs text-[#5e5e5e]">
          Include your preferred payment method (PayPal, bank transfer, other crypto, etc.) and a list of the items you want to order.
        </p>
        <div className="mt-8">
          <Link to="/checkout/payment" className="text-sm text-[#a05c00] underline">← Return to BTC checkout</Link>
        </div>
      </div>
    </EtsyShell>
  );
}
