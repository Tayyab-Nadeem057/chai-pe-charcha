// API base: localhost → local dev server, otherwise → Render production.
function getApiBase() {
  const { hostname } = window.location;
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000/api";
  }
  return "https://chai-pe-charcha-backend.onrender.com/api";
}

const API        = getApiBase();
const SITE_PHONE = "03021807669";
const SITE_WA    = "923021807669";
const SITE_CITY  = "Hyderabad";

// ── XSS-safe HTML escaping (use for ALL user/DB-controlled strings) ──
function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
window.escapeHtml = escapeHtml;

// ── Read a non-httpOnly cookie (used for the CSRF double-submit token) ──
function getCookie(name) {
  const m = document.cookie.match("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)");
  return m ? decodeURIComponent(m.pop()) : "";
}

// ── Fetch wrapper: sends cookies + CSRF header on mutating requests ──
async function apiFetch(path, options = {}) {
  const method  = (options.method || "GET").toUpperCase();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (method !== "GET" && method !== "HEAD") {
    const csrf = getCookie("csrf_access_token");
    if (csrf) headers["X-CSRF-TOKEN"] = csrf;
  }
  const res  = await fetch(API + path, { credentials: "include", ...options, headers });
  let json;
  try { json = await res.json(); } catch (_) { json = {}; }
  if (!res.ok) throw { status: res.status, message: json.message || "Request failed" };
  return json;
}
window.apiFetch = apiFetch;

// ── CART ──────────────────────────────────────────────────────
// Each line stores item_id + variant so the SERVER can price it authoritatively.
// price here is for display only — the backend never trusts it.
const Cart = {
  get() {
    try {
      const raw = localStorage.getItem("cpc_cart");
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr)
        ? arr.filter(i => i && typeof i.item_name === "string" && i.item_name.trim() !== ""
                       && typeof i.quantity === "number" && typeof i.price === "number")
        : [];
    } catch (_) { return []; }
  },

  save(items) {
    try { localStorage.setItem("cpc_cart", JSON.stringify(items)); } catch (_) {}
  },

  clear() {
    try { localStorage.removeItem("cpc_cart"); } catch (_) {}
  },

  add(item) {
    if (!item || !item.item_name || typeof item.price !== "number") return;
    const items = Cart.get();
    const ex    = items.find(i => i.item_name === item.item_name);
    if (ex) {
      ex.quantity += 1;
    } else {
      items.push({
        item_id:   item.item_id ?? null,
        item_name: item.item_name,
        variant:   item.variant ?? null,
        price:     item.price,
        quantity:  1,
      });
    }
    Cart.save(items);
  },

  remove(name) {
    Cart.save(Cart.get().filter(i => i.item_name !== name));
  },

  count() {
    return Cart.get().reduce((s, i) => s + (i.quantity || 0), 0);
  },

  total() {
    return Cart.get().reduce((s, i) => s + (i.quantity || 0) * (i.price || 0), 0);
  }
};
