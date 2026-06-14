import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod";
import { EtsyShell } from "@/components/EtsyShell";
import { useCart } from "@/lib/cart";
import { COUNTRIES, type Country } from "@/data/countries";

export const Route = createFileRoute("/checkout/")({
  component: CheckoutPage,
});

const schema = z.object({
  firstName: z.string().trim().min(1, "Required").max(40),
  lastName: z.string().trim().min(1, "Required").max(40),
  email: z.string().trim().email("Invalid email").max(120),
  phone: z.string().trim().min(6, "Required").max(30),
  address1: z.string().trim().min(3, "Required").max(160),
  address2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(1, "Required").max(60),
  state: z.string().trim().min(1, "Required").max(60),
  postcode: z.string().trim().min(2, "Required").max(20),
  country: z.string().trim().min(2, "Required").max(60),
  countryCode: z.string().trim().length(2),
  notes: z.string().trim().max(500).optional(),
  shippingCourier: z.string().trim().min(1, "Please select a shipping method"),
  shippingCost: z.number(),
});

type Form = z.infer<typeof schema>;

const DEFAULT_COUNTRY = COUNTRIES.find((c) => c.code === "US")!;

const EMAIL_DOMAINS = ["gmail.com", "yahoo.com", "outlook.com", "icloud.com", "hotmail.com"];

const EU_CODES = new Set([
  "DE","FR","ES","IT","NL","BE","CH","AT","PT","SE","NO","DK","FI","IS",
  "PL","CZ","SK","HU","RO","BG","GR","IE",
]);

type Courier = { id: string; name: string; base: number; emoji: string };

function couriersFor(code: string): Courier[] {
  switch (code) {
    case "US":
      return [
        { id: "usps", name: "USPS Priority", base: 8.5, emoji: "📮" },
        { id: "ups", name: "UPS Ground", base: 12, emoji: "🚚" },
        { id: "fedex", name: "FedEx Home", base: 13.5, emoji: "✈️" },
      ];
    case "GB":
      return [
        { id: "royalmail", name: "Royal Mail Tracked", base: 7, emoji: "📮" },
        { id: "dpd", name: "DPD", base: 9, emoji: "📦" },
        { id: "evri", name: "Evri", base: 6, emoji: "🚚" },
      ];
    case "CA":
      return [
        { id: "canadapost", name: "Canada Post Expedited", base: 11, emoji: "📮" },
        { id: "ups", name: "UPS Standard", base: 14, emoji: "🚚" },
      ];
    case "AU":
      return [
        { id: "auspost", name: "Australia Post", base: 12, emoji: "📮" },
        { id: "dhl", name: "DHL", base: 18, emoji: "✈️" },
      ];
    default:
      if (EU_CODES.has(code)) {
        return [
          { id: "dhl", name: "DHL", base: 14, emoji: "✈️" },
          { id: "dpd", name: "DPD", base: 12, emoji: "📦" },
          { id: "gls", name: "GLS", base: 11, emoji: "🚚" },
          { id: "ups", name: "UPS Standard", base: 15, emoji: "🚚" },
        ];
      }
      return [
        { id: "dhlx", name: "DHL Express", base: 28, emoji: "✈️" },
        { id: "fedexi", name: "FedEx International", base: 32, emoji: "✈️" },
        { id: "upsw", name: "UPS Worldwide", base: 30, emoji: "🚚" },
      ];
  }
}

function shippingPrice(base: number, totalQty: number) {
  const extra = Math.min(3 * Math.max(0, totalQty - 1), 15);
  return +(base + 30 + extra).toFixed(2);
}

function CheckoutPage() {
  const navigate = useNavigate();
  const { items, subtotal } = useCart();
  const totalQty = items.reduce((n, it) => n + it.qty, 0);

  const [form, setForm] = useState<Form>({
    firstName: "", lastName: "",
    email: "", phone: `+${DEFAULT_COUNTRY.dialCode} `,
    address1: "", address2: "",
    city: "", state: "", postcode: "",
    country: DEFAULT_COUNTRY.name, countryCode: DEFAULT_COUNTRY.code,
    notes: "",
    shippingCourier: "", shippingCost: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [zipLoading, setZipLoading] = useState(false);
  const lastZipKey = useRef("");

  // Email suggestions
  const [emailFocus, setEmailFocus] = useState(false);
  const emailSuggestions = useMemo(() => {
    const v = form.email;
    if (!v || !emailFocus) return [];
    const atIdx = v.indexOf("@");
    const local = atIdx === -1 ? v : v.slice(0, atIdx);
    if (!local) return [];
    const typedDomain = atIdx === -1 ? "" : v.slice(atIdx + 1).toLowerCase();
    return EMAIL_DOMAINS
      .filter((d) => !typedDomain || d.startsWith(typedDomain))
      .filter((d) => d !== typedDomain)
      .map((d) => `${local}@${d}`);
  }, [form.email, emailFocus]);

  // Address suggestions via Nominatim
  const [addrFocus, setAddrFocus] = useState(false);
  const [addrSuggest, setAddrSuggest] = useState<any[]>([]);
  const addrAbort = useRef<AbortController | null>(null);
  useEffect(() => {
    const q = form.address1.trim();
    if (q.length < 4) { setAddrSuggest([]); return; }
    const handle = setTimeout(async () => {
      addrAbort.current?.abort();
      const ac = new AbortController();
      addrAbort.current = ac;
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&q=${encodeURIComponent(q)}`;
        const r = await fetch(url, { signal: ac.signal, headers: { "Accept": "application/json" } });
        if (!r.ok) return;
        const j = await r.json();
        setAddrSuggest(Array.isArray(j) ? j : []);
      } catch {/* ignore */}
    }, 500);
    return () => clearTimeout(handle);
  }, [form.address1]);

  const country: Country = useMemo(
    () => COUNTRIES.find((c) => c.code === form.countryCode) || DEFAULT_COUNTRY,
    [form.countryCode],
  );

  const couriers = useMemo(() => couriersFor(form.countryCode), [form.countryCode]);
  // Reset courier when country changes
  useEffect(() => {
    setForm((f) => ({ ...f, shippingCourier: "", shippingCost: 0 }));
  }, [form.countryCode]);

  const upd = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value } as Form));

  const onCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const c = COUNTRIES.find((x) => x.code === e.target.value) || DEFAULT_COUNTRY;
    setForm((f) => {
      const stripped = (f.phone || "").replace(/^\s*\+\d+\s*/, "").trim();
      return {
        ...f,
        country: c.name,
        countryCode: c.code,
        phone: `+${c.dialCode}${stripped ? " " + stripped : " "}`,
        city: "", state: "",
      };
    });
    lastZipKey.current = "";
  };

  // Postcode -> city/state
  useEffect(() => {
    const zip = form.postcode.trim();
    if (!country.zipApi || zip.length < 3) return;
    const key = `${country.zipApi}:${zip}`;
    if (key === lastZipKey.current) return;
    const handle = setTimeout(async () => {
      lastZipKey.current = key;
      setZipLoading(true);
      try {
        const r = await fetch(`https://api.zippopotam.us/${country.zipApi}/${encodeURIComponent(zip)}`);
        if (!r.ok) return;
        const j = await r.json();
        const place = j?.places?.[0];
        if (place) {
          const city = place["place name"] || "";
          const state = place["state"] || place["state abbreviation"] || "";
          setForm((f) => ({ ...f, city: city || f.city, state: state || f.state }));
        }
      } catch {/* ignore */}
      finally { setZipLoading(false); }
    }, 450);
    return () => clearTimeout(handle);
  }, [form.postcode, country.zipApi]);

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

  const pickAddress = (item: any) => {
    const a = item.address || {};
    const houseNo = a.house_number || "";
    const road = a.road || a.pedestrian || a.cycleway || "";
    const line1 = [houseNo, road].filter(Boolean).join(" ") || item.display_name?.split(",")[0] || form.address1;
    const cityVal = a.city || a.town || a.village || a.hamlet || a.suburb || "";
    const stateVal = a.state || a.region || a.county || "";
    const postcodeVal = a.postcode || "";
    const ccode = (a.country_code || "").toUpperCase();
    const matched = COUNTRIES.find((c) => c.code === ccode);
    setForm((f) => ({
      ...f,
      address1: line1,
      city: cityVal || f.city,
      state: stateVal || f.state,
      postcode: postcodeVal || f.postcode,
      country: matched?.name || f.country,
      countryCode: matched?.code || f.countryCode,
    }));
    setAddrSuggest([]);
    setAddrFocus(false);
  };

  const pickCourier = (c: Courier) => {
    const price = shippingPrice(c.base, totalQty);
    setForm((f) => ({ ...f, shippingCourier: c.id, shippingCost: price }));
    setErrors((e) => ({ ...e, shippingCourier: undefined }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) {
      const errs: Partial<Record<keyof Form, string>> = {};
      r.error.issues.forEach((i) => { errs[i.path[0] as keyof Form] = i.message; });
      setErrors(errs);
      // Scroll to first error
      setTimeout(() => {
        document.querySelector("[data-error='true']")?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 50);
      return;
    }
    const selectedCourier = couriers.find((c) => c.id === r.data.shippingCourier);
    localStorage.setItem("checkout_v1", JSON.stringify({
      ...r.data,
      shippingCourierName: selectedCourier?.name || "",
    }));
    navigate({ to: "/checkout/payment" });
  };

  const fieldInput = (k: keyof Form, label: string, type = "text", required = true) => (
    <div data-error={errors[k] ? "true" : "false"}>
      <label className="block text-sm font-medium mb-1">{label}{required && <span className="text-[#d9534f]"> *</span>}</label>
      <input
        type={type}
        value={(form[k] as string) || ""}
        onChange={upd(k)}
        className="w-full border border-[#222] rounded px-3 py-2 text-sm"
      />
      {errors[k] && <p className="text-xs text-[#d9534f] mt-1">{errors[k]}</p>}
    </div>
  );

  const shippingTotal = subtotal + (form.shippingCost || 0);

  return (
    <EtsyShell back={{ to: "/cart", label: "Back to cart" }}>
      <h1 className="text-2xl font-semibold mb-6" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Shipping & contact details</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={onSubmit} className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fieldInput("firstName", "First name")}
            {fieldInput("lastName", "Last name")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative" data-error={errors.email ? "true" : "false"}>
              <label className="block text-sm font-medium mb-1">Email <span className="text-[#d9534f]">*</span></label>
              <input
                type="email"
                value={form.email}
                onChange={upd("email")}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setTimeout(() => setEmailFocus(false), 150)}
                className="w-full border border-[#222] rounded px-3 py-2 text-sm"
                autoComplete="off"
              />
              {emailSuggestions.length > 0 && (
                <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#222] rounded shadow-lg max-h-60 overflow-auto">
                  {emailSuggestions.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onMouseDown={(e) => { e.preventDefault(); setForm((f) => ({ ...f, email: s })); setEmailFocus(false); }}
                        className="block w-full text-left px-3 py-2 text-sm hover:bg-[#f3f3f3]"
                      >{s}</button>
                    </li>
                  ))}
                </ul>
              )}
              {errors.email && <p className="text-xs text-[#d9534f] mt-1">{errors.email}</p>}
            </div>
            <div data-error={errors.phone ? "true" : "false"}>
              <label className="block text-sm font-medium mb-1">Phone <span className="text-[#d9534f]">*</span></label>
              <input
                type="tel"
                value={form.phone}
                onChange={upd("phone")}
                placeholder={`+${country.dialCode} ...`}
                className="w-full border border-[#222] rounded px-3 py-2 text-sm font-mono"
              />
              {errors.phone && <p className="text-xs text-[#d9534f] mt-1">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Country <span className="text-[#d9534f]">*</span></label>
            <select
              value={form.countryCode}
              onChange={onCountryChange}
              className="w-full border border-[#222] rounded px-3 py-2 text-sm bg-white"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name} (+{c.dialCode})</option>
              ))}
            </select>
          </div>

          <div className="relative" data-error={errors.address1 ? "true" : "false"}>
            <label className="block text-sm font-medium mb-1">Address line 1 <span className="text-[#d9534f]">*</span></label>
            <input
              type="text"
              value={form.address1}
              onChange={upd("address1")}
              onFocus={() => setAddrFocus(true)}
              onBlur={() => setTimeout(() => setAddrFocus(false), 200)}
              placeholder="Start typing your address..."
              className="w-full border border-[#222] rounded px-3 py-2 text-sm"
              autoComplete="off"
            />
            {addrFocus && addrSuggest.length > 0 && (
              <ul className="absolute z-20 left-0 right-0 mt-1 bg-white border border-[#222] rounded shadow-lg max-h-72 overflow-auto">
                {addrSuggest.map((s) => (
                  <li key={s.place_id}>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); pickAddress(s); }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-[#f3f3f3]"
                    >{s.display_name}</button>
                  </li>
                ))}
              </ul>
            )}
            {errors.address1 && <p className="text-xs text-[#d9534f] mt-1">{errors.address1}</p>}
          </div>

          {fieldInput("address2", "Address line 2 (optional)", "text", false)}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div data-error={errors.postcode ? "true" : "false"}>
              <label className="block text-sm font-medium mb-1">Postcode / ZIP <span className="text-[#d9534f]">*</span></label>
              <input
                type="text"
                value={form.postcode}
                onChange={upd("postcode")}
                className="w-full border border-[#222] rounded px-3 py-2 text-sm"
              />
              {zipLoading && <p className="text-xs text-[#5e5e5e] mt-1">Looking up…</p>}
              {errors.postcode && <p className="text-xs text-[#d9534f] mt-1">{errors.postcode}</p>}
            </div>
            {fieldInput("city", "City")}
            {fieldInput("state", "State / Region")}
          </div>

          {/* Shipping method */}
          <div className="border-t border-[#e1e3df] pt-5" data-error={errors.shippingCourier ? "true" : "false"}>
            <h2 className="font-semibold mb-1">Shipping method <span className="text-[#d9534f]">*</span></h2>
            <p className="text-xs text-[#5e5e5e] mb-3">Choose a courier for delivery to {country.name}.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {couriers.map((c) => {
                const price = shippingPrice(c.base, totalQty);
                const selected = form.shippingCourier === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => pickCourier(c)}
                    className={`flex items-center justify-between gap-3 border rounded p-3 text-left ${selected ? "border-[#222] bg-[#fafafa] ring-2 ring-[#222]" : "border-[#e1e3df] hover:border-[#222]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden>{c.emoji}</span>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-[#5e5e5e]">3-7 business days</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">USD {price.toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
            {errors.shippingCourier && <p className="text-xs text-[#d9534f] mt-2">{errors.shippingCourier}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Order notes (optional)</label>
            <textarea
              value={form.notes || ""}
              onChange={upd("notes")}
              rows={3}
              className="w-full border border-[#222] rounded px-3 py-2 text-sm"
            />
          </div>
          <button type="submit" className="w-full bg-[#222] text-white font-semibold py-3 rounded-full hover:bg-black">
            Continue to payment
          </button>
        </form>

        <aside className="border border-[#e1e3df] rounded p-5 h-fit">
          <h2 className="font-semibold mb-3">Your order</h2>
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
              <span>Shipping</span>
              <span>{form.shippingCost > 0 ? `USD ${form.shippingCost.toFixed(2)}` : "—"}</span>
            </div>
            <div className="flex justify-between font-semibold text-base pt-2 border-t border-[#e1e3df]">
              <span>Total</span><span>USD {shippingTotal.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </EtsyShell>
  );
}
