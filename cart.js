/* ───────────────────────────────────────────────────────────
   cart.js — ONE cart that works on EVERY page.
   Self-contained: injects its own styles + DOM + logic.
   Depends only on api.js (Cart, apiFetch, escapeHtml).
   Exposes window.cpcCart = { open, close, update }.
─────────────────────────────────────────────────────────── */
(function () {
  if (window.cpcCart) return;
  var esc = window.escapeHtml || function (s) { return String(s == null ? "" : s); };

  // ── Styles ──────────────────────────────────────────────
  var css = `
  .cpc-cart-btn{position:fixed;right:24px;bottom:92px;z-index:1450;display:none;align-items:center;justify-content:center;
    width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;
    background:linear-gradient(135deg,#FF6A00,#FFA34D);color:#fff;font-size:1.4rem;
    box-shadow:0 8px 26px rgba(255,106,0,.45);transition:transform .25s}
  .cpc-cart-btn.show{display:flex}
  @media (max-width:768px){.cpc-cart-btn{right:16px;bottom:80px;width:52px;height:52px}}
  .cpc-cart-btn:hover{transform:translateY(-3px) scale(1.05)}
  .cpc-badge{position:absolute;top:-4px;right:-4px;min-width:22px;height:22px;border-radius:11px;
    background:#fff;color:#FF6A00;font-size:.72rem;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 5px;
    border:2px solid #FF6A00}
  .cpc-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);backdrop-filter:blur(3px);z-index:9100;opacity:0;pointer-events:none;transition:opacity .3s}
  .cpc-overlay.open{opacity:1;pointer-events:auto}
  .cpc-drawer{position:fixed;top:0;right:0;height:100%;width:400px;max-width:92vw;z-index:9200;
    background:#1a0f07;color:#FFF3E4;display:flex;flex-direction:column;
    transform:translateX(105%);transition:transform .32s cubic-bezier(.4,0,.2,1);box-shadow:-12px 0 50px rgba(0,0,0,.5);
    font-family:'Inter',system-ui,sans-serif}
  .cpc-drawer.open{transform:translateX(0)}
  .cpc-head{display:flex;align-items:center;justify-content:space-between;padding:20px 22px;border-bottom:1px solid rgba(255,106,0,.18)}
  .cpc-head h2{font-size:1.15rem;font-weight:800;margin:0;font-family:'Playfair Display',serif}
  .cpc-close{background:rgba(255,255,255,.06);border:none;color:#FFF3E4;width:34px;height:34px;border-radius:50%;font-size:1rem;cursor:pointer}
  .cpc-close:hover{background:rgba(239,68,68,.25);color:#fca5a5}
  .cpc-body{flex:1;overflow-y:auto;padding:14px 18px}
  .cpc-empty{text-align:center;padding:60px 20px;color:#a98e72;font-size:.92rem;line-height:1.7}
  .cpc-empty-ic{font-size:2.6rem;display:block;margin-bottom:10px}
  .cpc-item{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.06)}
  .cpc-item-name{font-weight:600;font-size:.9rem}
  .cpc-item-price{font-size:.74rem;color:#a98e72;margin-top:2px}
  .cpc-qty{display:flex;align-items:center;gap:8px}
  .cpc-qty button{width:28px;height:28px;border-radius:8px;border:1px solid rgba(255,106,0,.3);background:rgba(255,106,0,.1);color:#FF9A40;font-size:1rem;cursor:pointer}
  .cpc-qty span{min-width:18px;text-align:center;font-weight:700;font-size:.9rem}
  .cpc-sub{font-weight:700;font-size:.85rem;color:#FF9A40;white-space:nowrap}
  .cpc-del{background:none;border:none;color:#a98e72;cursor:pointer;font-size:.9rem;grid-column:1/-1;justify-self:end;margin-top:-6px}
  .cpc-del:hover{color:#fca5a5}
  .cpc-total{display:flex;justify-content:space-between;align-items:center;padding:16px 2px 4px;font-size:1.05rem}
  .cpc-total strong{color:#FF9A40;font-size:1.3rem;font-family:'Playfair Display',serif}
  .cpc-foot{border-top:1px solid rgba(255,106,0,.18);padding:16px 18px;background:#160c05}
  .cpc-foot input{width:100%;padding:11px 14px;margin-bottom:9px;border-radius:10px;border:1px solid rgba(255,106,0,.2);
    background:#0f0803;color:#FFF3E4;font-size:.9rem;outline:none;font-family:inherit}
  .cpc-foot input:focus{border-color:#FF6A00}
  .cpc-paylabel{font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:#a98e72;margin:4px 0 6px}
  .cpc-pay{display:flex;flex-direction:column;gap:8px;margin-bottom:10px}
  .cpc-pay label{display:flex;align-items:center;gap:10px;padding:10px 13px;border:1px solid rgba(255,106,0,.22);border-radius:10px;cursor:pointer;font-size:.86rem}
  .cpc-place{width:100%;padding:14px;border:none;border-radius:99px;cursor:pointer;
    background:linear-gradient(135deg,#FF6A00,#FFA34D);color:#fff;font-weight:800;font-size:.98rem;box-shadow:0 6px 20px rgba(255,106,0,.4)}
  .cpc-place:disabled{opacity:.6;cursor:not-allowed}
  .cpc-msg{font-size:.82rem;margin-bottom:8px;display:none}
  .cpc-msg.bad{display:block;color:#fca5a5}
  .cpc-ss{padding:48px 26px;text-align:center}
  .cpc-ss h3{font-family:'Playfair Display',serif;font-size:1.5rem;margin:14px 0 6px}
  .cpc-ss p{color:#a98e72;font-size:.9rem;line-height:1.7;margin-bottom:18px}
  .cpc-ss-id{background:rgba(255,106,0,.08);border:1px solid rgba(255,106,0,.2);border-radius:14px;padding:16px;margin-bottom:18px}
  .cpc-ss-id span{display:block;font-size:.66rem;letter-spacing:.1em;text-transform:uppercase;color:#a98e72}
  .cpc-ss-id strong{font-size:2rem;color:#FF9A40;font-family:'Playfair Display',serif}
  .cpc-ss a{display:block;width:100%;padding:13px;border-radius:99px;background:linear-gradient(135deg,#FF6A00,#FFA34D);color:#fff;font-weight:700;text-decoration:none;margin-bottom:10px}`;
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  // ── DOM ─────────────────────────────────────────────────
  var btn = document.createElement("button");
  btn.className = "cpc-cart-btn"; btn.setAttribute("aria-label", "View cart");
  btn.innerHTML = '🛒<span class="cpc-badge" id="cpc-badge">0</span>';
  var overlay = document.createElement("div"); overlay.className = "cpc-overlay";
  var drawer = document.createElement("aside");
  drawer.className = "cpc-drawer"; drawer.setAttribute("role", "dialog"); drawer.setAttribute("aria-modal", "true");
  drawer.innerHTML =
    '<div class="cpc-head"><h2>Your Cart 🍽️</h2><button class="cpc-close" aria-label="Close">✕</button></div>' +
    '<div class="cpc-body" id="cpc-body"></div>' +
    '<div class="cpc-foot" id="cpc-foot" style="display:none">' +
    '<div class="cpc-msg" id="cpc-msg"></div>' +
    '<input id="cpc-name" placeholder="Your name" autocomplete="name"/>' +
    '<input id="cpc-phone" placeholder="Phone (03001234567)" autocomplete="tel"/>' +
    '<input id="cpc-addr" placeholder="Delivery address" autocomplete="street-address"/>' +
    '<div id="cpc-paywrap" style="display:none"><div class="cpc-paylabel">Payment</div>' +
    '<div class="cpc-pay">' +
    '<label><input type="radio" name="cpcpay" value="cod" checked/> 💵 Cash on Delivery</label>' +
    '<label id="cpc-card-opt" style="display:none"><input type="radio" name="cpcpay" value="card"/> 💳 Pay Online — Card (Visa &amp; Mastercard)</label>' +
    '</div></div>' +
    '<button class="cpc-place" id="cpc-place">Place Order →</button></div>';
  document.body.appendChild(btn); document.body.appendChild(overlay); document.body.appendChild(drawer);

  var body = drawer.querySelector("#cpc-body"),
      foot = drawer.querySelector("#cpc-foot"),
      badge = btn.querySelector("#cpc-badge"),
      msg = drawer.querySelector("#cpc-msg"),
      placeBtn = drawer.querySelector("#cpc-place");

  // ── Render ──────────────────────────────────────────────
  function render() {
    var items = Cart.get();
    if (!items.length) {
      body.innerHTML = '<div class="cpc-empty"><span class="cpc-empty-ic">🛒</span>Your cart is empty.<br/>Add something delicious!</div>';
      foot.style.display = "none"; return;
    }
    foot.style.display = "block";
    body.innerHTML = items.map(function (it, i) {
      return '<div class="cpc-item"><div><div class="cpc-item-name">' + esc(it.item_name) +
        '</div><div class="cpc-item-price">Rs. ' + (Number(it.price) || 0) + ' each</div></div>' +
        '<div class="cpc-qty"><button data-q="' + i + '" data-d="-1">−</button><span>' + it.quantity +
        '</span><button data-q="' + i + '" data-d="1">+</button></div>' +
        '<div class="cpc-sub">Rs. ' + (it.quantity * it.price) + '</div>' +
        '<button class="cpc-del" data-del="' + i + '">✕ remove</button></div>';
    }).join("") + '<div class="cpc-total"><span>Total</span><strong>Rs. ' + Cart.total() + '</strong></div>';

    body.querySelectorAll("[data-q]").forEach(function (b) {
      b.addEventListener("click", function () {
        var it = Cart.get()[+b.dataset.q]; if (!it) return;
        var arr = Cart.get(); var t = arr.find(function (x) { return x.item_name === it.item_name; });
        if (t) { t.quantity += +b.dataset.d; if (t.quantity <= 0) Cart.remove(t.item_name); else Cart.save(arr); }
        update(); render();
      });
    });
    body.querySelectorAll("[data-del]").forEach(function (b) {
      b.addEventListener("click", function () {
        var it = Cart.get()[+b.dataset.del]; if (it) { Cart.remove(it.item_name); update(); render(); }
      });
    });
  }

  function update() {
    var n = Cart.count();
    badge.textContent = n;
    btn.classList.toggle("show", n > 0);
  }

  function open() { render(); overlay.classList.add("open"); drawer.classList.add("open"); document.body.style.overflow = "hidden"; }
  function close() { overlay.classList.remove("open"); drawer.classList.remove("open"); document.body.style.overflow = ""; }

  // ── Place order ─────────────────────────────────────────
  function showMsg(t) { msg.textContent = t; msg.className = "cpc-msg bad"; }

  async function place() {
    var name = (drawer.querySelector("#cpc-name").value || "").trim();
    var phone = (drawer.querySelector("#cpc-phone").value || "").trim();
    var addr = (drawer.querySelector("#cpc-addr").value || "").trim();
    msg.className = "cpc-msg";
    if (!name) return showMsg("Please enter your name.");
    if (!phone) return showMsg("Please enter your phone number.");
    if (!addr) return showMsg("Please enter your delivery address.");

    var items = Cart.get().filter(function (i) { return i && i.item_id != null && typeof i.quantity === "number"; })
      .map(function (i) { return { item_id: i.item_id, variant: i.variant || null, quantity: Math.max(1, Math.floor(i.quantity)) }; });
    if (!items.length) return showMsg("Please refresh the menu and re-add items.");

    var payEl = drawer.querySelector('input[name="cpcpay"]:checked');
    var pay = payEl ? payEl.value : "cod";
    var service = new URLSearchParams(location.search).get("service") || "delivery";

    placeBtn.disabled = true; placeBtn.textContent = pay === "card" ? "Starting payment…" : "Placing order…";
    var timeout = new Promise(function (_, rej) { setTimeout(function () { rej(new Error("Request timed out. Check your connection.")); }, 12000); });
    try {
      var res = await Promise.race([
        apiFetch("/orders", { method: "POST", body: JSON.stringify({ name: name, phone: phone, delivery_address: addr, service: service, payment_method: pay, items: items }) }),
        timeout
      ]);
      localStorage.setItem("last_order", JSON.stringify({ id: res.data.id, name: name, phone: phone, total: res.data.total_price }));
      Cart.clear(); update();
      if (pay === "card" && res.data.checkout_url) { window.location.href = res.data.checkout_url; return; }
      success(res.data.id, res.data.total_price);
    } catch (e) {
      showMsg((e && e.message) || "Failed to place order. Try again.");
      placeBtn.disabled = false; placeBtn.textContent = "Place Order →";
    }
  }

  function success(id, total) {
    body.innerHTML = '<div class="cpc-ss"><div style="font-size:3rem">✅</div><h3>Order Placed!</h3>' +
      '<p>We\'re preparing your order right away.</p>' +
      '<div class="cpc-ss-id"><span>Order ID</span><strong>#' + esc(id) + '</strong>' +
      '<div style="color:#a98e72;margin-top:6px">Total: Rs. ' + (Number(total) || 0) + '</div></div>' +
      '<a href="track.html?id=' + esc(id) + '">Track My Order →</a></div>';
    foot.style.display = "none";
  }

  // ── Show card option if backend has it enabled ──────────
  (async function () {
    try {
      var r = await apiFetch("/config");
      if (r && r.data && r.data.card_payment) {
        drawer.querySelector("#cpc-paywrap").style.display = "";
        drawer.querySelector("#cpc-card-opt").style.display = "flex";
      }
    } catch (e) {}
  })();

  // ── Wire ────────────────────────────────────────────────
  btn.addEventListener("click", open);
  drawer.querySelector(".cpc-close").addEventListener("click", close);
  overlay.addEventListener("click", close);
  placeBtn.addEventListener("click", place);
  window.addEventListener("storage", function (e) { if (e.key === "cpc_cart") update(); });

  window.cpcCart = { open: open, close: close, update: update };
  // Back-compat aliases so older inline calls keep working.
  window.openCart = open; window.closeCart = close; window.updateFloatBtn = update;
  update();
})();
