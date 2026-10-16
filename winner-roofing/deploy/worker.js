/**
 * Winner Roofing — Sales Floor dashboard, served from a Cloudflare Worker.
 *
 * build.py prepends `const FILES = {...}` (every site file, inlined) to this
 * source, so the Worker needs no storage, bindings or secrets. It serves the
 * static dashboard exactly as it sits in winner-roofing/, adds security
 * headers, and keeps the board out of search engines.
 *
 * FILES maps a request path to { type, body } (text) or { type, b64 } (binary).
 */

const BINARY = {};
function bytes(path, f) {
  if (!BINARY[path]) BINARY[path] = Uint8Array.from(atob(f.b64), (c) => c.charCodeAt(0));
  return BINARY[path];
}

function headers(type, nonce, longCache) {
  const h = {
    "Content-Type": type,
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=(), interest-cohort=()",
    "Strict-Transport-Security": "max-age=31536000",
    "X-Robots-Tag": "noindex, nofollow, noarchive",
    // the board is meant to sit on a TV for hours: let the HTML revalidate so a
    // redeploy shows up on the next reload, and cache images for a day
    "Cache-Control": longCache ? "public, max-age=86400" : "no-cache",
  };
  if (nonce) {
    h["Content-Security-Policy"] = [
      "default-src 'none'",
      `script-src 'self' 'nonce-${nonce}'`,
      // the charts set per-element style="" attributes, which need 'unsafe-inline'
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      // dataUrl may point at any https JSON feed later
      "connect-src 'self' https:",
      "base-uri 'none'",
      "form-action 'none'",
    ].join("; ");
  }
  return h;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    let path = url.pathname;
    if (path === "/" || path === "/index.html") path = "/index.html";

    if (path === "/robots.txt") {
      return new Response("User-agent: *\nDisallow: /\n", { headers: headers("text/plain; charset=utf-8") });
    }
    if (path === "/health") {
      return new Response("ok", { headers: headers("text/plain; charset=utf-8") });
    }
    if (path === "/favicon.ico") {
      return Response.redirect(new URL("/assets/favicon-64.png", url).toString(), 301);
    }

    const f = FILES[path];
    if (!f) return new Response("Not found", { status: 404, headers: headers("text/plain; charset=utf-8") });

    if (f.b64) {
      return new Response(request.method === "HEAD" ? null : bytes(path, f), { headers: headers(f.type, null, true) });
    }
    if (path === "/index.html") {
      // nonce every inline <script> so the CSP needs no 'unsafe-inline' for scripts
      const nonce = crypto.randomUUID().replace(/-/g, "");
      const body = f.body.replace(/<script>/g, `<script nonce="${nonce}">`);
      return new Response(request.method === "HEAD" ? null : body, { headers: headers(f.type, nonce) });
    }
    return new Response(request.method === "HEAD" ? null : f.body, { headers: headers(f.type) });
  },
};
