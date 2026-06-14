import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { productById, products } from "@/data/products";
import { addToCart } from "@/lib/cart";
import { EtsyShell } from "@/components/EtsyShell";
import { Star, Truck, ShieldCheck, Heart } from "lucide-react";

export const Route = createFileRoute("/product/$id")({
  component: ProductPage,
});

function seeded(id: string, n: number) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return Array.from({ length: n }, (_, i) => {
    h = (h * 1103515245 + 12345) >>> 0;
    return h;
  });
}

const REVIEW_AUTHORS = ["Amelia W.", "James K.", "Sofia R.", "Marco L.", "Hiroshi T.", "Eva P.", "Lukas B.", "Noor S.", "Daniel O.", "Chloé M."];
const REVIEW_BODIES = [
  "Beautiful piece, exactly as described. Shipped quickly and packed with care.",
  "Even better in person. The colour and patina are stunning — really pleased.",
  "Lovely vintage character. Will absolutely buy from this seller again.",
  "Arrived safely, well wrapped. A gorgeous addition to my collection.",
  "Great quality and fast delivery. Communication was excellent throughout.",
  "Stunning piece! Looks fantastic on our dining table. Highly recommend.",
  "Exceeded expectations. The craftsmanship is superb.",
  "Perfect — exactly what I was looking for. Thank you!",
];

function ProductPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const product = productById.get(id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [reviews, setReviews] = useState<Array<{ author: string; body: string; stars: number; date: string }>>([]);

  useEffect(() => {
    if (!product) return;
    const seeds = seeded(product.id, 6);
    setReviews(seeds.map((s) => ({
      author: REVIEW_AUTHORS[s % REVIEW_AUTHORS.length],
      body: REVIEW_BODIES[(s >> 4) % REVIEW_BODIES.length],
      stars: 4 + ((s >> 8) % 2),
      date: new Date(Date.now() - ((s % 240) + 5) * 86400000).toLocaleDateString(),
    })));
  }, [product]);

  const related = useMemo(() => products.filter((p) => p.id !== id).slice(0, 4), [id]);

  if (!product) {
    return (
      <EtsyShell back={{ to: "/", label: "Back to shop" }}>
        <div className="text-center py-20">
          <h1 className="text-2xl font-semibold mb-2">Product not found</h1>
          <p className="text-[#5e5e5e]">This listing may have been removed.</p>
        </div>
      </EtsyShell>
    );
  }

  const desc = `${product.title}

A beautifully preserved vintage piece, carefully selected for its character and condition. Each item in this collection is unique — minor patina, colour variation, and small imperfections are part of the charm of authentic vintage glass and wares.

Details
• Sourced and inspected by ${product.shop || "our trusted seller"}
• Cleaned and ready to display or use
• Carefully packed for safe international shipping
• Ships within 2–5 business days

Care
Hand wash with mild soap and warm water. Avoid sudden temperature changes. Display out of direct sunlight to preserve colour.

If you have any questions about this piece — dimensions, additional photos, or shipping — just message us before purchase. We're happy to help.`;

  return (
    <EtsyShell back={{ to: "/", label: "Back to results" }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="aspect-square w-full bg-[#f3f3f3] overflow-hidden rounded">
            {product.image ? (
              <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
            ) : null}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[#a05c00] font-semibold mb-1">Bestseller</p>
          <h1 className="text-2xl font-semibold leading-snug mb-2" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            {product.title}
          </h1>
          <p className="text-sm text-[#5e5e5e] mb-3">
            {product.shop ? `Sold by ${product.shop}` : "Sold by an Etsy Seller"}
          </p>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= Math.round(product.rating) ? "fill-[#222] text-[#222]" : "text-[#aaa]"}`} />
              ))}
            </div>
            <span className="text-sm text-[#5e5e5e]">
              {product.rating.toFixed(1)} ({product.reviews.toLocaleString()} reviews)
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">
            {product.currency} {product.price}
          </div>
          <p className="text-xs text-[#5e5e5e] mb-6">Local taxes included (where applicable)</p>

          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium">Quantity</label>
            <select
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value, 10))}
              className="border border-[#222] rounded px-3 py-2 text-sm"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => {
              addToCart(product.id, qty);
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
            className="w-full bg-[#222] text-white font-semibold py-3 rounded-full hover:bg-black transition mb-3"
          >
            {added ? "Added to cart ✓" : "Add to cart"}
          </button>
          <button
            onClick={() => {
              addToCart(product.id, qty);
              navigate({ to: "/checkout" });
            }}
            className="block w-full text-center bg-white text-[#222] border-2 border-[#222] font-semibold py-3 rounded-full hover:bg-[#f3f3f3] transition mb-6"
          >
            Buy it now
          </button>

          <div className="flex items-center gap-2 text-sm text-[#5e5e5e] mb-2">
            <Truck className="w-4 h-4" /> Worldwide shipping. Delivery in 5–14 business days.
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5e5e5e] mb-2">
            <ShieldCheck className="w-4 h-4" /> Buyer protection on every order.
          </div>
          <div className="flex items-center gap-2 text-sm text-[#5e5e5e]">
            <Heart className="w-4 h-4" /> {(product.reviews * 3).toLocaleString()} people have this in their favourites.
          </div>
        </div>
      </div>

      <section className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-lg font-semibold mb-3" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>Description</h2>
          <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-[#222]">{desc}</pre>
        </div>
        <aside className="border border-[#e1e3df] rounded p-4 h-fit">
          <h3 className="font-semibold mb-2">Highlights</h3>
          <ul className="text-sm text-[#5e5e5e] space-y-1">
            <li>• Authentic vintage</li>
            <li>• Carefully inspected</li>
            <li>• Ships in protective packaging</li>
            <li>• Bitcoin payment accepted</li>
          </ul>
        </aside>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
          Reviews ({product.reviews.toLocaleString()})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((r, i) => (
            <div key={i} className="border-b border-[#e1e3df] pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className={`w-3.5 h-3.5 ${s <= r.stars ? "fill-[#222] text-[#222]" : "text-[#ccc]"}`} />
                  ))}
                </div>
                <span className="text-xs text-[#5e5e5e]">{r.date}</span>
              </div>
              <p className="text-sm text-[#222] mb-1">{r.body}</p>
              <p className="text-xs text-[#5e5e5e]">— {r.author}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-lg font-semibold mb-4" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>You may also like</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {related.map((p) => (
            <Link to="/product/$id" params={{ id: p.id }} key={p.id} className="group">
              <div className="aspect-square bg-[#f3f3f3] overflow-hidden rounded mb-2">
                {p.image && <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition" />}
              </div>
              <p className="text-xs text-[#222] line-clamp-2">{p.title}</p>
              <p className="text-sm font-semibold mt-1">{p.currency} {p.price}</p>
            </Link>
          ))}
        </div>
      </section>
    </EtsyShell>
  );
}
