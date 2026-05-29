// shared nav + page transitions
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
  });

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
})();
