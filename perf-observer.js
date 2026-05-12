/* ============================================================
   FORM. PERFORMANCE OBSERVER
   Wires the rendering-hierarchy.css tier taxonomy into runtime
   enforcement. Reads CSS custom property token values and applies
   the degradation cascade when device signals indicate pressure.

   Degradation order (enforced here):
     Tier-4 first  — cursor ring lag loop halted; scan already
                     throttled via CSS [data-perf="reduced"]
     Tier-0 second — bg-breathe / bg-drift suspended; canvas
                     particle count already scaled by PERF_CONFIG
     Tier-1 third  — grain opacity reduced to token value

   prefers-reduced-motion triggers immediate Tier-4 + Tier-0
   collapse (canvas/parallax never started; this file suspends
   bg-breathe and snaps cursor ring).

   Depends on:
     performance-config.js  (PERF_CONFIG — must load first)
     performance-tier.js    (FORM_TIER, FORM_TIER_ONCHANGE)
   ============================================================ */

(function () {
  'use strict';

  var C = window.PERF_CONFIG;
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── READ CSS TOKENS AND RECONCILE PERF_CONFIG ──────────────
     Called at DOMContentLoaded so the rendering-hierarchy.css
     stylesheet is guaranteed to be parsed and applied.
     Updates C.PARTICLE_FRACTION_REDUCED, C.GRAIN_OPACITY_REDUCED,
     and C.MAX_NODES_REDUCED if the CSS token values differ from
     the JS defaults baked into performance-config.js.            */
  function _readTokens() {
    if (!C) return;
    try {
      var cs = getComputedStyle(document.documentElement);
      var pf = parseFloat(cs.getPropertyValue('--tier-bg-degrade-particle-min').trim());
      var go = parseFloat(cs.getPropertyValue('--opacity-grain-reduced').trim());
      if (isFinite(pf) && pf > 0) {
        C.PARTICLE_FRACTION_REDUCED = pf;
        C.MAX_NODES_REDUCED = Math.max(10, Math.ceil(C.MAX_NODES * pf));
      }
      if (isFinite(go) && go > 0) {
        C.GRAIN_OPACITY_REDUCED = go;
      }
    } catch (e) {}
  }

  /* ── TIER-4: CURSOR RING LAG HALT ───────────────────────────
     The lag rAF loop in each page checks dataset.perf and
     self-terminates at 'reduced'. This handler ensures the ring
     still tracks the cursor by snapping directly via mousemove
     — no lag computation, no rAF overhead.                       */
  var _snapInstalled = false;
  function _installRingSnap() {
    if (_snapInstalled) return;
    _snapInstalled = true;
    document.addEventListener('mousemove', function (e) {
      if ((document.documentElement.dataset.perf || 'full') !== 'reduced') return;
      var ring = document.getElementById('cring');
      if (ring) {
        ring.style.left = e.clientX + 'px';
        ring.style.top  = e.clientY + 'px';
      }
    });
  }

  /* ── TIER-0: SUSPEND BG-BREATHE / BG-DRIFT ─────────────────
     At reduced tier (or prefers-reduced-motion), the background
     breathing animation is suspended to free compositor budget.
     CSS [data-perf="reduced"] previously only slowed it;
     this enforces a full suspension via inline style.             */
  function _suspendBgBreath() {
    var bgEl = document.getElementById('bg') || document.getElementById('hero-bg');
    if (bgEl) {
      bgEl.style.animationName     = 'none';
      bgEl.style.animationDuration = '0s';
    }
  }

  /* ── TIER-1: GRAIN OPACITY FROM TOKEN ──────────────────────
     Apply the CSS token value (--opacity-grain-reduced) rather
     than hardcoded fallbacks scattered across page scripts.       */
  function _applyGrainOpacity() {
    var grainEl = document.getElementById('grain');
    if (!grainEl) return;
    var opacity = (C && C.GRAIN_OPACITY_REDUCED) ? C.GRAIN_OPACITY_REDUCED : 0.012;
    grainEl.style.opacity = String(opacity);
  }

  /* ── ENFORCE FULL DEGRADATION CASCADE ──────────────────────
     Called with the active tier string.
     Tier-4 → Tier-0 → Tier-1 order preserved.                   */
  function _enforceDegrade(tier) {
    var isReduced = (tier === 'reduced') || rm;
    var isMinimal = (tier === 'minimal');

    if (isMinimal) return; /* minimal handled by FORM_TIER_CANCEL + CSS */

    if (isReduced) {
      _installRingSnap();   /* Tier-4: cursor ring lag halted */
      _suspendBgBreath();   /* Tier-0: bg-breathe suspended   */
      _applyGrainOpacity(); /* Tier-1: grain opacity → token  */
    }
  }

  /* ── RESTORE EFFECTS ON TIER UPGRADE (minimal → reduced) ───
     If benchmark upgrades provisional-minimal to reduced, apply
     the reduced-tier degradation (not full effects).
     Also ensures dataset.tierLevel stays consistent with
     dataset.perf — performance-tier.js is authoritative but
     this rAF guard covers any late-binding CSS consumers.        */
  function _onTierChange(newTier, prevTier) {
    _enforceDegrade(newTier);
    requestAnimationFrame(function() {
      var lvl = newTier === 'minimal' ? '2' : newTier === 'reduced' ? '1' : '0';
      document.documentElement.dataset.tierLevel = lvl;
    });
  }

  /* ── DEBUG OVERLAY (dev builds only — gated on PERF_CONFIG.DEBUG_PERF) ──
     Injects a fixed-position panel showing the live tier name and numeric
     level. The panel refreshes whenever FORM_TIER_ONCHANGE fires so it
     stays in sync with post-benchmark tier updates.                        */
  var _debugPanel = null;

  function _updateDebugPanel() {
    if (!_debugPanel) return;
    var html = document.documentElement;
    var name  = html.dataset.perf      || 'full';
    var level = html.dataset.tierLevel || '0';
    _debugPanel.textContent = 'PERF \u00b7 ' + name + ' (tier ' + level + ')';
  }

  function _initDebugPanel() {
    if (!C || !C.DEBUG_PERF) return;
    var el = document.createElement('div');
    el.id = 'form-perf-debug';
    el.style.cssText = [
      'position:fixed',
      'bottom:12px',
      'right:14px',
      'z-index:99999',
      'font:11px/1 monospace',
      'color:#fff',
      'background:rgba(0,0,0,0.55)',
      'padding:5px 8px',
      'border-radius:4px',
      'pointer-events:none',
      'letter-spacing:0.04em',
    ].join(';');
    document.body.appendChild(el);
    _debugPanel = el;
    _updateDebugPanel();

    /* React to post-benchmark tier changes */
    if (window.FORM_TIER_ONCHANGE) {
      window.FORM_TIER_ONCHANGE.push(function() {
        requestAnimationFrame(_updateDebugPanel);
      });
    }
  }

  /* ── MAIN INIT ──────────────────────────────────────────────
     Runs at DOMContentLoaded so CSS tokens are readable and
     DOM elements (#grain, #bg, #hero-bg, #cring) exist.         */
  function _init() {
    _readTokens();

    var tier = window.FORM_TIER || document.documentElement.dataset.perf || 'full';

    /* prefers-reduced-motion: collapse Tier-4 + Tier-0 immediately */
    if (rm) {
      _installRingSnap();
      _suspendBgBreath();
      _initDebugPanel();
      return; /* grain remains visible per doctrine; no opacity change needed */
    }

    if (tier === 'reduced') {
      _enforceDegrade('reduced');
    }

    /* Hook future tier changes (post-benchmark classification) */
    if (window.FORM_TIER_ONCHANGE) {
      window.FORM_TIER_ONCHANGE.push(_onTierChange);
    }

    _initDebugPanel();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _init);
  } else {
    _init();
  }

})();
