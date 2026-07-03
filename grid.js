(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'grid-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    zIndex: '0',
    pointerEvents: 'none',
  });
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  const CELL = 60;
  const BASE_ALPHA = 0.06;
  const PULSE_ALPHA = 0.55;
  const MOUSE_RADIUS = 180;
  const WAVE_SPEED = 0.0008;

  let W, H, cols, rows;
  let mouse = { x: -9999, y: -9999 };
  let t = 0;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    cols = Math.ceil(W / CELL) + 1;
    rows = Math.ceil(H / CELL) + 1;
  }

  window.addEventListener('resize', resize);
  resize();

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  // Touch support
  window.addEventListener('touchmove', e => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
  }, { passive: true });

  function easeOut(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  function draw(ts) {
    t = ts * WAVE_SPEED;
    ctx.clearRect(0, 0, W, H);

    const cx = W / 2;
    const cy = H / 2;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * CELL;
        const y = r * CELL;

        // Distance from center for ambient wave
        const dx = x - cx;
        const dy = y - cy;
        const distCenter = Math.sqrt(dx * dx + dy * dy);
        const maxDist = Math.sqrt(cx * cx + cy * cy);
        const normDist = distCenter / maxDist;

        // Ripple wave from center
        const wave = Math.sin(normDist * 8 - t * 6) * 0.5 + 0.5;
        const centerFade = Math.max(0, 1 - normDist * 1.2);
        const ambientAlpha = BASE_ALPHA + wave * 0.08 * centerFade;

        // Mouse proximity glow
        const mdx = x - mouse.x;
        const mdy = y - mouse.y;
        const mouseDist = Math.sqrt(mdx * mdx + mdy * mdy);
        const mouseInfluence = Math.max(0, 1 - mouseDist / MOUSE_RADIUS);
        const mouseAlpha = easeOut(mouseInfluence) * PULSE_ALPHA;

        const alpha = Math.min(1, ambientAlpha + mouseAlpha);

        // Dot at intersection
        const dotRadius = 1 + mouseInfluence * 2.5;
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);

        if (mouseInfluence > 0.01) {
          // Blue glow near mouse
          ctx.fillStyle = `rgba(39,154,241,${alpha})`;
        } else {
          ctx.fillStyle = `rgba(247,247,255,${alpha})`;
        }
        ctx.fill();
      }
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
})();
