// ── API base URL (your computer's IP — works on same WiFi)
const API = "http://localhost:5000/api";

// ── Plain fetch (no auth needed for users)
async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const res  = await fetch(API + path, { ...options, headers });
  const json = await res.json();
  if (!res.ok) throw { status: res.status, message: json.message || "Request failed" };
  return json;
}

// ── Cart (localStorage)
const Cart = {
  get:   ()        => JSON.parse(localStorage.getItem("cpc_cart") || "[]"),
  save:  (items)   => localStorage.setItem("cpc_cart", JSON.stringify(items)),
  clear: ()        => localStorage.removeItem("cpc_cart"),
  add: (item) => {
    const items = Cart.get();
    const ex = items.find(i => i.item_name === item.item_name);
    if (ex) ex.quantity += 1;
    else items.push({ ...item, quantity: 1 });
    Cart.save(items);
  },
  remove: (name)   => Cart.save(Cart.get().filter(i => i.item_name !== name)),
  count:  ()       => Cart.get().reduce((s, i) => s + i.quantity, 0),
  total:  ()       => Cart.get().reduce((s, i) => s + i.quantity * i.price, 0),
};
