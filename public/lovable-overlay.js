/* Lovable overlay: hides Etsy chrome and wires static pages into the React app. */
(function () {
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function injectHideCSS() {
    if (document.getElementById('lov-hide-css')) return;
    var css = document.createElement('style');
    css.id = 'lov-hide-css';
    css.textContent = [
      /* Left filter funnel icon / "Filters" button */
      'button[data-clg-id="WtButton"][aria-label*="ilter" i],',
      'button[aria-label*="ilter" i], a[aria-label*="ilter" i],',
      '[data-search-filters-trigger], [data-ui="filters-trigger"],',
      '.filter-button, .search-filters-trigger,',
      '#search-filters-trigger, #search-filter-toggle',
      '{ display:none !important; }',

      /* Applied filter chips row (USD 100–500, Physical items, etc.) */
      '[data-top-filters], [data-active-filters],',
      '#search-filter-active-area,',
      '[data-selector="search-applied-filters"],',
      '[data-ui="active-filters"],',
      '.search-applied-filters,',
      'div[class*="applied-filter" i],',
      'ul[class*="applied-filter" i],',
      'li[data-applied-filter-name],',
      'button[data-applied-filter]',
      '{ display:none !important; }',

      /* Price filter (left rail) */
      '#search-filter-price,',
      '[data-search-filter="price"],',
      '[data-ui="price-filter"],',
      'fieldset[data-search-filter-name="price"],',
      'div[id*="price-filter" i], div[class*="price-filter" i]',
      '{ display:none !important; }',

      /* Results count line ("67 results, with ads") */
      '[data-result-info],',
      '[data-search-results-count],',
      '[data-ui="results-count"],',
      'h1[class*="results" i],',
      'div[class*="results-count" i],',
      'span[class*="results-count" i]',
      '{ display:none !important; }',

      /* Etsy's Pick / Bestseller / Star Seller / Popular now badges */
      '[data-listing-card-text-badge],',
      '.listing-card-text-badge,',
      '[data-ui="listing-badge"],',
      '[data-clg-id="WtBadge"],',
      '.wt-badge, span.wt-badge,',
      '[data-listing-badges], [data-ui="listing-badges"]',
      '{ display:none !important; }',

      /* "Send from NGN", "Ships from X", "Ad by", "Free shipping" lines */
      '[data-shop-shipping-callout],',
      '[data-ui="shipping-callout"],',
      '[data-listing-card-shipping],',
      '[data-listing-card-promotion],',
      'p[class*="ship-from" i], span[class*="ship-from" i],',
      'p[class*="shipping-from" i], span[class*="shipping-from" i],',
      'p[class*="ad-by" i], span[class*="ad-by" i],',
      'p[class*="ads-by" i],',
      '[data-clg-id="WtTextBody"][data-ad-disclosure],',
      '[data-ui="ad-disclosure"]',
      '{ display:none !important; }',

      /* Profile / sign in / account icon */
      'a[data-header-nav-link="signin"],',
      '[data-selector="sign-in-button"],',
      'a[href*="/signin"], a[href*="/register"],',
      '.signin-header-action,',
      '#gnav-header-inner__sign-in,',
      'button[aria-label*="sign in" i],',
      'button[aria-label*="account" i],',
      'a[aria-label*="account" i],',
      'a[aria-label*="your account" i]',
      '{ display:none !important; }',

      /* Hamburger / categories button (3 lines, top-left) */
      'button[data-js-merch-stash-check-listing],',
      'button[aria-label*="categor" i],',
      'a[aria-label*="categor" i],',
      '.global-nav-categories-button,',
      '#gnav-header-inner__categories-trigger,',
      '[data-selector="categories-menu-button"],',
      '[data-ui="categories-trigger"],',
      'button[aria-label*="menu" i]',
      '{ display:none !important; }',

      /* Etsy footer / promo banners / sign-up modules / related searches */
      '#global-footer, footer#footer, footer.site-footer,',
      '[data-ui="related-searches"],',
      '[data-ui="gift-ideas-bottom"],',
      '[data-ui="narrow-by-theme"],',
      '[data-component-island-template*="GiftIdeas" i],',
      '[data-component-island-template*="RelatedQuery" i]',
      '{ display:none !important; }'
    ].join('\n');
    document.head.appendChild(css);
  }

  function clearSearchBar() {
    $$('input[name="q"], input#global-enhancements-search-query, input[type="search"]').forEach(function (i) {
      try { i.value = ''; i.setAttribute('placeholder', ''); i.removeAttribute('value'); } catch (e) {}
    });
    // Hide the small "x" clear button if the field is empty
    $$('button[aria-label*="clear" i]').forEach(function (b) {
      try { b.style.display = 'none'; } catch (e) {}
    });
  }

  function hideElement(el) {
    if (!el || el === document.body || el === document.documentElement) return;
    try { el.style.setProperty('display', 'none', 'important'); } catch (e) {}
  }

  function removeRequestedChrome() {
    var exact = /^(Menu|Sign in|Filters?|Physical items?|Etsy['’]s Picks?|Sent from NG|Send from NGN|Clear search|Learn more)$/i;
    var resultCount = /^\d+\s+results\b/i;
    $$('button, a, span, p, div').forEach(function (el) {
      var text = (el.textContent || '').replace(/\s+/g, ' ').trim();
      if (!text) return;
      if (exact.test(text) || resultCount.test(text)) hideElement(el);
    });
    $$('button').forEach(function (button) {
      var rect = button.getBoundingClientRect && button.getBoundingClientRect();
      var label = (button.getAttribute('aria-label') || button.textContent || '').trim();
      if (rect && rect.top < 130 && rect.left < 72 && (/menu|filter/i.test(label) || !label)) hideElement(button);
    });
  }

  function removeBadgeText() {
    // Remove visible "Etsy's Pick", "Bestseller", "Star Seller", "Ad" text inside listing cards as a fallback
    var patterns = /^(Etsy['’]s Pick|Bestseller|Star Seller|Popular now|Ad|Sponsored|Ad by Etsy seller|Free shipping)\s*$/i;
    $$('span, p, div').forEach(function (el) {
      if (!el.children.length && patterns.test((el.textContent || '').trim())) {
        el.style.display = 'none';
      }
    });
    // Remove "Send from <country>" / "Ships from <country>"
    var shipRe = /^(Send|Ships) from /i;
    $$('span, p, div').forEach(function (el) {
      if (!el.children.length && shipRe.test((el.textContent || '').trim())) {
        el.style.display = 'none';
      }
    });
  }

  function getCartCount() {
    try {
      var c = JSON.parse(localStorage.getItem('cart_v1') || '[]');
      return c.reduce(function (n, it) { return n + (it.qty || 0); }, 0);
    } catch (e) { return 0; }
  }

  function rewritePagination() {
    // Any anchor containing page=2 -> /page-2.html ; page=1 -> /home.html
    $$('a[href]').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (/[?&]page=2(\b|&)/.test(href)) {
        a.setAttribute('href', '/page-2.html');
        a.removeAttribute('target'); a.removeAttribute('rel');
        a.removeAttribute('aria-disabled'); a.removeAttribute('disabled');
        a.classList.remove('wt-is-disabled');
      } else if (/[?&]page=1(\b|&)/.test(href)) {
        a.setAttribute('href', '/home.html');
        a.removeAttribute('target'); a.removeAttribute('rel');
        a.removeAttribute('aria-disabled'); a.removeAttribute('disabled');
        a.classList.remove('wt-is-disabled');
      }
    });
    // Also enable disabled-by-default pagination items so user can navigate both ways.
    $$('a.wt-is-disabled, a[aria-disabled="true"]').forEach(function (a) {
      var path = window.location.pathname;
      var label = (a.querySelector('.wt-screen-reader-only') || {}).textContent || '';
      label = label.trim().toLowerCase();
      if (label === 'next' && path !== '/page-2.html') {
        a.setAttribute('href', '/page-2.html');
        a.classList.remove('wt-is-disabled'); a.removeAttribute('aria-disabled'); a.removeAttribute('disabled');
      } else if (label === 'previous' && path !== '/home.html') {
        a.setAttribute('href', '/home.html');
        a.classList.remove('wt-is-disabled'); a.removeAttribute('aria-disabled'); a.removeAttribute('disabled');
      }
    });
  }

  function rewriteListings() {
    $$('[data-listing-id]').forEach(function (el) {
      var id = el.getAttribute('data-listing-id');
      if (!id) return;
      var anchors = [];
      if (el.tagName === 'A') anchors.push(el);
      anchors = anchors.concat($$('a', el));
      anchors.forEach(function (a) {
        a.setAttribute('href', '/product/' + id);
        a.removeAttribute('target');
        a.removeAttribute('rel');
        a.setAttribute('data-lov-product-link', '1');
      });
    });
  }

  function rewriteHeader() {
    $$('a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (/etsy\.com\/?$/.test(href) || /etsy\.com\/(uk|en|nl|de|fr)\/?$/.test(href)) {
        a.setAttribute('href', '/home.html');
      }
      if (/\/cart(\?|$|\/)/.test(href)) {
        a.setAttribute('href', '/cart');
      }
      if (/signin|register|favorite|wishlist/i.test(href)) {
        a.setAttribute('href', 'javascript:void(0)');
        a.addEventListener('click', function (e) { e.preventDefault(); }, true);
      }
    });
  }

  function injectCartBadge() {
    var count = getCartCount();
    var cartLink = document.querySelector('a[aria-label*="art" i], a[href="/cart"]');
    if (!cartLink) return;
    cartLink.setAttribute('href', '/cart');
    var existing = cartLink.querySelector('[data-lov-cart-badge]');
    if (existing) existing.remove();
    if (count > 0) {
      var badge = document.createElement('span');
      badge.setAttribute('data-lov-cart-badge', '1');
      badge.textContent = String(count);
      badge.style.cssText = 'position:absolute;top:-2px;right:-2px;background:#d9534f;color:#fff;border-radius:999px;font-size:11px;line-height:1;padding:3px 6px;font-weight:700;';
      cartLink.style.position = 'relative';
      cartLink.appendChild(badge);
    }
  }

  function installClickDelegation() {
    if (window.__lovClickDelegationInstalled) return;
    window.__lovClickDelegationInstalled = true;
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest && e.target.closest('a[data-lov-product-link]');
      if (a) return;
      var any = e.target && e.target.closest && e.target.closest('a[href*="etsy.com"]');
      if (any) {
        var href = any.getAttribute('href') || '';
        if (/\/listing\/(\d+)/.test(href)) {
          var m = href.match(/\/listing\/(\d+)/);
          e.preventDefault();
          window.location.assign('/product/' + m[1]);
        } else if (/etsy\.com\/cart/.test(href)) {
          e.preventDefault();
          window.location.assign('/cart');
        } else {
          e.preventDefault();
        }
      }
    }, true);
  }

  function run() {
    try {
      injectHideCSS();
      clearSearchBar();
      removeRequestedChrome();
      removeBadgeText();
      rewritePagination();
      rewriteListings();
      rewriteHeader();
      injectCartBadge();
      installClickDelegation();
    } catch (e) { console.warn('overlay error', e); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
  setTimeout(run, 500);
  setTimeout(run, 1500);
  setTimeout(run, 3000);
  setTimeout(run, 6000);
  try {
    var queued = false;
    new MutationObserver(function () {
      if (queued) return;
      queued = true;
      setTimeout(function () { queued = false; run(); }, 100);
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
