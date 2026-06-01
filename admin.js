/* Chai Pe Charcha — Admin Panel */
let currentFilter = "";
let allOrders = [];
let allMenuItems = [];
let categories = [];
let currentView = "orders";

const token = localStorage.getItem("admin_token");
const admin = JSON.parse(localStorage.getItem("admin_user") || "null");
if (!token || !admin || admin.role !== "admin") {
  location.href = "admin-login.html";
}

async function adminFetch(path, opts = {}) {
  const res = await fetch(API + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
      ...(opts.headers || {}),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

function doLogout() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
  location.href = "admin-login.html";
}

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2800);
}

function toggleSidebar() {
  document.querySelector(".sidebar")?.classList.toggle("open");
}

// ── Views ──
function showView(view, el) {
  currentView = view;
  document.querySelectorAll(".sb-item").forEach((i) => i.classList.remove("act"));
  if (el) el.classList.add("act");
  document.querySelectorAll(".view-panel").forEach((p) => p.classList.remove("act"));

  const titles = {
    orders: "All Orders",
    pending: "Pending Orders",
    accepted: "Accepted Orders",
    rejected: "Rejected Orders",
    menu: "Menu Items",
  };
  document.getElementById("page-title").textContent = titles[view] || "Admin";

  if (view === "menu") {
    document.getElementById("view-menu").classList.add("act");
    loadMenuAdmin();
  } else {
    document.getElementById("view-orders").classList.add("act");
    currentFilter =
      view === "orders" ? "" : view.charAt(0).toUpperCase() + view.slice(1);
    loadOrders();
  }
  document.querySelector(".sidebar")?.classList.remove("open");
}

// ── Orders ──
async function loadStats() {
  try {
    const res = await adminFetch("/admin/stats");
    const d = res.data;
    document.getElementById("s-total").textContent = d.total_orders;
    document.getElementById("s-pending").textContent = d.pending_orders;
    document.getElementById("s-accepted").textContent = d.accepted_orders;
    document.getElementById("s-rejected").textContent = d.rejected_orders;
  } catch (_) {}
}

async function loadOrders() {
  const url = currentFilter
    ? `/admin/orders?status=${currentFilter}&per_page=100`
    : "/admin/orders?per_page=100";
  try {
    const res = await adminFetch(url);
    allOrders = res.data.orders;
    renderOrders();
  } catch (e) {
    document.getElementById("tbl-container").innerHTML =
      '<div class="no-data">Failed to load orders. Is the backend running?</div>';
  }
}

function renderOrders() {
  const c = document.getElementById("tbl-container");
  if (!allOrders.length) {
    c.innerHTML = '<div class="no-data">No orders found.</div>';
    return;
  }
  c.innerHTML = `<table><thead><tr>
    <th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th>
  </tr></thead><tbody>${allOrders
    .map(
      (o) => `<tr id="row-${o.id}">
      <td><span class="oid">#${o.id}</span></td>
      <td><div class="cust-name">${o.guest_name}</div><div class="cust-phone">${o.guest_phone}</div>
      <div class="addr-cell">${o.delivery_address}</div></td>
      <td class="items-cell">${o.items.map((i) => `${i.item_name} x${i.quantity}`).join("<br/>")}</td>
      <td class="price-cell">Rs. ${o.total_price}</td>
      <td><span class="sp sp-${o.status}" id="pill-${o.id}">${o.status}</span></td>
      <td><div class="act-wrap">
        <button class="ab ab-acc ${o.status !== "Pending" ? "ab-dis" : ""}" onclick="updateOrder(${o.id},'Accepted')">Accept</button>
        <button class="ab ab-rej ${o.status !== "Pending" ? "ab-dis" : ""}" onclick="updateOrder(${o.id},'Rejected')">Reject</button>
      </div></td></tr>`
    )
    .join("")}</tbody></table>`;
}

async function updateOrder(id, status) {
  try {
    await adminFetch(`/admin/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    showToast(`Order #${id} → ${status}`);
    loadStats();
    loadOrders();
  } catch (e) {
    showToast("Error: " + e.message);
  }
}

// ── Menu admin ──
async function loadCategories() {
  const res = await adminFetch("/admin/menu/categories");
  categories = res.data;
  const sel = document.getElementById("mf-category");
  if (sel) {
    sel.innerHTML = categories
      .map((c) => `<option value="${c.id}">${c.label}</option>`)
      .join("");
  }
  const filt = document.getElementById("menu-cat-filter");
  if (filt) {
    filt.innerHTML =
      '<option value="">All categories</option>' +
      categories.map((c) => `<option value="${c.id}">${c.label}</option>`).join("");
  }
}

async function loadMenuAdmin() {
  const search = document.getElementById("menu-search")?.value || "";
  const category = document.getElementById("menu-cat-filter")?.value || "";
  const service = document.getElementById("menu-svc-filter")?.value || "";
  const active = document.getElementById("menu-active-filter")?.value || "";
  let url = `/admin/menu/items?search=${encodeURIComponent(search)}`;
  if (category) url += `&category=${category}`;
  if (service) url += `&service=${service}`;
  if (active !== "") url += `&active=${active}`;

  try {
    if (!categories.length) await loadCategories();
    const res = await adminFetch(url);
    allMenuItems = res.data;
    renderMenuItems();
  } catch (e) {
    document.getElementById("menu-list").innerHTML =
      '<div class="no-data">' + e.message + "</div>";
  }
}

function svcTags(item) {
  const t = [];
  if (item.dine_in) t.push('<span class="tag tag-d">Dine In</span>');
  if (item.takeaway) t.push('<span class="tag tag-t">Take Away</span>');
  if (item.delivery) t.push('<span class="tag tag-v">Delivery</span>');
  return t.join("") || '<span class="tag tag-off">None</span>';
}

function renderMenuItems() {
  const el = document.getElementById("menu-list");
  if (!allMenuItems.length) {
    el.innerHTML = '<div class="no-data">No items match your filters.</div>';
    return;
  }
  el.innerHTML = allMenuItems
    .map(
      (item) => `<div class="menu-card ${item.is_active ? "" : "inactive"}">
      <img src="${item.image}" alt="" loading="lazy" onerror="this.style.opacity=.2"/>
      <div class="menu-card-body">
        <div class="menu-card-top">
          <strong>${item.name}</strong>
          <span class="price-cell">Rs. ${item.price}</span>
        </div>
        <div class="menu-card-meta">${item.category_id} · ${item.is_active ? "Active" : "Hidden"}</div>
        <div class="svc-tags">${svcTags(item)}</div>
        <div class="act-wrap">
          <button class="ab ab-edit" onclick="openItemForm(${item.id})">Edit</button>
          <button class="ab ab-rej" onclick="deleteItem(${item.id})">Delete</button>
        </div>
      </div>
    </div>`
    )
    .join("");
}

function openItemForm(id) {
  const item = id ? allMenuItems.find((x) => x.id === id) : null;
  document.getElementById("item-modal").classList.add("open");
  document.getElementById("mf-id").value = item?.id || "";
  document.getElementById("mf-name").value = item?.name || "";
  document.getElementById("mf-price").value = item?.price ?? "";
  document.getElementById("mf-image").value = item?.image_file || "";
  document.getElementById("mf-category").value = item?.category_id || categories[0]?.id || "";
  document.getElementById("mf-dinein").checked = item ? item.dine_in : true;
  document.getElementById("mf-takeaway").checked = item ? item.takeaway : true;
  document.getElementById("mf-delivery").checked = item ? item.delivery : true;
  document.getElementById("mf-active").checked = item ? item.is_active : true;
  document.getElementById("modal-title").textContent = item ? "Edit Item" : "Add Item";
}

function closeItemForm() {
  document.getElementById("item-modal").classList.remove("open");
}

async function saveItem(e) {
  e.preventDefault();
  const id = document.getElementById("mf-id").value;
  const body = {
    name: document.getElementById("mf-name").value.trim(),
    price: parseFloat(document.getElementById("mf-price").value),
    image_file: document.getElementById("mf-image").value.trim(),
    category_id: document.getElementById("mf-category").value,
    dine_in: document.getElementById("mf-dinein").checked,
    takeaway: document.getElementById("mf-takeaway").checked,
    delivery: document.getElementById("mf-delivery").checked,
    is_active: document.getElementById("mf-active").checked,
  };
  try {
    if (id) {
      await adminFetch(`/admin/menu/items/${id}`, { method: "PUT", body: JSON.stringify(body) });
      showToast("Item updated — live on website now");
    } else {
      await adminFetch("/admin/menu/items", { method: "POST", body: JSON.stringify(body) });
      showToast("Item added");
    }
    closeItemForm();
    loadMenuAdmin();
  } catch (err) {
    showToast("Error: " + err.message);
  }
}

async function deleteItem(id) {
  if (!confirm("Delete this menu item?")) return;
  try {
    await adminFetch(`/admin/menu/items/${id}`, { method: "DELETE" });
    showToast("Item deleted");
    loadMenuAdmin();
  } catch (e) {
    showToast("Error: " + e.message);
  }
}

function loadAll() {
  loadStats();
  if (currentView === "menu") loadMenuAdmin();
  else loadOrders();
}

document.getElementById("admin-name").textContent = admin?.name || "Admin";
loadAll();
setInterval(loadAll, 30000);
