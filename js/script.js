document.addEventListener('DOMContentLoaded', () => {

  // ---- Header scroll ----
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 60);
  });

  // ---- Burger menu ----
  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    nav.classList.toggle('open');
  });
  nav.querySelectorAll('.nav__link').forEach(l => {
    l.addEventListener('click', () => {
      burger.classList.remove('open');
      nav.classList.remove('open');
    });
  });

  // ---- Hero Canvas: Lightning effect ----
  const canvas = document.getElementById('heroCanvas');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  let mouseX = -999, mouseY = -999;

  function resizeCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * w;
      this.y = Math.random() * h;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = -Math.random() * 1.5 - 0.5;
      this.alpha = Math.random() * 0.5 + 0.2;
    }
    update() {
      this.y += this.speedY;
      this.alpha -= 0.002;
      if (this.y < -10 || this.alpha <= 0) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 166, 35, ${this.alpha})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  let bolts = [];

  function createBolt(targetX, targetY) {
    const startX = Math.random() * w;
    const startY = 0;
    const segments = [];
    let x = startX, y = startY;
    const len = Math.abs(targetY - startY);
    const steps = Math.floor(len / 12) + 10;
    for (let i = 0; i < steps; i++) {
      const t = i / steps;
      const tx = startX + (targetX - startX) * t + (Math.random() - 0.5) * 50 * (1 - t);
      const ty = startY + (targetY - startY) * t;
      segments.push({ x: tx, y: ty });
    }
    segments.push({ x: targetX, y: targetY });
    return { segments, alpha: 1, life: 1 };
  }

  canvas.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  canvas.addEventListener('mouseleave', () => { mouseX = -999; mouseY = -999; });

  let boltTimer = 0;

  function drawCanvas() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach(p => { p.update(); p.draw(); });

    boltTimer--;
    if (boltTimer <= 0 && mouseX > 0 && mouseY > 0) {
      bolts.push(createBolt(mouseX, mouseY));
      boltTimer = 30 + Math.floor(Math.random() * 40);
    }
    if (Math.random() < 0.02 && mouseX < 0) {
      bolts.push(createBolt(Math.random() * w, Math.random() * h * 0.6 + h * 0.2));
    }

    bolts = bolts.filter(b => b.life > 0);
    bolts.forEach(b => {
      b.life -= 0.02;
      b.alpha = b.life;
      ctx.beginPath();
      ctx.moveTo(b.segments[0].x, b.segments[0].y);
      for (let i = 1; i < b.segments.length; i++) {
        ctx.lineTo(b.segments[i].x, b.segments[i].y);
      }
      ctx.strokeStyle = `rgba(245, 166, 35, ${b.alpha * 0.6})`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.strokeStyle = `rgba(255, 215, 0, ${b.alpha * 0.3})`;
      ctx.lineWidth = 6;
      ctx.stroke();
    });

    requestAnimationFrame(drawCanvas);
  }
  drawCanvas();

  // ---- Stats counter animation ----
  const stats = document.querySelectorAll('.stat__num');
  let countersStarted = false;

  function startCounters() {
    if (countersStarted) return;
    countersStarted = true;
    stats.forEach(el => {
      const target = parseInt(el.dataset.count);
      const duration = 2000;
      const start = performance.now();
      function update(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if (t < 1) requestAnimationFrame(update);
        else el.textContent = target.toLocaleString() + '+';
      }
      requestAnimationFrame(update);
    });
  }

  // ---- Scroll reveal ----
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        if (entry.target.closest('.services')) {
          const cards = entry.target.closest('.services').querySelectorAll('.service-card');
          cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('visible'), parseInt(card.dataset.delay) || i * 100);
          });
        }
        if (entry.target.classList.contains('hero__stats')) startCounters();
      }
    });
  }, { threshold: 0.2 });

  document.querySelectorAll('.hero__stats, .services .section__title').forEach(el => revealObserver.observe(el));

  // ---- Calculator ----
  const calcType = document.getElementById('calcType');
  const calcArea = document.getElementById('calcArea');
  const calcPoints = document.getElementById('calcPoints');
  const calcAreaValue = document.getElementById('calcAreaValue');
  const calcPointsValue = document.getElementById('calcPointsValue');
  const calcPrice = document.getElementById('calcPrice');
  const calcBtn = document.getElementById('calcBtn');

  const basePrices = [80, 100, 130, 160, 180, 220, 140];

  function updateCalc() {
    const type = parseInt(calcType.value);
    const area = parseInt(calcArea.value);
    const points = parseInt(calcPoints.value);
    const base = basePrices[type] || 100;
    let price = base * area + points * 60;
    if (document.getElementById('extraSmart').checked) price += 3000;
    if (document.getElementById('extraCCTV').checked) price += 2500;
    if (document.getElementById('extraInternet').checked) price += 1500;
    if (document.getElementById('extraGround').checked) price += 2000;
    price = Math.round(price / 1000) * 1000;
    animateNumber(calcPrice, price);
  }

  let currentAnim = null;
  function animateNumber(el, target) {
    if (currentAnim) cancelAnimationFrame(currentAnim);
    const start = parseInt(el.textContent.replace(/\s/g, '')) || 0;
    const duration = 500;
    const begin = performance.now();
    function tick(now) {
      const t = Math.min((now - begin) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(start + (target - start) * eased).toLocaleString();
      if (t < 1) currentAnim = requestAnimationFrame(tick);
    }
    currentAnim = requestAnimationFrame(tick);
  }

  calcArea.addEventListener('input', () => {
    calcAreaValue.textContent = calcArea.value;
    updateCalc();
  });
  calcPoints.addEventListener('input', () => {
    calcPointsValue.textContent = calcPoints.value;
    updateCalc();
  });
  calcBtn.addEventListener('click', updateCalc);
  document.querySelectorAll('#extraSmart, #extraCCTV, #extraInternet, #extraGround').forEach(el => {
    el.addEventListener('change', updateCalc);
  });
  calcType.addEventListener('change', updateCalc);
  updateCalc();

  // ---- Form ----
  const form = document.getElementById('orderForm');
  const modal = document.getElementById('successModal');
  const modalClose = modal.querySelector('.modal__close');
  const modalBtn = modal.querySelector('.modal__btn');

  form.addEventListener('submit', e => {
    e.preventDefault();
    const inputs = form.querySelectorAll('.form__input');
    const name = inputs[0]?.value || '—';
    const phone = inputs[1]?.value || '—';
    const workType = form.querySelector('.form__select')?.value || 'Не указан';
    const address = inputs[2]?.value || 'Не указан';
    const comment = form.querySelector('.form__textarea')?.value || '—';

    const msg = `⚡ Новая заявка с сайта!
━━━━━━━━━━━━━━
👤 Имя: ${name}
📞 Телефон: ${phone}
🔧 Тип работ: ${workType}
📍 Адрес: ${address}
💬 Комментарий: ${comment}`;

    const tgToken = '8820956121:AAEXVBGRaF268tarGSKVt4Xne41KFg5Q5zw';
    const tgChatId = '692888657';

    const url = `https://api.telegram.org/bot${tgToken}/sendMessage`;
    const data = new URLSearchParams({ chat_id: tgChatId, text: msg });
    navigator.sendBeacon(url, data);

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    form.reset();
  });

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
  modalClose.addEventListener('click', closeModal);
  modalBtn.addEventListener('click', closeModal);
  modal.querySelector('.modal__overlay').addEventListener('click', closeModal);

  // ---- Yandex Map ----
  function initMap() {
    const mapEl = document.getElementById('map');
    if (typeof ymaps === 'undefined' || !mapEl) return;
    ymaps.ready(() => {
      const map = new ymaps.Map(mapEl, {
        center: [46.6167, 29.9167],
        zoom: 14,
        controls: ['zoomControl', 'fullscreenControl']
      }, {
        yandexMapDisablePoiInteractivity: true
      });
      const placemark = new ymaps.Placemark([55.751244, 37.618423], {
        balloonContent: 'ЭлектроПро<br>г. Днестровск, ПМР'
      }, {
        preset: 'islands#icon',
        iconColor: '#f5a623'
      });
      map.geoObjects.add(placemark);
    });
  }

  // Try map init now, or when API loads
  if (typeof ymaps !== 'undefined') {
    initMap();
  } else {
    const mapInterval = setInterval(() => {
      if (typeof ymaps !== 'undefined') {
        initMap();
        clearInterval(mapInterval);
      }
    }, 200);
    setTimeout(() => clearInterval(mapInterval), 10000);
  }

});
