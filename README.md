# Aura & Grace

A bilingual (English / Spanish), mobile-first affiliate discovery page.

## Current structure

- `index.html` — page structure and content sections
- `styles.css` — responsive editorial styling
- `app.js` — language switch and catalog rendering
- `products.json` — product data; the public catalog is driven by this file
- `assets/` — product photographs (add the three optimized images here)

## Initial catalog

The catalog order is fixed as requested:
1. AG-001 — Armchair / Sillón — $223.60
2. AG-002 — Arched LED mirror / Espejo LED arqueado, 16 × 60 in — $50.47
3. AG-003 — Black jacket / Chaqueta negra, size L — $15.60

Prices are reference values supplied by the owner and may change at the seller. Confirm them before relying on them in a campaign.

## Deploy with Cloudflare Pages

1. In Cloudflare, open **Workers & Pages** and choose **Create application → Pages → Connect to Git**.
2. Select `leitocuba/aura-and-grace` and branch `main`.
3. Framework preset: **None**.
4. Build command: leave blank.
5. Build output directory: `/` (repository root).
6. Deploy. Every commit to `main` will trigger a new deployment.

Do not use GitHub Pages for this commercial affiliate site; use Cloudflare Pages.

## Product image assets

The catalog expects these paths:
- `assets/armchair.webp`
- `assets/arched-led-mirror.webp`
- `assets/black-jacket.webp`

The source photos were supplied in the planning conversation. Upload optimized WebP copies to the exact paths above before treating the live page as complete. If an image is not present, the page displays a neutral fallback rather than a broken-image icon.

## Updating the catalog manually (temporary workflow)

Edit `products.json` in GitHub. Each product has:
- `id`, `order`, `active`, `category`
- bilingual `name` and `description`
- `price`, bilingual `priceNote`
- `image` and `affiliateUrl`

To hide a product, set `"active": false`. To change order, update `order`. To add a product, copy one object, give it a unique ID and a new order, and fill in its fields. Save the change with a commit; Cloudflare Pages will redeploy.

**Important:** this is not yet the promised visual admin dashboard. The next implementation phase is a protected CMS/admin workflow with secure authentication. Do not expose a GitHub token or password in frontend code. The CMS must not be considered ready until login, image upload, create/edit/hide/publish and production deployment have all been tested.

## Trust and disclosure

Affiliate links open in a new tab and include `rel="sponsored nofollow noopener"`. The footer includes a plain-language affiliate disclosure. Add verified social profile URLs and a real contact/privacy policy before public promotion.
