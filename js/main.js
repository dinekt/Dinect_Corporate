// Initialize Lucide icons
lucide.createIcons();

// Synapse network background (共通関数)
function initSynapseNetwork(canvasId, opts = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const count = opts.count || 80;
  const connectDist = opts.connectDist || 150;

  let w, h;
  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
    // リサイズ時にはみ出たパーティクルを補正
    for (const p of particles) {
      if (p.x > w) p.x = Math.random() * w;
      if (p.y > h) p.y = Math.random() * h;
    }
  }

  const particles = [];
  function init() {
    resize();
    particles.length = 0;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
      });
    }
  }
  init();
  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectDist) {
          const alpha = (1 - dist / connectDist) * 0.15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(59,130,246,${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
      grad.addColorStop(0, 'rgba(59,130,246,0.15)');
      grad.addColorStop(1, 'rgba(59,130,246,0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59,130,246,0.5)';
      ctx.fill();
    }

    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }

    requestAnimationFrame(draw);
  }

  draw();
}

initSynapseNetwork('hero-network', { count: 80, connectDist: 150 });
initSynapseNetwork('contact-network', { count: 50, connectDist: 130 });

// Header scroll effect
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 60);
});

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => observer.observe(el));

// Mobile menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  });
});

// Interactive network animation
(function() {
  const svg = document.getElementById('about-network');
  const linesGroup = document.getElementById('net-lines');
  const nodesGroup = document.getElementById('net-nodes');
  const pulses = svg.querySelectorAll('.net-pulse');
  const ns = 'http://www.w3.org/2000/svg';

  // ロゴ風ノード配置: 楕円内にシナプス構造
  // viewBox: 400x300, 中心: (200, 150)
  const cx = 200, cy = 150;
  const rx = 100, ry = 120; // 楕円の半径（縦長）
  const innerR = 45;        // 内周の半径

  // 8方向の角度 (上から時計回り)
  const angles = [0, 1, 2, 3, 4, 5, 6, 7].map(i => (i * Math.PI * 2) / 8 - Math.PI / 2);

  const baseNodes = [
    // [0] 中心ノード
    { x: cx, y: cy, r: 7, fill: '#2563eb', isCenter: true },
  ];

  // [1-8] 内周ノード（8方向、中心から innerR の距離）
  angles.forEach(a => {
    baseNodes.push({
      x: cx + Math.cos(a) * innerR,
      y: cy + Math.sin(a) * innerR,
      r: 3, fill: 'rgba(59,130,246,0.55)',
    });
  });

  // [9-16] 外周ノード（8方向、楕円上）
  angles.forEach(a => {
    baseNodes.push({
      x: cx + Math.cos(a) * rx,
      y: cy + Math.sin(a) * ry,
      r: 3.5, fill: 'rgba(59,130,246,0.45)',
    });
  });

  // [17-24] 楕円上の中間ノード（内周と外周の間、45度ずらし）
  const midAngles = angles.map(a => a + Math.PI / 8);
  midAngles.forEach(a => {
    const mr = 0.7;
    baseNodes.push({
      x: cx + Math.cos(a) * rx * mr,
      y: cy + Math.sin(a) * ry * mr,
      r: 2.5, fill: 'rgba(59,130,246,0.35)',
    });
  });

  const connections = [];
  // 中心 → 内周8本
  for (let i = 1; i <= 8; i++) connections.push([0, i]);
  // 内周 → 外周（同方向）8本
  for (let i = 0; i < 8; i++) connections.push([1 + i, 9 + i]);
  // 内周リング（隣接同士）
  for (let i = 0; i < 8; i++) connections.push([1 + i, 1 + (i + 1) % 8]);
  // 外周リング（隣接同士）
  for (let i = 0; i < 8; i++) connections.push([9 + i, 9 + (i + 1) % 8]);
  // 中間ノード → 隣接する内周2つ
  for (let i = 0; i < 8; i++) {
    connections.push([17 + i, 1 + i]);
    connections.push([17 + i, 1 + (i + 1) % 8]);
  }
  // 中間ノード → 隣接する外周2つ
  for (let i = 0; i < 8; i++) {
    connections.push([17 + i, 9 + i]);
    connections.push([17 + i, 9 + (i + 1) % 8]);
  }

  // 現在の位置（アニメーション用）
  const nodes = baseNodes.map(n => ({ ...n, cx: n.x, cy: n.y }));
  let mouse = { x: 200, y: 150 }; // SVG座標系でのマウス位置

  // SVG要素を生成
  const lineEls = connections.map(() => {
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('stroke', 'rgba(59,130,246,0.2)');
    line.setAttribute('stroke-width', '1');
    linesGroup.appendChild(line);
    return line;
  });

  const nodeEls = nodes.map(n => {
    const g = document.createElementNS(ns, 'g');

    // グロー（中心ノードと、マウスに近いノード用）
    const glow = document.createElementNS(ns, 'circle');
    glow.setAttribute('r', n.r * 2.5);
    glow.setAttribute('fill', n.isCenter ? 'rgba(37,99,235,0.15)' : 'rgba(59,130,246,0.08)');
    g.appendChild(glow);

    // 本体
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('r', n.r);
    circle.setAttribute('fill', n.fill);
    g.appendChild(circle);

    nodesGroup.appendChild(g);
    return { g, glow, circle };
  });

  // マウス位置をSVG座標に変換
  const visual = document.querySelector('.about-visual');
  visual.addEventListener('mousemove', e => {
    const rect = svg.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 400;
    mouse.y = ((e.clientY - rect.top) / rect.height) * 300;
  });

  visual.addEventListener('mouseleave', () => {
    mouse.x = 200;
    mouse.y = 150;
  });

  // アニメーションループ
  function animate() {
    const influence = 30; // マウスの引力の強さ
    const maxDist = 180;  // この距離以内のノードが影響を受ける

    nodes.forEach((node, i) => {
      const base = baseNodes[i];
      let targetX = base.x;
      let targetY = base.y;

      if (!node.isCenter) {
        const dx = mouse.x - base.x;
        const dy = mouse.y - base.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const strength = (1 - dist / maxDist) * influence;
          targetX = base.x + (dx / dist) * strength;
          targetY = base.y + (dy / dist) * strength;
        }
      }

      // スムーズに補間
      node.cx += (targetX - node.cx) * 0.08;
      node.cy += (targetY - node.cy) * 0.08;

      // ノード要素を更新
      const el = nodeEls[i];
      el.g.setAttribute('transform', `translate(${node.cx},${node.cy})`);

      // マウスに近いノードのグローを強調
      if (!node.isCenter) {
        const dx = mouse.x - node.cx;
        const dy = mouse.y - node.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const glowOpacity = dist < maxDist ? 0.08 + (1 - dist / maxDist) * 0.2 : 0.08;
        const glowR = node.r * 2.5 + (dist < maxDist ? (1 - dist / maxDist) * 8 : 0);
        el.glow.setAttribute('fill', `rgba(59,130,246,${glowOpacity})`);
        el.glow.setAttribute('r', glowR);
      }
    });

    // 接続線を更新
    connections.forEach(([a, b], i) => {
      lineEls[i].setAttribute('x1', nodes[a].cx);
      lineEls[i].setAttribute('y1', nodes[a].cy);
      lineEls[i].setAttribute('x2', nodes[b].cx);
      lineEls[i].setAttribute('y2', nodes[b].cy);
    });

    // パルスリングを中心ノードに追従
    pulses.forEach(p => {
      p.setAttribute('cx', nodes[0].cx);
      p.setAttribute('cy', nodes[0].cy);
    });

    requestAnimationFrame(animate);
  }

  animate();
})();

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
