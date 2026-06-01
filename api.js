// API base: same host as the site on port 5000 (works on LAN). Override via localStorage "cpc_api_base".
function getApiBase() {
  const override = localStorage.getItem("cpc_api_base");
  if (override) return override.replace(/\/$/, "");
  const { protocol, hostname } = window.location;
  if (!hostname || hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5000/api";
  }
  return `${protocol}//${hostname}:5000/api`;
}

const API = getApiBase();
const SITE_PHONE = "03021807669";
const SITE_WA = "923021807669";
const SITE_CITY = "Hyderabad";

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const res = await fetch(API + path, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw { status: res.status, message: json.message || "Request failed" };
  return json;
}

const Cart = {
  get: () => JSON.parse(localStorage.getItem("cpc_cart") || "[]"),
  save: (items) => localStorage.setItem("cpc_cart", JSON.stringify(items)),
  clear: () => localStorage.removeItem("cpc_cart"),
  add: (item) => {
    const items = Cart.get();
    const ex = items.find((i) => i.item_name === item.item_name);
    if (ex) ex.quantity += 1;
    else items.push({ ...item, quantity: 1 });
    Cart.save(items);
  },
  remove: (name) => Cart.save(Cart.get().filter((i) => i.item_name !== name)),
  count: () => Cart.get().reduce((s, i) => s + i.quantity, 0),
  total: () => Cart.get().reduce((s, i) => s + i.quantity * i.price, 0),
};
