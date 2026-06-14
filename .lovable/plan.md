# Plan

## 1. Replace broken static listing pages
- Use the React `/` route for the product grid, search, and pagination so the listing never depends on brittle `home.html` / `page-2.html` snapshots.
- Keep `public/home.html` and `public/page-2.html` only as tiny redirects to `/` and `/?page=2` for old links.

## 2. Hide Etsy UI bits via `public/lovable-overlay.js`
Inject a small CSS block + run a DOM sweep on both `home.html` and `page-2.html`:
- **Search bar text** — clear the value of `input#global-enhancements-search-query` (and any `input[name="q"]`) on load, and set its `placeholder` to empty.
- **Price filter** — hide the price refinement (`#search-filter-price`, plus the "Price (USD)" facet card in the left rail and the price chip in the active filters row).
- **Profile / user icon** — hide the signed-out user menu (`[data-selector="sign-in-button"]`, `a[href*="signin"]`, `.signin-header-action`).
- **Hamburger / categories (3 lines)** — hide the categories menu button (`button[aria-label*="categor" i]`, `.global-nav-categories-button`, `#gnav-header-inner__categories-trigger`).

All done via CSS `display:none !important` for resilience, plus a JS pass that removes the search input's value/placeholder.

## 3. Buy it now → go straight to checkout
In `src/routes/product.$id.tsx`, change the "Buy it now" button to:
- add the item to cart, then `navigate({ to: "/checkout" })` (currently it goes to `/cart`).

## 4. Smarter checkout form (`src/routes/checkout.tsx`)
Replace the country/phone/postcode fields with a richer flow:
- **Country**: native `<select>` populated from a bundled list (`src/data/countries.ts`) — `{ code, name, dialCode, currency }` for ~240 countries.
- **Phone**: when country changes, prefix the phone field with `+<dialCode>` (e.g. `+44 `). The user types the rest. Validation accepts the prefix.
- **Postcode → city/state autocomplete**: when both country and postcode are filled (debounced ~400 ms), call `https://api.zippopotam.us/<countryCode>/<postcode>` (free, no key, CORS-enabled). On success, auto-fill `city` and `state` if empty. Silent failure if the country isn't covered — user can still type manually.
- **Address line 1 typeahead**: lightweight client-only suggestion that takes what the user typed and appends `, <city>, <state> <postcode>, <country>` as a single "use this address" chip below the field (no third-party Places API required, keeps it free and offline). User clicks the chip to accept.
- On submit (unchanged): persist to `localStorage` and `navigate({ to: "/checkout/payment" })` — already the BTC crypto page with live rate + proof upload.

## 5. Fix product page hydration warning
`reviews[].date` is computed from `Date.now()`, which differs between SSR and client → React hydration mismatch. Move review generation into `useEffect` + state (render an empty placeholder on the server) so the dates are client-only.

## Technical notes
- No new dependencies; countries list is a static TS file.
- Zippopotam is best-effort; failures are swallowed.
- No changes to the original Etsy HTML files — all UI removal is purely overlay CSS/JS.
- No backend / Cloud changes.

## Files touched
- `public/lovable-overlay.js` — add CSS injection + element hiding + search clearing
- `src/routes/page-2.tsx` — delete
- `src/routes/product.$id.tsx` — Buy-it-now navigates to /checkout; reviews moved to `useEffect`
- `src/routes/checkout.tsx` — country dropdown, dial-code phone, zip autocomplete, address chip
- `src/data/countries.ts` — new bundled country/dial-code list
