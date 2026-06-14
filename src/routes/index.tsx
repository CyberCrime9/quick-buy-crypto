import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Search, Star } from "lucide-react";
import { products } from "@/data/products";
import { useCart } from "@/lib/cart";
import { PAYMENT_CONFIG } from "@/config/payment";

const DESKTOP_PAGE_SIZE = 24;
const MOBILE_PAGE_SIZE = 14;

function usePageSize() {
  const [size, setSize] = useState(DESKTOP_PAGE_SIZE);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setSize(mq.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return size;
}

export const Route = createFileRoute("/")({
  validateSearch: (search) => ({
    page: Math.max(1, Number(search.page) || 1),
    q: typeof search.q === "string" ? search.q : "",
  }),
  head: () => ({
    meta: [
      { title: "Vintage Wine Bottles — Etsy" },
      { name: "description", content: "Used wine bottles, demijohns, and vintage glassware." },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate({ from: "/" });
  const { count } = useCart();
  const { page, q } = Route.useSearch();
  const [query, setQuery] = useState(q);
  const pageSize = usePageSize();

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return products;
    return products.filter((product) =>
      [product.title, product.shop, product.currency].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  }, [q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageProducts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({ search: { q: query.trim(), page: 1 } });
  };

  return (
    <div className="min-h-screen bg-transparent text-[#222]" style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
      <header className="border-b border-[#e1e3df] bg-white/85 backdrop-blur sticky top-0 z-30">

        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-3 px-4">
          <Link to="/" search={{ q: "", page: 1 }} className="shrink-0 text-[34px] font-bold leading-none" style={{ color: "#F1641E", fontFamily: 'Georgia, "Times New Roman", serif' }}>
            Etsy
          </Link>
          <form onSubmit={onSearch} className="relative flex-1">
            <input
              aria-label="Search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="h-11 w-full rounded-full border-2 border-[#222] bg-white pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-[#222]/20"
            />
            <button type="submit" aria-label="Search" className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-full bg-[#F1641E] text-white">
              <Search className="h-5 w-5" />
            </button>
          </form>
          <Link to="/cart" aria-label="Cart" className="relative grid h-11 w-11 shrink-0 place-items-center text-[#2f2936]">
            <span className="h-6 w-6 rounded-b-md border-[5px] border-t-0 border-current" />
            <span className="absolute top-2 h-4 w-4 rounded-t-full border-[4px] border-b-0 border-current" />
            {count > 0 && <span className="absolute right-0 top-1 rounded-full bg-[#d9534f] px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">{count}</span>}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-4 py-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-semibold leading-tight" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
              Vintage wine bottles
            </h1>
            <p className="mt-1 text-sm text-[#5e5e5e]">{filtered.length.toLocaleString()} items</p>
          </div>
          <p className="hidden text-sm text-[#5e5e5e] sm:block">Page {currentPage} of {totalPages}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {pageProducts.map((product) => (
            <Link key={product.id} to="/product/$id" params={{ id: product.id }} className="group block min-w-0">
              <div className="aspect-[4/3] overflow-hidden rounded bg-[#f3f3f3]">
                {product.image && <img src={product.image} alt={product.title} loading="lazy" className="h-full w-full object-cover transition duration-200 group-hover:scale-105" />}
              </div>
              <p className="mt-2 line-clamp-2 text-sm leading-snug text-[#222] group-hover:underline">{product.title}</p>
              <div className="mt-1 flex items-center gap-1 text-xs text-[#222]">
                <span>{product.rating.toFixed(1)}</span>
                <Star className="h-3.5 w-3.5 fill-[#222] text-[#222]" />
                <span className="text-[#5e5e5e]">({product.reviews.toLocaleString()})</span>
              </div>
              <p className="mt-1 text-base font-semibold">{product.currency} {product.price}</p>
              <p className="mt-0.5 truncate text-xs text-[#5e5e5e]">{product.shop || "Etsy Seller"}</p>
            </Link>
          ))}
        </div>

        {pageProducts.length === 0 && (
          <div className="py-20 text-center">
            <h2 className="text-xl font-semibold">No items found</h2>
            <p className="mt-2 text-sm text-[#5e5e5e]">Try another search.</p>
          </div>
        )}

        <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
          {currentPage > 1 ? (
            <Link to="/" search={{ q, page: currentPage - 1 }} className="rounded-full border border-[#222] px-5 py-2 text-sm font-semibold hover:bg-[#f3f3f3]">
              Previous
            </Link>
          ) : (
            <span className="rounded-full border border-[#e1e3df] px-5 py-2 text-sm font-semibold text-[#9a9a9a]">Previous</span>
          )}
          <span className="text-sm text-[#5e5e5e]">{currentPage} / {totalPages}</span>
          {currentPage < totalPages ? (
            <Link to="/" search={{ q, page: currentPage + 1 }} className="rounded-full bg-[#222] px-5 py-2 text-sm font-semibold text-white hover:bg-black">
              Next
            </Link>
          ) : (
            <span className="rounded-full bg-[#e1e3df] px-5 py-2 text-sm font-semibold text-[#777]">Next</span>
          )}
        </nav>
      </main>

      <footer className="mt-12 border-t border-[#e1e3df] px-4 py-6 text-center text-xs text-[#5e5e5e]">
        © {new Date().getFullYear()} {PAYMENT_CONFIG.shopName}
      </footer>
    </div>
  );
}
