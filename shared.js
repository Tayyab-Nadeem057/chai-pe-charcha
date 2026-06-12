// shared nav + page transitions (brand-logo.js runs first)
(function(){
  // ── THEME TOGGLE ──
  const html = document.documentElement;
  const savedTheme = localStorage.getItem('cpc-theme') || 'light';
  html.setAttribute('data-theme', savedTheme);

  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('cpc-theme', next);
    });
  }

  const nav=document.getElementById('nav');
  const hbg=document.getElementById('hbg');
  const mobMenu=document.getElementById('mob-menu');

  // scroll nav
  window.addEventListener('scroll',()=>{
    if(nav) nav.classList.toggle('sc',window.scrollY>50);
  },{passive:true});

  // hamburger
  if(hbg&&mobMenu){
    hbg.addEventListener('click',()=>mobMenu.classList.toggle('open'));
    mobMenu.querySelectorAll('.mob-lnk').forEach(l=>l.addEventListener('click',()=>mobMenu.classList.remove('open')));
  }

  // mark active page link
  const path=location.pathname.split('/').pop()||'index.html';
  document.querySelectorAll('.nl,.mob-lnk').forEach(l=>{
    const href=l.getAttribute('href')||'';
    if(href.includes(path)||(path===''&&href.includes('home.html'))){
      l.classList.add('act');
    }
  });

  // page transition
  const overlay=document.querySelector('.pt-overlay');
  if(overlay){
    document.querySelectorAll('a[data-pg]').forEach(a=>{
      a.addEventListener('click',function(e){
        const dest=this.getAttribute('href');
        if(!dest||dest.startsWith('#')||dest.startsWith('http')||dest.startsWith('https')||dest.startsWith('mailto')||dest.startsWith('tel')) return;
        e.preventDefault();
        overlay.classList.add('slide-in');
        setTimeout(()=>{ window.location.href=dest; },480);
      });
    });
    // on load: exit animation
    window.addEventListener('load',()=>{
      overlay.classList.add('slide-out');
      setTimeout(()=>{ overlay.classList.remove('slide-in','slide-out'); },600);
    });
  }

  // scroll reveal
  const revEls=document.querySelectorAll('.rev');
  if(revEls.length){
    const obs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('done');obs.unobserve(e.target);}});
    },{threshold:.12});
    revEls.forEach(el=>obs.observe(el));
  }

  // toast
  window.showToast=function(msg){
    const t=document.getElementById('toast');
    if(!t) return;
    clearTimeout(t._timer);
    t.textContent='☕ '+msg;
    t.classList.add('show');
    t._timer=setTimeout(()=>t.classList.remove('show'),2800);
  };

  // ─────────────────────────────────────────────────────────
  // GLOBAL FLOATING BUTTONS (Issues 3 & 4)
  // Auto-inject on every page that loads shared.js
  // ─────────────────────────────────────────────────────────
  function injectGlobalButtons() {
    // Don't double-inject. (The CART button is provided by the shared cart.js;
    // this only injects the WhatsApp button.)
    if (document.getElementById('g-float-wrap')) return;

    var waNum = (typeof SITE_WA !== 'undefined') ? SITE_WA : '923021807669';

    var wrap = document.createElement('div');
    wrap.id = 'g-float-wrap';
    wrap.innerHTML =
      '<a id="g-wa-btn" class="g-wa-btn" href="https://wa.me/' + waNum + '" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">' +
        '<svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>' +
      '</a>';
    document.body.appendChild(wrap);
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectGlobalButtons);
  } else {
    injectGlobalButtons();
  }

})();
