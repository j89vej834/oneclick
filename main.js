/* ────────────────────────────────────────────
   ONECLICK — main.js
   ──────────────────────────────────────────── */

// ── Tab title typewriter ──
(function titleTypewriter() {
  const frames = ['One Click.', 'Less Bloat.', 'More Performance.'];
  let fi = 0, ci = 0, deleting = false;

  const TYPING_SPEED = 150;
  const DELETE_SPEED = 80;
  const PAUSE = 800;

  function tick() {
    const target = frames[fi];

    if (!deleting) {
      ci++;
      document.title = target.slice(0, ci);
      if (ci === target.length) {
        deleting = true;
        setTimeout(tick, PAUSE);
        return;
      }
    } else {
      ci--;
      if (ci === 0) {
        deleting = false;
        fi = (fi + 1) % frames.length;
        setTimeout(tick, 300);
        return;
      }
      document.title = target.slice(0, ci);
    }

    setTimeout(tick, deleting ? DELETE_SPEED : TYPING_SPEED);
  }

  tick();
})();

// ── Cursor + Trail ──
const canvas = document.getElementById('trail');
const ctx = canvas.getContext('2d');
const cursorEl = document.getElementById('cursor');
let W, H;
function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
resize();
window.addEventListener('resize', resize);

const trail = [];
const MAX = 42;
let mx = -400, my = -400, cx = -400, cy = -400;
let speed = 0, lastMx = -400, lastMy = -400;
let lastMoveTime = Date.now();
let idleTimer = null;
let cursorHue = 260, targetHue = 260;
const HUES = [260, 195, 230, 280, 195];
let hueIdx = 0;

document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  cursorEl.classList.remove('idle');
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => cursorEl.classList.add('idle'), 2000);
  const dx = mx - lastMx, dy = my - lastMy;
  speed = Math.sqrt(dx * dx + dy * dy);
  lastMx = mx; lastMy = my;
  if (speed > 18) {
    hueIdx = (hueIdx + 1) % HUES.length;
    targetHue = HUES[hueIdx];
  }
  trail.push({ x: mx, y: my, life: 1.0, hue: cursorHue, size: Math.min(2.5 + speed * 0.07, 6) });
  if (trail.length > MAX) trail.shift();
});

function lerp(a, b, t) { return a + (b - a) * t; }

function render() {
  ctx.clearRect(0, 0, W, H);
  cursorHue = lerp(cursorHue, targetHue, 0.07);
  cx = lerp(cx, mx, 1.0);
  cy = lerp(cy, my, 1.0);

  for (let i = trail.length - 1; i >= 0; i--) {
    const p = trail[i];
    p.life -= 0.04;
    if (p.life <= 0) { trail.splice(i, 1); continue; }
    const ratio = i / Math.max(trail.length, 1);
    const h = lerp(195, cursorHue, 1 - ratio);
    const alpha = p.life * 0.45 * ratio;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${h},100%,65%,${alpha})`;
    ctx.fill();
  }

  cursorEl.style.left = cx + 'px';
  cursorEl.style.top = cy + 'px';
  const moving = speed > 0.5;
  cursorEl.style.width = cursorEl.style.height = (moving ? 18 : 14) + 'px';
  cursorEl.style.background = `hsla(${cursorHue},100%,68%,${moving ? 0.85 : 0.4})`;
  cursorEl.style.boxShadow = `0 0 ${6 + speed * 0.25}px hsla(${cursorHue},100%,65%,0.45)`;
  speed *= 0.9;

  requestAnimationFrame(render);
}
render();

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => { cursorEl.style.transform = 'translate(-50%,-50%) scale(1.7)'; });
  el.addEventListener('mouseleave', () => { cursorEl.style.transform = 'translate(-50%,-50%) scale(1)'; });
});

// ── Nav buttons scroll to #download / github instead of acting ──
document.getElementById('navDownloadBtn').addEventListener('click', () => {
  document.getElementById('download').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('navGithubBtn').addEventListener('click', () => {
  document.getElementById('download').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('heroDownloadBtn').addEventListener('click', () => {
  document.getElementById('download').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('heroGithubBtn').addEventListener('click', () => {
  document.getElementById('download').scrollIntoView({ behavior: 'smooth' });
});

// ── Real download button feedback ──
document.getElementById('realDownloadBtn').addEventListener('click', function () {
  const t = document.getElementById('dlText');
  t.textContent = 'Preparing...';
  setTimeout(() => t.textContent = 'Starting download', 700);
  setTimeout(() => t.textContent = 'Download', 3200);
});

// ── Tweaks grid — cursor spotlight + per-card glow ──
(function tweaksInteraction() {
  const grid = document.getElementById('tweaksGrid');
  if (!grid) return;

  document.addEventListener('mousemove', e => {
    // Big grid spotlight (CSS custom property on the grid ::after)
    const rect = grid.getBoundingClientRect();
    const gx = e.clientX - rect.left;
    const gy = e.clientY - rect.top;
    grid.style.setProperty('--gx', gx + 'px');
    grid.style.setProperty('--gy', gy + 'px');

    // Per-card glow
    const cards = grid.querySelectorAll('.tweak-card');
    cards.forEach(card => {
      const cr = card.getBoundingClientRect();
      const mx = e.clientX - cr.left;
      const my = e.clientY - cr.top;
      card.style.setProperty('--mx', mx + 'px');
      card.style.setProperty('--my', my + 'px');
    });
  });

  // Tilt effect on each card
  const cards = grid.querySelectorAll('.tweak-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(600px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg) translateZ(6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

// ── Terminal lines stagger-in on scroll ──
(function terminalReveal() {
  const term = document.getElementById('terminalEl');
  if (!term) return;
  const lines = term.querySelectorAll('.term-line');
  let triggered = false;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !triggered) {
      triggered = true;
      lines.forEach((l, i) => {
        setTimeout(() => l.classList.add('visible'), i * 180);
      });
    }
  }, { threshold: 0.3 });

  observer.observe(term);
})();

// ── Generic scroll reveal ──
(function scrollReveal() {
  const els = document.querySelectorAll('.section-h, .section-sub, .section-tag, .steps, .req-grid, .dl-card');
  els.forEach(el => el.classList.add('reveal'));

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => io.observe(el));
})();

// ── Particle shimmer on tweaks section (floating dots) ──
(function heroParticles() {
  // lightweight ambient particles in the hero
  const hero = document.querySelector('.hero');
  if (!hero) return;

  for (let i = 0; i < 18; i++) {
    const dot = document.createElement('div');
    const size = Math.random() * 3 + 1;
    const x = Math.random() * 100;
    const delay = Math.random() * 8;
    const dur = 6 + Math.random() * 8;
    const hue = Math.random() > 0.5 ? 260 : 195;
    dot.style.cssText = `
      position:absolute;border-radius:50%;pointer-events:none;
      width:${size}px;height:${size}px;
      left:${x}%;bottom:${Math.random() * 60}%;
      background:hsla(${hue},100%,70%,0.5);
      animation:floatUp ${dur}s ${delay}s ease-in infinite;
      z-index:0;
    `;
    hero.appendChild(dot);
  }

  if (!document.getElementById('particleStyle')) {
    const style = document.createElement('style');
    style.id = 'particleStyle';
    style.textContent = `
      @keyframes floatUp {
        0%{transform:translateY(0) scale(1);opacity:0}
        10%{opacity:0.6}
        90%{opacity:0.1}
        100%{transform:translateY(-120vh) scale(0.4);opacity:0}
      }
    `;
    document.head.appendChild(style);
  }
})();