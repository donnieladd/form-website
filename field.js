/* env-field — slow drifting particle layer.
   pure canvas, no external deps. respects reduced motion.
   density auto-scales by viewport width. */
(function () {
  if (window.__envFieldInit) return;
  window.__envFieldInit = true;

  function init() {
    var canvas = document.querySelector('.env-field-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0;
    var particles = [];
    var raf = null;
    var t = 0;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // density modifier from body attribute
    var density = (document.body && document.body.getAttribute('data-field-density')) || 'open';
    var densityMul = {
      open: 1.0,
      concentrated: 0.65,
      structured: 0.5,
      intimate: 0.7,
      expanded: 1.25,
      calm: 0.55
    }[density] || 1.0;

    function size() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seed() {
      particles = [];
      var base = W < 720 ? 55 : (W < 1200 ? 110 : 170);
      var count = Math.round(base * densityMul);
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.2 + 0.3,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.07,
          a: Math.random() * 0.45 + 0.18,
          phase: Math.random() * Math.PI * 2,
          green: Math.random() < 0.045
        });
      }
    }

    function frame() {
      t += 0.006;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = W + 10;
        else if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        else if (p.y > H + 10) p.y = -10;
        var pulse = (Math.sin(t * 1.6 + p.phase) * 0.3 + 0.7) * p.a;
        if (p.green) {
          ctx.fillStyle = 'rgba(57, 255, 20, ' + (pulse * 0.55).toFixed(3) + ')';
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(57, 255, 20, 0.4)';
        } else {
          ctx.fillStyle = 'rgba(255, 255, 255, ' + pulse.toFixed(3) + ')';
          ctx.shadowBlur = 0;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      raf = requestAnimationFrame(frame);
    }

    function staticPaint() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.fillStyle = p.green
          ? 'rgba(57, 255, 20, 0.4)'
          : 'rgba(255, 255, 255, ' + p.a.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    size();
    seed();

    if (reduced) {
      staticPaint();
      return;
    }

    frame();

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        size();
        seed();
      }, 200);
    });

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (raf) { cancelAnimationFrame(raf); raf = null; }
      } else {
        if (!raf) frame();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
