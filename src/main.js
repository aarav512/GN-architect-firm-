import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fine = window.matchMedia("(pointer: fine)").matches;

const materials = {
  concrete: "Board-formed. Warm grey. Left as the mould made it.",
  oak: "European oak. Fluted. Oiled, never glossed.",
  marble: "Statuario. Honed. Used once, and only where the hand rests.",
  steel: "Brushed steel. The line of the drawing, made solid.",
  travertine: "Vein-cut travertine. Honey, quiet, slow to age.",
};

function lenis() {
  if (reduce) return null;
  const scroll = new Lenis({ lerp: 0.08, smoothWheel: true, wheelMultiplier: 0.9 });
  scroll.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((time) => scroll.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return scroll;
}

function armDraw(selector) {
  document.querySelectorAll(selector).forEach((path) => {
    if (typeof path.getTotalLength !== "function") return;
    let length = 0;
    try {
      length = path.getTotalLength();
    } catch {
      return;
    }
    if (!length) return;
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = reduce ? "0" : `${length}`;
  });
}

function cursor() {
  if (!fine || reduce) return;
  document.body.classList.add("has-cursor");
  const root = document.querySelector("#cursor");
  const ring = root.querySelector(".cursor-ring");
  const x = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power3.out" });
  const y = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power3.out" });
  window.addEventListener("mousemove", (e) => {
    x(e.clientX);
    y(e.clientY);
  });
  document.querySelectorAll(".project").forEach((el) => {
    el.addEventListener("mouseenter", () => root.classList.add("is-view"));
    el.addEventListener("mouseleave", () => root.classList.remove("is-view"));
  });
}

function navigation(scroll) {
  const nav = document.querySelector("#nav");
  document.querySelectorAll("[data-nav]").forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 64px",
      end: "bottom 64px",
      onToggle: (self) => {
        if (!self.isActive) return;
        const mobileHero = window.innerWidth < 1024 && section.id === "hero";
        nav.classList.toggle("is-light", section.dataset.nav === "light" || mobileHero);
      },
    });
  });

  document.querySelectorAll("[data-scroll]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      e.preventDefault();
      closeMenu(scroll);
      if (scroll) scroll.scrollTo(href, { duration: 1.5 });
      else document.querySelector(href)?.scrollIntoView();
    });
  });

  const btn = document.querySelector("#menu-btn");
  const menu = document.querySelector("#menu");
  if (window.innerWidth < 1024) nav.classList.add("is-light");
  btn?.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    if (open) closeMenu(scroll);
    else {
      menu.classList.add("is-open");
      btn.setAttribute("aria-expanded", "true");
      btn.setAttribute("aria-label", "Close menu");
      nav.classList.remove("is-light");
      document.body.classList.add("overflow-hidden");
      scroll?.stop();
    }
  });
}

function closeMenu(scroll) {
  const menu = document.querySelector("#menu");
  const btn = document.querySelector("#menu-btn");
  menu?.classList.remove("is-open");
  btn?.setAttribute("aria-expanded", "false");
  btn?.setAttribute("aria-label", "Open menu");
  document.body.classList.remove("overflow-hidden");
  if (window.innerWidth < 1024 && window.scrollY < window.innerHeight * 0.7) {
    document.querySelector("#nav")?.classList.add("is-light");
  }
  scroll?.start();
}

function hero() {
  const frame = document.querySelector("#hero-frame");
  const photo = document.querySelector("#hero-photo");
  armDraw(".hero-line");
  if (!reduce) {
    gsap.to(".hero-line", {
      strokeDashoffset: 0,
      duration: 2.4,
      stagger: 0.12,
      ease: "power2.inOut",
      delay: 0.3,
    });
    gsap.from(".hero-line-mask > span", {
      yPercent: 110,
      duration: 1.35,
      stagger: 0.08,
      ease: "power3.out",
      delay: 0.15,
    });
    gsap.from(".hero-fade", {
      opacity: 0,
      y: 18,
      duration: 1.1,
      stagger: 0.08,
      ease: "power2.out",
      delay: 0.7,
    });
  }
  if (fine && frame && photo && !reduce) {
    frame.addEventListener("mousemove", (e) => {
      const rect = frame.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - 0.5;
      const dy = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(photo, { x: dx * -26, y: dy * -18, duration: 0.9, ease: "power2.out" });
    });
    frame.addEventListener("mouseleave", () => {
      gsap.to(photo, { x: 0, y: 0, duration: 1.1, ease: "power3.out" });
    });
  }
}

function drawing() {
  armDraw("#sheet .draw");
  const photo = document.querySelector("#sheet-photo");
  if (reduce) {
    if (photo) photo.style.opacity = "1";
    return;
  }
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1024px)", () => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#sheet",
        start: "top top",
        end: "+=170%",
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });
    tl.to("#sheet .draw", { strokeDashoffset: 0, stagger: 0.035, duration: 1, ease: "none" })
      .to("#sheet-photo", { opacity: 1, scale: 1, duration: 0.75, ease: "none" }, "-=0.2")
      .to("#sheet-lines", { opacity: 0.22, duration: 0.4, ease: "none" }, "<")
      .fromTo("#sheet-caption", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, ease: "none" }, "-=0.15");
  });
  mm.add("(max-width: 1023px)", () => {
    gsap.timeline({
      scrollTrigger: { trigger: "#sheet", start: "top 75%", end: "bottom 40%", scrub: 1 },
    })
      .to("#sheet .draw", { strokeDashoffset: 0, stagger: 0.02, duration: 1, ease: "none" })
      .to("#sheet-photo", { opacity: 1, scale: 1, duration: 0.7, ease: "none" }, "-=0.35")
      .to("#sheet-lines", { opacity: 0.3, duration: 0.4, ease: "none" }, "<");
  });
}

function work() {
  const index = document.querySelector("#work-count");
  const names = ["Nilaya House", "Court House", "Screen House", "Bay House", "Ridge House"];
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1024px)", () => {
    if (reduce) return;
    const track = document.querySelector("#work-track");
    const distance = () => track.scrollWidth - window.innerWidth;
    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: "#work",
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.min(names.length - 1, Math.round(self.progress * (names.length - 1)));
          if (index) index.textContent = `${String(i + 1).padStart(2, "0")}  /  05  —  ${names[i]}`;
        },
      },
    });
  });
}

function philosophy() {
  if (reduce) return;
  gsap.from("#rule", {
    scaleY: 0,
    transformOrigin: "top center",
    ease: "none",
    scrollTrigger: {
      trigger: "#studio",
      start: "top 72%",
      end: "bottom 60%",
      scrub: 1,
    },
  });
  gsap.utils.toArray("[data-rise]").forEach((el) => {
    gsap.from(el, {
      y: 40,
      opacity: 0,
      duration: 1.2,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 88%" },
    });
  });
}

function palette() {
  const buttons = document.querySelectorAll(".mat-btn");
  const shots = document.querySelectorAll(".mat-shot");
  const note = document.querySelector("#mat-note");
  const set = (key) => {
    buttons.forEach((btn) => {
      const on = btn.dataset.mat === key;
      btn.classList.toggle("is-on", on);
      btn.classList.toggle("text-ink", on);
      btn.classList.toggle("text-stone", !on);
    });
    shots.forEach((img) => {
      img.style.opacity = img.dataset.mat === key ? "1" : "0";
    });
    if (note && materials[key]) note.textContent = materials[key];
  };
  buttons.forEach((btn) => {
    btn.addEventListener("mouseenter", () => set(btn.dataset.mat));
    btn.addEventListener("focus", () => set(btn.dataset.mat));
    btn.addEventListener("click", () => set(btn.dataset.mat));
  });
}

function process() {
  armDraw("#process .draw");
  gsap.set("#spine", { scaleY: reduce ? 1 : 0, transformOrigin: "top center" });
  if (reduce) return;
  gsap.to("#spine", {
    scaleY: 1,
    ease: "none",
    scrollTrigger: {
      trigger: "#process",
      start: "top 60%",
      end: "bottom 70%",
      scrub: 1,
    },
  });
  gsap.utils.toArray("#process .stage").forEach((stage) => {
    gsap.to(stage.querySelectorAll(".draw"), {
      strokeDashoffset: 0,
      duration: 1.5,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: { trigger: stage, start: "top 78%" },
    });
  });
}

const scroll = lenis();
cursor();
navigation(scroll);
hero();
drawing();
work();
philosophy();
palette();
process();
ScrollTrigger.refresh();
