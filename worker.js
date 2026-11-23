const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function signState(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(signature));
}

async function verifyState(state, secret) {
  if (!state || !secret || !state.includes(".")) return false;
  const [payload, supplied] = state.split(".");
  if (!payload || !supplied) return false;
  const expected = await signState(payload, secret);
  const a = encoder.encode(expected);
  const b = encoder.encode(supplied);
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  if (mismatch !== 0) return false;
  try {
    const data = JSON.parse(new TextDecoder().decode(fromBase64Url(payload)));
    return data.exp > Date.now() && data.exp < Date.now() + 11 * 60 * 1000;
  } catch {
    return false;
  }
}

async function createState(secret) {
  const nonce = toBase64Url(crypto.getRandomValues(new Uint8Array(24)));
  const payload = toBase64Url(encoder.encode(JSON.stringify({ nonce, exp: Date.now() + 10 * 60 * 1000 })));
  return payload + "." + await signState(payload, secret);
}

function htmlResponse(body, status = 200) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      "referrer-policy": "no-referrer"
    }
  });
}

async function handleAuth(url, env) {
  if (url.searchParams.get("provider") !== "github") {
    return new Response("Invalid provider", { status: 400 });
  }
  if (!env.GITHUB_OAUTH_ID || !env.OAUTH_STATE_SECRET) {
    return new Response("OAuth is not configured yet.", { status: 503 });
  }
  const state = await createState(env.OAUTH_STATE_SECRET);
  const redirectUri = url.origin + "/callback";
  const scope = env.GITHUB_REPO_PRIVATE === "1" ? "repo,user" : "public_repo,user";
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_OAUTH_ID);
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", scope);
  authorize.searchParams.set("state", state);
  return Response.redirect(authorize.toString(), 302);
}

function callbackPage(origin, status, payload) {
  const message = "authorization:github:" + status + ":" + JSON.stringify(payload);
  const safeMessage = JSON.stringify(message);
  const safeOrigin = JSON.stringify(origin);
  return htmlResponse(`<!doctype html><html><head><meta charset="utf-8"><title>Admin authorization</title></head>
<body><p>Completing Aura &amp; Grace authorization…</p><script>
(() => {
  const targetOrigin = ${safeOrigin};
  const message = ${safeMessage};
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage("authorizing:github", targetOrigin);
    window.opener.postMessage(message, targetOrigin);
  }
  document.body.textContent = "Authorization response sent. You can close this window.";
})();
</script></body></html>`);
}

async function handleCallback(url, env) {
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !(await verifyState(state, env.OAUTH_STATE_SECRET))) {
    return callbackPage(url.origin, "error", { message: "Invalid or expired authorization state. Please try signing in again." });
  }
  if (!env.GITHUB_OAUTH_ID || !env.GITHUB_OAUTH_SECRET) {
    return callbackPage(url.origin, "error", { message: "GitHub OAuth credentials are not configured." });
  }
  try {
    const redirectUri = url.origin + "/callback?provider=github";
    const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "accept": "application/json", "content-type": "application/json" },
      body: JSON.stringify({
        client_id: env.GITHUB_OAUTH_ID,
        client_secret: env.GITHUB_OAUTH_SECRET,
        code,
        redirect_uri: redirectUri
      })
    });
    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenData.access_token) {
      return callbackPage(url.origin, "error", { message: "GitHub did not return an access token. Please try again." });
    }
    return callbackPage(url.origin, "success", { token: tokenData.access_token });
  } catch {
    return callbackPage(url.origin, "error", { message: "Could not complete GitHub authorization. Please try again." });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/auth") return handleAuth(url, env);
    if (url.pathname === "/callback") return handleCallback(url, env);
    return env.ASSETS.fetch(request);
  }
};
