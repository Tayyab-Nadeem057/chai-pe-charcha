// ── MENU DATA ──
const MENU = {
  mains: [
    { name: 'Chicken Karahi', desc: 'Slow-cooked in rich tomato & spice gravy. A true classic.', price: 850, badge: 'Best Seller', img: 'images/chicken supreme.png' },
    { name: 'Mutton Biryani', desc: 'Fragrant basmati rice layered with tender mutton & spices.', price: 550, img: 'images/doodh_patti.png' },
    { name: 'Daal Makhani', desc: 'Creamy black lentils slow-simmered overnight with butter.', price: 450, badge: 'Special', img: 'images/kashmiri_chai.png' },
    { name: 'Nihari', desc: 'Overnight beef stew, rich with spices & served with naan.', price: 650, badge: 'Popular', img: 'images/chai_hero.png' },
    { name: 'Seekh Kebab Plate', desc: 'Smoky minced meat kebabs with mint chutney & naan.', price: 350, img: 'images/green_tea.png' },
    { name: 'Chicken Handi', desc: 'Creamy chicken cooked in a clay pot with aromatic gravy.', price: 750, badge: "Chef's Pick", img: 'images/karak_chai.png' },

  ],
  bbq: [
    { name: 'Malai Boti', desc: 'Tender chicken marinated in cream & mild spices, grilled.', price: 600, badge: 'Best Seller', img: 'images/samosa.png' },
    { name: 'Chicken Tikka', desc: 'Classic marinated chicken pieces grilled over charcoal.', price: 500, img: 'images/bun_kebab.png' },
    { name: 'Reshmi Kebab', desc: 'Silky smooth minced chicken kebabs with herbs.', price: 450, img: 'images/bread_pakora.png' },
    { name: 'Fish Tikka', desc: 'Fresh fish marinated in spices & grilled to perfection.', price: 700, badge: 'Special', img: 'images/cake_slice.png' },
  ],
  snacks: [
    { name: 'Mutton Biryani', desc: 'Fragrant basmati rice layered with tender mutton & spices.', price: 550, img: 'images/doodh_patti.png' },
    { name: 'Daal Makhani', desc: 'Creamy black lentils slow-simmered overnight with butter.', price: 450, badge: 'Special', img: 'images/kashmiri_chai.png' },
    { name: 'Nihari', desc: 'Overnight beef stew, rich with spices & served with naan.', price: 650, badge: 'Popular', img: 'images/chai_hero.png' },
    { name: 'Seekh Kebab Plate', desc: 'Smoky minced meat kebabs with mint chutney & naan.', price: 350, img: 'images/green_tea.png' },
    { name: 'Chicken Handi', desc: 'Creamy chicken cooked in a clay pot with aromatic gravy.', price: 750, badge: "Chef's Pick", img: 'images/karak_chai.png' },

    { name: 'Samosa (2 pcs)', desc: 'Crispy golden pastry stuffed with spiced potatoes & peas.', price: 40, badge: 'Must Try', img: 'images/samosa.png' },
    { name: 'Bun Kebab', desc: 'Spicy seekh kebab in a soft bun with egg & chutney.', price: 120, badge: 'Popular', img: 'images/bun_kebab.png' },
    { name: 'Bread Pakora', desc: 'Crispy battered bread fritters — the ultimate evening snack.', price: 60, img: 'images/bread_pakora.png' },
    { name: 'Cake Slice', desc: 'Moist caramel & chocolate cake — perfect after your meal.', price: 180, badge: 'Sweet', img: 'images/cake_slice.png' },
    { name: 'Chicken Karahi', desc: 'Slow-cooked in r tomato & spice gravy. A true classic.', price: 850, badge: 'Best Seller', img: 'images/karak_chai.png' },
  ],
  deals: [
    { name: 'Karahi + Naan Deal', desc: 'Chicken Karahi with 2 hot naans — the classic combo!', price: 950, badge: 'Value Deal', img: 'images/kashmiri_chai.png' },
    { name: 'Family Platter', desc: 'Biryani + Kebabs + Raita + Drinks — perfect for sharing.', price: 1800, badge: 'Family', img: 'images/bun_kebab.png' },
    { name: 'Lunch Special', desc: 'Daal + Rice + Salad + Drink — a complete meal.', price: 550, badge: 'Lunch', img: 'images/karak_chai.png' },
  ]
};

// ── BUILD CARDS ──
function buildCard(item, delay) {
  const d = document.createElement('div');
  d.className = 'mc rev';
  d.style.setProperty('--d', delay + 's');
  d.innerHTML = `
    <div class="mc-info">
      <div class="mc-name">${item.name}</div>
      <div class="mc-desc">${item.desc}</div>
      <div class="mc-price"><strong>Rs. ${item.price}</strong></div>
    </div>
    <div class="mc-img-wrap">
      ${item.badge ? `<span class="mc-badge">${item.badge}</span>` : ''}
      <img src="${item.img}" alt="${item.name}"/>
    </div>
    <button class="mc-add" onclick="addItem(event,'${item.name.replace(/'/g, "\\'")}',${item.price})">+</button>
  `;
  return d;
}

function populateGrids() {
  Object.keys(MENU).forEach(cat => {
    const grid = document.getElementById('grid-' + cat);
    if (!grid) return;
    MENU[cat].forEach((item, i) => {
      grid.appendChild(buildCard(item, i * 0.06));
    });
  });
  // Re-observe new .rev elements
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('done'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.mc.rev:not(.done)').forEach(el => obs.observe(el));
}
populateGrids();

// ── 3D TILT EFFECT ──
document.addEventListener('mousemove', e => {
  document.querySelectorAll('.mc').forEach(card => {
    const r = card.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    card.style.transform = `perspective(800px) rotateY(${dx * 8}deg) rotateX(${-dy * 8}deg) scale(1.02)`;
  });
});
document.addEventListener('mouseover', e => {
  const card = e.target.closest('.mc');
  if (!card) document.querySelectorAll('.mc').forEach(c => c.style.transform = '');
});
document.querySelectorAll('.mc').forEach(card => {
  card.addEventListener('mouseleave', () => card.style.transform = '');
});

// ── STICKY NAV SCROLL ──
const catNav = document.getElementById('catNav');
const pills = document.querySelectorAll('.cat-pill');
const sections = document.querySelectorAll('.cat-section');

pills.forEach(pill => {
  pill.addEventListener('click', () => {
    const id = 'sec-' + pill.dataset.cat;
    const sec = document.getElementById(id);
    if (sec) {
      const y = sec.offsetTop - 140;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  });
});

// Highlight active pill on scroll
const scrollObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const cat = entry.target.id.replace('sec-', '');
      pills.forEach(p => p.classList.toggle('active', p.dataset.cat === cat));
    }
  });
}, { threshold: 0.2, rootMargin: '-140px 0px -50% 0px' });
sections.forEach(s => scrollObs.observe(s));

// Shadow on sticky nav
window.addEventListener('scroll', () => {
  if (catNav) catNav.classList.toggle('shadowed', window.scrollY > 300);
});

// ── CART FUNCTIONS ──
function addItem(e, name, price) {
  e.stopPropagation();
  Cart.add({ item_name: name, price: price });
  updateFloatBtn();
  // Glow animation
  const card = e.target.closest('.mc');
  if (card) { card.classList.add('glow-pulse'); setTimeout(() => card.classList.remove('glow-pulse'), 600); }
  // Button feedback
  const btn = e.target;
  btn.classList.add('added');
  btn.textContent = '✓';
  setTimeout(() => { btn.classList.remove('added'); btn.textContent = '+'; }, 1200);
  showToast(name + ' added to cart!');
}

function openCart() { document.getElementById('cart-drawer').classList.add('open'); document.getElementById('cart-overlay').classList.add('open'); renderDrawer(); }
function closeCart() { document.getElementById('cart-drawer').classList.remove('open'); document.getElementById('cart-overlay').classList.remove('open'); }

function updateFloatBtn() {
  const n = Cart.count();
  document.getElementById('fc-badge').textContent = n;
  document.getElementById('float-cart').classList.toggle('visible', n > 0);
}

function renderDrawer() {
  const items = Cart.get(), body = document.getElementById('cd-body'), foot = document.getElementById('cd-foot');
  if (items.length === 0) { body.innerHTML = '<div class="cd-empty">Your cart is empty.<br/>Add items from the menu!</div>'; foot.style.display = 'none'; return; }
  foot.style.display = 'block';
  body.innerHTML = items.map(i => `
    <div class="cd-item">
      <div><div class="cd-item-name">${i.item_name}</div><div class="cd-item-price">Rs. ${i.price} each</div></div>
      <div class="cd-qty">
        <button onclick="cqty('${i.item_name.replace(/'/g, "\\'")}', -1)">&#8722;</button>
        <span>${i.quantity}</span>
        <button onclick="cqty('${i.item_name.replace(/'/g, "\\'")}', 1)">+</button>
      </div>
      <strong style="color:var(--orange);font-size:.88rem;min-width:60px;text-align:right">Rs. ${i.quantity * i.price}</strong>
      <button class="cd-del" onclick="cdel('${i.item_name.replace(/'/g, "\\'")}')">&#10005;</button>
    </div>
  `).join('') + `<div class="cd-total"><span>Total</span><strong>Rs. ${Cart.total()}</strong></div>`;
}

function cqty(name, d) {
  const items = Cart.get(), item = items.find(i => i.item_name === name);
  if (!item) return;
  item.quantity += d;
  if (item.quantity <= 0) Cart.remove(name); else Cart.save(items);
  updateFloatBtn(); renderDrawer();
}
function cdel(name) { Cart.remove(name); updateFloatBtn(); renderDrawer(); }

async function placeOrder() {
  const name = document.getElementById('cd-name').value.trim();
  const phone = document.getElementById('cd-phone').value.trim();
  const addr = document.getElementById('cd-addr').value.trim();
  const msg = document.getElementById('cd-msg');
  msg.className = 'cd-msg';
  if (!name) { msg.textContent = 'Please enter your name.'; msg.className = 'cd-msg bad'; return; }
  if (!phone) { msg.textContent = 'Please enter your phone.'; msg.className = 'cd-msg bad'; return; }
  if (!addr) { msg.textContent = 'Please enter your address.'; msg.className = 'cd-msg bad'; return; }
  if (Cart.count() === 0) { msg.textContent = 'Cart is empty!'; msg.className = 'cd-msg bad'; return; }
  const btn = document.querySelector('.cd-foot .btn');
  btn.textContent = 'Placing order...'; btn.disabled = true;
  try {
    const res = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({ name, phone, delivery_address: addr, items: Cart.get().map(i => ({ item_name: i.item_name, quantity: i.quantity, price: i.price })) })
    });
    localStorage.setItem('last_order', JSON.stringify({ id: res.data.id, name, phone, total: res.data.total_price }));
    Cart.clear(); updateFloatBtn();
    showOrderSuccess(res.data.id, res.data.total_price);
  } catch (e) {
    msg.textContent = e.message || 'Failed to place order.'; msg.className = 'cd-msg bad';
    btn.textContent = 'Place Order →'; btn.disabled = false;
  }
}

function showOrderSuccess(orderId, total) {
  document.getElementById('cart-drawer').innerHTML = `
    <style>.ss{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px 28px;text-align:center}
    .ss-ring{width:90px;height:90px;border-radius:50%;border:3px solid rgba(34,197,94,.3);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;animation:rp 2s ease infinite}
    @keyframes rp{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.4)}50%{box-shadow:0 0 0 16px rgba(34,197,94,0)}}
    .ss h3{font-family:'Playfair Display',serif;font-size:1.5rem;font-weight:900;color:#FFF5E4;margin-bottom:8px}
    .ss p{font-size:.85rem;color:#C8A882;line-height:1.6;margin-bottom:24px}
    .ss-id{background:rgba(255,106,0,.1);border:1px solid rgba(255,106,0,.25);border-radius:12px;padding:16px 24px;margin-bottom:24px}
    .ss-id span{display:block;font-size:.7rem;color:#7A5C3A;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
    .ss-id strong{font-family:'Playfair Display',serif;font-size:2rem;font-weight:900;color:#FF6A00}</style>
    <div class="ss">
      <div class="ss-ring"><span style="font-size:2.8rem">&#127869;</span></div>
      <h3>Order Placed!</h3>
      <p>We'll prepare your order right away!</p>
      <div class="ss-id"><span>Order ID</span><strong>#${orderId}</strong><div style="font-size:.85rem;color:#C8A882;margin-top:4px">Total: Rs. ${total}</div></div>
      <a href="track.html?id=${orderId}" class="btn btn-p">Track My Order</a>
      <button onclick="location.reload()" style="margin-top:14px;background:none;color:#7A5C3A;border:none;font-size:.82rem;cursor:pointer;text-decoration:underline">+ Place another order</button>
    </div>`;
}

// Init
updateFloatBtn();
