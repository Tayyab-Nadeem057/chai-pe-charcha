/* ═══════════════════════════════════════════════════════════
   Chai Pe Charcha — Admin Panel JS  (hardened)
   • Cookie/CSRF auth (no token in localStorage)
   • All rendered data escaped (no XSS)
   • Real backend image upload
   • New-order sound + title alerts
   • Printable order detail
═══════════════════════════════════════════════════════════ */

// ── Auth guard ──────────────────────────────────────────────
// The JWT lives in an httpOnly cookie (invisible to JS). We keep only
// non-sensitive display info in localStorage; real auth is enforced by
// the server on every request (a 401 bounces us to login).
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
let lastPending   = null;     // for new-order detection
let pendingImageUrl = null;   // set when a new image is uploaded

// ── Admin fetch (cookie + CSRF via apiFetch; redirect on 401) ──
async function adminFetch(path, opts = {}) {
  try {
    return await apiFetch(path, opts);
  } catch (e) {
    if (e && e.status === 401) {
      localStorage.removeItem("admin_user");
      localStorage.removeItem("admin_token");
      location.href = "admin-login.html";
    }
    throw new Error((e && e.message) || "Request failed");
  }
}

// ── Logout ──────────────────────────────────────────────────
async function doLogout() {
  try { await apiFetch("/auth/logout", { method: "POST" }); } catch (_) {}
  localStorage.removeItem("admin_user");
  localStorage.removeItem("admin_token");
  location.href = "admin-login.html";
}

// ── Toast ───────────────────────────────────────────────────
function showToast(msg, type = "info") {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.className   = "toast " + type;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 3000);
}

// ── Sidebar toggle ──────────────────────────────────────────
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sb-overlay");
  const isOpen  = sidebar.classList.toggle("open");
  overlay.classList.toggle("show", isOpen);
}

// ── Refresh button ──────────────────────────────────────────
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

  const titles = { orders: "All Orders", pending: "Pending Orders",
    accepted: "Accepted Orders", rejected: "Rejected Orders", menu: "Menu Items" };
  document.getElementById("page-title").textContent = titles[view] || "Admin";

  if (view === "menu") {
    document.getElementById("view-menu").classList.add("act");
    loadMenuAdmin();
  } else {
    document.getElementById("view-orders").classList.add("act");
    currentFilter = view === "orders" ? "" : view.charAt(0).toUpperCase() + view.slice(1);
    loadOrders();
  }
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("sb-overlay").classList.remove("show");
}

// ── Stats + new-order alert ─────────────────────────────────
async function loadStats() {
  try {
    const res = await adminFetch("/admin/stats");
    const d   = res.data;
    document.getElementById("s-total").textContent    = d.total_orders;
    document.getElementById("s-pending").textContent  = d.pending_orders;
    document.getElementById("s-accepted").textContent = d.accepted_orders;
    document.getElementById("s-rejected").textContent = d.rejected_orders;

    const badge = document.getElementById("pending-badge");
    if (badge) {
      badge.textContent = d.pending_orders;
      badge.style.display = d.pending_orders > 0 ? "flex" : "none";
    }

    // Browser title reflects pending count
    document.title = (d.pending_orders > 0 ? `(${d.pending_orders}) ` : "") +
                     "Admin — Chai Pe Charcha";

    // Alert when new pending orders arrive (not on first load)
    if (lastPending !== null && d.pending_orders > lastPending) {
      notifyNewOrder(d.pending_orders - lastPending);
    }
    lastPending = d.pending_orders;
  } catch (_) {}
}

function notifyNewOrder(count) {
  showToast(`🔔 ${count} new order${count > 1 ? "s" : ""} received!`, "success");
  playBeep();
  // Flash the favicon/title a few times
  let flips = 0;
  const base = document.title;
  const flash = setInterval(() => {
    document.title = (flips % 2 === 0) ? "🔔 NEW ORDER!" : base;
    if (++flips > 6) { clearInterval(flash); document.title = base; }
  }, 600);
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = "sine"; o.frequency.value = 880;
    g.gain.setValueAtTime(0.001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    o.start(); o.stop(ctx.currentTime + 0.4);
  } catch (_) {}
}

// ── Orders ──────────────────────────────────────────────────
async function loadOrders() {
  const c   = document.getElementById("tbl-container");
  const url = currentFilter
    ? `/admin/orders?status=${encodeURIComponent(currentFilter)}&per_page=100`
    : "/admin/orders?per_page=100";
  c.innerHTML = buildTableSkeleton(6);
  try {
    const res = await adminFetch(url);
    allOrders = res.data.orders;
    renderOrders();
  } catch (e) {
    c.innerHTML = `<div class="no-data"><span class="no-data-icon">⚠️</span>
      Failed to load orders. Is the backend running?</div>`;
  }
}

function buildTableSkeleton(rows) {
  let html = `<table><thead><tr>
    <th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th>
  </tr></thead><tbody>`;
  for (let i = 0; i < rows; i++) {
    html += `<tr>${Array(6).fill('<td><div class="skel skel-row" style="height:18px;margin:0"></div></td>').join("")}</tr>`;
  }
  return html + "</tbody></table>";
}

function renderOrders() {
  const c = document.getElementById("tbl-container");
  if (!allOrders.length) {
    c.innerHTML = `<div class="no-data"><span class="no-data-icon">📋</span>No orders found.</div>`;
    return;
  }
  c.innerHTML = `<table>
    <thead><tr>
      <th>#</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th>
    </tr></thead>
    <tbody>${allOrders.map(o => `
      <tr id="row-${o.id}">
        <td><span class="oid">#${o.id}</span><div style="font-size:.7rem;color:var(--text-muted);margin-top:3px">${timeAgo(o.created_at)}</div></td>
        <td>
          <div class="cust-name">${escapeHtml(o.guest_name)}</div>
          <div class="cust-phone">${escapeHtml(o.guest_phone)}</div>
          <div class="addr-cell">${escapeHtml(o.delivery_address)}</div>
        </td>
        <td class="items-cell">${o.items.map(i => `${escapeHtml(i.item_name)} ×${i.quantity}`).join("<br/>")}</td>
        <td class="price-cell">Rs. ${Number(o.total_price) || 0}</td>
        <td><span class="sp sp-${escapeHtml(o.status)}" id="pill-${o.id}">${escapeHtml(o.status)}</span></td>
        <td>
          <div class="act-wrap">
            <button class="ab ab-acc ${o.status !== "Pending" ? "ab-dis" : ""}" data-acc="${o.id}">✓ Accept</button>
            <button class="ab ab-rej ${o.status !== "Pending" ? "ab-dis" : ""}" data-rej="${o.id}">✗ Reject</button>
            <button class="ab ab-edit" data-detail="${o.id}">🧾 Detail</button>
          </div>
        </td>
      </tr>`).join("")}
    </tbody>
  </table>`;

  c.querySelectorAll("[data-acc]").forEach(b => b.addEventListener("click", () => updateOrder(+b.dataset.acc, "Accepted")));
  c.querySelectorAll("[data-rej]").forEach(b => b.addEventListener("click", () => updateOrder(+b.dataset.rej, "Rejected")));
  c.querySelectorAll("[data-detail]").forEach(b => b.addEventListener("click", () => viewOrder(+b.dataset.detail)));
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
    await adminFetch(`/admin/orders/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
    showToast(`Order #${id} → ${status}`, status === "Accepted" ? "success" : "error");
    loadStats();
    loadOrders();
  } catch (e) {
    showToast("Error: " + e.message, "error");
  }
}

// ── Printable order detail ──────────────────────────────────
function viewOrder(id) {
  const o = allOrders.find(x => x.id === id);
  if (!o) return;
  const rows = o.items.map(i =>
    `<tr><td>${escapeHtml(i.item_name)}</td><td style="text-align:center">${i.quantity}</td>
     <td style="text-align:right">Rs. ${Number(i.price) || 0}</td>
     <td style="text-align:right">Rs. ${i.subtotal}</td></tr>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Order #${o.id}</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;color:#1a0a00;padding:28px;max-width:640px;margin:auto}
      h1{font-size:1.4rem;margin:0 0 2px} .muted{color:#777;font-size:.85rem}
      .box{border:1px solid #eee;border-radius:10px;padding:16px;margin:16px 0}
      table{width:100%;border-collapse:collapse;margin-top:8px}
      th,td{padding:8px;border-bottom:1px solid #eee;font-size:.9rem}
      th{text-align:left;color:#555} .tot{font-size:1.2rem;font-weight:700;text-align:right;margin-top:10px}
      .status{display:inline-block;padding:4px 12px;border-radius:99px;background:#FFF3E8;color:#FF6A00;font-weight:600;font-size:.8rem}
      @media print{.no-print{display:none}}
    </style></head><body>
    <h1>☕ Chai Pe Charcha</h1>
    <div class="muted">Order receipt</div>
    <div class="box">
      <div><strong>Order #${o.id}</strong> &middot; <span class="status">${escapeHtml(o.status)}</span></div>
      <div class="muted">${new Date(o.created_at).toLocaleString()} &middot; ${escapeHtml(o.service || "delivery")}</div>
      <hr style="border:none;border-top:1px solid #eee;margin:12px 0">
      <div><strong>${escapeHtml(o.guest_name)}</strong></div>
      <div class="muted">${escapeHtml(o.guest_phone)}</div>
      <div class="muted">${escapeHtml(o.delivery_address)}</div>
    </div>
    <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Subtotal</th></tr></thead>
      <tbody>${rows}</tbody></table>
    <div class="tot">Total: Rs. ${Number(o.total_price) || 0}</div>
    <p class="no-print" style="margin-top:24px;text-align:center">
      <button onclick="window.print()" style="padding:10px 24px;border:none;border-radius:8px;background:#FF6A00;color:#fff;font-size:1rem;cursor:pointer">🖨 Print</button>
    </p></body></html>`;
  const w = window.open("", "_blank", "width=720,height=800");
  if (w) { w.document.write(html); w.document.close(); }
}

// ── Menu admin ──────────────────────────────────────────────
async function loadCategories() {
  const res  = await adminFetch("/admin/menu/categories");
  categories = res.data;
  const sel  = document.getElementById("mf-category");
  if (sel) sel.innerHTML = categories.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.label)}</option>`).join("");
  const filt = document.getElementById("menu-cat-filter");
  if (filt) {
    filt.innerHTML = '<option value="">All categories</option>' +
      categories.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.label)}</option>`).join("");
  }
}

async function loadMenuAdmin() {
  const search   = document.getElementById("menu-search")?.value  || "";
  const category = document.getElementById("menu-cat-filter")?.value || "";
  const service  = document.getElementById("menu-svc-filter")?.value || "";
  const active   = document.getElementById("menu-active-filter")?.value || "";
  let url = `/admin/menu/items?search=${encodeURIComponent(search)}`;
  if (category) url += `&category=${encodeURIComponent(category)}`;
  if (service)  url += `&service=${encodeURIComponent(service)}`;
  if (active !== "") url += `&active=${encodeURIComponent(active)}`;

  const el = document.getElementById("menu-list");
  el.innerHTML = Array(6).fill(`<div class="skel skel-card"></div>`).join("");
  try {
    if (!categories.length) await loadCategories();
    const res = await adminFetch(url);
    allMenuItems = res.data;
    renderMenuItems();
  } catch (e) {
    el.innerHTML = `<div class="no-data" style="grid-column:1/-1"><span class="no-data-icon">⚠️</span>${escapeHtml(e.message)}</div>`;
  }
}

function svcTags(item) {
  const t = [];
  if (item.dine_in)  t.push('<span class="tag tag-d">Dine In</span>');
  if (item.takeaway) t.push('<span class="tag tag-t">Take Away</span>');
  if (item.delivery) t.push('<span class="tag tag-v">Delivery</span>');
  if (item.sold_out) t.push('<span class="tag tag-off">Sold out</span>');
  return t.join("") || '<span class="tag tag-off">None</span>';
}

function renderMenuItems() {
  const el = document.getElementById("menu-list");
  if (!allMenuItems.length) {
    el.innerHTML = `<div class="no-data" style="grid-column:1/-1"><span class="no-data-icon">🍽️</span>No items match your filters.</div>`;
    return;
  }
  el.innerHTML = allMenuItems.map(item => `
    <div class="menu-card ${item.is_active ? "" : "inactive"}">
      <div class="menu-card-img">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/>
        <div class="img-fail-icon" style="display:none">🍴</div>
      </div>
      <div class="menu-card-body">
        <div class="menu-card-top">
          <strong>${escapeHtml(item.name)}</strong>
          <span class="menu-card-price">Rs. ${Number(item.price) || 0}</span>
        </div>
        <div class="menu-card-meta">${escapeHtml(item.category_id)} · ${item.is_active ? "✓ Active" : "Hidden"}</div>
        <div class="svc-tags">${svcTags(item)}</div>
        <div class="menu-card-actions">
          <button class="ab ab-edit" data-edit="${item.id}">✏️ Edit</button>
          <button class="ab ab-rej"  data-del="${item.id}">🗑 Delete</button>
        </div>
      </div>
    </div>`).join("");

  el.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => openItemForm(+b.dataset.edit)));
  el.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", () => deleteItem(+b.dataset.del)));
}

// ── Item modal ──────────────────────────────────────────────
function openItemForm(id) {
  const item = id ? allMenuItems.find(x => x.id === id) : null;
  pendingImageUrl = null;
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
  const soldOut = document.getElementById("mf-soldout");
  if (soldOut) soldOut.checked = item ? !!item.sold_out : false;
  document.getElementById("modal-title").textContent = item ? "Edit Item" : "Add Item";
  document.getElementById("mf-file").value = "";

  if (item && item.image) showImagePreview(item.image, item.image_file || "current image", null);
  else removeImagePreview();
}

function closeItemForm() {
  document.getElementById("item-modal").classList.remove("open");
}

function triggerFileInput() {
  document.getElementById("mf-file").click();
}

// ── Image upload (real — sends file to backend) ─────────────
function handleDragOver(e) { e.preventDefault(); document.getElementById("img-upload-zone").classList.add("drag-over"); }
function handleDragLeave() { document.getElementById("img-upload-zone").classList.remove("drag-over"); }
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

async function processImage(file) {
  if (file.size > 6 * 1024 * 1024) { showToast("Image too large (max 6 MB)", "error"); return; }
  const bar  = document.getElementById("img-progress-bar");
  const fill = document.getElementById("img-progress-fill");
  bar.classList.add("show"); fill.style.width = "20%";

  // Instant local preview
  const localUrl = URL.createObjectURL(file);
  showImagePreview(localUrl, file.name, "uploading…");
  fill.style.width = "50%";

  try {
    const tok = localStorage.getItem("admin_token");
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch(API + "/admin/menu/upload", {
      method: "POST",
      headers: tok ? { "Authorization": "Bearer " + tok } : {}, body: fd,
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Upload failed");

    pendingImageUrl = json.data.image_url;
    fill.style.width = "100%";
    setTimeout(() => bar.classList.remove("show"), 500);
    document.getElementById("img-preview-size").textContent = "✓ Uploaded";
    showToast("Image uploaded", "success");
  } catch (err) {
    bar.classList.remove("show");
    removeImagePreview();
    showToast("Upload failed: " + err.message, "error");
  }
}

function showImagePreview(src, name, sizeText) {
  document.getElementById("img-preview-thumb").src = src;
  document.getElementById("img-preview-name").textContent = name || "image";
  document.getElementById("img-preview-size").textContent = sizeText || "";
  document.getElementById("img-preview-wrap").classList.add("show");
  document.getElementById("img-upload-zone").style.display = "none";
}

function removeImagePreview() {
  pendingImageUrl = null;
  document.getElementById("img-preview-wrap").classList.remove("show");
  document.getElementById("img-upload-zone").style.display = "";
  document.getElementById("img-preview-thumb").src = "";
  document.getElementById("mf-image").value = "";
  document.getElementById("mf-file").value  = "";
}

// ── Save item ───────────────────────────────────────────────
async function saveItem(e) {
  e.preventDefault();
  const saveBtn = document.getElementById("btn-save");
  saveBtn.disabled = true; saveBtn.textContent = "Saving…";

  const id   = document.getElementById("mf-id").value;
  const body = {
    name:        document.getElementById("mf-name").value.trim(),
    price:       parseFloat(document.getElementById("mf-price").value),
    category_id: document.getElementById("mf-category").value,
    dine_in:     document.getElementById("mf-dinein").checked,
    takeaway:    document.getElementById("mf-takeaway").checked,
    delivery:    document.getElementById("mf-delivery").checked,
    is_active:   document.getElementById("mf-active").checked,
    sold_out:    document.getElementById("mf-soldout")?.checked || false,
  };
  // Only send image_url when a NEW image was uploaded (else keep existing).
  if (pendingImageUrl) body.image_url = pendingImageUrl;

  try {
    if (id) {
      await adminFetch(`/admin/menu/items/${id}`, { method: "PUT", body: JSON.stringify(body) });
      showToast("Item updated — live on website now", "success");
    } else {
      await adminFetch("/admin/menu/items", { method: "POST", body: JSON.stringify(body) });
      showToast("Item added ✓", "success");
    }
    closeItemForm();
    loadMenuAdmin();
  } catch (err) {
    showToast("Error: " + err.message, "error");
  } finally {
    saveBtn.disabled = false; saveBtn.textContent = "Save Item";
  }
}

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

// ── Change password modal ───────────────────────────────────
function openPwModal()  { document.getElementById("pw-modal").classList.add("open"); }
function closePwModal() { document.getElementById("pw-modal").classList.remove("open"); }

function togglePwVis(id, btn) {
  const f = document.getElementById(id);
  if (!f) return;
  f.type = f.type === "password" ? "text" : "password";
  if (btn) btn.style.opacity = f.type === "text" ? "1" : ".55";
}

function updateStrength(val, containerId) {
  const fillId  = containerId.includes("change") ? "fill-change" : "fill-reset";
  const labelId = containerId.includes("change") ? "label-change" : "label-reset";
  const fill = document.getElementById(fillId), label = document.getElementById(labelId);
  if (!fill || !label) return;
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
  if (/\d/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const pct = [0, 30, 55, 80, 100][score];
  const txt = ["Enter a password", "Weak", "Fair", "Good", "Strong"][score];
  const col = ["#555", "#ef4444", "#f59e0b", "#eab308", "#22c55e"][score];
  fill.style.width = pct + "%"; fill.style.background = col;
  label.textContent = txt;
}

async function doChangePassword(e) {
  e.preventDefault();
  const oldP = document.getElementById("pw-old").value;
  const newP = document.getElementById("pw-new").value;
  const conf = document.getElementById("pw-confirm").value;
  const btn  = document.getElementById("btn-pw-save");
  if (newP.length < 8)  { showToast("New password must be at least 8 characters", "error"); return; }
  if (newP !== conf)    { showToast("Passwords do not match", "error"); return; }
  btn.disabled = true; btn.textContent = "Updating…";
  try {
    await adminFetch("/auth/change-password", {
      method: "POST", body: JSON.stringify({ old_password: oldP, new_password: newP }),
    });
    showToast("Password updated ✓", "success");
    closePwModal();
    e.target.reset();
  } catch (err) {
    showToast("Error: " + err.message, "error");
  } finally {
    btn.disabled = false; btn.textContent = "Update Password";
  }
}

// ── Load all ────────────────────────────────────────────────
async function loadAll() {
  await loadStats();
  if (currentView === "menu") loadMenuAdmin();
  else loadOrders();
}

// ── Init ────────────────────────────────────────────────────
const adminName = admin?.name || "Admin";
document.getElementById("admin-name").textContent = adminName;
const avatarEl = document.getElementById("admin-avatar");
if (avatarEl) avatarEl.textContent = adminName.charAt(0).toUpperCase();

loadAll();
setInterval(loadAll, 20000);

document.getElementById("item-modal").addEventListener("click", function (e) {
  if (e.target === this) closeItemForm();
});
