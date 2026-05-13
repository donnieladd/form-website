(function(){
  var path = (location.pathname || '/').toLowerCase().replace(/\/+$/, '/') ;
  var IS_LANDING = (path === '/' || path === '/index.html' || path === '/index');

  function isActive(p){
    if(p === '/' && IS_LANDING) return true;
    if(p === '/vision.html' && path.indexOf('/vision') === 0) return true;
    if(p === '/standards.html' && path.indexOf('/standards') === 0) return true;
    if(p === '/founder.html' && path.indexOf('/founder') === 0) return true;
    if(p === '/ecosystem.html' && (path.indexOf('/ecosystem') === 0 || /-systems\.html$/.test(path))) return true;
    if(p === '/contact.html' && path.indexOf('/contact') === 0) return true;
    return false;
  }
  function cls(p){ return isActive(p) ? ' active' : ''; }

  var burger = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></svg>';
  var xmark  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="6" y1="18" x2="18" y2="6"/></svg>';
  var dot    = '<span class="tn-cta-dot" aria-hidden="true"></span>';

  // ─── TOP NAV ───────────────────────────────────────────────────
  // Updated doctrine: lowercase nav labels WITHOUT trailing periods.
  // CTA stays "● start the conversation" everywhere (homepage hero
  // uses its own "ENTER FORM →" CTA inline, not in the nav bar).
  // Ecosystem dropdown is now three columns.
  var navHTML =
    '<header id="topnav" role="banner">' +
      '<a href="/" class="tn-brand" aria-label="form. home">' +
        '<span class="tn-wordmark">form<span class="tn-dot">.</span></span>' +
      '</a>' +
      '<nav class="tn-links" role="navigation">' +
        '<div class="tn-item">' +
          '<a href="/" class="tn-link' + cls('/') + '">home</a>' +
        '</div>' +
        '<div class="tn-item">' +
          '<a href="/vision.html" class="tn-link' + cls('/vision.html') + '">vision</a>' +
        '</div>' +
        '<div class="tn-item">' +
          '<a href="/standards.html" class="tn-link' + cls('/standards.html') + '">standards</a>' +
        '</div>' +
        '<div class="tn-item">' +
          '<a href="/founder.html" class="tn-link' + cls('/founder.html') + '">founder</a>' +
        '</div>' +
        '<div class="tn-item has-menu" data-menu="ecosystem">' +
          '<a href="/ecosystem.html" class="tn-link' + cls('/ecosystem.html') + '">ecosystem</a>' +
          '<div class="tn-dropdown dd-eco">' +
            '<div class="dd-list">' +
              '<a href="/ecosystem.html" class="dd-parent">disciplines</a>' +
              '<a href="/ecosystem.html#strategy">form. strategy</a>' +
              '<a href="/ecosystem.html#creative">form. creative</a>' +
              '<a href="/ecosystem.html#digital">form. digital</a>' +
              '<a href="/ecosystem.html#ai">form. ai</a>' +
              '<a href="/ecosystem.html#experience">form. experience</a>' +
            '</div>' +
            '<div class="dd-list">' +
              '<a href="/ecosystem.html#products" class="dd-parent">products</a>' +
              '<a href="/ecosystem.html#continuum">continuum</a>' +
              '<a href="/messages.html">messages by form.</a>' +
              '<a href="/ecosystem.html#formation">formation</a>' +
            '</div>' +
            '<div class="dd-list">' +
              '<a href="/ecosystem.html#labs" class="dd-parent">form. labs</a>' +
              '<a href="/ecosystem.html#relay" class="dd-up">RELAY</a>' +
              '<a href="/ecosystem.html#frame" class="dd-up">FRAME</a>' +
              '<a href="/ecosystem.html#access" class="dd-up">ACCESS</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="tn-item">' +
          '<a href="/contact.html" class="tn-link' + cls('/contact.html') + '">contact</a>' +
        '</div>' +
      '</nav>' +
      '<a href="/contact.html" class="tn-cta">' + dot + 'start the conversation</a>' +
      '<button class="tn-burger" type="button" aria-label="Open menu">' + burger + '</button>' +
    '</header>';

  // ─── FOOTER ────────────────────────────────────────────────────
  // 5-column layout per FOOTER_FINAL_3 reference. Entity names follow
  // locked doctrine in replit.md: 5 disciplines + 3 products + 1 division.
  // 'form. sound' is deprecated and must not appear.
  var footerHTML =
    '<footer id="sitefooter" role="contentinfo">' +
      '<div class="ft-grid">' +

        // BRAND ──────────────────────────────────────────────
        '<div class="ft-brand">' +
          '<div class="ft-mark">' +
            '<span class="ft-wordmark">form<span class="ft-dot">.</span></span>' +
          '</div>' +
          '<div class="ft-tag">the future needs form.</div>' +
          '<div class="ft-tag-mono">VISION NEEDS STRUCTURE.</div>' +
          '<hr class="ft-rule">' +
          '<p class="ft-desc">form. is the convergence of intelligence, systems, creativity, leadership, technology, execution, and human experience into one operational ecosystem.</p>' +
          '<a href="mailto:dontae@formstrategy.co" class="ft-email">dontae@formstrategy.co</a>' +
        '</div>' +

        // ABOUT ──────────────────────────────────────────────
        '<div class="ft-col">' +
          '<h4>about</h4>' +
          '<span class="ft-h-rule" aria-hidden="true"></span>' +
          '<a href="/vision.html">vision</a>' +
          '<a href="/standards.html">standards</a>' +
          '<a href="/founder.html">founder</a>' +
          '<a href="/contact.html#faq">faq</a>' +
        '</div>' +

        // ECOSYSTEM ──────────────────────────────────────────
        '<div class="ft-col">' +
          '<h4>ecosystem</h4>' +
          '<span class="ft-h-rule" aria-hidden="true"></span>' +
          '<a href="/ecosystem.html#strategy">form. strategy</a>' +
          '<a href="/ecosystem.html#creative">form. creative</a>' +
          '<a href="/ecosystem.html#digital">form. digital</a>' +
          '<a href="/ecosystem.html#ai">form. ai</a>' +
          '<a href="/ecosystem.html#experience">form. experience</a>' +
          '<a href="/ecosystem.html#labs">form. labs</a>' +
        '</div>' +

        // PRODUCTS ───────────────────────────────────────────
        '<div class="ft-col">' +
          '<h4>products</h4>' +
          '<span class="ft-h-rule" aria-hidden="true"></span>' +
          '<a href="/ecosystem.html#continuum">continuum</a>' +
          '<a href="/messages.html">messages by form.</a>' +
          '<a href="/ecosystem.html#formation">formation</a>' +
        '</div>' +

        // CONNECT ────────────────────────────────────────────
        '<div class="ft-col">' +
          '<h4>connect</h4>' +
          '<span class="ft-h-rule" aria-hidden="true"></span>' +
          '<a href="/contact.html">contact</a>' +
          '<a href="https://instagram.com/" target="_blank" rel="noopener">instagram</a>' +
          '<a href="https://linkedin.com/" target="_blank" rel="noopener">linkedin</a>' +
          '<div class="ft-icons">' +
            '<a href="https://instagram.com/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor"/></svg></a>' +
            '<a href="https://linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="11" x2="8" y2="17"/><circle cx="8" cy="7.5" r=".8" fill="currentColor"/><path d="M12 17v-4a2.5 2.5 0 0 1 5 0v4"/><line x1="12" y1="11" x2="12" y2="17"/></svg></a>' +
            '<a href="mailto:dontae@formstrategy.co" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3,7 12,13 21,7"/></svg></a>' +
          '</div>' +
        '</div>' +

      '</div>' +

      // ── MOBILE-ONLY ACCORDION ─────────────────────────────
      // Shown only ≤720px via CSS. Desktop .ft-grid hides at the
      // same breakpoint. Uses native <details>/<summary> for a11y +
      // CSS-only toggle (no JS).
      '<div class="ft-mobile">' +
        '<details class="ft-acc">' +
          '<summary>about<span class="ft-acc-icon" aria-hidden="true"></span></summary>' +
          '<div class="ft-acc-body">' +
            '<a href="/vision.html">vision</a>' +
            '<a href="/standards.html">standards</a>' +
            '<a href="/founder.html">founder</a>' +
            '<a href="/contact.html#faq">faq</a>' +
          '</div>' +
        '</details>' +
        '<details class="ft-acc">' +
          '<summary>ecosystem<span class="ft-acc-icon" aria-hidden="true"></span></summary>' +
          '<div class="ft-acc-body">' +
            '<a href="/ecosystem.html#strategy">form. strategy</a>' +
            '<a href="/ecosystem.html#creative">form. creative</a>' +
            '<a href="/ecosystem.html#digital">form. digital</a>' +
            '<a href="/ecosystem.html#ai">form. ai</a>' +
            '<a href="/ecosystem.html#experience">form. experience</a>' +
            '<a href="/ecosystem.html#labs">form. labs</a>' +
          '</div>' +
        '</details>' +
        '<details class="ft-acc">' +
          '<summary>products<span class="ft-acc-icon" aria-hidden="true"></span></summary>' +
          '<div class="ft-acc-body">' +
            '<a href="/ecosystem.html#continuum">continuum</a>' +
            '<a href="/messages.html">messages by form.</a>' +
            '<a href="/ecosystem.html#formation">formation</a>' +
          '</div>' +
        '</details>' +
        '<details class="ft-acc">' +
          '<summary>connect<span class="ft-acc-icon" aria-hidden="true"></span></summary>' +
          '<div class="ft-acc-body">' +
            '<a href="/contact.html">contact</a>' +
            '<a href="https://instagram.com/" target="_blank" rel="noopener">instagram</a>' +
            '<a href="https://linkedin.com/" target="_blank" rel="noopener">linkedin</a>' +
          '</div>' +
        '</details>' +
        '<div class="ft-mobile-icons">' +
          '<a href="https://instagram.com/" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor"/></svg></a>' +
          '<a href="https://linkedin.com/" target="_blank" rel="noopener" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="11" x2="8" y2="17"/><circle cx="8" cy="7.5" r=".8" fill="currentColor"/><path d="M12 17v-4a2.5 2.5 0 0 1 5 0v4"/><line x1="12" y1="11" x2="12" y2="17"/></svg></a>' +
          '<a href="mailto:dontae@formstrategy.co" aria-label="Email"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><polyline points="3,7 12,13 21,7"/></svg></a>' +
        '</div>' +
      '</div>' +

      // BOTTOM BAR
      '<div class="ft-bottom">' +
        '<span>© 2026 form. all rights reserved.</span>' +
        '<span>built for the future.</span>' +
      '</div>' +
    '</footer>';

  // ─── MOBILE MENU PANEL ─────────────────────────────────────────
  var mobileHTML =
    '<div id="tn-mobile" aria-hidden="true">' +
      '<button class="tn-mobile-close" type="button" aria-label="Close menu">' + xmark + '</button>' +
      '<div class="tn-mobile-inner">' +
        '<a href="/" class="tn-mobile-link">home</a>' +
        '<a href="/vision.html" class="tn-mobile-link">vision</a>' +
        '<a href="/standards.html" class="tn-mobile-link">standards</a>' +
        '<a href="/founder.html" class="tn-mobile-link">founder</a>' +
        '<a href="/ecosystem.html" class="tn-mobile-link">ecosystem</a>' +
        '<a href="/contact.html" class="tn-mobile-link">contact</a>' +
        '<a href="/contact.html" class="tn-mobile-cta">' + dot + 'start the conversation</a>' +
      '</div>' +
    '</div>';

  function inject(){
    if(!document.getElementById('topnav')){
      var navWrap = document.createElement('div');
      navWrap.innerHTML = navHTML;
      document.body.insertBefore(navWrap.firstChild, document.body.firstChild);
    }

    if(IS_LANDING){
      var existing = document.getElementById('sitefooter');
      if(existing && existing.parentNode) existing.parentNode.removeChild(existing);
      document.body.classList.add('nf-no-footer');
    } else if(!document.getElementById('sitefooter') && !document.body.classList.contains('nf-no-footer') && !document.body.classList.contains('nf-keep-page-footer')){
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
    function open(){ panel.classList.add('open'); panel.setAttribute('aria-hidden','false'); document.documentElement.classList.add('nf-mobile-open'); document.body.classList.add('nf-mobile-open'); }
    function close(){ panel.classList.remove('open'); panel.setAttribute('aria-hidden','true'); document.documentElement.classList.remove('nf-mobile-open'); document.body.classList.remove('nf-mobile-open'); }
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
      // pause any playing <video> the moment the exit veil starts
      // covering the page so the browser stops decoding frames behind
      // the black overlay during the 360ms hand-off (homepage hero video).
      try {
        var vids = document.getElementsByTagName('video');
        for(var i=0;i<vids.length;i++){ try { vids[i].pause(); } catch(_){} }
      } catch(_){}
      setTimeout(function(){ window.location.href = a.href; }, 360);
    });

    window.addEventListener('pageshow', function(ev){
      if(ev.persisted){
        overlay.classList.remove('in');
        // bfcache restore: resume any autoplay video that the browser
        // may have left paused (homepage hero video). silently ignore
        // browsers that reject the play() promise.
        try {
          var vids = document.getElementsByTagName('video');
          for(var i=0;i<vids.length;i++){
            var vid = vids[i];
            if(vid.autoplay !== false && vid.paused && vid.style.display !== 'none'){
              var pp = vid.play();
              if(pp && typeof pp.catch === 'function') pp.catch(function(){});
            }
          }
        } catch(_){}
      }
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
