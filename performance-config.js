window.PERF_CONFIG = {

  DEBUG_PERF: false,

  TARGET_FRAME_MS:      16.67,
  SOFT_FLOOR_FRAME_MS:  20,
  MAX_JS_PER_FRAME_MS:  8,

  MAX_NODES:                130,
  CONN_RADIUS:              160,
  SPEED_MIN:                0.08,
  SPEED_MAX:                0.22,
  SPEED_CAP:                0.38,
  MAX_SIGNAL_DEPTH:         6,
  MAX_ACTIVE_SIGNALS:       3,
  SIGNAL_MIN_INTERVAL_MS:   4800,
  SIGNAL_CHECK_INTERVAL_MS: 200,
  MAX_ENV_PULSES:           12,

  MAX_COMPOSITOR_LAYERS:  8,
  MAX_BACKDROP_BLUR_PX:   12,
  MAX_TEXTURE_MB:         64,

  MAX_PAGE_WEIGHT_KB: 200,
  MAX_AVIF_KB:        150,
  MAX_SVG_KB:         40,
  FONT_BUDGET_KB:     80,

  /* ── DEGRADATION THRESHOLDS (mirror tokens/rendering-hierarchy.css) ──
     JS-side source of truth for tier degradation values.
     perf-observer.js reads the CSS custom properties at DOMContentLoaded
     and reconciles these values if the stylesheet overrides them.

     Degradation order enforced by perf-observer.js:
       Tier-4 first → Tier-0 → Tier-1
     ──────────────────────────────────────────────────────────────────── */
  PARTICLE_FRACTION_REDUCED:        0.35,  /* --tier-bg-degrade-particle-min  */
  GRAIN_OPACITY_REDUCED:            0.012, /* --opacity-grain-reduced          */
  MAX_NODES_REDUCED:                46,    /* ceil(MAX_NODES * 0.35)           */
  SIGNAL_CHECK_INTERVAL_REDUCED:    500,   /* signal interval at reduced (ms)  */

  DOMAIN_DENSITY: {
    Intelligence: 1.00,
    Execution:    1.00,
    Creativity:   0.90,
    Experience:   0.85,
    Ministry:     0.80,
    Humanity:     0.80,
  },

  DOMAIN_FILTER_TIER: {
    Intelligence: 2,
    Execution:    2,
    Creativity:   1,
    Experience:   1,
    Ministry:     1,
    Humanity:     1,
  },
};
