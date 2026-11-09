/* Zero Um CT Americana — HGS Dev */
(() => {
  const doc = document.documentElement;
  doc.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasG = typeof window.gsap !== 'undefined';
  const WA = '5519996209541';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- relógio de Americana ---------- */
  const fmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Sao_Paulo' });
  const hourNow = () => +new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo' }).format(new Date()) % 24;
  const tick = () => $$('[data-clock]').forEach(el => (el.textContent = fmt.format(new Date())));
  tick(); setInterval(tick, 20000);

  /* ---------- seletor de horário (a coisa viva) ---------- */
  const range = $('#hora');
  const notes = [
    [0, 5, 'Madrugada: para quem sai do turno ou treina antes de todo mundo.'],
    [5, 12, 'Manhã: café incluso na recepção antes do treino.'],
    [12, 18, 'Tarde: tudo 100% climatizado, com ar-condicionado.'],
    [18, 24, 'Noite: saiu do trabalho? Treine sem pressa, ninguém vai apagar a luz.']
  ];
  const paint = h => {
    $('[data-dial-time]').textContent = String(h).padStart(2, '0') + ':00';
    $('[data-dial-note]').textContent = notes.find(n => h >= n[0] && h < n[1])[2];
    range.style.setProperty('--p', (h / 23) * 100 + '%');
  };
  if (range) {
    range.value = hourNow();
    paint(+range.value);
    range.addEventListener('input', () => {
      paint(+range.value);
      if (hasG && !reduce) gsap.fromTo('.dial-state', { scale: .92 }, { scale: 1, duration: .35, ease: 'back.out(3)' });
    });
  }

  /* ---------- menu ---------- */
  const mBtn = $('.menu-btn'), menu = $('#menu');
  mBtn.addEventListener('click', () => {
    const open = mBtn.getAttribute('aria-expanded') === 'true';
    mBtn.setAttribute('aria-expanded', String(!open));
    menu.hidden = open;
  });
  $$('#menu a').forEach(a => a.addEventListener('click', () => { menu.hidden = true; mBtn.setAttribute('aria-expanded', 'false'); }));

  /* barra some ao descer, volta ao subir */
  const bar = $('.bar'); let lastY = 0;
  addEventListener('scroll', () => {
    const y = scrollY;
    bar.classList.toggle('is-hidden', y > 400 && y > lastY && menu.hidden);
    lastY = y;
  }, { passive: true });

  /* link ativo */
  const navLinks = $$('.bar-nav a');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle('is-here', a.hash === '#' + e.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => io.observe(s));

  /* ---------- estrutura: índice com prévia ---------- */
  const rows = $$('.row'), frameImgs = $$('.index-frame img');
  const show = key => {
    rows.forEach(r => r.classList.toggle('is-on', r.dataset.img === key));
    frameImgs.forEach(i => i.classList.toggle('is-on', i.dataset.key === key));
  };
  const fine = matchMedia('(hover: hover) and (min-width: 1081px)');
  rows.forEach(r => {
    r.addEventListener('pointerenter', () => fine.matches && show(r.dataset.img));
    r.addEventListener('focus', () => show(r.dataset.img));
    r.addEventListener('click', () => show(r.dataset.img));
  });

  /* ---------- recovery: abas ---------- */
  const tabs = $$('.tabs [role=tab]');
  const plates = $$('[data-plate]'), copies = $$('[data-copy]');
  const plateVid = $('.plate video');
  tabs.forEach(t => t.addEventListener('click', () => {
    const k = t.dataset.tab;
    tabs.forEach(x => x.setAttribute('aria-selected', String(x === t)));
    plates.forEach(p => p.classList.toggle('is-on', p.dataset.plate === k));
    copies.forEach(c => { c.classList.toggle('is-on', c.dataset.copy === k); c.style.opacity = ''; c.style.transform = ''; });
    if (hasG && !reduce) gsap.fromTo('.tab-copy.is-on', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .4, ease: 'power3.out' });
  }));

  /* ---------- por dentro: um quadro que troca ---------- */
  const cyc = $$('.cycle-frame img'), cap = $('[data-cycle-cap]'); let ci = 0, timer;
  const go = n => {
    cyc[ci].classList.remove('is-on'); ci = (n + cyc.length) % cyc.length;
    cyc[ci].classList.add('is-on'); cap.textContent = cyc[ci].dataset.cap;
  };
  const auto = () => { clearInterval(timer); if (!reduce) timer = setInterval(() => go(ci + 1), 3000); };
  $('.cycle-frame').addEventListener('click', () => { go(ci + 1); auto(); });
  auto();

  /* ---------- vídeos só tocam quando aparecem ---------- */
  const vio = new IntersectionObserver(es => es.forEach(e => {
    const v = e.target;
    if (e.isIntersecting && !reduce) { if (v.preload === 'none') v.preload = 'auto'; v.play().catch(() => {}); }
    else v.pause();
  }), { threshold: .15 });
  $$('video').forEach(v => vio.observe(v));

  /* ---------- cupom → WhatsApp ---------- */
  $('.cupom').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const linhas = [`Olá! Meu nome é ${f.get('nome') || ''}.`, 'Quero começar a treinar na Zero Um CT.'];
    if (f.get('objetivo')) linhas.push(`Objetivo: ${f.get('objetivo')}.`);
    if (f.get('horario')) linhas.push(`Horário que prefiro: ${f.get('horario')}.`);
    if (f.get('plano')) linhas.push(`Como quero entrar: ${f.get('plano')}.`);
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(linhas.join('\n'))}`, '_blank', 'noopener');
  });

  /* ---------- sem GSAP ou com movimento reduzido: mostra tudo ---------- */
  const intro = $('.intro');
  if (!hasG || reduce) {
    intro.classList.add('is-gone');
    $$('[data-rise], .row').forEach(el => { el.style.opacity = 1; el.style.transform = 'none'; });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* trava de segurança: se a animação não rodar, a página aparece mesmo assim */
  setTimeout(() => {
    if (!intro.classList.contains('is-gone')) intro.classList.add('is-gone');
    $$('.hero [data-rise]').forEach(el => { if (getComputedStyle(el).opacity === '0') { el.style.opacity = 1; el.style.transform = 'none'; } });
  }, 3500);

  /* ---------- abertura: as luzes acendem ---------- */
  const lines = $$('.intro-led polyline');
  lines.forEach(l => { const len = l.getTotalLength(); l.style.strokeDasharray = len; l.style.strokeDashoffset = len; });
  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
  tl.to(lines, { strokeDashoffset: 0, duration: .6, stagger: .08, ease: 'power2.inOut' })
    .fromTo('.intro-mark span', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .4, stagger: .06 }, '-=.35')
    .fromTo('.intro-mark small', { opacity: 0 }, { opacity: 1, duration: .25 }, '-=.2')
    .to(lines, { opacity: .15, duration: .05, repeat: 3, yoyo: true }, '-=.25')
    .to(lines, { stroke: '#e3122d', duration: .15 }, '<')
    .to('.intro', { yPercent: -100, duration: .55, ease: 'power3.inOut' }, '+=.1')
    .add(() => intro.classList.add('is-gone'))
    .add(heroIn, '-=.45');

  /* ---------- entrada do hero ---------- */
  const bolt = $('.hero-bolt polyline');
  let blen = 0;
  try { blen = getComputedStyle(bolt.ownerSVGElement).display === 'none' ? 0 : bolt.getTotalLength(); } catch (e) { blen = 0; }
  if (blen) { bolt.style.strokeDasharray = blen; bolt.style.strokeDashoffset = blen; }
  function heroIn() {
    if (blen) gsap.to(bolt, { strokeDashoffset: 0, duration: 1.4, ease: 'power3.inOut' });
    gsap.to('.hero [data-rise]', { opacity: 1, y: 0, duration: .8, stagger: .08, ease: 'power3.out' });
    gsap.fromTo('.hero-media video', { scale: 1.12 }, { scale: 1, duration: 1.6, ease: 'power3.out' });
  }
  gsap.to('.hero-bolt', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-media .shape', { yPercent: -6, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- entradas por seção ---------- */
  /* IntersectionObserver: dispara mesmo com rolagem rápida ou layout mudando */
  let pending = $$('[data-rise], .row').filter(el => !el.closest('.hero'));
  const reveal = () => {
    if (!pending.length) return;
    const lim = innerHeight * 0.94; let n = 0;
    pending = pending.filter(el => {
      const r = el.getBoundingClientRect();
      if (r.top < lim && r.bottom > -innerHeight) {
        el.style.setProperty('--d', (n++ * 80) + 'ms');
        el.classList.add('is-in');
        return false;
      }
      return true;
    });
  };
  addEventListener('scroll', reveal, { passive: true });
  addEventListener('resize', reveal);
  setInterval(reveal, 300);
  reveal();
  gsap.from('.mark span', { scaleY: .2, transformOrigin: '50% 100%', duration: .9, stagger: .07, ease: 'power4.out', scrollTrigger: { trigger: '.rodape', start: 'top bottom', once: true } });
  gsap.from('.band polygon', { scaleY: 0, transformOrigin: 'top', duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.band', start: 'top 90%', once: true } });
  gsap.fromTo('.horarios-bg', { scale: 1.15 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.horarios', start: 'top bottom', end: 'bottom top', scrub: true } });

  /* ---------- números contando ---------- */
  $$('[data-count]').forEach(el => {
    const end = +el.dataset.count, mil = el.dataset.format === 'milhar';
    const o = { v: 0 };
    gsap.to(o, {
      v: end, duration: 1.6, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      onUpdate: () => { const n = Math.round(o.v); el.textContent = mil ? n.toLocaleString('pt-BR') : n; }
    });
  });
})();
