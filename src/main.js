// ═══════════════════════════════════════════════════════════════
//  R. SAI KRISHNA PORTFOLIO — main.js
//  Stack: GSAP 3 (ScrollTrigger + SplitText) + Lenis Smooth Scroll
// ═══════════════════════════════════════════════════════════════

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

// ═══════════════════════════════════
//  1. LENIS SMOOTH SCROLL
// ═══════════════════════════════════
const lenis = new Lenis({
  duration: 1.4,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  orientation: 'vertical',
  smoothWheel: true,
  wheelMultiplier: 0.9,
});

lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);

// ═══════════════════════════════════
//  2. SCROLL PROGRESS BAR
// ═══════════════════════════════════
const scrollLine = document.getElementById('scroll-line');
lenis.on('scroll', ({ progress }) => {
  scrollLine.style.width = `${progress * 100}%`;
});


// ═══════════════════════════════════
//  3. MAGNETIC BUTTONS
// ═══════════════════════════════════
document.querySelectorAll('.magnetic-btn').forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: 'power2.out' });
  });
  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
  });
});


// ═══════════════════════════════════
//  5. PRELOADER
// ═══════════════════════════════════
const counter = document.getElementById('counter');
const logoRing = document.getElementById('logo-ring');
const logoR = document.getElementById('logo-r');
const curtainTop = document.querySelector('.preloader__curtain.top');
const curtainBot = document.querySelector('.preloader__curtain.bottom');

document.body.classList.add('is-loading');

const preloaderTL = gsap.timeline({
  onComplete: initMainAnimations,
});

// SVG stroke draw-in
preloaderTL
  .to(logoRing, { strokeDashoffset: 0, duration: 1.2, ease: 'power3.inOut' })
  .to(logoR, { strokeDashoffset: 0, duration: 1.0, ease: 'power3.inOut' }, '-=0.6');

// Counter 0→100
let count = { val: 0 };
preloaderTL.to(count, {
  val: 100,
  duration: 1.8,
  ease: 'power2.inOut',
  onUpdate: () => { counter.textContent = Math.round(count.val); },
}, '-=1.0');

// Curtain wipe out
preloaderTL
  .to('#preloader .preloader__logo, #preloader .preloader__counter', {
    opacity: 0, duration: 0.4, ease: 'power2.in'
  }, '-=0.3')
  .to(curtainTop, { scaleY: 0, duration: 0.8, ease: 'power4.inOut' }, '-=0.1')
  .to(curtainBot, { scaleY: 0, duration: 0.8, ease: 'power4.inOut' }, '<')
  .set('#preloader', { display: 'none' });

// ═══════════════════════════════════
//  5. MAIN ANIMATIONS (after preloader)
// ═══════════════════════════════════
function initMainAnimations() {
  document.body.classList.remove('is-loading');

  heroAnimation();
  setupNav();
  phoneTiltEffect();   // ← tilt + float runs here, after preloader
  aboutAnimation();
  servicesAnimation();
  horizontalScrollWork();
  skillsAnimation();
  processAnimation();
  contactAnimation();
  textScrambleEffect();
}

// ═══════════════════════════════════
//  6. HERO ANIMATIONS
// ═══════════════════════════════════
function heroAnimation() {
  // Wrap each line in an overflow:hidden mask for the slide-up reveal
  // (no char split = no inline-block wrapping bug)
  document.querySelectorAll('.hero__name-line').forEach(line => {
    const text = line.innerHTML;
    line.innerHTML = `<span class="line-inner" style="display:block;">${text}</span>`;
  });

  const lines = document.querySelectorAll('.hero__name-line .line-inner');
  const heroTL = gsap.timeline({ delay: 0.1 });

  heroTL
    .fromTo(lines, {
      y: 60,
      opacity: 0,
    }, {
      y: 0,
      opacity: 1,
      stagger: 0.14,
      duration: 1.0,
      ease: 'power4.out',
    })
    .to('.hero__tag', {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'
    }, '-=0.5')
    .to('.hero__desc', {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'
    }, '-=0.45')
    .to('.hero__cta-row', {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out'
    }, '-=0.5');

  // Floaters parallax
  document.querySelectorAll('.hero__floater').forEach((el, i) => {
    gsap.to(el, {
      y: -(30 + i * 15),
      scrollTrigger: {
        trigger: '.section-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  });
}

// ═══════════════════════════════════
//  PHONE TILT + FLOAT (3D look-at-cursor)
// ═══════════════════════════════════
function phoneTiltEffect() {
  const phone = document.querySelector('.hero__phone');
  const section = document.querySelector('.section-hero');
  if (!phone || !section) return;

  // Enable pointer events on the visual wrapper
  const visual = document.querySelector('.hero__visual');
  if (visual) visual.style.pointerEvents = 'auto';

  // Set perspective so rotateX/Y render in 3D
  gsap.set(phone, { transformPerspective: 900, transformOrigin: 'center center' });

  // GSAP float loop — yoyo up/down
  const floatTL = gsap.timeline({ repeat: -1, yoyo: true, ease: 'sine.inOut' });
  floatTL.to(phone, { y: -22, rotateZ: 1.8, duration: 2.6 });

  // quickTo for per-frame snappy tracking
  const rX = gsap.quickTo(phone, 'rotateX', { duration: 0.45, ease: 'power2.out' });
  const rY = gsap.quickTo(phone, 'rotateY', { duration: 0.45, ease: 'power2.out' });
  const rZ = gsap.quickTo(phone, 'rotateZ', { duration: 0.45, ease: 'power2.out' });
  const gX = gsap.quickTo('.hero__phone-glow', 'x', { duration: 0.7, ease: 'power2.out' });
  const gY = gsap.quickTo('.hero__phone-glow', 'y', { duration: 0.7, ease: 'power2.out' });

  let active = false;
  let idleTimer;

  section.addEventListener('mousemove', (e) => {
    const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 → +1
    const ny = (e.clientY / window.innerHeight - 0.5) * 2;

    if (!active) { floatTL.pause(); active = true; }

    rX(-ny * 20);
    rY(nx * 26);
    rZ(nx * 2);
    gX(nx * 35);
    gY(ny * 25);

    clearTimeout(idleTimer);
    idleTimer = setTimeout(reset, 3500);
  });

  section.addEventListener('mouseleave', reset);

  function reset() {
    rX(0); rY(0); rZ(0); gX(0); gY(0);
    setTimeout(() => { if (!active) return; floatTL.resume(); active = false; }, 600);
  }
}

// ═══════════════════════════════════
//  7. TEXT SCRAMBLE EFFECT (Hero role)
// ═══════════════════════════════════
function textScrambleEffect() {
  const el = document.getElementById('scramble-text');
  if (!el) return;

  const words = ['App Developer', 'Android Builder', 'Mobile Creator', 'Kotlin Expert', 'App Developer'];
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let wordIndex = 0;
  let frame = 0;
  let frameReq;

  function scramble(newWord, onComplete) {
    const old = el.textContent;
    const len = Math.max(old.length, newWord.length);
    let iter = 0;
    clearInterval(frameReq);
    frameReq = setInterval(() => {
      el.textContent = newWord
        .split('')
        .map((char, idx) => {
          if (idx < iter) return newWord[idx];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      if (iter >= newWord.length) {
        clearInterval(frameReq);
        if (onComplete) onComplete();
      }
      iter += 0.4;
    }, 30);
  }

  // Cycle through words every 3s
  setInterval(() => {
    wordIndex = (wordIndex + 1) % words.length;
    scramble(words[wordIndex]);
  }, 3000);
}

// ═══════════════════════════════════
//  8. NAV BEHAVIOR
// ═══════════════════════════════════
function setupNav() {
  gsap.from('#nav', {
    y: -80, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2
  });

  // Shrink on scroll
  ScrollTrigger.create({
    start: 'top+=100 top',
    onEnter: () => gsap.to('#nav', { backdropFilter: 'blur(20px)', duration: 0.3 }),
    onLeaveBack: () => gsap.to('#nav', { backdropFilter: 'blur(0px)', duration: 0.3 }),
  });
}

// ═══════════════════════════════════
//  9. ABOUT SECTION
// ═══════════════════════════════════
function aboutAnimation() {
  // Image frame reveal
  gsap.from('.about__image-frame', {
    clipPath: 'inset(0 0 100% 0)',
    duration: 1.4,
    ease: 'power4.inOut',
    scrollTrigger: {
      trigger: '.about__image-frame',
      start: 'top 80%',
    },
  });

  // About heading — animate as whole element (has <br> + <em> so no char-split)
  gsap.from('.about__heading', {
    y: 50,
    opacity: 0,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: {
      trigger: '.about__heading',
      start: 'top 85%',
    },
  });

  // Paragraphs reveal line by line
  gsap.from('.reveal-line', {
    y: 24,
    opacity: 0,
    stagger: 0.2,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.about__body',
      start: 'top 80%',
    },
  });

  // Stats counters
  document.querySelectorAll('.stat-num').forEach((el) => {
    const target = parseInt(el.dataset.target);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.to({ val: 0 }, {
          val: target,
          duration: 2,
          ease: 'power2.out',
          onUpdate() { el.textContent = Math.round(this.targets()[0].val); },
        });
      },
      once: true,
    });
  });

  // Tool chips
  gsap.from('.tool-chip', {
    opacity: 0,
    y: 16,
    stagger: 0.08,
    duration: 0.6,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.about__tools',
      start: 'top 88%',
    },
  });
}

// ═══════════════════════════════════
//  10. SERVICES SECTION
// ═══════════════════════════════════
function servicesAnimation() {
  gsap.from('.service-card', {
    y: 60,
    opacity: 0,
    stagger: 0.15,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.services__grid',
      start: 'top 80%',
    },
  });
}

// ═══════════════════════════════════
//  11. HORIZONTAL SCROLL — PROJECTS
// ═══════════════════════════════════
function horizontalScrollWork() {
  const track = document.getElementById('work-track');
  if (!track) return;

  const cards = gsap.utils.toArray('.project-card');
  const totalWidth = (cards.length - 1) * window.innerWidth;

  // Tell lenis to stop at this section — let GSAP handle horizontal
  gsap.to(track, {
    x: () => -totalWidth,
    ease: 'none',
    scrollTrigger: {
      trigger: '.work__track-wrapper',
      pin: true,
      scrub: 1,
      start: 'top top',
      end: () => `+=${totalWidth}`,
      snap: {
        snapTo: 1 / (cards.length - 1),
        duration: { min: 0.2, max: 0.6 },
        ease: 'power2.inOut',
      },
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        // Update progress hint
        const pct = Math.round(self.progress * 100);
        document.querySelector('.work__hint').textContent =
          `${pct < 5 ? '← Scroll to explore →' : `Project ${Math.round(self.progress * (cards.length - 0.5)) + 1} / ${cards.length}`}`;
      },
    },
  });

  // Animate each card's content as it enters
  cards.forEach((card, i) => {
    gsap.from(card.querySelector('.proj-title'), {
      xPercent: 20,
      opacity: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: card,
        containerAnimation: gsap.getById('work-scroll'),
        start: 'left 70%',
        toggleActions: 'play none none none',
      },
    });
  });
}

// ═══════════════════════════════════
//  12. SKILLS SECTION
// ═══════════════════════════════════
function skillsAnimation() {
  // Pause marquee on hover
  document.querySelectorAll('.skills__marquee').forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.querySelector('.marquee__inner').style.animationPlayState = 'paused';
    });
    el.addEventListener('mouseleave', () => {
      el.querySelector('.marquee__inner').style.animationPlayState = 'running';
    });
  });

  // Skill bars fill on scroll
  document.querySelectorAll('.skill-bar-fill').forEach(bar => {
    const targetWidth = bar.dataset.width + '%';
    ScrollTrigger.create({
      trigger: bar,
      start: 'top 85%',
      onEnter: () => { bar.style.width = targetWidth; },
      once: true,
    });
  });

  // Section heading
  gsap.from('.section-skills .section-heading', {
    y: 40,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.section-skills',
      start: 'top 80%',
    },
  });
}

// ═══════════════════════════════════
//  13. PROCESS SECTION
// ═══════════════════════════════════
function processAnimation() {
  gsap.from('.process-step', {
    y: 80,
    opacity: 0,
    stagger: 0.18,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '.process__steps',
      start: 'top 78%',
    },
  });

  // Big number parallax
  document.querySelectorAll('.process-step__bg-num').forEach((el, i) => {
    gsap.to(el, {
      y: -30,
      scrollTrigger: {
        trigger: el.closest('.process-step'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.2,
      },
    });
  });
}

// ═══════════════════════════════════
//  14. CONTACT SECTION
// ═══════════════════════════════════
function contactAnimation() {
  const heading = document.querySelector('.contact__heading');
  if (heading) {
    gsap.from(heading, {
      y: 60,
      opacity: 0,
      duration: 1.2,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: heading,
        start: 'top 85%',
      },
    });
  }

  gsap.from('.contact__sub', {
    y: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact__sub', start: 'top 88%' },
  });

  gsap.from('.contact__actions', {
    y: 30, opacity: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact__actions', start: 'top 88%' },
  });

  gsap.from('.contact__social', {
    y: 20, opacity: 0, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '.contact__social', start: 'top 90%' },
  });

  // BG text parallax
  gsap.to('.contact__bg-text', {
    y: -80,
    scrollTrigger: {
      trigger: '.section-contact',
      start: 'top bottom',
      end: 'bottom top',
      scrub: 2,
    },
  });

  // Email button magnetic already handled globally
}

// ═══════════════════════════════════
//  15. SECTION HEADINGS (generic scroll reveal)
// ═══════════════════════════════════
gsap.utils.toArray('.section-heading').forEach((el) => {
  if (el.closest('.section-hero')) return; // Skip hero (handled separately)
  gsap.from(el, {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
    },
  });
});

gsap.utils.toArray('.section-label').forEach((el) => {
  gsap.from(el, {
    x: -20,
    opacity: 0,
    duration: 0.7,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: el,
      start: 'top 88%',
    },
  });
});
