/* ===== main.js — Chai Pe Charcha ===== */

// ─── NAVBAR SCROLL ───────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveLink();
});

// ─── HAMBURGER MENU ──────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
hamburger.addEventListener('click', () => {
  mobileMenu.classList.toggle('open');
});
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ─── ACTIVE NAV LINK ─────────────────────────────────────────────
function updateActiveLink() {
  const sections = ['home', 'menu', 'about', 'contact'];
  const scrollY = window.scrollY + 120;
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const { offsetTop, offsetHeight } = el;
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (link) link.classList.toggle('active', scrollY >= offsetTop && scrollY < offsetTop + offsetHeight);
  });
}

// ─── SCROLL REVEAL ───────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('revealed');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => revealObserver.observe(el));

// ─── FLOATING PARTICLES ──────────────────────────────────────────
const particleContainer = document.getElementById('hero-particles');
for (let i = 0; i < 18; i++) {
  const p = document.createElement('div');
  p.className = 'particle';
  const size = Math.random() * 10 + 4;
  p.style.cssText = `
    width:${size}px; height:${size}px;
    left:${Math.random() * 100}%;
    animation-duration:${8 + Math.random() * 10}s;
    animation-delay:${Math.random() * 10}s;
    opacity:${0.06 + Math.random() * 0.1};
  `;
  particleContainer.appendChild(p);
}

// ─── MENU TABS ───────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.getElementById('menu-chai').classList.toggle('hidden', tab !== 'chai');
    document.getElementById('menu-snacks').classList.toggle('hidden', tab !== 'snacks');
    // Re-trigger reveal on newly visible cards
    document.querySelectorAll('.menu-grid:not(.hidden) .menu-card').forEach((card, i) => {
      card.classList.remove('revealed');
      setTimeout(() => card.classList.add('revealed'), i * 80);
    });
  });
});

// ─── COUNTER ANIMATION ───────────────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const duration = 1800;
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animateCounter(e.target);
      statObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.stat-num').forEach(el => statObserver.observe(el));

// ─── CARD 3D TILT ────────────────────────────────────────────────
document.querySelectorAll('.menu-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `perspective(600px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateY(-10px) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ─── TOAST NOTIFICATION ──────────────────────────────────────────
const toast = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = '☕ ' + msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ─── CONTACT FORM ────────────────────────────────────────────────
function handleSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('name-input').value.trim();
  const btn = document.getElementById('send-btn');
  btn.innerHTML = '<span>Message Sent! ✓</span>';
  btn.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
  btn.disabled = true;
  showToast(`Thanks ${name}! We'll get back to you soon.`);
  setTimeout(() => {
    btn.innerHTML = '<span>Send Message</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
    btn.style.background = '';
    btn.disabled = false;
    document.getElementById('contact-form').reset();
  }, 3000);
}

// ─── THREE.JS TEA CUP ────────────────────────────────────────────
(function initThree() {
  const canvas = document.getElementById('tea-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.parentElement.clientWidth, 480);
  renderer.shadowMap.enabled = true;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, canvas.parentElement.clientWidth / 480, 0.1, 100);
  camera.position.set(0, 1.2, 5.5);
  camera.lookAt(0, 0, 0);

  // Lights
  scene.add(new THREE.AmbientLight(0xfff5e4, 1.2));
  const dir = new THREE.DirectionalLight(0xFF8C42, 2.5);
  dir.position.set(3, 5, 5);
  dir.castShadow = true;
  scene.add(dir);
  const rimLight = new THREE.PointLight(0xFF6A00, 1.5, 10);
  rimLight.position.set(-3, 2, -2);
  scene.add(rimLight);

  // Materials
  const cupMat = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF,
    roughness: 0.15,
    metalness: 0.05,
    envMapIntensity: 0.8
  });
  const innerMat = new THREE.MeshStandardMaterial({ color: 0xFFF5E4, roughness: 0.8 });
  const teaMat = new THREE.MeshStandardMaterial({
    color: 0xC45C1A,
    roughness: 0.2,
    metalness: 0.1
  });
  const saucerMat = new THREE.MeshStandardMaterial({
    color: 0xF5F5F5,
    roughness: 0.2,
    metalness: 0.05
  });

  const group = new THREE.Group();

  // Saucer
  const saucer = new THREE.Mesh(
    new THREE.CylinderGeometry(1.4, 1.2, 0.12, 48),
    saucerMat
  );
  saucer.position.y = -1.1;
  saucer.receiveShadow = true;
  group.add(saucer);

  // Saucer rim detail
  const saucerRim = new THREE.Mesh(
    new THREE.TorusGeometry(1.3, 0.08, 8, 48),
    saucerMat
  );
  saucerRim.rotation.x = Math.PI / 2;
  saucerRim.position.y = -1.04;
  group.add(saucerRim);

  // Cup body using lathe geometry for realistic shape
  const cupPoints = [];
  cupPoints.push(new THREE.Vector2(0.35, -0.9));
  cupPoints.push(new THREE.Vector2(0.38, -0.6));
  cupPoints.push(new THREE.Vector2(0.42, -0.2));
  cupPoints.push(new THREE.Vector2(0.55, 0.3));
  cupPoints.push(new THREE.Vector2(0.65, 0.75));
  cupPoints.push(new THREE.Vector2(0.7, 0.9));

  const cupGeo = new THREE.LatheGeometry(cupPoints, 48);
  const cup = new THREE.Mesh(cupGeo, cupMat);
  cup.castShadow = true;
  group.add(cup);

  // Cup inner
  const innerPoints = [];
  innerPoints.push(new THREE.Vector2(0.0, -0.8));
  innerPoints.push(new THREE.Vector2(0.3, -0.85));
  innerPoints.push(new THREE.Vector2(0.35, -0.5));
  innerPoints.push(new THREE.Vector2(0.48, 0.2));
  innerPoints.push(new THREE.Vector2(0.58, 0.72));

  const innerGeo = new THREE.LatheGeometry(innerPoints, 48);
  const inner = new THREE.Mesh(innerGeo, innerMat);
  group.add(inner);

  // Tea surface inside cup
  const tea = new THREE.Mesh(
    new THREE.CylinderGeometry(0.56, 0.47, 0.04, 48),
    teaMat
  );
  tea.position.y = 0.6;
  group.add(tea);

  // Handle using tube geometry
  const handlePath = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.68, 0.5, 0),
    new THREE.Vector3(1.15, 0.5, 0),
    new THREE.Vector3(1.25, 0.2, 0),
    new THREE.Vector3(1.25, -0.1, 0),
    new THREE.Vector3(1.15, -0.35, 0),
    new THREE.Vector3(0.68, -0.35, 0),
  ]);
  const handleGeo = new THREE.TubeGeometry(handlePath, 20, 0.07, 10, false);
  const handle = new THREE.Mesh(handleGeo, cupMat);
  handle.castShadow = true;
  group.add(handle);

  // Orange stripe decoration
  const stripeGeo = new THREE.TorusGeometry(0.66, 0.03, 8, 48);
  const stripeMat = new THREE.MeshStandardMaterial({ color: 0xFF6A00, roughness: 0.3 });
  const stripe = new THREE.Mesh(stripeGeo, stripeMat);
  stripe.rotation.x = Math.PI / 2;
  stripe.position.y = 0.1;
  group.add(stripe);

  group.position.y = -0.1;
  scene.add(group);

  // Steam particles
  const steamGeo = new THREE.BufferGeometry();
  const steamCount = 80;
  const positions = new Float32Array(steamCount * 3);
  const velocities = [];
  for (let i = 0; i < steamCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 0.8;
    positions[i * 3 + 1] = 0.9 + Math.random() * 1.5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
    velocities.push({
      x: (Math.random() - 0.5) * 0.005,
      y: 0.006 + Math.random() * 0.006,
      z: (Math.random() - 0.5) * 0.005,
      life: Math.random()
    });
  }
  steamGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const steamMat = new THREE.PointsMaterial({
    color: 0xFF8C42,
    size: 0.08,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true
  });
  const steamParticles = new THREE.Points(steamGeo, steamMat);
  scene.add(steamParticles);

  // Resize handler
  function onResize() {
    const w = canvas.parentElement.clientWidth;
    const h = window.innerWidth < 768 ? 320 : 480;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', onResize);
  onResize();

  // Animate
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Rotate cup slowly + follow mouse slightly
    group.rotation.y = t * 0.35 + mouseX * 0.3;
    group.rotation.x = Math.sin(t * 0.5) * 0.06 + mouseY * 0.08;
    group.position.y = -0.1 + Math.sin(t * 0.8) * 0.06;

    // Animate steam
    const pos = steamGeo.attributes.position.array;
    for (let i = 0; i < steamCount; i++) {
      velocities[i].life += velocities[i].y;
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;
      if (pos[i * 3 + 1] > 3.5) {
        pos[i * 3] = (Math.random() - 0.5) * 0.8;
        pos[i * 3 + 1] = 0.9;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 0.8;
      }
    }
    steamGeo.attributes.position.needsUpdate = true;

    // Pulse rim light
    rimLight.intensity = 1.5 + Math.sin(t * 2) * 0.5;

    renderer.render(scene, camera);
  }
  animate();
})();

// ─── SMOOTH SCROLL FOR INTERNAL LINKS ───────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Trigger initial reveal for above-fold elements
window.dispatchEvent(new Event('scroll'));
