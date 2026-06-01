// ── MENU CATEGORIES & IMAGES ──
const SERVICE_CONFIG = {
  delivery: {
    label: 'Delivery',
    desc: 'Full menu available for home delivery',
    sections: null
  },
  takeaway: {
    label: 'Take Away',
    desc: 'Quick bites, rolls, chai & snacks — perfect for pickup',
    sections: ['rolls', 'burger', 'fries', 'wings', 'chai', 'beverage', 'paratha', 'sandwiches', 'kids-menu', 'side-items']
  },
  dinein: {
    label: 'Dine In',
    desc: 'Hearty mains, BBQ & grill — best enjoyed at our table',
    sections: ['karhai', 'tikka', 'boti', 'pizza', 'pasta', 'soup', 'salad', 'sandwiches', 'paratha', 'side-items']
  }
};

const CATEGORIES = [
  {
    id: 'karhai',
    label: '🍲 Karhai',
    desc: 'Rich, slow-cooked karahis made fresh every day',
    folder: 'karhai',
    images: [
      'IMG_5499.JPG','IMG_5510.JPG','IMG_5511.JPG','IMG_5512.JPG','IMG_5513.WEBP'
    ],
    names: ['Chicken Karahi','Mutton Karahi','Beef Karahi','Handi Karahi','Butter Karahi'],
    prices: [850, 1100, 950, 800, 900]
  },
  {
    id: 'burger',
    label: '🍔 Burgers',
    desc: 'Juicy, stacked burgers — loaded with flavour',
    folder: 'burger',
    images: [
      'IMG_5555.JPG','IMG_5556.JPG','IMG_5557.JPG','IMG_5558.JPG',
      'IMG_5559.JPG','IMG_5560.JPG','IMG_5561.JPG','IMG_5562.JPG'
    ],
    names: ['Zinger Burger','Crispy Chicken Burger','Double Patty Burger','BBQ Burger',
            'Spicy Burger','Cheese Burger','Club Burger','Special Burger'],
    prices: [350, 320, 480, 400, 370, 380, 420, 450]
  },
  {
    id: 'pizza',
    label: '🍕 Pizza',
    desc: 'Stone-baked pizzas with bold Pakistani twists',
    folder: 'pizza',
    images: [
      'Chicken-Fajita-1.webp','Kababish Pizza.webp','chicken supreme.webp',
      'creamy pizza.jpg','delight.png','images.jpg','kalzon.jpg',
      'sicilian-meatballs.webp','tikka pizza.jpg'
    ],
    names: ['Chicken Fajita Pizza','Kababish Pizza','Chicken Supreme','Creamy Pizza',
            'Delight Pizza','Margherita','Calzone','Sicilian Meatball','Tikka Pizza'],
    prices: [650, 600, 700, 580, 620, 500, 680, 750, 630]
  },
  {
    id: 'tikka',
    label: '🔥 Tikka',
    desc: 'Charcoal-grilled tikkas, smoky & tender',
    folder: 'tikka',
    images: ['IMG_5526.JPG','IMG_5527.JPG','IMG_5528.JPG'],
    names: ['Chicken Tikka','Seekh Tikka','Malai Tikka'],
    prices: [500, 450, 550]
  },
  {
    id: 'boti',
    label: '🍖 Boti',
    desc: 'Tender grilled boti pieces packed with spice',
    folder: 'boti',
    images: [
      'IMG_5530.JPG','IMG_5531.JPG','IMG_5532.JPG',
      'IMG_5533.JPG','IMG_5534.JPG','IMG_5535.JPG'
    ],
    names: ['Chicken Boti','Mutton Boti','Beef Boti','Reshmi Boti','Seekh Boti','Mixed Boti'],
    prices: [400, 550, 500, 420, 380, 480]
  },
  {
    id: 'rolls',
    label: '🌯 Rolls',
    desc: 'Hot, stuffed rolls — perfect street food bite',
    folder: 'rolls',
    images: [
      'IMG_5507.JPG','IMG_5519.JPG','IMG_5520.JPG','IMG_5521.JPG',
      'IMG_5522.JPG','IMG_5523.PNG','IMG_5524.JPG','IMG_5525.JPG'
    ],
    names: ['Chicken Roll','Seekh Roll','Beef Roll','Paratha Roll',
            'Veggie Roll','Special Roll','BBQ Roll','Club Roll'],
    prices: [180, 200, 220, 160, 150, 250, 230, 280]
  },
  {
    id: 'sandwiches',
    label: '🥪 Sandwiches',
    desc: 'Fresh, loaded sandwiches toasted to perfection',
    folder: 'sandwiches',
    images: ['IMG_5576.JPG','IMG_5577.JPG','IMG_5578.JPG'],
    names: ['Club Sandwich','Chicken Sandwich','Toasted Sandwich'],
    prices: [280, 250, 220]
  },
  {
    id: 'paratha',
    label: '🫓 Paratha',
    desc: 'Crispy, buttery parathas — a desi breakfast staple',
    folder: 'paratha',
    images: [
      'IMG_5515.JPG','IMG_5545.JPG','IMG_5546.JPG','IMG_5547.JPG','IMG_5548.JPG',
      'IMG_5549.JPG','IMG_5550.JPG','IMG_5551.JPG','IMG_5552.JPG','IMG_5553.JPG','IMG_5554.JPG'
    ],
    names: [
      'Plain Paratha','Aloo Paratha','Egg Paratha','Beef Paratha','Chicken Paratha',
      'Keema Paratha','Paneer Paratha','Butter Paratha','Mixed Paratha','Desi Paratha','Special Paratha'
    ],
    prices: [60, 120, 100, 180, 160, 200, 150, 80, 140, 90, 220]
  },
  {
    id: 'pasta',
    label: '🍝 Pasta',
    desc: 'Creamy & spicy pastas with a Pakistani soul',
    folder: 'pasta',
    images: ['IMG_5497.JPG','IMG_5498.JPG','IMG_5500.JPG'],
    names: ['Chicken Pasta','Creamy Pasta','Spicy Pasta'],
    prices: [350, 380, 360]
  },
  {
    id: 'fries',
    label: '🍟 Fries',
    desc: 'Golden, crispy fries — plain or loaded',
    folder: 'fries',
    images: [
      'IMG_5568.JPG','IMG_5569.JPG','IMG_5570.JPG','IMG_5571.JPG','IMG_5572.JPG'
    ],
    names: ['Plain Fries','Masala Fries','Loaded Fries','Cheese Fries','Spicy Fries'],
    prices: [150, 180, 250, 220, 200]
  },
  {
    id: 'wings',
    label: '🍗 Wings',
    desc: 'Crispy, saucy chicken wings — totally addictive',
    folder: 'wings',
    images: ['IMG_5502.JPG','IMG_5503.JPG','IMG_5504.JPG'],
    names: ['BBQ Wings','Buffalo Wings','Honey Garlic Wings'],
    prices: [400, 420, 450]
  },
  {
    id: 'chai',
    label: '☕ Chai',
    desc: 'The soul of every gathering — perfectly brewed',
    folder: 'chai',
    images: [
      'IMG_5536.JPG','IMG_5537.PNG','IMG_5538.JPG','IMG_5539.JPG',
      'IMG_5540.JPG','IMG_5541.JPG','IMG_5542.JPG','IMG_5543.JPG','IMG_5544.JPG'
    ],
    names: [
      'Doodh Patti','Kashmiri Chai','Karak Chai','Green Tea',
      'Cardamom Chai','Ginger Chai','Masala Chai','Black Tea','Mint Tea'
    ],
    prices: [60, 100, 80, 70, 80, 80, 90, 50, 70]
  },
  {
    id: 'beverage',
    label: '🥤 Beverages',
    desc: 'Cool, refreshing drinks for every meal',
    folder: 'beverage',
    images: [
      'IMG_5583.JPG','IMG_5584.JPG','IMG_5585.JPG','IMG_5586.JPG','IMG_5587.JPG'
    ],
    names: ['Mango Shake','Cold Coffee','Lemonade','Rooh Afza','Soft Drink'],
    prices: [180, 200, 120, 100, 80]
  },
  {
    id: 'soup',
    label: '🍜 Soup',
    desc: 'Warm, hearty soups for every season',
    folder: 'soup',
    images: ['IMG_5573.JPG','IMG_5574.JPG'],
    names: ['Chicken Corn Soup','Hot & Sour Soup'],
    prices: [200, 220]
  },
  {
    id: 'salad',
    label: '🥗 Salad',
    desc: 'Fresh, crunchy salads — light & healthy',
    folder: 'salad',
    images: ['IMG_5582.JPG'],
    names: ['Garden Salad'],
    prices: [150]
  },
  {
    id: 'kids-menu',
    label: '🧒 Kids Menu',
    desc: 'Fun, tasty bites made just for little ones',
    folder: 'kids menu',
    images: [
      'IMG_5563.JPG','IMG_5564.JPG','IMG_5565.JPG','IMG_5566.JPG','IMG_5567.JPG'
    ],
    names: ['Mini Burger','Nuggets','Kids Pasta','Mini Pizza','Kids Deal'],
    prices: [200, 180, 220, 250, 350]
  },
  {
    id: 'side-items',
    label: '🍱 Side Items',
    desc: 'Perfect accompaniments to your main meal',
    folder: 'side items',
    images: [
      'IMG_5516.WEBP','IMG_5517.JPG','IMG_5579.JPG','IMG_5580.JPG','IMG_5581.JPG'
    ],
    names: ['Raita','Naan','Garlic Naan','Tandoori Roti','Salted Butter'],
    prices: [60, 30, 50, 25, 40]
  }
];

let MENU_DATA = [];

function staticToMenuData() {
  return CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    desc: cat.desc,
    folder: cat.folder,
    items: cat.images.map((imgFile, i) => ({
      name: cat.names[i] || imgFile,
      price: cat.prices[i] || 0,
      image: `images/${cat.folder}/${imgFile}`,
    })),
  }));
}

async function loadMenuData() {
  const service = new URLSearchParams(location.search).get('service') || '';
  try {
    const path = service ? `/menu?service=${encodeURIComponent(service)}` : '/menu';
    const res = await apiFetch(path);
    MENU_DATA = res.data.categories;
    if (!MENU_DATA.length) MENU_DATA = staticToMenuData();
  } catch (_) {
    MENU_DATA = staticToMenuData();
    if (service) applyStaticServiceFilter(service);
  }
}

function applyStaticServiceFilter(service) {
  const cfg = SERVICE_CONFIG[service];
  if (!cfg?.sections) return;
  MENU_DATA = MENU_DATA.filter((c) => cfg.sections.includes(c.id));
}

function buildMenu() {
  const main = document.getElementById('menu-main');
  const catNavIn = document.getElementById('catNav-in');
  main.innerHTML = '';
  catNavIn.innerHTML = '';

  if (!MENU_DATA.length) {
    main.innerHTML = '<p class="no-data" style="text-align:center;padding:48px;color:var(--text-muted)">Menu unavailable. Start the backend server.</p>';
    return;
  }

  MENU_DATA.forEach((cat, catIdx) => {
    const pill = document.createElement('button');
    pill.className = 'cat-pill' + (catIdx === 0 ? ' active' : '');
    pill.dataset.cat = cat.id;
    pill.textContent = cat.label;
    catNavIn.appendChild(pill);

    const sec = document.createElement('section');
    sec.className = 'cat-section';
    sec.id = 'sec-' + cat.id;
    sec.innerHTML = `
      <div class="cat-banner rev">
        <h2>${cat.label}</h2>
        <p>${cat.desc}</p>
      </div>
      <div class="menu-grid" id="grid-${cat.id}"></div>`;
    main.appendChild(sec);

    const grid = sec.querySelector('#grid-' + cat.id);
    (cat.items || []).forEach((item, i) => {
      grid.appendChild(buildCard({
        name: item.name,
        price: item.price,
        img: item.image || `images/${cat.folder}/${item.image_file || ''}`,
      }, i * 0.06));
    });
  });

  setupReveal();
  setupPillScroll();
  setupSectionHighlight();
  showServiceBanner();
  updateFloatBtn();
}

function showServiceBanner() {
  const service = new URLSearchParams(location.search).get('service');
  if (!service || !SERVICE_CONFIG[service]) return;
  const cfg = SERVICE_CONFIG[service];
  const banner = document.getElementById('service-banner');
  if (!banner) return;
  banner.classList.add('show');
  banner.innerHTML = `
    <div><strong>${cfg.label}</strong><br/><span>${cfg.desc}</span></div>
    <a href="menu.html">View full menu</a>`;
  const first = MENU_DATA[0];
  if (first && !location.hash) {
    setTimeout(() => {
      const sec = document.getElementById('sec-' + first.id);
      if (sec) window.scrollTo({ top: sec.offsetTop - 140, behavior: 'smooth' });
    }, 400);
  }
}

// ── BUILD A SINGLE CARD ──
function buildCard(item, delay) {
  const d = document.createElement('div');
  d.className = 'mc rev';
  d.style.setProperty('--d', delay + 's');
  d.innerHTML = `
    <div class="mc-img-wrap">
      <img src="${item.img}" alt="${item.name}" loading="lazy" decoding="async" onerror="this.parentElement.classList.add('img-fail')"/>
      <button class="mc-add" aria-label="Add ${item.name}" onclick="addItem(event,'${item.name.replace(/'/g, "\\'")}',${item.price})">+</button>
    </div>
    <div class="mc-body">
      <div class="mc-name">${item.name}</div>
      <div class="mc-footer">
        <div class="mc-price"><strong>Rs. ${item.price}</strong></div>
      </div>
    </div>`;

  if (window.matchMedia('(hover: hover)').matches) {
    d.addEventListener('mousemove', e => {
      const r = d.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      d.style.transform = `perspective(800px) rotateY(${dx * 4}deg) rotateX(${-dy * 4}deg) translateY(-4px)`;
    });
    d.addEventListener('mouseleave', () => d.style.transform = '');
  }
  return d;
}

// ── SCROLL REVEAL ──
function setupReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('done'); obs.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.rev:not(.done)').forEach(el => obs.observe(el));
}

// ── CATEGORY PILL CLICK → SCROLL ──
function setupPillScroll() {
  const pills = document.querySelectorAll('.cat-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      pill.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      const sec = document.getElementById('sec-' + pill.dataset.cat);
      if (sec) window.scrollTo({ top: sec.offsetTop - 140, behavior: 'smooth' });
    });
  });
}

// ── HIGHLIGHT ACTIVE PILL ON SCROLL (section closest below nav) ──
function setupSectionHighlight() {
  const pills = document.querySelectorAll('.cat-pill');
  const offset = 160;
  let lastCat = '';

  function visibleSections() {
    return [...document.querySelectorAll('.cat-section')].filter(s => s.style.display !== 'none');
  }

  function setActive(cat) {
    if (cat === lastCat) return;
    lastCat = cat;
    pills.forEach(p => p.classList.toggle('active', p.dataset.cat === cat));
    const active = document.querySelector('.cat-pill.active');
    if (active && window.matchMedia('(max-width:768px)').matches) {
      active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }

  function updateActivePill() {
    const sections = visibleSections();
    if (!sections.length) return;
    let current = sections[0].id.replace('sec-', '');
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= offset) current = sec.id.replace('sec-', '');
    }
    setActive(current);
  }

  window.addEventListener('scroll', updateActivePill, { passive: true });
  updateActivePill();
}

// ── STICKY SHADOW ──
window.addEventListener('scroll', () => {
  const catNav = document.getElementById('catNav');
  if (catNav) catNav.classList.toggle('shadowed', window.scrollY > 300);
});

// ── CART FUNCTIONS ──
function addItem(e, name, price) {
  e.stopPropagation();
  Cart.add({ item_name: name, price: price });
  updateFloatBtn();
  const card = e.target.closest('.mc');
  if (card) { card.classList.add('glow-pulse'); setTimeout(() => card.classList.remove('glow-pulse'), 600); }
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

// ── INIT ──
(async function initMenu() {
  const main = document.getElementById('menu-main');
  if (main) main.innerHTML = '<p style="text-align:center;padding:80px;color:var(--text-muted)">Loading menu…</p>';
  await loadMenuData();
  buildMenu();
})();
