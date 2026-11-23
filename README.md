# Aura & Grace

Bilingual (English / Spanish) affiliate discovery site and product catalog.

## Current architecture

- Cloudflare Worker serves the public static site and the private CMS interface.
- GitHub repository `leitocuba/aura-and-grace`, branch `main`, stores the website and catalog.
- `products.json` is the single catalog source. The public page reads `products` from this file.
- Decap CMS at `/admin/` provides a visual editor for the catalog.
- `worker.js` handles the GitHub OAuth handshake. GitHub credentials are Cloudflare Worker secrets and are never placed in browser code.

## Product catalog

Initial order and reference prices:
1. AG-001 — Reclining armchair / Sillón — $223.60
2. AG-002 — Arched LED mirror / Espejo LED arqueado, 16 × 60 in — $50.47
3. AG-003 — Black jacket / Chaqueta negra, size L — $15.60

These prices were supplied as reference values and may change at the seller. Confirm current price and stock before promoting.

## Cloudflare deployment

The current Cloudflare project is a **Worker with Static Assets**, not Pages. This matches the successful deployment already made at the `workers.dev` address.

Build/deploy command in Cloudflare:
- Deploy command: `npx wrangler deploy`
- Build command: leave empty
- Root directory: repository root

`wrangler.jsonc` defines `worker.js` as the Worker entry point and serves the repository root as static assets. `.assetsignore` prevents Worker source/configuration files from being published as public files.

Do not change the deployment to Pages or change the build command without updating this architecture intentionally.

## One-time GitHub OAuth setup (required before CMS login works)

The admin page and Decap configuration are in the repository, but login will not work until the OAuth application and Cloudflare secrets below are configured.

### 1. Create a GitHub OAuth App

While signed in to the GitHub account that owns or can push to `leitocuba/aura-and-grace`:

1. Open GitHub **Settings → Developer settings → OAuth Apps → New OAuth App**.
2. Application name: `Aura & Grace Admin`.
3. Homepage URL: `https://aura-and-grace.1989frank20.workers.dev`.
4. Authorization callback URL: `https://aura-and-grace.1989frank20.workers.dev/callback`.
5. Register the application and keep its Client ID and Client Secret private.

### 2. Add secrets to the existing Cloudflare Worker

In Cloudflare Dashboard, open **Workers & Pages → aura-and-grace → Settings → Variables and Secrets**. Add these as **Secrets**, not plain-text variables:

- `GITHUB_OAUTH_ID` — GitHub OAuth App Client ID.
- `GITHUB_OAUTH_SECRET` — GitHub OAuth App Client Secret.
- `OAUTH_STATE_SECRET` — a new, long, random secret (at least 32 random bytes).

Do not paste any of these secrets into GitHub files, the CMS config, browser code, or this chat.

The repository is public, so `GITHUB_REPO_PRIVATE` is not needed; the Worker defaults to the public-repository `public_repo,user` scope. The signed, expiring OAuth state is verified by the Worker before exchanging the authorization code.

After adding all three secrets, redeploy the Worker (a new GitHub commit will trigger the connected deployment; alternatively use the Cloudflare redeploy action).

### 3. Open the admin panel

Visit:

`https://aura-and-grace.1989frank20.workers.dev/admin/`

Choose GitHub login and authorize the account that has push access to the repository.

## Using the admin panel

The CMS edits `products.json` directly:

- **Add:** use “Añadir producto” in the product list.
- **Edit:** open a product and change its bilingual name/description, price, photo, category, affiliate URL, or order.
- **Hide:** switch off “Visible en la web”. The product remains saved but is not displayed publicly.
- **Publish:** save/publish the catalog entry. Decap commits the updated file to `main`; Cloudflare deploys the commit and the public catalog reads the new data.
- **Delete:** remove the product from the list and save. This is permanent for the catalog file; hiding is safer when unsure.

Use a unique product ID (AG-004, AG-005, etc.) and a distinct order number. Check both English and Spanish fields before publishing. Confirm affiliate URLs and prices before publication.

Uploaded images are stored in `assets/uploads/` in this repository and served publicly as product images.

## Social links

The page currently displays Instagram, TikTok and Facebook as “Coming soon” labels, not links. They will become clickable only after the exact profile URLs are supplied and verified. This prevents placeholder links from jumping to the top of the page.

## Security and launch checklist

Do not consider the CMS ready until all of these have been tested:
- GitHub OAuth login succeeds and rejects an invalid/expired state.
- A product can be added, edited, hidden, reordered and deleted.
- An image can be uploaded and displayed by the public catalog.
- A save creates a commit on `main` and the connected Cloudflare deployment completes.
- The public page works in English and Spanish on mobile and desktop.

Never share GitHub passwords, OAuth Client Secrets, or Cloudflare API tokens.
