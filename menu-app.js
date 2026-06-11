/* ─────────────────────────────────────────────────────────────
   MENU-APP.JS  –  Chai Pe Charcha
   • Horizontal sticky category bar
   • Premium card builder (image + name + desc + price + CTA)
   • Customization modal (Half/Full, Small/Medium/Large, etc.)
   • Cart system (variant-aware keying, no collisions)
   • Order placement with timeout guard (no infinite loading)
───────────────────────────────────────────────────────────── */

// ── SERVICE CONFIG ──────────────────────────────────────────
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

// ── ITEM CUSTOMIZATION OPTIONS ───────────────────────────────
// Key = category id, value = array of { label, priceOffset }
// Items in categories NOT listed here → no modal, add directly.
const CUSTOMIZATION_MAP = {
  karhai: [
    { label: 'Half',   priceOffset: 0 },
    { label: 'Full',   priceOffset: 400 }
  ],
  pasta: [
    { label: 'Half',   priceOffset: 0 },
    { label: 'Full',   priceOffset: 150 }
  ],
  pizza: [
    { label: 'Small',  priceOffset: 0 },
    { label: 'Medium', priceOffset: 150 },
    { label: 'Large',  priceOffset: 300 }
  ],
  tikka: [
    { label: 'Leg',   priceOffset: 0 },
    { label: 'Chest', priceOffset: 50 }
  ],
  boti: [
    { label: 'Single', priceOffset: 0 },
    { label: 'Full',   priceOffset: 250 }
  ],
  wings: [
    { label: 'Leg',   priceOffset: 0 },
    { label: 'Chest', priceOffset: 50 }
  ]
};

// ── STATIC CATEGORY DATA ─────────────────────────────────────
const CATEGORIES = [
  {
    id: 'karhai', label: ' Karhai',
    desc: 'Rich, slow-cooked karahis made fresh every day',
    folder: 'karhai',
    images: ['IMG_5499.JPG','IMG_5510.JPG','IMG_5511.JPG','IMG_5512.JPG','IMG_5513.WEBP'],
    names:  ['Chicken Karahi','Mutton Karahi','Beef Karahi','Handi Karahi','Butter Karahi'],
    prices: [850, 1100, 950, 800, 900]
  },
  {
    id: 'burger', label: ' Burgers',
    desc: 'Juicy, stacked burgers — loaded with flavour',
    folder: 'burger',
    images: ['IMG_5555.JPG','IMG_5556.JPG','IMG_5557.JPG','IMG_5558.JPG','IMG_5559.JPG','IMG_5560.JPG','IMG_5561.JPG','IMG_5562.JPG'],
    names:  ['Zinger Burger','Crispy Chicken Burger','Double Patty Burger','BBQ Burger','Spicy Burger','Cheese Burger','Club Burger','Special Burger'],
    prices: [350, 320, 480, 400, 370, 380, 420, 450]
  },
  {
    id: 'pizza', label: ' Pizza',
    desc: 'Stone-baked pizzas with bold Pakistani twists',
    folder: 'pizza',
    images: ['Chicken-Fajita-1.webp','Kababish Pizza.webp','chicken supreme.webp','creamy pizza.jpg','delight.png','images.jpg','kalzon.jpg','sicilian-meatballs.webp','tikka pizza.jpg'],
    names:  ['Chicken Fajita Pizza','Kababish Pizza','Chicken Supreme','Creamy Pizza','Delight Pizza','Margherita','Calzone','Sicilian Meatball','Tikka Pizza'],
    prices: [650, 600, 700, 580, 620, 500, 680, 750, 630]
  },
  {
    id: 'tikka', label: ' Tikka',
    desc: 'Charcoal-grilled tikkas, smoky & tender',
    folder: 'tikka',
    images: ['IMG_5526.JPG','IMG_5527.JPG','IMG_5528.JPG'],
    names:  ['Chicken Tikka','Seekh Tikka','Malai Tikka'],
    prices: [500, 450, 550]
  },
  {
    id: 'boti', label: ' Boti',
    desc: 'Tender grilled boti pieces packed with spice',
    folder: 'boti',
    images: ['IMG_5530.JPG','IMG_5531.JPG','IMG_5532.JPG','IMG_5533.JPG','IMG_5534.JPG','IMG_5535.JPG'],
    names:  ['Chicken Boti','Mutton Boti','Beef Boti','Reshmi Boti','Seekh Boti','Mixed Boti'],
    prices: [400, 550, 500, 420, 380, 480]
  },
  {
    id: 'rolls', label: ' Rolls',
    desc: 'Hot, stuffed rolls — perfect street food bite',
    folder: 'rolls',
    images: ['IMG_5507.JPG','IMG_5519.JPG','IMG_5520.JPG','IMG_5521.JPG','IMG_5522.JPG','IMG_5523.PNG','IMG_5524.JPG','IMG_5525.JPG'],
    names:  ['Chicken Roll','Seekh Roll','Beef Roll','Paratha Roll','Veggie Roll','Special Roll','BBQ Roll','Club Roll'],
    prices: [180, 200, 220, 160, 150, 250, 230, 280]
  },
  {
    id: 'sandwiches', label: ' Sandwiches',
    desc: 'Fresh, loaded sandwiches toasted to perfection',
    folder: 'sandwiches',
    images: ['IMG_5576.JPG','IMG_5577.JPG','IMG_5578.JPG'],
    names:  ['Club Sandwich','Chicken Sandwich','Toasted Sandwich'],
    prices: [280, 250, 220]
  },
  {
    id: 'paratha', label: '🫓 Paratha',
    desc: 'Crispy, buttery parathas — a desi breakfast staple',
    folder: 'paratha',
    images: ['IMG_5515.JPG','IMG_5545.JPG','IMG_5546.JPG','IMG_5547.JPG','IMG_5548.JPG','IMG_5549.JPG','IMG_5550.JPG','IMG_5551.JPG','IMG_5552.JPG','IMG_5553.JPG','IMG_5554.JPG'],
    names:  ['Plain Paratha','Aloo Paratha','Egg Paratha','Beef Paratha','Chicken Paratha','Keema Paratha','Paneer Paratha','Butter Paratha','Mixed Paratha','Desi Paratha','Special Paratha'],
    prices: [60, 120, 100, 180, 160, 200, 150, 80, 140, 90, 220]
  },
  {
    id: 'pasta', label: ' Pasta',
    desc: 'Creamy & spicy pastas with a Pakistani soul',
    folder: 'pasta',
    images: ['IMG_5497.JPG','IMG_5498.JPG','IMG_5500.JPG'],
    names:  ['Chicken Pasta','Creamy Pasta','Spicy Pasta'],
    prices: [350, 380, 360]
  },
  {
    id: 'fries', label: ' Fries',
    desc: 'Golden, crispy fries — plain or loaded',
    folder: 'fries',
    images: ['IMG_5568.JPG','IMG_5569.JPG','IMG_5570.JPG','IMG_5571.JPG','IMG_5572.JPG'],
    names:  ['Plain Fries','Masala Fries','Loaded Fries','Cheese Fries','Spicy Fries'],
    prices: [150, 180, 250, 220, 200]
  },
  {
    id: 'wings', label: ' Wings',
    desc: 'Crispy, saucy chicken wings — totally addictive',
    folder: 'wings',
    images: ['IMG_5502.JPG','IMG_5503.JPG','IMG_5504.JPG'],
    names:  ['BBQ Wings','Buffalo Wings','Honey Garlic Wings'],
    prices: [400, 420, 450]
  },
  {
    id: 'chai', label: ' Chai',
    desc: 'The soul of every gathering — perfectly brewed',
    folder: 'chai',
    images: ['IMG_5536.JPG','IMG_5537.PNG','IMG_5538.JPG','IMG_5539.JPG','IMG_5540.JPG','IMG_5541.JPG','IMG_5542.JPG','IMG_5543.JPG','IMG_5544.JPG'],
    names:  ['Doodh Patti','Kashmiri Chai','Karak Chai','Green Tea','Cardamom Chai','Ginger Chai','Masala Chai','Black Tea','Mint Tea'],
    prices: [60, 100, 80, 70, 80, 80, 90, 50, 70]
  },
  {
    id: 'beverage', label: ' Beverages',
    desc: 'Cool, refreshing drinks for every meal',
    folder: 'beverage',
    images: ['IMG_5583.JPG','IMG_5584.JPG','IMG_5585.JPG','IMG_5586.JPG','IMG_5587.JPG'],
    names:  ['Mango Shake','Cold Coffee','Lemonade','Rooh Afza','Soft Drink'],
    prices: [180, 200, 120, 100, 80]
  },
  {
    id: 'soup', label: ' Soup',
    desc: 'Warm, hearty soups for every season',
    folder: 'soup',
    images: ['IMG_5573.JPG','IMG_5574.JPG'],
    names:  ['Chicken Corn Soup','Hot & Sour Soup'],
    prices: [200, 220]
  },
  {
    id: 'kids-menu', label: ' Kids Menu',
    desc: 'Fun, tasty bites made just for little ones',
    folder: 'kids menu',
    images: ['IMG_5563.JPG','IMG_5564.JPG','IMG_5565.JPG','IMG_5566.JPG','IMG_5567.JPG'],
    names:  ['Mini Burger','Nuggets','Kids Pasta','Mini Pizza','Kids Deal'],
    prices: [200, 180, 220, 250, 350]
  },
  {
    id: 'salad', label: ' Salad',
    desc: 'Fresh, crunchy salads — light & healthy',
    folder: 'salad',
    images: ['IMG_5582.JPG'],
    names:  ['Garden Salad'],
    prices: [150]
  },
  {
    id: 'side-items', label: ' Side Items',
    desc: 'Perfect accompaniments to your main meal',
    folder: 'side items',
    images: ['IMG_5516.WEBP','IMG_5517.JPG','IMG_5579.JPG','IMG_5580.JPG','IMG_5581.JPG'],
    names:  ['Raita','Naan','Garlic Naan','Tandoori Roti','Salted Butter'],
    prices: [60, 30, 50, 25, 40]
  }
];

// ── BACKEND WAKE PING (fire-and-forget) ────────────────────
// Wakes Render free-tier backend in the background without blocking UI.
(function pingBackend() {
  const base = (typeof getApiBase === 'function') ? getApiBase() : null;
  if (!base || base.includes('localhost')) return;
  fetch(base.replace('/api', '/'), { method: 'GET', mode: 'no-cors' }).catch(() => {});
})();

// ── MENU DATA ────────────────────────────────────────────────
let MENU_DATA = [];

function staticToMenuData() {
  return CATEGORIES.map(cat => ({
    id:     cat.id,
    label:  cat.label,
    desc:   cat.desc,
    folder: cat.folder,
    items:  cat.images.map((imgFile, i) => ({
      name:  cat.names[i] || imgFile,
      price: cat.prices[i] || 0,
      image: `images/${cat.folder}/${imgFile}`,
      desc:  cat.desc   // use category desc as fallback item description
    }))
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
  MENU_DATA = MENU_DATA.filter(c => cfg.sections.includes(c.id));
}

// ── SHARED INTERSECTION OBSERVER (reused across renders) ──────
let _revealObserver = null;
function getRevealObserver() {
  if (!_revealObserver) {
    _revealObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('done'); _revealObserver.unobserve(e.target); }
      });
    }, { threshold: 0.07 });
  }
  return _revealObserver;
}

// ── SKELETON LOADING ─────────────────────────────────────────
function buildSkeletonHTML(count = 6) {
  const card = `
    <div class="skeleton-card">
      <div class="skeleton-img"></div>
      <div class="skeleton-body">
        <div class="skeleton-line sl-title"></div>
        <div class="skeleton-line sl-desc"></div>
        <div class="skeleton-line sl-footer"></div>
      </div>
    </div>`;
  return `
    <div style="padding:32px 40px 0">
      <div class="skeleton-grid">${card.repeat(count)}</div>
    </div>`;
}

// ── BUILD MENU — Progressive batched rendering ───────────────
function buildMenu() {
  const main       = document.getElementById('menu-main');
  const catNavIn   = document.getElementById('catNav-in');
  main.innerHTML   = '';
  catNavIn.innerHTML = '';

  if (!MENU_DATA.length) {
    main.innerHTML = '<p style="text-align:center;padding:64px;color:var(--text-muted)">Menu unavailable. Start the backend server.</p>';
    return;
  }

  const isMobile = window.innerWidth <= 768;

  // Build all category pills immediately (lightweight)
  MENU_DATA.forEach((cat, catIdx) => {
    const pill = document.createElement('button');
    pill.className   = 'cat-pill' + (catIdx === 0 ? ' active' : '');
    pill.dataset.cat = cat.id;
    pill.textContent = cat.label;
    catNavIn.appendChild(pill);
  });

  // --- Render first category immediately (above the fold) ---
  const renderCategory = (cat, catIdx) => {
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
      const imgSrc = item.image || `images/${cat.folder}/${item.image_file || ''}`;
      // Mobile: cap stagger at 0.25s with smaller step; Desktop: original behaviour
      const maxDelay  = isMobile ? 0.25 : 0.5;
      const stepDelay = isMobile ? 0.04 : 0.055;
      const delay = Math.min(i * stepDelay, maxDelay);
      grid.appendChild(buildCard({
        id:       item.id ?? null,
        name:     item.name,
        price:    item.price,
        img:      imgSrc,
        desc:     item.desc || cat.desc || '',
        catId:    cat.id,
        variants: item.variants && item.variants.length ? item.variants : null
      }, delay));
    });
  };

  // Render the first category right away
  renderCategory(MENU_DATA[0], 0);

  // Schedule remaining categories progressively
  // requestIdleCallback fires when the browser is idle between frames
  const scheduleIdle = (fn) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(fn, { timeout: 400 });
    } else {
      setTimeout(fn, 50);
    }
  };

  let idx = 1;
  const renderNext = () => {
    if (idx >= MENU_DATA.length) {
      // All categories rendered — set up observers
      setupReveal();
      setupPillScroll();
      setupSectionHighlight();
      showServiceBanner();
      updateFloatBtn();
      return;
    }
    // Render a batch of categories per idle frame
    const batchSize = isMobile ? 1 : 2;
    const end = Math.min(idx + batchSize, MENU_DATA.length);
    for (; idx < end; idx++) {
      renderCategory(MENU_DATA[idx], idx);
    }
    scheduleIdle(renderNext);
  };

  scheduleIdle(renderNext);

  // Set up pill scroll immediately after first paint
  setupPillScroll();
  setupReveal();
  showServiceBanner();
  updateFloatBtn();
}

// ── BUILD SINGLE CARD ────────────────────────────────────────
// SECURITY: all DB/user strings are escaped, and the add handler is attached
// via addEventListener (no inline onclick string-building → no XSS surface).
function buildCard(item, delay) {
  const d = document.createElement('div');
  d.className = 'mc rev';
  d.style.setProperty('--d', delay + 's');

  const shortDesc = (item.desc || '').split('.')[0].trim();
  const nameEsc   = escapeHtml(item.name);

  d.innerHTML = `
    <div class="mc-img-wrap">
      <img src="${escapeHtml(item.img)}"
           alt="${nameEsc}"
           width="400"
           height="300"
           loading="lazy"
           decoding="async"
           onerror="this.parentElement.classList.add('img-fail')"/>
    </div>
    <div class="mc-body">
      <div class="mc-name">${nameEsc}</div>
      ${shortDesc ? `<div class="mc-desc">${escapeHtml(shortDesc)}</div>` : ''}
      <div class="mc-footer">
        <div class="mc-price"><strong>Rs. ${Number(item.price) || 0}</strong></div>
        <button class="mc-add-btn" aria-label="Add ${nameEsc} to cart">+</button>
      </div>
    </div>`;

  // Attach handler via listener (no inline onclick). Item data lives in closure.
  d.querySelector('.mc-add-btn').addEventListener('click', (e) => handleAddClick(e, item));

  // Only the “+” button triggers add-to-cart — tapping the card does nothing.

  // 3-D tilt on hover — desktop with real mouse only
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    d.addEventListener('mousemove', e => {
      const r  = d.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
      d.style.transform = `perspective(800px) rotateY(${dx*4}deg) rotateX(${-dy*4}deg) translateY(-4px)`;
    });
    d.addEventListener('mouseleave', () => d.style.transform = '');
  }
  return d;
}

// ── HANDLE ADD CLICK ─────────────────────────────────────────
// Variants come from the DATABASE (item.variants). Falls back to the static
// CUSTOMIZATION_MAP only in offline mode. Normalizes to {label, priceOffset}.
function handleAddClick(e, item) {
  if (e && e.stopPropagation) e.stopPropagation();

  let options = null;
  if (item.variants && item.variants.length) {
    options = item.variants.map(v => ({
      label: v.label,
      priceOffset: Number(v.price_offset ?? v.priceOffset ?? 0)
    }));
  } else if (CUSTOMIZATION_MAP[item.catId]) {
    options = CUSTOMIZATION_MAP[item.catId];
  }

  if (options && options.length) {
    openCustomizeModal({ id: item.id, name: item.name, price: item.price,
                         catId: item.catId, imgSrc: item.img }, options);
  } else {
    Cart.add({ item_id: item.id, item_name: item.name, price: Number(item.price) || 0 });
    updateFloatBtn();
    const btn = e && e.target && e.target.closest('.mc-add-btn');
    if (btn) {
      btn.textContent = '✓';
      btn.classList.add('added');
      const card = btn.closest('.mc');
      if (card) { card.classList.add('glow-pulse'); setTimeout(() => card.classList.remove('glow-pulse'), 700); }
      setTimeout(() => { btn.classList.remove('added'); btn.textContent = '+'; }, 1300);
    }
    showToast(`${item.name} added to cart! 🛒`);
  }
}

// ── CUSTOMIZATION MODAL ──────────────────────────────────────
let _modalItem    = null;
let _modalOptions = [];
let _selectedOpt  = null;

function openCustomizeModal(item, options) {
  _modalItem    = item;
  _modalOptions = options;
  _selectedOpt  = null;

  // Build / reuse modal DOM
  let backdrop = document.getElementById('cust-modal-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id        = 'cust-modal-backdrop';
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal-box" id="cust-modal-box" role="dialog" aria-modal="true" aria-label="Customize item">
        <div class="modal-img-wrap" id="cust-img-wrap">
          <img id="cust-img" src="" alt=""/>
          <button class="modal-close" id="cust-close" aria-label="Close">✕</button>
        </div>
        <div class="modal-content">
          <div class="modal-title"  id="cust-title"></div>
          <div class="modal-base-price" id="cust-base"></div>
          <div class="modal-section-label">Choose an option</div>
          <div class="modal-options" id="cust-options"></div>
          <div class="modal-price-display">
            <span class="modal-price-label">Total Price</span>
            <span class="modal-price-value" id="cust-price-val">—</span>
          </div>
          <button class="modal-add-btn" id="cust-add-btn" disabled>
            🛒 Select an option to continue
          </button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);

    // Close on backdrop click
    backdrop.addEventListener('click', e => {
      if (e.target === backdrop) closeCustomizeModal();
    });
    document.getElementById('cust-close').addEventListener('click', closeCustomizeModal);

    // Stop propagation inside box
    document.getElementById('cust-modal-box').addEventListener('click', e => e.stopPropagation());

    // Add to cart action
    document.getElementById('cust-add-btn').addEventListener('click', confirmCustomizeAdd);
  }

  // Populate content
  const img   = document.getElementById('cust-img');
  const wrap  = document.getElementById('cust-img-wrap');
  img.src     = item.imgSrc || '';
  img.alt     = item.name;
  wrap.classList.remove('img-fail');
  img.onerror = () => wrap.classList.add('img-fail');

  document.getElementById('cust-title').textContent = item.name;
  document.getElementById('cust-base').textContent  = `Base price: Rs. ${item.price}`;
  document.getElementById('cust-price-val').textContent = '—';
  document.getElementById('cust-add-btn').disabled  = true;
  document.getElementById('cust-add-btn').textContent = '🛒 Select an option to continue';

  // Build option chips
  const optContainer = document.getElementById('cust-options');
  optContainer.innerHTML = '';
  options.forEach((opt, idx) => {
    const finalPrice = item.price + opt.priceOffset;
    const chip = document.createElement('div');
    chip.className = 'modal-option';
    chip.dataset.idx = idx;
    chip.innerHTML = `
      <span class="modal-option-name">${opt.label}</span>
      <span class="modal-option-price">Rs. ${finalPrice}</span>`;
    chip.addEventListener('click', () => selectOption(idx));
    optContainer.appendChild(chip);
  });

  // Show modal
  backdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function selectOption(idx) {
  _selectedOpt = idx;
  const opt   = _modalOptions[idx];
  const price = _modalItem.price + opt.priceOffset;

  // Update chip selection
  document.querySelectorAll('#cust-options .modal-option').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });

  // Update price display
  document.getElementById('cust-price-val').textContent = `Rs. ${price}`;

  // Enable add button
  const btn = document.getElementById('cust-add-btn');
  btn.disabled     = false;
  btn.textContent  = `🛒 Add to Cart — Rs. ${price}`;
}

function confirmCustomizeAdd() {
  if (_selectedOpt === null || !_modalItem) return;
  const opt   = _modalOptions[_selectedOpt];
  const price = _modalItem.price + opt.priceOffset;
  const name  = `${_modalItem.name} (${opt.label})`;

  Cart.add({ item_id: _modalItem.id, item_name: name, variant: opt.label, price });
  updateFloatBtn();
  showToast(`${name} added to cart! 🛒`);
  closeCustomizeModal();
}

function closeCustomizeModal() {
  const backdrop = document.getElementById('cust-modal-backdrop');
  if (backdrop) backdrop.classList.remove('open');
  document.body.style.overflow = '';
  _modalItem    = null;
  _selectedOpt  = null;
}

// ── SCROLL REVEAL ────────────────────────────────────────────
function setupReveal() {
  const obs = getRevealObserver();
  document.querySelectorAll('.rev:not(.done)').forEach(el => obs.observe(el));
}

// ── CATEGORY PILL CLICK → SMOOTH SCROLL ─────────────────────
function setupPillScroll() {
  const NAV_OFFSET = 76 + 52; // navbar + cat-nav height

  document.querySelectorAll('.cat-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.cat-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      // Scroll pill into view horizontally
      pill.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
      // Scroll page to section
      const sec = document.getElementById('sec-' + pill.dataset.cat);
      if (sec) {
        const top = sec.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
}

// ── ACTIVE PILL ON SCROLL — throttled via rAF ────────────────
function setupSectionHighlight() {
  const OFFSET  = 140;
  let lastCat   = '';
  let rafPending = false;

  function setActive(cat) {
    if (cat === lastCat) return;
    lastCat = cat;
    document.querySelectorAll('.cat-pill').forEach(p =>
      p.classList.toggle('active', p.dataset.cat === cat)
    );
    const active = document.querySelector('.cat-pill.active');
    if (active) active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
  }

  function updateActivePill() {
    rafPending = false;
    const sections = [...document.querySelectorAll('.cat-section')]
      .filter(s => s.style.display !== 'none');
    if (!sections.length) return;
    let current = sections[0].id.replace('sec-', '');
    for (const sec of sections) {
      if (sec.getBoundingClientRect().top <= OFFSET) current = sec.id.replace('sec-', '');
    }
    setActive(current);
  }

  window.addEventListener('scroll', () => {
    // Throttle: only queue one rAF at a time
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateActivePill);
    }
  }, { passive: true });

  updateActivePill();
}

// ── STICKY SHADOW ────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const catNav = document.getElementById('catNav');
  if (catNav) catNav.classList.toggle('shadowed', window.scrollY > 200);
}, { passive: true });

// ── CART ─────────────────────────────────────────────────────
function openCart()  {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  renderDrawer();
}
function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
}

function updateFloatBtn() {
  const n = Cart.count();
  document.getElementById('fc-badge').textContent = n;
  document.getElementById('float-cart').classList.toggle('visible', n > 0);
}

function renderDrawer() {
  const items = Cart.get();
  const body  = document.getElementById('cd-body');
  const foot  = document.getElementById('cd-foot');

  if (!items.length) {
    body.innerHTML = `
      <div class="cd-empty">
        <div class="cd-empty-icon">🛒</div>
        Your cart is empty.<br/>Add something delicious!
      </div>`;
    foot.style.display = 'none';
    return;
  }

  foot.style.display = 'block';

  const total = Cart.total();
  body.innerHTML = items.map((item, idx) => {
    const nameEsc = escapeHtml(item.item_name);
    return `
      <div class="cd-item">
        <div class="cd-item-info">
          <div class="cd-item-name">${nameEsc}</div>
          <div class="cd-item-price">Rs. ${Number(item.price) || 0} each</div>
        </div>
        <div class="cd-qty">
          <button data-cq="${idx}" data-d="-1" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button data-cq="${idx}" data-d="1"  aria-label="Increase quantity">+</button>
        </div>
        <div class="cd-item-subtotal">Rs. ${item.quantity * item.price}</div>
        <button class="cd-del" data-cdel="${idx}" aria-label="Remove item">✕</button>
      </div>`;
  }).join('') +
  `<div class="cd-total"><span>Total</span><strong>Rs. ${total}</strong></div>`;

  // Wire quantity/delete via listeners (no inline onclick → no injection).
  body.querySelectorAll('[data-cq]').forEach(btn =>
    btn.addEventListener('click', () => {
      const it = Cart.get()[+btn.dataset.cq];
      if (it) cqty(it.item_name, +btn.dataset.d);
    }));
  body.querySelectorAll('[data-cdel]').forEach(btn =>
    btn.addEventListener('click', () => {
      const it = Cart.get()[+btn.dataset.cdel];
      if (it) cdel(it.item_name);
    }));
}

// ── CART ACTIONS ─────────────────────────────────────────────
function cqty(name, delta) {
  const items = Cart.get();
  const item  = items.find(i => i.item_name === name);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) Cart.remove(name);
  else Cart.save(items);
  updateFloatBtn();
  renderDrawer();
}

function cdel(name) {
  Cart.remove(name);
  updateFloatBtn();
  renderDrawer();
}

// ── PLACE ORDER ──────────────────────────────────────────────
async function placeOrder() {
  const nameVal  = (document.getElementById('cd-name').value  || '').trim();
  const phoneVal = (document.getElementById('cd-phone').value || '').trim();
  const addrVal  = (document.getElementById('cd-addr').value  || '').trim();
  const msg      = document.getElementById('cd-msg');
  const btn      = document.getElementById('cd-place-btn');

  // Reset message
  msg.className   = 'cd-msg';
  msg.textContent = '';

  // Validation
  if (!nameVal)  { showMsg(msg, 'Please enter your name.',    'bad'); return; }
  if (!phoneVal) { showMsg(msg, 'Please enter your phone number.', 'bad'); return; }
  if (!addrVal)  { showMsg(msg, 'Please enter your delivery address.', 'bad'); return; }
  if (Cart.count() === 0) { showMsg(msg, 'Your cart is empty!', 'bad'); return; }

  // Build payload: send item_id + variant + quantity ONLY.
  // The server looks up the real price from the DB — the client never sets price.
  const cartItems = Cart.get();
  const validItems = cartItems
    .filter(i => i && i.item_id != null && typeof i.quantity === 'number')
    .map(i => ({
      item_id:  i.item_id,
      variant:  i.variant || null,
      quantity: Math.max(1, Math.floor(i.quantity))
    }));

  if (!validItems.length) {
    showMsg(msg, 'Your cart could not be verified. Please refresh the menu and re-add items.', 'bad');
    return;
  }

  const service = new URLSearchParams(location.search).get('service') || 'delivery';

  // Disable button immediately
  btn.disabled    = true;
  btn.textContent = '⏳ Placing order...';

  // Timeout guard — 12 seconds max
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Request timed out. Please check your connection and try again.')), 12000)
  );

  try {
    const res = await Promise.race([
      apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({
          name:             nameVal,
          phone:            phoneVal,
          delivery_address: addrVal,
          service:          service,
          items:            validItems
        })
      }),
      timeoutPromise
    ]);

    localStorage.setItem('last_order', JSON.stringify({
      id:    res.data.id,
      name:  nameVal,
      phone: phoneVal,
      total: res.data.total_price
    }));

    Cart.clear();
    updateFloatBtn();
    showOrderSuccess(res.data.id, res.data.total_price);

  } catch (err) {
    console.error('[CPC] Order error:', err);
    const errMsg = (err && err.message) ? err.message : 'Failed to place order. Please try again.';
    showMsg(msg, errMsg, 'bad');
    btn.disabled    = false;
    btn.textContent = 'Place Order →';
  }
}

function showMsg(el, text, type) {
  el.textContent = text;
  el.className   = 'cd-msg ' + (type || '');
}

// ── ORDER SUCCESS ────────────────────────────────────────────
function showOrderSuccess(orderId, total) {
  document.getElementById('cart-drawer').innerHTML = `
    <style>
      .ss{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;padding:40px 28px;text-align:center}
      .ss-ring{width:96px;height:96px;border-radius:50%;border:3px solid rgba(34,197,94,.3);display:flex;align-items:center;justify-content:center;margin:0 auto 24px;animation:rp 2s ease infinite}
      @keyframes rp{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.4)}50%{box-shadow:0 0 0 18px rgba(34,197,94,0)}}
      .ss h3{font-family:'Playfair Display',serif;font-size:1.6rem;font-weight:900;color:var(--cream);margin-bottom:8px}
      .ss p{font-size:.88rem;color:var(--text-muted);line-height:1.7;margin-bottom:24px}
      .ss-id{background:rgba(255,106,0,.08);border:1px solid rgba(255,106,0,.2);border-radius:14px;padding:18px 28px;margin-bottom:24px;width:100%}
      .ss-id span{display:block;font-size:.68rem;color:var(--text-muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px}
      .ss-id strong{font-family:'Playfair Display',serif;font-size:2.2rem;font-weight:900;color:var(--orange)}
    </style>
    <div class="ss">
      <div class="ss-ring"><span style="font-size:2.8rem">✅</span></div>
      <h3>Order Placed!</h3>
      <p>We're preparing your order right away.<br/>You'll receive it fresh & hot!</p>
      <div class="ss-id">
        <span>Order ID</span>
        <strong>#${orderId}</strong>
        <div style="font-size:.88rem;color:var(--text-muted);margin-top:6px">Total: Rs. ${total}</div>
      </div>
      <a href="track.html?id=${orderId}" class="btn btn-p" style="width:100%;justify-content:center;margin-bottom:12px">Track My Order →</a>
      <button onclick="location.reload()" style="background:none;color:var(--text-muted);border:none;font-size:.82rem;cursor:pointer;text-decoration:underline;padding:8px">+ Place another order</button>
    </div>`;
}

// ── SERVICE BANNER ───────────────────────────────────────────
function showServiceBanner() {
  const service = new URLSearchParams(location.search).get('service');
  if (!service || !SERVICE_CONFIG[service]) return;
  const cfg    = SERVICE_CONFIG[service];
  const banner = document.getElementById('service-banner');
  if (!banner) return;
  banner.classList.add('show');
  banner.innerHTML = `
    <div><strong>${cfg.label}</strong><br/><span style="font-size:.8rem">${cfg.desc}</span></div>
    <a href="menu.html">View full menu</a>`;
  const first = MENU_DATA[0];
  if (first && !location.hash) {
    setTimeout(() => {
      const sec = document.getElementById('sec-' + first.id);
      if (sec) window.scrollTo({ top: sec.offsetTop - 140, behavior: 'smooth' });
    }, 400);
  }
}

// ── INIT ─────────────────────────────────────────────────────
(async function initMenu() {
  const main = document.getElementById('menu-main');
  // Show shimmer skeleton immediately — much better UX than plain text
  if (main) main.innerHTML = buildSkeletonHTML(window.innerWidth <= 768 ? 4 : 6);

  // loadMenuData() now returns instantly (uses static data right away)
  // and refreshes with API data in background if available
  await loadMenuData();
  buildMenu();
})();

// ── GLOBAL: addFeatured (used by home.html featured cards) ──────
// Featured cards are static and have no DB item_id, so they can't be priced
// server-side. Send the customer to the live menu to order the real item.
window.addFeatured = function(name) {
  if (typeof showToast === 'function') showToast(`Pick ${name} on the menu →`);
  setTimeout(() => { window.location.href = 'menu.html'; }, 500);
};
