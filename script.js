// ?? LENIS SMOOTH SCROLL ???????????????????????
const hasLenis = typeof Lenis !== "undefined";
const lenis = hasLenis
  ? new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: false,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })
  : null;

function raf(time) {
  if (lenis) lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

// ?? SCROLL OBSERVER ??????????????????????????
const sections = document.querySelectorAll(".section");
const progressBar = document.getElementById("progressBar");
const slideCounter = document.getElementById("slideCounter");
const TOTAL = sections.length;
let currentSlide = 0;
let isScrolling = false;

function onScroll() {
  const sy = window.scrollY;
  const docH = document.body.scrollHeight - window.innerHeight;
  const pct = docH > 0 ? (sy / docH) * 100 : 0;
  progressBar.style.width = pct + "%";
}

if (lenis) {
  lenis.on("scroll", onScroll);
} else {
  window.addEventListener("scroll", onScroll, { passive: true });
}

const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const sec = entry.target;
      if (entry.isIntersecting) {
        sec.classList.add("in-view");
        currentSlide = Array.from(sections).indexOf(sec);
        const num = sec.dataset.slide;
        slideCounter.textContent =
          num.padStart(2, "0") + " / " + String(TOTAL).padStart(2, "0");

        // Reveal children with stagger
        sec.querySelectorAll("[data-reveal]").forEach((el) => {
          const d = parseInt(el.dataset.d || 0);
          setTimeout(() => el.classList.add("on"), d);
        });

        // Timeline items
        sec.querySelectorAll(".tl-item").forEach((el, i) => {
          setTimeout(() => el.classList.add("on"), 160 + i * 110);
        });

        // Counters
        sec.querySelectorAll(".counter").forEach((el) => {
          if (el.dataset.done) return;
          el.dataset.done = "1";
          animateCounter(el);
        });

        // Bars
        sec.querySelectorAll(".bar-fill").forEach((el) => {
          if (el.dataset.animated) return;
          el.dataset.animated = "1";
          requestAnimationFrame(() => {
            el.style.width = (el.dataset.w || 0) + "%";
          });
        });
      }
    });
  },
  { threshold: 0.3 },
);

sections.forEach((s) => io.observe(s));

// ── COUNTER ──────────────────────────────────
function animateCounter(el) {
  const target = parseInt(el.dataset.t);
  const dur = 1600;
  const t0 = performance.now();
  function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    const e = 1 - Math.pow(1 - p, 4);
    el.textContent = Math.round(e * target).toLocaleString("fr-FR");
    if (p < 1) requestAnimationFrame(step);
    else el.textContent = target.toLocaleString("fr-FR");
  }
  requestAnimationFrame(step);
}

// ── FLIP CARDS ────────────────────────────────
document.querySelectorAll(".flip-card").forEach((c) => {
  c.addEventListener("click", () => c.classList.toggle("open"));
});

// ── KEYBOARD NAVIGATION ──────────────────────────────────
function goToSlide(index) {
  const all = document.querySelectorAll(".section");
  index = Math.max(0, Math.min(index, all.length - 1));
  if (isScrolling || index === currentSlide) return;
  currentSlide = index;
  isScrolling = true;

  window.clearTimeout(goToSlide.unlockTimer);
  goToSlide.unlockTimer = window.setTimeout(() => {
    isScrolling = false;
  }, 1400);

  if (lenis) {
    lenis.scrollTo(all[index], {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      onComplete: () => {
        window.clearTimeout(goToSlide.unlockTimer);
        isScrolling = false;
      },
    });
  } else {
    all[index].scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === " ") {
    e.preventDefault();
    goToSlide(currentSlide + 1);
  } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
    e.preventDefault();
    goToSlide(currentSlide - 1);
  }
});

window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (isScrolling) return;
    if (e.deltaY > 0) {
      goToSlide(currentSlide + 1);
    } else if (e.deltaY < 0) {
      goToSlide(currentSlide - 1);
    }
  },
  { passive: false, capture: true },
);

// ── EASTER EGG CONSOLE ───────────────────────────────────────
console.log(
  "%c[ OBJECTIF K2 — PROTOCOLE SCIENTIFIQUE ]%c\n🔬 Recherche & Développement : Eloi Brillon\n💻 Plateforme web réalisée par : DIGITALAB SOLUTION\n👉 Visitez l'agence : [https://digitalab.agency](https://digitalab.agency)\nTous droits réservés 2026.",
  "background: #ff003c; color: #ffffff; font-family: 'Share Tech Mono', monospace; font-size: 14px; font-weight: bold; padding: 4px 8px; border-radius: 3px;",
  "color: #efefef; font-family: 'Share Tech Mono', monospace; font-size: 12px; line-height: 1.8; font-weight: 500;"
);
