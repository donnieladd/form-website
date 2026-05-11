/* ============================================================
   FORM. PERFORMANCE TIER DETECTION
   Runs synchronously in <head> before first paint.

   Sets document.documentElement.dataset.perf to:
     'full'    — high-end device, all effects active
     'reduced' — mid-range or prefers-reduced-motion, effects scaled
     'minimal' — low-end device or forced, effects stripped

   Also sets document.documentElement.dataset.tierLevel to a
   numeric degradation depth:
     '0' — full (no degradation)
     '1' — reduced (atmospheric effects scaled)
     '2' — minimal (effects stripped)

   Also exposes window.FORM_TIER (same string) for JS access.
   ============================================================ */

(function(){
  'use strict';

  var html = document.documentElement;
  var rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── TIER → NUMERIC LEVEL ── */
  function _tierToLevel(t) {
    return t === 'minimal' ? '2' : t === 'reduced' ? '1' : '0';
  }

  /* ── SYNCHRONOUS HARDWARE SCORE ── */
  var score = 0;

  var cores = navigator.hardwareConcurrency || 0;
  if(cores >= 8) score += 2;
  else if(cores >= 4) score += 1;

  var mem = navigator.deviceMemory || 0; // undefined on Firefox/Safari → 0
  if(mem >= 8) score += 2;
  else if(mem >= 4) score += 1;

  /* ── PROVISIONAL TIER (before rAF benchmark) ── */
  var tier;
  if(rm) {
    tier = 'reduced'; // prefers-reduced-motion → at least Reduced
  } else if(score >= 3) {
    tier = 'full';
  } else if(score >= 1) {
    tier = 'reduced';
  } else {
    tier = 'minimal';
  }

  html.dataset.perf = tier;
  html.dataset.tierLevel = _tierToLevel(tier);
  window.FORM_TIER = tier;

  /* ── CANCEL REGISTRY — page subsystems push teardown fns here ── */
  /* applyJSTierEffects drains this array ONLY on minimal transitions  */
  window.FORM_TIER_CANCEL = [];

  /* ── CHANGE REGISTRY — callbacks fired on any tier transition ── */
  /* Used by subsystems that need to reactivate on minimal→reduced upgrade */
  window.FORM_TIER_ONCHANGE = [];

  /* ── RAF BENCHMARK (~300ms) — benchmark-informed classification ── */
  /* Always run unless prefers-reduced-motion is set.
     Runs for ALL provisional tiers so benchmark is the true final arbiter:
     - Poor perf  → minimal (confirmed or forced down)
     - Mid perf   → reduced (allows minimal→reduced upgrade)
     - Good perf  → keep current, but allow minimal→reduced step-up       */
  if(!rm) {
    var samples = [];
    var last = performance.now();
    var rafId;

    function sample(now) {
      samples.push(now - last);
      last = now;
      if(samples.length < 18) { // ~300ms at 60fps
        rafId = requestAnimationFrame(sample);
      } else {
        cancelAnimationFrame(rafId);
        refineTier(samples);
      }
    }
    requestAnimationFrame(sample);
  }

  function refineTier(samples) {
    /* Drop first 3 samples (ramp-up noise) */
    var s = samples.slice(3);
    var avg = s.reduce(function(a,b){return a+b;},0) / s.length;
    /* Count frames over 22ms (below ~45fps) */
    var slow = s.filter(function(d){return d > 22;}).length;
    var slowFrac = slow / s.length;

    var current = html.dataset.perf;
    var next;

    if(avg > 28 || slowFrac > 0.5) {
      next = 'minimal'; // benchmark confirms slow — lock minimal
    } else if(avg > 20 || slowFrac > 0.25) {
      next = 'reduced'; // mid-range — allows minimal→reduced upgrade
    } else {
      /* Good benchmark: keep current tier but allow minimal→reduced step-up.
         Never upgrade reduced → full (benchmark variance alone insufficient). */
      next = (current === 'minimal') ? 'reduced' : current;
    }

    if(next !== current) {
      html.dataset.perf = next;
      html.dataset.tierLevel = _tierToLevel(next);
      window.FORM_TIER = next;
      applyJSTierEffects(next, current);
    }
  }

  /* ── POST-BENCHMARK JS EFFECTS ── */
  /* Called only when tier changes after ~300ms benchmark.
     For MINIMAL: drains cancel registry (kills timers/intervals).
       CSS [data-perf="minimal"] handles visual hiding — no inline styles set
       here, ensuring CSS rules are the sole authority and can be reversed if
       tier later upgrades. rAF loops self-terminate via dataset.perf reads.
     For REDUCED (upgrade from minimal): does NOT drain cancel registry.
       Calls FORM_TIER_ONCHANGE callbacks so subsystems can reactivate.
     For any change: notifies FORM_TIER_ONCHANGE subscribers.             */
  function applyJSTierEffects(t, prev) {
    if(t === 'minimal') {
      /* Drain cancel registry — cancels hue-cycle timers, iFlick, canvas intervals.
         rAF loops (parallax, canvas draw, cursor ring) self-terminate on next frame
         by reading dataset.perf. CSS handles all visual hiding for minimal. */
      if(window.FORM_TIER_CANCEL) {
        var fns = window.FORM_TIER_CANCEL.slice();
        window.FORM_TIER_CANCEL = [];
        for(var i=0;i<fns.length;i++){try{fns[i]();}catch(e){}}
      }
      /* Remove grain DOM node (CSS also hides it, but remove avoids overlay cost) */
      var grain = document.getElementById('grain');
      if(grain && grain.parentNode) grain.parentNode.removeChild(grain);
      /* NOTE: No inline cursor/cdot/cring style changes — CSS [data-perf="minimal"]
         selectors handle display:none and cursor:auto. This allows clean reversal
         if a subsequent upgrade (minimal→reduced) is applied. */
    } else if(t === 'reduced') {
      /* Do NOT drain cancel registry — timer/loop subsystems that were running
         at full tier remain active and self-adapt (they read dataset.perf live). */
      /* perf-observer.js applies grain opacity from the CSS token value;
         this fallback fires only during the ~300ms benchmark window before
         perf-observer DOMContentLoaded runs. */
      var grain2 = document.getElementById('grain');
      var _grainOp = (window.PERF_CONFIG && window.PERF_CONFIG.GRAIN_OPACITY_REDUCED) ? window.PERF_CONFIG.GRAIN_OPACITY_REDUCED : 0.012;
      if(grain2) grain2.style.opacity = String(_grainOp);
    }
    /* Notify all registered upgrade/change handlers so subsystems that were
       skipped at provisional-minimal init can reactivate (cursor ring,
       hue cycle, canvas draw loop, signal interval). */
    if(window.FORM_TIER_ONCHANGE) {
      var cbs = window.FORM_TIER_ONCHANGE.slice();
      for(var j=0;j<cbs.length;j++){try{cbs[j](t, prev||null);}catch(e){}}
    }
  }

})();
