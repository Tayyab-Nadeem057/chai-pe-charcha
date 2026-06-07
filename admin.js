/* ═══════════════════════════════════════════════════════════
   Chai Pe Charcha — Admin Panel JS
   All original API logic preserved.
   Additions: image upload/compress, improved toast, skeleton,
              pending badge, refresh spinner.
═══════════════════════════════════════════════════════════ */

// ── Auth guard ──────────────────────────────────────────────
const token = localStorage.getItem("admin_token");
const admin = JSON.parse(localStorage.getItem("admin_user") || "null");
if (!token || !admin || admin.role !== "admin") {
  location.href = "admin-login.html";
}

// ── State ───────────────────────────────────────────────────
let currentFilter = "";
let allOrders     = [];
let allMenuItems  = [];
let categories    = [];
let currentView   = "orders";

// ── Admin fetch (unchanged) ─────────────────────────────────
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

// ── Logout (unchanged) ──────────────────────────────────────
function doLogout() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_user");
  location.href = "admin-login.html";
}

// ── Toast (improved: type support) ─────────────────────────
function showToast(msg, type = "info") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className   = "toast " + type;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 3000);
}

// ── Sidebar toggle ──────────────────────────────────────────
function toggleSidebar() {
  const sidebar  = document.getElementById("sidebar");
  const overlay  = document.getElementById("sb-overlay");
  const isOpen   = sidebar.classList.toggle("open");
  overlay.classList.toggle("show", isOpen);
}

// ── Refresh button with spinner ─────────────────────────────
function refreshPage() {
  const icon = document.getElementById("refresh-icon");
  icon.className = "spin";
  icon.textContent = "⟳";
  loadAll().finally(() => {
    setTimeout(() => { icon.className = ""; icon.textContent = "↻"; }, 500);
  });
}

// ── Views ───────────────────────────────────────────────────
function showView(view, el) {
  currentView = view;
  document.querySelectorAll(".sb-item").forEach(i => i.classList.remove("act"));
  if (el) el.classList.add("act");
  document.querySelectorAll(".view-panel").forEach(p => p.classList.remove("act"));

  const titles = {
    orders:   "All Orders",
    pending:  "Pending Orders",
    accepted: "Accepted Orders",
    rejected: "Rejected Orders",
    menu:     "Menu Items",
  };
  document.getElementById("page-title").textContent = titles[view] || "Admin";

  if (view === "menu") {
    document.getElementById("view-menu").classList.add("act");
    loadMenuAdmin();
  } else {
    document.getElementById("view-orders").classList.add("act");
    currentFilter = view === "orders" ? "" : view.charAt(0).toUpperCase() + view.slice(1);
    loadOrders();
  }
  // Close sidebar on mobile after nav
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sb-overlay").classList.remove("show");
}

// ── Stats ───────────────────────────────────────────────────
async function loadStats() {
  try {
    const res = await adminFetch("/admin/stats");
    const d   = res.data;
    document.getElementById("s-total").textContent    = d.total_orders;
    document.getElementById("s-pending").textContent  = d.pending_orders;
    document.getElementById("s-accepted").textContent = d.accepted_orders;
    document.getElementById("s-rejected").textContent = d.rejected_orders;

    // Pending badge in sidebar
    const badge = document.getElementById("pending-badge");
    if (badge) {
      badge.textContent = d.pending_orders;
      badge.style.display = d.pending_orders > 0 ? "flex" : "none";
    }
  } catch (_) {}
}

// ── Orders ──────────────────────────────────────────────────
async function loadOrders() {
  const c   = document.getElementById("tbl-container");
  const url = currentFilter
    ? `/admin/orders?status=${currentFilter}&per_page=100`
    : "/admin/orders?per_page=100";

  // Skeleton while loading
  c.innerHTML = buildTableSkeleton(6);

  try {
    const res = await adminFetch(url);
    allOrders = res.data.orders;
    renderOrders();
  } catch (e) {
    c.innerHTML = `<div class="no-data">
      <span class="no-data-icon">⚠️</span>
      Failed to load orders. Is the backend running?
    </div>`;
  }
}

function buildTableSkeleton(rows) {
  let html = `<table><thead><tr>
    <th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th>
  </tr></thead><tbody>`;
  for (let i = 0; i < rows; i++) {
    html += `<tr>${Array(6).fill('<td><div class="skel skel-row" style="height:18px;margin:0"></div></td>').join("")}</tr>`;
  }
  html += "</tbody></table>";
  return html;
}

function renderOrders() {
  const c = document.getElementById("tbl-container");
  if (!allOrders.length) {
    c.innerHTML = `<div class="no-data">
      <span class="no-data-icon">📋</span>
      No orders found.
    </div>`;
    return;
  }
  c.innerHTML = `<table>
    <thead><tr>
      <th>#</th><th>Customer</th><th>Items</th>
      <th>Total</th><th>Status</th><th>Actions</th>
    </tr></thead>
    <tbody>${allOrders.map(o => `
      <tr id="row-${o.id}">
        <td><span class="oid">#${o.id}</span><div style="font-size:.7rem;color:var(--text-muted);margin-top:3px">${timeAgo(o.created_at)}</div></td>
        <td>
          <div class="cust-name">${o.guest_name}</div>
          <div class="cust-phone">${o.guest_phone}</div>
          <div class="addr-cell">${o.delivery_address}</div>
        </td>
        <td class="items-cell">${o.items.map(i => `${i.item_name} ×${i.quantity}`).join("<br/>")}</td>
        <td class="price-cell">Rs. ${o.total_price}</td>
        <td><span class="sp sp-${o.status}" id="pill-${o.id}">${o.status}</span></td>
        <td>
          <div class="act-wrap">
            <button class="ab ab-acc ${o.status !== "Pending" ? "ab-dis" : ""}"
                    onclick="updateOrder(${o.id},'Accepted')">✓ Accept</button>
            <button class="ab ab-rej ${o.status !== "Pending" ? "ab-dis" : ""}"
                    onclick="updateOrder(${o.id},'Rejected')">✗ Reject</button>
          </div>
        </td>
      </tr>`).join("")}
    </tbody>
  </table>`;
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

async function updateOrder(id, status) {
  try {
    await adminFetch(`/admin/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
    showToast(`Order #${id} → ${status}`, status === "Accepted" ? "success" : "error");
    loadStats();
    loadOrders();
  } catch (e) {
    showToast("Error: " + e.message, "error");
  }
}

// ── Menu admin ──────────────────────────────────────────────
async function loadCategories() {
  const res  = await adminFetch("/admin/menu/categories");
  categories = res.data;

  const sel  = document.getElementById("mf-category");
  if (sel) sel.innerHTML = categories.map(c => `<option value="${c.id}">${c.label}</option>`).join("");

  const filt = document.getElementById("menu-cat-filter");
  if (filt) {
    filt.innerHTML =
      '<option value="">All categories</option>' +
      categories.map(c => `<option value="${c.id}">${c.label}</option>`).join("");
  }
}

async function loadMenuAdmin() {
  const search   = document.getElementById("menu-search")?.value  || "";
  const category = document.getElementById("menu-cat-filter")?.value || "";
  const service  = document.getElementById("menu-svc-filter")?.value || "";
  const active   = document.getElementById("menu-active-filter")?.value || "";
  let url = `/admin/menu/items?search=${encodeURIComponent(search)}`;
  if (category) url += `&category=${category}`;
  if (service)  url += `&service=${service}`;
  if (active !== "") url += `&active=${active}`;

  const el = document.getElementById("menu-list");
  // Skeleton grid
  el.innerHTML = Array(6).fill(`<div class="skel skel-card"></div>`).join("");

  try {
    if (!categories.length) await loadCategories();
    const res  = await adminFetch(url);
    allMenuItems = res.data;
    renderMenuItems();
  } catch (e) {
    el.innerHTML = `<div class="no-data" style="grid-column:1/-1">
      <span class="no-data-icon">⚠️</span>${e.message}
    </div>`;
  }
}

function svcTags(item) {
  const t = [];
  if (item.dine_in)  t.push('<span class="tag tag-d">Dine In</span>');
  if (item.takeaway) t.push('<span class="tag tag-t">Take Away</span>');
  if (item.delivery) t.push('<span class="tag tag-v">Delivery</span>');
  return t.join("") || '<span class="tag tag-off">None</span>';
}

function renderMenuItems() {
  const el = document.getElementById("menu-list");
  if (!allMenuItems.length) {
    el.innerHTML = `<div class="no-data" style="grid-column:1/-1">
      <span class="no-data-icon">🍽️</span>
      No items match your filters.
    </div>`;
    return;
  }
  el.innerHTML = allMenuItems.map(item => `
    <div class="menu-card ${item.is_active ? "" : "inactive"}">
      <div class="menu-card-img">
        <img src="${item.image}" alt="${item.name}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
        <div class="img-fail-icon" style="display:none">🍴</div>
      </div>
      <div class="menu-card-body">
        <div class="menu-card-top">
          <strong>${item.name}</strong>
          <span class="menu-card-price">Rs. ${item.price}</span>
        </div>
        <div class="menu-card-meta">${item.category_id} · ${item.is_active ? "✓ Active" : "Hidden"}</div>
        <div class="svc-tags">${svcTags(item)}</div>
        <div class="menu-card-actions">
          <button class="ab ab-edit" onclick="openItemForm(${item.id})">✏️ Edit</button>
          <button class="ab ab-rej"  onclick="deleteItem(${item.id})">🗑 Delete</button>
        </div>
      </div>
    </div>`).join("");
}

// ── Item modal ──────────────────────────────────────────────
function openItemForm(id) {
  const item = id ? allMenuItems.find(x => x.id === id) : null;
  document.getElementById("item-modal").classList.add("open");
  document.getElementById("mf-id").value        = item?.id || "";
  document.getElementById("mf-name").value      = item?.name || "";
  document.getElementById("mf-price").value     = item?.price ?? "";
  document.getElementById("mf-image").value     = item?.image_file || "";
  document.getElementById("mf-category").value  = item?.category_id || categories[0]?.id || "";
  document.getElementById("mf-dinein").checked   = item ? item.dine_in  : true;
  document.getElementById("mf-takeaway").checked = item ? item.takeaway : true;
  document.getElementById("mf-delivery").checked = item ? item.delivery : true;
  document.getElementById("mf-active").checked   = item ? item.is_active : true;
  document.getElementById("modal-title").textContent = item ? "Edit Item" : "Add Item";

  // Reset file input
  document.getElementById("mf-file").value = "";

  // If editing and item has an image, show it as preview
  if (item && item.image) {
    showImagePreview(item.image, item.image_file, null);
  } else {
    removeImagePreview();
  }
}

function closeItemForm() {
  document.getElementById("item-modal").classList.remove("open");
}

// ── Image upload — client-side compress & preview ───────────
function handleDragOver(e) {
  e.preventDefault();
  document.getElementById("img-upload-zone").classList.add("drag-over");
}
function handleDragLeave(e) {
  document.getElementById("img-upload-zone").classList.remove("drag-over");
}
function handleDrop(e) {
  e.preventDefault();
  document.getElementById("img-upload-zone").classList.remove("drag-over");
  const file = e.dataTransfer?.files?.[0];
  if (file && file.type.startsWith("image/")) processImage(file);
}
function handleImageSelect(e) {
  const file = e.target.files?.[0];
  if (file) processImage(file);
}

function processImage(file) {
  const bar  = document.getElementById("img-progress-bar");
  const fill = document.getElementById("img-progress-fill");
  bar.classList.add("show");
  fill.style.width = "0%";

  const reader = new FileReader();
  reader.onload = (ev) => {
    fill.style.width = "40%";
    const img = new Image();
    img.onload = () => {
      fill.style.width = "70%";

      // Resize to max 800 × 600
      const MAX_W = 800, MAX_H = 600;
      let { width, height } = img;
      if (width > MAX_W || height > MAX_H) {
        const ratio = Math.min(MAX_W / width, MAX_H / height);
        width  = Math.round(width  * ratio);
        height = Math.round(height * ratio);
      }

      const canvas  = document.getElementById("compress-canvas");
      canvas.width  = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP, fallback to JPEG
      const mimeOut = file.type === "image/webp" ? "image/webp" : "image/jpeg";
      const dataURL = canvas.toDataURL(mimeOut, 0.82);

      fill.style.width = "100%";
      setTimeout(() => bar.classList.remove("show"), 600);

      // Compute compressed size
      const bytes = Math.round((dataURL.length - dataURL.indexOf(",") - 1) * 0.75);
      const kb    = (bytes / 1024).toFixed(0);

      showImagePreview(dataURL, file.name, `${kb} KB (compressed)`);
      document.getElementById("mf-image").value = file.name;
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function showImagePreview(src, name, sizeText) {
  const previewWrap = document.getElementById("img-preview-wrap");
  const zone        = document.getElementById("img-upload-zone");
  const thumb       = document.getElementById("img-preview-thumb");
  const namEl       = document.getElementById("img-preview-name");
  const sizeEl      = document.getElementById("img-preview-size");

  thumb.src       = src;
  namEl.textContent  = name || "image";
  sizeEl.textContent = sizeText || "";

  previewWrap.classList.add("show");
  zone.style.display = "none";
}

function removeImagePreview() {
  document.getElementById("img-preview-wrap").classList.remove("show");
  document.getElementById("img-upload-zone").style.display  = "";
  document.getElementById("img-preview-thumb").src = "";
  document.getElementById("mf-image").value        = "";
  document.getElementById("mf-file").value         = "";
}

// ── Save item (unchanged logic) ──────────────────────────────
async function saveItem(e) {
  e.preventDefault();
  const saveBtn = document.getElementById("btn-save");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving…";

  const id   = document.getElementById("mf-id").value;
  const body = {
    name:        document.getElementById("mf-name").value.trim(),
    price:       parseFloat(document.getElementById("mf-price").value),
    image_file:  document.getElementById("mf-image").value.trim(),
    category_id: document.getElementById("mf-category").value,
    dine_in:     document.getElementById("mf-dinein").checked,
    takeaway:    document.getElementById("mf-takeaway").checked,
    delivery:    document.getElementById("mf-delivery").checked,
    is_active:   document.getElementById("mf-active").checked,
  };

  try {
    if (id) {
      await adminFetch(`/admin/menu/items/${id}`, { method: "PUT",  body: JSON.stringify(body) });
      showToast("Item updated — live on website now", "success");
    } else {
      await adminFetch("/admin/menu/items",         { method: "POST", body: JSON.stringify(body) });
      showToast("Item added ✓", "success");
    }
    closeItemForm();
    loadMenuAdmin();
  } catch (err) {
    showToast("Error: " + err.message, "error");
  } finally {
    saveBtn.disabled    = false;
    saveBtn.textContent = "Save Item";
  }
}

// ── Delete item (unchanged logic) ───────────────────────────
async function deleteItem(id) {
  if (!confirm("Delete this menu item permanently?")) return;
  try {
    await adminFetch(`/admin/menu/items/${id}`, { method: "DELETE" });
    showToast("Item deleted", "error");
    loadMenuAdmin();
  } catch (e) {
    showToast("Error: " + e.message, "error");
  }
}

// ── Load all (unchanged logic) ───────────────────────────────
async function loadAll() {
  await loadStats();
  if (currentView === "menu") loadMenuAdmin();
  else loadOrders();
}

// ── Init ─────────────────────────────────────────────────────
const adminName = admin?.name || "Admin";
document.getElementById("admin-name").textContent = adminName;
// Avatar initials
const avatarEl = document.getElementById("admin-avatar");
if (avatarEl) avatarEl.textContent = adminName.charAt(0).toUpperCase();

loadAll();
setInterval(loadAll, 30000);

// Close modal on backdrop click
document.getElementById("item-modal").addEventListener("click", function(e) {
  if (e.target === this) closeItemForm();
});
