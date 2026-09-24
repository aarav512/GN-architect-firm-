import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger, Draggable);

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(pointer: fine)").matches;

const projects = [
  { name: "Nilaya House", place: "Chhatarpur, Delhi", year: "2024", cat: "Villa" },
  { name: "House of Courtyards", place: "Vasant Vihar", year: "2023", cat: "Residential" },
  { name: "The Stone Room", place: "Defence Colony", year: "2024", cat: "Interior" },
  { name: "Saffron Kitchen", place: "Greater Kailash", year: "2025", cat: "Interior" },
  { name: "North Court", place: "Gurugram", year: "2022", cat: "Commercial" },
];

const materials = {
  marble: {
    spec: "Statuario. Honed. 20mm.",
    note: "A cool ground for warm plaster. We use it where the hand will rest — stairs, a bath ledge, a single table.",
  },
  wood: {
    spec: "Walnut. Fluted. Oiled.",
    note: "Timber takes the rooms that should feel held. Fluting catches light without ornament.",
  },
  concrete: {
    spec: "Board-formed. Warm grey.",
    note: "Left honest, never raw for its own sake. A wall that remembers the mould.",
  },
  metal: {
    spec: "Bronze. Brushed. Unlacquered.",
    note: "Screens, pulls, a thin frame. Metal is the line in the drawing, made touchable.",
  },
};

function initLoader() {
  const loader = document.querySelector("#loader");
  if (!loader) return Promise.resolve();
  if (reduce) {
    loader.remove();
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const tl = gsap.timeline({
      onComplete: () => {
        gsap.to(loader, {
          yPercent: -100,
          duration: 0.9,
          ease: "power3.inOut",
          onComplete: () => {
            loader.remove();
            resolve();
          },
        });
      },
    });
    tl.to("#loader .loader-line span", { width: "100%", duration: 0.9, ease: "power2.inOut" });
  });
}

function initLenis() {
  if (reduce) return null;
  const lenis = new Lenis({
    lerp: 0.085,
    smoothWheel: true,
    wheelMultiplier: 0.9,
  });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function initCursor() {
  if (!finePointer || reduce) return;
  document.body.classList.add("has-cursor");
  const root = document.querySelector("#cursor");
  const dot = root.querySelector(".cursor-dot");
  const ring = root.querySelector(".cursor-ring");
  const xDot = gsap.quickTo(dot, "x", { duration: 0.18, ease: "power3.out" });
  const yDot = gsap.quickTo(dot, "y", { duration: 0.18, ease: "power3.out" });
  const xRing = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
  const yRing = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
  window.addEventListener("mousemove", (e) => {
    xDot(e.clientX);
    yDot(e.clientY);
    xRing(e.clientX);
    yRing(e.clientY);
  });
  const hoverables = "a, button, .map-pin, input, textarea, select, .quote-card";
  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverables)) {
      gsap.to(ring, { scale: 1.7, duration: 0.4, ease: "power3.out" });
    }
  });
  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverables)) {
      gsap.to(ring, { scale: 1, duration: 0.4, ease: "power3.out" });
    }
  });
}

function prepareDrawings(selector) {
  document.querySelectorAll(selector).forEach((path) => {
    if (typeof path.getTotalLength !== "function") return;
    let len = 0;
    try {
      len = path.getTotalLength();
    } catch {
      return;
    }
    if (!len) return;
    path.style.strokeDasharray = `${len}`;
    path.style.strokeDashoffset = reduce ? "0" : `${len}`;
  });
}

function initHero(lenis) {
  const visual = document.querySelector(".hero-visual");
  const img = document.querySelector("#hero-img");
  prepareDrawings(".hero-lines path, .hero-lines line, .hero-lines rect");

  if (!reduce) {
    gsap.to(".hero-lines path, .hero-lines line, .hero-lines rect", {
      strokeDashoffset: 0,
      duration: 2.2,
      stagger: 0.08,
      ease: "power2.out",
      delay: 0.2,
    });
    gsap.from(".hero-copy .line-inner", {
      yPercent: 110,
      duration: 1.3,
      stagger: 0.08,
      ease: "power3.out",
      delay: 0.15,
    });
    gsap.from(".hero-fade", {
      opacity: 0,
      y: 16,
      duration: 1,
      stagger: 0.08,
      delay: 0.7,
      ease: "power2.out",
    });
  }

  if (finePointer && visual && img && !reduce) {
    visual.addEventListener("mousemove", (e) => {
      const rect = visual.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(img, { x: x * -28, y: y * -20, duration: 0.8, ease: "power2.out" });
    });
    visual.addEventListener("mouseleave", () => {
      gsap.to(img, { x: 0, y: 0, duration: 1, ease: "power3.out" });
    });
  }

  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = link.getAttribute("href");
      if (!target || target === "#") return;
      e.preventDefault();
      closeMenu();
      lenis?.start();
      if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      else document.querySelector(target)?.scrollIntoView();
    });
  });
}

function initDrawing() {
  prepareDrawings("#drawing .draw");
  const photo = document.querySelector("#drawing-photo");
  if (reduce) {
    if (photo) photo.style.opacity = "1";
    return;
  }

  const mm = gsap.matchMedia();
  mm.add("(min-width: 1024px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#drawing",
        start: "top top",
        end: "+=180%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    tl.to("#drawing .draw", { strokeDashoffset: 0, stagger: 0.04, duration: 1, ease: "none" })
      .to("#drawing-photo", { opacity: 1, scale: 1, duration: 0.7, ease: "none" }, "-=0.25")
      .to("#drawing-sheet", { opacity: 0.28, duration: 0.45, ease: "none" }, "<")
      .fromTo("#drawing-caption", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.35, ease: "none" }, "-=0.2");
  });
  mm.add("(max-width: 1023px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#drawing",
        start: "top 70%",
        end: "bottom 40%",
        scrub: 1,
      },
    });
    tl.to("#drawing .draw", { strokeDashoffset: 0, stagger: 0.03, duration: 1, ease: "none" })
      .to("#drawing-photo", { opacity: 1, scale: 1, duration: 0.6, ease: "none" }, "-=0.3")
      .to("#drawing-sheet", { opacity: 0.35, duration: 0.4, ease: "none" }, "<");
  });
}

function initWork() {
  const indexEl = document.querySelector("#work-index");
  const mm = gsap.matchMedia();

  mm.add("(min-width: 1024px)", () => {
    if (reduce) return;
    const track = document.querySelector("#work-track");
    const distance = () => track.scrollWidth - window.innerWidth;
    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: "#work",
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.min(projects.length - 1, Math.round(self.progress * (projects.length - 1)));
          if (indexEl) {
            indexEl.textContent = `${String(i + 1).padStart(2, "0")}  —  ${String(projects.length).padStart(2, "0")}`;
          }
        },
      },
    });
    return () => tween.scrollTrigger?.kill();
  });

  if (window.innerWidth < 1024 && indexEl) {
    const panels = gsap.utils.toArray(".panel");
    panels.forEach((panel, i) => {
      ScrollTrigger.create({
        trigger: panel,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => {
          if (self.isActive) {
            indexEl.textContent = `${String(i + 1).padStart(2, "0")}  —  ${String(projects.length).padStart(2, "0")}`;
          }
        },
      });
    });
  }
}

function initReveals() {
  if (reduce) return;
  gsap.utils.toArray("[data-reveal]").forEach((el) => {
    gsap.from(el, {
      y: 36,
      opacity: 0,
      duration: 1.15,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start: "top 86%",
      },
    });
  });

  gsap.from("#about-line", {
    scaleY: 0,
    transformOrigin: "top",
    ease: "none",
    scrollTrigger: {
      trigger: "#studio",
      start: "top 70%",
      end: "bottom 55%",
      scrub: 1,
    },
  });
}

function initServices() {
  const items = document.querySelectorAll(".service");
  items.forEach((item) => {
    const btn = item.querySelector("button");
    const paths = item.querySelectorAll(".mini-draw");
    paths.forEach((path) => {
      const len = path.getTotalLength?.() || 0;
      path.style.strokeDasharray = `${len}`;
      path.style.strokeDashoffset = `${len}`;
    });
    btn.addEventListener("click", () => {
      const open = item.classList.contains("is-open");
      items.forEach((other) => {
        other.classList.remove("is-open");
        other.querySelector("button").setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        if (!reduce) {
          gsap.to(paths, { strokeDashoffset: 0, duration: 1.4, stagger: 0.06, ease: "power2.out" });
        } else {
          paths.forEach((p) => (p.style.strokeDashoffset = "0"));
        }
      }
    });
  });
}

function initProcess() {
  prepareDrawings("#process .draw");
  if (reduce) return;
  gsap.utils.toArray("#process .step").forEach((step) => {
    gsap.to(step.querySelectorAll(".draw"), {
      strokeDashoffset: 0,
      duration: 1.4,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: { trigger: step, start: "top 75%" },
    });
  });
}

function initMaterials() {
  const buttons = document.querySelectorAll("[data-material]");
  const shots = document.querySelectorAll(".material-shot");
  const spec = document.querySelector("#material-spec");
  const note = document.querySelector("#material-note");

  const setMaterial = (key) => {
    const data = materials[key];
    if (!data) return;
    buttons.forEach((btn) => {
      const on = btn.dataset.material === key;
      btn.classList.toggle("text-ink", on);
      btn.classList.toggle("text-stone", !on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    shots.forEach((img) => {
      img.style.opacity = img.dataset.key === key ? "1" : "0";
    });
    if (spec) spec.textContent = data.spec;
    if (note) note.textContent = data.note;
  };

  buttons.forEach((btn) => {
    const go = () => setMaterial(btn.dataset.material);
    btn.addEventListener("mouseenter", go);
    btn.addEventListener("focus", go);
    btn.addEventListener("click", go);
  });
}

function initStats() {
  const counters = [
    { el: "#stat-projects", to: 150, suffix: "+", decimals: 0 },
    { el: "#stat-rating", to: 4.8, suffix: "★", decimals: 1 },
  ];
  counters.forEach(({ el, to, suffix, decimals }) => {
    const node = document.querySelector(el);
    if (!node) return;
    if (reduce) {
      node.textContent = `${to.toFixed(decimals)}${suffix}`;
      return;
    }
    const state = { val: 0 };
    gsap.to(state, {
      val: to,
      duration: 1.8,
      ease: "power2.out",
      scrollTrigger: { trigger: "#stats", start: "top 75%" },
      onUpdate: () => {
        node.textContent = `${state.val.toFixed(decimals)}${suffix}`;
      },
    });
  });
}

function initQuotes() {
  const track = document.querySelector("#quote-track");
  const viewport = document.querySelector("#quote-viewport");
  if (!track || !viewport || reduce) return;
  Draggable.create(track, {
    type: "x",
    bounds: viewport,
    inertia: false,
    edgeResistance: 0.85,
    cursor: "grab",
    activeCursor: "grabbing",
  });
}

function initMap() {
  const pin = document.querySelector("#studio-pin");
  const card = document.querySelector("#address-card");
  const spots = document.querySelectorAll(".map-spot");
  if (!pin || !card) return;
  const pulse = () => {
    card.classList.add("border-bronze");
    window.setTimeout(() => card.classList.remove("border-bronze"), 700);
  };
  pin.addEventListener("mouseenter", pulse);
  pin.addEventListener("focus", pulse);
  pin.addEventListener("click", pulse);
  spots.forEach((spot) => {
    spot.addEventListener("mouseenter", () => {
      const name = document.querySelector("#map-hover");
      if (name) name.textContent = spot.dataset.place;
    });
  });
  const sheet = document.querySelector("#map-sheet");
  if (sheet && finePointer && !reduce) {
    sheet.addEventListener("mousemove", (e) => {
      const r = sheet.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      gsap.to("#map-drawing", { x: x * 12, y: y * 10, duration: 0.8, ease: "power2.out" });
    });
  }
}

function initForm() {
  const form = document.querySelector("#consult");
  if (!form) return;
  const success = document.querySelector("#form-success");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const message = String(data.get("message") || "").trim();
    let valid = true;
    form.querySelectorAll("[data-error]").forEach((n) => (n.textContent = ""));
    if (name.length < 2) {
      form.querySelector('[data-error="name"]').textContent = "Please tell us your name.";
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      form.querySelector('[data-error="email"]').textContent = "A working email is needed.";
      valid = false;
    }
    if (message.length < 8) {
      form.querySelector('[data-error="message"]').textContent = "A few words on the project help us prepare.";
      valid = false;
    }
    if (!valid) return;
    form.hidden = true;
    if (success) {
      success.hidden = false;
      success.querySelector("span").textContent = name.split(" ")[0];
    }
  });
}

function closeMenu() {
  const menu = document.querySelector("#menu");
  const btn = document.querySelector("#menu-btn");
  if (!menu || !btn) return;
  menu.classList.remove("is-open");
  btn.setAttribute("aria-expanded", "false");
  document.body.classList.remove("overflow-hidden");
}

function initMenu(lenis) {
  const menu = document.querySelector("#menu");
  const btn = document.querySelector("#menu-btn");
  if (!menu || !btn) return;
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    if (open) {
      closeMenu();
      lenis?.start();
    } else {
      menu.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      document.body.classList.add("overflow-hidden");
      lenis?.stop();
    }
  });
}

async function boot() {
  await initLoader();
  const lenis = initLenis();
  initCursor();
  initHero(lenis);
  initDrawing();
  initWork();
  initReveals();
  initServices();
  initProcess();
  initMaterials();
  initStats();
  initQuotes();
  initMap();
  initForm();
  initMenu(lenis);
  ScrollTrigger.refresh();
}

boot();
