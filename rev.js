/* rev. — operational intelligence layer
   stage 1: visual shell + canonical routing intelligence.
   no external API. all responses generated from the
   ecosystem's own doctrine and curated routing rules.
   stage 2 will swap the responder for a backend call. */
(function () {
  if (window.__revInit) return;
  window.__revInit = true;

  // ─── doctrine: the nine entities ───────────────────────────
  var ENTITIES = {
    strategy: {
      label: 'form. strategy',
      anchor: '/ecosystem.html#strategy',
      blurb: 'operational architecture, positioning, and decision frameworks. where structure begins.'
    },
    creative: {
      label: 'form. creative',
      anchor: '/ecosystem.html#creative',
      blurb: 'brand systems, narrative, and visual identity built as infrastructure — not decoration.'
    },
    digital: {
      label: 'form. digital',
      anchor: '/ecosystem.html#digital',
      blurb: 'web, product, and digital surfaces designed as operational extensions of the brand.'
    },
    ai: {
      label: 'form. ai',
      anchor: '/ecosystem.html#ai',
      blurb: 'applied intelligence — workflows, routing, and operational cognition. rev. lives here.'
    },
    messages: {
      label: 'messages by form.',
      anchor: '/ecosystem.html#messages',
      blurb: 'sermon series content, production, and strategy — built for ministries who need the world around the message to match what was being carried.'
    },
    support: {
      label: 'formation',
      anchor: '/ecosystem.html#formation',
      blurb: 'continuous operational backing — the layer that keeps systems calm under pressure.'
    },
    experience: {
      label: 'form. experience',
      anchor: '/ecosystem.html#experience',
      blurb: 'physical, spatial, and live ecosystems — environments where the brand becomes a place.'
    },
    labs: {
      label: 'form. labs',
      anchor: '/ecosystem.html#labs',
      blurb: 'research and emerging systems. where the next layer of the ecosystem is prototyped.'
    },
    continuum: {
      label: 'continuum',
      anchor: '/ecosystem.html#continuum',
      blurb: 'the long arc — the connective intelligence that holds every entity in coherence over time.'
    }
  };

  // ─── routing intelligence ──────────────────────────────────
  function normalize(s) { return (s || '').toLowerCase().trim(); }

  function matchEntity(q) {
    var keys = Object.keys(ENTITIES);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (q.indexOf(k) !== -1) return k;
    }
    // semantic fallbacks
    if (/\b(brand|identity|design|visual|logo)\b/.test(q)) return 'creative';
    if (/\b(web|site|app|product|platform|digital)\b/.test(q)) return 'digital';
    if (/\b(ai|intelligence|automation|workflow|llm|model)\b/.test(q)) return 'ai';
    if (/\b(sermon|preach|ministry|church|series|pastor|messages)\b/.test(q)) return 'messages';
    if (/\b(event|space|physical|live|venue|environment)\b/.test(q)) return 'experience';
    if (/\b(research|prototype|experiment|emerging|new)\b/.test(q)) return 'labs';
    if (/\b(strategy|positioning|architecture|framework|plan)\b/.test(q)) return 'strategy';
    if (/\b(support|maintenance|ongoing|operations)\b/.test(q)) return 'support';
    if (/\b(long.?term|continuity|coherence|over time)\b/.test(q)) return 'continuum';
    return null;
  }

  function respond(rawQ) {
    var q = normalize(rawQ);
    if (!q) return null;

    // explicit ecosystem entity
    var ent = matchEntity(q);

    // intent: what is form
    if (/\b(what|who|tell me about|explain)\b.*\bform\b/.test(q) || q === 'form' || q === 'form.') {
      return [
        'form. is an operational intelligence company.',
        'we build the systems beneath strategy, brand, technology, and intelligence — and hold them in coherence as one ecosystem.',
        'the core idea: <em>intelligence without structure creates noise.</em> form. is the structure.',
        { suggest: ['the nine entities', 'where do i start?', 'the founder'] }
      ];
    }

    // intent: ecosystem overview
    if (/\b(ecosystem|nine|entities|all of them|overview)\b/.test(q)) {
      return [
        'the ecosystem is nine connected entities — one signal.',
        'strategy. creative. digital. ai. experience. labs. continuum. messages. formation.',
        'each one is operational on its own. together they form a single intelligence layer.',
        'open the full map: <a href="/ecosystem.html">ecosystem.</a>'
      ];
    }

    // intent: where do i start
    if (/\b(start|begin|where|first|how do (i|we))\b/.test(q) && !ent) {
      return [
        'the most useful starting point is a short conversation.',
        'tell me what you\'re trying to bring into form, and i\'ll route you to the entity that fits — or you can begin directly here:',
        '<a href="/contact.html">● start the conversation</a>'
      ];
    }

    // intent: founder
    if (/\b(founder|who built|who made|who is behind|nick|story)\b/.test(q)) {
      return [
        'the founder page is a quiet, reflective read — not a résumé.',
        'open it: <a href="/founder.html">founder.</a>'
      ];
    }

    // intent: vision / philosophy
    if (/\b(vision|philosophy|doctrine|why|believe|future)\b/.test(q)) {
      return [
        'the vision is best read in its own atmosphere.',
        '<em>the future needs form.</em>',
        'open: <a href="/vision.html">vision.</a>'
      ];
    }

    // intent: standards / principles
    if (/\b(standards|principles|values|how do you work|operating|culture)\b/.test(q)) {
      return [
        'the standards page holds the operational discipline behind every engagement.',
        'open: <a href="/standards.html">standards.</a>'
      ];
    }

    // intent: contact / pricing / talk
    if (/\b(contact|email|talk|reach|call|pricing|cost|hire|engage|book|conversation)\b/.test(q)) {
      return [
        'the right next step is a conversation. no forms-then-silence.',
        '<a href="/contact.html">● start the conversation</a>'
      ];
    }

    // matched an entity
    if (ent) {
      var e = ENTITIES[ent];
      return [
        e.label + '.',
        e.blurb,
        'open: <a href="' + e.anchor + '">' + e.label + ' →</a>',
        { suggest: ['the full ecosystem', 'where do i start?'] }
      ];
    }

    // fallback — calm, never apologetic
    return [
      'i\'ll route you. the clearest path forward is to open the conversation directly:',
      '<a href="/contact.html">● start the conversation</a>',
      'or tell me which surface you\'re thinking about — strategy, creative, digital, ai, experience, labs, continuum, messages, or formation.'
    ];
  }

  // ─── shell html ────────────────────────────────────────────
  var shellHTML =
    '<div id="rev-scrim"></div>' +
    '<div id="rev-shell" role="dialog" aria-label="rev. operational intelligence" aria-expanded="false">' +
      '<div class="rev-atmos"></div>' +
      '<div class="rev-body">' +
        '<div class="rev-meta">' +
          '<div class="rev-meta-label"><span class="rev-dot"></span><span>rev. // operational intelligence layer</span></div>' +
          '<div class="rev-meta-channel">v.0.1</div>' +
        '</div>' +
        '<div class="rev-thread" id="rev-thread"></div>' +
        '<form class="rev-prompt" id="rev-form" autocomplete="off">' +
          '<span class="rev-dot"></span>' +
          '<label for="rev-input" class="rev-sr">ask rev.</label>' +
          '<input id="rev-input" type="text" placeholder="ask the ecosystem." autocomplete="off" aria-label="ask rev." />' +
          '<span class="rev-enter">enter</span>' +
        '</form>' +
      '</div>' +
      '<button class="rev-capsule" id="rev-capsule" type="button" aria-label="open rev. intelligence layer" aria-controls="rev-thread">' +
        '<span class="rev-dot" aria-hidden="true"></span>' +
        '<span class="rev-mark">rev.</span>' +
        '<span class="rev-hint">intelligence layer</span>' +
      '</button>' +
    '</div>';

  function init() {
    var mount = document.createElement('div');
    mount.innerHTML = shellHTML;
    while (mount.firstChild) document.body.appendChild(mount.firstChild);

    var shell = document.getElementById('rev-shell');
    var scrim = document.getElementById('rev-scrim');
    var capsule = document.getElementById('rev-capsule');
    var thread = document.getElementById('rev-thread');
    var form = document.getElementById('rev-form');
    var input = document.getElementById('rev-input');

    var seeded = false;

    function open() {
      if (shell.classList.contains('open')) return;
      shell.classList.add('open');
      scrim.classList.add('on');
      shell.setAttribute('aria-expanded', 'true');
      capsule.setAttribute('aria-label', 'close rev.');
      if (!seeded) {
        seeded = true;
        seedGreeting();
      }
      setTimeout(function () { input && input.focus(); }, 760);
    }
    function close() {
      if (!shell.classList.contains('open')) return;
      shell.classList.remove('open');
      scrim.classList.remove('on');
      shell.setAttribute('aria-expanded', 'false');
      capsule.setAttribute('aria-label', 'open rev.');
      if (input) input.blur();
    }
    function toggle() { shell.classList.contains('open') ? close() : open(); }

    capsule.addEventListener('click', toggle);
    scrim.addEventListener('click', close);

    function isTypingInExternalField(target) {
      if (!target) return false;
      if (shell.contains(target)) return false; // rev's own input is fine
      var tag = (target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
      if (target.isContentEditable) return true;
      return false;
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && shell.classList.contains('open')) {
        close();
        capsule.focus();
        return;
      }
      // ⌘K / ctrl-K to summon — but never while user is typing elsewhere
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        if (isTypingInExternalField(e.target)) return;
        e.preventDefault();
        toggle();
      }
    });

    // ─── thread rendering ───────────────────────────────────
    function pushMsg(who, html, opts) {
      opts = opts || {};
      var div = document.createElement('div');
      div.className = 'rev-msg ' + who + (opts.editorial ? ' editorial' : '');
      var tag = (who === 'user') ? 'you' : 'rev.';
      div.innerHTML = '<span class="rev-tag">' + tag + '</span>' + html;
      thread.appendChild(div);
      thread.scrollTop = thread.scrollHeight;
      return div;
    }

    function pushTyping() {
      var div = document.createElement('div');
      div.className = 'rev-msg rev';
      div.innerHTML = '<span class="rev-tag">rev.</span><span class="rev-typing"><span></span><span></span><span></span></span>';
      thread.appendChild(div);
      thread.scrollTop = thread.scrollHeight;
      return div;
    }

    function pushSuggestions(items, onPick) {
      var wrap = document.createElement('div');
      wrap.className = 'rev-msg rev rev-suggest-row';
      var html = '<div class="rev-suggest">';
      items.forEach(function (s) {
        html += '<button type="button" data-q="' + s.replace(/"/g, '&quot;') + '">' + s + '</button>';
      });
      html += '</div>';
      wrap.innerHTML = html;
      thread.appendChild(wrap);
      thread.scrollTop = thread.scrollHeight;
      wrap.querySelectorAll('button').forEach(function (b) {
        b.addEventListener('click', function () { onPick(b.getAttribute('data-q')); });
      });
    }

    function renderResponse(parts) {
      // parts: array of strings or {suggest:[]}
      // each string becomes its own paragraph; first item carries the rev. tag.
      var first = true;
      parts.forEach(function (p, i) {
        if (typeof p === 'string') {
          var html = p;
          var editorial = /<em>/.test(p) && p.length < 90; // short italic = editorial
          if (first) {
            pushMsg('rev', html, { editorial: editorial });
            first = false;
          } else {
            // continuation paragraph (no tag)
            var div = document.createElement('div');
            div.className = 'rev-msg rev' + (editorial ? ' editorial' : '');
            div.style.marginTop = '-12px';
            div.innerHTML = html;
            thread.appendChild(div);
          }
        } else if (p && p.suggest) {
          pushSuggestions(p.suggest, function (q) {
            input.value = '';
            handleAsk(q);
          });
        }
      });
      thread.scrollTop = thread.scrollHeight;
    }

    // conversation history shared with the AI endpoint
    var convo = []; // [{role:'user'|'assistant', content:''}]
    var aiEnabled = null; // null=unknown, true/false after health check

    // markdown-link → <a> + paragraph splitting + safe escape
    function renderMarkdown(text) {
      var safe = escapeHTML(text);
      // [label](url)
      safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, function (_, label, url) {
        var safeUrl = url.replace(/"/g, '&quot;');
        return '<a href="' + safeUrl + '">' + label + '</a>';
      });
      // *italic* or _italic_ → <em>
      safe = safe.replace(/(?:^|[\s(])\*([^*\n]+)\*/g, function (m, t) {
        return m.charAt(0) === '*' ? '<em>' + t + '</em>' : m.charAt(0) + '<em>' + t + '</em>';
      });
      // already-emitted <em>…</em> from model survives because escapeHTML turned < into &lt;
      // re-allow <em> tags only:
      safe = safe.replace(/&lt;em&gt;([\s\S]*?)&lt;\/em&gt;/g, '<em>$1</em>');
      // paragraph-split on double newline
      var paras = safe.split(/\n\s*\n/);
      return paras.map(function (p) { return p.trim(); }).filter(Boolean);
    }

    function checkAI() {
      return fetch('/api/rev/health', { cache: 'no-store' })
        .then(function (r) { return r.json(); })
        .then(function (d) { aiEnabled = !!(d && d.ai_enabled); return aiEnabled; })
        .catch(function () { aiEnabled = false; return false; });
    }

    function askAI(message) {
      return fetch('/api/rev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          history: convo.slice(-10),
          page: location.pathname || '/'
        })
      }).then(function (r) {
        if (!r.ok) throw new Error('rev_http_' + r.status);
        return r.json();
      }).then(function (d) {
        if (!d || !d.reply) throw new Error('rev_empty');
        return d.reply;
      });
    }

    function renderAIReply(text) {
      var paras = renderMarkdown(text);
      var first = true;
      paras.forEach(function (p) {
        var editorial = /^<em>[\s\S]+<\/em>\.?$/.test(p) && p.length < 100;
        if (first) {
          pushMsg('rev', p, { editorial: editorial });
          first = false;
        } else {
          var div = document.createElement('div');
          div.className = 'rev-msg rev' + (editorial ? ' editorial' : '');
          div.style.marginTop = '-12px';
          div.innerHTML = p;
          thread.appendChild(div);
        }
      });
      thread.scrollTop = thread.scrollHeight;
    }

    function handleAsk(q) {
      if (!q || !q.trim()) return;
      var trimmed = q.trim();
      pushMsg('user', escapeHTML(trimmed));
      convo.push({ role: 'user', content: trimmed });
      var typing = pushTyping();
      var minDelay = 380; // calm pacing floor
      var t0 = Date.now();

      function fallback() {
        var parts = respond(trimmed);
        var elapsed = Date.now() - t0;
        var wait = Math.max(0, minDelay - elapsed);
        setTimeout(function () {
          typing.remove();
          renderResponse(parts || ['i\'ll route you.']);
          // capture canned text into convo for continuity
          var flat = (parts || []).filter(function (p) { return typeof p === 'string'; }).join(' ').replace(/<[^>]+>/g, '');
          if (flat) convo.push({ role: 'assistant', content: flat });
        }, wait);
      }

      if (aiEnabled === false) { fallback(); return; }

      askAI(trimmed).then(function (reply) {
        var elapsed = Date.now() - t0;
        var wait = Math.max(0, minDelay - elapsed);
        setTimeout(function () {
          typing.remove();
          renderAIReply(reply);
          convo.push({ role: 'assistant', content: reply });
        }, wait);
      }).catch(function () {
        // graceful degrade to canned routing
        aiEnabled = false;
        fallback();
      });
    }

    function escapeHTML(s) {
      return s.replace(/[&<>"']/g, function (c) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
      });
    }

    // initial greeting + seeded suggestions, contextual to current page
    function seedGreeting() {
      var path = (location.pathname || '/').toLowerCase();
      var line;
      var suggestions;
      if (path === '/' || path === '/index.html') {
        line = 'i\'m rev. — the intelligence layer beneath form.';
        suggestions = ['what is form.?', 'show me the ecosystem', 'where do i start?'];
      } else if (path.indexOf('/vision') === 0) {
        line = 'reading the vision. ask me anything about the philosophy.';
        suggestions = ['why this vision?', 'show me the ecosystem', 'start the conversation'];
      } else if (path.indexOf('/standards') === 0) {
        line = 'these are the operating standards. ask how they translate into work.';
        suggestions = ['what is form.?', 'where do i start?', 'show me the ecosystem'];
      } else if (path.indexOf('/founder') === 0) {
        line = 'this page is the founder\'s reflection. i can route you onward when ready.';
        suggestions = ['show me the ecosystem', 'start the conversation'];
      } else if (path.indexOf('/ecosystem') === 0) {
        line = 'nine entities. one signal. ask me about any of them.';
        suggestions = ['form. strategy', 'form. ai', 'continuum', 'where do i start?'];
      } else if (path.indexOf('/contact') === 0) {
        line = 'you\'re in the right place. i can clarify anything before you write.';
        suggestions = ['what is form.?', 'show me the ecosystem'];
      } else {
        line = 'i\'m rev. — operational intelligence. ask anything.';
        suggestions = ['what is form.?', 'show me the ecosystem', 'where do i start?'];
      }
      pushMsg('rev', line);
      pushSuggestions(suggestions, function (q) {
        input.value = '';
        handleAsk(q);
      });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value;
      input.value = '';
      handleAsk(q);
    });

    // background: detect whether AI endpoint is enabled
    checkAI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
