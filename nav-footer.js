(function(){
  var path = (location.pathname || '/').toLowerCase().replace(/\/+$/, '/') ;
  var IS_LANDING = (path === '/' || path === '/index.html' || path === '/index');

  function isActive(p){
    if(p === '/' && IS_LANDING) return true;
    if(p === '/about.html' && path.indexOf('/about') === 0) return true;
    if(p === '/ecosystem.html' && (path.indexOf('/ecosystem') === 0 || /-systems\.html$/.test(path))) return true;
    if(p === '/founder.html' && path.indexOf('/founder') === 0) return true;
    if(p === '/products.html' && path.indexOf('/products') === 0) return true;
    if(p === '/contact.html' && path.indexOf('/contact') === 0) return true;
    return false;
  }
  function cls(p){ return isActive(p) ? ' active' : ''; }

  var arrow = '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="9" x2="9" y2="3"/><polyline points="4,3 9,3 9,8"/></svg>';
  var burger = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></svg>';
  var xmark = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>';

  // ─── TOP NAV ───────────────────────────────────────────────────
  var navHTML =
    '<header id="topnav" role="banner">' +
      '<a href="/" class="tn-brand" aria-label="FORM home">' +
        '<img src="/logo-editorial-2.svg" alt="FORM.">' +
      '</a>' +
      '<nav class="tn-links" role="navigation">' +
        '<div class="tn-item">' +
          '<a href="/" class="tn-link' + cls('/') + '">Home</a>' +
        '</div>' +
        '<div class="tn-item has-menu" data-menu="about">' +
          '<a href="/about.html" class="tn-link' + cls('/about.html') + '">about</a>' +
          '<div class="tn-dropdown dd-about">' +
            '<div class="dd-list">' +
              '<div class="dd-heading">about</div>' +
              '<a href="/about.html#vision">vision</a>' +
              '<a href="/about.html#values">core values</a>' +
              '<a href="/about.html#principles">core principles</a>' +
              '<a href="/about.html#faq">faq</a>' +
            '</div>' +
            '<div class="dd-desc">FORM. is built on operational clarity, intentional systems, human-centered intelligence, and disciplined execution.</div>' +
          '</div>' +
        '</div>' +
        '<div class="tn-item">' +
          '<a href="/founder.html" class="tn-link' + cls('/founder.html') + '">Founder</a>' +
        '</div>' +
        '<div class="tn-item has-menu" data-menu="ecosystem">' +
          '<a href="/ecosystem.html" class="tn-link' + cls('/ecosystem.html') + '">ecosystem</a>' +
          '<div class="tn-dropdown dd-eco">' +
            '<div class="dd-list">' +
              '<div class="dd-heading">FORM — Operational Departments</div>' +
              '<a href="/business-systems.html">form strategy</a>' +
              '<a href="/business-systems.html">form digital</a>' +
              '<a href="/creative-systems.html">form creative</a>' +
              '<a href="/creative-systems.html">form sound</a>' +
              '<a href="/executive-systems.html">form support</a>' +
              '<a href="/executive-systems.html">form experience</a>' +
              '<a href="/intelligence-systems.html">form ai</a>' +
            '</div>' +
            '<div class="dd-list">' +
              '<div class="dd-heading">FORM Labs — Internal Products</div>' +
              '<a href="#relay">RELAY</a>' +
              '<a href="#frame">FRAME</a>' +
              '<a href="#access">ACCESS</a>' +
            '</div>' +
            '<div class="dd-desc">A connected ecosystem of operational departments and internal products working in alignment to build, scale, and future-proof organizations.</div>' +
          '</div>' +
        '</div>' +
        '<div class="tn-item has-menu" data-menu="products">' +
          '<a href="/products.html" class="tn-link' + cls('/products.html') + '">products</a>' +
          '<div class="tn-dropdown dd-prod">' +
            '<div class="dd-list">' +
              '<div class="dd-heading">Client-Facing Products</div>' +
              '<a href="/products.html#continuum">continuum</a>' +
              '<a href="/products.html#messages">messages</a>' +
              '<a href="/products.html#formation">formation</a>' +
            '</div>' +
            '<div class="dd-desc">Specialized operational products designed to support leadership, communication, execution, and long-term organizational growth.</div>' +
          '</div>' +
        '</div>' +
        '<div class="tn-item">' +
          '<a href="/contact.html" class="tn-link' + cls('/contact.html') + '">contact</a>' +
        '</div>' +
      '</nav>' +
      '<a href="/contact.html#strategy-call" class="tn-cta">Strategy Call ' + arrow + '</a>' +
      '<button class="tn-burger" type="button" aria-label="Open menu">' + burger + '</button>' +
    '</header>';

  // ─── FOOTER (4-column per FOOTER_FINAL reference) ─────────────
  var footerHTML =
    '<footer id="sitefooter" role="contentinfo">' +
      '<div class="ft-grid">' +
        '<div class="ft-brand">' +
          '<div class="ft-mark">' +
            '<img src="/logo-editorial-2.svg" alt="form." class="ft-wordmark">' +
            '<span class="ft-mark-dot" aria-hidden="true"></span>' +
          '</div>' +
          '<div class="ft-tag">the future needs form.<br>vision needs structure.</div>' +
          '<hr class="ft-rule">' +
          '<p class="ft-desc">FORM. is the convergence of intelligence, systems, creativity, leadership, technology, execution, and human experience into one operational ecosystem.</p>' +
          '<a href="mailto:hello@formintel.co" class="ft-email">hello@formintel.co</a>' +
        '</div>' +
        '<div class="ft-col">' +
          '<h4>about</h4>' +
          '<a href="/about.html#vision">vision</a>' +
          '<a href="/about.html#values">core values</a>' +
          '<a href="/about.html#principles">core principles</a>' +
          '<a href="/about.html#faq">faq</a>' +
        '</div>' +
        '<div class="ft-col">' +
          '<h4>ecosystem</h4>' +
          '<a href="/business-systems.html">form strategy</a>' +
          '<a href="/business-systems.html">form digital</a>' +
          '<a href="/creative-systems.html">form creative</a>' +
          '<a href="/creative-systems.html">form sound</a>' +
          '<a href="/executive-systems.html">form support</a>' +
          '<a href="/executive-systems.html">form experience</a>' +
          '<a href="/intelligence-systems.html">form ai</a>' +
          '<a href="/ecosystem.html#labs">form labs</a>' +
        '</div>' +
        '<div class="ft-col">' +
          '<h4>products</h4>' +
          '<a href="/products.html#continuum">continuum</a>' +
          '<a href="/products.html#messages">messages</a>' +
          '<a href="/products.html#formation">formation</a>' +
        '</div>' +
        '<div class="ft-col">' +
          '<h4>connect</h4>' +
          '<a href="/contact.html">contact</a>' +
          '<a href="https://instagram.com/" target="_blank" rel="noopener">instagram</a>' +
          '<a href="https://linkedin.com/" target="_blank" rel="noopener">linkedin</a>' +
          '<div class="ft-icons">' +
            '<a href="https://instagram.com/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor"/></svg></a>' +
            '<a href="https://linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="11" x2="8" y2="17"/><circle cx="8" cy="7.5" r=".8" fill="currentColor"/><path d="M12 17v-4a2.5 2.5 0 0 1 5 0v4"/><line x1="12" y1="11" x2="12" y2="17"/></svg></a>' +
            '<a href="mailto:hello@formintel.co" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3,7 12,13 21,7"/></svg></a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="ft-bottom">' +
        '<span>© 2026 FORM. All rights reserved.</span>' +
        '<span>Built for the future.</span>' +
        '<span></span>' +
      '</div>' +
    '</footer>';

  // ─── MOBILE MENU PANEL ──
  var mobileHTML =
    '<div id="tn-mobile" aria-hidden="true">' +
      '<button class="tn-mobile-close" type="button" aria-label="Close menu">' + xmark + '</button>' +
      '<div class="tn-mobile-inner">' +
        '<a href="/" class="tn-mobile-link">Home</a>' +
        '<a href="/about.html" class="tn-mobile-link">about</a>' +
        '<a href="/founder.html" class="tn-mobile-link">Founder</a>' +
        '<a href="/ecosystem.html" class="tn-mobile-link">ecosystem</a>' +
        '<a href="/products.html" class="tn-mobile-link">products</a>' +
        '<a href="/contact.html" class="tn-mobile-link">contact</a>' +
        '<a href="/contact.html#strategy-call" class="tn-mobile-cta">Strategy Call ' + arrow + '</a>' +
      '</div>' +
    '</div>';

  function inject(){
    if(!document.getElementById('topnav')){
      var navWrap = document.createElement('div');
      navWrap.innerHTML = navHTML;
      document.body.insertBefore(navWrap.firstChild, document.body.firstChild);
    }

    // ALWAYS remove any existing footer on landing — defensive against
    // cached JS or accidental injection elsewhere.
    if(IS_LANDING){
      var existing = document.getElementById('sitefooter');
      if(existing && existing.parentNode) existing.parentNode.removeChild(existing);
      document.body.classList.add('nf-no-footer');
    } else if(!document.getElementById('sitefooter')){
      var ftWrap = document.createElement('div');
      ftWrap.innerHTML = footerHTML;
      var footerEl = ftWrap.firstChild;

      var mainEl = document.getElementById('main');
      var bodyStyle = getComputedStyle(document.body);
      var bodyLocked = bodyStyle.overflow === 'hidden' || bodyStyle.overflowY === 'hidden';

      if(mainEl && bodyLocked){
        document.body.classList.add('nf-scroll-main');
        mainEl.appendChild(footerEl);
      } else {
        document.body.appendChild(footerEl);
      }
    }

    if(!document.getElementById('tn-mobile')){
      var mWrap = document.createElement('div');
      mWrap.innerHTML = mobileHTML;
      document.body.appendChild(mWrap.firstChild);
    }

    bindMenus();
    bindMobile();
    bindTransitions();
  }

  // ─── Hover dropdowns ───
  var openTimer = null, closeTimer = null, openItem = null;
  function bindMenus(){
    var items = document.querySelectorAll('#topnav .tn-item.has-menu');
    items.forEach(function(it){
      it.addEventListener('mouseenter', function(){
        clearTimeout(closeTimer);
        clearTimeout(openTimer);
        if(openItem && openItem !== it) openItem.classList.remove('open');
        openTimer = setTimeout(function(){ it.classList.add('open'); openItem = it; }, 80);
      });
      it.addEventListener('mouseleave', function(){
        clearTimeout(openTimer);
        closeTimer = setTimeout(function(){ it.classList.remove('open'); if(openItem === it) openItem = null; }, 220);
      });
    });
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && openItem){ openItem.classList.remove('open'); openItem = null; }
    });
  }

  // ─── Mobile menu ───
  function bindMobile(){
    var burgerBtn = document.querySelector('#topnav .tn-burger');
    var panel = document.getElementById('tn-mobile');
    if(!burgerBtn || !panel) return;
    var closeBtn = panel.querySelector('.tn-mobile-close');
    function open(){ panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); document.body.classList.add('nf-mobile-open'); }
    function close(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); document.body.classList.remove('nf-mobile-open'); }
    burgerBtn.addEventListener('click', open);
    closeBtn.addEventListener('click', close);
    panel.addEventListener('click', function(e){ if(e.target === panel) close(); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') close(); });
  }

  // ─── Page transitions ───
  function bindTransitions(){
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    if(document.documentElement.getAttribute('data-perf') === 'minimal') return;

    var overlay = document.getElementById('nf-transition');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.id = 'nf-transition';
      document.body.appendChild(overlay);
    }
    document.body.classList.add('nf-enter');

    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a[href]');
      if(!a) return;
      var href = a.getAttribute('href') || '';
      if(!href || href.charAt(0) === '#') return;
      if(a.target && a.target !== '_self') return;
      if(a.hasAttribute('download')) return;
      if(/^(mailto:|tel:|javascript:)/i.test(href)) return;
      try{
        var url = new URL(a.href, location.href);
        if(url.origin !== location.origin) return;
        if(url.pathname === location.pathname && url.search === location.search) return;
      }catch(_){return;}
      e.preventDefault();
      overlay.classList.add('in');
      setTimeout(function(){ window.location.href = a.href; }, 360);
    });

    window.addEventListener('pageshow', function(ev){
      if(ev.persisted) overlay.classList.remove('in');
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
